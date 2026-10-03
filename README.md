# nisadya.in

The website of Nisadya, the annual business fest of the Department of
Management Studies, NIT Tiruchirappalli.

## What it is

A Next.js site rendered on the server by Firebase App Hosting. There is no
database, no login and no secret. All content comes from one published
Google Sheet, read on every render and cached for a short time:

| Tab | What it drives |
|---|---|
| config | hero text and dates, registration state, contact details, logos |
| events | the event cards and their Unstop links |
| schedule | the day-by-day timetable |

Images are Google Drive share links placed in the sheet.

## Editing content

Edit the sheet. No deploy is needed. Changes appear on the live site within
about a minute. Dates go in as `YYYY-MM-DD`.

## Running it locally

Requires Node 20.9 or newer.

```
npm ci
npm run dev
```

Then open http://localhost:3000. A production build is `npm run build`
followed by `npm start`.

## Deploying

A merge into the `stable` branch starts a build and a rollout on Firebase
App Hosting. There is no staging site: every merge goes to every visitor.

## Rolling back

Firebase console, App Hosting, the `studio` backend, Rollouts: pick the
previous rollout and roll back. No rebuild is needed. Then revert the
commit on `stable` so the next merge does not bring the problem back.
