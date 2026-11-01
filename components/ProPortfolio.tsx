'use client';

import { useEffect, useState } from 'react';
import { experience, profile, projects, skills } from '@/lib/data';
import { ModeToggle } from './ModeToggle';
import { useEggs, useMode } from './Providers';

// Professional mode reads like a data catalog: each section is a "table" with a schema line.

const SECTIONS = [
  { id: 'about', rows: 1 },
  { id: 'experience', rows: experience.length },
  { id: 'projects', rows: projects.length },
  { id: 'skills', rows: skills.reduce((n, g) => n + g.items.length, 0) },
  { id: 'contact', rows: 1 },
];

export default function ProPortfolio() {
  const { logoClick, toast } = useEggs();
  const { setMode } = useMode();
  const active = useActiveSection();
  const [synced, setSynced] = useState('');

  useEffect(() => {
    setSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      toast('Email copied to clipboard');
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <div className="pro">
      <header className="pro-bar">
        <button type="button" className="pro-logo" onClick={logoClick} aria-label="Home">
          {profile.initials}
        </button>
        <span className="pro-crumb">
          catalog / <b>{profile.name.toLowerCase()}</b> / portfolio
        </span>
        <span className="pro-fresh">
          <i /> fresh{synced && ` · synced ${synced}`}
        </span>
        <ModeToggle />
      </header>

      <div className="pro-layout">
        <aside className="pro-side" aria-label="Sections">
          <p className="pro-side-title">schema · portfolio</p>
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className={active === s.id ? 'on' : ''}>
                  <span>{s.id}</span>
                  <em>{s.rows}</em>
                </a>
              </li>
            ))}
          </ul>
          <p className="pro-side-foot">
            {profile.location}
            <br />
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <br />
            <a href={`mailto:${profile.altEmail}`}>{profile.altEmail}</a>
          </p>
        </aside>

        <main className="pro-main">
          <section className="pro-hero">
            <p className="pro-kicker">TABLE portfolio.{profile.name.toLowerCase()}</p>
            <h1>
              {profile.name}
              <span>
                , <em>{profile.role.toLowerCase()}</em>.
              </span>
            </h1>
            <p className="pro-lead">{profile.tagline}</p>
            <div className="pro-cta">
              <a className="pro-btn primary" href={`mailto:${profile.email}`}>
                Get in touch →
              </a>
              <a className="pro-btn" href="#projects">
                Selected work
              </a>
              {profile.resume && (
                <a className="pro-btn" href={profile.resume}>
                  Resume
                </a>
              )}
            </div>
            <Lineage />
            <dl className="pro-metrics">
              {profile.stats.map((s) => (
                <div key={s.label}>
                  <dd>{s.value}</dd>
                  <dt>{s.label}</dt>
                </div>
              ))}
            </dl>
          </section>

          <Section id="about" n={1} schema="bio TEXT · focus TEXT[]">
            {profile.bio.map((p) => (
              <p key={p} className="pro-body">
                {p}
              </p>
            ))}
          </Section>

          <Section id="experience" n={2} schema="company VARCHAR · role VARCHAR · period DATERANGE">
            <Gantt />
            <ol className="pro-jobs">
              {experience.map((job) => (
                <li key={job.company}>
                  <div className="pro-job-head">
                    <h3>{job.role}</h3>
                    <span>{job.company}</span>
                    <code>{job.period}</code>
                  </div>
                  <p className="pro-muted">{job.summary}</p>
                  <ul className="pro-bullets">
                    {job.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="projects" n={3} schema="name VARCHAR · lineage ARRAY · impact METRIC">
            <div className="pro-projects">
              {projects.map((p, i) => (
                <article key={p.title} className="pro-card">
                  <code className="pro-card-id">model_{String(i + 1).padStart(2, '0')}</code>
                  <h3>{p.title}</h3>
                  <p className="pro-muted">{p.description}</p>
                  <p className="pro-lineage">
                    {p.stack.map((t, j) => (
                      <span key={t}>
                        {j > 0 && <i>→</i>}
                        {t}
                      </span>
                    ))}
                  </p>
                  <p className="pro-impact">{p.impact}</p>
                  {p.link && (
                    <a className="pro-card-link" href={p.link} target="_blank" rel="noreferrer">
                      Source ↗
                    </a>
                  )}
                </article>
              ))}
            </div>
          </Section>

          <Section id="skills" n={4} schema="category VARCHAR · tools ARRAY<STRING>">
            <table className="pro-skills">
              <tbody>
                {skills.map((g) => (
                  <tr key={g.group}>
                    <th scope="row">{g.group.toLowerCase()}</th>
                    <td>
                      {g.items.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section id="contact" n={5} schema="channel VARCHAR · latency INTERVAL">
            <h2 className="pro-contact">
              Have data that needs <em>moving</em>?
            </h2>
            <pre className="pro-sql">
              <code>
                <b>INSERT INTO</b> conversations (who, topic){'\n'}
                <b>VALUES</b> (<s>&apos;you&apos;</s>, <s>&apos;a data platform role&apos;</s>);{'\n'}
                <u>-- typical response time: under 24h</u>
              </code>
            </pre>
            <div className="pro-cta">
              <a className="pro-btn primary" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
              <a className="pro-btn" href={`mailto:${profile.altEmail}`}>
                {profile.altEmail}
              </a>
              <button type="button" className="pro-btn" onClick={copyEmail}>
                Copy email
              </button>
              <a className="pro-btn" href={profile.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a className="pro-btn" href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </div>
          </Section>

          <footer className="pro-footer">
            <span>
              © {new Date().getFullYear()} {profile.name} · built with Next.js
            </span>
            <button type="button" onClick={() => setMode('fun')}>
              Prefer something louder? Open fun mode ✦
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}

function Section({
  id,
  n,
  schema,
  children,
}: {
  id: string;
  n: number;
  schema: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="pro-section">
      <header className="pro-sec-head">
        <span>0{n}</span>
        <h2>{id}</h2>
        <code>{schema}</code>
      </header>
      {children}
    </section>
  );
}

function useActiveSection() {
  const [active, setActive] = useState('');
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return active;
}

/** Experience as a little Gantt chart of years. */
function Gantt() {
  const now = new Date().getFullYear() + 1;
  const spans = experience.map((j) => {
    const years = (j.period.match(/\d{4}/g) ?? []).map(Number);
    return { job: j, start: years[0] ?? now - 1, end: years[1] ?? now };
  });
  const min = Math.min(...spans.map((s) => s.start));
  const total = Math.max(1, now - min);
  const ticks = Array.from({ length: total + 1 }, (_, i) => min + i);
  return (
    <div className="pro-gantt" role="img" aria-label="Career timeline">
      {spans.map(({ job, start, end }) => (
        <div key={job.company} className="pro-gantt-row">
          <span className="pro-gantt-name">{job.company}</span>
          <div className="pro-gantt-track">
            <div
              className={`pro-gantt-bar${job.period.includes('Present') ? ' live' : ''}`}
              style={{ left: `${((start - min) / total) * 100}%`, width: `${((end - start) / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
      <div className="pro-gantt-row axis">
        <span />
        <div className="pro-gantt-track">
          {ticks.map((y) => (
            <span key={y} style={{ left: `${((y - min) / total) * 100}%` }}>
              {y === now ? 'now' : `’${String(y).slice(2)}`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Animated lineage graph: sources → transform → warehouse → consumers. */
function Lineage() {
  const nodes = [
    { id: 'events', x: 0, y: 14 },
    { id: 'orders_db', x: 0, y: 84 },
    { id: 'crm_api', x: 0, y: 154 },
    { id: 'spark · dbt', x: 170, y: 84 },
    { id: 'warehouse', x: 340, y: 84 },
    { id: 'dashboards', x: 510, y: 40 },
    { id: 'ml_features', x: 510, y: 128 },
  ];
  const edges: [number, number][] = [
    [0, 3],
    [1, 3],
    [2, 3],
    [3, 4],
    [4, 5],
    [4, 6],
  ];
  const W = 120;
  const H = 32;
  const path = (a: (typeof nodes)[number], b: (typeof nodes)[number]) => {
    const x1 = a.x + W;
    const y1 = a.y + H / 2;
    const x2 = b.x;
    const y2 = b.y + H / 2;
    const mx = (x1 + x2) / 2;
    return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  };
  return (
    <figure className="pro-lineage-fig">
      <svg viewBox="0 0 630 200" role="img" aria-label="Data lineage from sources to consumers">
        {edges.map(([a, b]) => (
          <g key={`${a}-${b}`}>
            <path d={path(nodes[a], nodes[b])} className="edge" />
            <path d={path(nodes[a], nodes[b])} className="flow" style={{ animationDelay: `${a * -0.4}s` }} />
          </g>
        ))}
        {nodes.map((n, i) => (
          <g key={n.id} transform={`translate(${n.x},${n.y})`} className={i === 4 ? 'node hot' : 'node'}>
            <rect width={W} height={H} rx="3" />
            <text x={W / 2} y={H / 2 + 4} textAnchor="middle">
              {n.id}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>fig. 1 — a typical pipeline I build, live.</figcaption>
    </figure>
  );
}
