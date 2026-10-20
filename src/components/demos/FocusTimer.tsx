import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const STRINGS = {
  de: {
    phases: { focus: 'Fokus', short: 'Kurze Pause', long: 'Lange Pause' },
    start: 'Starten',
    pause: 'Pausieren',
    resume: 'Weiter',
    reset: 'Zurücksetzen',
    skip: 'Phase überspringen',
    focusMin: 'Fokus (Min.)',
    shortMin: 'Kurze Pause (Min.)',
    longMin: 'Lange Pause (Min.)',
    every: 'Lange Pause nach … Fokusphasen',
    today: 'Heute abgeschlossen',
    sound: 'Ton am Ende einer Phase',
    ended: (p: string) => `${p} beendet.`,
    settings: 'Einstellungen',
  },
  en: {
    phases: { focus: 'Focus', short: 'Short break', long: 'Long break' },
    start: 'Start',
    pause: 'Pause',
    resume: 'Resume',
    reset: 'Reset',
    skip: 'Skip phase',
    focusMin: 'Focus (min)',
    shortMin: 'Short break (min)',
    longMin: 'Long break (min)',
    every: 'Long break after … focus sessions',
    today: 'Completed today',
    sound: 'Sound at the end of a phase',
    ended: (p: string) => `${p} finished.`,
    settings: 'Settings',
  },
};

type Phase = 'focus' | 'short' | 'long';
const STORAGE_KEY = 'lh-focus-sessions';
const today = () => new Date().toISOString().slice(0, 10);

const readToday = () => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, number>;
    return raw[today()] ?? 0;
  } catch {
    return 0;
  }
};

const writeToday = (n: number) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ [today()]: n }));
  } catch {
    // Counting still works for this visit.
  }
};

const beep = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.65);
  } catch {
    // No audio available; the visual change and the live region still announce it.
  }
};

const fmt = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const FocusTimer: React.FC = () => {
  const { language } = useLanguage();
  const s = STRINGS[language];
  const [minutes, setMinutes] = useState({ focus: 25, short: 5, long: 15 });
  const [every, setEvery] = useState(4);
  const [sound, setSound] = useState(true);
  const [phase, setPhase] = useState<Phase>('focus');
  const [remaining, setRemaining] = useState(25 * 60 * 1000);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(readToday);
  const [announce, setAnnounce] = useState('');
  const endAt = useRef(0);

  const duration = minutes[phase] * 60 * 1000;

  const next = useCallback((completed: boolean) => {
    setRunning(false);
    setAnnounce(s.ended(s.phases[phase]));
    if (completed && sound) beep();
    if (phase === 'focus') {
      const count = completed ? done + 1 : done;
      if (completed) {
        setDone(count);
        writeToday(count);
      }
      const nextPhase: Phase = count > 0 && count % every === 0 && completed ? 'long' : 'short';
      setPhase(nextPhase);
      setRemaining(minutes[nextPhase] * 60 * 1000);
    } else {
      setPhase('focus');
      setRemaining(minutes.focus * 60 * 1000);
    }
  }, [phase, done, every, minutes, sound, s]);

  // Tick against a wall-clock end time so a backgrounded tab does not drift.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const left = endAt.current - Date.now();
      if (left <= 0) next(true);
      else setRemaining(left);
    }, 250);
    return () => window.clearInterval(id);
  }, [running, next]);

  const toggle = () => {
    if (running) {
      setRunning(false);
    } else {
      endAt.current = Date.now() + remaining;
      setRunning(true);
    }
  };

  const reset = () => {
    setRunning(false);
    setRemaining(duration);
  };

  const setMin = (key: Phase, value: number) => {
    const v = Math.min(180, Math.max(1, value || 1));
    setMinutes((m) => ({ ...m, [key]: v }));
    if (key === phase && !running) setRemaining(v * 60 * 1000);
  };

  const progress = 1 - remaining / duration;
  const label = running ? s.pause : remaining < duration ? s.resume : s.start;

  return (
    <div className="demo timer" data-phase={phase}>
      <ol className="timer-phases">
        {(Object.keys(s.phases) as Phase[]).map((p) => (
          <li key={p} className={`timer-phase${p === phase ? ' is-on' : ''}`} aria-current={p === phase ? 'step' : undefined}>{s.phases[p]}</li>
        ))}
      </ol>

      <p className="timer-clock" aria-live="off">{fmt(remaining)}</p>
      <div className="timer-bar" role="progressbar" aria-label={s.phases[phase]} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
        <span style={{ transform: `scaleX(${Math.min(1, Math.max(0, progress))})` }} />
      </div>
      <p className="sr-only" aria-live="assertive">{announce}</p>

      <div className="demo-actions">
        <button type="button" className="btn" onClick={toggle}>{label}</button>
        <button type="button" className="btn-accent" onClick={reset}>{s.reset}</button>
        <button type="button" className="btn-accent" onClick={() => next(false)}>{s.skip}</button>
      </div>

      <p className="timer-today">
        {s.today}: <b>{done}</b>
        <span className="timer-dots" aria-hidden="true">
          {Array.from({ length: Math.max(every, done) }, (_, i) => <i key={i} className={i < done ? 'is-on' : ''} />)}
        </span>
      </p>

      <details className="timer-settings">
        <summary>{s.settings}</summary>
        <div className="fluid-inputs">
          <div className="demo-field"><label htmlFor="t-focus">{s.focusMin}</label><input id="t-focus" type="number" min={1} max={180} value={minutes.focus} onChange={(e) => setMin('focus', Number(e.target.value))} /></div>
          <div className="demo-field"><label htmlFor="t-short">{s.shortMin}</label><input id="t-short" type="number" min={1} max={180} value={minutes.short} onChange={(e) => setMin('short', Number(e.target.value))} /></div>
          <div className="demo-field"><label htmlFor="t-long">{s.longMin}</label><input id="t-long" type="number" min={1} max={180} value={minutes.long} onChange={(e) => setMin('long', Number(e.target.value))} /></div>
          <div className="demo-field"><label htmlFor="t-every">{s.every}</label><input id="t-every" type="number" min={2} max={12} value={every} onChange={(e) => setEvery(Math.min(12, Math.max(2, Number(e.target.value) || 2)))} /></div>
        </div>
        <label className="toggle"><input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} /> {s.sound}</label>
      </details>
    </div>
  );
};

export default FocusTimer;
