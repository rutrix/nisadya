"use client";
import { useEffect, useState } from 'react';

// DD/MM/YYYY and DD-MM-YYYY to YYYY-MM-DD; every other string is returned
// unchanged. Shared with Hero.tsx, which normalises the same sheet-supplied
// date strings in two more places.
export const toISO = (dateStr: string): string => {
    if (!/^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(dateStr)) return dateStr;
    const [d, m, y] = dateStr.split(/[\/-]/);
    return `${y}-${m}-${d}`;
};

// Isolated so only these four digit tiles re-render every second,
// instead of re-rendering the whole ~460-line Hero component each tick.
const CountdownTimer = ({ heroDate }: { heroDate?: string }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // No hard-coded fallback date. A blank or unparseable hero_date used to
    // fall back to 2026-02-28, a date now in the past, so the four tiles froze
    // at 00 00 00 00. NaN here means "no date to count to" and the component
    // renders nothing at all, leaving the hero's date pill to say what it says.
    // 09:00 IST on the fest day. The offset is pinned because the server runs
    // in UTC on Cloud Run and the visitor's browser in IST; without it the two
    // would disagree on the instant by 5.5 hours.
    const targetDate = heroDate
        ? new Date(`${toISO(heroDate)}T09:00:00+05:30`).getTime()
        : NaN;
    // Once the target has passed the tiles would sit at 00 00 00 00, so the
    // block goes. ponytail: Date.now() at render can mismatch a cached server
    // render for up to a minute around 09:00 IST; React re-renders on the
    // client and the tiles start at zero either way.
    const expired = isNaN(targetDate) || targetDate <= Date.now();

    useEffect(() => {
        if (expired) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft({ days, hours, minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate, expired]);

    if (expired) return null;

    const timeUnits = [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds }
    ];

    // The grid wrapper lives here, not in Hero, so it vanishes with the tiles
    // instead of leaving an empty band with its bottom margin.
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-10 w-full max-w-3xl">
            {timeUnits.map((unit) => (
                <div
                    key={unit.label}
                    className="glass group hover:bg-white/90 dark:hover:bg-slate-800/90 p-3 md:p-5 rounded-2xl flex flex-col items-center justify-center transition-[background-color,transform] duration-300 transform hover:-translate-y-2 border-t border-white/40 dark:border-white/10"
                >
                    <span className="text-2xl md:text-4xl lg:text-5xl font-black text-primary dark:text-primary-light mb-1 font-mono">
                        {String(unit.value).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] md:text-xs uppercase tracking-wider font-semibold text-secondary/80 dark:text-secondary-light/80">
                        {unit.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default CountdownTimer;
