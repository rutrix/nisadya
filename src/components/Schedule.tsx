'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';

interface ScheduleEvent {
    time: string;
    title: string;
    venue: string;
    category: string;
}

interface ScheduleDay {
    day: string;
    date: string;
    events: ScheduleEvent[];
}

interface RawScheduleRow {
    day: string;
    date: string;
    time: string;
    title: string;
    venue: string;
    category: string;
}

const Schedule = ({ initialSchedule = [] }: { initialSchedule?: RawScheduleRow[] }) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    // Group raw data by day
    const groupedByDay = initialSchedule.reduce((acc, current) => {
        if (!current.day) return acc;

        const dayKey = `Day ${current.day}`;
        if (!acc[dayKey]) {
            acc[dayKey] = {
                day: dayKey,
                date: current.date, // Will be empty if 'date' column doesn't exist
                events: [],
            };
        }
        acc[dayKey].events.push({
            time: current.time,
            title: current.title,
            venue: current.venue,
            category: current.category,
        });
        return acc;
    }, {} as Record<string, ScheduleDay>);

    const schedule = Object.values(groupedByDay).sort((a, b) => a.day.localeCompare(b.day, undefined, { numeric: true }));

    const [activeDayIndex, setActiveDayIndex] = useState(0);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
        exit: { opacity: 0 }
    };

    return (
        <section id="schedule" className="relative section-padding bg-background overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                {/* radial-gradient glows replace filter:blur(120px) orbs (cheaper to paint) */}
                <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--primary) 10%, transparent) 0%, transparent 70%)' }} />
                <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--secondary) 10%, transparent) 0%, transparent 70%)' }} />
            </div>

            <div className="container-custom relative z-10">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 sm:mb-20"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-secondary/10 text-secondary text-sm font-semibold tracking-wider uppercase mb-4">
                        Plan your Days
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        Event <span className="gradient-text">Schedule</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        Don't miss a beat. Check out the timeline for all the exciting events lined up for you.
                    </p>
                </motion.div>

                {schedule.length === 0 ? (
                    <div className="flex justify-center items-center py-20">
                        <p className="text-muted-foreground">No schedule available</p>
                    </div>
                ) : (
                    <>
                        {/* Day selector tabs: mobile only (< md). At md+ every day card is shown at once. */}
                        <div className="md:hidden">
                            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4">
                                {schedule.map((day, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveDayIndex(index)}
                                        className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-[background-color,color,box-shadow,transform] duration-300 ${activeDayIndex === index
                                            ? 'bg-primary-solid text-white shadow-lg shadow-primary/25 scale-105'
                                            : 'bg-secondary/5 text-muted-foreground hover:bg-secondary/10 hover:text-foreground'
                                            }`}
                                    >
                                        {day.day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/*
                          Every day card is rendered exactly ONCE here. CSS decides layout:
                          - below md: only the tab-selected day is visible (the rest are `hidden`).
                          - md and up: all day cards are shown side by side (the desktop list).
                          Responsive utilities recreate the old mobile look (wider card, gradient
                          rule, larger heading, category chips) below md and the desktop look at md+.
                        */}
                        <motion.div
                            initial="hidden"
                            animate={inView ? 'visible' : 'hidden'}
                            variants={containerVariants}
                            className="flex flex-wrap justify-center gap-8"
                        >
                            {schedule.map((day, dayIndex) => (
                                <motion.div
                                    key={dayIndex}
                                    variants={{
                                        hidden: { opacity: 0, y: 50 },
                                        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                                    }}
                                    className={`relative group w-full max-w-3xl md:max-w-sm mx-4 sm:mx-0 ${dayIndex === activeDayIndex ? 'block' : 'hidden'} md:block`}
                                >
                                    <div className="h-full bg-slate-100 dark:bg-[#020617] backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border-t border-black/5 dark:border-white/10 relative overflow-hidden transition-[box-shadow,transform] duration-300 shadow-md shadow-black/5 dark:shadow-white/5 hover:shadow-2xl md:hover:-translate-y-2">
                                        <div className="absolute -right-2 -top-2 sm:-right-4 sm:-top-4 text-7xl sm:text-8xl md:text-9xl font-black text-foreground/[0.04] sm:text-foreground/5 select-none pointer-events-none">
                                            {String(dayIndex + 1).padStart(2, '0')}
                                        </div>

                                        <div className="relative z-10 mb-4 sm:mb-6 flex items-end gap-4">
                                            <div>
                                                <h3 className="text-2xl sm:text-4xl md:text-2xl font-black md:font-bold mb-1 md:mb-2 text-primary">{day.day}</h3>
                                                <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">{day.date}</p>
                                            </div>
                                            <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent mb-2 md:hidden" />
                                        </div>

                                        <div className="relative space-y-6 sm:space-y-8 md:space-y-6 pl-4 sm:pl-6 border-l-2 border-primary/20 ml-2 sm:ml-4 md:ml-0">
                                            {day.events.map((event, eventIndex) => (
                                                <div key={eventIndex} className="relative group/event">
                                                    <span className="absolute -left-[23px] sm:-left-[33px] top-1.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-4 border-background bg-primary transition-transform duration-300 group-hover/event:scale-125" />

                                                    <div className="transform transition-transform duration-300 group-hover/event:translate-x-2">
                                                        <span className="text-xs font-bold text-secondary uppercase tracking-wider mb-1 block">
                                                            {event.time}
                                                        </span>
                                                        <h4 className="text-base sm:text-xl md:text-base font-bold text-foreground mb-1 group-hover/event:text-primary transition-colors">
                                                            {event.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>{event.venue}</span>
                                                            {event.category && (
                                                                <>
                                                                    <span className="md:hidden w-1 h-1 rounded-full bg-muted-foreground/50" />
                                                                    <span className="md:hidden text-xs border border-muted-foreground/20 px-1.5 py-0.5 rounded text-muted-foreground/80">{event.category}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </>
                )}
            </div>
        </section>
    );
};

export default Schedule;
