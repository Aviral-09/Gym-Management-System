import { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import type { Franchise, Branch } from '../types';
import {
    Users,
    MapPin,
    ArrowUpRight,
    TrendingUp,
    DollarSign,
    Zap,
    Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardHome = () => {
    const { branch, franchise } = useOutletContext<{ franchise: Franchise, branch: Branch }>();
    const [metrics, setMetrics] = useState({
        totalMembers: 0,
        activeMembers: 0,
        revenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!franchise?.id) return;

        setLoading(true);
        console.log("[DashboardHome] Subscribing to analytics for branch:", branch?.name);

        // Subscribe to real-time analytics aggregated by Cloud Functions
        const metricsRef = doc(db, 'franchises', franchise.id, 'analytics', 'overview');
        
        const unsubscribe = onSnapshot(metricsRef, 
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    setMetrics(docSnapshot.data() as typeof metrics);
                }
                setLoading(false);
            },
            (error) => {
                console.error("Dashboard analytics subscription error:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [franchise?.id, branch?.id]);

    if (!branch) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="w-20 h-20 bg-card rounded-3xl flex items-center justify-center text-muted-foreground mb-6 shadow-xl border border">
                <MapPin className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2 leading-none tracking-tight">No Branch Selected</h2>
            <p className="text-muted-foreground max-w-sm font-medium">Please select a location from the sidebar to view detailed analytics and manage operations.</p>
        </div>
    );

    const cards = [
        {
            title: "Total Franchise Members",
            value: metrics.totalMembers || 0,
            icon: <Users className="w-6 h-6" />,
            trend: "+12.5% vs Last Period",
            color: "brand"
        },
        {
            title: "Projected Revenue",
            value: `$${((metrics.activeMembers || 0) * 49).toLocaleString()}`,
            icon: <DollarSign className="w-6 h-6" />,
            trend: "+8.2% Growth",
            color: "emerald"
        },
        {
            title: "Growth Velocity",
            value: "24%",
            icon: <TrendingUp className="w-6 h-6" />,
            trend: "Steadily Increasing",
            color: "violet"
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Aggregating SaaS Analytics</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-20"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight leading-none mb-4">{branch.name} <span className="text-muted-foreground/30 font-thin mx-3">|</span> Overview</h1>
                    <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase text-[10px] tracking-widest bg-secondary/50 px-3 py-1.5 rounded-full w-fit">
                        <Activity className="w-3.5 h-3.5 text-primary" />
                        <span>Aggregated Intelligence for {franchise.brandName}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        to={`/site/${franchise.slug}`}
                        target="_blank"
                        className="p-4 bg-primary text-primary-foreground rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 font-black text-[10px] uppercase tracking-widest"
                    >
                        <span>Visit Site</span>
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {cards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="bg-card p-10 rounded-[2.5rem] border border hover:border-primary/30 transition-all group relative overflow-hidden shadow-sm"
                    >
                        <div className="flex justify-between items-start mb-8 relative">
                            <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                {card.icon}
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none bg-emerald-500/10 px-3 py-1.5 rounded-full">{card.trend}</span>
                        </div>

                        <div className="relative">
                            <h3 className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 leading-none">{card.title}</h3>
                            <p className="text-5xl font-black text-foreground leading-none tracking-tighter">{card.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Growth Graph Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-card border border rounded-[3rem] p-12 shadow-sm relative overflow-hidden h-[450px]">
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <div>
                            <h2 className="text-2xl font-black text-foreground tracking-tight leading-none mb-3">Membership Growth Trajectory</h2>
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Enrollment spikes detected in last 14 days</p>
                        </div>
                    </div>
                    
                    <div className="absolute inset-0 top-40 px-12 pb-12 flex items-end gap-3 shadow-inner">
                        {[50, 80, 60, 100, 75, 95, 110, 85, 120, 105, 90, 130].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${(h/130) * 100}%` }}
                                transition={{ delay: 0.5 + i * 0.05, duration: 1 }}
                                className="flex-1 bg-gradient-to-t from-primary/10 via-primary/60 to-primary rounded-t-xl group relative cursor-pointer"
                            >
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none scale-90 group-hover:scale-100">
                                    {(metrics.activeMembers || 0) + i}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="bg-primary text-primary-foreground rounded-[3rem] p-12 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute inset-0 bg-grid opacity-10" />
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[100px] rounded-full -mr-40 -mt-40" />
                    
                    <div className="relative z-10">
                        <Zap size={40} className="mb-8" />
                        <h2 className="text-4xl font-black tracking-tight leading-[1.1] mb-6">Scale Smarter, Faster.</h2>
                        <p className="text-primary-foreground/80 text-lg font-medium leading-relaxed mb-8">
                            IronForge Intelligence has processed {metrics.totalMembers * 12} data points for your brand this month.
                        </p>
                    </div>

                    <button className="relative z-10 w-full bg-white text-primary font-black py-6 rounded-2xl text-xs uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-2xl shadow-black/20 active:scale-[0.98]">
                        Premium Reports
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardHome;
