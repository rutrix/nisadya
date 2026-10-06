// Self-check for src/lib/core.mjs, src/lib/privacy.mjs and src/data/venue-map.json. Run: npm run check
import assert from 'node:assert/strict';
import { canOptimise, directionsUrl, driveDownload, fitLine, isEmail, readTab, fitTitle, driveImage, hhmm, isFinal, isFixed, istTime, isoDate, parseCSV, schemaDate, parsePlaces, phaseAt, placeOnMap, resolveTab, slug, sniff, toRecords } from '../src/lib/core.mjs';
import { findPrivate, sheetNames } from '../src/lib/privacy.mjs';
import MAP from '../src/data/venue-map.json' with { type: 'json' };

// CSV: quotes, escaped quotes, line breaks inside a cell, CRLF, empty trailing cells, blank rows
assert.deepEqual(parseCSV('a,b,c\r\n"x, y","say ""hi""",\n"line1\nline2",,z\n,,\n'), [
  ['a', 'b', 'c'],
  ['x, y', 'say "hi"', ''],
  ['line1\nline2', '', 'z'],
]);
assert.deepEqual(toRecords(parseCSV(' Key ,VALUE\nevent_name, Nisadya \n')), [{ key: 'event_name', value: 'Nisadya' }]);
assert.deepEqual(toRecords(parseCSV('key,,value,final\nevent_name,x,Nisadya,TRUE')), [{ key: 'event_name', value: 'Nisadya', final: 'TRUE' }]); // a blank header column

// final marker
for (const v of ['TRUE', 'true', 'yes', 'Y', '1', ' TRUE ']) assert.equal(isFinal(v), true, v);
for (const v of ['FALSE', '', 'no', '0', undefined]) assert.equal(isFinal(v), false, String(v));
assert.equal(isFixed([]), false);
assert.equal(isFixed([{ final: 'TRUE' }, { final: 'FALSE' }]), false);
assert.equal(isFixed([{ final: 'TRUE' }, { final: 'true' }]), true);

const baked = [{ key: 'a', value: 'baked', final: 'TRUE' }, { key: 'b', value: 'old', final: 'FALSE' }];
const live = [{ key: 'a', value: 'edited', final: 'TRUE' }, { key: 'b', value: 'new', final: 'FALSE' }, { key: 'c', value: 'added' }];
assert.deepEqual(resolveTab('settings', baked, live).map((r) => r.value), ['baked', 'new', 'added']);
assert.deepEqual(resolveTab('settings', baked, [{ key: 'b', value: 'new' }]).map((r) => r.value), ['new', 'baked']);
assert.equal(resolveTab('settings', baked, []), baked); // resolveTab does not trust an empty live settings tab
assert.equal(resolveTab('settings', baked, null), baked); // failed read
const liveEvents = [{ id: 'x', name: 'X' }];
assert.equal(resolveTab('events', [{ id: 'x', name: 'old', final: 'FALSE' }], liveEvents), liveEvents); // no final row
// a final row in any tab comes from the baked copy, in the place of its live row
const bEv = [{ id: 'a', name: 'A baked', final: 'TRUE' }, { id: 'b', name: 'B baked', final: 'FALSE' }];
const lEv = [{ id: 'c', name: 'C' }, { id: 'a', name: 'A edited', final: 'TRUE' }, { id: 'b', name: 'B new' }];
assert.deepEqual(resolveTab('events', bEv, lEv).map((r) => r.name), ['C', 'A baked', 'B new']);
assert.deepEqual(resolveTab('events', bEv, [{ id: 'b', name: 'B new' }]).map((r) => r.name), ['B new', 'A baked']); // deleted live
assert.deepEqual(resolveTab('events', bEv, []).map((r) => r.name), ['A baked']); // empty live tab: only the final rows
assert.deepEqual(resolveTab('events', [{ id: 'a', name: 'A', final: 'FALSE' }], [{ id: 'a', name: 'A2', final: 'TRUE' }]).map((r) => r.name), ['A2']); // final only after the next build
// the paragraphs under one page heading are one group: final only when every paragraph is final
const bPg = [{ page: 'p', heading: 'H', text: '1', final: 'TRUE' }, { page: 'p', heading: 'H', text: '2', final: 'TRUE' }, { page: 'p', heading: 'K', text: '3', final: 'TRUE' }, { page: 'p', heading: 'K', text: '4', final: 'FALSE' }];
const lPg = [{ page: 'p', heading: '', text: 'lead' }, { page: 'p', heading: 'H', text: '1 edited' }, { page: 'p', heading: 'H', text: '2' }, { page: 'p', heading: 'H', text: 'added' }, { page: 'p', heading: 'K', text: '3 edited' }];
assert.deepEqual(resolveTab('pages', bPg, lPg).map((r) => r.text), ['lead', '1', '2', '3', '4']); // one final paragraph fixes its section
// rows are named as the site names them: slugged ids, ISO dates and HH:MM times
assert.deepEqual(resolveTab('events', [{ id: 'MERX', name: 'baked', final: 'TRUE' }], [{ id: 'merx', name: 'edited' }]).map((r) => r.name), ['baked']);
const bSc = [{ date: '13/11/2026', start: '9:30', venue: 'Hall', event_id: 'merx', final: 'TRUE' }];
assert.deepEqual(resolveTab('schedule', bSc, [{ date: '2026-11-13', start: '09:30', venue: 'Hall', event_id: 'MERX', final: 'TRUE' }]), bSc);
assert.equal(slug(' Case Study 1 '), 'case-study-1');

