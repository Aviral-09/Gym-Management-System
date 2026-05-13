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
    const [franchise, setFranchise] = useState<Franchise | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [activeBranchId, setActiveBranchId] = useState<string | null>(localStorage.getItem('activeBranchId'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.franchiseId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        console.log("[useFranchise] Setting up snapshots for franchise:", profile.franchiseId);

        const unsubscribeFranchise = onSnapshot(doc(db, 'franchises', profile.franchiseId), (docSnap) => {
            if (docSnap.exists()) {
                setFranchise({ id: docSnap.id, ...docSnap.data() } as Franchise);
            }
        });

        const branchesQuery = query(collection(db, 'branches'), where('franchiseId', '==', profile.franchiseId));
        const unsubscribeBranches = onSnapshot(branchesQuery, (snapshot) => {
            const branchesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
            console.log("[useFranchise] Branches loaded:", branchesData.length);
            setBranches(branchesData);
            setLoading(false);
        }, (error) => {
            console.error("[useFranchise] Branches snapshot error:", error);
            setLoading(false);
        });

        return () => {
            unsubscribeFranchise();
            unsubscribeBranches();
        };
    }, [profile?.franchiseId]);

    const selectedBranch = useMemo(() => {
        if (branches.length === 0) return null;
        
        const branch = activeBranchId 
            ? branches.find(b => b.id === activeBranchId) || branches[0]
            : branches[0];
            
        console.log("[useFranchise] selectedBranch memo: activeBranchId=", activeBranchId, "selected=", branch?.name, branch?.id);
        return branch;
    }, [branches, activeBranchId]);

    const selectBranch = useCallback((branchId: string) => {
        console.log("[useFranchise] manually selecting branchId:", branchId);
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
