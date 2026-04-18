import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// ⚠️ IMPORTANT: Replace this with your actual Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedTemplates = async () => {
    const templates = [
        {
            id: 'modern_alpha',
            name: 'Modern Athletics',
            templateType: 'modern',
            theme: {
                bg: 'bg-zinc-900',
                text: 'text-white',
                primary: 'bg-emerald-500',
                primaryText: 'text-emerald-400',
                secondaryBg: 'bg-zinc-800',
                dark: true
            }
        },
        {
            id: 'strength_forge',
            name: 'Iron Strength Forge',
            templateType: 'strength',
            theme: {
                bg: 'bg-slate-900',
                text: 'text-slate-100',
                primary: 'bg-orange-600',
                primaryText: 'text-orange-500',
                secondaryBg: 'bg-slate-800',
                dark: true
            }
        },
        {
            id: 'classic_gym',
            name: 'Classic Fitness',
            templateType: 'classic',
            theme: {
                bg: 'bg-white',
                text: 'text-gray-900',
                primary: 'bg-blue-600',
                primaryText: 'text-blue-600',
                secondaryBg: 'bg-gray-100',
                dark: false
            }
        }
    ];

    try {
        console.log("Seeding Franchises/Templates...");
        for (const t of templates) {
            // Write directly to the 'franchises' collection matching the exact structure
            await setDoc(doc(db, 'franchises', t.id), {
                name: t.name,
                templateType: t.templateType,
                theme: t.theme,
                createdAt: new Date().toISOString()
            });
            console.log(`✅ Loaded Seed: ${t.id} successfully.`);
        }
        console.log("🔥 Firebase DB seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("Critical Error during seeding:", error);
        process.exit(1);
    }
};

seedTemplates();
