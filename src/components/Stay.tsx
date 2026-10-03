'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { SiteConfig } from '@/lib/gsheet';

const Stay = ({ config }: { config?: SiteConfig }) => {
    // Prices come from the CONFIG tab; a blank price drops that tier. No
    // defaults on purpose: the old literals (Feb 26th, 2026 prices, a 2026 form)
    // are wrong for November 2026, so the four stay_* keys go into the sheet
    // before the deploy, and the snapshot refresh before the freeze carries
    // them into the outage path. Each accent is a COMPLETE class string so
    // Tailwind's JIT still sees the literals.
    const tiers = [
        { label: 'Men', price: config?.stay_price_men, accentClass: 'w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400' },
        { label: 'Women', price: config?.stay_price_women, accentClass: 'w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400' },
    ].filter(tier => tier.price);
    // https links only, like registration_link: a bare "forms.gle/abc" pasted into the sheet
    // would resolve against nisadya.in and land on the 404 page.
    const stayForm = /^https:\/\//i.test(config?.stay_form_url || '') ? config?.stay_form_url : '';
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    interface ContactMember {
        name: string;
        number: string;
        description: string;
    }

    let hospitalityContact: ContactMember | null = null;
    try {
        if (config?.members_contacts) {
            const parsed = JSON.parse(config.members_contacts);
            const contacts: ContactMember[] = Array.isArray(parsed) ? parsed : [parsed];
            hospitalityContact = contacts.find(c => c.description.toLowerCase().includes('hospitality')) || null;
        }
    } catch (e) {
        console.error("Failed to parse members_contacts", e);
    }

    return (
        <section id="stay" className="relative py-16 sm:py-20 bg-background overflow-hidden">
            <div className="container-custom relative z-10 px-4" ref={ref}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl mx-auto"
                >
                    {/* Thin top rule */}
                    <div className="h-px bg-foreground/[0.08] dark:bg-white/[0.06] mb-10" />

                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Accommodation</p>

                    <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-4">
                        On-Campus Stay
                    </h3>

                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
                        Limited on-campus accommodation at NIT Trichy is available on a first come, first served basis.
                        {config?.stay_arrival && <> Participants can arrive on <strong className="text-foreground">{config.stay_arrival}</strong>.</>}
                    </p>

                    {tiers.length > 0 && (<>
                    <div className="flex flex-wrap gap-x-12 gap-y-6 mb-8">
                        {tiers.map((tier) => (
                            <div key={tier.label}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={tier.accentClass}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{tier.label}</p>
                                </div>
                                {/* One text child, so React emits no <!-- --> separator before the span. */}
                                <p className="text-3xl font-black text-foreground">{`${tier.price} `}<span className="text-sm font-medium text-muted-foreground">/ 2 days</span></p>
                            </div>
                        ))}
                    </div>

                    {/* Policy — single paragraph, understated */}
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-8">
                        The fee is fixed for a two-day duration and cannot be adjusted for single-day stays.
                        Full payment is required regardless of the length of stay.
                    </p>
                    </>)}

                    {/* Book Accommodation CTA */}
                    {stayForm && (
                    <a
                        href={stayForm}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-solid hover:bg-primary-solid-dark text-white text-sm font-bold rounded-xl transition-[background-color,box-shadow,transform] shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 mb-8"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
                        </svg>
                        Book Accommodation
                    </a>
                    )}

                    {/* Contact — just a link */}
                    <div className="text-xs sm:text-sm text-muted-foreground">
                        <p className="mb-2">Questions? Reach out at:</p>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                            <a
                                href={`mailto:${config?.contact_email || 'nisadya@nitt.edu'}`}
                                className="flex items-center gap-2 text-primary font-semibold hover:underline"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                                    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                                </svg>
                                {config?.contact_email || 'nisadya@nitt.edu'}
                            </a>

                            {hospitalityContact && (
                                <a
                                    href={`tel:${hospitalityContact.number}`}
                                    className="flex items-center gap-2 text-primary font-semibold hover:underline"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 4.5V4.5Z" clipRule="evenodd" />
                                    </svg>
                                    {hospitalityContact.name} ({hospitalityContact.number})
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Thin bottom rule */}
                    <div className="h-px bg-foreground/[0.08] dark:bg-white/[0.06] mt-10" />
                </motion.div>
            </div>
        </section>
    );
};

export default Stay;
