import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useAuth } from '../auth/AuthContext';
import type { Franchise, Branch } from '../types';

interface FranchiseContextType {
    franchise: Franchise | null;
    branches: Branch[];
    selectedBranch: Branch | null;
    selectBranch: (branchId: string) => void;
    loading: boolean;
}

const FranchiseContext = createContext<FranchiseContextType | undefined>(undefined);

export const FranchiseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { profile } = useAuth();
    const { franchiseId: urlFranchiseId } = useParams();
    const [franchise, setFranchise] = useState<Franchise | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [activeBranchId, setActiveBranchId] = useState<string | null>(localStorage.getItem('activeBranchId'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        let isMounted = true;

        const initializeData = async () => {
            const fid = urlFranchiseId || (profile?.franchiseId ? String(profile.franchiseId) : null);
            
            // Guard: Must have an active user and a valid franchiseId
            if (!auth.currentUser || !fid || fid === "undefined") {
                if (isMounted) {
                    setFranchise(null);
                    setBranches([]);
                    setLoading(false);
                }
                return;
            }

            try {
                if (isMounted) setLoading(true);

                // 1. Fetch Franchise Static Info
                console.log(`[useFranchise] Initializing with franchiseId: ${fid}`);
                const franchiseDoc = await getDoc(doc(db, 'franchises', fid));

                if (isMounted) {
                    if (franchiseDoc.exists()) {
                        setFranchise({ id: franchiseDoc.id, ...franchiseDoc.data() } as Franchise);
                    } else {
                        console.error(`[useFranchise] No document matches franchiseId ${fid}`);
                        setFranchise(null);
                    }
                }

                // 2. Subscribe to Branches (Real-time)
                const q = query(
                    collection(db, 'branches'),
                    where('franchiseId', '==', fid)
                );

                unsubscribe = onSnapshot(q,
                    (snapshot) => {
                        if (!isMounted) return;
                        const branchList = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        } as Branch));
                        setBranches(branchList);
                        setLoading(false);
                    },
                    (error) => {
                        console.error("FranchiseProvider: Branch subscription error:", error);
                        if (isMounted) setLoading(false);
                    }
                );
            } catch (err) {
                console.error("FranchiseProvider: Initialization error:", err);
                if (isMounted) setLoading(false);
            }
        };

        initializeData();

        return () => {
            isMounted = false;
            if (unsubscribe) unsubscribe();
        };
    }, [profile?.franchiseId, urlFranchiseId]);

    // Derived State: Selected Branch
    const selectedBranch = useMemo(() => {
        if (branches.length === 0) return null;
        return branches.find(b => b.id === activeBranchId) || branches[0];
    }, [branches, activeBranchId]);

    // Stable callback for selecting branches
    const selectBranch = useCallback((branchId: string) => {
        setActiveBranchId(branchId);
        localStorage.setItem('activeBranchId', branchId);
    }, []);

    const contextValue = useMemo(() => ({
        franchise,
        branches,
        selectedBranch,
        selectBranch,
        loading
    }), [franchise, branches, selectedBranch, selectBranch, loading]);

    return (
        <FranchiseContext.Provider value={contextValue}>
            {children}
        </FranchiseContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFranchise = () => {
    const context = useContext(FranchiseContext);
    if (context === undefined) {
        throw new Error('useFranchise must be used within a FranchiseProvider');
    }
    return context;
};
