'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { profile } from '@/lib/data';
import { memes, type MemeId } from '@/lib/memes';
import { MemePopup } from './MemePopup';

export type Mode = 'pro' | 'fun';

export const EGGS = {
  konami: 'Konami code: DROP TABLE production',
  terminal: 'Found the secret terminal',
  duck: 'Summoned the rubber duck debugger',
  devtools: 'Called hire() from the console',
  sudo: 'sudo hire-me',
  spill: 'Poked prod_db until it leaked',
  overflow: 'Overflowed the row counter',
  party: 'Started a data party',
  gravity: 'Switched off gravity',
  eof: 'Reached the end of the stream',
  fire: 'This is fine 🔥',
  meme: 'Found a hidden meme',
  memelord: 'Collected every hidden meme',
} as const;
export type EggId = keyof typeof EGGS;
export const EGG_IDS = Object.keys(EGGS) as EggId[];
export const EGG_COUNT = EGG_IDS.length;

export type Effect = 'chaos' | 'party' | 'gravity' | 'spill' | 'fire';
type Effects = Record<Effect, boolean>;

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

declare global {
  interface Window {
    hire?: () => string;
  }
}

type ModeCtx = { mode: Mode; setMode: (m: Mode) => void };
type EggCtx = {
  found: EggId[];
  find: (id: EggId) => void;
  toast: (text: string) => void;
  fx: Effects;
  triggerChaos: () => void;
  startParty: () => void;
  dropGravity: () => void;
  lightFire: () => void;
  showMeme: (id: MemeId) => void;
  seenMemes: MemeId[];
  warehouseClick: () => void;
  duck: boolean;
  logoClick: () => void;
  terminalOpen: boolean;
  setTerminalOpen: (open: boolean | ((o: boolean) => boolean)) => void;
};

const ModeContext = createContext<ModeCtx | null>(null);
const EggContext = createContext<EggCtx | null>(null);

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used inside <Providers>');
  return ctx;
}

export function useEggs() {
  const ctx = useContext(EggContext);
  if (!ctx) throw new Error('useEggs must be used inside <Providers>');
  return ctx;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ModeProvider>
      <EggProvider>{children}</EggProvider>
    </ModeProvider>
  );
}

function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('pro');
  const [wipe, setWipe] = useState(0);
  const modeRef = useRef<Mode>('pro');

  // The inline script in layout.tsx has already picked the mode before paint.
  useEffect(() => {
    if (document.documentElement.dataset.mode === 'fun') {
      modeRef.current = 'fun';
      setModeState('fun');
    }
  }, []);

  const setMode = useCallback((m: Mode) => {
    if (modeRef.current === m) return;
    modeRef.current = m;
    try {
      localStorage.setItem('mode', m);
    } catch {}
    // Swap content while the wipe covers the screen.
    setWipe((w) => w + 1);
    window.setTimeout(() => {
      document.documentElement.dataset.mode = m;
      setModeState(m);
      window.scrollTo({ top: 0 });
    }, 340);
  }, []);

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
      {wipe > 0 && (
        <div key={wipe} className="mode-wipe" aria-hidden>
          <span>{modeRef.current === 'fun' ? 'loading fun.exe…' : 'SELECT professionalism;'}</span>
        </div>
      )}
    </ModeContext.Provider>
  );
}

