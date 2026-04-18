import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../auth/AuthContext';
import { motion } from 'framer-motion';
import { Dumbbell, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { refreshProfile } = useAuth();

    const checkProfileAndRedirect = async (uid: string) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));

            if (userDoc.exists()) {
                await refreshProfile();
                navigate('/dashboard');
            } else {
                navigate('/onboarding');
            }
        } catch (dbError) {
            const dbErr = dbError as Error;
            setError(`Login successful, but profile could not be loaded: ${dbErr.message}`);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            await checkProfileAndRedirect(credential.user.uid);
        } catch (error) {
            const err = error as Error;
            setError(err.message || 'An error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
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

            await checkProfileAndRedirect(user.uid);
        } catch (error) {
            const err = error as Error;
            setError(err.message || "Google Sign-in failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-hidden transition-colors duration-300">
            {/* Left: Branding/Visual */}
            <div className="hidden md:flex md:w-1/2 bg-card items-center justify-center relative p-12 overflow-hidden border-r border">
                <div className="absolute inset-0 bg-grid opacity-20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-lg text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-primary-foreground mx-auto mb-10 shadow-2xl shadow-primary/20"
                    >
                        <Dumbbell className="w-10 h-10" />
                    </motion.div>
                    <h2 className="text-5xl font-heading font-black text-foreground mb-6 leading-tight tracking-tight">Manage Your <br /><span className="text-primary italic">Legacy.</span></h2>
                    <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                        Access your dashboard to manage your gym, track growth, and scale your brand to the next level.
                    </p>
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
                        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                            <Dumbbell className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black rounded-full uppercase tracking-widest mb-6">
                        <Sparkles className="w-3 h-3" />
                        Partner Login
                    </div>
                    <h1 className="text-4xl font-black text-foreground mb-3 leading-none tracking-tight">Welcome Back.</h1>
                    <p className="text-muted-foreground mb-10 font-medium italic">Continue your journey with IronForge.</p>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-5 rounded-2xl mb-8 text-sm font-bold flex items-center gap-4 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 text-xs uppercase tracking-widest group"
                        >
                            {loading ? 'Validating...' : 'Login to Dashboard'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-10">
                        <div className="h-[1px] bg-border flex-1" />
                        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest leading-none opacity-40">Social Login</span>
                        <div className="h-[1px] bg-border flex-1" />
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-secondary/50 border border text-foreground font-bold py-4 rounded-2xl hover:bg-muted transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-sm"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                        <span className="text-sm">Sign in with Google</span>
                    </button>

                    <div className="mt-12 text-center">
                        <p className="text-muted-foreground text-sm font-medium">
                            First time here? <a href="/#templates" className="text-primary hover:text-primary/80 font-black ml-1.5 transition-colors underline underline-offset-4 decoration-primary/20 italic">Start your 7-day free trial</a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
