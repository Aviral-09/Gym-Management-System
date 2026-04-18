import { ChevronDown, MapPin, Plus } from 'lucide-react';
import type { Branch } from '../types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface BranchSelectorProps {
    branches: Branch[];
    selectedBranch: Branch | null;
    onSelect: (branchId: string) => void;
}

const BranchSelector = ({ branches, selectedBranch, onSelect }: BranchSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    if (!selectedBranch) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 bg-secondary/50 border border px-5 py-3 rounded-2xl hover:bg-muted transition-all min-w-[220px] justify-between group"
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Active Location</p>
                        <p className="text-sm font-black text-foreground truncate max-w-[120px]">
                            {selectedBranch.name}
                        </p>
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-3 w-full bg-card border border rounded-2xl overflow-hidden"
                        >
                            <div className="px-4 py-2 mb-1">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Select Branch</span>
                            </div>
                            <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                                {branches.map(branch => (
                                    <button
                                        key={branch.id}
                                        onClick={() => {
                                            onSelect(branch.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-sm transition-all flex items-center justify-between group ${selectedBranch.id === branch.id
                                            ? 'bg-primary/10 text-primary font-black'
                                            : 'text-foreground/70 hover:bg-secondary hover:text-foreground font-bold'
                                            }`}
                                    >
                                        {branch.name}
                                        {selectedBranch.id === branch.id && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2 pt-2 border-t border">
                                <button
                                    onClick={() => {
                                        navigate('/admin/branches');
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/5 transition-all flex items-center gap-2"
                                >
                                    <Plus size={12} />
                                    Manage Directory
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BranchSelector;
