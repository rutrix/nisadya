'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState, type ReactNode } from 'react';
import { SiteConfig } from '@/lib/gsheet';

// The DoMS and Nisadya cards are the same card twice over: same wrapper tree,
// same spacing, same Read More button, same scaleX rule animation. Everything
// that differs between them is a parameter below, and every class parameter
// carries a COMPLETE class string so Tailwind's JIT still sees it as a literal.
const InfoCard = ({
    inView, delay, glowClass, cardClass, cornerClass, title, subtitle, subtitleClass,
    ruleClass, expanded, onToggle, buttonClass, description, dividerClass, tagline, taglineClass,
}: {
    inView: boolean;
    delay: number;
    glowClass: string;
    cardClass: string;
    cornerClass: string;
    title: string;
    subtitle: string;
    subtitleClass: string;
    ruleClass: string;
    expanded: boolean;
    onToggle: () => void;
    buttonClass: string;
    description: ReactNode;
    dividerClass: string;
    tagline: string;
    taglineClass: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.7, delay }}
        className="group relative"
    >
        {/* Glow Effect */}
        <div className={glowClass} />

        {/* Card Container */}
        <div className={cardClass}>

            {/* Decorative Corner Gradient */}
            <div className={cornerClass} />

            {/* Content */}
            <div className="relative p-6 sm:p-8">
                {/* Icon & Title */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                            {title}
                        </h3>
                        <p className={subtitleClass}>
                            {subtitle}
                        </p>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                    {/* Grow the accent rule with a compositor-friendly
                        scaleX (48px -> 80px) instead of animating width,
                        which would trigger layout on every frame. */}
                    <motion.div
                        className={ruleClass}
                        animate={{ scaleX: expanded ? 80 / 48 : 1 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    />
                    <div className="relative">
                        <div
                            className={`overflow-hidden lg:overflow-visible transition-[max-height] duration-[400ms] ease-out ${expanded ? 'max-h-[500px]' : 'max-h-[4.5rem]'
                                } lg:!max-h-none`}
                            style={{ transform: 'translateZ(0)' }}
                        >
                            {description}
                        </div>

                        <button
                            onClick={onToggle}
                            className={buttonClass}
                        >
                            <span>{expanded ? 'Read Less' : 'Read More'}</span>
                            <svg
                                className={`w-3 h-3 transition-transform duration-300 ${expanded ? 'rotate-180' : 'rotate-0'}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Bottom Decoration */}
                <motion.div
                    className="mt-6 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity"
                    animate={{
                        opacity: expanded ? 0.8 : 0.5
                    }}
                >
                    <div className={dividerClass} />
                    <span className={taglineClass}>{tagline}</span>
                </motion.div>
            </div>
        </div>
    </motion.div>
);

const About = ({ config }: { config?: SiteConfig }) => {
    const [isDomsExpanded, setIsDomsExpanded] = useState(false);
    const [isNisadyaExpanded, setIsNisadyaExpanded] = useState(false);
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <section id="about" className="relative py-24 sm:py-32 bg-gradient-to-b from-background via-background to-background overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Primary Gradient Orbs */}
                {/* Soft colour glows painted with a radial-gradient instead of a
                    filter:blur(120px), which is far cheaper for the browser to
                    repaint on every frame of the scale/opacity animation below. */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/4 -left-20 w-[600px] h-[600px] rounded-full"
                    style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--primary) 20%, transparent) 0%, transparent 70%)' }}
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] rounded-full"
                    style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--secondary) 20%, transparent) 0%, transparent 70%)' }}
                />

                {/* Mesh Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px]" />
            </div>

            <div className="container-custom relative z-10 px-4">
                {/* Header */}
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <motion.span
                        initial={{ scale: 0.9 }}
                        animate={inView ? { scale: 1 } : { scale: 0.9 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-wider uppercase mb-6"
                    >
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Who We Are
                    </motion.span>
                    <h2 className="text-4xl md:text-6xl font-black mb-4 text-foreground tracking-tight">
                        About <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Us</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Discover the legacy and vision that drives excellence
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">
                    {/* DoMS Card */}
                    <InfoCard
                        inView={inView}
                        delay={0.2}
                        glowClass="absolute -inset-1 bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-700"
                        cardClass="relative h-full bg-white/90 dark:bg-[#020617] backdrop-blur-md border-2 border-black/5 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl transition-[border-color,box-shadow,transform] duration-500 group-hover:border-primary/50 group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:-translate-y-1"
                        cornerClass="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-[100px] opacity-50"
                        title={config?.doms_title || 'DoMS NITT'}
                        subtitle={config?.doms_subtitle || 'Since 1978'}
                        subtitleClass="text-[10px] sm:text-xs text-primary font-semibold uppercase tracking-wider mt-1"
                        ruleClass="h-1 w-12 origin-left bg-gradient-to-r from-primary to-transparent rounded-full"
                        expanded={isDomsExpanded}
                        onToggle={() => setIsDomsExpanded(!isDomsExpanded)}
                        buttonClass="lg:hidden mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/30 shadow-sm active:scale-95 transition-transform touch-manipulation"
                        dividerClass="flex-1 h-px bg-gradient-to-r from-primary/50 via-primary/20 to-transparent"
                        tagline={config?.doms_tagline || 'Excellence in Education'}
                        taglineClass="text-[10px] sm:text-xs text-primary font-bold"
                        description={
                                            <div
                                                className={`text-muted-foreground leading-relaxed text-sm sm:text-base transition-opacity duration-300 whitespace-pre-wrap ${isDomsExpanded ? 'opacity-100' : 'opacity-90'}`}
                                                style={{ textAlign: (config?.doms_description_alignment as any) || 'left' }}
                                            >
                                                {config?.doms_description || "Since its inception in 1978, the Department of Management Studies at NIT Trichy (DoMS-NITT) has been a nexus of innovation and leadership, shaping the future of management professionals in India. As a department, under the Ministry of HRD, DoMS-NITT merges academic excellence with cutting-edge research to contribute to the nation's progress. It is set apart by its vibrant industry ties and an alumni network that continues to fuel growth through mentorship, offering students boundless learning opportunities and a roadmap to career success."}
                                            </div>
                        }
                    />

                    {/* Nisadya Card */}
                    <InfoCard
                        inView={inView}
                        delay={0.4}
                        glowClass="absolute -inset-1 bg-gradient-to-r from-secondary via-accent/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-700"
                        cardClass="relative h-full bg-white/90 dark:bg-[#020617] backdrop-blur-md border-2 border-black/5 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl transition-[border-color,box-shadow,transform] duration-500 group-hover:border-secondary/50 group-hover:shadow-2xl group-hover:shadow-secondary/20 group-hover:-translate-y-1"
                        cornerClass="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-secondary/20 to-transparent rounded-bl-[100px] opacity-50"
                        title={config?.about_title || "Nisadya '26"}
                        subtitle={config?.about_subtitle || "Flagship Business Fest"}
                        subtitleClass="text-[10px] sm:text-xs text-secondary font-semibold uppercase tracking-wider mt-1"
                        ruleClass="h-1 w-12 origin-left bg-gradient-to-r from-secondary to-transparent rounded-full"
                        expanded={isNisadyaExpanded}
                        onToggle={() => setIsNisadyaExpanded(!isNisadyaExpanded)}
                        buttonClass="lg:hidden mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/10 text-secondary font-semibold text-xs border border-secondary/30 shadow-sm active:scale-95 transition-transform touch-manipulation"
                        dividerClass="flex-1 h-px bg-gradient-to-r from-secondary/50 via-secondary/20 to-transparent"
                        tagline={config?.about_tagline || 'Compete. Create. Collaborate'}
                        taglineClass="text-[10px] sm:text-xs text-secondary font-bold"
                        description={
                                            <div
                                                className={`text-muted-foreground leading-relaxed text-sm sm:text-base transition-opacity duration-300 whitespace-pre-wrap ${isNisadyaExpanded ? 'opacity-100' : 'opacity-90'}`}
                                                style={{ textAlign: (config?.about_description_alignment as any) || 'left' }}
                                            >
                                                {config?.about_description || "Nisadya is the annual flagship business fest of the Department of Management Studies, NIT Tiruchirappalli. It is a vibrant convergence of ideas, insights, and entrepreneurial spirit, bringing together aspiring business leaders. Nisadya provides a dynamic platform for participants to compete, create, and collaborate with some of the brightest minds in management. Featuring a diverse range of events spanning multiple management domains, the fest enables tomorrow's managers to showcase their skills, test their strategic thinking, and engage with industry leaders."}
                                            </div>
                        }
                    />
                </div>
            </div>
        </section>
    );
};

export default About;
