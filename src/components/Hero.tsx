
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-20">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 bg-grid opacity-20" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full z-0 opacity-50 dark:opacity-30" />

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
                >
                    <Sparkles className="w-4 h-4" />
                    <span>The ultimate platform for gym owners</span>
                </motion.div>

                <motion.h1
                    className="text-5xl md:text-8xl font-heading font-black text-foreground tracking-tight mb-8 leading-tight text-gradient py-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                >
                    Scale Your Gym to <br className="hidden md:block" />
                    Digital Heights <span className="text-primary font-black">Fast.</span>
                </motion.h1>

                <motion.p
                    className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    A comprehensive gym management SaaS to build your branded website, streamline memberships, and scale your fitness business with confidence.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-5 justify-center items-center"
                >
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group px-8 py-5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:brightness-110 transition-all duration-300 shadow-xl shadow-primary/20 flex items-center gap-2"
                    >
                        Start Free Trial
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a
                        href="#pricing"
                        className="px-8 py-5 glass border border text-foreground font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-secondary transition-all duration-300"
                    >
                        View Pricing
                    </a>
                </motion.div>

                {/* Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="mt-20 relative px-4"
                >
                    <div className="max-w-5xl mx-auto rounded-2xl border border p-2 bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden">
                        <div className="aspect-video bg-muted rounded-xl relative overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop"
                                alt="Dashboard Preview"
                                className="w-full h-full object-cover"
                            />

                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
