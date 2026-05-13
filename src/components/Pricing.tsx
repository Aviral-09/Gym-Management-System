import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { plans } from '../config/plans';

const Pricing = () => {
    const navigate = useNavigate();

    return (
        <section id="pricing" className="py-32 bg-background relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full z-0 pointer-events-none opacity-50" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    className="text-center mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4 block text-center">Pricing Plans</span>
                    <h2 className="text-4xl md:text-6xl font-heading font-black text-foreground mb-6 leading-tight">
                        Scale Your <span className="text-primary">Business.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                        Choose the perfect plan for your fitness empire. All plans include a <span className="text-foreground font-black">7-day free trial</span>.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            className={`relative p-10 rounded-[2.5rem] border flex flex-col transition-all duration-500 group ${plan.isPopular
                                ? 'bg-card border-primary/50 scale-105 shadow-2xl shadow-primary/10'
                                : 'bg-card/50 border hover:border-primary/20 shadow-sm'
                                }`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {plan.isPopular && (
                                <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-black uppercase py-1.5 px-4 rounded-xl flex items-center gap-1.5 shadow-xl shadow-primary/20">
                                    <Sparkles className="w-3 h-3" />
                                    Best Value
                                </div>
                            )}

                            <div className="mb-10">
                                <h3 className="text-xl font-black text-foreground mb-4 uppercase tracking-widest">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-foreground tracking-tighter">${plan.priceMonthly}</span>
                                    <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">/ month</span>
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
                                onClick={() => navigate('/signup', { state: { planId: plan.id } })}
                                className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 transform active:scale-95 ${plan.isPopular
                                    ? 'bg-primary text-primary-foreground hover:brightness-110 shadow-xl shadow-primary/20'
                                    : 'bg-secondary text-foreground hover:bg-muted border border'
                                    }`}
                            >
                                Start 7-Day Free Trial
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
