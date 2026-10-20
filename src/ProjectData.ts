// Every project is a working demo inside the portfolio, sized so it could grow into its own repository.
export type BrickColor = 'red' | 'blue' | 'ink' | 'orange' | 'purple' | 'green' | 'yellow';

export interface Brick {
  color: BrickColor;
}

type Localized = { de: string; en: string };

export interface Project {
  id: number;
  title: Localized;
  description: Localized;
  objectClass: Localized;
  technologies: string[];
  // Public repository, once it exists. Left empty rather than pointing at a placeholder.
  repo?: string;
  // The project's colour in the home-page model; its geometry lives in buildData.ts.
  brick: Brick;
  technicalInsight: Localized;
  codeSnippets?: {
    title: string;
    code: string;
    language: string;
  }[];
}

export const projects: Project[] = [
  {
    id: 1,
    title: { de: 'CSS Grid Generator', en: 'CSS Grid Generator' },
    description: {
      de: 'Ein interaktives Werkzeug, um CSS-Grids visuell zu entwerfen: Rasterdimensionen festlegen, Zellen zusammenführen und den passenden `grid-template-areas`-Code erzeugen.',
      en: 'An interactive tool to visually design CSS grids: set the dimensions, merge cells and generate the matching `grid-template-areas` code.',
    },
    objectClass: { de: 'Layout-Werkzeug', en: 'Layout tool' },
    technologies: ['React', 'TypeScript', 'CSS Grid', 'Immer'],
    brick: { color: 'red' },
    technicalInsight: {
      de: 'Das Raster liegt als Matrix aus Bereichsnamen im State. Beim Zusammenführen prüft der Generator, ob die Auswahl ein lückenloses Rechteck bildet, und schreibt den neuen Namen mit Immer unveränderlich in die Matrix. Aus derselben Matrix entstehen die Vorschau und der CSS-Code, damit beide nie auseinanderlaufen.',
      en: 'The grid lives in state as a matrix of area names. When merging, the generator checks that the selection forms a gap-free rectangle and writes the new name into the matrix immutably with Immer. The preview and the CSS output are both derived from that one matrix, so they can never drift apart.',
    },
    codeSnippets: [
      {
        title: 'grid-template-areas aus der Matrix',
        code: `const cssOutput = useMemo(() => {
  const rows = gridMatrix.map(r => \`"\${r.join(' ')}"\`);
  return \`
.grid-container {
  display: grid;
  grid-template-rows: repeat(\${gridConfig.rows}, 1fr);
  grid-template-columns: repeat(\${gridConfig.cols}, 1fr);
  grid-template-areas:
    \${rows.join('\\n    ')};
  gap: 10px;
}\`.trim();
}, [gridMatrix, gridConfig]);`,
        language: 'typescript',
      },
    ],
  },
  {
    id: 2,
    title: { de: 'Bild-Kompressor', en: 'Image Compressor' },
    description: {
      de: 'Bilder direkt im Browser verkleinern: Format und Qualität wählen, Vorher-Nachher vergleichen und sehen, wie viele Kilobyte gespart werden. Nichts wird hochgeladen.',
      en: 'Shrink images right in the browser: pick a format and quality, compare before and after, and see how many kilobytes you save. Nothing is uploaded.',
    },
    objectClass: { de: 'Performance-Werkzeug', en: 'Performance tool' },
    technologies: ['React', 'TypeScript', 'Canvas API', 'WebP / AVIF', 'File API'],
    brick: { color: 'blue' },
    technicalInsight: {
      de: 'Das Bild wird in ein Canvas gezeichnet, auf die gewünschte Breite skaliert und mit `canvas.toBlob()` neu kodiert. Jede Einstellung löst eine neue Kodierung aus; alte Object-URLs werden freigegeben, damit kein Speicher leckt. Kann der Browser ein Format nicht erzeugen, liefert er PNG zurück, und die Oberfläche sagt das offen. Der Vergleich ist ein Range-Input über zwei gestapelten Bildern mit `clip-path`.',
      en: 'The image is drawn into a canvas, scaled to the chosen width and re-encoded with `canvas.toBlob()`. Every setting triggers a fresh encode; old object URLs are revoked so memory does not leak. If the browser cannot encode a format it returns PNG, and the interface says so. The comparison is a range input over two stacked images clipped with `clip-path`.',
    },
    codeSnippets: [
      {
        title: 'Neu kodieren im Browser',
        code: `const scale = Math.min(1, maxWidth / img.naturalWidth);
c.width = Math.round(img.naturalWidth * scale);
c.height = Math.round(img.naturalHeight * scale);
g.drawImage(img, 0, 0, c.width, c.height);
c.toBlob((blob) => {
  if (cancelled || !blob) return;
  setResult((prev) => {
    if (prev) URL.revokeObjectURL(prev.url);
    return { blob, url: URL.createObjectURL(blob), type: blob.type };
  });
}, format, quality);`,
        language: 'typescript',
      },
    ],
  },
  {
    id: 3,
    title: { de: 'Kontrast-Checker', en: 'Contrast Checker' },
    description: {
      de: 'Prüft zwei Farben gegen die WCAG-Kontrastregeln für Text, große Schrift und Bedienelemente und schlägt eine Textfarbe vor, die AA erfüllt, ohne den Farbton zu ändern.',
      en: 'Checks two colours against the WCAG contrast rules for text, large type and UI components, and suggests a text colour that passes AA without changing the hue.',
    },
    objectClass: { de: 'Barrierefreiheit', en: 'Accessibility' },
    technologies: ['React', 'TypeScript', 'WCAG 2.2', 'HSL'],
    brick: { color: 'ink' },
    technicalInsight: {
      de: 'Das Kontrastverhältnis folgt der WCAG-Formel aus relativer Luminanz. Für den Vorschlag wird die Textfarbe nach HSL umgerechnet und ihre Helligkeit schrittweise vom Hintergrund weg verschoben, bis 4,5 : 1 erreicht ist. So bleibt der Farbton erhalten, und die Korrektur ist mit einem Klick übernommen.',
      en: 'The contrast ratio follows the WCAG formula based on relative luminance. For the suggestion, the text colour is converted to HSL and its lightness is walked away from the background until 4.5 : 1 is reached. The hue stays the same, and the fix is one click away.',
    },
    codeSnippets: [
      {
        title: 'WCAG-Kontrast aus relativer Luminanz',
        code: `const luminance = ([r, g, b]: number[]) => {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

export const contrast = (a: number[], b: number[]) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};`,
        language: 'typescript',
      },
    ],
  },
  {
    id: 4,
    title: { de: 'Kanban-Board', en: 'Kanban Board' },
    description: {
      de: 'Ein Scrum-Board mit drei Spalten, Drag-and-drop per Maus, Touch und Tastatur und einem WIP-Limit für „In Arbeit“. Das Board bleibt im Browser gespeichert.',
      en: 'A Scrum board with three columns, drag and drop by mouse, touch and keyboard, and a WIP limit on “In progress”. The board is saved in the browser.',
    },
    objectClass: { de: 'Produktivität', en: 'Productivity' },
    technologies: ['React', 'TypeScript', 'dnd-kit', 'localStorage', 'Scrum'],
    brick: { color: 'orange' },
    technicalInsight: {
      de: 'Karten sind ziehbar und gleichzeitig Ablageziele, Spalten sind Ablageziele für das Ende der Liste. Beim Loslassen entscheidet die Zielkennung, ob die Karte vor einer anderen eingefügt oder angehängt wird. Das WIP-Limit wird vor dem Verschieben geprüft und erklärt, statt still zu scheitern. Der Tastatur-Sensor von dnd-kit macht alles ohne Maus bedienbar.',
      en: 'Cards are draggable and drop targets at the same time; columns are drop targets for the end of the list. On drop, the target id decides whether the card is inserted before another one or appended. The WIP limit is checked before moving and explained instead of failing silently. dnd-kit’s keyboard sensor makes everything usable without a mouse.',
    },
    codeSnippets: [
      {
        title: 'Ablegen mit WIP-Limit',
        code: `if (target.column === 'doing' && card.column !== 'doing' && byColumn('doing').length >= WIP_LIMIT) {
  setMessage(s.limitHit);
  return;
}
setCards((prev) => {
  const rest = prev.filter((c) => c.id !== card.id);
  const moved = { ...card, column: target.column };
  if (target.before) {
    const i = rest.findIndex((c) => c.id === target.before);
    return [...rest.slice(0, i), moved, ...rest.slice(i)];
  }
  return [...rest, moved];
});`,
        language: 'typescript',
      },
    ],
  },
  {
    id: 5,
    title: { de: 'Regex-Tester', en: 'Regex Tester' },
    description: {
      de: 'Reguläre Ausdrücke live testen: Treffer und Gruppen werden markiert, und jedes Stück des Musters wird in normaler Sprache erklärt.',
      en: 'Test regular expressions live: matches and groups are highlighted, and every part of the pattern is explained in plain language.',
    },
    objectClass: { de: 'Entwickler-Werkzeug', en: 'Developer tool' },
    technologies: ['React', 'TypeScript', 'RegExp', 'Tokenizer'],
    brick: { color: 'purple' },
    technicalInsight: {
      de: 'Die Treffer kommen aus `String.matchAll`, der Text wird an den Trefferpositionen in normale Stücke und `<mark>` zerlegt. Ein ungültiges Muster wird abgefangen und mit der Fehlermeldung der Engine gezeigt. Die Erklärung stammt von einem kleinen Tokenizer, der Quantoren, Zeichenklassen, Gruppen, Anker und Escapes erkennt und Literale zusammenfasst.',
      en: 'Matches come from `String.matchAll`; the text is split at match positions into plain pieces and `<mark>` elements. An invalid pattern is caught and shown with the engine’s own error message. The explanation comes from a small tokenizer that recognises quantifiers, character classes, groups, anchors and escapes, and merges literals.',
    },
    codeSnippets: [
      {
        title: 'Treffer markieren',
        code: `const pieces: React.ReactNode[] = [];
let cursor = 0;
result.matches.forEach((m, i) => {
  const start = m.index ?? 0;
  if (start > cursor) pieces.push(text.slice(cursor, start));
  pieces.push(<mark key={i}>{m[0]}</mark>);
  cursor = start + m[0].length;
});
pieces.push(text.slice(cursor));`,
        language: 'tsx',
      },
    ],
  },
  {
    id: 6,
    title: { de: 'Fluid-Type-Rechner', en: 'Fluid Type Calculator' },
    description: {
      de: 'Berechnet aus kleinster und größter Schriftgröße und zwei Viewport-Breiten eine fertige `clamp()`-Regel, mit Live-Vorschau über einen simulierten Viewport.',
      en: 'Turns a smallest and largest font size and two viewport widths into a ready-made `clamp()` rule, with a live preview across a simulated viewport.',
    },
    objectClass: { de: 'CSS-Werkzeug', en: 'CSS tool' },
    technologies: ['React', 'TypeScript', 'CSS clamp()', 'Responsive Design'],
    brick: { color: 'green' },
    technicalInsight: {
      de: 'Zwischen den beiden Viewports wächst die Schrift linear. Aus Steigung und Achsenabschnitt dieser Geraden entsteht der mittlere Wert `rem + vw`, die äußeren Werte begrenzen ihn. Alles wird in rem ausgegeben, damit Browser-Zoom und eigene Schriftgrößen der Nutzer weiter greifen. Dieselbe Funktion rechnet auch die Vorschau.',
      en: 'Between the two viewports the font grows linearly. The slope and intercept of that line give the middle value `rem + vw`; the outer values bound it. Everything is output in rem so browser zoom and user font sizes keep working. The same function also drives the preview.',
    },
    codeSnippets: [
      {
        title: 'clamp() aus zwei Punkten',
        code: `export const fluidClamp = (minSize: number, maxSize: number, minVw: number, maxVw: number, root: number) => {
  const slope = (maxSize - minSize) / (maxVw - minVw);
  const intercept = minSize - slope * minVw;
  return {
    css: \`clamp(\${round(minSize / root)}rem, \${round(intercept / root)}rem + \${round(slope * 100)}vw, \${round(maxSize / root)}rem)\`,
    at: (vw: number) => Math.min(maxSize, Math.max(minSize, intercept + slope * vw)),
  };
};`,
        language: 'typescript',
      },
    ],
  },
  {
    id: 7,
    title: { de: 'Fokus-Timer', en: 'Focus Timer' },
    description: {
      de: 'Ein Pomodoro-Timer mit Fokus-, Kurz- und Langpausen, einstellbaren Längen und einer Zählung der heutigen Fokusphasen.',
      en: 'A Pomodoro timer with focus, short and long breaks, adjustable lengths and a count of today’s focus sessions.',
    },
    objectClass: { de: 'Produktivität', en: 'Productivity' },
    technologies: ['React', 'TypeScript', 'Web Audio API', 'localStorage'],
    brick: { color: 'yellow' },
    technicalInsight: {
      de: 'Der Timer zählt nicht Intervalle, sondern rechnet gegen eine feste Endzeit, damit er in einem Hintergrund-Tab nicht nachgeht. Der Ton am Ende entsteht mit der Web Audio API ohne Audiodatei. Phasenwechsel werden über eine Live-Region auch für Screenreader angesagt.',
      en: 'The timer does not count intervals; it measures against a fixed end time so it does not fall behind in a background tab. The end-of-phase sound is generated with the Web Audio API, without an audio file. Phase changes are announced to screen readers through a live region.',
    },
    codeSnippets: [
      {
        title: 'Gegen die Uhr statt gegen Intervalle',
        code: `useEffect(() => {
  if (!running) return;
  const id = window.setInterval(() => {
    const left = endAt.current - Date.now();
    if (left <= 0) next(true);
    else setRemaining(left);
  }, 250);
  return () => window.clearInterval(id);
}, [running, next]);`,
        language: 'typescript',
      },
    ],
  },
];
