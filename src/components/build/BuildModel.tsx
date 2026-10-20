import React, { useState } from 'react';
import { PIECES, SHADES, type Piece } from '../../buildData';

// Isometric drawing of the model. One stud = U px along each horizontal axis; one plate = 0.4 studs high.
const U = 26;
const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);
const PLATE = 0.4;
const STUD_R = 0.3;
const STUD_H = 0.18;

type P2 = [number, number];
type P3 = [number, number, number];

const iso = (x: number, y: number, z: number): P2 => [(x - y) * COS * U, (x + y) * SIN * U - z * PLATE * U];
const pts = (list: P3[]) => list.map(([x, y, z]) => iso(x, y, z).map((n) => n.toFixed(2)).join(',')).join(' ');
const ellipse = (r: number) => ({ rx: r * Math.SQRT2 * COS * U, ry: r * Math.SQRT2 * SIN * U });

// A rectangle on the vertical front plane y = fy, spanning x0..x1 and z0..z1.
const frontRect = (fy: number, x0: number, x1: number, z0: number, z1: number) => pts([[x0, fy, z0], [x1, fy, z0], [x1, fy, z1], [x0, fy, z1]]);

const Stud: React.FC<{ cx: number; cy: number; z: number; color: string; side: string }> = ({ cx, cy, z, color, side }) => {
  const [sx, sy] = iso(cx, cy, z);
  const { rx, ry } = ellipse(STUD_R);
  const h = STUD_H * U;
  return (
    <g>
      <path d={`M${sx - rx} ${sy} v${-h} a${rx} ${ry} 0 0 0 ${2 * rx} 0 v${h} a${rx} ${ry} 0 0 1 ${-2 * rx} 0z`} fill={side} />
      <ellipse cx={sx} cy={sy - h} rx={rx} ry={ry} fill={color} />
    </g>
  );
};

// Monitor face: a landscape photo whose left half is shown compressed into blocks, split by a comparison handle.
const PhotoScreen: React.FC<{ p: Piece }> = ({ p }) => {
  const fy = p.y + p.d;
  const x0 = p.x + 0.35;
  const x1 = p.x + p.w - 0.35;
  const z0 = p.z + 1.1;
  const z1 = p.z + p.h - 1.1;
  const w = x1 - x0;
  const hz = z1 - z0;
  const at = (fx: number, fz: number): P3 => [x0 + fx * w, fy, z0 + fz * hz];
  const sun = Array.from({ length: 18 }, (_, i) => {
    const t = (i / 18) * Math.PI * 2;
    // Same physical radius on both axes: x is in studs, z in plates.
    return at(0.74 + Math.cos(t) * 0.06, 0.72 + (Math.sin(t) * 0.06 * w) / PLATE / hz);
  });
  const ridge = (base: number, amp: number, seed: number): P3[] => [
    at(0, 0),
    ...Array.from({ length: 13 }, (_, i) => at(i / 12, base + amp * Math.sin(i * 0.9 + seed) * Math.cos(i * 0.37 + seed))),
    at(1, 0),
  ];
  const split = 0.46;
  const blocks: React.ReactNode[] = [];
  const cols = 6;
  const rows = 6;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if ((c + r) % 2) continue;
      const fx = (c / cols) * split;
      const fz = r / rows;
      blocks.push(
        <polygon key={`${c}-${r}`} points={pts([at(fx, fz), at(fx + split / cols, fz), at(fx + split / cols, fz + 1 / rows), at(fx, fz + 1 / rows)])} fill="#ffffff" opacity="0.12" />,
      );
    }
  }
  const [hx, hy] = iso(...at(split, 0.5));
  return (
    <g>
      <polygon points={frontRect(fy, x0, x1, z0, z1)} fill="#9fcbee" />
      <polygon points={pts(sun)} fill="#ffd36b" />
      <polygon points={pts(ridge(0.5, 0.16, 1))} fill="#6d8fb3" />
      <polygon points={pts(ridge(0.32, 0.12, 3))} fill="#3f6b5a" />
      <polygon points={pts(ridge(0.16, 0.08, 5))} fill="#2d4d3c" />
      {blocks}
      <polyline points={pts([at(split, 0), at(split, 1)])} stroke="#ffffff" strokeWidth="2" fill="none" />
      <circle cx={hx} cy={hy} r="6" fill="#ffffff" />
    </g>
  );
};

