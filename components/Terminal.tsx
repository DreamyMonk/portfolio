'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { experience, profile, projects, skills } from '@/lib/data';
import { oneLiners, pick } from '@/lib/memes';
import { EGG_COUNT, EGG_IDS, EGGS, useEggs, useMode } from './Providers';

type Line = { kind: 'in' | 'out' | 'err' | 'ok'; text: string };

const BANNER: Line[] = [
  { kind: 'ok', text: 'datashell v4.2.0 — connected to warehouse: prod (read-only, we learned)' },
  { kind: 'out', text: "type 'help' to list commands · esc to close" },
];

const out = (...text: string[]): Line[] => text.map((t) => ({ kind: 'out', text: t }));

export function Terminal() {
  const { terminalOpen, setTerminalOpen, find, triggerChaos, startParty, dropGravity, showMeme, found } = useEggs();
  const { setMode } = useMode();
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalOpen) inputRef.current?.focus();
  }, [terminalOpen]);

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight);
  }, [lines]);

  if (!terminalOpen) return null;

  function run(raw: string): Line[] | 'clear' {
    const cmd = raw.trim();
    const q = cmd.toLowerCase().replace(/;+$/, '').replace(/\s+/g, ' ');
    if (!q) return [];

    if (q === 'help')
      return out(
        'whoami             who built this',
        'ls [dir]           list files',
        'cat <file>         print a file',
        'select * from <t>  query a table (skills, projects, jobs, me)',
        'mode fun|pro       switch site mode',
        'eggs               easter egg progress',
        'meme               fetch one random meme',
        'clear · exit',
        '…and a few commands we don’t talk about.',
      );
    if (q === 'whoami') return out(`${profile.name} — ${profile.role} (${profile.location})`);
    if (q === 'ls' || q === 'ls ~') return out('about.txt  contact.json  skills.csv  projects/  secrets/');
    if (q === 'ls projects' || q === 'ls projects/') return out(...projects.map((p) => `${p.funTitle.toLowerCase().replace(/\W+/g, '_')}.py`));
    if (q === 'cat about.txt') return out(...profile.bio);
    if (q === 'cat skills.csv') return out('group,items', ...skills.map((g) => `${g.group},"${g.items.join(', ')}"`));
    if (q === 'cat contact.json')
      return out(JSON.stringify({ email: profile.email, alt_email: profile.altEmail, github: profile.github, linkedin: profile.linkedin }, null, 2));
    if (/^(cat|cd|ls) secrets/.test(q)) return [{ kind: 'err', text: 'permission denied. maybe if you were root…' }];

    if (/^sudo hire[- ]?me$/.test(q)) {
      find('sudo');
      return [
        { kind: 'out', text: '[sudo] password for recruiter: ********' },
        { kind: 'ok', text: 'access granted ✔' },
        { kind: 'out', text: 'triggering dag: hire_me … extract ✔ transform ✔ load ✔' },
        { kind: 'ok', text: `status: SUCCESS — reach me at ${profile.email}` },
      ];
    }
    if (q.startsWith('sudo'))
      return [{ kind: 'err', text: 'recruiter is not in the sudoers file. this incident will be reported. (what would you even want root for? 👀)' }];
    if (q === 'hire' || q === 'hire me' || q === 'hire-me') return out('did you mean: sudo hire-me ?');

    if (/^drop (table|database)/.test(q)) {
      triggerChaos();
      return [
        { kind: 'err', text: 'DROP executed. 47,000,000 rows deleted.' },
        { kind: 'out', text: 'restoring from backup in 5… 4… 3…' },
      ];
    }
    if (q.startsWith('rm -rf')) return [{ kind: 'err', text: 'nice try. this is a portfolio, not prod.' }];

    if (/^select \* from (prod|production|events|clickstream)\b/.test(q)) {
      showMeme('simply');
      return [{ kind: 'err', text: 'query cancelled — estimated scan: 4.2 TB ($21.00). add a LIMIT, maybe?' }];
    }
    const select = q.match(/^select \* from (\w+)/);
    if (select) {
      const table = select[1];
      if (table === 'skills') return out(...skills.map((g) => `${g.group.padEnd(14)}| ${g.items.join(', ')}`), `(${skills.length} rows)`);
      if (table === 'projects') return out(...projects.map((p) => `${p.funTitle.padEnd(22)}| ${p.impact}`), `(${projects.length} rows)`);
      if (table === 'jobs' || table === 'experience')
        return out(...experience.map((j) => `${j.period.padEnd(16)}| ${j.role} @ ${j.company}`), `(${experience.length} rows)`);
      if (table === 'me')
        return [...out(`name: ${profile.name} | role: ${profile.role} | hireable: TRUE`), { kind: 'ok', text: '(1 row)' }];
      return [{ kind: 'err', text: `ERROR: relation "${table}" does not exist` }];
    }
    if (q.startsWith('select')) return [{ kind: 'ok', text: 'query OK — 1 row: hire_me = TRUE (0.003s)' }];

    if (q === 'mode fun' || q === 'mode pro') {
      setMode(q.endsWith('fun') ? 'fun' : 'pro');
      return [{ kind: 'ok', text: `switched to ${q.slice(5)} mode` }];
    }
    if (q === 'eggs')
      return out(
        `found ${found.length}/${EGG_COUNT}`,
        ...EGG_IDS.map((id) => (found.includes(id) ? `  ✔ ${EGGS[id]}` : '  ? ???')),
      );
    if (q === 'party') {
      startParty();
      return [{ kind: 'ok', text: '🪩 party mode engaged' }];
    }
    if (q === 'gravity') {
      dropGravity();
      return [{ kind: 'ok', text: 'gravity = NULL' }];
    }
    if (q === 'meme' || q === 'memes' || q === 'select * from memes order by random() limit 1') return out(`😂 ${pick(oneLiners)}`);
    if (q === 'duck') return out('🦆 the duck only answers to the logo. click it. fast. five times.');
    if (q === 'coffee') return out('☕ brewing… ETL stands for Espresso, Then Latte.');
    if (q === 'clear') return 'clear';
    if (q === 'exit' || q === 'quit') {
      setTerminalOpen(false);
      return [];
    }
    return [{ kind: 'err', text: `command not found: ${cmd.split(' ')[0]} — try 'help'` }];
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = run(value);
    if (result === 'clear') setLines([]);
    else setLines((l) => [...l, { kind: 'in', text: value }, ...result]);
    if (value.trim()) setHistory((h) => [value, ...h].slice(0, 50));
    setCursor(-1);
    setValue('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' || e.key === '`') {
      e.preventDefault();
      setTerminalOpen(false);
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const next = Math.min(cursor + 1, history.length - 1);
      setCursor(next);
      setValue(history[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(cursor - 1, -1);
      setCursor(next);
      setValue(next === -1 ? '' : history[next]);
    }
  };

  return (
    <div className="term-backdrop" onClick={() => setTerminalOpen(false)}>
      <div className="term" role="dialog" aria-label="Secret terminal" onClick={(e) => e.stopPropagation()}>
        <div className="term-bar">
          <span className="term-dot r" />
          <span className="term-dot y" />
          <span className="term-dot g" />
          <span className="term-title">recruiter@portfolio: ~</span>
        </div>
        <div className="term-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
          {lines.map((l, i) => (
            <pre key={i} className={`term-line ${l.kind}`}>
              {l.kind === 'in' ? `❯ ${l.text}` : l.text}
            </pre>
          ))}
          <form className="term-input-row" onSubmit={onSubmit}>
            <span>❯</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
              aria-label="Terminal input"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
