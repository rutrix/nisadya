'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { SiteConfig, getDriveImage } from '@/lib/gsheet';

import { GlobalSearch, SearchEvent } from './GlobalSearch';

const SearchIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const Navbar = ({ config: initialConfig, events }: { config?: SiteConfig; events?: SearchEvent[] }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const config: SiteConfig | null = initialConfig || null;

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // ... scroll effect ...
    useEffect(() => {
        // Throttle with requestAnimationFrame so we do at most one read per
        // paint frame, and only re-render when the boolean actually flips.
        let rafId: number | null = null;
        let lastScrolled = false;
        const handleScroll = () => {
            if (rafId !== null) return; // an update is already scheduled
            rafId = window.requestAnimationFrame(() => {
                rafId = null;
                const scrolled = window.scrollY > 20; // layout read inside rAF
                if (scrolled !== lastScrolled) {
                    lastScrolled = scrolled;
                    setIsScrolled(scrolled);
                }
            });
        };

        // passive tells the browser we never call preventDefault, so it can
        // scroll without waiting on this handler.
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafId !== null) window.cancelAnimationFrame(rafId);
        };
    }, []);

    const navLinks = [
        { name: 'Home', href: '#home' },
        { name: 'About', href: '#about' },
        { name: 'Events', href: '#events' },
        // { name: 'Schedule', href: '#schedule' },
        { name: 'Stay', href: '#stay' },
        { name: 'Location', href: '#location' },
    ];

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <>
            <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} events={events} />
            <motion.nav
                initial={{ y: 0 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
                className={`fixed top-0 left-0 right-0 z-[1000] transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300 ${isScrolled
                    ? 'glass'
                    : 'bg-transparent'
                    }`}
            >
                <div className="container-custom">
                    <div className="flex items-center justify-between h-20 md:h-28 px-4">
                        {/* Logo */}
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="relative w-12 h-12 md:w-16 md:h-16">
                                <Image
                                    src="/college_logo.png"
                                    alt="College Logo"
                                    fill
                                    sizes="(max-width: 768px) 48px, 64px"
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div className="w-[1px] h-6 md:h-8 bg-foreground/20" />
                            <Link href="#home" onClick={(e) => scrollToSection(e, '#home')}>
                                <div className="relative w-28 h-10 md:w-40 md:h-14">
                                    <Image
                                        src={config?.logo_url ? getDriveImage(config.logo_url) : "/fest_main_logo.png"}
                                        alt="Nisadya Logo"
                                        fill
                                        sizes="(max-width: 768px) 112px, 160px"
                                        className="object-contain invert dark:invert-0 transition-[filter] duration-300"
                                        priority
                                    />
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => scrollToSection(e, link.href)}
                                    className="font-medium transition-colors duration-300 hover:text-primary text-foreground"
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {/* Search Button */}
                            <button
                                onClick={() => {
                                    if (!isSearchOpen) setIsMobileMenuOpen(false);
                                    setIsSearchOpen(!isSearchOpen);
                                }}
                                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-foreground/80 hover:text-primary"
                                aria-label="Search"
                            >
                                <SearchIcon className="w-5 h-5" />
                            </button>

                            <ThemeToggle />
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center gap-2 lg:hidden">
                            <button
                                onClick={() => {
                                    if (!isMobileMenuOpen) setIsSearchOpen(false);
                                    setIsMobileMenuOpen(!isMobileMenuOpen);
                                }}
                                className="lg:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
                                aria-label="Toggle menu"
                            >
                                <div className="w-6 h-5 flex flex-col justify-between">
                                    <span
                                        className={`block h-0.5 w-full transition-transform duration-300 bg-foreground ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}
                                    />
                                    <span
                                        className={`block h-0.5 w-full transition-opacity duration-300 bg-foreground ${isMobileMenuOpen ? 'opacity-0' : ''}`}
                                    />
                                    <span
                                        className={`block h-0.5 w-full transition-transform duration-300 bg-foreground ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}
                                    />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[60] bg-background/60 dark:bg-slate-900/70 flex flex-col h-[100dvh] touch-none"
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    >


                        <div className="flex-1 flex flex-col items-center justify-start pt-32 space-y-8 overflow-y-auto w-full">
                            {navLinks.map((link, index) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ delay: index * 0.1, duration: 0.4 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={(e) => scrollToSection(e, link.href)}
                                        className="text-3xl font-bold tracking-tight text-foreground/80 hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ delay: navLinks.length * 0.1, duration: 0.4 }}
                            >
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setTimeout(() => setIsSearchOpen(true), 150);
                                    }}
                                    className="text-3xl font-bold tracking-tight text-foreground/80 hover:text-primary transition-colors flex items-center justify-center gap-3 w-full"
                                >
                                    Search
                                    <SearchIcon className="w-8 h-8 opacity-70" />
                                </button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ delay: (navLinks.length + 1) * 0.1, duration: 0.4 }}
                                className="pt-8"
                            >
                                <ThemeToggle />
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
