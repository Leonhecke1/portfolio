import { projects, type BrickColor, type Project } from './ProjectData';

// The home page builds one model step by step: a desk workstation.
// The career is the desk; every project is one part on it, chosen for what the project does.

export type PieceColor = BrickColor | 'wood' | 'grey' | 'key' | 'cork';

// Top, left and right face shades for the isometric drawing.
export const SHADES: Record<PieceColor, { top: string; left: string; right: string; stud: string }> = {
  wood: { top: '#d4a46b', left: '#bb8b55', right: '#a37646', stud: '#bb8b55' },
  grey: { top: '#8a8f98', left: '#70757e', right: '#5d626a', stud: '#70757e' },
  key: { top: '#f3f2ee', left: '#d9d7d0', right: '#c7c5be', stud: '#d9d7d0' },
  cork: { top: '#c79a64', left: '#b3874f', right: '#9c7443', stud: '#b3874f' },
  red: { top: '#e2483c', left: '#c6362b', right: '#a92d24', stud: '#c6362b' },
  blue: { top: '#3b7cc4', left: '#2f68a8', right: '#26588f', stud: '#2f68a8' },
  ink: { top: '#3a3d44', left: '#2a2c32', right: '#1f2125', stud: '#2a2c32' },
  orange: { top: '#f08a3c', left: '#d8742a', right: '#bc6222', stud: '#d8742a' },
  purple: { top: '#8a63c9', left: '#7350b0', right: '#5f4194', stud: '#7350b0' },
  green: { top: '#4a9b66', left: '#3a8053', right: '#2f6c45', stud: '#3a8053' },
  yellow: { top: '#f5c24d', left: '#e0a72e', right: '#c38f22', stud: '#e0a72e' },
};

export interface Piece {
  // The build step this piece belongs to; every piece of a group lands together.
  group: string;
  color: PieceColor;
  // Footprint in studs; z and h in plate heights (a brick is 3 plates tall).
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  kind: 'brick' | 'tile' | 'round';
  // Decorations drawn on the piece itself.
  screen?: boolean;
  notes?: boolean;
  ticks?: boolean;
  mug?: boolean;
  lens?: boolean;
  light?: boolean;
}

const groupOf = (p: Project) => `project-${p.id}`;

type Shape = Omit<Piece, 'group'>;

// Model geometry per project id. The desk top is 12 x 7 studs; its surface is at z = 10.
const PROJECT_PIECES: Record<number, Shape[]> = {
  // CSS Grid Generator: a keyboard, its keys a 6 x 2 grid.
  1: [
    { color: 'red', x: 3.5, y: 4.2, z: 10, w: 6, d: 2, h: 1, kind: 'tile' },
    ...Array.from({ length: 12 }, (_, i): Shape => ({
      color: 'key', x: 3.62 + (i % 6), y: 4.32 + Math.floor(i / 6), z: 11, w: 0.76, d: 0.76, h: 1, kind: 'tile',
    })),
  ],
  // Image Compressor: the monitor, showing a photo with one half compressed into blocks.
  2: [
    { color: 'grey', x: 6, y: 0.6, z: 10, w: 2, d: 1.8, h: 1, kind: 'tile' },
    { color: 'grey', x: 6.5, y: 1, z: 11, w: 1, d: 1, h: 4, kind: 'brick' },
    { color: 'blue', x: 4, y: 1, z: 15, w: 6, d: 1, h: 11, kind: 'brick', screen: true },
  ],
  // Contrast Checker: a desk lamp throwing light onto the desk.
  3: [
    { color: 'ink', x: 10.4, y: 0.6, z: 10, w: 1.4, d: 1.4, h: 1, kind: 'round' },
    { color: 'ink', x: 10.95, y: 1.15, z: 11, w: 0.3, d: 0.3, h: 14, kind: 'tile' },
    { color: 'ink', x: 10.95, y: 1.15, z: 24, w: 0.3, d: 2.5, h: 1, kind: 'tile' },
    { color: 'ink', x: 10.3, y: 2.9, z: 21, w: 1.6, d: 1.6, h: 3, kind: 'round', light: true },
  ],
  // Kanban Board: a pinboard with sticky notes in three columns.
  4: [
    { color: 'grey', x: 0.3, y: 0.5, z: 10, w: 2.4, d: 0.9, h: 1, kind: 'tile' },
    { color: 'cork', x: 0.3, y: 0.8, z: 11, w: 2.4, d: 0.3, h: 14, kind: 'tile', notes: true },
  ],
  // Regex Tester: a magnifying glass lying on the desk.
  5: [
    { color: 'purple', x: 0.7, y: 3.3, z: 10, w: 1.8, d: 1.8, h: 1, kind: 'round', lens: true },
    { color: 'purple', x: 1.45, y: 5.1, z: 10, w: 0.3, d: 0.9, h: 1, kind: 'tile' },
  ],
  // Fluid Type Calculator: a ruler.
  6: [{ color: 'green', x: 0.4, y: 6.1, z: 10, w: 3, d: 0.55, h: 0.6, kind: 'tile', ticks: true }],
  // Focus Timer: the coffee mug.
  7: [{ color: 'yellow', x: 10.2, y: 4.7, z: 10, w: 1.6, d: 1.6, h: 6, kind: 'round', mug: true }],
};

export const DESK: Piece[] = [
  { group: 'base', color: 'grey', x: 0, y: 0, z: 0, w: 1, d: 1, h: 9, kind: 'brick' },
  { group: 'base', color: 'grey', x: 11, y: 0, z: 0, w: 1, d: 1, h: 9, kind: 'brick' },
  { group: 'base', color: 'grey', x: 0, y: 6, z: 0, w: 1, d: 1, h: 9, kind: 'brick' },
  { group: 'base', color: 'grey', x: 11, y: 6, z: 0, w: 1, d: 1, h: 9, kind: 'brick' },
  { group: 'base', color: 'wood', x: 0, y: 0, z: 9, w: 12, d: 7, h: 1, kind: 'tile' },
];

export const builtProjects: Project[] = projects.filter((p) => PROJECT_PIECES[p.id]);

// Steps in reading order: the desk first, then one group per project. Step numbers are 1-based.
export const STEP_GROUPS: string[] = ['base', ...builtProjects.map(groupOf)];

export const PIECES: Piece[] = [
  ...DESK,
  ...builtProjects.flatMap((p) => PROJECT_PIECES[p.id].map((piece) => ({ ...piece, group: groupOf(p) }))),
];

export const stepOf = (p: Project) => STEP_GROUPS.indexOf(groupOf(p)) + 1;

export const groupFor = (p: Project) => groupOf(p);

// Groups placed once a step is reached.
export const groupsUpTo = (step: number) => new Set(STEP_GROUPS.slice(0, Math.max(0, step)));

export const ALL_GROUPS = new Set(STEP_GROUPS);

// What each project becomes in the model, shown beside its step.
export const PART_NAMES: Record<number, { de: string; en: string }> = {
  1: { de: 'Tastatur', en: 'Keyboard' },
  2: { de: 'Monitor', en: 'Monitor' },
  3: { de: 'Schreibtischlampe', en: 'Desk lamp' },
  4: { de: 'Pinnwand', en: 'Pinboard' },
  5: { de: 'Lupe', en: 'Magnifying glass' },
  6: { de: 'Lineal', en: 'Ruler' },
  7: { de: 'Kaffeetasse', en: 'Coffee mug' },
};

// Optional contact address, configured at build time. Without it the form says so instead of pretending to send.
export const CONTACT_EMAIL: string = import.meta.env.VITE_CONTACT_EMAIL ?? '';
