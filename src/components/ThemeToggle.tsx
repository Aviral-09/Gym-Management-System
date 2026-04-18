import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-xl bg-secondary hover:bg-muted transition-colors border border group overflow-hidden"
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={theme}
                    initial={{ y: 20, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: -20, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex items-center justify-center text-foreground"
                >
                    {theme === 'light' ? (
                        <Sun className="w-5 h-5 text-amber-500" />
                    ) : (
                        <Moon className="w-5 h-5 text-brand-400" />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Subtle glow effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className={`absolute inset-0 blur-lg ${theme === 'light' ? 'bg-amber-500/20' : 'bg-brand-500/20'}`} />
            </div>
        </button>
    );
};

export default ThemeToggle;
