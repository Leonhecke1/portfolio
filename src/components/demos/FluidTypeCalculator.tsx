import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const STRINGS = {
  de: {
    minSize: 'Kleinste Größe (px)',
    maxSize: 'Größte Größe (px)',
    minVw: 'Ab Viewport (px)',
    maxVw: 'Bis Viewport (px)',
    root: 'Root-Schriftgröße (px)',
    result: 'Fertige CSS-Regel',
    copy: 'Kopieren',
    copied: 'Kopiert.',
    copyFailed: 'Kopieren ging nicht; bitte markieren und selbst kopieren.',
    preview: 'Vorschau bei Viewport-Breite',
    sample: 'Fließende Typografie',
    computed: 'ergibt',
    invalid: 'Die größte Größe und der größte Viewport müssen über den kleinsten liegen.',
    zoomNote: 'In rem gerechnet, damit Browser-Zoom und eigene Schriftgrößen weiter wirken.',
  },
  en: {
    minSize: 'Smallest size (px)',
    maxSize: 'Largest size (px)',
    minVw: 'From viewport (px)',
    maxVw: 'To viewport (px)',
    root: 'Root font size (px)',
    result: 'Ready-made CSS rule',
    copy: 'Copy',
    copied: 'Copied.',
    copyFailed: 'Copying failed; please select and copy it yourself.',
    preview: 'Preview at viewport width',
    sample: 'Fluid typography',
    computed: 'gives',
    invalid: 'The largest size and viewport must be above the smallest.',
    zoomNote: 'Computed in rem so browser zoom and user font sizes keep working.',
  },
};

const round = (n: number, d = 4) => Number(n.toFixed(d));

const fluidClamp = (minSize: number, maxSize: number, minVw: number, maxVw: number, root: number) => {
  const slope = (maxSize - minSize) / (maxVw - minVw);
  const intercept = minSize - slope * minVw;
  return {
    css: `clamp(${round(minSize / root)}rem, ${round(intercept / root)}rem + ${round(slope * 100)}vw, ${round(maxSize / root)}rem)`,
    at: (vw: number) => Math.min(maxSize, Math.max(minSize, intercept + slope * vw)),
  };
};

const NumberField: React.FC<{ id: string; label: string; value: number; onChange: (n: number) => void }> = ({ id, label, value, onChange }) => (
  <div className="demo-field">
    <label htmlFor={id}>{label}</label>
    <input id={id} type="number" inputMode="numeric" value={value} min={1} onChange={(e) => onChange(Number(e.target.value))} />
  </div>
);

const FluidTypeCalculator: React.FC = () => {
  const { language } = useLanguage();
  const s = STRINGS[language];
  const [minSize, setMinSize] = useState(18);
  const [maxSize, setMaxSize] = useState(32);
  const [minVw, setMinVw] = useState(375);
  const [maxVw, setMaxVw] = useState(1440);
  const [root, setRoot] = useState(16);
  const [vw, setVw] = useState(900);
  const [status, setStatus] = useState('');

  const valid = maxSize > minSize && maxVw > minVw && root > 0;
  const fluid = valid ? fluidClamp(minSize, maxSize, minVw, maxVw, root) : null;
  const rule = fluid ? `font-size: ${fluid.css};` : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(rule);
      setStatus(s.copied);
    } catch {
      setStatus(s.copyFailed);
    }
  };

  const range = { min: Math.max(240, minVw - 200), max: maxVw + 300 };

  return (
    <div className="demo fluid">
      <div className="fluid-inputs">
        <NumberField id="fluid-min-size" label={s.minSize} value={minSize} onChange={setMinSize} />
        <NumberField id="fluid-max-size" label={s.maxSize} value={maxSize} onChange={setMaxSize} />
        <NumberField id="fluid-min-vw" label={s.minVw} value={minVw} onChange={setMinVw} />
        <NumberField id="fluid-max-vw" label={s.maxVw} value={maxVw} onChange={setMaxVw} />
        <NumberField id="fluid-root" label={s.root} value={root} onChange={setRoot} />
      </div>

      {!fluid ? (
        <p className="demo-error" role="alert">{s.invalid}</p>
      ) : (
        <>
          <div className="fluid-result">
            <p className="parts-title">{s.result}</p>
            <pre><code>{rule}</code></pre>
            <div className="demo-actions">
              <button type="button" className="btn" onClick={copy}>{s.copy}</button>
              <span className="demo-note" role="status">{status}</span>
            </div>
            <p className="demo-note">{s.zoomNote}</p>
          </div>

          <div className="fluid-preview">
            <label className="demo-field demo-field--range" htmlFor="fluid-vw">
              <span>{s.preview} <output>{vw}px</output> {s.computed} <output>{fluid.at(vw).toFixed(1)}px</output></span>
            </label>
            <input id="fluid-vw" type="range" min={range.min} max={range.max} value={vw} onChange={(e) => setVw(Number(e.target.value))} />
            {/* The ruler marks where the size stops growing at each end. */}
            <div className="fluid-ruler" aria-hidden="true">
              <span style={{ left: `${((minVw - range.min) / (range.max - range.min)) * 100}%` }}>{minVw}</span>
              <span style={{ left: `${((maxVw - range.min) / (range.max - range.min)) * 100}%` }}>{maxVw}</span>
            </div>
            <div className="fluid-stage">
              <p style={{ fontSize: `${fluid.at(vw)}px` }}>{s.sample}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FluidTypeCalculator;
