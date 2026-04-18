import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db, functions } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../auth/AuthContext';
import { motion } from 'framer-motion';
import { Dumbbell, ArrowLeft, ArrowRight, Sparkles, Check, Users } from 'lucide-react';
import type { PlanType } from '../types';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [brandName, setBrandName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { templateId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, profile, refreshProfile } = useAuth();

    const planId: PlanType = (location.state as { planId?: PlanType })?.planId || 'Basic';
    const billing: 'monthly' | 'yearly' = (location.state as { billing?: 'monthly' | 'yearly' })?.billing || 'monthly';
    
    // Priority Hierarchy: Firestore Profile > URL Param > LocalStorage (for redirects)
    const storedTemplateId = localStorage.getItem('selectedTemplateId');
    const selectedTemplateId = profile?.templateId || templateId || storedTemplateId || '';

    // Effect: Synchronize URL templateId to Firestore if authenticated but profile is missing it
    useEffect(() => {
        // Guard: Prevent signup if already logged in AND onboarded
        // BUT allow if they are explicitly in an onboarding flow (indicated by templateId in URL)
        if (user && profile?.franchiseId && !loading && !templateId) {
            navigate('/dashboard');
        }

        const syncTemplate = async () => {
            if (user && templateId && !profile?.templateId && !loading) {
                console.log("Synchronizing URL templateId to Firestore...");
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        await updateDoc(userRef, { templateId: templateId });
                        await refreshProfile();
                    }
                } catch (e) {
                    console.error("Sync failed:", e);
                }
            }
        };
        syncTemplate();
    }, [user, templateId, profile, loading, refreshProfile, navigate, location.pathname]);



    const createFranchiseAndOwner = async (user: import('firebase/auth').User, brandNameInput: string) => {
        setLoading(true);
        console.log("Calling secure backend provisioning for:", user.uid);
        
        try {
            const onboardNewGym = httpsCallable(functions, 'onboardNewGym');
            const result = await onboardNewGym({
                brandName: brandNameInput,
                templateId: selectedTemplateId,
                planId: planId,
                billingCycle: billing
            });

            const response = result.data as { success: boolean; franchiseId: string };
            
            if (response.success) {
                console.log("Backend provisioning successful:", response.franchiseId);
                await refreshProfile();
                return response.franchiseId;
            } else {
                throw new Error("Backend reported failure without specific error.");
            }
        } catch (error: unknown) {
            const err = error as { code?: string; message?: string };
            console.error("Backend provisioning failed:", err.code, err.message);
            if (err.code === 'already-exists' || err.message?.includes('already onboarded')) {
                throw new Error("This account is already associated with a gym branch.");
            }
            throw new Error(err.message || "Server-side setup failed. Please try again.");
        }
    };

    const handleSignup = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();
        
        if (!brandName) {
            setError("Brand Name is required");
            return;
        }

        if (!selectedTemplateId) {
            setError("Critical Error: No Template Selected. Please return to the homepage and select a valid Template to construct your brand.");
            return;
        }

        if (!user && (!name || !email || !password)) {
            setError("All fields are required");
            return;
        }

        setLoading(true);
        setError('');

        try {
            let resultingFranchiseId: string | boolean = false;
            
            // If the user is logged in, we check if they are initiating a NEW onboarding or just finishing an old one.
            // If they have a templateId in the URL, we treat it as a fresh onboarding request.
            if (user) {
                if (profile?.franchiseId && !templateId) {
                    console.log("Using existing franchise for already onboarded user.");
                    resultingFranchiseId = profile.franchiseId;
                } else {
                    console.log("Starting fresh onboarding/provisioning for user:", user.uid);
                    resultingFranchiseId = await createFranchiseAndOwner(user, brandName);
                }
            } else {
                let newUser;
                try {
                    // Pre-auth Validation
                    if (!email || !password) {
                        throw new Error("Email and password are required.");
                    }
                    if (password.length < 6) {
                        throw new Error("Password must be at least 6 characters long.");
                    }

                    console.log("Initiating account creation...");
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    newUser = userCredential.user;
                    
                    console.log("Account created successfully. User UID:", newUser.uid);
                    
                    await updateProfile(newUser, { displayName: name });
                    resultingFranchiseId = await createFranchiseAndOwner(newUser, brandName);
                } catch (error) {
                    const err = error as Error & { code?: string };
                    
                    // Comprehensive Logging
                    console.error("Firebase Auth Error caught in Signup flow:");
                    console.error("- Code:", err.code);
                    console.error("- Message:", err.message);

                    if (err.code === 'auth/email-already-in-use') {
                        console.log("Detected existing account for this email. Attempting reconciliation...");
                        try {
                            const loginCredential = await signInWithEmailAndPassword(auth, email, password);
                            newUser = loginCredential.user;

                            const userDoc = await getDoc(doc(db, 'users', newUser.uid));
                            if (!userDoc.exists()) {
                                resultingFranchiseId = await createFranchiseAndOwner(newUser, brandName);
                            } else {
                                resultingFranchiseId = userDoc.data().franchiseId;
                            }
                        } catch (loginError) {
                            const lErr = loginError as Error & { code?: string };
                            console.error("Reconciliation Login Failed:", lErr.code, lErr.message);
                            throw new Error("This email is already in use. Please log in with the correct password or use a different email.");
                        }
                    } else if (err.code === 'auth/invalid-email') {
                        throw new Error("The email address is badly formatted.");
                    } else if (err.code === 'auth/weak-password') {
                        throw new Error("The password is too weak. Please use a stronger password.");
                    } else {
                        throw err; // Re-throw to be caught by the outer catch block
                    }
                }
            }

            console.log("Signup complete, redirecting to dashboard loop...");
            if (resultingFranchiseId && resultingFranchiseId !== "undefined") {
                // Cleanup: persistence no longer needed after success
                localStorage.removeItem('selectedTemplateId');
                navigate(`/dashboard`);
            } else {
                setError("Critical Error: Franchise ID could not be loaded or provisioned properly. Please contact support.");
                setLoading(false);
                return;
            }
        } catch (error) {
            const err = error as Error;
            console.error("Signup error:", err);
            setError(err.message || "An error occurred during signup.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        if (!brandName) {
            setError("Please enter your Brand Name before signing up with Google");
            return;
        }

        try {
            setLoading(true);
            setError('');
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    navigate('/dashboard');
                } else {
                    await createFranchiseAndOwner(user, brandName);
                    navigate(`/dashboard`);
                }
            } catch (dbError) {
                const dbErr = dbError as Error & { code?: string };
                if (dbErr.code === 'unavailable' || dbErr.message.includes('offline')) {
                    setError("Authenticated successfully, but could not reach the database. Please check your connection.");
                } else {
                    setError(`Authenticated, but profile sync failed: ${dbErr.message}`);
                }
            }
        } catch (error) {
            const err = error as Error;
            console.error("Google Sign-in error:", err);
            setError(err.message || "Google Sign-in failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-hidden transition-colors duration-300">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

            {/* Left: Branding/Visual */}
            <div className="hidden md:flex md:w-1/2 bg-card items-center justify-center relative p-12 overflow-hidden border-r border">
                <div className="absolute inset-0 bg-grid opacity-20" />
                <div className="relative z-10 w-full max-w-md">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground mb-10 shadow-xl shadow-primary/20"
                    >
                        <Dumbbell className="w-8 h-8" />
                    </motion.div>
                    <h2 className="text-5xl font-heading font-black text-foreground mb-8 leading-[1.1]">Build Your <br /><span className="text-primary">Fitness Empire.</span></h2>

                    <div className="space-y-6">
                        {[
                            "7-Day Free Trial included",
                            `Plan: ${planId} Selected`,
                            "Branded Gym Website",
                            "All-in-one Management Dashboard"
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-4 text-muted-foreground">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Check className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <span className="font-bold text-sm uppercase tracking-wide">{text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-8 rounded-[2.5rem] bg-secondary/50 border border backdrop-blur-sm shadow-sm">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <div className="text-foreground font-black text-sm">Join 500+ Owners</div>
                                <div className="text-muted-foreground text-[10px] font-black uppercase tracking-widest leading-none mt-1.5 opacity-60">Trusted globally</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
                <Link
                    to="/"
                    className="absolute top-8 right-8 text-muted-foreground hover:text-foreground flex items-center gap-2 z-20 transition-all font-black uppercase text-[10px] tracking-widest"
                >
                    Back to Home <ArrowLeft className="w-3.5 h-3.5" />
                </Link>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="md:hidden flex justify-center mb-8">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground">
                            <Dumbbell className="w-7 h-7" />
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black rounded-full uppercase tracking-widest mb-6">
                        <Sparkles className="w-3 h-3" />
                        Start Your Trial
                    </div>
                    <h1 className="text-4xl font-black text-foreground mb-3 leading-none tracking-tight">
                        {user ? 'Onboarding.' : 'Create Account.'}
                    </h1>
                    <p className="text-muted-foreground mb-10 font-medium">
                        {user ? 'Finish your gym setup to enter dashboard.' : 'No credit card required to start.'}
                    </p>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-5 rounded-2xl mb-8 text-sm font-bold flex items-center gap-4 shadow-sm animate-fade-in">
                            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Gym Brand Name</label>
                            <input
                                type="text"
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                className="w-full bg-secondary/50 border border rounded-2xl p-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/40 font-medium"
                                placeholder="e.g. Iron Legacy Gym"
                                required
                            />
                        </div>

                        {!user && (
                            <>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Your Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-secondary/50 border border rounded-2xl p-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/40 font-medium"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-secondary/50 border border rounded-2xl p-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/40 font-medium"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-secondary/50 border border rounded-2xl p-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/40 font-medium"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 text-xs uppercase tracking-widest mt-4"
                        >
                            {user ? (loading ? 'Setting up...' : 'Complete Onboarding') : loading ? 'Creating Legacy...' : 'Start Free Trial'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    {!user && (
                        <>
                            <div className="flex items-center gap-4 my-10">
                                <div className="h-[1px] bg-border flex-1" />
                                <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest leading-none opacity-40">Or continue with</span>
                                <div className="h-[1px] bg-border flex-1" />
                            </div>

                            <button
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full bg-secondary/50 border border text-foreground font-bold py-4 rounded-2xl hover:bg-muted transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-sm"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google Sign up" />
                                <span className="text-sm">Google Account</span>
                            </button>
                        </>
                    )}

                    <div className="mt-12 text-center">
                        <p className="text-muted-foreground text-sm font-medium">
                            Already have an account? <Link to="/login" className="text-primary hover:text-primary/80 font-black ml-1.5 transition-colors underline underline-offset-4 decoration-primary/20 italic">Log In</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;
