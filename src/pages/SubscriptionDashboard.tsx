import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Clock, AlertTriangle } from 'lucide-react';
import { useFranchise } from '../hooks/useFranchise';
import { plans } from '../config/plans';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

const SubscriptionDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const { franchise, loading: franchiseLoading } = useFranchise();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const navigate = useNavigate();
    const [paymentLoading, setPaymentLoading] = useState(false);

    const handlePayment = async (plan: typeof plans[0]) => {
        const amount = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
        setPaymentLoading(true);
        console.log(`Initializing payment for plan: ${plan.name}, amount: ${amount}`);
        
        try {
            // 1. Create order on backend
            const createRazorpayOrder = httpsCallable(functions, 'createRazorpayOrder');
            console.log("Calling createRazorpayOrder...");
            const result = await createRazorpayOrder({ amount });
            console.log("createRazorpayOrder result:", result);
            const responseData = result.data as { orderId: string; amount: number; currency: string };
            
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder_id',
                amount: responseData.amount,
                currency: responseData.currency,
                name: "IronForge Gym",
                description: `Subscription for ${plan.name}`,
                order_id: responseData.orderId,
                handler: async function (response: any) {
                    console.log("Razorpay payment success handler triggered:", response);
                    // 2. Verify payment on backend
                    const verifyRazorpayPayment = httpsCallable(functions, 'verifyRazorpayPayment');
                    console.log("Calling verifyRazorpayPayment...");
                    const verifyResult = await verifyRazorpayPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        userId: user?.uid,
                        planId: plan.id
                    });
                    console.log("verifyRazorpayPayment result:", verifyResult);
                    
                    const verifyData = verifyResult.data as { success: boolean; message: string };
                    
                    if (verifyData.success) {
                        alert("Payment Successful!");
                        if (!user) {
                            navigate('/signup', { state: { planId: plan.id, paid: true } });
                        } else if (!franchise?.id) {
                            navigate('/onboarding', { state: { planId: plan.id, paid: true } });
                        } else {
                            navigate('/dashboard');
                        }
                    } else {
                        alert("Payment verification failed!");
                    }
                },
                prefill: {
                    name: user?.displayName || "",
                    email: user?.email || "",
                },
                theme: {
                    color: "#7c3aed",
                },
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();
            
        } catch (error: any) {
            console.error("Payment failed in catch block:", error);
            alert(`Payment failed to initialize: ${error.message || error}`);
        } finally {
            setPaymentLoading(false);
        }
    };

    if (authLoading || franchiseLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Loading Subscription Data</p>
                </div>
            </div>
        );
    }

    const hasFranchise = !!franchise?.id;
    const currentPlanId = franchise?.subscription?.planId || 'Basic';
    const subscriptionStatus = franchise?.subscription?.status || 'prospect';
    const trialEndDate = franchise?.subscription?.trialEndDate;
    
    const isTrial = subscriptionStatus === 'trial';
    const isActive = hasFranchise && (subscriptionStatus === 'active' || isTrial);

    const daysLeft = trialEndDate 
        ? Math.ceil((new Date(trialEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className="min-h-screen bg-[#faf8f5] dark:bg-[#030008] text-foreground transition-colors duration-500">
            {/* Header */}
            <nav className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Zap className="text-primary w-6 h-6" />
                        <span className="font-heading font-black text-xl uppercase tracking-wider">IronForge</span>
                    </div>
                    {user && (
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className={`text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all ${
                                isActive 
                                    ? 'bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20' 
                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                            }`}
                            disabled={!isActive}
                        >
                            {isActive ? 'Go to Dashboard' : 'Subscribe to Access'}
                        </button>
                    )}
                    {!user && (
                        <button 
                            onClick={() => navigate('/login')}
                            className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Status Banner */}
                {hasFranchise && !isActive && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 text-amber-700 dark:text-amber-400"
                    >
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div>
                            <p className="font-bold text-sm">Subscription Inactive</p>
                            <p className="text-xs opacity-90">Please choose a plan to unlock full access to the dashboard.</p>
                        </div>
                    </motion.div>
                )}

                {hasFranchise && isTrial && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-4 text-primary"
                    >
                        <Clock className="w-5 h-5 shrink-0" />
                        <div>
                            <p className="font-bold text-sm">Free Trial Active</p>
                            <p className="text-xs opacity-90">You have {daysLeft} days left in your free trial. Upgrade now to ensure uninterrupted service.</p>
                        </div>
                    </motion.div>
                )}

                {/* Overview Cards */}
                {hasFranchise && (
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <motion.div 
                            className="bg-white dark:bg-[#0c0714] p-6 rounded-3xl border border-border/50 shadow-sm"
                            whileHover={{ y: -5 }}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Current Plan</span>
                            <h3 className="text-2xl font-black text-foreground mb-1">{currentPlanId}</h3>
                            <p className="text-xs text-muted-foreground font-medium">Billed {franchise?.subscription?.billingCycle || 'monthly'}</p>
                        </motion.div>

                        <motion.div 
                            className="bg-white dark:bg-[#0c0714] p-6 rounded-3xl border border-border/50 shadow-sm"
                            whileHover={{ y: -5 }}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Status</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <h3 className="text-2xl font-black text-foreground uppercase tracking-wide">{subscriptionStatus}</h3>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium mt-1">
                                {isTrial ? `Renews in ${daysLeft} days` : isActive ? 'Active account' : 'Action required'}
                            </p>
                        </motion.div>

                        <motion.div 
                            className="bg-white dark:bg-[#0c0714] p-6 rounded-3xl border border-border/50 shadow-sm"
                            whileHover={{ y: -5 }}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Billing Overview</span>
                            <h3 className="text-2xl font-black text-foreground mb-1">
                                ${billingCycle === 'monthly' ? plans.find(p => p.id === currentPlanId)?.priceMonthly : plans.find(p => p.id === currentPlanId)?.priceYearly}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium">Next payment pending</p>
                        </motion.div>
                    </div>
                )}

                {/* Billing Cycle Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="bg-white dark:bg-[#0c0714] p-1.5 rounded-2xl flex items-center border border-border/50 shadow-sm">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                billingCycle === 'monthly'
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                                billingCycle === 'yearly'
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Yearly
                            <span className="bg-emerald-500/20 text-emerald-500 text-[9px] px-1.5 py-0.5 rounded-md font-black">-20%</span>
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                    {plans.map((plan, index) => {
                        const isCurrent = hasFranchise && plan.id === currentPlanId;
                        const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
                        
                        return (
                            <motion.div
                                key={plan.id}
                                className={`relative p-10 rounded-[2.5rem] border flex flex-col transition-all duration-500 group bg-white dark:bg-[#0c0714] ${
                                    plan.isPopular
                                        ? 'border-primary/50 shadow-2xl shadow-primary/5 md:scale-105'
                                        : 'border-border/50 hover:border-primary/20 shadow-sm'
                                } ${isCurrent ? 'ring-2 ring-emerald-500' : ''}`}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {plan.isPopular && !isCurrent && (
                                    <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-black uppercase py-1.5 px-4 rounded-xl flex items-center gap-1.5 shadow-xl shadow-primary/20">
                                        <Sparkles className="w-3 h-3" />
                                        Best Value
                                    </div>
                                )}
                                
                                {isCurrent && (
                                    <div className="absolute top-0 right-10 -translate-y-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase py-1.5 px-4 rounded-xl flex items-center gap-1.5 shadow-xl">
                                        Current Plan
                                    </div>
                                )}

                                <div className="mb-10">
                                    <h3 className="text-xl font-black text-foreground mb-4 uppercase tracking-widest">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-foreground tracking-tighter">${price}</span>
                                        <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">/ {billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                    </div>
                                </div>

                                <ul className="space-y-6 mb-12 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-4 text-muted-foreground text-[14px] font-medium">
                                            <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-primary" />
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => {
                                        if (!isCurrent) {
                                            handlePayment(plan);
                                        }
                                    }}
                                    disabled={paymentLoading || isCurrent}
                                    className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 transform active:scale-95 ${
                                        isCurrent
                                            ? 'bg-muted text-muted-foreground cursor-default'
                                            : plan.isPopular
                                                ? 'bg-primary text-primary-foreground hover:brightness-110 shadow-xl shadow-primary/20'
                                                : 'bg-secondary text-foreground hover:bg-muted border border-border/50'
                                    }`}
                                >
                                    {isCurrent ? 'Current Plan' : isActive ? 'Upgrade' : 'Select Plan'}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionDashboard;
