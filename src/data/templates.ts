import React from 'react';
import { Layout, Users, Zap, Award, Target, Calendar } from 'lucide-react';

export interface TemplateConfig {
    id: string;
    name: string;
    description: string;
    image: string;
    targetGymType: string;
    visualStyle: string;
    primaryFocus: string;
    sectionOrder: string[];
    useCases: string[];
    tags: string[];
    features: {
        icon: React.ElementType;
        label: string;
        desc: string;
    }[];
    colors: {
        primary: string;
        bg: string;
        text: string;
    };
    recommendedSize: string;
}

export const gymTemplates: TemplateConfig[] = [
    {
        id: 'classic',
        name: 'Classic Iron',
        description: 'A timeless, no-nonsense design perfect for traditional weightlifting gyms and fitness centers. Focuses on clarity, trust, and facilities.',
        image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=1000&auto=format&fit=crop',
        targetGymType: 'Commercial & Local Gyms',
        visualStyle: 'Clean, Bright, Professional',
        primaryFocus: 'Facility & Equipment',
        sectionOrder: ['Hero', 'Locations', 'Programs', 'Membership', 'Contact'],
        useCases: ['24/7 Fitness Centers', 'Community Gyms', 'Recreation Centers'],
        tags: ['General Fitness', 'Professional', 'Clean'],
        recommendedSize: 'Medium - Large (500+ Members)',
        features: [
            { icon: Layout, label: 'Standard Layout', desc: 'Familiar navigation structure' },
            { icon: Users, label: 'Staff Profiles', desc: 'Highlight your certified trainers' },
            { icon: Calendar, label: 'Class Schedule', desc: 'Detailed weekly timetables' }
        ],
        colors: {
            primary: '#2563EB', // Blue
            bg: '#FFFFFF',
            text: '#1F2937'
        }
    },
    {
        id: 'modern',
        name: 'Modern Aesthetics',
        description: 'A sleek, dark-mode heavy design tailored for boutique studios and high-end fitness clubs. Uses gradients and glassmorphism to create a premium feel.',
        image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=1000&auto=format&fit=crop',
        targetGymType: 'Boutique Studios & Luxury Clubs',
        visualStyle: 'Dark Mode, Neon Accents, Minimal',
        primaryFocus: 'Brand Vibe & Experience',
        sectionOrder: ['Hero (Video)', 'Vibe Gallery', 'Instructors', 'Pricing', 'Book Now'],
        useCases: ['Yoga Studios', 'Spin Classes', 'Luxury Health Clubs'],
        tags: ['Premium', 'Boutique', 'Dark Mode'],
        recommendedSize: 'Small - Medium (100-500 Members)',
        features: [
            { icon: Zap, label: 'High Energy', desc: 'Dynamic animations and transitions' },
            { icon: Award, label: 'Premium Feel', desc: 'Focus on high-quality visual assets' },
            { icon: Target, label: 'Niche Focus', desc: 'Optimized for specialized training' }
        ],
        colors: {
            primary: '#10B981', // Emerald
            bg: '#18181B',
            text: '#FFFFFF'
        }
    },
    {
        id: 'strength',
        name: 'Raw Strength',
        description: 'Aggressive and bold. Designed for CrossFit boxes, powerlifting warehouses, and performance centers. It communicates grit and results.',
        image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=1000&auto=format&fit=crop',
        targetGymType: 'CrossFit, Powerlifting, Strongman',
        visualStyle: 'Grunge, Bold Typography, High Contrast',
        primaryFocus: 'Community & Results',
        sectionOrder: ['Hero (Action)', 'WOD/Programming', 'Coaches', 'Success Stories', 'Join'],
        useCases: ['CrossFit Affiliates', 'Garage Gyms', 'Performance Centers'],
        tags: ['Hardcore', 'Performance', 'Community'],
        recommendedSize: 'Small Community (50-300 Members)',
        features: [
            { icon: Users, label: 'Community First', desc: 'Heavy focus on member photos/events' },
            { icon: Target, label: 'Result Driven', desc: 'Showcase PRs and transformations' },
            { icon: Layout, label: 'Blog/WOD', desc: 'Daily workout posting section' }
        ],
        colors: {
            primary: '#EA580C', // Orange
            bg: '#0F172A',
            text: '#F1F5F9'
        }
    }
];
