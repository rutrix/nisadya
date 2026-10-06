'use client';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CalendarX, Check, LayoutGrid, List, RotateCcw, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { Block, EventItem } from '@/lib/data';
import { shortDay } from '@/lib/format';
import { Chips, EventCard } from '../EventCard';

type Props = { events: EventItem[]; schedule: Block[] };
const split = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);
const plural = (n: number) => `${new Intl.NumberFormat('en-IN').format(n)} ${n === 1 ? 'event' : 'events'}`;

/** This component reads the URL. It renders inside Suspense. The fallback is EventsView with no parameters. */
export function EventsViewLive(props: Props) {
  // While an event dialog is open the URL is /events/<id>, so keep the query of the list behind it.
  const query = useSearchParams().toString();
  const own = usePathname() === '/events';
  const [kept, setKept] = useState(query);
  if (own && kept !== query) setKept(query);
  return <EventsView {...props} query={own ? query : kept} />;
}

export function EventsView({ events, schedule, query }: Props & { query: string }) {
  const params = new URLSearchParams(query);
  const router = useRouter();
  const pathname = usePathname();
  const hasSchedule = schedule.length > 0;
  const asked = params.get('view');
  const view = asked === 'board' || asked === 'list' ? asked : hasSchedule ? 'board' : 'list';

  const tracks = [...new Set(events.map((e) => e.category).filter(Boolean))].sort();
  const fields = [...new Set(events.flatMap((e) => e.keywords))];
  const selTracks = split(params.get('track')).filter((t) => tracks.includes(t));
  const selFields = split(params.get('field')).filter((f) => fields.includes(f));
  const shown = events.filter(
    (e) => (!selTracks.length || selTracks.includes(e.category)) && (!selFields.length || e.keywords.some((k) => selFields.includes(k))),
  );

  const href = (patch: Record<string, string[] | string | null>) => {
    const q = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      const val = Array.isArray(v) ? v.join(',') : v;
      if (val) q.set(k, val);
      else q.delete(k);
    }
    const s = q.toString();
    return s ? `${pathname}?${s}` : pathname;
  };
  const setFilters = (t: string[], f: string[]) => router.replace(href({ track: t, field: f }), { scroll: false });

  const count = view === 'board' ? new Set(schedule.map((b) => b.eventId).filter(Boolean)).size : shown.length;

  return (
    <div className={`mx-auto w-full max-w-board px-[15px] pt-8 md:px-5 lg:px-10 lg:pt-12 xl:px-[38px] ${view === 'list' ? 'pb-24 lg:pb-[100px]' : 'pb-[100px]'}`}>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[32px] font-bold leading-[48px] md:text-[40px] md:leading-[52px]">Events</h1>
        <div className="flex gap-2 md:gap-4" role="group" aria-label="View">
          {(
            [
              ['board', 'Timetable', LayoutGrid],
              ['list', 'List', List],
            ] as const
          ).map(([v, label, Icon]) => (
            <Link
              key={v}
              href={href({ view: v })}
              scroll={false}
              aria-current={view === v ? 'page' : undefined}
              className={`grid h-11 w-11 place-items-center md:h-12 md:w-12 ${view === v ? 'bg-fg text-bg' : 'bg-surface-subtle'}`}
            >
              <Icon size={22} aria-hidden />
              <span className="sr-only">{label}</span>
            </Link>
          ))}
        </div>
      </div>
      <p className="mt-8 text-[13px] text-fg-muted" aria-live="polite">
        {view === 'board' && !hasSchedule ? '' : plural(count)}
      </p>

      {view === 'board' ? (
        <Board events={events} schedule={schedule} listHref={href({ view: 'list' })} />
      ) : (
        <div className="mt-4 lg:flex lg:items-start lg:gap-[150px]">
          <ListView events={shown} total={events.length} hasSchedule={hasSchedule} onReset={() => setFilters([], [])} />
          <Filters tracks={tracks} fields={fields} selTracks={selTracks} selFields={selFields} onChange={setFilters} />
        </div>
      )}
    </div>
  );
}

