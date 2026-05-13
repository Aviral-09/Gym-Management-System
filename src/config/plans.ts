import type { PlanConf } from '../types';

export const plans: PlanConf[] = [
    {
        id: 'Basic',
        name: 'Basic',
        priceMonthly: 49,
        priceYearly: 490,
        features: [
            "1 Gym Website",
            "Unlimited Branch Pages",
            "Standard Analytics",
            "Community Support"
        ]
    },
    {
        id: 'Pro',
        name: 'Pro',
        priceMonthly: 99,
        priceYearly: 990,
        isPopular: true,
        features: [
            "Everything in Basic",
            "Custom Domain Support",
            "Advanced SEO Optimization",
            "Member Portal Integration",
            "Priority Email Support"
        ]
    },
    {
        id: 'Enterprise',
        name: 'Enterprise',
        priceMonthly: 199,
        priceYearly: 1990,
        features: [
            "Everything in Pro",
            "White Label Customization",
            "API Access",
            "Dedicated Account Manager",
            "24/7 Priority Support"
        ]
    }
];
