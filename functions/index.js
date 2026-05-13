const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: ["http://localhost:5173", true] });
const Razorpay = require("razorpay");
const crypto = require("crypto");

admin.initializeApp();

// Initialize Razorpay with test keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret',
});

const db = admin.firestore();

/**
 * onboardNewGym
 * Moves sensitive provisioning logic from frontend to backend.
 * Validates brand names, prevents duplicate onboarding, and ensures schema integrity.
 */
exports.onboardNewGym = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log("Function Hit - Onboarding New Gym");

    // 1. Authentication Check
    let uid = null;
    let email = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        uid = decodedToken.uid;
        email = decodedToken.email;
      } catch (e) {
        throw new Error("unauthenticated: Invalid token.");
      }
    } else {
      throw new Error("unauthenticated: Login required to onboard.");
    }

    // httpsCallable sends payload wrapped in 'data'
    const data = req.body.data || {};
    const { brandName, templateId, planId, billingCycle } = data;

    // 2. Structural Validation
    if (!brandName || brandName.length < 3) {
      throw new Error("invalid-argument: Brand Name must be at least 3 characters long.");
    }

    if (!templateId) {
      throw new Error("invalid-argument: Template Selection is required.");
    }

    // 3. Prevent Duplicate Onboarding
    const userDocRef = db.collection("users").doc(uid);
    const userSnapshot = await userDocRef.get();

    if (userSnapshot.exists && userSnapshot.data().franchiseId) {
      console.warn(`User ${uid} already onboarded to ${userSnapshot.data().franchiseId}`);
      throw new Error("already-exists: This user is already associated with an existing gym franchise.");
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
      displayName: brandName,
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

    // Return format compatible with httpsCallable
    return res.status(200).json({
      data: {
        success: true,
        franchiseId: franchiseRef.id,
        branchId: branchRef.id,
        slug: slug
      }
    });

  } catch (error) {
    console.error("Critical Onboarding Failure:", error);
    
    let code = "internal";
    let message = error.message;
    if (message.includes(":")) {
      const parts = message.split(":");
      code = parts[0];
      message = parts.slice(1).join(":").trim();
    }

    return res.status(500).json({
      error: {
        message: message,
        status: code.toUpperCase()
      }
    });
  }
  }); // End cors
});

/**
 * createRazorpayOrder
 * Creates a Razorpay order for subscription payment.
 */
exports.createRazorpayOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const data = req.body.data || {};
      const { amount, currency = "INR" } = data;

      if (!amount) {
        throw new Error("invalid-argument: Amount is required.");
      }

      const options = {
        amount: Math.round(amount * 100), // amount in paise
        currency: currency,
        receipt: `receipt_order_${Math.random().toString(36).substring(2, 15)}`,
      };

      const order = await razorpay.orders.create(options);

      return res.status(200).json({
        data: {
          success: true,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency
        }
      });
    } catch (error) {
      console.error("Create Order Failure:", error);
      return res.status(500).json({
        error: {
          message: error.message,
          status: "INTERNAL"
        }
      });
    }
  });
});

/**
 * verifyRazorpayPayment
 * Verifies the Razorpay payment signature.
 */
exports.verifyRazorpayPayment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const data = req.body.data || {};
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId } = data;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new Error("invalid-argument: Missing payment verification details.");
      }

      const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret';
      
      const generated_signature = crypto
        .createHmac("sha256", key_secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generated_signature !== razorpay_signature) {
        throw new Error("unauthenticated: Invalid signature.");
      }

      // Payment verified successfully!
      // Update user's payment status in Firestore if userId is provided
      if (userId) {
        await db.collection("users").doc(userId).update({
          paymentStatus: "paid",
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          planId: planId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return res.status(200).json({
        data: {
          success: true,
          message: "Payment verified successfully"
        }
      });
    } catch (error) {
      console.error("Verify Payment Failure:", error);
      return res.status(500).json({
        error: {
          message: error.message,
          status: "INTERNAL"
        }
      });
    }
  });
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
