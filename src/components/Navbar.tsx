import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Dumbbell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Templates', href: '#templates' },
    ];

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled
                ? 'bg-background/80 backdrop-blur-lg border-b border py-4'
                : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:bg-brand-500 transition-colors">
                        <Dumbbell className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-heading font-black text-foreground tracking-tight">
                        IRON<span className="text-brand-500">FORGE</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs tracking-wide uppercase"
                        >
                            {link.name}
                        </a>
                    ))}
                    <div className="h-6 w-px bg-border mx-2" />
                    <ThemeToggle />
                    <Link
                        to="/login"
                        className="text-muted-foreground hover:text-foreground font-bold text-xs transition-all uppercase tracking-widest"
                    >
                        LOG IN
                    </Link>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            console.log("Navigating to templates...");
                            document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-500 transition-all duration-300 shadow-lg shadow-brand-500/10 flex items-center gap-2 text-xs uppercase tracking-widest"
                    >
                        GET STARTED
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="flex items-center gap-4 md:hidden">
                    <ThemeToggle />
                    <button
                        className="text-foreground p-2 glass rounded-lg"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-background/95 backdrop-blur-xl border-t border"
                    >
                        <div className="flex flex-col p-6 gap-6">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-foreground text-lg font-bold hover:text-brand-500"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="flex flex-col gap-4 mt-2">
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="text-center w-full py-3 rounded-xl border border text-foreground font-bold"
                                >
                                    LOG IN
                                </Link>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsOpen(false);
                                        console.log("Navigating to templates...");
                                        document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="text-center w-full bg-brand-600 text-white py-4 rounded-xl font-bold"
                                >
                                    START FREE TRIAL
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
