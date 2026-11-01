'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { experience, profile, projects, skills, type Project } from '@/lib/data';
import { duckTips, memes, pick, type MemeId } from '@/lib/memes';
import { DataFlow } from './DataFlow';
import { ModeToggle } from './ModeToggle';
import { EGG_COUNT, EGG_IDS, EGGS, useEggs, type EggId } from './Providers';

// Fun mode is a pipeline run: every section is a task. A task runs once its upstream task
// has succeeded and you scroll to it (or hit "trigger DAG"), streams its logs, then unfolds.

const HINTS: Record<EggId, string> = {
  konami: '↑ ↑ ↓ ↓ ← → ← → B A',
  terminal: 'The key left of 1 opens a door.',
  duck: 'The logo gets lonely. Click it 5×, fast.',
  devtools: 'Engineers inspect things. Check the console.',
  sudo: 'Some terminal commands need root.',
  spill: 'prod_db says don’t click it. Click it 3×.',
  overflow: 'That row counter looks like an INT…',
  party: 'Just type the word. You know the one. 🪩',
  gravity: 'Type the force Newton discovered.',
  eof: 'Every stream has an end. Find it.',
  fire: 'Type how everything is when prod is down. “This is …”',
  meme: 'Some skill tags are more than tags. Click around.',
  memelord: `Collect all ${memes.length} hidden memes.`,
};

// Hidden meme triggers on skill tags.
const TAG_MEMES: Record<string, MemeId> = { Bash: 'butterfly', Postgres: 'distracted', Kafka: 'proverb' };

type Status = 'queued' | 'running' | 'success';

const TASKS = [
  {
    id: 'extract',
    name: 'extract_about',
    title: "Who's this?",
    logs: ['connecting to brain… OK', 'WARN imposter syndrome detected — ignoring', 'extracted 1 human (schema: caffeinated)'],
  },
  {
    id: 'transform',
    name: 'transform_skills',
    title: 'The toolbox',
    logs: ['dbt build --select +skills', 'INFO it works on my machine ✓', '214 models, 0 errors (suspicious)'],
  },
  {
    id: 'load',
    name: 'load_projects',
    title: 'Shipped pipelines',
    logs: ['MERGE INTO portfolio USING projects …', 'WARN this is fine 🔥', `${projects.length} rows upserted`],
  },
  {
    id: 'runs',
    name: 'backfill_career',
    title: 'Job history',
    logs: ['backfilling career since 2019 …', 'retry 1/3: recruiter has not replied', 'SUCCESS — no gaps in the partition'],
  },
  {
    id: 'serve',
    name: 'serve_contact',
    title: '',
    logs: ['exposing endpoint /hire-me', 'latency p99 < 24h', 'ready to serve 🚀'],
  },
] as const;

const STAT_COLORS = ['#c6ff00', '#ff3d81', '#00f0ff', '#8b5cf6'];

