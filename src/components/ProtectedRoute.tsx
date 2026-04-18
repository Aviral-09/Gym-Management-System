import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireFranchise?: boolean;
}

const ProtectedRoute = ({ children, requireFranchise = true }: ProtectedRouteProps) => {
    const { user, profile, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Prevent redirects during initial auth load
        if (loading) return;

        if (!user) {
            // 1. Unauthenticated -> Send to Login
            // We exclude '/', '/login', '/signup', and templates from force-redirect if they are meant to be public
            // However, ProtectedRoute is typically wrapped around PRIVATE routes.
            if (location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/') {
                navigate('/login', { state: { from: location }, replace: true });
            }
        } else if (requireFranchise && !profile?.franchiseId) {
            // 2. Authenticated but Un-onboarded -> Send to Onboarding
            const isOnboarding = location.pathname === '/onboarding' || location.pathname.startsWith('/onboarding/');
            if (!isOnboarding) {
                console.log("Redirecting to onboarding: Authenticated user detected without franchiseId");
                navigate('/onboarding', { replace: true });
            }
        }
    }, [user, profile, loading, navigate, location.pathname, requireFranchise]);

    // Enhanced Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Syncing Session</p>
                </div>
            </div>
        );
    }

    // Shield against rendering protected children while redirect is pending or auth fails
    const isUnauthenticated = !user;
    const isUnonboarded = requireFranchise && !profile?.franchiseId;

    if (isUnauthenticated || isUnonboarded) {
        // If we are already on a "safe" path (onboarding/login) we let the components handle it,
        // but ProtectedRoute shouldn't render its protected children here.
        const isOnSafePath = location.pathname === '/login' || 
                             location.pathname === '/signup' || 
                             location.pathname === '/onboarding' ||
                             location.pathname === '/';
        
        if (!isOnSafePath) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary opacity-20"></div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Redirecting...</p>
                    </div>
                </div>
            );
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
