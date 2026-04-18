import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, deleteDoc, limit, startAfter, getDocs, orderBy, QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useFranchise } from '../hooks/useFranchise';
import type { Member, MembershipPlan, Trainer } from '../types';
import { Plus, Trash2, Search, Mail, Phone, Calendar, User, X, Users, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const Members = () => {
    const { selectedBranch, franchise } = useFranchise();
    const [members, setMembers] = useState<Member[]>([]);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const PAGE_SIZE = 15;

    const [trainers, setTrainers] = useState<Trainer[]>([]);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        planId: '',
        assignedTrainerId: ''
    });

    useEffect(() => {
        if (!selectedBranch || !franchise) return;

        setIsDataLoading(true);

        // Snapshot for Plans and Trainers (smaller collections)
        const plansQuery = query(collection(db, 'membership_plans'), where('branchId', '==', selectedBranch.id));
        const unsubscribePlans = onSnapshot(plansQuery, (snapshot) => {
            setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MembershipPlan)));
        });

        const trainersQuery = query(collection(db, 'trainers'), where('branchId', '==', selectedBranch.id));
        const unsubscribeTrainers = onSnapshot(trainersQuery, (snapshot) => {
            setTrainers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trainer)));
        });

        // Scalable Paginated Fetch for Members
        const membersQuery = query(
            collection(db, 'members'),
            where('branchId', '==', selectedBranch.id),
            where('franchiseId', '==', franchise.id),
            orderBy('joinDate', 'desc'),
            limit(PAGE_SIZE)
        );

        const unsubscribeMembers = onSnapshot(membersQuery, (snapshot) => {
            const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
            setMembers(membersData);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === PAGE_SIZE);
            setIsDataLoading(false);
        }, (error) => {
            console.error("Member query failed:", error);
            setIsDataLoading(false);
        });

        return () => {
            unsubscribePlans();
            unsubscribeMembers();
            unsubscribeTrainers();
        };
    }, [selectedBranch?.id, franchise?.id]);

    const filteredMembers = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();
        if (!search) return members;
        
        return members.filter(member =>
            member.fullName.toLowerCase().includes(search) ||
            member.email.toLowerCase().includes(search)
        );
    }, [members, searchTerm]);

    const planMap = useMemo(() => {
        const map: Record<string, string> = {};
        plans.forEach(p => { map[p.id] = p.name; });
        return map;
    }, [plans]);

    const handleLoadMore = async () => {
        if (!lastDoc || isLoadingMore || !selectedBranch || !franchise) return;
        
        setIsLoadingMore(true);
        try {
            const nextQuery = query(
                collection(db, 'members'),
                where('branchId', '==', selectedBranch.id),
                where('franchiseId', '==', franchise.id),
                orderBy('joinDate', 'desc'),
                startAfter(lastDoc),
                limit(PAGE_SIZE)
            );

            const snapshot = await getDocs(nextQuery);
            const nextData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
            
            setMembers(prev => [...prev, ...nextData]);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === PAGE_SIZE);
        } catch (error) {
            console.error("Error loading more members:", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBranch || !franchise) return;

        try {
            await addDoc(collection(db, 'members'), {
                franchiseId: franchise.id,
                branchId: selectedBranch.id,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone || null,
                planId: formData.planId || null,
                assignedTrainerId: formData.assignedTrainerId || null,
                status: 'active',
                joinDate: new Date().toISOString()
            });
            setShowModal(false);
            setFormData({ fullName: '', email: '', phone: '', planId: '', assignedTrainerId: '' });
        } catch (error) {
            console.error('Error adding member:', error);
        }
    };

    const handleDeleteMember = async (memberId: string) => {
        if (window.confirm('Are you sure you want to delete this member?')) {
            try {
                await deleteDoc(doc(db, 'members', memberId));
            } catch (error) {
                console.error('Error deleting member:', error);
            }
        }
    };

    if (!selectedBranch) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="w-20 h-20 bg-card rounded-3xl flex items-center justify-center text-muted-foreground mb-6 shadow-xl border border">
                    <User className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">Access Restricted</h2>
                <p className="text-muted-foreground max-w-sm font-medium">Please select a branch from the sidebar to manage your member roster.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight leading-none mb-4">Member Roster</h1>
                    <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase text-[10px] tracking-widest bg-secondary/50 px-3 py-1.5 rounded-full w-fit">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span>Manage members for {selectedBranch.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find a member..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-card border border rounded-2xl pl-12 pr-4 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/40 font-medium"
                        />
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Add Member</span>
                    </button>
                </div>
            </div>

            {isDataLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Loading Member Data</p>
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="bg-card rounded-[2.5rem] border border p-20 text-center shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-5" />
                    <div className="relative z-10 font-bold">
                        <p className="text-muted-foreground mb-6 uppercase tracking-widest text-xs">No members match your criteria</p>
                        {searchTerm ? (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-primary hover:underline italic"
                            >
                                Clear search filters
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowModal(true)}
                                className="text-primary hover:underline italic"
                            >
                                Enroll your first member today
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <>
                <div className="bg-card rounded-[2.5rem] border border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-secondary/30 border-b border">
                                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Member Details</th>
                                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contact Info</th>
                                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Subscription</th>
                                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Joined On</th>
                                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Settings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredMembers.map((member: Member) => (
                                    <tr key={member.id} className="hover:bg-secondary/20 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                                    <User size={24} />
                                                </div>
                                                <div>
                                                    <div className="font-black text-foreground">{member.fullName}</div>
                                                    <div className={`text-[10px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5 ${member.status === 'active' ? 'text-emerald-500' : 'text-destructive'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-destructive shadow-sm shadow-destructive/50'}`} />
                                                        {member.status}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2.5 text-foreground font-medium">
                                                    <Mail size={14} className="text-primary" />
                                                    {member.email}
                                                </div>
                                                {member.phone && (
                                                    <div className="flex items-center gap-2.5 text-muted-foreground">
                                                        <Phone size={14} />
                                                        {member.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                         <td className="p-6">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary border border rounded-lg text-xs font-bold text-foreground">
                                                <CreditCard size={14} className="text-primary" />
                                                {member.planId ? (planMap[member.planId] || 'Unknown Plan') : 'No Plan'}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2.5 text-sm text-foreground font-medium">
                                                <Calendar size={14} className="text-primary" />
                                                {new Date(member.joinDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <button
                                                onClick={() => handleDeleteMember(member.id)}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                                                title="Remove Member"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {hasMore && (
                        <div className="flex justify-center mt-10">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="px-8 py-3 bg-secondary border border hover:bg-muted text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all disabled:opacity-50 flex items-center gap-3"
                            >
                                {isLoadingMore ? (
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                                ) : null}
                                {isLoadingMore ? 'Synchronizing...' : 'Load More Members'}
                            </button>
                        </div>
                    )}
                </>
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
                                <h2 className="text-3xl font-black text-foreground tracking-tight leading-none mb-2">New Enrollment</h2>
                                <p className="text-muted-foreground text-sm font-medium">Register a new member to {selectedBranch.name}</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddMember} className="space-y-6 relative">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full bg-secondary/50 border border rounded-2xl px-4 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 font-medium"
                                    placeholder="e.g. Alexander Iron"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-secondary/50 border border rounded-2xl px-4 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 font-medium"
                                    placeholder="alex@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-secondary/50 border border rounded-2xl px-4 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 font-medium"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Select Membership Plan</label>
                                <select
                                    value={formData.planId}
                                    onChange={e => setFormData({ ...formData, planId: e.target.value })}
                                    className="w-full bg-secondary/50 border border rounded-2xl px-4 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium appearance-none cursor-pointer"
                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2rem' }}
                                >
                                    <option value="">Choose a plan...</option>
                                    {plans.map(plan => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name} (${plan.price}/{plan.interval})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Assign Trainer (Optional)</label>
                                <select
                                    value={formData.assignedTrainerId}
                                    onChange={e => setFormData({ ...formData, assignedTrainerId: e.target.value })}
                                    className="w-full bg-secondary/50 border border rounded-2xl px-4 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium appearance-none cursor-pointer"
                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2rem' }}
                                >
                                    <option value="">No Trainer Assigned</option>
                                    {trainers.map(trainer => (
                                        <option key={trainer.id} value={trainer.id}>
                                            {trainer.fullName} ({trainer.specialization})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-primary/20 mt-8 text-xs uppercase tracking-widest active:scale-[0.98]"
                            >
                                Confirm Enrollment
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Members;
