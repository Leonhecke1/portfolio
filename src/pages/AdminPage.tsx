import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, User, Layers, Zap, FolderOpen, Clock, Mail,
  Pencil, Trash2, Plus, X, Check, ExternalLink, ChevronRight,
  RotateCcw, Lock, AlertCircle, Eye, EyeOff, Search,
  Sparkles, Monitor, Star, MousePointer, FlaskConical, Columns,
} from 'lucide-react';
import { useVisualMode } from '../contexts/VisualModeContext';
import { useContent } from '../contexts/ContentContext';
import type { SkillCategory, StatItem, CapabilityCard, SiteSettings } from '../data/defaultContent';
import type { Project } from '../ProjectData';
import type { SpacestationModule, ExperienceModule, EducationModule } from '../spacestationData';
import './Admin.css';

/* ── Auth helpers ────────────────────────────────────────────────── */
const TOKEN_KEY = 'admin_token';

async function apiLogin(username: string, password: string): Promise<string> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Login fehlgeschlagen');
  return data.token as string;
}

async function apiSetup(username: string, password: string): Promise<string> {
  const res = await fetch('/api/auth/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Setup fehlgeschlagen');
  return data.token as string;
}

async function checkSetupRequired(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/setup-required');
    const data = await res.json();
    return data.required === true;
  } catch {
    return false;
  }
}

/* ── Login / Setup Gate ──────────────────────────────────────────── */
const LoginGate = ({ onAuth }: { onAuth: () => void }) => {
  const [mode,    setMode]    = useState<'loading' | 'login' | 'setup'>('loading');
  const [user,    setUser]    = useState('');
  const [pw,      setPw]      = useState('');
  const [pw2,     setPw2]     = useState('');
  const [visible, setVisible] = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [shake,   setShake]   = useState(false);

  useEffect(() => {
    checkSetupRequired().then(req => setMode(req ? 'setup' : 'login'));
  }, []);

  const triggerShake = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'setup' && pw !== pw2) {
      triggerShake('Passwörter stimmen nicht überein.');
      return;
    }
    if (mode === 'setup' && pw.length < 8) {
      triggerShake('Passwort muss mindestens 8 Zeichen haben.');
      return;
    }
    setLoading(true);
    try {
      const token = mode === 'setup'
        ? await apiSetup(user, pw)
        : await apiLogin(user, pw);
      sessionStorage.setItem(TOKEN_KEY, token);
      onAuth();
    } catch (err: unknown) {
      triggerShake(err instanceof Error ? err.message : 'Fehler');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'loading') return (
    <div className="admin-login-root">
      <div className="admin-login-card" style={{ alignItems: 'center' }}>
        <Lock size={20} color="rgba(96,165,250,0.4)" />
      </div>
    </div>
  );

  const isSetup = mode === 'setup';

  return (
    <div className="admin-login-root">
      <div className={`admin-login-card${shake ? ' admin-shake' : ''}`}>
        <div className="admin-login-header">
          <Lock size={20} color="rgba(96,165,250,0.7)" />
          <h1 className="admin-login-title">
            {isSetup ? 'Admin einrichten' : 'Admin-Bereich'}
          </h1>
          <p className="admin-login-subtitle">
            {isSetup
              ? 'Erstelle deinen Admin-Account. Dieser Schritt ist nur einmalig möglich.'
              : 'Nur für autorisierte Personen.'}
          </p>
        </div>

        <form className="admin-login-form" onSubmit={submit}>
          {error && (
            <div className="admin-login-error">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <div className="admin-field">
            <label className="admin-label">Benutzername</label>
            <input
              className="admin-input"
              type="text"
              value={user}
              autoFocus
              autoComplete="username"
              onChange={e => { setUser(e.target.value); setError(''); }}
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Passwort</label>
            <div style={{ position: 'relative' }}>
              <input
                className="admin-input"
                type={visible ? 'text' : 'password'}
                value={pw}
                autoComplete={isSetup ? 'new-password' : 'current-password'}
                onChange={e => { setPw(e.target.value); setError(''); }}
                style={{ paddingRight: '2.5rem' }}
              />
              <button type="button" className="admin-btn-icon"
                onClick={() => setVisible(v => !v)}
                style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }}>
                {visible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {isSetup && (
            <div className="admin-field">
              <label className="admin-label">Passwort bestätigen</label>
              <input
                className="admin-input"
                type={visible ? 'text' : 'password'}
                value={pw2}
                autoComplete="new-password"
                onChange={e => { setPw2(e.target.value); setError(''); }}
              />
            </div>
          )}

          <button type="submit" className="admin-btn admin-btn-primary admin-login-submit" disabled={loading}>
            {loading
              ? '...'
              : isSetup
                ? <><Check size={13} /> Account erstellen</>
                : <><Check size={13} /> Anmelden</>}
          </button>
        </form>

        <p className="admin-login-back">
          <Link to="/">← Zurück zur Portfolio-Seite</Link>
        </p>
      </div>
    </div>
  );
};

