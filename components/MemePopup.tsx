'use client';

import { useEffect } from 'react';
import { memes, type Meme, type MemeId } from '@/lib/memes';

/** A hidden meme, slapped onto the screen like a sticker when its trigger is found. */
export function MemePopup({ id, seen, onClose }: { id: MemeId; seen: number; onClose: () => void }) {
  const entry = memes.find((m) => m.id === id);

  useEffect(() => {
    const t = window.setTimeout(onClose, 9000);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [id, onClose]);

  if (!entry) return null;
  return (
    <div className="meme-pop" role="dialog" aria-label={`Hidden meme: ${entry.format}`} key={id}>
      <p className="meme-pop-badge">
        🃏 hidden meme unlocked · {seen}/{memes.length}
      </p>
      <figure className="meme">
        <figcaption>
          {entry.format}
          <button type="button" onClick={onClose} aria-label="Close meme">
            ✕
          </button>
        </figcaption>
        <MemeBody meme={entry.meme} />
      </figure>
    </div>
  );
}

function MemeBody({ meme }: { meme: Meme }) {
  switch (meme.kind) {
    case 'drake':
      return (
        <div className="drake">
          <span>🙅‍♂️</span>
          <p>{meme.no}</p>
          <span>😎👉</span>
          <p>{meme.yes}</p>
        </div>
      );
    case 'fine':
      return (
        <div className="fine">
          <span className="fine-flames" aria-hidden>
            🔥🔥🔥🔥🔥🔥
          </span>
          <span className="fine-dog" aria-hidden>
            🐶☕
          </span>
          <strong>{meme.caption}</strong>
          <small>{meme.sub}</small>
        </div>
      );
    case 'brain':
      return (
        <ol className="brain">
          {meme.steps.map((s, i) => (
            <li key={s} style={{ '--lvl': i } as React.CSSProperties}>
              <span>🧠</span>
              <p>{s}</p>
            </li>
          ))}
        </ol>
      );
    case 'butterfly':
      return (
        <div className="butterfly">
          <div>
            <span>🧍</span>
            <small>{meme.who}</small>
          </div>
          <div>
            <span>🦋</span>
            <small>{meme.thing}</small>
          </div>
          <strong>{meme.question}</strong>
        </div>
      );
    case 'simply':
      return (
        <div className="simply">
          <strong>{meme.top}</strong>
          <span aria-hidden>🧙‍♂️</span>
          <strong>{meme.bottom}</strong>
        </div>
      );
    case 'distracted':
      return (
        <div className="distracted">
          <div>
            <span>✨</span>
            <small>{meme.shiny}</small>
          </div>
          <div>
            <span>😍</span>
            <small>{meme.me}</small>
          </div>
          <div>
            <span>😤</span>
            <small>{meme.loyal}</small>
          </div>
        </div>
      );
    case 'afraid':
      return (
        <div className="afraid">
          <p>{meme.setup}</p>
          <span aria-hidden>😰</span>
          <strong>{meme.punch}</strong>
        </div>
      );
    case 'quote':
      return (
        <blockquote className="proverb">
          <p>{meme.text}</p>
          <cite>— {meme.by}</cite>
        </blockquote>
      );
  }
}
