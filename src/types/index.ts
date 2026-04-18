export type Role = 'ADMIN' | 'OWNER' | 'BRANCH_ADMIN' | 'COACH' | 'MEMBER';

export type PlanType = 'Basic' | 'Pro' | 'Enterprise';

export interface PlanConf {
    id: PlanType;
    name: string;
    priceMonthly: number;
    priceYearly: number;
    features: string[];
    isPopular?: boolean;
}

export interface Franchise {
    id: string;
    name?: string; // New Schema Mapping
    brandName?: string; // Legacy Fallback
    templateType?: string;
    websiteTemplate?: string; // Legacy Fallback
    slug?: string;
    ownerId?: string;
    theme?: {
        bg: string;
        text: string;
        primary: string;
        primaryText: string;
        secondaryBg: string;
        dark: boolean;
    };
    createdAt: string;
    subscription?: {
        planId: PlanType;
        status: 'active' | 'trial' | 'prospect' | 'cancelled';
        trialStartDate?: string;
        trialEndDate?: string;
        billingCycle: 'monthly' | 'yearly';
    };
}

export interface Branch {
    id: string;
    franchiseId: string;
    name: string;
    location: string;
    city: string;
    contactInfo?: string;
    isActive: boolean;
    createdAt: string;
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
    franchiseId?: string;
    templateId?: string;
    branchId?: string | null;
    role?: Role;
    createdAt: string;
}

export interface Member {
    id: string;
    franchiseId: string;
    branchId: string;
    fullName: string;
    email: string;
    phone?: string;
    status: 'active' | 'inactive';
    joinDate: string;
    planId?: string;
    assignedTrainerId?: string;
}

export interface Trainer {
    id: string;
    gymId: string; // This maps to franchiseId or branchId depending on logic, keeping standard 
    // prompt says gymId, but our system uses franchiseId/branchId. I will use branchId as primary context.
    branchId: string;
    fullName: string;
    specialization: string;
    contact: string;
    createdAt: string;
}

export interface MembershipPlan {
    id: string;
    franchiseId: string;
    branchId: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
    features: string[];
    createdAt: string;
}

