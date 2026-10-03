'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDriveImage } from '@/lib/gsheet';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// The slice of a server-fetched event the search needs (see server-data.ts).
export interface SearchEvent {
    name: string;
    imageLink: string;
    category?: string;
}

interface SearchResult {
    id: string;
    type: 'Event' | 'Page' | 'Info';
    title: string;
    subtitle?: string;
    link?: string;
    image?: string;
    action?: () => void;
}

// One icon per SearchResult['type'], used when a result has no image.
const TYPE_ICONS = {
    Event: (
        <svg className="w-6 h-6 text-primary dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
        </svg>
    ),
    Page: (
        <svg className="w-6 h-6 text-secondary dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v6h6" />
        </svg>
    ),
    Info: (
        <svg className="w-6 h-6 text-accent-dark dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7h.01" />
            <circle cx="12" cy="12" r="9" />
        </svg>
    ),
};

// Module-level so an omitted prop keeps one identity: a `= []` default is a
// new array every render and the effect below would re-run without end.
const NO_EVENTS: SearchEvent[] = [];

export const GlobalSearch = ({ isOpen, onClose, events = NO_EVENTS }: { isOpen: boolean; onClose: () => void; events?: SearchEvent[] }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [allData, setAllData] = useState<SearchResult[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Initial Data Load. The events arrive from the server render via
    // page.tsx, so opening the search no longer fetches the sheet from the
    // browser (and keeps working during a sheet outage).
    useEffect(() => {
        if (isOpen) {
                const staticPages: SearchResult[] = [
                    { id: 'p1', type: 'Page', title: 'Home', subtitle: 'Go to Homepage', link: '#home' },
                    { id: 'p2', type: 'Page', title: 'About', subtitle: 'Learn about Nisadya', link: '#about' },
                    { id: 'p3', type: 'Page', title: 'Events', subtitle: 'Browse all events', link: '#events' },
                    { id: 'p4', type: 'Page', title: 'Schedule', subtitle: 'Check the timeline', link: '#schedule' },
                    { id: 'p5', type: 'Page', title: 'Location', subtitle: 'Find us on map', link: '#location' },
                ];

                setAllData([
                    ...staticPages,
                    ...events.map((event) => ({
                        id: event.name,
                        type: 'Event' as const,
                        title: event.name,
                        subtitle: event.category || 'Event',
                        link: '#events',
                        image: event.imageLink,
                    })),
                ]);
                // Focus input after animation roughly
                setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
        }
    }, [isOpen, events]);

    // Filtering Logic
    useEffect(() => {
        if (!query.trim()) {
            setResults(allData.slice(0, 5)); // Show recent/top items
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = allData.filter(item =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.subtitle?.toLowerCase().includes(lowerQuery)
        );
        setResults(filtered.slice(0, 8));
    }, [query, allData]);

    // Handle Keyboard Navigation (Esc) and Body Scroll Lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [onClose, isOpen]);

    const handleResultClick = (result: SearchResult) => {
        if (result.type === 'Event') {
            // Update URL with event param and hash
            const params = new URLSearchParams(window.location.search);
            params.set('event', result.title);
            // Use router to push new URL with hash
            router.push(`?${params.toString()}#events`);
        } else if (result.link) {
            const element = document.querySelector(result.link);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
        if (result.action) result.action();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-white/60 dark:bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh] px-4 pointer-events-none"
                    >
                        {/* Search Box */}
                        <div className="w-full max-w-2xl pointer-events-auto flex flex-col gap-4">

                            {/* Input Field with Liquid Glass Effect */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 via-secondary/10 to-primary/5 flex items-center justify-center text-primary dark:text-white shadow-sm">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.35-3.65a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search events, pages, layout..."
                                        className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground/50 h-full"
                                    />
                                    <kbd className="hidden md:inline-flex h-6 items-center gap-1 rounded border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-2 font-mono text-[10px] font-medium text-foreground/80 dark:text-muted-foreground">
                                        <span className="text-xs">ESC</span>
                                    </kbd>
                                </div>
                            </div>

                            {/* Results List */}
                            {results.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white/95 dark:bg-slate-900/85 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                                >
                                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                                        {results.map((result, idx) => (
                                            <motion.div
                                                key={result.id + idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <button
                                                    onClick={() => handleResultClick(result)}
                                                    className="w-full text-left p-3 rounded-xl hover:bg-primary/5 dark:hover:bg-white/5 border border-transparent hover:border-primary/20 transition-colors group flex items-center gap-4"
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/12 via-secondary/10 to-primary/5 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0 text-xl overflow-hidden relative border border-black/5 dark:border-white/10 shadow-sm">
                                                        {result.image ? (
                                                            <Image
                                                                src={getDriveImage(result.image)}
                                                                alt={result.title}
                                                                fill
                                                                sizes="48px"
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            TYPE_ICONS[result.type] || TYPE_ICONS.Info
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                            {result.title}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {result.subtitle}
                                                        </p>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="h-12 border-t border-black/10 dark:border-white/10 bg-white/85 dark:bg-slate-900/60 flex items-center justify-between px-4 text-[11px] text-foreground/80 dark:text-muted-foreground uppercase tracking-widest font-semibold">
                                        <span>{results.length} results found</span>
                                        <span>Nisadya Search</span>
                                    </div>
                                </motion.div>
                            )}

                            {results.length === 0 && query && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-8 text-center text-muted-foreground"
                                >
                                    <p>No results found for "{query}"</p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
