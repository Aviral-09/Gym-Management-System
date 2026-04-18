const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

/**
 * onboardNewGym
 * Moves sensitive provisioning logic from frontend to backend.
 * Validates brand names, prevents duplicate onboarding, and ensures schema integrity.
 */
exports.onboardNewGym = functions.https.onCall(async (data, context) => {
  // 1. Authentication Check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Login required to onboard."
    );
  }

  const { brandName, templateId, planId, billingCycle } = data;
  const uid = context.auth.uid;
  const email = context.auth.token.email;

  // 2. Structural Validation
  if (!brandName || brandName.length < 3) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Brand Name must be at least 3 characters long."
    );
  }

  if (!templateId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Template Selection is required."
    );
  }

  try {
    // 3. Prevent Duplicate Onboarding
    const userDocRef = db.collection("users").doc(uid);
    const userSnapshot = await userDocRef.get();

    if (userSnapshot.exists && userSnapshot.data().franchiseId) {
      console.warn(`User ${uid} already onboarded to ${userSnapshot.data().franchiseId}`);
      throw new functions.https.HttpsError(
        "already-exists",
        "This user is already associated with an existing gym franchise."
      );
    }

    const batch = db.batch();

    // 4. Generate Resource IDs & Slugs
    const franchiseRef = db.collection("franchises").doc();
    const branchRef = db.collection("branches").doc();
    const analyticsRef = franchiseRef.collection("analytics").doc("overview");
    
    const startDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(startDate.getDate() + 7); // 7 Day Trial

    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomSuffix}`;

    // 5. Hardened Schema Models
    const franchiseData = {
      id: franchiseRef.id,
      brandName: brandName,
      slug: slug,
      ownerId: uid,
      ownerEmail: email || "unknown",
      status: "active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        websiteTemplate: templateId,
        theme: "default",
        onboarded: true
      },
      subscription: {
        planId: planId || "Basic",
        status: "trial",
        trialStartDate: admin.firestore.FieldValue.serverTimestamp(),
        trialEndDate: admin.firestore.Timestamp.fromDate(trialEndDate),
        billingCycle: billingCycle || "monthly"
      }
    };

    const branchData = {
      id: branchRef.id,
      franchiseId: franchiseRef.id,
      name: `${brandName} (HQ)`,
      location: "Main Branch",
      isPrimary: true,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const analyticsData = {
        totalMembers: 0,
        activeMembers: 0,
        recentSignups: 0,
        revenue: 0,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    const userData = {
      uid: uid,
      email: email,
      displayName: brandName, // Default to brand name for UI
      franchiseId: franchiseRef.id,
      role: "OWNER",
      onboardingCompleted: true,
      onboardedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // 6. Atomic Write Operation
    console.log(`Committing batch for user ${uid}: Franchise ${franchiseRef.id}, Branch ${branchRef.id}`);
    
    batch.set(franchiseRef, franchiseData);
    batch.set(branchRef, branchData);
    batch.set(analyticsRef, analyticsData);
    batch.set(userDocRef, userData, { merge: true });

    await batch.commit();
    console.log("Atomic onboarding batch committed successfully.");

    return {
      success: true,
      franchiseId: franchiseRef.id,
      branchId: branchRef.id,
      slug: slug
    };

  } catch (error) {
    console.error("Critical Onboarding Failure:", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", `System failed to provision your gym: ${error.message}`);
  }
});

/**
 * onMemberCreated
 * Increments the total member count for a franchise in the analytics sub-collection.
 */
exports.updateFranchiseMetrics = functions.firestore
  .document("members/{memberId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const franchiseId = data.franchiseId;
    if (!franchiseId) return;

    const metricsRef = db.collection("franchises").doc(franchiseId).collection("analytics").doc("overview");
    
    return db.runTransaction(async (transaction) => {
      const metricsSnapshot = await transaction.get(metricsRef);
      const currentData = metricsSnapshot.exists ? metricsSnapshot.data() : { totalMembers: 0, activeMembers: 0, revenue: 0 };
      
      transaction.set(metricsRef, {
        totalMembers: (currentData.totalMembers || 0) + 1,
        activeMembers: (currentData.activeMembers || 0) + 1,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });
  });

/**
 * onMemberDeleted
 * Decrements the total member count.
 */
exports.decrementFranchiseMetrics = functions.firestore
  .document("members/{memberId}")
  .onDelete(async (snap, context) => {
    const data = snap.data();
    const franchiseId = data.franchiseId;
    if (!franchiseId) return;

    const metricsRef = db.collection("franchises").doc(franchiseId).collection("analytics").doc("overview");
    
    return db.runTransaction(async (transaction) => {
      const metricsSnapshot = await transaction.get(metricsRef);
      if (!metricsSnapshot.exists) return;
      
      const currentData = metricsSnapshot.data();
      transaction.update(metricsRef, {
        totalMembers: Math.max(0, (currentData.totalMembers || 0) - 1),
        activeMembers: Math.max(0, (currentData.activeMembers || 0) - 1),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    });
  });