function Empty({ icon: Icon, line, hint }: { icon: typeof X; line: string; hint?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-[120px] text-center lg:py-[200px]">
      <Icon className="h-20 w-20 lg:h-[100px] lg:w-[100px]" strokeWidth={1.25} aria-hidden />
      <p className="text-xl font-bold">{line}</p>
      {hint && <p className="text-sm text-fg-muted">{hint}</p>}
    </div>
  );
}

/** Timetable: one section per day, one row per time slot. From 1560px each venue is a column. */
function Board({ events, schedule, listHref }: Props & { listHref: string }) {
  if (schedule.length === 0)
    return (
      <Empty
        icon={CalendarX}
        line="The schedule will be announced soon"
        hint={
          <Link href={listHref} className="underline underline-offset-4">
            See every event in the list
          </Link>
        }
      />
    );
  const byId = new Map(events.map((e) => [e.id, e]));
  const venues = [...new Set(schedule.map((b) => b.venue))].sort();
  const days = new Map<string, Map<string, Block[]>>();
  for (const b of schedule) {
    const slots = days.get(b.date) ?? new Map<string, Block[]>();
    const key = `${b.start}-${b.end}`;
    slots.set(key, [...(slots.get(key) ?? []), b]);
    days.set(b.date, slots);
  }
  const cols = { '--cols': venues.length } as React.CSSProperties;

  return (
    <div className="mt-6 flex flex-col gap-10">
      {[...days].map(([date, slots]) => (
        <section key={date} aria-labelledby={`day-${date}`}>
          <h2 id={`day-${date}`} className="mb-4 text-2xl font-bold">
            {shortDay(date)}
          </h2>
          <div className="hidden border-b border-line-subtle xl:flex" aria-hidden>
            <span className="w-[70px] shrink-0" />
            <div className="grid flex-1 gap-[5px] [grid-template-columns:repeat(var(--cols),minmax(0,1fr))]" style={cols}>
              {venues.map((v) => (
                <span key={v} className="truncate py-2 text-sm font-semibold text-fg-muted">
                  {v || 'Venue to be announced'}
                </span>
              ))}
            </div>
          </div>
          {[...slots].map(([key, blocks]) => {
            const { start, end } = blocks[0];
            const time = end ? `${start}–${end}` : start;
            const plain = blocks.every((b) => !byId.has(b.eventId));
            return (
              <div key={key} className="xl:flex xl:border-b xl:border-line-subtle">
                <div className="sticky top-[var(--header-h)] z-10 flex h-[42px] items-center justify-center bg-surface-subtle text-[15px] font-semibold md:h-14 xl:static xl:h-auto xl:w-[70px] xl:shrink-0 xl:bg-transparent">
                  {time}
                </div>
                {plain ? (
                  <div className="grid h-[100px] place-items-center bg-surface-subtle px-4 text-center font-semibold md:h-[153px] xl:my-[5px] xl:h-16 xl:flex-1 xl:text-xl">
                    {blocks.map((b) => b.title).join(' · ')}
                  </div>
                ) : (
                  <ul
                    className="grid gap-2.5 px-0 py-2.5 md:py-[15px] lg:grid-cols-4 lg:gap-[5px] lg:py-10 xl:flex-1 xl:py-[5px] xl:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
                    style={cols}
                  >
                    {venues.map((v, col) => {
                      const here = blocks.filter((b) => b.venue === v);
                      const at = { '--col': col + 1 } as React.CSSProperties;
                      if (here.length === 0) return <li key={v} aria-hidden className="hidden bg-surface-subtle xl:block xl:[grid-column-start:var(--col)]" style={at} />;
                      return here.map((b, i) => {
                        const e = byId.get(b.eventId);
                        return (
                          <li key={`${v}-${i}`} className="xl:[grid-column-start:var(--col)]" style={at}>
                            {e ? (
                              <EventCard e={e} variant="board" note={b.venue} />
                            ) : (
                              <div className="flex min-h-[200px] flex-col justify-between bg-surface-subtle p-[15px] lg:h-[222px] xl:h-[220px]">
                                <p className="text-lg font-bold lg:text-[15px]">{b.title}</p>
                                <p className="text-[13px] font-bold">{b.venue}</p>
                              </div>
                            )}
                          </li>
                        );
                      });
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

/** List: events grouped by their first time slot. Without a schedule, one group. */
function ListView({ events, total, hasSchedule, onReset }: { events: EventItem[]; total: number; hasSchedule: boolean; onReset: () => void }) {
  if (total === 0) return <Empty icon={CalendarX} line="Events will be announced soon" />;
  if (events.length === 0)
    return (
      <div className="flex-1">
        <Empty
          icon={SearchX}
          line="No event matches these filters"
          hint={
            <button type="button" onClick={onReset} className="underline underline-offset-4">
              Clear the filters to see every event
            </button>
          }
        />
      </div>
    );
  const groups = new Map<string, EventItem[]>();
  // The sort puts the groups in time order. Events with no time come last. Inside a group, the sort keeps the sheet order.
  const when = (e: EventItem) => (e.blocks[0] ? e.blocks[0].date + e.blocks[0].start : '9');
  for (const e of [...events].sort((x, y) => when(x).localeCompare(when(y)))) {
    const b = e.blocks[0];
    const label = !hasSchedule ? '' : b ? `${shortDay(b.date)}, ${b.start}` : 'Time to be announced';
    groups.set(label, [...(groups.get(label) ?? []), e]);
  }
  return (
    <div className="min-w-0 flex-1">
      {[...groups].map(([label, list]) => (
        <section key={label || 'all'} aria-label={label || 'All events'} className="lg:flex lg:gap-[60px] lg:border-b lg:border-line-subtle lg:py-8">
          {!label && <h2 className="sr-only">All events</h2>}
          {label && (
            <h2 className="sticky top-[var(--header-h)] z-10 flex h-[42px] items-center justify-center bg-surface-subtle text-[15px] font-semibold lg:static lg:block lg:h-auto lg:w-[160px] lg:shrink-0 lg:bg-transparent lg:text-2xl">
              {label}
            </h2>
          )}
          <ul className="flex-1">
            {list.map((e) => (
              <li key={e.id} className="relative flex flex-col gap-2 border-b border-surface-subtle px-5 py-[15px] last:border-b-0 lg:px-0 lg:py-6">
                <div className="order-3 lg:order-1">
                  <Chips e={e} />
                </div>
                <h3 className="order-1 text-lg font-bold leading-[27px] lg:order-2 lg:text-2xl lg:leading-9">
                  <Link href={`/events/${e.id}`} scroll={false} className="after:absolute after:inset-0">
                    {e.name}
                  </Link>
                </h3>
                {e.coordinators.length > 0 && (
                  <p className="order-2 text-[13px] lg:order-3 lg:text-[15px]">
                    <span className="font-bold">{e.coordinators.join(', ')}</span>
                    <span className="font-medium text-fg-muted"> · Coordinator{e.coordinators.length > 1 ? 's' : ''}</span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Box({ checked, small }: { checked: boolean; small?: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center border-2 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus ${small ? 'h-4 w-4' : 'h-5 w-5'} ${checked ? 'border-fg bg-fg text-bg' : 'border-fg-secondary'}`}
    >
      {checked && <Check size={small ? 12 : 14} strokeWidth={3} />}
    </span>
  );
}

function Group({ legend, options, selected, onToggle, small }: { legend: string; options: string[]; selected: string[]; onToggle: (v: string) => void; small?: boolean }) {
  if (options.length === 0) return null;
  return (
    <fieldset className="min-w-0">
      <legend className={`font-bold ${small ? 'text-base' : 'text-xl'}`}>
        {legend} <span className="font-semibold text-fg-muted">{selected.length ? `${selected.length} / ${options.length}` : options.length}</span>
      </legend>
      <div className={`mt-3 flex flex-col ${small ? 'gap-2.5' : 'gap-3'}`}>
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <label key={o} className={`flex cursor-pointer items-center gap-2 ${small ? 'text-sm font-medium' : 'font-semibold'} ${on ? 'text-fg' : 'text-fg-muted'}`}>
              <input type="checkbox" className="peer sr-only" checked={on} onChange={() => onToggle(o)} />
              <Box checked={on} small={small} />
              {o}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** Sidebar from 1080px (applies at once). Below 1080px, a floating button opens a drawer with a draft. */
function Filters({ tracks, fields, selTracks, selFields, onChange }: {
  tracks: string[];
  fields: string[];
  selTracks: string[];
  selFields: string[];
  onChange: (t: string[], f: string[]) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState({ t: selTracks, f: selFields });
  const n = selTracks.length + selFields.length;
  const dn = draft.t.length + draft.f.length;
  if (tracks.length === 0 && fields.length === 0) return null;
  const close = () => dialog.current?.close();

  return (
    <>
      <aside aria-label="Filters" className="hidden w-[222px] shrink-0 lg:block">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Filter</h2>
          <button type="button" onClick={() => onChange([], [])} aria-disabled={n === 0} className={`flex items-center gap-1 text-xl font-bold ${n ? 'text-fg' : 'text-fg-muted'}`}>
            <RotateCcw size={22} aria-hidden />
            Reset
          </button>
        </div>
        <div className="mt-6 flex flex-col gap-6 border-t border-line-subtle pt-6">
          <Group legend="Category" options={tracks} selected={selTracks} onToggle={(v) => onChange(toggle(selTracks, v), selFields)} />
          <div className="border-t border-line-subtle pt-6">
            <Group legend="Topic" options={fields} selected={selFields} onToggle={(v) => onChange(selTracks, toggle(selFields, v))} />
          </div>
        </div>
      </aside>

      <button
        type="button"
        className="fixed bottom-8 right-4 z-40 flex h-12 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-brand-fg lg:hidden"
        aria-haspopup="dialog"
        onClick={() => {
          setDraft({ t: selTracks, f: selFields });
          dialog.current?.showModal();
        }}
      >
        <SlidersHorizontal size={14} aria-hidden />
        Filter{n ? ` (${n})` : ''}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="filter-title"
        className="fixed inset-0 m-0 h-full w-full bg-black/50 p-0 lg:hidden"
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <div className="absolute right-0 top-1/2 flex max-h-[90svh] w-[280px] -translate-y-1/2 flex-col bg-bg">
          <div className="flex h-[54px] shrink-0 items-center justify-between border-b border-line-subtle pl-5 pr-2">
            <h2 id="filter-title" className="text-lg font-bold">
              Filter
            </h2>
            <button type="button" className="grid h-11 w-11 place-items-center" aria-label="Close the filters" onClick={close}>
              <X size={16} aria-hidden />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 overflow-y-auto p-5">
            <Group small legend="Category" options={tracks} selected={draft.t} onToggle={(v) => setDraft({ ...draft, t: toggle(draft.t, v) })} />
            <Group small legend="Topic" options={fields} selected={draft.f} onToggle={(v) => setDraft({ ...draft, f: toggle(draft.f, v) })} />
          </div>
          <div className="flex h-[72px] shrink-0 items-center justify-center gap-2 border-t border-line-subtle">
            <button
              type="button"
              autoFocus
              onClick={() => setDraft({ t: [], f: [] })}
              className={`h-12 w-[120px] border-2 font-bold ${dn ? 'border-fg text-fg' : 'border-line-subtle text-fg-muted'}`}
            >
              Reset{dn ? ` (${dn})` : ''}
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(draft.t, draft.f);
                close();
              }}
              className="btn-primary h-12 w-[120px]"
            >
              Apply
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
