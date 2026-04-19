import { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

type Mode    = 'attract' | 'repel' | 'orbit';
type Palette = 'cosmic' | 'ember' | 'aurora';

const PALETTE: Record<Palette, { base: number; range: number; bg: string }> = {
  cosmic: { base: 215, range: 65, bg: 'rgba(8,12,20,0.18)'   },
  ember:  { base: 18,  range: 40, bg: 'rgba(12,8,6,0.18)'    },
  aurora: { base: 145, range: 65, bg: 'rgba(6,12,10,0.18)'   },
};

const COUNT_PRESETS = [80, 130, 200] as const;
const MAX = 200;
const CONN_DIST  = 90;
const CONN_DIST2 = CONN_DIST * CONN_DIST;

// ─── Shared typed arrays (single allocation for the lifetime of the module) ──
const _px  = new Float32Array(MAX);
const _py  = new Float32Array(MAX);
const _pvx = new Float32Array(MAX);
const _pvy = new Float32Array(MAX);
const _pr  = new Float32Array(MAX);
const _ph  = new Float32Array(MAX);

const VeloxCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // All hot-path state lives in refs — no React re-renders mid-frame
  const mouseRef    = useRef({ x: 0, y: 0, active: false });
  const modeRef     = useRef<Mode>('attract');
  const pausedRef   = useRef(false);
  const connectRef  = useRef(false);
  const strengthRef = useRef(1);
  const burstRef   = useRef<{ x: number; y: number } | null>(null);
  const resetSig   = useRef(false);
  const recolorSig = useRef(false);
  const paletteRef = useRef<Palette>('cosmic');
  const countRef   = useRef<130 | 80 | 200>(130);

  const [mode,    setMode]    = useState<Mode>('attract');
  const [palette, setPalette] = useState<Palette>('cosmic');
  const [count,   setCount]   = useState<130 | 80 | 200>(130);
  const [paused,   setPaused]   = useState(false);
  const [connect,  setConnect]  = useState(false);
  const [strength, setStrength] = useState(1);
  const [fps,      setFps]      = useState(0);
  const { t } = useLanguage();

  const scatter = useCallback((w: number, h: number, pal: Palette) => {
    const { base, range } = PALETTE[pal];
    for (let i = 0; i < MAX; i++) {
      _px[i]  = Math.random() * w;
      _py[i]  = Math.random() * h;
      _pvx[i] = (Math.random() - 0.5) * 1.5;
      _pvy[i] = (Math.random() - 0.5) * 1.5;
      _pr[i]  = Math.random() * 2 + 1;
      _ph[i]  = base + Math.random() * range;
    }
  }, []);

  const recolor = useCallback((pal: Palette) => {
    const { base, range } = PALETTE[pal];
    for (let i = 0; i < MAX; i++) _ph[i] = base + Math.random() * range;
  }, []);

  // Sync refs
  useEffect(() => { modeRef.current   = mode;    }, [mode]);
  useEffect(() => { pausedRef.current  = paused;  }, [paused]);
  useEffect(() => { connectRef.current  = connect;  }, [connect]);
  useEffect(() => { strengthRef.current = strength; }, [strength]);
  useEffect(() => { countRef.current   = count;   }, [count]);
  useEffect(() => {
    paletteRef.current = palette;
    recolorSig.current = true;
  }, [palette]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;
    let animId: number;
    let dpr = 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    resize();
    scatter(canvas.offsetWidth, canvas.offsetHeight, paletteRef.current);
    window.addEventListener('resize', resize);

    // FPS state update from inside RAF — throttled to 1×/sec
    let frameCount  = 0;
    let fpsLastTime = performance.now();
    let prevTime    = performance.now();

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);

      // FPS counter (1× per second)
      frameCount++;
      if (now - fpsLastTime >= 1000) {
        setFps(Math.round(frameCount * 1000 / (now - fpsLastTime)));
        frameCount  = 0;
        fpsLastTime = now;
      }

      const dt = Math.min((now - prevTime) / 16.667, 2.5); // normalized Δt, tab-switch guard
      prevTime = now;

      if (pausedRef.current) return;

      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;

      // ── Signals ───────────────────────────────────────────────────────────
      if (resetSig.current) {
        resetSig.current = false;
        scatter(W, H, paletteRef.current);
        ctx.clearRect(0, 0, W, H);
      }
      if (recolorSig.current) {
        recolorSig.current = false;
        recolor(paletteRef.current);
      }

      const pal  = paletteRef.current;
      const n    = countRef.current;
      const { x: mx, y: my, active } = mouseRef.current;
      const curMode  = modeRef.current;
      const doConn   = connectRef.current;
      const bgFill   = PALETTE[pal].bg;

      // Trail fade — semi-transparent fill is the "motion blur" trick
      ctx.fillStyle = bgFill;
      ctx.fillRect(0, 0, W, H);

      // ── Click burst ───────────────────────────────────────────────────────
      const burst = burstRef.current;
      if (burst) {
        burstRef.current = null;
        for (let i = 0; i < n; i++) {
          const dx   = _px[i] - burst.x;
          const dy   = _py[i] - burst.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const f    = Math.min(900 / dist, 14);
          _pvx[i] += (dx / dist) * f;
          _pvy[i] += (dy / dist) * f;
        }
      }

      // ── Connection web (O(n²), only when toggled) ─────────────────────────
      if (doConn) {
        ctx.lineWidth = 0.6;
        for (let i = 0; i < n - 1; i++) {
          for (let j = i + 1; j < n; j++) {
            const dx = _px[i] - _px[j];
            const dy = _py[i] - _py[j];
            const d2 = dx * dx + dy * dy;
            if (d2 < CONN_DIST2) {
              const alpha = (1 - Math.sqrt(d2) / CONN_DIST) * 0.28;
              ctx.globalAlpha = alpha;
              ctx.strokeStyle = `hsl(${_ph[i]}, 70%, 65%)`;
              ctx.beginPath();
              ctx.moveTo(_px[i], _py[i]);
              ctx.lineTo(_px[j], _py[j]);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      // ── Particle update + draw ────────────────────────────────────────────
      for (let i = 0; i < n; i++) {
        // Mouse force
        if (active) {
          const dx   = mx - _px[i];
          const dy   = my - _py[i];
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const f    = Math.min(2400 / (dist * dist), 3.5) * strengthRef.current;

          if (curMode === 'attract') {
            _pvx[i] += (dx / dist) * f * 0.045 * dt;
            _pvy[i] += (dy / dist) * f * 0.045 * dt;
          } else if (curMode === 'repel') {
            _pvx[i] -= (dx / dist) * f * 0.07 * dt;
            _pvy[i] -= (dy / dist) * f * 0.07 * dt;
          } else {
            _pvx[i] += ((dy / dist) * f * 0.03 - (dx / dist) * 0.012) * dt;
            _pvy[i] -= ((dx / dist) * f * 0.03 - (dy / dist) * 0.012) * dt;
          }
        }

        // Dampen + integrate
        const damp = Math.pow(0.972, dt);
        _pvx[i] *= damp;
        _pvy[i] *= damp;
        _px[i]  += _pvx[i] * dt;
        _py[i]  += _pvy[i] * dt;

        // Wrap edges
        if      (_px[i] < 0) _px[i] = W;
        else if (_px[i] > W) _px[i] = 0;
        if      (_py[i] < 0) _py[i] = H;
        else if (_py[i] > H) _py[i] = 0;

        const vx    = _pvx[i];
        const vy    = _pvy[i];
        const speed = Math.sqrt(vx * vx + vy * vy);
        const hue   = Math.round(_ph[i] + speed * 11);  // integer hue → fewer unique color strings
        const alpha = Math.min(0.92, 0.35 + speed * 0.18);
        const x     = _px[i];
        const y     = _py[i];
        const r     = _pr[i];

        // Trail — globalAlpha line, no gradient object allocation
        if (speed > 0.35) {
          ctx.globalAlpha = alpha * 0.42;
          ctx.strokeStyle = `hsl(${hue},80%,65%)`;
          ctx.lineWidth   = r * 0.8;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - vx * 6, y - vy * 6);
          ctx.stroke();
        }

        // Core dot
        ctx.globalAlpha = alpha;
        ctx.fillStyle   = `hsl(${hue},80%,68%)`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 6.2832); // 6.2832 ≈ 2π, avoids Math.PI each frame
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    animId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [scatter, recolor]);

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect();
    mouseRef.current.x      = e.clientX - r.left;
    mouseRef.current.y      = e.clientY - r.top;
    mouseRef.current.active = true;
  };
  const onMouseLeave = () => { mouseRef.current.active = false; };
  const onClick      = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect();
    burstRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onReset = () => { resetSig.current = true; };

  // ── Styles ────────────────────────────────────────────────────────────────
  const pill = (active: boolean): React.CSSProperties => ({
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11.5px',
    padding: '3px 11px',
    borderRadius: '6px',
    border: active ? '1px solid rgba(96,165,250,0.5)' : '1px solid rgba(255,255,255,0.07)',
    background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
    color: active ? 'rgba(147,197,253,0.95)' : 'rgba(148,163,184,0.5)',
    cursor: 'pointer',
    transition: 'all 0.18s',
    textTransform: 'capitalize',
  });

  const paletteDot: Record<Palette, string> = {
    cosmic: '#60a5fa',
    ember:  '#fb923c',
    aurora: '#34d399',
  };

  const iconBtn: React.CSSProperties = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11.5px',
    padding: '3px 10px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.07)',
    background: 'transparent',
    color: 'rgba(148,163,184,0.55)',
    cursor: 'pointer',
    transition: 'all 0.18s',
  };

  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>

      {/* ── Toolbar ── */}
      <div style={{
        padding: '8px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.02)',
      }}>

        {/* Mode */}
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(148,163,184,0.38)' }}>{t('velox.label.mode')}</span>
        {(['attract', 'repel', 'orbit'] as Mode[]).map(m => (
          <button key={m} style={pill(mode === m)} onClick={() => setMode(m)}>{t(`velox.mode.${m}`)}</button>
        ))}

        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.07)', margin: '0 2px' }} />

        {/* Force strength */}
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(148,163,184,0.38)' }}>{t('velox.label.force')}</span>
        <input
          type="range"
          min={0.2}
          max={2}
          step={0.05}
          value={strength}
          onChange={e => setStrength(Number(e.target.value))}
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            width: '80px',
            height: '3px',
            borderRadius: '2px',
            background: `linear-gradient(to right, rgba(96,165,250,0.7) ${((strength - 0.2) / 1.8) * 100}%, rgba(255,255,255,0.1) ${((strength - 0.2) / 1.8) * 100}%)`,
            outline: 'none',
            cursor: 'pointer',
          }}
        />
        <span style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(147,197,253,0.6)', minWidth: '28px' }}>
          {strength.toFixed(1)}×
        </span>

        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.07)', margin: '0 2px' }} />

        {/* Palette */}
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(148,163,184,0.38)' }}>{t('velox.label.palette')}</span>
        {(['cosmic', 'ember', 'aurora'] as Palette[]).map(p => (
          <button key={p} style={pill(palette === p)} onClick={() => setPalette(p)}>
            <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: paletteDot[p], marginRight: '5px', verticalAlign: 'middle' }} />
            {p}
          </button>
        ))}

        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.07)', margin: '0 2px' }} />

        {/* Particle count */}
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(148,163,184,0.38)' }}>{t('velox.label.particles')}</span>
        {COUNT_PRESETS.map(c => (
          <button key={c} style={pill(count === c)} onClick={() => setCount(c as 80|130|200)}>{c}</button>
        ))}

        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.07)', margin: '0 2px' }} />

        {/* Toggles */}
        <button style={pill(connect)} onClick={() => setConnect(v => !v)}>{t('velox.btn.web')}</button>
        <button style={pill(paused)} onClick={() => setPaused(v => !v)}>
          {paused ? t('velox.btn.play') : t('velox.btn.pause')}
        </button>
        <button style={iconBtn} onClick={onReset}>{t('velox.btn.reset')}</button>

        {/* FPS */}
        <span style={{
          fontFamily: 'monospace',
          fontSize: '11px',
          color: fps >= 55 ? 'rgba(52,211,153,0.5)' : fps >= 30 ? 'rgba(251,191,36,0.5)' : 'rgba(248,113,113,0.5)',
          marginLeft: 'auto',
        }}>
          {fps} fps
        </span>
      </div>

      {/* ── Canvas ── */}
      <canvas
        ref={canvasRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        style={{
          display: 'block',
          width: '100%',
          height: '420px',
          cursor: 'crosshair',
          background: '#080C14',
        }}
      />

      {/* ── Hint bar ── */}
      <div style={{
        padding: '6px 14px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(255,255,255,0.015)',
        display: 'flex',
        gap: '16px',
      }}>
        {([
          ['velox.hint.hoverLabel', 'velox.hint.hover'],
          ['velox.hint.clickLabel', 'velox.hint.click'],
          ['velox.hint.webLabel',   'velox.hint.web'],
        ] as const).map(([labelKey, descKey]) => (
          <span key={labelKey} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10.5px', color: 'rgba(148,163,184,0.28)' }}>
            <span style={{ color: 'rgba(148,163,184,0.5)' }}>{t(labelKey)}</span> — {t(descKey)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default VeloxCanvas;
