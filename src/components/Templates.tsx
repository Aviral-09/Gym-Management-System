import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Info, X, Check, ArrowRight, Sparkles } from 'lucide-react';
import { gymTemplates } from '../data/templates';
import type { TemplateConfig } from '../data/templates';
import { useAuth } from '../auth/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const Templates = () => {
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuth();
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);

    const handleDeploy = async (templateId: string) => {
        // Persistence: LocalStorage fallback for redirect-heavy flows (OAuth)
        console.log("Persisting selected templateId to localStorage:", templateId);
        localStorage.setItem('selectedTemplateId', templateId);

        if (user) {
            try {
                await updateDoc(doc(db, 'users', user.uid), { templateId });
                await refreshProfile();
            } catch (e) {
                console.error("Firestore immediate save failed:", e);
            }
        }
        navigate(`/onboarding/${templateId}`);
    };

    return (
        <section id="templates" className="py-32 bg-background relative overflow-hidden">
            <div className="container mx-auto px-6">
                <motion.div
                    className="text-center mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Our Marketplace</span>
                    <h2 className="text-4xl md:text-6xl font-heading font-black text-foreground mb-6 leading-tight">
                        Find Your Perfect <span className="text-primary">Aesthetic.</span>
                    </h2>
                    <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed font-medium">
                        Precision-engineered, conversion-optimized templates designed to scale from boutique studios to enterprise-level gyms.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {gymTemplates.map((template, index) => (
                        <motion.div
                            key={template.id}
                            className="bg-card rounded-[2.5rem] overflow-hidden border border hover:border-primary/30 transition-all duration-500 flex flex-col h-full group shadow-sm"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {/* Card Image */}
                            <div className="h-72 bg-muted relative overflow-hidden m-3 rounded-[2rem]">
                                <img
                                    src={template.image}
                                    alt={template.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-primary/90 backdrop-blur-md text-[10px] font-black text-primary-foreground rounded-full border border-white/10 uppercase tracking-widest">
                                        {template.tags[0]}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            {/* Card Body */}
                            <div className="p-8 pt-4 flex flex-col flex-1">
                                <h3 className="text-2xl font-black text-foreground mb-3 group-hover:text-primary transition-colors tracking-tight leading-none">{template.name}</h3>
                                <p className="text-muted-foreground text-[14px] mb-8 line-clamp-2 leading-relaxed font-medium">
                                    {template.description}
                                </p>

                                {/* Key Features Mini-List */}
                                <div className="space-y-4 mb-10 flex-1">
                                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Key Usecases</h4>
                                    <ul className="space-y-3">
                                        {template.useCases.slice(0, 2).map((useCase, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Check className="w-3 h-3 text-primary" />
                                                </div>
                                                <span>{useCase}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-4 mt-auto">
                                    <button
                                        onClick={() => setSelectedTemplate(template)}
                                        className="h-12 w-12 flex items-center justify-center rounded-2xl border border text-foreground hover:bg-secondary transition-all duration-300 shadow-sm"
                                    >
                                        <Info size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDeploy(template.id)}
                                        className="flex-1 h-12 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-lg shadow-primary/20"
                                    >
                                        Select Template
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Template Details Modal */}
            <AnimatePresence>
                {selectedTemplate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTemplate(null)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-card w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] border border relative z-10 shadow-2xl flex flex-col lg:flex-row overflow-hidden"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center bg-background/50 text-foreground rounded-2xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-xl"
                            >
                                <X size={24} />
                            </button>

                            {/* Left: Visual Preview */}
                            <div className="w-full lg:w-1/2 relative min-h-[400px]">
                                <img
                                    src={selectedTemplate.image}
                                    alt={selectedTemplate.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                                <div className="absolute bottom-10 left-10 right-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 text-primary text-[10px] font-black rounded-full uppercase tracking-widest mb-4">
                                        <Sparkles className="w-3 h-3" />
                                        Premium Template
                                    </div>
                                    <h3 className="text-4xl font-heading font-black text-foreground tracking-tight leading-none">{selectedTemplate.name}</h3>
                                </div>
                            </div>

                            {/* Right: Content */}
                            <div className="w-full lg:w-1/2 p-12 overflow-y-auto">
                                <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-4">Philosophy</h4>
                                <p className="text-muted-foreground text-lg mb-10 leading-relaxed font-medium">
                                    {selectedTemplate.description}
                                </p>

                                <div className="grid grid-cols-2 gap-10 mb-12">
                                    <div>
                                        <h5 className="text-[10px] font-black uppercase text-primary mb-6 tracking-widest">Target Audience</h5>
                                        <ul className="space-y-4">
                                            {selectedTemplate.useCases.map((useCase, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground font-medium">
                                                    <Check className="w-5 h-5 text-primary shrink-0" />
                                                    <span>{useCase}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] font-black uppercase text-primary mb-6 tracking-widest">Section Map</h5>
                                        <ol className="space-y-4">
                                            {selectedTemplate.sectionOrder.map((section, idx) => (
                                                <li key={idx} className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                                                    <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] text-primary font-black">
                                                        {idx + 1}
                                                    </span>
                                                    <span>{section}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-6 items-center pt-8 border-t border">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Recommendation</span>
                                        <span className="text-foreground font-black text-sm uppercase">{selectedTemplate.recommendedSize}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeploy(selectedTemplate.id)}
                                        className="w-full sm:w-auto px-10 py-5 bg-primary text-primary-foreground font-black rounded-[1.5rem] hover:brightness-110 transition-all duration-300 shadow-xl shadow-primary/20 text-xs uppercase tracking-widest"
                                    >
                                        Deploy Template
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Templates;
