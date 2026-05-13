import { motion } from 'framer-motion';


const features = [
    {
        title: "Built for Gym Owners",
        description: "Tailored specifically for the fitness industry. Manage memberships, schedules, and branding effortlessly."
    },
    {
        title: "Instant Website Launch",
        description: "Get a professional, high-converting website live in seconds. Choose from premium templates."
    },
    {
        title: "Advanced Analytics",
        description: "Track your gym's growth, member engagement, and revenue with deep-dive analytics."
    },
    {
        title: "Multi-Branch Support",
        description: "Perfect for franchises. Manage all your locations from a single unified super-admin dashboard."
    },
    {
        title: "Enterprise Security",
        description: "Your data is safe with us. We use industry-standard encryption and security protocols."
    },
    {
        title: "Lightning Fast Performance",
        description: "Our websites are optimized for speed, ensuring your members have a seamless experience."
    }
];

const About = () => {
    return (
        <section id="features" className="py-32 bg-secondary/30 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Features</span>
                    <h2 className="text-4xl md:text-6xl font-heading font-black text-foreground mb-6 leading-tight">
                        Everything You Need to <br />
                        <span className="text-primary">Dominate</span> the Market.
                    </h2>
                    <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed font-medium">
                        IronForge provides a comprehensive suite of tools designed to help gym owners focus on what matters most: <span className="text-foreground font-black">building the community</span>.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-10 rounded-[2.5rem] bg-card border border hover:border-primary/30 transition-all duration-300 group shadow-sm"
                        >

                            <h3 className="text-xl font-black text-foreground mb-4 leading-none tracking-tight">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed font-medium text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Decorative Gradient */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </section>
    );
};

export default About;
