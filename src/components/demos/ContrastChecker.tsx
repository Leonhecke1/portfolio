import React, { useMemo, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const STRINGS = {
  de: {
    text: 'Textfarbe',
    background: 'Hintergrund',
    swap: 'Farben tauschen',
    ratio: 'Kontrastverhältnis',
    normal: 'Normaler Text',
    large: 'Großer Text (ab 24 px oder 18,5 px fett)',
    ui: 'Bedienelemente und Grafiken',
    pass: 'erfüllt',
    fail: 'nicht erfüllt',
    preview: 'So liest sich ein Absatz in dieser Kombination. Gute Kontraste helfen allen, nicht nur Menschen mit Sehschwäche.',
    previewLarge: 'Große Überschrift',
    suggestion: 'Vorschlag für AA',
    suggestionNote: 'Gleicher Farbton, angepasste Helligkeit, bis 4,5 : 1 erreicht ist.',
    apply: 'Übernehmen',
    invalid: 'Bitte einen Hex-Wert wie #1d1f24 eingeben.',
    allGood: 'Diese Kombination erfüllt bereits AA für normalen Text.',
  },
  en: {
    text: 'Text colour',
    background: 'Background',
    swap: 'Swap colours',
    ratio: 'Contrast ratio',
    normal: 'Normal text',
    large: 'Large text (24 px, or 18.5 px bold)',
    ui: 'UI components and graphics',
    pass: 'passes',
    fail: 'fails',
    preview: 'This is how a paragraph reads in this combination. Good contrast helps everyone, not only people with low vision.',
    previewLarge: 'Large heading',
    suggestion: 'Suggestion for AA',
    suggestionNote: 'Same hue, adjusted lightness, until 4.5 : 1 is reached.',
    apply: 'Apply',
    invalid: 'Please enter a hex value like #1d1f24.',
    allGood: 'This combination already passes AA for normal text.',
  },
};

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

const parse = (hex: string): [number, number, number] | null => {
  const m = hex.trim().match(HEX);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
};

const toHex = (rgb: number[]) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

// WCAG 2.x relative luminance and contrast ratio.
const luminance = ([r, g, b]: number[]) => {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const contrast = (a: number[], b: number[]) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

const rgbToHsl = ([r, g, b]: number[]) => {
  const [rr, gg, bb] = [r / 255, g / 255, b / 255];
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === rr ? (gg - bb) / d + (gg < bb ? 6 : 0) : max === gg ? (bb - rr) / d + 2 : (rr - gg) / d + 4;
  return [h / 6, s, l];
};

const hslToRgb = ([h, s, l]: number[]) => {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t: number) => {
    const tt = (t + 1) % 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [hue(h + 1 / 3) * 255, hue(h) * 255, hue(h - 1 / 3) * 255];
};

// Walk the text colour's lightness away from the background until the ratio reaches the target.
const suggest = (fg: number[], bg: number[], target = 4.5) => {
  const [h, s, l] = rgbToHsl(fg);
  const darker = luminance(bg) > 0.18;
  for (let step = 0; step <= 100; step++) {
    const nl = darker ? l - step / 100 : l + step / 100;
    if (nl < 0 || nl > 1) break;
    const rgb = hslToRgb([h, s, nl]);
    if (contrast(rgb, bg) >= target) return toHex(rgb);
  }
  return darker ? '#000000' : '#ffffff';
};

const ColorInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; invalid: string }> = ({ label, value, onChange, invalid }) => {
  const ok = parse(value) !== null;
  const id = label.replace(/\s/g, '-').toLowerCase();
  return (
    <div className="demo-field">
      <label htmlFor={id}>{label}</label>
      <div className="color-input">
        <input type="color" value={ok ? toHex(parse(value)!) : '#000000'} onChange={(e) => onChange(e.target.value)} aria-label={label} />
        <input id={id} type="text" value={value} spellCheck={false} onChange={(e) => onChange(e.target.value)} aria-invalid={!ok} />
      </div>
      {!ok && <p className="demo-error">{invalid}</p>}
    </div>
  );
};

const ContrastChecker: React.FC = () => {
  const { language } = useLanguage();
  const s = STRINGS[language];
  const [fg, setFg] = useState('#8a8f98');
  const [bg, setBg] = useState('#f4f4f1');

  const result = useMemo(() => {
    const a = parse(fg);
    const b = parse(bg);
    if (!a || !b) return null;
    const ratio = contrast(a, b);
    return { a, b, ratio, fix: ratio < 4.5 ? suggest(a, b) : null };
  }, [fg, bg]);

  const checks = result
    ? [
        { label: s.normal, aa: result.ratio >= 4.5, aaa: result.ratio >= 7 },
        { label: s.large, aa: result.ratio >= 3, aaa: result.ratio >= 4.5 },
        { label: s.ui, aa: result.ratio >= 3, aaa: null },
      ]
    : [];

  return (
    <div className="demo contrast">
      <div className="demo-controls">
        <ColorInput label={s.text} value={fg} onChange={setFg} invalid={s.invalid} />
        <button type="button" className="btn-accent contrast-swap" onClick={() => { setFg(bg); setBg(fg); }}>{s.swap}</button>
        <ColorInput label={s.background} value={bg} onChange={setBg} invalid={s.invalid} />
      </div>

      {result && (
        <>
          <div className="contrast-preview" style={{ color: toHex(result.a), background: toHex(result.b) }}>
            <p className="contrast-preview-large">{s.previewLarge}</p>
            <p>{s.preview}</p>
          </div>

          <div className="contrast-result">
            <p className="contrast-ratio" aria-live="polite">
              <span>{s.ratio}</span>
              <b>{result.ratio.toFixed(2)} : 1</b>
            </p>
            <table className="demo-table">
              <tbody>
                {checks.map((c) => (
                  <tr key={c.label}>
                    <th scope="row">{c.label}</th>
                    <td><span className={`badge ${c.aa ? 'is-good' : 'is-bad'}`}>AA {c.aa ? s.pass : s.fail}</span></td>
                    <td>{c.aaa !== null && <span className={`badge ${c.aaa ? 'is-good' : 'is-bad'}`}>AAA {c.aaa ? s.pass : s.fail}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.fix ? (
            <div className="contrast-fix">
              <span className="contrast-chip" style={{ background: result.fix }} aria-hidden="true" />
              <div>
                <p className="contrast-fix-title">{s.suggestion}: <code>{result.fix}</code></p>
                <p className="demo-note">{s.suggestionNote}</p>
              </div>
              <button type="button" className="btn" onClick={() => setFg(result.fix!)}>{s.apply}</button>
            </div>
          ) : (
            <p className="demo-note">{s.allGood}</p>
          )}
        </>
      )}
    </div>
  );
};

export default ContrastChecker;
