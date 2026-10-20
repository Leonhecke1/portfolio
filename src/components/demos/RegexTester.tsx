import React, { useMemo, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

type Lang = 'de' | 'en';

const STRINGS = {
  de: {
    pattern: 'Muster',
    flags: 'Flags',
    text: 'Testtext',
    matches: (n: number) => (n === 1 ? '1 Treffer' : `${n} Treffer`),
    explain: 'Was das Muster bedeutet',
    groups: 'Gruppen',
    none: 'Kein Treffer.',
    invalid: 'Ungültiges Muster',
    presets: 'Beispiele',
    flagNames: { g: 'alle Treffer', i: 'Groß/klein egal', m: 'mehrzeilig', s: 'Punkt trifft Zeilenumbruch', u: 'Unicode' },
  },
  en: {
    pattern: 'Pattern',
    flags: 'Flags',
    text: 'Test text',
    matches: (n: number) => (n === 1 ? '1 match' : `${n} matches`),
    explain: 'What the pattern means',
    groups: 'Groups',
    none: 'No match.',
    invalid: 'Invalid pattern',
    presets: 'Examples',
    flagNames: { g: 'all matches', i: 'ignore case', m: 'multiline', s: 'dot matches newline', u: 'unicode' },
  },
};

const PRESETS = [
  { label: 'E-Mail', pattern: '([\\w.+-]+)@([\\w-]+\\.[\\w.]+)', text: 'Schreib an team@example.org oder support+web@shop.example.de.' },
  { label: 'Datum', pattern: '(\\d{2})\\.(\\d{2})\\.(\\d{4})', text: 'Release am 20.10.2026, Hotfix am 03.11.2026.' },
  { label: 'Hex-Farbe', pattern: '#(?:[0-9a-f]{3}){1,2}\\b', text: 'color: #1d1f24; background: #f4f4f1; border: #ccc;' },
];

const FLAGS = ['g', 'i', 'm', 's', 'u'] as const;

// A small tokenizer that names the most common building blocks of a pattern.
const explain = (pattern: string, lang: Lang): { token: string; text: string }[] => {
  const de = lang === 'de';
  const out: { token: string; text: string }[] = [];
  const named: Record<string, [string, string]> = {
    '\\d': ['eine Ziffer (0–9)', 'a digit (0–9)'],
    '\\D': ['ein Zeichen, das keine Ziffer ist', 'a non-digit'],
    '\\w': ['ein Wortzeichen (Buchstabe, Ziffer, _)', 'a word character (letter, digit, _)'],
    '\\W': ['ein Zeichen, das kein Wortzeichen ist', 'a non-word character'],
    '\\s': ['ein Leerraum (Leerzeichen, Tab, Umbruch)', 'whitespace (space, tab, newline)'],
    '\\S': ['ein Zeichen, das kein Leerraum ist', 'a non-whitespace character'],
    '\\b': ['eine Wortgrenze', 'a word boundary'],
    '.': ['ein beliebiges Zeichen', 'any character'],
    '^': ['Anfang der Zeile', 'start of line'],
    '$': ['Ende der Zeile', 'end of line'],
    '|': ['oder', 'or'],
  };
  let i = 0;
  while (i < pattern.length) {
    const rest = pattern.slice(i);
    const quant = rest.match(/^(\{\d+(,\d*)?\}|[*+?])\??/);
    const cls = rest.match(/^\[(\^?)((?:\\.|[^\]])*)\]/);
    const group = rest.match(/^\((\?:|\?=|\?!|\?<[a-zA-Z]+>)?/);
    if (quant) {
      const q = quant[1];
      let text: string;
      if (q === '*') text = de ? 'davor: beliebig oft, auch gar nicht' : 'previous: any number of times, including none';
      else if (q === '+') text = de ? 'davor: mindestens einmal' : 'previous: at least once';
      else if (q === '?') text = de ? 'davor: optional' : 'previous: optional';
      else {
        const [, a, b] = q.match(/\{(\d+)(?:,(\d*))?\}/)!;
        const hasComma = q.includes(',');
        text = !hasComma
          ? (de ? `davor: genau ${a}-mal` : `previous: exactly ${a} times`)
          : b
            ? (de ? `davor: ${a}- bis ${b}-mal` : `previous: ${a} to ${b} times`)
            : (de ? `davor: mindestens ${a}-mal` : `previous: at least ${a} times`);
      }
      if (quant[0].endsWith('?') && q !== '?') text += de ? ' (so wenig wie möglich)' : ' (as few as possible)';
      out.push({ token: quant[0], text });
      i += quant[0].length;
    } else if (cls) {
      const neg = cls[1] === '^';
      out.push({ token: cls[0], text: de ? `ein Zeichen ${neg ? 'außer' : 'aus'}: ${cls[2]}` : `one character ${neg ? 'except' : 'from'}: ${cls[2]}` });
      i += cls[0].length;
    } else if (rest[0] === '(' && group) {
      const kind = group[1];
      const text = !kind
        ? (de ? 'Beginn einer Gruppe, die gemerkt wird' : 'start of a captured group')
        : kind === '?:'
          ? (de ? 'Beginn einer Gruppe, die nicht gemerkt wird' : 'start of a non-capturing group')
          : kind === '?='
            ? (de ? 'nur wenn danach folgt …' : 'only if followed by …')
            : kind === '?!'
              ? (de ? 'nur wenn danach nicht folgt …' : 'only if not followed by …')
              : (de ? `Beginn der benannten Gruppe „${kind.slice(2, -1)}“` : `start of the named group “${kind.slice(2, -1)}”`);
      out.push({ token: group[0], text });
      i += group[0].length;
    } else if (rest[0] === ')') {
      out.push({ token: ')', text: de ? 'Ende der Gruppe' : 'end of group' });
      i += 1;
    } else if (rest[0] === '\\' && rest.length > 1) {
      const tok = rest.slice(0, 2);
      const n = named[tok];
      out.push({ token: tok, text: n ? n[de ? 0 : 1] : (de ? `das Zeichen „${tok[1]}“` : `the character “${tok[1]}”`) });
      i += 2;
    } else if (named[rest[0]]) {
      out.push({ token: rest[0], text: named[rest[0]][de ? 0 : 1] });
      i += 1;
    } else {
      // Merge runs of plain characters into one literal.
      // A stray brace or bracket that is not a quantifier or class is still a single literal character.
      const lit = (rest.match(/^[^\\[\](){}*+?.^$|]+/) ?? [rest[0]])[0];
      out.push({ token: lit, text: de ? `genau der Text „${lit}“` : `exactly the text “${lit}”` });
      i += lit.length;
    }
  }
  return out;
};

const RegexTester: React.FC = () => {
  const { language } = useLanguage();
  const s = STRINGS[language];
  const [pattern, setPattern] = useState(PRESETS[0].pattern);
  const [flags, setFlags] = useState<Set<string>>(() => new Set(['g', 'i']));
  const [text, setText] = useState(PRESETS[0].text);

  const result = useMemo(() => {
    const f = [...flags].join('');
    try {
      const re = new RegExp(pattern, f.includes('g') ? f : `${f}g`);
      const matches = pattern ? [...text.matchAll(re)].filter((m) => m[0].length > 0) : [];
      return { matches: f.includes('g') ? matches : matches.slice(0, 1), error: '' };
    } catch (err) {
      return { matches: [] as RegExpMatchArray[], error: (err as Error).message };
    }
  }, [pattern, flags, text]);

  // Highlighted copy of the test text, split around each match.
  const pieces: React.ReactNode[] = [];
  let cursor = 0;
  result.matches.forEach((m, i) => {
    const start = m.index ?? 0;
    if (start > cursor) pieces.push(text.slice(cursor, start));
    pieces.push(<mark key={i}>{m[0]}</mark>);
    cursor = start + m[0].length;
  });
  pieces.push(text.slice(cursor));

  const toggle = (flag: string) =>
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });

  return (
    <div className="demo regex">
      <div className="demo-presets" role="group" aria-label={s.presets}>
        {PRESETS.map((p) => (
          <button key={p.label} type="button" className="chip" onClick={() => { setPattern(p.pattern); setText(p.text); }}>{p.label}</button>
        ))}
      </div>

      <div className="demo-field">
        <label htmlFor="regex-pattern">{s.pattern}</label>
        <div className="regex-input">
          <span aria-hidden="true">/</span>
          <input id="regex-pattern" type="text" value={pattern} spellCheck={false} onChange={(e) => setPattern(e.target.value)} aria-invalid={Boolean(result.error)} />
          <span aria-hidden="true">/{[...flags].join('')}</span>
        </div>
        {result.error && <p className="demo-error" role="alert">{s.invalid}: {result.error}</p>}
      </div>

      <fieldset className="regex-flags">
        <legend>{s.flags}</legend>
        {FLAGS.map((f) => (
          <label key={f} className="toggle">
            <input type="checkbox" checked={flags.has(f)} onChange={() => toggle(f)} />
            <code>{f}</code> {s.flagNames[f]}
          </label>
        ))}
      </fieldset>

      <div className="demo-field">
        <label htmlFor="regex-text">{s.text}</label>
        <textarea id="regex-text" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
      </div>

      <div className="regex-output">
        <p className="regex-count" aria-live="polite">{s.matches(result.matches.length)}</p>
        <p className="regex-highlight">{pieces}</p>
        {result.matches.length === 0 && !result.error && <p className="demo-note">{s.none}</p>}
        {result.matches.some((m) => m.length > 1) && (
          <table className="demo-table">
            <caption>{s.groups}</caption>
            <tbody>
              {result.matches.map((m, i) => (
                <tr key={i}>
                  <th scope="row"><code>{m[0]}</code></th>
                  {m.slice(1).map((g, j) => <td key={j}><span className="group-num">{j + 1}</span>{g ?? '–'}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!result.error && pattern && (
        <div className="regex-explain">
          <p className="parts-title">{s.explain}</p>
          <ol>
            {explain(pattern, language).map((e, i) => (
              <li key={i}><code>{e.token}</code><span>{e.text}</span></li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default RegexTester;