/* ── Types ───────────────────────────────────────────────────────── */
type Section = 'hero' | 'about' | 'capabilities' | 'projects' | 'timeline' | 'contact' | 'visuals' | 'seo';

/* ── Toast ───────────────────────────────────────────────────────── */
const Toast = ({ visible, error }: { visible: boolean; error?: string | null }) => {
  if (error) return (
    <div className="admin-toast admin-toast-error">
      <AlertCircle size={13} /> {error}
    </div>
  );
  if (!visible) return null;
  return (
    <div className="admin-toast">
      <Check size={13} /> Gespeichert
    </div>
  );
};

/* ── Tag editor (comma/enter to add) ────────────────────────────── */
const TagEditor = ({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
    setInput('');
  };

  const remove = (tag: string) => onChange(tags.filter(t => t !== tag));

  return (
    <div className="admin-tags" onClick={() => inputRef.current?.focus()}>
      {tags.map(tag => (
        <span key={tag} className="admin-tag">
          {tag}
          <button className="admin-tag-remove" onClick={() => remove(tag)}>
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        className="admin-tag-input"
        placeholder="Add…"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input); }
          if (e.key === 'Backspace' && !input && tags.length) remove(tags[tags.length - 1]);
        }}
        onBlur={() => { if (input.trim()) add(input); }}
      />
    </div>
  );
};

