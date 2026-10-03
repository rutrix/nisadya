"use client";
import type { ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { SiteConfig, getDriveImage } from '@/lib/gsheet';
import { toast } from 'react-hot-toast';
import { Calendar, Hourglass, Ticket } from 'lucide-react';
import CountdownTimer, { toISO } from './CountdownTimer';

// The three registration toasts share one wrapper character for character.
// Only the icon, the two lines of copy and the trailing pulse dot differ.
const regToast = (icon: ReactNode, title: string, body: string, dot = false) =>
    toast.custom((t) => (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{
                opacity: t.visible ? 1 : 0,
                y: t.visible ? 0 : 20,
                scale: t.visible ? 1 : 0.8
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="max-w-md w-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl pointer-events-auto flex items-center p-4 ring-1 ring-black/5 dark:ring-white/10"
        >
            <div className="flex-shrink-0 mr-4">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-base font-bold text-foreground">
                    {title}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    {body}
                </p>
            </div>
            {dot && (
                <div className="flex-shrink-0 ml-4">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                </div>
            )}
        </motion.div>
    ), { position: 'bottom-center', duration: 4000 });

const Hero = ({ config }: { config?: SiteConfig }) => {
    const { scrollY } = useScroll();
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);
    const bottomFadeOpacity = useTransform(scrollY, [0, 400], [0, 1]);

    const handleScrollToEvents = () => {
        const element = document.getElementById('events');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const getRegistrationState = () => {
        const now = new Date();
        const startDateStr = config?.registration_start_date;
        const endDateStr = config?.registration_end_date;

        // If no dates provided at all
        if (!startDateStr && !endDateStr) {
            return 'NO_DATES';
        }

        // Parse dates. The standard constructor is tried first (it accepts
        // MM/DD/YYYY, which toISO would reorder into an invalid date), and
        // only an invalid result falls back to the DD/MM/YYYY normaliser.
        const parseDate = (dateStr: string | undefined) => {
            if (!dateStr) return null;
            let date = new Date(dateStr);
            if (isNaN(date.getTime())) date = new Date(toISO(dateStr));
            return isNaN(date.getTime()) ? null : date;
        };

        const startDate = parseDate(startDateStr);
        const endDate = parseDate(endDateStr);

        // State: Before Registration Start
        // Case 1: Start date exists and is in future
        if (startDate && now < startDate) {
            return 'BEFORE_START';
        }

        // State: Registration Closed
        // Case 1: End date exists and is in past
        if (endDate && now > endDate) {
            return 'CLOSED';
        }

        // State: Open
        // If we are here, we are either between start and end, or only one boundary was defined and valid
        return 'OPEN';
    };

    // Compute exact state for rendering
    const registrationState = getRegistrationState();

    const handleRegister = () => {
        const state = registrationState;
        const startDateStr = config?.registration_start_date || '';

        if (state === 'NO_DATES') {
            regToast(
                <Hourglass className="w-8 h-8 text-primary animate-pulse" />,
                'Coming Soon!',
                'Registrations will be opening soon. Stay tuned!'
            );
            return;
        }

        if (state === 'BEFORE_START') {
            regToast(
                <Calendar className="w-8 h-8 text-primary animate-bounce" />,
                'Mark your calendars!',
                `Registration starts from ${startDateStr}.`
            );
            return;
        }

        if (state === 'CLOSED') {
            toast.error("Registrations have been closed.", { position: 'bottom-center' });
            return;
        }

        // If OPEN
        // Scheme allowlist: the sheet is trusted but window.open is the one sink
        // React does not sanitise, so a javascript: cell would run in our origin.
        // '#' and '/' are allowed because DEFAULT/fallback config uses '#events'.
        const regLink = config?.registration_link;
        if (regLink && /^(https:\/\/|#|\/)/i.test(regLink)) {
            window.open(regLink, '_blank', 'noopener,noreferrer');
        } else {
            const element = document.getElementById('events');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                regToast(
                    <Ticket className="w-8 h-8 text-primary animate-pulse" />,
                    'Ready to Register?',
                    'Select an event to start your registration!',
                    true
                );
            }
        }
    };

    // YYYY-MM-DD to DD/MM/YYYY, the inverse of toISO.
    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '';
        return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr.split('-').reverse().join('/') : dateStr;
    };

    const getRegisterButtonText = () => {
        const state = registrationState;
        switch (state) {
            case 'NO_DATES': return 'Coming Soon';
            case 'BEFORE_START': return `Opens ${formatDate(config?.registration_start_date) || 'Soon'}`;
            case 'CLOSED': return 'Registration Closed';
            default: return 'Register Now'; // OPEN
        }
    };

    return (
        <section
            id="home"
            className="relative min-h-screen flex items-center justify-center overflow-hidden py-20"
        >
            {/* Animated Background */}
            <div className="absolute inset-0 z-0">
                {/* Background Image */}
                <div className="absolute inset-0 z-[-1]">
                    <Image
                        src={config?.background_image_url ? getDriveImage(config.background_image_url) : "/bg-optimized.jpg"}
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover opacity-80 dark:opacity-70"
                        priority
                    />
                </div>

                {/* Vignette & Color Tint */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(255,253,245,0.8)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_20%,#020617_100%)]" />
                <div className="absolute inset-0 bg-gradient-to-br from-cream/30 to-primary/10 dark:from-slate-950/40 dark:to-slate-900/40 mix-blend-overlay" />
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 dark:opacity-20">
                    {/* Soft colour glows. A radial-gradient paints the same glow a
                        filter:blur(100px) used to, but without the very expensive
                        blur filter that had to repaint every animation frame. */}
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full animate-float" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--primary) 30%, transparent) 0%, transparent 70%)' }} />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full animate-float" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--secondary) 30%, transparent) 0%, transparent 70%)', animationDelay: '2s' }} />
                    <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full animate-float" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 20%, transparent) 0%, transparent 70%)', animationDelay: '4s' }} />
                </div>
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

                {/* Bottom Fade - Scroll Triggered & Enhanced Blend */}
                <motion.div
                    style={{ opacity: bottomFadeOpacity }}
                    className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-background via-background/80 to-transparent z-10"
                />
            </div>

            <div className="container-custom relative z-10 px-4 mt-16 sm:mt-20 md:mt-24">
                <div className="flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-2 md:mb-3 relative"
                    >
                        {/* Decorative floating element */}
                        <motion.div style={{ y: y2 }} className="absolute -top-10 -right-10 md:-right-20 w-20 h-20 md:w-32 md:h-32 z-0 opacity-60 pointer-events-none select-none">
                            <div className="w-full h-full rounded-full bg-gradient-to-r from-primary to-accent blur-xl animate-pulse" />
                        </motion.div>

                        {/* A <p>, not an <h2>: this kicker sits above the <h1>,
                            so as a heading it made the page start at level 2. */}
                        <p className="text-lg md:text-xl font-bold tracking-[0.2em] text-secondary dark:text-secondary-light mb-1 uppercase">
                            {config?.hero_subtitle || 'The Ultimate College Fest'}
                        </p>
                        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-1 relative z-10">
                            <span className="gradient-text drop-shadow-sm tracking-[0.3em]">NISADYA</span>
                            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-1 text-foreground/90 dark:text-white/90 font-heading tracking-[0.15em]">
                                {config?.hero_year || '2026'}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className={`${config?.hero_date ? 'flex' : 'hidden'} items-center gap-2 mb-4 md:mb-6`}
                    >
                        <div className="px-4 py-1.5 rounded-full bg-secondary/10 dark:bg-white/10 border border-secondary/20 dark:border-white/20 backdrop-blur-sm flex items-center gap-2 shadow-sm">
                            <Calendar className="w-4 h-4 text-secondary dark:text-white" />
                            <span className="text-sm md:text-base font-semibold text-secondary dark:text-white tracking-wide uppercase">
                                {(() => {
                                    // No '2026-02-28' default: a blank hero_date used to
                                    // print "February 28, 2026". Blank now prints nothing
                                    // and the whole pill is hidden by the class above. A
                                    // non-date string ("Dates to be announced") prints raw.
                                    const dateStr = config?.hero_date;
                                    if (!dateStr) return null;
                                    const date = new Date(toISO(dateStr));
                                    if (isNaN(date.getTime())) return dateStr;
                                    return date.toLocaleDateString('en-US', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    });
                                })()}
                            </span>
                        </div>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-sm md:text-lg text-muted-foreground max-w-2xl mb-6 md:mb-8 leading-relaxed"
                    >
                        {config?.hero_description || config?.about_description || 'Unleash your potential at the biggest cultural and technical extravaganza of the year. Join us for 2 days of innovation, creativity, and fun.'}
                    </motion.p>

                    <CountdownTimer heroDate={config?.hero_date} />

                    <motion.div
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-3 justify-center relative z-30"
                    >
                        <button
                            onClick={handleScrollToEvents}
                            className="btn-outline text-base px-8 py-3 glass hover:bg-primary/5 dark:hover:bg-white/5 border-primary/50"
                        >
                            Explore Events
                        </button>

                        <button
                            onClick={handleRegister}
                            className={`btn-primary text-base px-8 py-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 relative overflow-hidden group ${registrationState === 'CLOSED' ? 'opacity-80' : ''}`}
                            disabled={registrationState === 'CLOSED'}
                        >
                            <span className="relative z-10">{getRegisterButtonText()}</span>
                            {registrationState !== 'CLOSED' && (
                                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-[150%]" />
                            )}
                        </button>
                    </motion.div>

                    {/* Powered by Unstop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="flex justify-center mt-4"
                    >
                        <a
                            href={config?.unstop_url || "https://unstop.com"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 dark:bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
                        >
                            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-foreground/50 dark:text-white/40">Powered by</span>
                            <Image
                                src="/Unstop-Logo-Blue-Large.png"
                                alt="Unstop"
                                width={64}
                                height={20}
                                className="object-contain dark:brightness-0 dark:invert opacity-60 hover:opacity-100 transition-opacity"
                            />
                        </a>
                    </motion.div>
                </div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                style={{ opacity }}
                className="absolute scroll-indicator bottom-40 md:bottom-10 left-1/2 transform -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
            >
                <span className="hidden md:block text-xs font-medium text-muted-foreground/60 uppercase tracking-[0.2em]">scroll</span>
                <div className="w-5 h-9 border-2 border-muted-foreground/30 rounded-full flex justify-center p-1">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-1 h-1 bg-primary rounded-full"
                    />
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