function EggProvider({ children }: { children: ReactNode }) {
  const { setMode } = useMode();
  const [found, setFound] = useState<EggId[]>([]);
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const [fx, setFx] = useState<Effects>({ chaos: false, party: false, gravity: false, spill: false, fire: false });
  const [duck, setDuck] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [memeId, setMemeId] = useState<MemeId | null>(null);
  const [seenMemes, setSeenMemes] = useState<MemeId[]>([]);
  const seenRef = useRef<MemeId[]>([]);
  const foundRef = useRef<EggId[]>([]);
  const logoClicks = useRef({ n: 0, t: 0 });
  const dbClicks = useRef({ n: 0, t: 0 });
  const timers = useRef<Partial<Record<Effect, number>>>({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('eggs') || '[]');
      if (Array.isArray(saved)) {
        const valid = saved.filter((x): x is EggId => x in EGGS);
        foundRef.current = valid;
        setFound(valid);
      }
      const ids = memes.map((m) => m.id as string);
      const seen = JSON.parse(localStorage.getItem('memes') || '[]');
      if (Array.isArray(seen)) {
        const valid = seen.filter((x): x is MemeId => ids.includes(x));
        seenRef.current = valid;
        setSeenMemes(valid);
      }
    } catch {}
  }, []);

  const toast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }].slice(-4));
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const find = useCallback(
    (id: EggId) => {
      if (foundRef.current.includes(id)) return;
      const next = [...foundRef.current, id];
      foundRef.current = next;
      setFound(next);
      try {
        localStorage.setItem('eggs', JSON.stringify(next));
      } catch {}
      toast(`🥚 Easter egg ${next.length}/${EGG_COUNT} — ${EGGS[id]}`);
      if (next.length === EGG_COUNT) {
        window.setTimeout(() => toast('🏆 All eggs found. You are hired… as my QA engineer.'), 1400);
      }
    },
    [toast],
  );

  /** Switch on a temporary effect; calling again extends it. */
  const fire = useCallback(
    (effect: Effect, ms: number, done?: string) => {
      setMode('fun');
      setFx((f) => ({ ...f, [effect]: true }));
      window.clearTimeout(timers.current[effect]);
      timers.current[effect] = window.setTimeout(() => {
        setFx((f) => ({ ...f, [effect]: false }));
        if (done) toast(done);
      }, ms);
    },
    [setMode, toast],
  );

  const triggerChaos = useCallback(() => fire('chaos', 5000, '✅ Restored from backup. Nobody saw anything.'), [fire]);

  const startParty = useCallback(() => {
    find('party');
    toast('🪩 SELECT * FROM dance_floor;');
    fire('party', 8000, '🧹 Party over. Back to batch jobs.');
  }, [find, fire, toast]);

  const dropGravity = useCallback(() => {
    find('gravity');
    toast('🍎 Gravity disabled… wait, wrong direction.');
    fire('gravity', 4300, '🧲 Gravity restored. Layout re-indexed.');
  }, [find, fire, toast]);

  const showMeme = useCallback(
    (id: MemeId) => {
      setMemeId(id);
      if (seenRef.current.includes(id)) return;
      const next = [...seenRef.current, id];
      seenRef.current = next;
      setSeenMemes(next);
      try {
        localStorage.setItem('memes', JSON.stringify(next));
      } catch {}
      find('meme');
      if (next.length === memes.length) find('memelord');
    },
    [find],
  );

  const closeMeme = useCallback(() => setMemeId(null), []);

  const lightFire = useCallback(() => {
    showMeme('fine');
    find('fire');
    toast('🔥 This is fine.');
    fire('fire', 6000, '🧯 Incident resolved. Writing the postmortem…');
  }, [find, fire, toast, showMeme]);

  const warehouseClick = useCallback(() => {
    const now = Date.now();
    const c = dbClicks.current;
    c.n = now - c.t < 1200 ? c.n + 1 : 1;
    c.t = now;
    if (c.n === 1) toast('🗄️ ouch. that’s prod. please don’t poke prod.');
    if (c.n >= 3) {
      c.n = 0;
      find('spill');
      toast('💦 SELECT * without LIMIT — the warehouse is leaking!');
      fire('spill', 6000, '🧽 Spill cleaned up. VACUUM complete.');
    }
  }, [find, fire, toast]);

  const logoClick = useCallback(() => {
    const now = Date.now();
    const c = logoClicks.current;
    c.n = now - c.t < 700 ? c.n + 1 : 1;
    c.t = now;
    if (c.n >= 5) {
      c.n = 0;
      setMode('fun');
      setDuck(true);
      find('duck');
      toast('🦆 Quack. Explain your bug to the duck.');
    }
  }, [find, setMode, toast]);

  useEffect(() => {
    if (terminalOpen) find('terminal');
  }, [terminalOpen, find]);

  // Global keys: ` opens the terminal, Konami code drops the table, typed words trigger effects.
  useEffect(() => {
    let seq: string[] = [];
    let word = '';
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest?.('input, textarea, [contenteditable="true"]');
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '`') {
        e.preventDefault();
        setTerminalOpen((o) => !o);
        return;
      }
      seq = [...seq, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length);
      if (seq.join() === KONAMI.join()) {
        seq = [];
        find('konami');
        toast('💥 DROP TABLE production; — 47,000,000 rows deleted.');
        triggerChaos();
        return;
      }
      if (/^[a-z]$/i.test(e.key)) {
        word = (word + e.key.toLowerCase()).slice(-12);
        if (word.endsWith('party')) {
          word = '';
          startParty();
        } else if (word.endsWith('gravity')) {
          word = '';
          dropGravity();
        } else if (word.endsWith('fine')) {
          word = '';
          lightFire();
        } else if (word.endsWith('null')) {
          word = '';
          showMeme('afraid');
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [find, toast, triggerChaos, startParty, dropGravity, lightFire, showMeme]);

  // A note for whoever opens devtools.
  useEffect(() => {
    console.log(
      '%c{ DATA }',
      'font: 900 56px sans-serif; color: #c6ff00; text-shadow: 4px 4px 0 #ff3d81; padding: 8px 0;',
    );
    console.log(
      `%cHey, fellow engineer 👋  ${profile.name} left you a job. Run hire() to trigger it.`,
      'font: 14px monospace; color: #00f0ff;',
    );
    window.hire = () => {
      find('devtools');
      return `📬 ${profile.email} — job hire_me queued. Status: SUCCESS.`;
    };
    return () => {
      delete window.hire;
    };
  }, [find]);

  return (
    <EggContext.Provider
      value={{
        found,
        find,
        toast,
        fx,
        triggerChaos,
        startParty,
        dropGravity,
        lightFire,
        showMeme,
        seenMemes,
        warehouseClick,
        duck,
        logoClick,
        terminalOpen,
        setTerminalOpen,
      }}
    >
      {children}
      {memeId && <MemePopup id={memeId} seen={seenMemes.length} onClose={closeMeme} />}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.text}
          </div>
        ))}
      </div>
    </EggContext.Provider>
  );
}