// dates and times are India time whatever the server zone
assert.equal(isoDate('13/11/2026'), '2026-11-13');
assert.equal(isoDate('2026-11-3'), '2026-11-03');
assert.equal(isoDate('Nov 13'), '');
assert.equal(hhmm('9:30'), '09:30');
assert.equal(hhmm('14:05:00'), '14:05');
assert.equal(hhmm('2:30 PM'), '14:30');
assert.equal(hhmm('12:00 am'), '00:00');
assert.equal(hhmm('25:00'), '');
assert.equal(istTime('2026-11-13'), Date.parse('2026-11-12T18:30:00Z'));
assert.equal(istTime('13/11/2026', '09:00'), Date.parse('2026-11-13T03:30:00Z'));
assert.equal(schemaDate('2026-11-13'), '2026-11-13');
assert.equal(schemaDate('2026-11-13 10:00'), '2026-11-13T10:00:00+05:30');
assert.equal(schemaDate('TBD'), '');
assert.equal(istTime('2026-11-13 10:15', '09:00'), Date.parse('2026-11-13T04:45:00Z'));
assert.equal(istTime('2026-11-13 2:30 PM'), Date.parse('2026-11-13T09:00:00Z'));
assert.equal(istTime(''), null);

// phases
const s = { registration_open: '2026-10-01', registration_close: '2026-10-31', event_start: '2026-11-13', event_end: '2026-11-14' };
const at = (iso) => phaseAt(Date.parse(iso), s);
assert.equal(at('2026-09-30T12:00:00+05:30').phase, 'soon');
assert.equal(at('2026-10-01T00:00:00+05:30').phase, 'open');
assert.equal(at('2026-10-31T23:59:00+05:30').phase, 'open'); // the close date is the last open day
assert.equal(at('2026-10-31T23:59:00+05:30').target, Date.parse('2026-11-01T00:00:00+05:30'));
assert.equal(at('2026-11-01T00:00:00+05:30').phase, 'closed');
assert.equal(at('2026-11-13T08:59:00+05:30').phase, 'closed');
assert.equal(at('2026-11-13T09:00:00+05:30').phase, 'live');
assert.equal(at('2026-11-14T23:59:00+05:30').phase, 'live');
assert.equal(at('2026-11-15T00:00:00+05:30').phase, 'ended');
assert.equal(phaseAt(0, { event_start: '2026-11-13' }).phase, 'soon'); // no registration dates
assert.equal(phaseAt(Date.parse('2026-11-14T00:00:00+05:30'), { event_start: '2026-11-13' }).phase, 'ended'); // one-day event
assert.equal(phaseAt(0, { registration_close: '2026-10-31', event_start: '2026-11-13' }).phase, 'soon'); // no open date: not open yet
// a time in a date cell does not move the end of that day
const timed = { registration_open: '2026-10-01', registration_close: '2026-10-31 18:00', event_start: '2026-11-13 10:00' };
assert.equal(phaseAt(Date.parse('2026-11-01T12:00:00+05:30'), timed).phase, 'closed');
assert.equal(phaseAt(Date.parse('2026-11-13T09:59:00+05:30'), timed).phase, 'closed');
assert.equal(phaseAt(Date.parse('2026-11-13T10:00:00+05:30'), timed).phase, 'live');
assert.equal(phaseAt(Date.parse('2026-11-14T00:00:00+05:30'), timed).phase, 'ended');

