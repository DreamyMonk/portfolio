# Data Engineering Portfolio

Next.js + three.js portfolio with two modes:

- **Pro** — a "data catalog": engineering-paper grid, serif + mono type, schema sidebar,
  animated lineage diagram, Gantt-style career timeline, contact as SQL. Follows system light/dark.
- **Fun** — the page is a pipeline run. Every section is a task in a DAG: when you reach it
  (or hit ▶ Trigger DAG) it streams meme-laced logs, fills a progress bar, then unfolds.
  Downstream tasks wait for upstream ones, and "clear & rerun" works like Airflow's.
  Raw values drift across the background and come out clean past the `dbt run` line,
  there's a poke-able CSS `prod_db`, a boot screen, a packet cursor trail, and hidden
  easter eggs — including 8 data-engineering memes that pop up as stickers. No 3D / WebGL.

```bash
npm install
npm run dev     # http://localhost:3000  (add ?mode=fun to open in fun mode)
```

## Make it yours
All content lives in `lib/data.ts` (memes in `lib/memes.ts`) — name, links, bio, stats, experience, projects, skills.
Drop a PDF in `public/` and set `profile.resume` to show a Resume button.

## Easter eggs (spoilers)
1. Konami code (↑↑↓↓←→←→BA) → `DROP TABLE production` chaos mode
2. Press `` ` `` (or click the `~` in the fun footer) → secret terminal
3. Click the logo 5× fast → a rubber duck waddles in (click it for debugging advice)
4. Run `hire()` in the browser devtools console
5. In the terminal: `sudo hire-me`
6. Click `prod_db` in the fun hero 3× → it springs a leak
7. Click the "rows processed" counter → INT32 overflow
8. Type `party` anywhere → disco mode
9. Type `gravity` anywhere → the page falls apart (briefly)
10. Scroll to the very end → EOF, offset committed
11. Type `fine` → the page catches fire (this is fine)
12. Find a hidden meme → they pop up as stickers:
    - `↻ clear & rerun` any task → Drake
    - click the tech-stack ticker → expanding brain
    - click the **Bash**, **Postgres** or **Kafka** skill tags → three more
    - type `null` → too afraid to ask
    - terminal: `select * from prod` → one does not simply
    - type `fine` → this is fine
13. Collect all 8 memes → memelord

The 🥚 counter in fun mode shows hints for the ones you haven't found.
