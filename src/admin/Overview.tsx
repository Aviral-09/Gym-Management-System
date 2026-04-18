import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useFranchise } from '../hooks/useFranchise';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Activity, ArrowUpRight, Target, Zap } from 'lucide-react';

interface MetricSnapshot {
    totalMembers: number;
    activeMembers: number;
    revenue?: number;
}

const Overview = () => {
    const { franchise } = useFranchise();
    const [metrics, setMetrics] = useState<MetricSnapshot>({
        totalMembers: 0,
        activeMembers: 0,
        revenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!franchise?.id) return;

        const metricsRef = doc(db, 'franchises', franchise.id, 'analytics', 'overview');
        const unsubscribe = onSnapshot(metricsRef, (doc) => {
            if (doc.exists()) {
                setMetrics(doc.data() as MetricSnapshot);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [franchise?.id]);

    const kpis = [
        {
            title: 'Active Roster',
            value: metrics.activeMembers,
            change: '+12.5%',
            icon: Users,
            color: 'text-primary',
            bg: 'bg-primary/10'
        },
        {
            title: 'Monthly Revenue',
            value: `$${(metrics.activeMembers * 49).toLocaleString()}`, // Mock calculation based on average $49 plan
            change: '+8.2%',
            icon: DollarSign,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            title: 'Growth Velocity',
            value: '24%',
            change: '+5.4%',
            icon: TrendingUp,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            title: 'Target Achievement',
            value: '82%',
            change: '+2.1%',
            icon: Target,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Aggregating Intelligence</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-12">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-foreground tracking-tight leading-none mb-4">Enterprise Overview</h1>
                <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase text-[10px] tracking-widest bg-secondary/50 px-3 py-1.5 rounded-full w-fit">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    <span>Real-time metrics for {franchise?.brandName}</span>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={kpi.title}
                        className="bg-card border border rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 ${kpi.bg} blur-3xl rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity`} />
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-12 h-12 rounded-2xl ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                                    <kpi.icon size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                                    <ArrowUpRight size={12} />
                                    {kpi.change}
                                </div>
                            </div>
                            
                            <h3 className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">{kpi.title}</h3>
                            <div className="text-3xl font-black text-foreground">{kpi.value}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Analytics View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-card border border rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden h-[400px]">
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div>
                            <h2 className="text-2xl font-black text-foreground tracking-tight leading-none mb-2">Membership Growth</h2>
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Active Enrollment Distribution</p>
                        </div>
                        <div className="bg-secondary/50 px-4 py-2 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-widest">Last 30 Days</div>
                    </div>
                    
                    {/* Mock Graph Placeholder */}
                    <div className="absolute inset-0 top-32 px-10 pb-10 flex items-end gap-2">
                        {[40, 65, 45, 90, 55, 75, 85, 60, 95, 80, 70, 100].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: 0.5 + i * 0.05, duration: 0.8 }}
                                className="flex-1 bg-gradient-to-t from-primary/40 to-primary rounded-t-lg group relative"
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {Math.floor(metrics.activeMembers * (h/100))} New
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="bg-primary text-primary-foreground rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute inset-0 bg-grid opacity-10" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32" />
                    
                    <div className="relative z-10">
                        <Zap size={32} className="mb-6" />
                        <h2 className="text-3xl font-black tracking-tight leading-tight mb-4 text-white">Scale Your Infrastructure</h2>
                        <p className="text-primary-foreground/70 text-sm font-medium leading-relaxed">
                            You've optimized your roster and stabilized your database. Ready to deploy custom AI training plans for your active students?
                        </p>
                    </div>

                    <button className="relative z-10 w-full bg-white text-primary font-black py-5 rounded-2xl text-xs uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl active:scale-[0.98]">
                        Unlock Premium Insights
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Overview;
