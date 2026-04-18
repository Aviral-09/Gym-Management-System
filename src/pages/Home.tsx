import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Templates from '../components/Templates';
import About from '../components/About';
import Pricing from '../components/Pricing';
import MagicBento from '../components/MagicBento';
import { motion } from 'framer-motion';
import { ArrowRight, Dumbbell } from 'lucide-react';

const Home = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-background transition-colors duration-300"
        >
            <Navbar />
            <Hero />
            <About />
            <Templates />
            <Pricing />

            {/* Features Marketplace Section */}
            <section className="py-24 bg-background/50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-heading font-black text-foreground mb-4">
                            Powerful <span className="text-primary">Ecosystem</span>
                        </h2>
                        <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                            Everything you need to manage your gym at scale, powered by cutting-edge technology.
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <MagicBento
                            textAutoHide={true}
                            enableStars
                            enableSpotlight
                            enableBorderGlow={true}
                            enableTilt={false}
                            enableMagnetism={false}
                            clickEffect
                            spotlightRadius={400}
                            particleCount={12}
                            glowColor="132, 0, 255"
                            disableAnimations={false}
                        />
                    </div>
                </div>
            </section>
            {/* Final CTA Section */}
            <section className="py-32 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full -z-10" />

                <div className="container mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-card/50 backdrop-blur-xl border border p-16 md:p-24 rounded-[3rem] shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-grid opacity-5" />

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-7xl font-heading font-black text-foreground mb-8 leading-[1.1] tracking-tight">
                                Ready to Build Your <br />
                                <span className="text-primary italic">Fitness Empire?</span>
                            </h2>
                            <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-medium">
                                Join over 500+ gym owners who have transformed their digital presence with IronForge.
                            </p>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    console.log("Navigating to templates...");
                                    document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-3 px-12 py-5 bg-primary text-primary-foreground font-black text-xl rounded-2xl shadow-2xl shadow-primary/20 hover:brightness-110 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
                            >
                                Get Started Now
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Premium Footer */}
            <footer className="bg-background border-t border py-20 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                                    <Dumbbell className="w-7 h-7" />
                                </div>
                                <span className="text-3xl font-heading font-black text-foreground tracking-tight">
                                    IRON<span className="text-primary">FORGE</span>
                                </span>
                            </div>
                            <p className="text-muted-foreground text-lg max-w-sm leading-relaxed font-medium">
                                The most complete SaaS platform for gym owners. Build, manage, and scale your fitness legacy with ease.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-foreground font-black mb-8 uppercase tracking-[0.2em] text-[10px]">Product Ecosystem</h4>
                            <ul className="space-y-4">
                                <li><a href="#features" className="text-muted-foreground hover:text-primary font-bold transition-all flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />Features</a></li>
                                <li><a href="#templates" className="text-muted-foreground hover:text-primary font-bold transition-all flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />Templates</a></li>
                                <li><a href="#pricing" className="text-muted-foreground hover:text-primary font-bold transition-all flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-foreground font-black mb-8 uppercase tracking-[0.2em] text-[10px]">Social Connect</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-muted-foreground hover:text-primary font-bold transition-all flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />Instagram</a></li>
                                <li><a href="#" className="text-muted-foreground hover:text-primary font-bold transition-all flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />Twitter / X</a></li>
                                <li><a href="#" className="text-muted-foreground hover:text-primary font-bold transition-all flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />Facebook</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-12 border-t border flex flex-col md:flex-row justify-between items-center gap-8">
                        <p className="text-muted-foreground text-sm font-bold">
                            © 2026 IronForge Ecosystem. Engineered by Iron Labs.
                        </p>
                        <div className="flex gap-10 text-sm font-black uppercase tracking-widest text-muted-foreground">
                            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                            <a href="#" className="hover:text-primary transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </motion.div>
    );
};

export default Home;