// Pinboard face: sticky notes in three columns, like the Kanban board.
const Notes: React.FC<{ p: Piece }> = ({ p }) => {
  const fy = p.y + p.d;
  const colors = ['#f08a3c', '#f7d36b', '#f28fa0'];
  const counts = [3, 2, 1];
  const nw = 0.58;
  const nh = 1.5;
  return (
    <g>
      {counts.map((n, c) =>
        Array.from({ length: n }, (_, r) => {
          const x0 = p.x + 0.2 + c * 0.75;
          const z1 = p.z + p.h - 0.8 - r * (nh + 0.5);
          return <polygon key={`${c}-${r}`} points={frontRect(fy, x0, x0 + nw, z1 - nh, z1)} fill={colors[(c + r) % 3]} />;
        }),
      )}
    </g>
  );
};

// Ruler: millimetre-style ticks across the top, longer every fifth and tenth mark.
const Ticks: React.FC<{ p: Piece }> = ({ p }) => {
  const z = p.z + p.h;
  const marks = Math.floor(p.w / 0.1);
  return (
    <g stroke="#1f4d31" strokeWidth="1">
      {Array.from({ length: marks - 1 }, (_, i) => {
        const x = p.x + 0.1 * (i + 1);
        const len = (i + 1) % 10 === 0 ? 0.32 : (i + 1) % 5 === 0 ? 0.22 : 0.12;
        const [ax, ay] = iso(x, p.y, z);
        const [bx, by] = iso(x, p.y + len, z);
        return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} />;
      })}
    </g>
  );
};

const Box: React.FC<{ p: Piece }> = ({ p }) => {
  const s = SHADES[p.color];
  const z0 = p.z;
  const z1 = p.z + p.h;
  const studs: React.ReactNode[] = [];
  if (p.kind === 'brick' && Number.isInteger(p.w) && Number.isInteger(p.d)) {
    for (let s1 = 0; s1 < p.w + p.d - 1; s1++) {
      for (let i = 0; i < p.w; i++) {
        const j = s1 - i;
        if (j < 0 || j >= p.d) continue;
        studs.push(<Stud key={`${i}-${j}`} cx={p.x + i + 0.5} cy={p.y + j + 0.5} z={z1} color={s.top} side={s.stud} />);
      }
    }
  }
  return (
    <>
      <polygon points={frontRect(p.y + p.d, p.x, p.x + p.w, z0, z1)} fill={s.left} />
      <polygon points={pts([[p.x + p.w, p.y, z0], [p.x + p.w, p.y + p.d, z0], [p.x + p.w, p.y + p.d, z1], [p.x + p.w, p.y, z1]])} fill={s.right} />
      <polygon points={pts([[p.x, p.y, z1], [p.x + p.w, p.y, z1], [p.x + p.w, p.y + p.d, z1], [p.x, p.y + p.d, z1]])} fill={s.top} />
      {p.screen && <PhotoScreen p={p} />}
      {p.notes && <Notes p={p} />}
      {p.ticks && <Ticks p={p} />}
      {studs}
    </>
  );
};