// Drive links
const id = '1aIR3Y9QXJZ8E8eG2rquYECnUoL07Mxsz';
assert.equal(driveImage(`https://drive.google.com/file/d/${id}/view?usp=sharing`), `https://lh3.googleusercontent.com/d/${id}`);
assert.equal(driveDownload(`https://drive.google.com/open?id=${id}`), `https://drive.google.com/uc?export=download&id=${id}`);
assert.equal(driveImage('https://example.com/a.png'), 'https://example.com/a.png');

// optimiser sources: must match images.remotePatterns in next.config.js
assert.equal(canOptimise('/hero/a.webp'), true);
assert.equal(canOptimise(driveImage(`https://drive.google.com/file/d/${id}/view`)), true);
for (const src of ['//evil.example/a.png', '/\\evil.example/a.png', 'https://lh3.googleusercontent.com/a/x', 'https://example.com/a.png', 'TBD'])
  assert.equal(canOptimise(src), false, src);

// file types: sniff must never accept an HTML page from Drive as media
const bytes = (s) => Uint8Array.from(s, (c) => c.charCodeAt(0));
assert.equal(sniff(bytes('\u0089PNG\r\n\u001a\n')), '.png');
assert.equal(sniff(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0])), '.jpg');
assert.equal(sniff(bytes('\0\0\0\u0018ftypisom')), null); // MP4 video: the site uses no video
assert.equal(sniff(bytes('\0\0\0\u001cftypavif')), '.avif');
assert.equal(sniff(bytes('\0\0\0\u0018ftypheic')), null); // iPhone photo
assert.equal(sniff(bytes('\0\0\0\u0014ftypqt  ')), null); // QuickTime
assert.equal(sniff(bytes('<?xml version="1.0"?><!-- map --><svg viewBox="0 0 1 1">')), '.svg');
assert.equal(sniff(bytes('<!DOCTYPE html><html><body><svg></svg>')), null);
assert.equal(sniff(bytes('Google Drive - Virus scan warning')), null);

// venue places: the parser skips bad lines, the label sits on the right by default, and only numbers reach the URL
assert.deepEqual(parsePlaces('DoMS | 10.761453, 78.816896 | Above\nno coordinates\nGate|10.75,78.81\n | 1,2\nX | 1, 2 | sideways\nY | 10.7 78.8\nZ | 1,2; alert(1)'), [
  { name: 'DoMS', lat: 10.761453, lon: 78.816896, side: 'above' },
  { name: 'Gate', lat: 10.75, lon: 78.81, side: 'right' },
  { name: 'X', lat: 1, lon: 2, side: 'right' },
]);
assert.deepEqual(parsePlaces(undefined), []);
const box = { north: 10, south: 0, east: 20, west: 10 };
assert.deepEqual(placeOnMap(box, 5, 12.5), { x: 25, y: 50 });
assert.deepEqual(placeOnMap(box, 10, 10), { x: 0, y: 0 });
assert.equal(placeOnMap(box, 11, 15), null);
assert.equal(placeOnMap(box, 5, 9.99), null);
assert.equal(directionsUrl(10.756873, 78.813229), 'https://www.google.com/maps/dir/?api=1&destination=10.756873,78.813229');
// the generated maps hold the venue, the gate and the shopping centre
for (const m of [MAP.desktop, MAP.mobile]) for (const [lat, lon] of [[10.761453, 78.816896], [10.756873, 78.813229], [10.761171, 78.81887]]) assert.ok(placeOnMap(m, lat, lon), `${m.src} ${lat},${lon}`);

