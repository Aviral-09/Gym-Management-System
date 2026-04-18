import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Franchise, Branch, MembershipPlan } from '../types';
import { MapPin, Dumbbell, Check, Instagram, Facebook, Twitter, Phone } from 'lucide-react';

const PublicSite = () => {
    const { franchiseId } = useParams();
    const [franchise, setFranchise] = useState<Franchise | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!franchiseId) return;
            try {
                console.log(`[PublicSite] Fetching franchise data for ID: ${franchiseId}`);
                
                // 1. Get Franchise by ID
                const fRef = doc(db, 'franchises', franchiseId);
                const fSnap = await getDoc(fRef);
                
                if (!fSnap.exists()) {
                    console.error("[PublicSite] Franchise document not found.");
                    setLoading(false);
                    return;
                }
                const fData = { id: fSnap.id, ...fSnap.data() } as Franchise;
                setFranchise(fData);
                console.log("[PublicSite] Franchise Data Loaded:", fData);

                // 2. Get Branches
                const bQuery = query(collection(db, 'branches'), where('franchiseId', '==', fData.id));
                const bSnap = await getDocs(bQuery);
                const bData = bSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
                setBranches(bData);

                // 3. Get Plans (from first branch for now, as a showcase)
                if (bData.length > 0) {
                    const pQuery = query(collection(db, 'membership_plans'), where('branchId', '==', bData[0].id));
                    const pSnap = await getDocs(pQuery);
                    const pData = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MembershipPlan));
                    setPlans(pData);
                }

            } catch (err) {
                console.error("Error fetching gym data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [franchiseId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Loading Platform</p>
                </div>
            </div>
        );
    }

    if (!franchise) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8 text-center">
                <div className="w-24 h-24 bg-secondary rounded-3xl flex items-center justify-center text-muted-foreground mb-8 shadow-xl border border">
                    <Dumbbell className="w-12 h-12" />
                </div>
                <h1 className="text-4xl font-black mb-4 tracking-tight">Gym Not Found</h1>
                <p className="text-muted-foreground max-w-sm font-medium mb-10">The gym website you are looking for does not exist or has been moved.</p>
                <a href="/" className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/20">
                    Back to IronForge
                </a>
            </div>
        );
    }

    // Dynamic Styling based on Template
    const templateRef = franchise.templateType || franchise.websiteTemplate;
    const displayBrandName = franchise.name || franchise.brandName || "IronForge Template";

    let theme = franchise.theme || {
        bg: 'bg-white',
        text: 'text-gray-900',
        primary: 'bg-blue-600',
        primaryText: 'text-blue-600',
        secondaryBg: 'bg-gray-100',
        dark: false
    };

    if (!franchise.theme) {
        if (templateRef === 'modern') {
            theme = {
                bg: 'bg-zinc-900',
                text: 'text-white',
                primary: 'bg-emerald-500',
                primaryText: 'text-emerald-400',
                secondaryBg: 'bg-zinc-800',
                dark: true
            };
        } else if (templateRef === 'strength') {
            theme = {
                bg: 'bg-slate-900',
                text: 'text-slate-100',
                primary: 'bg-orange-600',
                primaryText: 'text-orange-500',
                secondaryBg: 'bg-slate-800',
                dark: true
            };
        }
    }

    return (
        <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans selection:bg-opacity-30`}>
            {/* Navigation */}
            <nav className={`py-6 px-6 ${theme.bg}/90 backdrop-blur-md sticky top-0 z-50 border-b ${theme.dark ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Dumbbell className={theme.primaryText} size={28} />
                        <span className="text-2xl font-bold uppercase tracking-wider">{displayBrandName}</span>
                    </div>
                    <div className="hidden md:flex gap-8 font-medium">
                        <a href="#locations" className="hover:opacity-70 transition-opacity">Locations</a>
                        <a href="#plans" className="hover:opacity-70 transition-opacity">Membership</a>
                        <a href="#contact" className="hover:opacity-70 transition-opacity">Contact</a>
                    </div>
                    <button className={`${theme.primary} text-white px-6 py-2 rounded-full font-bold hover:brightness-110 transition-all shadow-lg`}>
                        Join Now
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative py-32 md:py-48 flex items-center justify-center text-center px-6 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                <div className={`absolute inset-0 z-10 bg-gradient-to-t from-${theme.dark ? 'black' : 'white'} to-transparent`} />

                <div className="relative z-20 container mx-auto max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase leading-tight tracking-tight">
                        Unleash Your <span className={theme.primaryText}>Potential</span>
                    </h1>
                    <p className="text-xl md:text-2xl opacity-80 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Welcome to {displayBrandName}. Premium facilities, expert coaching, and a community that pushes you further.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <a href="#plans" className={`${theme.primary} text-white px-8 py-4 rounded font-bold text-lg hover:transform hover:translate-y-[-2px] transition-all shadow-xl`}>
                            View Memberships
                        </a>
                        <a href="#locations" className={`border-2 ${theme.dark ? 'border-white' : 'border-gray-900'} px-8 py-4 rounded font-bold text-lg hover:bg-white hover:text-black transition-colors`}>
                            Find a Gym
                        </a>
                    </div>
                </div>
            </header>

            {/* Locations Section */}
            <section id="locations" className={`py-20 ${theme.secondaryBg}`}>
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Locations</h2>
                            <p className="opacity-70">Find a {displayBrandName} near you.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {branches.map(branch => (
                            <div key={branch.id} className={`${theme.bg} p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border ${theme.dark ? 'border-white/5' : 'border-gray-100'}`}>
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`p-3 rounded-xl ${theme.dark ? 'bg-white/10' : 'bg-gray-100'} ${theme.primaryText}`}>
                                        <MapPin size={24} />
                                    </div>
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${branch.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                        {branch.isActive ? 'OPEN' : 'COMING SOON'}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{branch.name}</h3>
                                <p className="opacity-70 mb-1">{branch.location}</p>
                                <p className="opacity-70 mb-6">{branch.city}</p>

                                <div className="space-y-3 pt-6 border-t border-gray-200/10">
                                    {branch.contactInfo && (
                                        <div className="flex items-center gap-3 opacity-80">
                                            <Phone size={16} />
                                            <span>{branch.contactInfo}</span>
                                        </div>
                                    )}
                                    <button className="w-full text-left text-sm font-bold opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1">
                                        View Schedule &rarr;
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Plans Section */}
            {plans.length > 0 && (
                <section id="plans" className="py-24 container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple Pricing</h2>
                        <p className="opacity-70 text-lg">Choose the plan that fits your goals. No hidden fees.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan, idx) => (
                            <div key={plan.id} className={`relative p-8 rounded-3xl ${idx === 1 ? theme.primary + ' text-white transform md:-translate-y-4' : theme.secondaryBg} transition-all`}>
                                {idx === 1 && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-xl font-bold mb-2 opacity-90">{plan.name}</h3>
                                <div className="flex items-baseline mb-8">
                                    <span className="text-5xl font-black">${plan.price}</span>
                                    <span className="ml-1 opacity-70 border-b border-transparent">/{plan.interval}</span>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check size={20} className={idx === 1 ? 'text-white' : theme.primaryText} strokeWidth={3} />
                                            <span className="opacity-90 leading-tight">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button className={`w-full py-4 rounded-xl font-bold text-lg transition-transform hover:scale-[1.02] ${idx === 1 ? 'bg-white text-black' : theme.primary + ' text-white'}`}>
                                    Select {plan.name}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer id="contact" className={`py-12 ${theme.secondaryBg} border-t ${theme.dark ? 'border-white/5' : 'border-gray-200'}`}>
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 opacity-80">
                            <Dumbbell size={24} />
                            <span className="font-bold uppercase">{displayBrandName}</span>
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="opacity-60 hover:opacity-100 transition-opacity"><Instagram size={24} /></a>
                            <a href="#" className="opacity-60 hover:opacity-100 transition-opacity"><Twitter size={24} /></a>
                            <a href="#" className="opacity-60 hover:opacity-100 transition-opacity"><Facebook size={24} /></a>
                        </div>
                        <p className="opacity-50 text-sm">
                            Powered by <span className="font-bold">GymBuilder</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicSite;
