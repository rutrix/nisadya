'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Throttle with requestAnimationFrame so we do at most one read per
        // paint frame, and only re-render when visibility actually flips.
        let rafId: number | null = null;
        let lastVisible = false;
        const toggleVisibility = () => {
            if (rafId !== null) return; // an update is already scheduled
            rafId = window.requestAnimationFrame(() => {
                rafId = null;
                const visible = window.scrollY > 300; // layout read inside rAF
                if (visible !== lastVisible) {
                    lastVisible = visible;
                    setIsVisible(visible);
                }
            });
        };

        // passive tells the browser we never call preventDefault on scroll.
        window.addEventListener('scroll', toggleVisibility, { passive: true });
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
            if (rafId !== null) window.cancelAnimationFrame(rafId);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 bg-gradient-to-br from-primary to-primary-dark text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl z-40 hover:shadow-2xl transition-shadow"
                    aria-label="Back to top"
                >
                    ↑
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default BackToTop;