// banner titles: short names stay on one line at the cap, long names split near the middle, one long word never splits
assert.deepEqual(fitTitle('MERX'), { lines: ['MERX'], size: 16 });
assert.deepEqual(fitTitle('CHANAKYA'), { lines: ['CHANAKYA'], size: 13.75 });
assert.deepEqual(fitTitle('THE MANAGEMENT AUCTION'), { lines: ['THE MANAGEMENT', 'AUCTION'], size: 8.24 });
assert.deepEqual(fitTitle('STRATEGY SPRINT'), { lines: ['STRATEGY', 'SPRINT'], size: 13.75 });
assert.deepEqual(fitTitle('  campus   quest '), { lines: ['campus', 'quest'], size: 16 });
assert.deepEqual(fitTitle('ENTREPRENEURSHIP').lines, ['ENTREPRENEURSHIP']);
assert.ok(fitTitle('A').size <= 16 && fitLine('BEST MANAGER EVENT', 5) === 5);
assert.deepEqual(fitTitle(undefined).lines, ['']);

// required columns
assert.deepEqual(readTab('schedule', 'date,start,end,venue,event_id,title,final'), []); // header only: a valid empty tab
assert.equal(readTab('events', ''), null); // empty reply
assert.equal(readTab('events', 'x_id,x_name\nmerx,MERX'), null); // renamed header
assert.equal(readTab('settings', 'Settings for the site\nkey,value\nevent_name,Nisadya'), null); // a row above the header
assert.deepEqual(readTab('settings', ' Key ,VALUE\nevent_name,Nisadya'), [{ key: 'event_name', value: 'Nisadya' }]);
assert.equal(readTab('pages', 'page,heading\nabout,Hi'), null); // the text column is missing

// email addresses for mailto: links
assert.equal(isEmail('nisadya@nitt.edu'), true);
for (const v of ['nisadya@nitt.edu?bcc=x' + '@y.z', 'mail me', 'a@b', '', ' nisadya@nitt.edu']) assert.equal(isEmail(v), false, v);

// privacy: the patterns of the pre-commit hook (src/lib/privacy.mjs).
// The helper j joins the test data from parts. Thus this file holds no whole phone number or email
// address, and it passes the hook. The names are fictional.
const j = (...p) => p.join('');
for (const [line, want] of [
  [j('Call 98765', ' 43210 today'), ['phone']],
  [j('Call +91 98765', '-43210'), ['phone']],
  [j('Office 0431 250', '3000'), ['phone']],
  [j('Abroad: +1 415', ' 555 0100'), ['phone']],
  [j('Write to a.b+fest', '@gmail.com'), ['email']],
  ['Email nisadya@nitt.edu.', []],
  [j('SHEET_ID=2PACX', '-', 'a'.repeat(30)), ['sheet-id']],
  ['studio-6468512058-1f678', []],
  ['2026-11-13 10:00', []],
  ['DoMS | 10.761453, 78.816896', []],
  ['https://unstop.com/college-fests/nisadya-trichy-434644', []],
  [`https://drive.google.com/file/d/${id}/view`, []],
  [j('short +91 987', '65'), []],
])
  assert.deepEqual(findPrivate(line, []), want, line);
assert.deepEqual(findPrivate(j('Ring 98765', ' 43210 or mail x', '@y.co'), []), ['email', 'phone']);
assert.deepEqual(findPrivate('Coordinator: Test Person.', ['TEST PERSON']), ['name']);
assert.deepEqual(findPrivate('Testpersonal and nisadya@nitt.edu, studio-6468512058-1f678', ['TEST PERSON', 'Test']), []);
assert.deepEqual(findPrivate(j('<image href="data:image/png;base64,AAAA98765', '43210+/AA"/>'), []), []);
assert.deepEqual(sheetNames({ events: [{ coordinators: 'Al, Cee\nDee' }, { coordinators: '' }], contacts: [{ name: 'Eve Smith' }] }), ['Cee', 'Dee', 'Eve Smith']);

console.log('check: all assertions passed');