/* ── Section: Hero ───────────────────────────────────────────────── */
const HeroSection = ({ onSave }: { onSave: () => void }) => {
  const { content, updateContent } = useContent();
  const [form, setForm] = useState(content.hero);

  const save = () => {
    updateContent({ hero: form });
    onSave();
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Hero</h2>
        <p className="admin-section-desc">Texte auf der Startseite über deinem Namen.</p>
      </div>

      <div className="admin-form">
        <div className="admin-field">
          <label className="admin-label">Berufsbezeichnung</label>
          <input
            className="admin-input"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Standort</label>
          <input
            className="admin-input"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Status-Badge</label>
          <input
            className="admin-input"
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          />
        </div>

        <div className="admin-form-actions">
          <button className="admin-btn admin-btn-primary" onClick={save}>
            <Check size={13} /> Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Section: About / Skills ─────────────────────────────────────── */
const AboutSection = ({ onSave }: { onSave: () => void }) => {
  const { content, updateContent } = useContent();
  const [skills, setSkills] = useState<SkillCategory[]>(content.about.skills);

  const updateSkills = (id: string, items: string[]) =>
    setSkills(s => s.map(c => c.id === id ? { ...c, skills: items } : c));

  const updateLabel = (id: string, label: string) =>
    setSkills(s => s.map(c => c.id === id ? { ...c, label } : c));

  const save = () => {
    updateContent({ about: { skills } });
    onSave();
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">About — Skills</h2>
        <p className="admin-section-desc">Skill-Kategorien und -Tags im About-Bereich.</p>
      </div>

      <div className="admin-skills-grid">
        {skills.map(cat => (
          <div key={cat.id} className="admin-skill-card">
            <div className="admin-skill-card-header">
              <input
                className="admin-input"
                style={{ padding: '4px 8px', fontSize: '12px' }}
                value={cat.label}
                onChange={e => updateLabel(cat.id, e.target.value)}
              />
            </div>
            <TagEditor
              tags={cat.skills}
              onChange={items => updateSkills(cat.id, items)}
            />
          </div>
        ))}
      </div>

      <div className="admin-form-actions" style={{ marginTop: '1.25rem' }}>
        <button className="admin-btn admin-btn-primary" onClick={save}>
          <Check size={13} /> Speichern
        </button>
      </div>
    </div>
  );
};

/* ── Section: Capabilities ───────────────────────────────────────── */
type CapOverlay = { type: 'stat'; index: number } | { type: 'card'; index: number } | null;

const CapabilitiesSection = ({ onSave }: { onSave: () => void }) => {
  const { content, updateContent } = useContent();
  const [stats, setStats]   = useState<StatItem[]>(content.capabilities.stats);
  const [cards, setCards]   = useState<CapabilityCard[]>(content.capabilities.cards);
  const [overlay, setOverlay] = useState<CapOverlay>(null);
  const [draftStat, setDraftStat] = useState<StatItem | null>(null);
  const [draftCard, setDraftCard] = useState<CapabilityCard | null>(null);

  const openStat = (i: number) => { setDraftStat({ ...stats[i] }); setOverlay({ type: 'stat', index: i }); };
  const openCard = (i: number) => { setDraftCard({ ...cards[i] }); setOverlay({ type: 'card', index: i }); };
  const close    = () => { setOverlay(null); setDraftStat(null); setDraftCard(null); };

  const saveStat = () => {
    if (!draftStat || overlay?.type !== 'stat') return;
    const next = stats.map((s, i) => i === overlay.index ? draftStat : s);
    setStats(next);
    updateContent({ capabilities: { stats: next, cards } });
    onSave(); close();
  };

  const saveCard = () => {
    if (!draftCard || overlay?.type !== 'card') return;
    const next = cards.map((c, i) => i === overlay.index ? draftCard : c);
    setCards(next);
    updateContent({ capabilities: { stats, cards: next } });
    onSave(); close();
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Capabilities</h2>
        <p className="admin-section-desc">Statistiken und die drei Karten im „What I Build"-Bereich.</p>
      </div>

      <p className="admin-label" style={{ marginBottom: '0.75rem' }}>Statistiken</p>
      <div className="admin-stats-grid">
        {stats.map((stat, i) => (
          <div key={stat.id} className="admin-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: '#EEF2FF' }}>
                {stat.target}{stat.suffix}
              </span>
              <button className="admin-btn-icon" onClick={() => openStat(i)}>
                <Pencil size={13} />
              </button>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(100,116,139,0.8)', whiteSpace: 'pre-line' }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="admin-divider" />

      <p className="admin-label" style={{ marginBottom: '0.75rem' }}>Karten</p>
      <div className="admin-list">
        {cards.map((card, i) => (
          <div key={card.number} className="admin-list-item">
            <div className="admin-list-item-info">
              <p className="admin-list-item-title">{card.number} — {card.title}</p>
              <p className="admin-list-item-meta">{card.headline}</p>
            </div>
            <div className="admin-list-item-actions">
              <button className="admin-btn-icon" onClick={() => openCard(i)}>
                <Pencil size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Overlay: Stat */}
      {overlay?.type === 'stat' && draftStat && (
        <>
          <div className="admin-overlay-backdrop" onClick={close} />
          <div className="admin-overlay-panel">
            <div className="admin-overlay-header">
              <h3 className="admin-overlay-title">Statistik bearbeiten</h3>
              <button className="admin-btn-icon" onClick={close}><X size={16} /></button>
            </div>
            <div className="admin-overlay-body">
              <div className="admin-field">
                <label className="admin-label">Zahl</label>
                <input className="admin-input" type="number"
                  value={draftStat.target}
                  onChange={e => setDraftStat(d => d && ({ ...d, target: Number(e.target.value) }))}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">Suffix (+, %)</label>
                <input className="admin-input"
                  value={draftStat.suffix}
                  onChange={e => setDraftStat(d => d && ({ ...d, suffix: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">Beschriftung (Zeilenumbruch mit \n)</label>
                <input className="admin-input"
                  value={draftStat.label}
                  onChange={e => setDraftStat(d => d && ({ ...d, label: e.target.value }))}
                />
              </div>
            </div>
            <div className="admin-overlay-footer">
              <button className="admin-btn admin-btn-ghost" onClick={close}>Abbrechen</button>
              <button className="admin-btn admin-btn-primary" onClick={saveStat}><Check size={13} /> Speichern</button>
            </div>
          </div>
        </>
      )}

      {/* Overlay: Card */}
      {overlay?.type === 'card' && draftCard && (
        <>
          <div className="admin-overlay-backdrop" onClick={close} />
          <div className="admin-overlay-panel">
            <div className="admin-overlay-header">
              <h3 className="admin-overlay-title">Karte bearbeiten — {draftCard.number}</h3>
              <button className="admin-btn-icon" onClick={close}><X size={16} /></button>
            </div>
            <div className="admin-overlay-body">
              <div className="admin-field">
                <label className="admin-label">Titel</label>
                <input className="admin-input"
                  value={draftCard.title}
                  onChange={e => setDraftCard(d => d && ({ ...d, title: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">Headline (kursiv)</label>
                <input className="admin-input"
                  value={draftCard.headline}
                  onChange={e => setDraftCard(d => d && ({ ...d, headline: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">Beschreibung</label>
                <textarea className="admin-textarea"
                  value={draftCard.body}
                  onChange={e => setDraftCard(d => d && ({ ...d, body: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">Tools / Tags</label>
                <TagEditor
                  tags={draftCard.tools}
                  onChange={tools => setDraftCard(d => d && ({ ...d, tools }))}
                />
              </div>
            </div>
            <div className="admin-overlay-footer">
              <button className="admin-btn admin-btn-ghost" onClick={close}>Abbrechen</button>
              <button className="admin-btn admin-btn-primary" onClick={saveCard}><Check size={13} /> Speichern</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Section: Projects ───────────────────────────────────────────── */
type ProjectOverlay = { mode: 'edit'; index: number } | { mode: 'add' } | null;

const ProjectsSection = ({ onSave }: { onSave: () => void }) => {
  const { content, updateContent } = useContent();
  const [projects, setProjects] = useState<Project[]>(content.projects);
  const [overlay, setOverlay]   = useState<ProjectOverlay>(null);
  const [draft, setDraft]       = useState<Project | null>(null);

  const blank = (): Project => ({
    id: Date.now(),
    title: '',
    description: '',
    technologies: [],
    link: '',
    position: { top: '50%', left: '50%' },
    technicalInsight: '',
  });

  const openEdit = (i: number) => { setDraft({ ...projects[i] }); setOverlay({ mode: 'edit', index: i }); };
  const openAdd  = () => { setDraft(blank()); setOverlay({ mode: 'add' }); };
  const close    = () => { setOverlay(null); setDraft(null); };

  const save = () => {
    if (!draft) return;
    let next: Project[];
    if (overlay?.mode === 'edit') {
      next = projects.map((p, i) => i === (overlay as { mode: 'edit'; index: number }).index ? draft : p);
    } else {
      next = [...projects, draft];
    }
    setProjects(next);
    updateContent({ projects: next });
    onSave(); close();
  };

  const remove = (i: number) => {
    const next = projects.filter((_, idx) => idx !== i);
    setProjects(next);
    updateContent({ projects: next });
    onSave();
  };

  const move = (i: number, dir: -1 | 1) => {
    const next = [...projects];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setProjects(next);
    updateContent({ projects: next });
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Projekte</h2>
        <p className="admin-section-desc">Reihenfolge, Texte und Links aller Projekte.</p>
      </div>

      <div className="admin-list">
        {projects.map((p, i) => (
          <div key={p.id} className="admin-list-item">
            <div className="admin-list-item-info">
              <p className="admin-list-item-title">{p.title || <em>Ohne Titel</em>}</p>
              <p className="admin-list-item-meta">{p.technologies.slice(0, 4).join(' · ')}</p>
            </div>
            <div className="admin-list-item-actions">
              <button className="admin-btn-icon" title="Nach oben" onClick={() => move(i, -1)} disabled={i === 0}
                style={{ opacity: i === 0 ? 0.3 : 1 }}>
                <ChevronRight size={14} style={{ transform: 'rotate(-90deg)' }} />
              </button>
              <button className="admin-btn-icon" title="Nach unten" onClick={() => move(i, 1)} disabled={i === projects.length - 1}
                style={{ opacity: i === projects.length - 1 ? 0.3 : 1 }}>
                <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
              </button>
              <button className="admin-btn-icon" onClick={() => openEdit(i)}><Pencil size={13} /></button>
              <button className="admin-btn-icon" onClick={() => remove(i)}>
                <Trash2 size={13} style={{ color: 'rgba(252,165,165,0.7)' }} />
              </button>
            </div>
          </div>
        ))}
        <button className="admin-list-add" onClick={openAdd}>
          <Plus size={14} /> Projekt hinzufügen
        </button>
      </div>

      {overlay && draft && (
        <>
          <div className="admin-overlay-backdrop" onClick={close} />
          <div className="admin-overlay-panel">
            <div className="admin-overlay-header">
              <h3 className="admin-overlay-title">
                {overlay.mode === 'add' ? 'Neues Projekt' : 'Projekt bearbeiten'}
              </h3>
              <button className="admin-btn-icon" onClick={close}><X size={16} /></button>
            </div>
            <div className="admin-overlay-body">
              <div className="admin-field">
                <label className="admin-label">Titel</label>
                <input className="admin-input" value={draft.title}
                  onChange={e => setDraft(d => d && ({ ...d, title: e.target.value }))} />
              </div>
              <div className="admin-field">
                <label className="admin-label">Beschreibung</label>
                <textarea className="admin-textarea" value={draft.description}
                  onChange={e => setDraft(d => d && ({ ...d, description: e.target.value }))} />
              </div>
              <div className="admin-field">
                <label className="admin-label">Technologien</label>
                <TagEditor
                  tags={draft.technologies}
                  onChange={technologies => setDraft(d => d && ({ ...d, technologies }))}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">Link</label>
                <input className="admin-input" value={draft.link}
                  onChange={e => setDraft(d => d && ({ ...d, link: e.target.value }))} />
              </div>
              <div className="admin-field">
                <label className="admin-label">Technischer Einblick</label>
                <textarea className="admin-textarea" value={draft.technicalInsight}
                  onChange={e => setDraft(d => d && ({ ...d, technicalInsight: e.target.value }))} />
              </div>
            </div>
            <div className="admin-overlay-footer">
              <button className="admin-btn admin-btn-ghost" onClick={close}>Abbrechen</button>
              <button className="admin-btn admin-btn-primary" onClick={save}><Check size={13} /> Speichern</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Section: Timeline ───────────────────────────────────────────── */
type TimelineOverlay = { mode: 'edit'; index: number } | { mode: 'add' } | null;

const blankExperience = (): ExperienceModule => ({
  type: 'experience', id: `exp-${Date.now()}`, date: '',
  title: '', company: '', description: [], moduleType: 'lab',
});
const blankEducation = (): EducationModule => ({
  type: 'education', id: `edu-${Date.now()}`, date: '',
  degree: '', institution: '', moduleType: 'training',
});

const TimelineSection = ({ onSave }: { onSave: () => void }) => {
  const { content, updateContent } = useContent();
  const [modules, setModules]       = useState<SpacestationModule[]>(content.timeline);
  const [overlay, setOverlay]       = useState<TimelineOverlay>(null);
  const [draft, setDraft]           = useState<SpacestationModule | null>(null);

  const openEdit = (i: number) => { setDraft({ ...modules[i] }); setOverlay({ mode: 'edit', index: i }); };
  const openAdd  = (type: 'experience' | 'education') => {
    setDraft(type === 'experience' ? blankExperience() : blankEducation());
    setOverlay({ mode: 'add' });
  };
  const close = () => { setOverlay(null); setDraft(null); };

  const save = () => {
    if (!draft) return;
    let next: SpacestationModule[];
    if (overlay?.mode === 'edit') {
      next = modules.map((m, i) => i === (overlay as { mode: 'edit'; index: number }).index ? draft : m);
    } else {
      next = [...modules, draft];
    }
    setModules(next);
    updateContent({ timeline: next });
    onSave(); close();
  };

  const remove = (i: number) => {
    const next = modules.filter((_, idx) => idx !== i);
    setModules(next);
    updateContent({ timeline: next });
    onSave();
  };

  const move = (i: number, dir: -1 | 1) => {
    const next = [...modules];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setModules(next);
    updateContent({ timeline: next });
  };

  const setExp = (field: keyof ExperienceModule, val: unknown) =>
    setDraft(d => d?.type === 'experience' ? ({ ...d, [field]: val }) as ExperienceModule : d);
  const setEdu = (field: keyof EducationModule, val: unknown) =>
    setDraft(d => d?.type === 'education' ? ({ ...d, [field]: val }) as EducationModule : d);

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Timeline</h2>
        <p className="admin-section-desc">Berufliche Stationen und Ausbildung.</p>
      </div>

      <div className="admin-list">
        {modules.map((m, i) => (
          <div key={m.id} className="admin-list-item">
            <div className="admin-list-item-info">
              <p className="admin-list-item-title">
                <span className={`admin-type-badge ${m.type}`} style={{ marginRight: 6 }}>{m.type}</span>
                {m.type === 'experience' ? m.title : m.degree}
              </p>
              <p className="admin-list-item-meta">
                {m.type === 'experience' ? m.company : m.institution} · {m.date}
              </p>
            </div>
            <div className="admin-list-item-actions">
              <button className="admin-btn-icon" title="Nach oben" onClick={() => move(i, -1)} disabled={i === 0}
                style={{ opacity: i === 0 ? 0.3 : 1 }}>
                <ChevronRight size={14} style={{ transform: 'rotate(-90deg)' }} />
              </button>
              <button className="admin-btn-icon" title="Nach unten" onClick={() => move(i, 1)} disabled={i === modules.length - 1}
                style={{ opacity: i === modules.length - 1 ? 0.3 : 1 }}>
                <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
              </button>
              <button className="admin-btn-icon" onClick={() => openEdit(i)}><Pencil size={13} /></button>
              <button className="admin-btn-icon" onClick={() => remove(i)}>
                <Trash2 size={13} style={{ color: 'rgba(252,165,165,0.7)' }} />
              </button>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="admin-list-add" style={{ flex: 1 }} onClick={() => openAdd('experience')}>
            <Plus size={14} /> Erfahrung
          </button>
          <button className="admin-list-add" style={{ flex: 1 }} onClick={() => openAdd('education')}>
            <Plus size={14} /> Ausbildung
          </button>
        </div>
      </div>

      {overlay && draft && (
        <>
          <div className="admin-overlay-backdrop" onClick={close} />
          <div className="admin-overlay-panel">
            <div className="admin-overlay-header">
              <h3 className="admin-overlay-title">
                {overlay.mode === 'add' ? 'Neuer Eintrag' : 'Eintrag bearbeiten'}
                {' '}<span className={`admin-type-badge ${draft.type}`}>{draft.type}</span>
              </h3>
              <button className="admin-btn-icon" onClick={close}><X size={16} /></button>
            </div>
            <div className="admin-overlay-body">
              <div className="admin-field">
                <label className="admin-label">Zeitraum</label>
                <input className="admin-input" value={draft.date}
                  onChange={e => draft.type === 'experience' ? setExp('date', e.target.value) : setEdu('date', e.target.value)} />
              </div>
              {draft.type === 'experience' && (
                <>
                  <div className="admin-field">
                    <label className="admin-label">Position / Titel</label>
                    <input className="admin-input" value={draft.title}
                      onChange={e => setExp('title', e.target.value)} />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label">Unternehmen</label>
                    <input className="admin-input" value={draft.company}
                      onChange={e => setExp('company', e.target.value)} />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label">Aufgaben / Beschreibung</label>
                    <p className="admin-hint">Eine Zeile pro Aufgabe.</p>
                    <textarea className="admin-textarea" style={{ minHeight: 120 }}
                      value={draft.description.join('\n')}
                      onChange={e => setExp('description', e.target.value.split('\n'))} />
                  </div>
                </>
              )}
              {draft.type === 'education' && (
                <>
                  <div className="admin-field">
                    <label className="admin-label">Abschluss / Ausbildung</label>
                    <input className="admin-input" value={draft.degree}
                      onChange={e => setEdu('degree', e.target.value)} />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label">Institution</label>
                    <input className="admin-input" value={draft.institution}
                      onChange={e => setEdu('institution', e.target.value)} />
                  </div>
                </>
              )}
            </div>
            <div className="admin-overlay-footer">
              <button className="admin-btn admin-btn-ghost" onClick={close}>Abbrechen</button>
              <button className="admin-btn admin-btn-primary" onClick={save}><Check size={13} /> Speichern</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Toggle Switch ───────────────────────────────────────────────── */
const ToggleSwitch = ({
  checked,
  onChange,
  label,
  description,
  icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}) => (
  <div className="admin-toggle-row" onClick={() => onChange(!checked)}>
    <div className="admin-toggle-info">
      {icon && <span className="admin-toggle-icon">{icon}</span>}
      <div>
        <p className="admin-toggle-label">{label}</p>
        {description && <p className="admin-toggle-desc">{description}</p>}
      </div>
    </div>
    <div className={`admin-toggle-track${checked ? ' admin-toggle-on' : ''}`}>
      <div className="admin-toggle-thumb" />
    </div>
  </div>
);

/* ── Section: Visuals & Settings ─────────────────────────────────── */
const VisualsSection = ({ onSave }: { onSave: () => void }) => {
  const { content, updateContent } = useContent();
  const { setEnhanced } = useVisualMode();
  const [settings, setSettings] = useState<SiteSettings>(
    content.settings ?? {
      enhancedVisuals: false,
      showHeroCanvas: true,
      showStarField: true,
      showCursorGlow: true,
      showLab: true,
      showMarquee: true,
    }
  );

  const update = (patch: Partial<SiteSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    // Sync enhanced visuals to VisualModeContext immediately for live preview
    if (patch.enhancedVisuals !== undefined) setEnhanced(patch.enhancedVisuals);
    updateContent({ settings: next });
    onSave();
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Visuals & Settings</h2>
        <p className="admin-section-desc">Visuelle Effekte und Sichtbarkeit von Sektionen steuern.</p>
      </div>

      <p className="admin-label" style={{ marginBottom: '0.75rem' }}>Visuelle Effekte</p>
      <div className="admin-toggle-group">
        <ToggleSwitch
          checked={settings.enhancedVisuals}
          onChange={v => update({ enhancedVisuals: v })}
          label="Enhanced Mode"
          description="Intensivere Nebula-Glows und zusätzliche Hintergrundeffekte."
          icon={<Sparkles size={14} />}
        />
        <ToggleSwitch
          checked={settings.showHeroCanvas}
          onChange={v => update({ showHeroCanvas: v })}
          label="Hero 3D Canvas"
          description="Glasiges Ikosaeder im Hero-Bereich (Three.js / WebGL)."
          icon={<Monitor size={14} />}
        />
        <ToggleSwitch
          checked={settings.showStarField}
          onChange={v => update({ showStarField: v })}
          label="Sternenhintergrund"
          description="Animiertes Sternenfeld im Hintergrund der gesamten Seite."
          icon={<Star size={14} />}
        />
        <ToggleSwitch
          checked={settings.showCursorGlow}
          onChange={v => update({ showCursorGlow: v })}
          label="Cursor-Glow"
          description="Ambientes Licht, das dem Mauszeiger folgt."
          icon={<MousePointer size={14} />}
        />
      </div>

      <div className="admin-divider" />

      <p className="admin-label" style={{ marginBottom: '0.75rem' }}>Sektionen</p>
      <div className="admin-toggle-group">
        <ToggleSwitch
          checked={settings.showMarquee}
          onChange={v => update({ showMarquee: v })}
          label="Tech-Marquee"
          description="Laufband mit Tech-Stack-Icons unterhalb des Hero-Bereichs."
          icon={<Columns size={14} />}
        />
        <ToggleSwitch
          checked={settings.showLab}
          onChange={v => update({ showLab: v })}
          label="Lab-Sektion"
          description="Experimentelle Demos (Dot Wave, Scramble Text)."
          icon={<FlaskConical size={14} />}
        />
      </div>

      <p className="admin-hint" style={{ marginTop: '1.25rem' }}>
        Änderungen werden sofort gespeichert und sind nach einem Seiten-Reload für alle Besucher sichtbar.
      </p>
    </div>
  );
};

/* ── Section: SEO ────────────────────────────────────────────────── */
const SeoSection = ({ onSave }: { onSave: () => void }) => {
  const { content, updateContent } = useContent();
  const [form, setForm] = useState(content.seo ?? { title: '', description: '' });

  const save = () => {
    updateContent({ seo: form });
    onSave();
  };

  const charCount = form.description.length;
  const descColor = charCount > 160 ? 'rgba(252,165,165,0.8)' : charCount > 130 ? 'rgba(251,191,36,0.8)' : 'rgba(100,116,139,0.7)';

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">SEO</h2>
        <p className="admin-section-desc">Seitentitel und Meta-Beschreibung für Suchmaschinen.</p>
      </div>

      <div className="admin-form">
        <div className="admin-field">
          <label className="admin-label">Seitentitel</label>
          <input
            className="admin-input"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Leon Hecke — Frontend Developer"
          />
          <p className="admin-hint">Wird als Browser-Tab-Titel und in Suchergebnissen angezeigt. Idealerweise 50–60 Zeichen.</p>
        </div>

        <div className="admin-field">
          <label className="admin-label">Meta-Beschreibung</label>
          <textarea
            className="admin-textarea"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Kurze Beschreibung, die in Suchergebnissen erscheint…"
            style={{ minHeight: 80 }}
          />
          <p className="admin-hint" style={{ color: descColor }}>
            {charCount} / 160 Zeichen {charCount > 160 ? '— zu lang!' : charCount > 130 ? '— knapp' : ''}
          </p>
        </div>

        <div className="admin-form-actions">
          <button className="admin-btn admin-btn-primary" onClick={save}>
            <Check size={13} /> Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Section: Contact ────────────────────────────────────────────── */
const ContactSection = ({ onSave }: { onSave: () => void }) => {
  const { content, updateContent } = useContent();
  const [email, setEmail] = useState(content.contact.email);

  const save = () => {
    updateContent({ contact: { email } });
    onSave();
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Kontakt</h2>
        <p className="admin-section-desc">E-Mail-Adresse, die im Kontaktbereich angezeigt wird.</p>
      </div>
      <div className="admin-form">
        <div className="admin-field">
          <label className="admin-label">E-Mail</label>
          <input className="admin-input" type="email" value={email}
            onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="admin-form-actions">
          <button className="admin-btn admin-btn-primary" onClick={save}>
            <Check size={13} /> Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main AdminPage ──────────────────────────────────────────────── */
const NAV: { id: Section; label: string; icon: React.ReactNode; group?: string }[] = [
  { id: 'hero',         label: 'Hero',         icon: <User size={14} />,       group: 'Inhalt' },
  { id: 'about',        label: 'Skills',        icon: <Layers size={14} />,     group: 'Inhalt' },
  { id: 'capabilities', label: 'Capabilities',  icon: <Zap size={14} />,        group: 'Inhalt' },
  { id: 'projects',     label: 'Projekte',      icon: <FolderOpen size={14} />, group: 'Inhalt' },
  { id: 'timeline',     label: 'Timeline',      icon: <Clock size={14} />,      group: 'Inhalt' },
  { id: 'contact',      label: 'Kontakt',       icon: <Mail size={14} />,       group: 'Inhalt' },
  { id: 'visuals',      label: 'Visuals',       icon: <Sparkles size={14} />,   group: 'Site' },
  { id: 'seo',          label: 'SEO',           icon: <Search size={14} />,     group: 'Site' },
];

const IS_DEV = import.meta.env.DEV;

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => IS_DEV || !!sessionStorage.getItem(TOKEN_KEY));

  const logout = () => {
    if (IS_DEV) return; // no logout in dev
    sessionStorage.removeItem(TOKEN_KEY);
    setAuthed(false);
  };

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  return <AdminPanel onLogout={logout} />;
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState<Section>('hero');
  const [toast, setToast]     = useState(false);
  const timerRef              = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { resetToDefaults, syncError } = useContent();

  const showToast = useCallback(() => {
    setToast(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(false), 2200);
  }, []);

  const handleReset = () => {
    if (window.confirm('Alle Inhalte auf Standardwerte zurücksetzen?')) {
      resetToDefaults();
      showToast();
    }
  };

  return (
    <div className="admin-root">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-title">
          Leon CMS
          <span className="admin-header-badge">Admin</span>
        </div>
        <div className="admin-header-actions">
          <Link to="/" className="admin-back-link" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={12} /> Portfolio ansehen
          </Link>
          {!IS_DEV && (
            <button className="admin-back-link" onClick={onLogout} style={{ background: 'none', cursor: 'pointer' }}>
              <ArrowLeft size={12} /> Abmelden
            </button>
          )}
        </div>
      </header>

      <div className="admin-body">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          {(['Inhalt', 'Site'] as const).map(group => (
            <div key={group}>
              <span className="admin-sidebar-label">{group}</span>
              {NAV.filter(n => n.group === group).map(item => (
                <button
                  key={item.id}
                  className={`admin-nav-item${section === item.id ? ' active' : ''}`}
                  onClick={() => setSection(item.id)}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          ))}

          <span className="admin-sidebar-label" style={{ marginTop: 'auto' }}>Verwaltung</span>
          <button className="admin-nav-item" onClick={handleReset}>
            <RotateCcw size={14} /> Reset
          </button>
        </aside>

        {/* Content */}
        <main className="admin-main">
          {section === 'hero'         && <HeroSection         onSave={showToast} />}
          {section === 'about'        && <AboutSection        onSave={showToast} />}
          {section === 'capabilities' && <CapabilitiesSection onSave={showToast} />}
          {section === 'projects'     && <ProjectsSection     onSave={showToast} />}
          {section === 'timeline'     && <TimelineSection     onSave={showToast} />}
          {section === 'contact'      && <ContactSection      onSave={showToast} />}
          {section === 'visuals'      && <VisualsSection      onSave={showToast} />}
          {section === 'seo'          && <SeoSection          onSave={showToast} />}
        </main>
      </div>

      <Toast visible={toast} error={syncError} />
    </div>
  );
}
