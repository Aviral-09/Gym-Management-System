import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useFranchise } from '../hooks/useFranchise';
import BranchSelector from '../admin/BranchSelector';
import ThemeToggle from '../components/ThemeToggle';
import { Activity, Users, CreditCard, LogOut, LayoutGrid, ExternalLink, Sparkles, ChevronRight, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardLayout = () => {
    const { profile, logout } = useAuth();
    const { franchise, branches, selectedBranch, selectBranch, loading } = useFranchise();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center text-primary font-black tracking-widest animate-pulse">
            LOADING...
        </div>
    );

    if (!franchise) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="w-24 h-24 bg-card rounded-[2rem] flex items-center justify-center text-muted-foreground mb-8 shadow-2xl border relative z-10">
                <Dumbbell className="w-12 h-12 opacity-50" />
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tight relative z-10">Franchise Config Missing</h2>
            <p className="text-muted-foreground font-medium mb-10 max-w-md relative z-10">
                We couldn't connect your account to a registered system franchise. This usually happens if setup was interrupted or the template database was unseeded.
            </p>
            <div className="flex gap-4 relative z-10">
                <a href="/#templates" className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/20 cursor-pointer">
                    Return to Templates
                </a>
                <button onClick={handleLogout} className="px-8 py-4 bg-secondary text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted transition-all border">
                    Sign Out
                </button>
            </div>
        </div>
    );

    const isActive = (path: string) => location.pathname === path;

    const menuItems = [
        { name: 'Overview', path: `/dashboard`, icon: <Activity className="w-5 h-5" /> },
        { name: 'Members', path: `/dashboard/members`, icon: <Users className="w-5 h-5" /> },
        { name: 'Trainers', path: `/dashboard/trainers`, icon: <Dumbbell className="w-5 h-5" /> },
        { name: 'Plans', path: `/dashboard/plans`, icon: <CreditCard className="w-5 h-5" /> },
    ];

    return (
        <div className="min-h-screen bg-background font-sans text-foreground flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-card border-r border hidden md:flex flex-col p-8 fixed h-full z-20 shadow-xl overflow-y-auto scrollbar-hide">
                <div className="mb-10 flex items-center justify-between">
                    <Link to={`/dashboard`} className="inline-block overflow-hidden">
                        <h2 className="text-xl font-heading font-black text-foreground truncate flex items-center gap-2">
                            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="truncate">{franchise.brandName}</span>
                        </h2>
                    </Link>
                </div>

                <div className="mb-8 flex items-center justify-between px-2">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary border border text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                        <Sparkles className="w-2.5 h-2.5 text-brand-500" />
                        Admin
                    </div>
                    <ThemeToggle />
                </div>

                {/* Branch Context Switcher */}
                <div className="mb-10">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 px-2">Management Scope</p>
                    <BranchSelector
                        branches={branches}
                        selectedBranch={selectedBranch}
                        onSelect={selectBranch}
                    />
                </div>

                <nav className="space-y-1 flex-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 px-2">Main Menu</p>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center justify-between group px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive(item.path)
                                ? 'bg-primary/10 text-primary font-bold border border-primary/20 shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {item.icon} <span className="text-sm">{item.name}</span>
                            </div>
                            {isActive(item.path) && <ChevronRight className="w-4 h-4 text-primary" />}
                        </Link>
                    ))}

                    <div className="pt-8 opacity-50 px-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Resources</p>
                    </div>

                    <a
                        href={`/site/${franchise.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all group"
                    >
                        <ExternalLink className="w-5 h-5 group-hover:text-primary transition-colors" /> <span className="text-sm">Public Website</span>
                    </a>

                    {(profile?.role === 'OWNER' || profile?.role === 'ADMIN') && (
                        <div className="mt-8 pt-8 border-t border">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 px-2">System Admin</p>
                            <Link
                                to={`/dashboard/branches`}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                            >
                                <LayoutGrid className="w-5 h-5" /> <span className="text-sm">Manage Branches</span>
                            </Link>
                        </div>
                    )}
                </nav>

                <div className="mt-auto pt-8 border-t border">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-muted-foreground hover:text-destructive transition-all w-full px-4 py-3.5 rounded-2xl hover:bg-destructive/5 font-bold text-sm"
                    >
                        <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-72 p-6 md:p-10 overflow-y-auto min-h-screen relative">

                {/* Trial Notification */}
                {franchise.subscription?.status === 'trial' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-primary/20 p-6 rounded-[2rem] mb-10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative z-30"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-black text-foreground text-lg leading-tight mb-1">
                                    Premium Trial Active
                                </h3>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Expires in <span className="text-primary font-bold">{franchise.subscription?.trialEndDate ? Math.ceil((new Date(franchise.subscription.trialEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} days</span>.
                                </p>
                            </div>
                        </div>
                        <Link
                            to={`/dashboard/plans`}
                            className="w-full md:w-auto bg-primary text-primary-foreground px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20 active:scale-95 text-center cursor-pointer"
                        >
                            UPGRADE NOW
                        </Link>
                    </motion.div>
                )}

                <div className="max-w-7xl mx-auto">
                    <Outlet context={{ franchise, branch: selectedBranch }} />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
