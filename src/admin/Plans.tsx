import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useFranchise } from '../hooks/useFranchise';
import type { MembershipPlan } from '../types';
import { Plus, Trash2, Check, X, MapPin, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const Plans = () => {
    const { selectedBranch, franchise } = useFranchise();
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        interval: 'month' as 'month' | 'year',
        features: ''
    });

    useEffect(() => {
        if (!selectedBranch) return;

        setIsDataLoading(true);

        const q = query(
            collection(db, 'membership_plans'),
            where('branchId', '==', selectedBranch.id)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const plansData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as MembershipPlan));
            setPlans(plansData);
            setIsDataLoading(false);
        }, (error) => {
            console.error("Error fetching plans:", error);
            setIsDataLoading(false);
        });

        return () => unsubscribe();
    }, [selectedBranch?.id]);

    const handleCreatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBranch || !franchise) return;

        try {
            await addDoc(collection(db, 'membership_plans'), {
                franchiseId: franchise.id,
                branchId: selectedBranch.id,
                name: formData.name,
                price: parseFloat(formData.price),
                interval: formData.interval,
                features: formData.features.split('\n').map(f => f.trim()).filter(f => f !== ''),
                createdAt: new Date().toISOString()
            });
            setShowModal(false);
            setFormData({ name: '', price: '', interval: 'month', features: '' });
        } catch (error) {
            console.error('Error creating plan:', error);
        }
    };

    const handleDeletePlan = async (planId: string) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            try {
                await deleteDoc(doc(db, 'membership_plans', planId));
            } catch (error) {
                console.error('Error deleting plan:', error);
            }
        }
    };

    if (!selectedBranch) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="w-20 h-20 bg-card rounded-3xl flex items-center justify-center text-muted-foreground mb-6 shadow-xl border border">
                    <MapPin className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">Access Restricted</h2>
                <p className="text-muted-foreground max-w-sm font-medium">Please select a branch from the sidebar to manage membership tiers.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight leading-none mb-4">Membership Plans</h1>
                    <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase text-[10px] tracking-widest bg-secondary/50 px-3 py-1.5 rounded-full w-fit">
                        <CreditCard className="w-3.5 h-3.5 text-primary" />
                        <span>Manage tiers for {selectedBranch.name}</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95 mx-auto md:mx-0"
                >
                    <Plus size={20} />
                    Create Tier
                </button>
            </div>

            {isDataLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Loading Tiers</p>
                </div>
            ) : plans.length === 0 ? (
                <div className="bg-card rounded-[2.5rem] border border p-20 text-center shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-5" />
                    <div className="relative z-10 font-bold">
                        <p className="text-muted-foreground mb-6 uppercase tracking-widest text-xs">No active membership tiers</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="text-primary hover:underline italic"
                        >
                            Design your first membership tier
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <motion.div
                            key={plan.id}
                            whileHover={{ y: -8 }}
                            className="bg-card rounded-[2.5rem] border border p-10 hover:border-primary/30 transition-all group relative overflow-hidden shadow-sm flex flex-col"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />

                            <div className="flex justify-between items-start mb-8 relative">
                                <h3 className="text-2xl font-black text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors">{plan.name}</h3>
                                <button
                                    onClick={() => handleDeletePlan(plan.id)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="mb-10 relative">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-foreground tracking-tighter">${plan.price}</span>
                                    <span className="text-muted-foreground font-bold text-xs uppercase tracking-widest">/{plan.interval}</span>
                                </div>
                            </div>

                            <div className="space-y-4 flex-1">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3 text-sm text-foreground/80 font-medium">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                            <Check size={12} className="text-emerald-500" />
                                        </div>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-8 border-t border/50">
                                <div className="w-full py-3 bg-secondary/50 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">
                                    Active Plan ID: {plan.id.slice(0, 8)}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-3xl rounded-full -mr-20 -mt-20" />

                        <div className="flex justify-between items-center mb-10 relative">
                            <div>
                                <h2 className="text-3xl font-black text-foreground tracking-tight leading-none mb-2">New Plan Design</h2>
                                <p className="text-muted-foreground text-sm font-medium">Create a new membership tier for {selectedBranch.name}</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePlan} className="space-y-6 relative">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Plan Identitity</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-secondary/50 border border rounded-2xl px-4 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 font-medium"
                                    placeholder="e.g. Iron Elite"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Pricing ($)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-secondary/50 border border rounded-2xl px-4 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 font-medium font-mono"
                                        placeholder="49.99"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Billing Cycle</label>
                                    <select
                                        value={formData.interval}
                                        onChange={e => setFormData({ ...formData, interval: e.target.value as 'month' | 'year' })}
                                        className="w-full bg-secondary/50 border border rounded-2xl px-4 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium appearance-none cursor-pointer"
                                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2rem' }}
                                    >
                                        <option value="month">Per Month</option>
                                        <option value="year">Per Year</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Included Benefits (One per line)</label>
                                <textarea
                                    required
                                    value={formData.features}
                                    onChange={e => setFormData({ ...formData, features: e.target.value })}
                                    rows={4}
                                    className="w-full bg-secondary/50 border border rounded-2xl px-4 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 font-medium resize-none"
                                    placeholder="24/7 Access&#10;Free Sauna&#10;Juice Bar Discount"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-primary/20 mt-8 text-xs uppercase tracking-widest active:scale-[0.98]"
                            >
                                Publish Plan
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Plans;
