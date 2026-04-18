import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useFranchise } from '../hooks/useFranchise';
import type { Trainer, Member } from '../types';
import { Plus, Mail, User, X, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';

const Trainers = () => {
    const { selectedBranch, franchise } = useFranchise();
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [members, setMembers] = useState<Member[]>([]); // To look up counts/lists
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        specialization: '',
        contact: ''
    });

    useEffect(() => {
        if (!selectedBranch || !franchise) return;

        setIsDataLoading(true);

        const trainersQuery = query(
            collection(db, 'trainers'),
            where('branchId', '==', selectedBranch.id),
            where('franchiseId', '==', franchise.id)
        );

        const membersQuery = query(
            collection(db, 'members'),
            where('branchId', '==', selectedBranch.id),
            where('franchiseId', '==', franchise.id),
            orderBy('joinDate', 'desc'),
            limit(100)
        );

        const unsubscribeTrainers = onSnapshot(trainersQuery, 
            (snapshot) => {
                setTrainers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trainer)));
                setIsDataLoading(false);
            },
            (err) => {
                console.error("Trainer sub error:", err);
                setIsDataLoading(false);
            }
        );

        const unsubscribeMembers = onSnapshot(membersQuery, 
            (snapshot) => {
                setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member)));
            },
            (err) => console.error("Member sub error:", err)
        );

        return () => {
            unsubscribeTrainers();
            unsubscribeMembers();
        };
    }, [selectedBranch?.id, franchise?.id]);

    // Derived State: Optimized lookup for members assigned to trainers
    const membersByTrainer = useMemo(() => {
        const mapping: Record<string, Member[]> = {};
        members.forEach(member => {
            if (member.assignedTrainerId) {
                if (!mapping[member.assignedTrainerId]) {
                    mapping[member.assignedTrainerId] = [];
                }
                mapping[member.assignedTrainerId].push(member);
            }
        });
        return mapping;
    }, [members]);

    const handleAddTrainer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBranch || !franchise) return;

        try {
            await addDoc(collection(db, 'trainers'), {
                branchId: selectedBranch.id,
                franchiseId: franchise.id, // Keeping context
                gymId: selectedBranch.id, // Per requirements
                name: formData.fullName, // Storing as 'name' per req, but mapped to fullName in interface locally if needed, but let's stick to interface
                fullName: formData.fullName,
                specialization: formData.specialization,
                contact: formData.contact,
                createdAt: new Date().toISOString()
            });
            setShowModal(false);
            setFormData({ fullName: '', specialization: '', contact: '' });
        } catch (error) {
            console.error('Error adding trainer:', error);
        }
    };

    const handleDeleteTrainer = async (trainerId: string) => {
        if (window.confirm('Delete this trainer? Associated members will be unassigned.')) {
            try {
                await deleteDoc(doc(db, 'trainers', trainerId));
                // In a real app, we should also batch update members to remove assignedTrainerId
            } catch (error) {
                console.error('Error deleting trainer:', error);
            }
        }
    };

    if (!selectedBranch) return null;

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight leading-none mb-4">Trainers</h1>
                    <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase text-[10px] tracking-widest bg-secondary/50 px-3 py-1.5 rounded-full w-fit">
                        <Dumbbell className="w-3.5 h-3.5 text-primary" />
                        <span>Staff Management</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95"
                >
                    <Plus size={20} />
                    <span>Add Trainer</span>
                </button>
            </div>

            {isDataLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Loading staff data...</p>
                </div>
            ) : trainers.length === 0 ? (
                <div className="bg-card rounded-[2.5rem] border border p-20 text-center shadow-sm">
                    <div className="text-muted-foreground mb-6 uppercase tracking-widest text-xs font-bold">No trainers found</div>
                    <button onClick={() => setShowModal(true)} className="text-primary hover:underline italic font-medium">
                        Add your first trainer
                    </button>
                </div>
            ) : (
                <div className="bg-card rounded-[2.5rem] border border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-secondary/30 border-b border">
                                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-[30%]">Trainer Details</th>
                                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-[25%]">Specialization</th>
                                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-[45%]">Assigned Students</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {trainers.map((trainer) => {
                                    const assignedMembers = membersByTrainer[trainer.id] || [];

                                    return (
                                        <tr key={trainer.id} className="hover:bg-secondary/20 transition-colors group">
                                            <td className="p-6 align-top">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                                        <User size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-foreground text-lg">{trainer.fullName}</div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                            <Mail size={12} />
                                                            {trainer.contact}
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteTrainer(trainer.id)}
                                                            className="text-destructive hover:underline text-[10px] font-bold uppercase tracking-wide mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 align-top">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary border border rounded-lg text-xs font-bold text-foreground">
                                                    <Dumbbell size={14} className="text-primary" />
                                                    {trainer.specialization}
                                                </div>
                                            </td>
                                            <td className="p-6 align-top">
                                                {assignedMembers.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {assignedMembers.map((member: Member) => (
                                                            <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/50 hover:border-primary/20 transition-colors">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                                    <span className="text-sm font-medium text-foreground">{member.fullName}</span>
                                                                </div>
                                                                <span className="text-[10px] text-muted-foreground">{member.planId ? 'Plan Active' : 'No Plan'}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic opacity-50">No students assigned</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-foreground tracking-tight">New Trainer</h2>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddTrainer} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-2">Full Name</label>
                                <input
                                    required
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full bg-secondary/50 border border rounded-xl px-4 py-3 text-foreground font-medium outline-none focus:border-primary"
                                    placeholder="Trainer Name"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-2">Specialization</label>
                                <input
                                    required
                                    value={formData.specialization}
                                    onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                    className="w-full bg-secondary/50 border border rounded-xl px-4 py-3 text-foreground font-medium outline-none focus:border-primary"
                                    placeholder="e.g. Yoga, HIIT, Strength"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-2">Contact</label>
                                <input
                                    required
                                    value={formData.contact}
                                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                    className="w-full bg-secondary/50 border border rounded-xl px-4 py-3 text-foreground font-medium outline-none focus:border-primary"
                                    placeholder="Email or Phone"
                                />
                            </div>
                            <button className="w-full bg-primary text-primary-foreground font-black py-4 rounded-xl mt-4 uppercase tracking-widest text-xs hover:brightness-110">
                                Create Trainer
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Trainers;
