# nisadya.in

This repo holds the website of Nisadya, the annual business fest of the
Department of Management Studies, NIT Tiruchirappalli.

## What it is

Firebase App Hosting renders this Next.js 15 site on the server. There is no
database, no login and no secret. The editable content comes from one
published Google Sheet with six tabs. `sheet.json` holds the gid of each tab.
The published ID of the sheet stays out of git, because anyone with it can read
every published tab. The environment variable `SHEET_ID` holds it: in the App
Hosting console for each backend, and in `.env.local` on a local machine.

| Tab | What it controls | Columns it must keep |
|---|---|---|
| settings | name, dates, registration link, venue, contact details, social links, share image | key, value |
| events | the event cards and event pages | id, name |
| schedule | the timetable on /events | date, start |
| faq | the questions on the home page | question, answer |
| pages | the About, Guide, Privacy policy and Terms pages | page, text |
| contacts | the contact list on the Guide page | name |

A tab can lose one of its required columns: a person renames the column, puts
a row above the header or clears the tab. The site then ignores that tab and
uses the last good read or the baked copy. A build on App Hosting stops (see
the section on the baked copy). These effects continue until a person repairs
the header.

## Edit the content

Edit the sheet. A change to the sheet needs no deploy. It appears on the site
within about a minute. Write a date as `YYYY-MM-DD`, or as `YYYY-MM-DD HH:MM`
with a time. For an image, use a Google Drive link. Share the file as "Anyone
with the link".

A row whose `final` cell is TRUE comes from the build copy. The site does not
read it from the live sheet, so a change to it shows only after the next
deploy. Some details:

- Rows with the same name form a group, and a group with a final row comes
  whole from the build copy. The name of a row: settings `key`; events `id`;
  schedule `date`, `start`, `venue`, `event_id` and `title`; faq `question`;
  pages `page` and `heading`; contacts `group` and `name`. Thus one final
  paragraph under a page heading fixes the whole section.
- Do not change the name of a final row. Until the next deploy, the site shows
  both the old row and the new one.
- A change to the `final` cell itself takes effect at the next deploy.
- When every row of a tab is final, the site does not read that tab from the
  live sheet. A new row there shows only after the next deploy.
- The build copies the Drive image of a final row (share_image in settings,
  poster_url in events), and the site shows that copy.

## The baked copy

`npm run build` and `npm run dev` first run `scripts/bake.mjs`. It copies the
sheet into `src/data/baked.json` and the images of final rows into
`public/media/`.

The site reads the live sheet first. When it cannot read a tab, it uses the
last good read of that tab. When the server has no earlier read, it uses the
baked copy. The site also uses the baked copy for the final rows above, and
when the live settings tab has no data rows. When another live tab has no data
rows, the site shows only its final rows.

Neither path is in git. baked.json holds the whole sheet, with people's names
and phone numbers, and git history is permanent. Every build bakes a fresh
copy.

The bake stops the build when no baked copy exists and one of these is true:

- The bake cannot read the sheet, or `SHEET_ID` is not set.
- A tab lacks a required column.
- The settings tab is empty.

Git ignores the baked copy, so a clean checkout has none. When the build
stops, the last good rollout continues to serve the site.

## Run the site locally

The site requires Node 24.

Put the published ID of the sheet in `.env.local` (git ignores it):

```
SHEET_ID=<published ID>
```

Then run:

```
git config core.hooksPath .githooks
npm ci
npm run dev
```

The first command turns on the privacy check before each commit. It blocks
people's email addresses, phone numbers and names, and a published sheet ID.
Then open http://localhost:3000. `npm run dev` bakes the sheet first. In a
fresh clone, run `npm run bake` (or `npm run dev`) before `npx tsc`, because
the code imports the baked copy. For a production build, run `npm run build`.
Then run `npm start`. `npm run check` runs the self-tests. `npm run lint` runs
the linter.

## Deploy

Two App Hosting backends build the site, in the project that `.firebaserc`
names:

- A push to `staging` deploys the `staging` backend. Only that backend has the
  environment variable `NOINDEX=1`. With it, the site sends
  `X-Robots-Tag: noindex`, so search engines do not list the staging site.
- A push to `main` changes the code of the `studio` backend, which serves
  nisadya.in. Automatic rollouts are off on `studio`, so the change goes live
  only when a person starts a rollout in the console.

Each backend needs `SHEET_ID` in its console settings. `apphosting.yaml` caps
each backend at 10 instances. Never put `NOINDEX` in
that file, because both backends read it.

## Rollback

1. In the Firebase console, open App Hosting, then the backend, then Rollouts.
2. Make the previous rollout live again. You do not need to rebuild the site.
3. Revert the commit on the branch (`git revert`), so the next push does not
   deploy the problem again.

## Credits

Map data © OpenStreetMap contributors (ODbL). Fonts: Pretendard and Aoboshi
One, both under the SIL Open Font License 1.1 (licence files in the repo). The
NIT Tiruchirappalli emblem belongs to the institute.
