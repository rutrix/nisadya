'use client';

import { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from 'next-themes';

// No L.Icon.Default config here: the only <Marker> below always gets an
// explicit icon={icon} from L.divIcon, so the default icon is never built.

// Location Data for NIT Trichy
const LOCATIONS = [
    { name: 'NITT Main Gate', lat: 10.75687, lng: 78.81331, color: '#f59e0b', type: 'Entry', info: 'Main entrance to the campus from NH83.' },
    { name: 'Admin Block', lat: 10.75895, lng: 78.81324, color: '#f97316', type: 'Admin', info: 'Director\'s office and administrative sections.' },
    { name: 'Barn Hall', lat: 10.75932, lng: 78.81329, color: '#3b82f6', type: 'Venue', info: 'The iconic main venue for major fest events.' },
    { name: 'Orion', lat: 10.75975, lng: 78.81079, color: '#8b5cf6', type: 'Lecture', info: 'Modern lecture hall complex.' },
    { name: 'LHC', lat: 10.76101, lng: 78.81417, color: '#ec4899', type: 'Lecture', info: 'New Lecture Hall Complex for classes.' },
    { name: 'Octagon', lat: 10.76054, lng: 78.81483, color: '#06b6d4', type: 'Comp Lab', info: '24/7 Computer Center & Internet usage.' },
    { name: 'Ojas (EEE)', lat: 10.76116, lng: 78.80891, color: '#10b981', type: 'Dept', info: 'Electrical & Electronics Engineering Dept.' },
    { name: 'Sports Complex', lat: 10.75770, lng: 78.81666, color: '#ef4444', type: 'Sports', info: 'Stadium, indoor stadium, and gym facilities.' },
    { name: 'NITT Hospital', lat: 10.76262, lng: 78.81886, color: '#f43f5e', type: 'Medical', info: '24/7 Campus Hospital.' },
];

const CustomMarker = ({ loc }: { loc: any }) => {
    const markerRef = useRef<any>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isSticky, setIsSticky] = useState(false);

    // Generate Custom Icon
    const icon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="
            background-color: ${loc.color};
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 10px ${loc.color}, 0 0 20px ${loc.color}40;
            position: relative;
        ">
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: ${loc.color};
                opacity: 0.2;
                animation: pulse-ring 2s infinite;
            "></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });

    const cancelClose = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    // `close` stays a thunk so the target is resolved when the timer fires,
    // which is what the four separate handlers used to do.
    const scheduleClose = (close: () => void) => {
        if (!isSticky) {
            timeoutRef.current = setTimeout(close, 300);
        }
    };

    return (
        <Marker
            ref={markerRef}
            position={[loc.lat, loc.lng]}
            icon={icon}
            // Accessible name for the role="button" Leaflet puts on every
            // keyboard-enabled marker. `alt` is ignored here: leaflet-src.js
            // 7907 only copies it onto an <img>, and this icon is a divIcon.
            // `title` is copied onto any element (7903) and names it.
            title={loc.name}
            eventHandlers={{
                mouseover: (e) => { cancelClose(); e.target.openPopup(); },
                mouseout: (e) => scheduleClose(() => e.target.closePopup()),
                click: (e) => { setIsSticky(true); cancelClose(); e.target.openPopup(); },
                popupclose: () => setIsSticky(false),
            }}
        >
            <Popup>
                <div
                    className="p-1 min-w-[150px]"
                    onMouseEnter={cancelClose}
                    onMouseLeave={() => scheduleClose(() => markerRef.current?.closePopup())}
                >
                    <span className="text-[10px] font-bold tracking-wider uppercase opacity-70" style={{ color: loc.color }}>
                        {loc.type}
                    </span>
                    <h3 className="font-bold text-white text-sm my-1">{loc.name}</h3>
                    <div className="h-0.5 w-full bg-gradient-to-r from-white/20 to-transparent my-2" />

                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] text-slate-400 leading-snug">
                            {loc.info}
                        </p>
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-white/10 hover:bg-white/20 text-white py-1.5 px-3 rounded-md text-center transition-colors flex items-center justify-center gap-1.5 font-medium"
                        >
                            <span>📍</span> Get Directions
                        </a>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};

// Component to handle map events
const MapEventHandler = ({ onInteraction }: { onInteraction?: (active: boolean) => void }) => {
    useMapEvents({
        dragstart: () => onInteraction?.(true),
        dragend: () => onInteraction?.(false),
        zoomstart: () => onInteraction?.(true),
        zoomend: () => onInteraction?.(false),
    });
    return null;
};

const LeafletMap = ({ onMapInteraction }: { onMapInteraction?: (isInteracting: boolean) => void }) => {
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    // Generate a unique ID for this mount instance to prevent collision
    const [mountId] = useState(() => `map-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        setMounted(true);
        return () => {
            setMounted(false);
        };
    }, []);

    // Determine current theme (account for system preference)
    const currentTheme = theme === 'system' ? resolvedTheme : theme;
    const isDark = currentTheme === 'dark';

    if (!mounted) return null;

    return (
        <MapContainer
            key={`${isDark ? 'dark' : 'light'}-${mountId}`}
            id={mountId}
            center={[10.7610, 78.8139]}
            zoom={16}
            scrollWheelZoom={false}
            className="w-full h-full z-0 bg-background"
        >
            <MapEventHandler onInteraction={onMapInteraction} />
            <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url={isDark
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                }
            />
            {LOCATIONS.map((loc, idx) => (
                <CustomMarker
                    key={idx}
                    loc={loc}
                />
            ))}
        </MapContainer>
    );
};

export default LeafletMap;
