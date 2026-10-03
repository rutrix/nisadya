'use client';

import { ThemeProvider } from 'next-themes';
import { MotionConfig } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {/*
             * reducedMotion="user" tells every framer-motion animation to honour
             * the visitor's OS "reduce motion" setting: transform/opacity
             * animations collapse to their end state instead of tweening.
             */}
            <MotionConfig reducedMotion="user">
                {children}
                <Toaster
                    position="bottom-center"
                    reverseOrder={false}
                    toastOptions={{
                        className: '',
                        style: {
                            zIndex: 9999,
                        },
                    }}
                    containerStyle={{
                        zIndex: 9999,
                    }}
                />
            </MotionConfig>
        </ThemeProvider>
    );
}
