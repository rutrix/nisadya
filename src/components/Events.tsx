'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Suspense, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { getDriveImage } from '@/lib/gsheet';

interface EventData {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    unstopLink: string;
    imageLink: string;
    coordinator: string;
    contact: string;
}

import { useSearchParams } from 'next/navigation';

// Only this null-rendering child reads the query string. useSearchParams()
// makes Next leave everything up to the nearest <Suspense> out of the
// prerendered HTML, so the boundary sits around this and not the whole grid
// (page.tsx used to wrap <Events> itself, which shipped a spinner and no
// events markup in the static HTML).
const DeepLink = ({ onEvent }: { onEvent: (name: string | null) => void }) => {
    const searchParams = useSearchParams();
    useEffect(() => {
        onEvent(searchParams.get('event'));
    }, [searchParams, onEvent]);
    return null;
};

// Module-level so an omitted prop keeps one identity across renders (a `= []`
// default is a new array every render and would re-run every hook that lists it).
const NO_EVENTS: EventData[] = [];

const Events = ({ initialEvents: events = NO_EVENTS }: { initialEvents?: EventData[] }) => {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showScrollHint, setShowScrollHint] = useState(true);
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    // Deep link: ?event=NAME opens that event (the search uses it too).
    const openByName = useCallback((name: string | null) => {
        if (!name) return;
        const index = events.findIndex(e => e.name.toLowerCase() === name.toLowerCase());
        if (index !== -1) setSelectedId(index);
    }, [events]);

    useEffect(() => {
        if (selectedId !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [selectedId]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedId(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <section id="events" className="relative py-24 sm:py-32 overflow-visible sm:overflow-hidden bg-background">
            <Suspense fallback={null}>
                <DeepLink onEvent={openByName} />
            </Suspense>
            <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20 pointer-events-none overflow-hidden">
                {/* radial-gradient glows replace filter:blur(100px) orbs (cheaper to paint) */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full -translate-y-1/2 translate-x-1/3" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--primary) 20%, transparent) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full translate-y-1/2 -translate-x-1/3" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--secondary) 20%, transparent) 0%, transparent 70%)' }} />
            </div>

            <div className="container-custom relative z-10 px-4">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 sm:mb-20"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wider uppercase mb-4">
                        Discover & Compete
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black mb-6 text-foreground tracking-tight">
                        Our <span className="gradient-text">Events</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Explore our lineup of competitions and register to showcase your skills. Click on any event to see more details.
                    </p>
                </motion.div>

                {events.length === 0 ? (
                    <div className="flex justify-center items-center py-20">
                        <p className="text-muted-foreground">No events available</p>
                    </div>
                ) : (
                    <div className="relative group/events">
                        <div
                            id="events-scroll-container"
                            className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 lg:gap-8 px-6 pb-12 pt-2 scroll-px-6 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-visible sm:px-0 sm:pt-0 sm:pb-0 sm:scroll-px-0 premium-scrollbar"
                            onScroll={(e) => {
                                // Read scrollLeft, then let React commit the opacity
                                // change. Writing style directly here would force a
                                // synchronous reflow (read-then-write layout thrash).
                                const scrolled = e.currentTarget.scrollLeft > 20;
                                const shouldShow = !scrolled;
                                // Bail out via the functional updater so we only
                                // re-render when the visibility actually flips.
                                setShowScrollHint(prev => (prev === shouldShow ? prev : shouldShow));
                            }}
                        >
                            {events.map((event, index) => (
                                <motion.div
                                    layoutId={`card-${index}`}
                                    key={index}
                                    onClick={() => setSelectedId(index)}
                                    className="snap-center shrink-0 w-[85vw] sm:w-auto cursor-pointer group h-full"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <motion.div
                                        className="relative min-h-full h-auto bg-slate-100 dark:bg-[#020617] backdrop-blur-sm border border-black/5 dark:border-white/10 rounded-3xl transition-[border-color,box-shadow,transform] duration-300 shadow-lg shadow-black/5 dark:shadow-white/5 group-hover:border-primary/50 group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:-translate-y-2 flex flex-col"
                                    >
                                        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-3xl">
                                            {event.imageLink ? (
                                                <Image
                                                    src={getDriveImage(event.imageLink)}
                                                    alt={event.name}
                                                    fill
                                                    sizes="(max-width: 640px) 85vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                                    <svg className="w-16 h-16 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
                                            {event.startDate && (
                                                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                                    {event.startDate}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-foreground dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                                {event.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {event.description}
                                            </p>
                                            <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-0 sm:translate-y-2 group-hover:translate-y-0">
                                                View Details →
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Scroll Hint Arrow */}
                        {/* Scroll Hint Gesture */}
                        <motion.div
                            id="scroll-hint-arrow"
                            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 pointer-events-none sm:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: showScrollHint ? 1 : 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{
                                        x: [0, -20, 0],
                                        opacity: [0, 1, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        repeatDelay: 0.5
                                    }}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-2xl"
                                >
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </motion.div>
                                <motion.div
                                    animate={{
                                        x: [0, -20, 0],
                                        opacity: [0, 0.5, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        repeatDelay: 0.5,
                                        delay: 0.1
                                    }}
                                    className="absolute inset-0 w-12 h-12 rounded-full border border-white/40"
                                />
                            </div>
                            <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Swipe</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedId !== null && events[selectedId] && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1050]"
                        />

                        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 sm:p-8 pointer-events-none">
                            <motion.div
                                layoutId={`card-${selectedId}`}
                                className="w-full max-w-lg sm:max-w-xl mx-4 sm:mx-0 bg-slate-100 dark:bg-[#020617] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative pointer-events-auto flex flex-col max-h-[75vh] sm:max-h-[85vh]"
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedId(null);
                                    }}
                                    className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center transition-colors text-sm sm:text-base"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>

                                <div className="relative w-full h-32 sm:h-48 md:h-64 flex-shrink-0">
                                    {events[selectedId].imageLink ? (
                                        <Image
                                            src={getDriveImage(events[selectedId].imageLink)}
                                            alt={events[selectedId].name}
                                            fill
                                            sizes="(max-width: 640px) 90vw, 576px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                                    <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                                        <motion.h3
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-lg sm:text-2xl md:text-3xl font-black text-foreground dark:text-white mb-1 line-clamp-1"
                                        >
                                            {events[selectedId].name}
                                        </motion.h3>
                                        {events[selectedId].startDate && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="flex flex-wrap gap-3"
                                            >
                                                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary/20 text-primary rounded-full text-xs sm:text-sm font-bold border border-primary/20">
                                                    {events[selectedId].startDate}
                                                    {events[selectedId].endDate && ` - ${events[selectedId].endDate}`}
                                                </span>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1">
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="space-y-4 sm:space-y-6 md:space-y-8"
                                    >
                                        <div>
                                            <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
                                                <span className="w-1 h-5 sm:h-6 bg-primary rounded-full"></span>
                                                About the Event
                                            </h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {events[selectedId].description}
                                            </p>
                                        </div>

                                        {(events[selectedId].coordinator || events[selectedId].contact) && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-secondary/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-secondary/10">
                                                {events[selectedId].coordinator && (
                                                    <div>
                                                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Coordinator</div>
                                                        <div className="font-semibold text-foreground">{events[selectedId].coordinator}</div>
                                                    </div>
                                                )}
                                                {events[selectedId].contact && (
                                                    <div>
                                                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Contact</div>
                                                        <div className="font-semibold text-foreground">{events[selectedId].contact}</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    </motion.div>
                                </div>

                                {/^https:\/\//i.test(events[selectedId].unstopLink) && (
                                    <div className="p-4 sm:p-6 border-t border-black/5 dark:border-white/10 bg-slate-100/50 dark:bg-[#020617]/50 backdrop-blur-sm sticky bottom-0 z-10">
                                        <a
                                            href={events[selectedId].unstopLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full bg-primary-solid hover:bg-primary-solid-dark text-white text-center font-bold py-3 sm:py-4 rounded-xl shadow-lg shadow-primary/25 transition-[background-color,transform] hover:-translate-y-1 active:scale-95 text-sm sm:text-base"
                                        >
                                            Register on Unstop
                                        </a>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </section >
    );
};

export default Events;
