'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SiteConfig, getDriveImage } from '@/lib/gsheet';



const Footer = ({ config }: { config?: SiteConfig }) => {


    interface ContactMember {
        name: string;
        number: string;
        description: string;
    }

    let memberContacts: ContactMember[] = [];
    try {
        if (config?.members_contacts) {
            const parsed = JSON.parse(config.members_contacts);
            memberContacts = Array.isArray(parsed) ? parsed : [parsed];
        }
    } catch (e) {
        console.error("Failed to parse members_contacts", e);
    }

    const quickLinks = [
        { name: 'Home', href: '#home' },
        { name: 'Events', href: '#events' },
        { name: 'Schedule', href: '#schedule' },
    ];

    // `d` is the icon path; all four render inside the same svg wrapper below.
    const socialLinks = [
        { name: 'Instagram', href: config?.contact_instagram, d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
        { name: 'Twitter', href: config?.contact_twitter, d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
        { name: 'LinkedIn', href: config?.contact_linkedin, d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
        { name: 'YouTube', href: config?.contact_youtube, d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
    ].filter(link => link.href); // Filter out links that are undefined or empty string

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <footer className="relative bg-slate-900 text-white overflow-hidden pt-20 pb-10">
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none">
                {/* radial-gradient glows replace filter:blur(100px) orbs (cheaper to paint) */}
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--primary) 20%, transparent) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--secondary) 20%, transparent) 0%, transparent 70%)' }} />
            </div>

            <div className="container-custom px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-8 mb-16">
                    {/* Brand Section */}
                    <div className="md:col-span-2 xl:col-span-2 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="relative w-14 h-14 md:w-16 md:h-16">
                                <Image
                                    src="/college_logo.png"
                                    alt="College Logo"
                                    fill
                                    sizes="(max-width: 768px) 56px, 64px"
                                    className="object-contain object-left"
                                />
                            </div>
                            <div className="w-[1px] h-10 bg-white/20" />
                            <Link href="#home" className="block relative w-40 h-14 md:w-48 md:h-16">
                                <Image
                                    src={config?.logo_url ? getDriveImage(config.logo_url) : "/fest_main_logo.png"}
                                    alt="Nisadya Logo"
                                    fill
                                    sizes="(max-width: 768px) 160px, 192px"
                                    className="object-contain object-left brightness-0 invert"
                                />
                            </Link>
                        </div>
                        <p className="text-slate-400 max-w-md leading-relaxed text-lg">
                            Nisadya is the annual cultural and technical fest that celebrates talent, creativity, and innovation. Join us for an unforgettable experience!
                        </p>
                        <div className="flex gap-4 pt-4">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.name}
                                    href={social.href!}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    className="w-12 h-12 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 rounded-full flex items-center justify-center transition-colors duration-300 text-slate-400 hover:text-primary"
                                    aria-label={social.name}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d={social.d} />
                                    </svg>
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-6 text-white inline-block border-b-2 border-primary pb-1">Quick Links</h3>
                        <ul className="space-y-4">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        onClick={(e) => scrollToSection(e, link.href)}
                                        className="text-slate-400 hover:text-white hover:translate-x-2 transition-[color,transform] duration-300 inline-flex items-center gap-2 group"
                                    >
                                        <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Dynamic Team Contacts */}
                    {memberContacts.length > 0 && (
                        <div className="md:col-span-2 xl:col-span-2">
                            <h3 className="text-xl font-bold mb-6 text-white inline-block border-b-2 border-primary pb-1">Team Contacts</h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                {memberContacts.map((contact, idx) => (
                                    <li key={idx} className="flex flex-col">
                                        <span className="text-white font-medium">{contact.name}</span>
                                        <span className="text-xs text-primary/80 uppercase tracking-wider mb-1">{contact.description}</span>
                                        <a
                                            href={`tel:${contact.number}`}
                                            className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                                        >
                                            <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {contact.number}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-6 text-white inline-block border-b-2 border-primary pb-1">Contact Us</h3>
                        <ul className="space-y-6 text-slate-400">
                            <li className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <span className="pt-2">
                                    {(config?.contact_location || 'University Campus,\nTech City, India - 560000')
                                        .split('\n')
                                        .map((line, i, arr) => (
                                            <span key={i}>
                                                {line}
                                                {i < arr.length - 1 && <br />}
                                            </span>
                                        ))}
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <a href={`mailto:${config?.contact_email || 'nisadya@nitt.edu'}`} className="hover:text-primary transition-colors">
                                    {config?.contact_email || 'nisadya@nitt.edu'}
                                </a>
                            </li>

                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="border-t border-white/10 pt-8 space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
                        <p>
                            © {new Date().getFullYear()} Nisadya. All rights reserved.
                        </p>
                        <a
                            href={config?.unstop_url || "https://unstop.com"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <span className="text-xs font-medium uppercase tracking-wider">Powered by</span>
                            <Image
                                src="/Unstop-Logo-Blue-Large.png"
                                alt="Unstop"
                                width={80}
                                height={24}
                                className="object-contain brightness-0 invert opacity-70 hover:opacity-100 transition-opacity"
                            />
                        </a>
                        <div className="flex items-center gap-6">
                            <Link href="/policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