// A round piece: a cylinder shaded in two halves. The mug adds coffee and a handle, the lens glass,
// and the lamp shade a cone of light down to the desk surface.
const Round: React.FC<{ p: Piece }> = ({ p }) => {
  const s = SHADES[p.color];
  const r = p.w / 2;
  const cxw = p.x + r;
  const cyw = p.y + r;
  const [cx, bottom] = iso(cxw, cyw, p.z);
  const [, top] = iso(cxw, cyw, p.z + p.h);
  const { rx, ry } = ellipse(r);
  const handleTop = top + (bottom - top) * 0.22;
  const handleBottom = top + (bottom - top) * 0.72;
  const desk = p.light ? iso(cxw, cyw, 10) : null;
  const glow = p.light ? ellipse(r * 1.9) : null;
  return (
    <>
      {desk && glow && (
        <g className="lamp-light">
          <ellipse cx={desk[0]} cy={desk[1]} rx={glow.rx} ry={glow.ry} fill="#fff1b8" opacity="0.7" />
          <path d={`M${cx - rx * 0.8} ${bottom} L${desk[0] - glow.rx} ${desk[1]} A${glow.rx} ${glow.ry} 0 0 0 ${desk[0] + glow.rx} ${desk[1]} L${cx + rx * 0.8} ${bottom}z`} fill="#fff6cc" opacity="0.45" />
        </g>
      )}
      <path d={`M${cx - rx} ${top} V${bottom} A${rx} ${ry} 0 0 0 ${cx} ${bottom + ry} V${top + ry} A${rx} ${ry} 0 0 1 ${cx - rx} ${top}z`} fill={s.left} />
      <path d={`M${cx} ${top + ry} V${bottom + ry} A${rx} ${ry} 0 0 0 ${cx + rx} ${bottom} V${top} A${rx} ${ry} 0 0 1 ${cx} ${top + ry}z`} fill={s.right} />
      {p.mug && (
        <path
          d={`M${cx + rx - 1} ${handleTop} C${cx + rx + 16} ${handleTop} ${cx + rx + 16} ${handleBottom} ${cx + rx - 1} ${handleBottom}`}
          fill="none"
          stroke={s.right}
          strokeWidth="6"
          strokeLinecap="round"
        />
      )}
      <ellipse cx={cx} cy={top} rx={rx} ry={ry} fill={s.top} />
      {p.mug && <ellipse cx={cx} cy={top + 1} rx={rx * 0.78} ry={ry * 0.78} fill="#5a3a22" />}
      {p.lens && (
        <>
          <ellipse cx={cx} cy={top} rx={rx * 0.76} ry={ry * 0.76} fill="#d7ecfb" />
          <path d={`M${cx - rx * 0.45} ${top - ry * 0.25} A${rx * 0.5} ${ry * 0.5} 0 0 1 ${cx + rx * 0.05} ${top - ry * 0.5}`} stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
    </>
  );
};

// Groups draw back to front: the desk first, then by how far back each group sits.
const groups = (() => {
  const byGroup = new Map<string, Piece[]>();
  PIECES.forEach((p) => byGroup.set(p.group, [...(byGroup.get(p.group) ?? []), p]));
  const depth = (list: Piece[]) => Math.min(...list.map((p) => p.y * 100 + p.x));
  return [...byGroup.entries()]
    .sort(([a, la], [b, lb]) => (a === 'base' ? -1 : b === 'base' ? 1 : depth(la) - depth(lb)))
    .map(([id, list]) => ({ id, pieces: [...list].sort((a, b) => a.z - b.z || a.x + a.y - (b.x + b.y)) }));
})();

// Where a group's callout hangs: above the back edge of its highest piece.
const anchorOf = (id: string): P2 | null => {
  const list = PIECES.filter((p) => p.group === id);
  if (!list.length) return null;
  const top = list.reduce((a, b) => (b.z + b.h > a.z + a.h ? b : a));
  return iso(top.x + top.w * 0.7, top.y, top.z + top.h);
};

interface BuildModelProps {
  // Groups currently placed; the rest wait above, hidden.
  placed: Set<string>;
  // The group added in the current step; it gets the ×1 callout.
  newest?: string | null;
  calloutLabel?: string;
  className?: string;
  title: string;
  // When given, every placed part becomes a link that jumps to its build step.
  onPick?: (group: string) => void;
  hrefFor?: (group: string) => string;
  labelFor?: (group: string) => string;
  // Short part name shown in the callout while a part is hovered or focused.
  nameFor?: (group: string) => string;
}

const BuildModel: React.FC<BuildModelProps> = ({ placed, newest, calloutLabel, className, title, onPick, hrefFor, labelFor, nameFor }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  // A hovered part takes over the callout from the newest one.
  const calloutGroup = hovered ?? newest ?? null;
  const calloutText = hovered ? nameFor?.(hovered) : calloutLabel;
  const callout = calloutGroup ? anchorOf(calloutGroup) : null;

  return (
    <svg className={`model ${className ?? ''}`} viewBox="-180 -255 470 520" role="img" aria-label={title}>
      {groups.map(({ id, pieces }) => {
        const shapes = pieces.map((p, i) => (p.kind === 'round' ? <Round key={i} p={p} /> : <Box key={i} p={p} />));
        const state = !placed.has(id) ? 'waiting' : id === newest ? 'new' : 'placed';
        return (
          <g key={id} className="piece" data-state={state} data-group={id} data-hovered={hovered === id || undefined}>
            {onPick && state !== 'waiting' ? (
              <a
                className="piece-link"
                href={hrefFor?.(id) ?? '#'}
                aria-label={labelFor?.(id) ?? id}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered((h) => (h === id ? null : h))}
                onFocus={() => setHovered(id)}
                onBlur={() => setHovered((h) => (h === id ? null : h))}
                onClick={(e) => {
                  e.preventDefault();
                  onPick(id);
                }}
              >
                <title>{labelFor?.(id) ?? id}</title>
                {/* A stationary, invisible copy keeps the hit area in place while the visible part lifts, so hovering an edge cannot flicker. */}
                <g className="piece-hit" aria-hidden="true">{shapes}</g>
                <g className="piece-visual">{shapes}</g>
              </a>
            ) : (
              shapes
            )}
          </g>
        );
      })}
      {callout && calloutGroup && (
        <g className="callout" key={calloutGroup} transform={`translate(${callout[0] + 14} ${callout[1] - 30})`}>
          <path d="M-14 30 L-5 11" />
          <circle r="13" />
          <text y="4.5" textAnchor="middle">×1</text>
          {calloutText && <text className="callout-label" x="20" y="4.5">{calloutText}</text>}
        </g>
      )}
    </svg>
  );
};

export default BuildModel;