export default function FunPortfolio() {
  const { fx, duck, found, find, logoClick, setTerminalOpen, warehouseClick, showMeme, seenMemes } = useEggs();
  const [showHints, setShowHints] = useState(false);
  const [status, setStatus] = useState<Status[]>(() => TASKS.map(() => 'queued'));
  const [visible, setVisible] = useState<boolean[]>(() => TASKS.map(() => false));
  const [triggered, setTriggered] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const endRef = useRef<HTMLDivElement>(null);
  const runMs = useMemo(
    () => (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 150 : 1500),
    [],
  );
  const stack = skills.flatMap((g) => g.items);

  // Scheduler: run the first unfinished task once it's visible (or the DAG was triggered).
  useEffect(() => {
    const i = status.findIndex((s) => s !== 'success');
    if (i === -1 || status[i] === 'running' || !(visible[i] || triggered)) return;
    setStatus((s) => s.map((v, j) => (j === i ? 'running' : v)));
    timer.current = window.setTimeout(() => setStatus((s) => s.map((v, j) => (j === i ? 'success' : v))), runMs);
  }, [status, visible, triggered, runMs]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && find('eof'), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [find]);

  const setVisibleAt = useCallback(
    (i: number, v: boolean) => setVisible((prev) => (prev[i] === v ? prev : prev.map((x, j) => (j === i ? v : x)))),
    [],
  );

  // Like Airflow's "clear downstream": reset this task and everything after it.
  const rerun = (i: number) => {
    window.clearTimeout(timer.current);
    setTriggered(false);
    setStatus((s) => s.map((v, j) => (j >= i ? 'queued' : v)));
    showMeme('drake');
  };

  const triggerDag = () => {
    setTriggered(true);
    document.getElementById(TASKS[0].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const done = status.filter((s) => s === 'success').length;
  const cls = ['fun', fx.chaos && 'is-chaos', fx.party && 'is-party', fx.gravity && 'is-gravity', fx.fire && 'is-fire']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls}>
      <DataFlow chaos={fx.chaos} party={fx.party} />
      <div className="fun-vignette" aria-hidden />
      <BootScreen />
      <CursorTrail />
      {duck && <Duck />}
      {fx.fire && <Fire />}

      <header className="fun-top">
        <div className="fun-nav">
          <button type="button" className="fun-logo" onClick={logoClick} aria-label="Logo">
            {'{S}'}
          </button>
          <div className="fun-nav-right">
            <button type="button" className="fun-eggs" onClick={() => setShowHints((s) => !s)} aria-expanded={showHints}>
              🥚 {found.length}/{EGG_COUNT}
            </button>
            <ModeToggle />
          </div>
          {showHints && (
            <div className="fun-hints">
              <strong>EASTER EGG HUNT</strong>
              <ul>
                {EGG_IDS.map((id) => (
                  <li key={id} className={found.includes(id) ? 'done' : ''}>
                    {found.includes(id) ? `✔ ${EGGS[id]}` : `? ${HINTS[id]}`}
                    {id === 'memelord' && !found.includes(id) && ` (${seenMemes.length}/${memes.length})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <nav className="dag" aria-label="Pipeline progress">
          <span className="dag-label">
            dag: portfolio · {done}/{TASKS.length}
          </span>
          {TASKS.map((t, i) => (
            <a key={t.id} href={`#${t.id}`} className={`dag-node ${status[i]}`}>
              {status[i] === 'success' ? '✔' : status[i] === 'running' ? '◌' : '○'} {t.name}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section className="fun-hero">
          <div>
            <p className="fun-kicker">
              <span className="fun-live" /> live — {profile.name} / {profile.role}
            </p>
            <h1 className="fun-title" aria-label={fx.chaos ? 'I drop tables.' : 'I move data.'}>
              <Wobble text={fx.chaos ? 'I DROP' : 'I MOVE'} className="line1" />
              <Wobble text={fx.chaos ? 'TABLES.' : 'DATA.'} className="outline" />
            </h1>
            <p className="fun-sub">
              Hi, I&apos;m <b>{profile.name}</b>. {profile.funTagline}
            </p>
            <p className="fun-rows">
              rows processed since you landed: <RowCounter />
            </p>
            <div className="fun-cta">
              <button type="button" className="fun-btn" onClick={triggerDag}>
                ▶ Trigger DAG
              </button>
              <a className="fun-btn ghost" href={`mailto:${profile.email}`}>
                Ping me
              </a>
            </div>
          </div>
          <ProdDb spilling={fx.spill} onPoke={warehouseClick} />
        </section>

        <div className="fun-marquee" aria-hidden onClick={() => showMeme('brain')}>
          <div className="fun-marquee-track">
            {[...stack, ...stack].map((s, i) => (
              <span key={i}>{s} ✦</span>
            ))}
          </div>
        </div>

        <Task index={0} status={status} onVisible={setVisibleAt} onRerun={rerun} runMs={runMs}>
          <div className="fun-about">
            <div className="fun-panel">
              {profile.bio.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="fun-stats">
              {profile.stats.map((s, i) => (
                <div key={s.label} className="fun-stat" style={{ '--c': STAT_COLORS[i % 4] } as CSSProperties}>
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Task>

        <Task index={1} status={status} onVisible={setVisibleAt} onRerun={rerun} runMs={runMs}>
          <div className="fun-skills">
            {skills.map((g) => (
              <div key={g.group} className="fun-panel fun-skill">
                <h3>{g.group}</h3>
                <ul>
                  {g.items.map((t) => (
                    <li key={t} className="fun-tag" onClick={TAG_MEMES[t] ? () => showMeme(TAG_MEMES[t]) : undefined}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Task>

        <Task index={2} status={status} onVisible={setVisibleAt} onRerun={rerun} runMs={runMs}>
          <div className="fun-projects">
            {projects.map((p, i) => (
              <ProjectCard key={p.title} project={p} index={i} />
            ))}
          </div>
        </Task>

        <Task index={3} status={status} onVisible={setVisibleAt} onRerun={rerun} runMs={runMs}>
          <ol className="fun-runs">
            {experience.map((job, i) => (
              <li key={job.company} className="fun-run">
                <div className="fun-run-meta">
                  <span className={`fun-badge${i === 0 ? ' running' : ''}`}>{i === 0 ? '● RUNNING' : '✔ SUCCESS'}</span>
                  <span className="fun-run-period">{job.period}</span>
                </div>
                <div>
                  <h3>
                    {job.role} <span>@ {job.company}</span>
                  </h3>
                  <p>{job.summary}</p>
                  <ul>
                    {job.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </Task>

        <Task index={4} status={status} onVisible={setVisibleAt} onRerun={rerun} runMs={runMs}>
          <h2 className="fun-sql">
            SELECT * FROM {profile.name.toLowerCase()}
            <br />
            WHERE hireable = <mark>TRUE</mark>;
          </h2>
          <div className="fun-cta">
            <a className="fun-btn" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <a className="fun-btn ghost" href={`mailto:${profile.altEmail}`}>
              {profile.altEmail}
            </a>
            <a className="fun-btn ghost" href={profile.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="fun-btn ghost" href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </Task>
      </main>

      <footer className="fun-footer">
        <span>built by {profile.name} with next.js + an unreasonable amount of coffee</span>
        <span>
          psst — {EGG_COUNT} eggs are hidden in this pipeline{' '}
          <button type="button" className="fun-tilde" onClick={() => setTerminalOpen(true)} aria-label="Open terminal">
            ~
          </button>
        </span>
        <div ref={endRef} className="fun-eof">
          — EOF · offset committed —
        </div>
      </footer>
    </div>
  );
}

function Task({
  index,
  status,
  onVisible,
  onRerun,
  runMs,
  children,
}: {
  index: number;
  status: Status[];
  onVisible: (i: number, v: boolean) => void;
  onRerun: (i: number) => void;
  runMs: number;
  children: ReactNode;
}) {
  const task = TASKS[index];
  const state = status[index];
  const ref = useRef<HTMLElement>(null);
  const [lines, setLines] = useState(0);
  const [opened, setOpened] = useState(false);

  // Unclip the body once it has finished unfolding, so shadows and effects can spill out.
  useEffect(() => {
    if (state !== 'success') {
      setOpened(false);
      return;
    }
    const t = window.setTimeout(() => setOpened(true), 850);
    return () => window.clearTimeout(t);
  }, [state]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => onVisible(index, e.isIntersecting), { rootMargin: '0px 0px -25% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [index, onVisible]);

  // Stream the log lines while running.
  useEffect(() => {
    if (state === 'queued') {
      setLines(0);
      return;
    }
    if (state === 'success') {
      setLines(task.logs.length);
      return;
    }
    const step = runMs / (task.logs.length + 1);
    const timers = task.logs.map((_, i) => window.setTimeout(() => setLines(i + 1), step * (i + 1)));
    return () => timers.forEach(window.clearTimeout);
  }, [state, runMs, task.logs]);

  const upstream = index > 0 ? TASKS[index - 1].name : null;
  const waiting = upstream && status[index - 1] !== 'success';

  return (
    <section id={task.id} ref={ref} className={`task ${state}${opened ? ' opened' : ''}`} style={{ '--run': `${runMs}ms` } as CSSProperties}>
      <div className="task-inner">
        <header className="task-head">
          <span className="task-n">{String(index + 1).padStart(2, '0')}</span>
          <code className="task-name">{task.name}</code>
          <span className="task-state">{state === 'success' ? '✔ success' : state === 'running' ? '◌ running' : '○ queued'}</span>
          {state === 'success' && (
            <button type="button" className="task-rerun" onClick={() => onRerun(index)}>
              ↻ clear &amp; rerun
            </button>
          )}
        </header>
        <div className="task-progress">
          <i />
        </div>
        <pre className="task-log">
          {state === 'queued'
            ? waiting
              ? `⏳ waiting for upstream: ${upstream}`
              : '⏳ scheduled — scroll here to run'
            : task.logs.slice(0, lines).map((l) => `[${task.name}] ${l}`).join('\n')}
        </pre>
        <div className="task-body">
          <div>
            {task.title && <h2 className="fun-h2">{task.title}</h2>}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProdDb({ spilling, onPoke }: { spilling: boolean; onPoke: () => void }) {
  const drops = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        t: ['NULL', '{}', '42', 'row', '🦆', '0x1F', '"x"', '∅'][i % 8],
        dx: (Math.random() - 0.5) * 520,
        up: 90 + Math.random() * 160,
        r: (Math.random() - 0.5) * 720,
        d: Math.random() * 1.2,
      })),
    [],
  );
  return (
    <div className="prod-db">
      <button type="button" className={`db${spilling ? ' spilling' : ''}`} onClick={onPoke} aria-label="prod_db — please don't click">
        <span className="db-lid" />
        <span className="db-disk" />
        <span className="db-disk" />
        <span className="db-disk" />
      </button>
      <p className="db-label">prod_db · do not click</p>
      {spilling && (
        <div className="db-spill" aria-hidden>
          {drops.map((d, i) => (
            <span
              key={i}
              style={
                {
                  '--dx': `${d.dx}px`,
                  '--up': `${-d.up}px`,
                  '--r': `${d.r}deg`,
                  animationDelay: `${d.d}s`,
                } as CSSProperties
              }
            >
              {d.t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Duck() {
  const { toast } = useEggs();
  return (
    <button type="button" className="fun-duck" onClick={() => toast(`🦆 ${pick(duckTips)}`)} aria-label="Rubber duck">
      🦆
    </button>
  );
}

function Fire() {
  return (
    <div className="fun-fire" aria-hidden>
      {Array.from({ length: 28 }, (_, i) => (
        <span key={i} style={{ '--i': i } as CSSProperties}>
          🔥
        </span>
      ))}
      <p>this is fine.</p>
    </div>
  );
}

function Wobble({ text, className }: { text: string; className: string }) {
  return (
    <span className={className} aria-hidden>
      {[...text].map((ch, i) => (
        <span key={i} className="fun-char" style={{ '--i': i } as CSSProperties}>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.setProperty('--rx', `${-y * 10}deg`);
    e.currentTarget.style.setProperty('--ry', `${x * 12}deg`);
  };
  const onLeave = (e: MouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  };
  return (
    <article
      className="fun-card"
      style={{ '--accent': project.accent } as CSSProperties}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <span className="fun-card-n">job_{String(index + 1).padStart(2, '0')}</span>
      <h3>{project.funTitle}</h3>
      <p className="fun-card-sub">{project.title}</p>
      <p>{project.description}</p>
      <p className="fun-card-impact">{project.impact}</p>
      <ul className="fun-card-stack">
        {project.stack.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      {project.link && (
        <a href={project.link} target="_blank" rel="noreferrer" className="fun-card-link">
          view source ↗
        </a>
      )}
    </article>
  );
}

function RowCounter() {
  const { find, toast } = useEggs();
  const [rows, setRows] = useState(1_048_576);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    if (overflow) return;
    const id = window.setInterval(() => setRows((r) => r + Math.floor(Math.random() * 9000) + 1000), 80);
    return () => window.clearInterval(id);
  }, [overflow]);

  const onClick = () => {
    if (overflow) return;
    setOverflow(true);
    setRows(-2_147_483_648);
    find('overflow');
    toast('🔢 INTEGER OVERFLOW — should have used BIGINT.');
    window.setTimeout(() => {
      setRows(1_048_576);
      setOverflow(false);
    }, 3500);
  };

  return (
    <button type="button" className={`fun-counter${overflow ? ' overflow' : ''}`} onClick={onClick}>
      {rows.toLocaleString('en-US')}
      {overflow && ' ⚠ INT32 OVERFLOW'}
    </button>
  );
}

const BOOT_LINES = [
  '$ airflow scheduler --daemon',
  'connecting kafka://events … OK',
  'it works on my machine … OK',
  'warehouse handshake … OK',
  `loading portfolio.${profile.name.toLowerCase()} … OK`,
  'ready. hit ▶ trigger DAG',
];

/** Short fake boot log, once per browser session. */
function BootScreen() {
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(true);

  const finish = () => {
    setDone(true);
    try {
      sessionStorage.setItem('booted', '1');
    } catch {}
  };

  useEffect(() => {
    try {
      if (sessionStorage.getItem('booted')) return;
    } catch {}
    setDone(false);
    const timers = BOOT_LINES.map((_, i) => window.setTimeout(() => setShown(i + 1), 160 * (i + 1)));
    timers.push(window.setTimeout(finish, 160 * BOOT_LINES.length + 650));
    return () => timers.forEach(window.clearTimeout);
  }, []);

  if (done) return null;
  return (
    <div className="fun-boot" onClick={finish} role="presentation">
      <div className="fun-boot-log">
        {BOOT_LINES.slice(0, shown).map((l) => (
          <p key={l}>{l}</p>
        ))}
        <span className="fun-boot-caret">█</span>
      </div>
    </div>
  );
}

/** A tail of tiny data packets chasing the pointer (mouse only). */
function CursorTrail() {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const pts = refs.current.map(() => ({ x: -100, y: -100 }));
    const mouse = { x: -100, y: -100 };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    let raf = 0;
    const loop = () => {
      pts.forEach((p, i) => {
        const lead = i === 0 ? mouse : pts[i - 1];
        p.x += (lead.x - p.x) * 0.35;
        p.y += (lead.y - p.y) * 0.35;
        const el = refs.current[i];
        if (el) el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.x * 2}deg)`;
      });
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fun-trail" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} ref={(el) => void (refs.current[i] = el)} style={{ '--i': i } as CSSProperties} />
      ))}
    </div>
  );
}
