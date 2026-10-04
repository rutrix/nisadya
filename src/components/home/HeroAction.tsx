'use client';
import { RegisterAction, usePhase, type PhaseSettings } from '../Phase';

export function HeroAction({ s, serverNow, url }: { s: PhaseSettings; serverNow: number; url: string }) {
  const p = usePhase(s, serverNow);
  if (p.phase === 'ended') return <p className="text-base font-bold lg:text-2xl">The fest has ended. Thank you for coming.</p>;
  return (
    <div className="pt-1 md:pt-2 lg:pt-2">
      <RegisterAction p={p} url={url} className="h-14 w-[200px] text-base md:w-[270px] lg:h-[70px] lg:w-[320px] lg:text-xl" />
    </div>
  );
}
