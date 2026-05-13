import { useState } from 'react';
import { useFranchise } from '../hooks/useFranchise';
import { db } from '../firebase/config';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus, MapPin, Building, X, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Branch } from '../types';

const Branches = () => {
    const { franchise, branches, selectBranch } = useFranchise();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        location: ''
    });

    const handleOpenCreateModal = () => {
        setEditingBranch(null);
        setFormData({ name: '', city: '', location: '' });
        setShowModal(true);
    };

    const handleOpenEditModal = (branch: Branch) => {
        setEditingBranch(branch);
        setFormData({
            name: branch.name,
            city: branch.city,
            location: branch.location
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!franchise) return;
        setLoading(true);

        try {
            if (editingBranch) {
                // Update
                await updateDoc(doc(db, 'branches', editingBranch.id), {
                    name: formData.name,
                    city: formData.city,
                    location: formData.location,
                    updatedAt: new Date().toISOString()
                });
            } else {
                // Create
                await addDoc(collection(db, 'branches'), {
                    franchiseId: franchise.id,
                    name: formData.name,
                    city: formData.city,
                    location: formData.location,
                    isActive: true,
                    createdAt: new Date().toISOString()
                });
            }
            setShowModal(false);
            setFormData({ name: '', city: '', location: '' });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoToDashboard = (branchId: string) => {
        selectBranch(branchId);
        navigate('/dashboard');
    };

    return (
        <div className="animate-fade-in space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight leading-none mb-4">Branch Directory</h1>
                    <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase text-[10px] tracking-widest bg-secondary/50 px-3 py-1.5 rounded-full w-fit">
                        <Building className="w-3.5 h-3.5 text-primary" />
                        <span>Manage all {franchise?.brandName} locations</span>
                    </div>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95"
                >
                    <Plus size={20} />
                    Add Branch
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {branches.map(branch => (
                    <motion.div
                        key={branch.id}
                        whileHover={{ y: -8 }}
                        className="bg-card rounded-[2.5rem] border border p-10 hover:border-primary/30 transition-all group relative overflow-hidden shadow-sm"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />

                        <div className="flex justify-between items-start mb-8 relative">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                <Building className="w-6 h-6" />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${branch.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                                {branch.isActive ? 'Active' : 'Hidden'}
                            </span>
                        </div>

                        <h3 className="text-2xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">{branch.name}</h3>

                        <div className="space-y-3 text-sm font-medium text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                {branch.location}, {branch.city}
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border/50 flex gap-3">
                            <button
                                onClick={() => handleOpenEditModal(branch)}
                                className="flex-1 py-3 bg-secondary text-foreground text-xs font-black uppercase tracking-widest rounded-xl hover:bg-muted transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <SettingsIcon size={14} />
                                Settings
                            </button>
                            <button
                                onClick={() => handleGoToDashboard(branch.id)}
                                className="flex-1 py-3 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95"
                            >
                                Dashboard
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-card border border rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-3xl rounded-full -mr-20 -mt-20" />

                            <div className="flex justify-between items-center mb-10 relative">
                                <div>
                                    <h2 className="text-3xl font-black text-foreground tracking-tight leading-none mb-2">
                                        {editingBranch ? 'Branch Settings' : 'New Location'}
                                    </h2>
                                    <p className="text-muted-foreground text-sm font-medium">
                                        {editingBranch ? `Update details for ${editingBranch.name}` : `Launch a new branch for ${franchise?.brandName}`}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Location Identifier</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-secondary/50 border border rounded-2xl px-4 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 font-medium"
                                        placeholder="e.g. IronForge South"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">City</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full bg-secondary/50 border border rounded-2xl px-4 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 font-medium"
                                            placeholder="Mumbai"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Neighborhood</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full bg-secondary/50 border border rounded-2xl px-4 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 font-medium"
                                            placeholder="Bandra West"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-primary/20 mt-8 text-xs uppercase tracking-widest active:scale-[0.98] disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : editingBranch ? 'Update Details' : 'Activate Branch'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Branches;
