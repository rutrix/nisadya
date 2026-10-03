'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamically import the entire map component
const LeafletMap = dynamic(
    () => import('./LeafletMap'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-[#020617] flex items-center justify-center text-white/20 animate-pulse">
                Loading Map...
            </div>
        )
    }
);

// Airport, railway and bus render through one template; only these three
// values differ between them.
const TRANSPORT = [
    { title: 'Airport (TRZ)', d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8", body: '~25km away. Taxi/Cab services readily available to reach the campus.' },
    { title: 'Railway Station', d: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7", body: 'TPJ Junction (~22km). Direct buses to Thuvakudi stop at NIT Main Gate.' },
    { title: 'Bus Terminals', d: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4", body: 'Panjapur Bus Stand (~22km) | Chatram Stand (~18km). Route #128, #100 series to NIT.' },
];

const Maps = ({ taxiContacts }: { taxiContacts?: string }) => {
    const [isMapInteracting, setIsMapInteracting] = useState(false);

    let parsedTaxiContacts: { name: string; number: string }[] = [];
    try {
        if (taxiContacts) parsedTaxiContacts = JSON.parse(taxiContacts);
    } catch (e) {
        console.error("Failed to parse taxi contacts", e);
    }

    return (
        <section id="location" className="relative pt-12 pb-28 bg-slate-100 dark:bg-[#020617] border-y border-black/5 dark:border-white/10 overflow-hidden">
            <div className="container-custom px-4">
                <div className="mb-12 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wider uppercase mb-4">
                        Location
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-foreground">
                        Find Your <span className="text-primary">Way</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-auto lg:h-[720px]">
                    {/* Left Side: Interactive Map */}
                    <motion.div
                        className="lg:col-span-2 h-[400px] lg:h-full relative rounded-3xl overflow-hidden border border-border shadow-2xl group"
                    >
                        {/* Map Overlay Card */}
                        <motion.div
                            initial={{ opacity: 1, y: 0 }}
                            animate={{
                                opacity: isMapInteracting ? 0 : 1,
                                y: isMapInteracting ? 20 : 0,
                                pointerEvents: isMapInteracting ? 'none' : 'auto'
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute bottom-6 left-6 right-6 z-10"
                        >
                            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-border p-5 rounded-2xl shadow-xl flex items-center justify-between">
                                <div>
                                    <h3 className="text-foreground font-bold text-lg">NIT Tiruchirappalli</h3>
                                    <p className="text-muted-foreground text-sm">Tanjore Main Road, NH83</p>
                                </div>
                                <a
                                    href="https://www.google.com/maps/dir/?api=1&destination=10.75687,78.81331"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-5 py-2.5 bg-primary-solid hover:bg-primary-solid-dark text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-primary/25"
                                >
                                    Get Directions
                                </a>
                            </div>
                        </motion.div>

                        <LeafletMap onMapInteraction={setIsMapInteracting} />

                    </motion.div>

                    {/* Right Side: Info Cards */}
                    <div className="lg:col-span-1 flex flex-col gap-3 lg:gap-4 h-full">
                        <div
                            className="bg-card dark:bg-slate-900/50 border border-border p-4 lg:p-5 rounded-3xl flex-1 backdrop-blur-sm"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-foreground font-bold text-base lg:text-lg mb-1">Address</h3>
                                    <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed">
                                        National Institute of Technology,<br />
                                        Tanjore Main Road, NH 83,<br />
                                        Tiruchirappalli - 620015,<br />
                                        Tamil Nadu, India.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Transport Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4 flex-[2]">
                            {/* Taxi Services - Dynamic */}
                            {parsedTaxiContacts.length > 0 && (
                                <div
                                    className="bg-card dark:bg-slate-900/50 border border-border p-4 lg:p-5 rounded-3xl hover:bg-accent/5"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-foreground font-bold">Taxi Services</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {parsedTaxiContacts.map((taxi, index) => (
                                            <p key={index} className="text-muted-foreground text-sm flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full"></span>
                                                {taxi.name}:
                                                <a href={`tel:${taxi.number.replace(/\s/g, "")}`} className="text-foreground hover:text-primary transition-colors font-medium">
                                                    {taxi.number}
                                                </a>
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Airport, Railway, Bus */}
                            {TRANSPORT.map((t) => (
                                <div
                                    key={t.title}
                                    className="bg-card dark:bg-slate-900/50 border border-border p-4 lg:p-5 rounded-3xl hover:bg-accent/5"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.d} />
                                            </svg>
                                        </div>
                                        <h3 className="text-foreground font-bold">{t.title}</h3>
                                    </div>
                                    <p className="text-muted-foreground text-sm">
                                        {t.body}
                                    </p>
                                </div>
                            ))}

                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes pulse-ring {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    50% { opacity: 0.3; }
                    100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
                }
                .leaflet-popup-content-wrapper {
                    background: var(--card) !important;
                    color: var(--foreground) !important;
                    backdrop-filter: blur(8px);
                    border: 1px solid var(--border);
                    border-radius: 12px !important;
                }
                .leaflet-popup-tip {
                    background: var(--card) !important;
                }
            `}</style>
        </section>
    );
};
export default Maps;
