import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trash2, X } from 'lucide-react';

/* ── Layout constants ───────────────────────────────────────────── */
const NW  = 228;  // node width
const NHH = 36;   // node header height
const PR  = 7;    // port dot radius
const PRH = 27;   // height per port row
const PSY = 8;    // port section top-padding (below header)

/* ── Types ──────────────────────────────────────────────────────── */
type PortType = 'trigger' | 'number' | 'boolean' | 'any';
type SigVal   = null | boolean | number; // null = trigger pulse
type Cat      = 'trigger' | 'logic' | 'input' | 'output';

interface PD { id: string; label: string; type: PortType }
interface ND {
  kind: string; label: string; icon: string; cat: Cat;
  ins: PD[]; outs: PD[];
  defCfg: Record<string, unknown>;
  defSt:  Record<string, unknown>;
  ctrlH:  number;
}
interface SNode {
  id: string; kind: string; x: number; y: number;
  cfg: Record<string, unknown>;
  st:  Record<string, unknown>;
  iv:  Record<string, SigVal>;
}
interface Wire {
  id: string;
  fNode: string; fPort: string;
  tNode: string; tPort: string;
  pType: PortType;
  flash: number;
}
interface Draft {
  fNode: string; fPort: string; pType: PortType;
  x1: number; y1: number; mx: number; my: number;
}

/* ── Colors ─────────────────────────────────────────────────────── */
const CC: Record<Cat, { hdr: string; bd: string; tx: string }> = {
  trigger: { hdr:'rgba(59,130,246,0.18)',  bd:'rgba(96,165,250,0.45)',  tx:'#60A5FA' },
  logic:   { hdr:'rgba(124,58,237,0.18)',  bd:'rgba(167,139,250,0.45)', tx:'#A78BFA' },
  input:   { hdr:'rgba(14,165,233,0.18)',  bd:'rgba(56,189,248,0.45)',  tx:'#38BDF8' },
  output:  { hdr:'rgba(16,185,129,0.18)',  bd:'rgba(52,211,153,0.45)',  tx:'#34D399' },
};
const PC: Record<PortType, string> = {
  trigger:'#F59E0B', number:'#60A5FA', boolean:'#A78BFA', any:'#94A3B8',
};

/* ── Node definitions ───────────────────────────────────────────── */
const DEFS: Record<string, ND> = {
  button:  { kind:'button',  label:'Button',      icon:'⚡', cat:'trigger',
             ins:[], outs:[{id:'out',label:'trigger',type:'trigger'}],
             defCfg:{label:'Click!'}, defSt:{}, ctrlH:78 },
  timer:   { kind:'timer',   label:'Timer',        icon:'⏱', cat:'trigger',
             ins:[], outs:[{id:'tick',label:'tick',type:'trigger'}],
             defCfg:{ms:1000}, defSt:{on:false}, ctrlH:78 },
  toggle:  { kind:'toggle',  label:'Toggle',       icon:'⇄', cat:'trigger',
             ins:[], outs:[{id:'val',label:'state',type:'boolean'}],
             defCfg:{}, defSt:{on:false}, ctrlH:34 },
  slider:  { kind:'slider',  label:'Slider',       icon:'⎚', cat:'input',
             ins:[], outs:[{id:'val',label:'value',type:'number'}],
             defCfg:{min:0,max:100}, defSt:{val:50}, ctrlH:58 },
  counter: { kind:'counter', label:'Counter',      icon:'∑', cat:'logic',
             ins:[{id:'inc',label:'+1',type:'trigger'},{id:'rst',label:'reset',type:'trigger'}],
             outs:[{id:'n',label:'count',type:'number'}],
             defCfg:{}, defSt:{n:0}, ctrlH:44 },
  ifnode:  { kind:'ifnode',  label:'IF',           icon:'?', cat:'logic',
             ins:[{id:'a',label:'value',type:'number'},{id:'b',label:'threshold ↑',type:'number'}],
             outs:[{id:'T',label:'true ✓',type:'trigger'},{id:'F',label:'false ✗',type:'trigger'}],
             defCfg:{op:'>', threshold:10}, defSt:{}, ctrlH:72 },
  math:    { kind:'math',    label:'Math',         icon:'±', cat:'logic',
             ins:[{id:'a',label:'A',type:'number'},{id:'b',label:'B',type:'number'}],
             outs:[{id:'r',label:'result',type:'number'}],
             defCfg:{op:'+', a:0, b:0}, defSt:{r:null}, ctrlH:100 },
  not:     { kind:'not',     label:'NOT',          icon:'¬', cat:'logic',
             ins:[{id:'in',label:'in',type:'boolean'}],
             outs:[{id:'out',label:'out',type:'boolean'}],
             defCfg:{}, defSt:{}, ctrlH:0 },
  and:     { kind:'and',     label:'AND',          icon:'∧', cat:'logic',
             ins:[{id:'a',label:'A',type:'boolean'},{id:'b',label:'B',type:'boolean'}],
             outs:[{id:'out',label:'out',type:'boolean'}],
             defCfg:{}, defSt:{}, ctrlH:0 },
  or:      { kind:'or',      label:'OR',           icon:'∨', cat:'logic',
             ins:[{id:'a',label:'A',type:'boolean'},{id:'b',label:'B',type:'boolean'}],
             outs:[{id:'out',label:'out',type:'boolean'}],
             defCfg:{}, defSt:{}, ctrlH:0 },
  delay:   { kind:'delay',   label:'Delay',        icon:'⏳', cat:'logic',
             ins:[{id:'in',label:'trigger',type:'trigger'}],
             outs:[{id:'out',label:'trigger',type:'trigger'}],
             defCfg:{ms:500}, defSt:{}, ctrlH:38 },
  display: { kind:'display', label:'Display',      icon:'▤', cat:'output',
             ins:[{id:'v',label:'value',type:'any'}],
             outs:[], defCfg:{}, defSt:{v:null}, ctrlH:54 },
  lamp:    { kind:'lamp',    label:'Lamp',         icon:'◉', cat:'output',
             ins:[{id:'sig',label:'signal',type:'any'}],
             outs:[], defCfg:{color:'#F59E0B'}, defSt:{on:false}, ctrlH:84 },
  colorbox:{ kind:'colorbox',label:'Color Cycle',  icon:'◈', cat:'output',
             ins:[{id:'t',label:'next',type:'trigger'}],
             outs:[],
             defCfg:{colors:['#3B82F6','#8B5CF6','#EC4899','#F59E0B','#10B981']},
             defSt:{i:0}, ctrlH:76 },
};

const PALETTE: { cat: Cat; label: string; kinds: string[] }[] = [
  { cat:'trigger', label:'Trigger', kinds:['button','timer','toggle'] },
  { cat:'input',   label:'Input',   kinds:['slider'] },
  { cat:'logic',   label:'Logic',   kinds:['counter','ifnode','math','not','and','or','delay'] },
  { cat:'output',  label:'Output',  kinds:['display','lamp','colorbox'] },
];

/* ── Geometry helpers ───────────────────────────────────────────── */
function nodeH(d: ND) {
  const rows = Math.max(d.ins.length, d.outs.length);
  // header + port section (PSY top pad + rows) + optional controls (border+toppad + content + botpad) + bottom gap
  return NHH + PSY + rows * PRH + (d.ctrlH > 0 ? 20 + d.ctrlH : 8);
}

function portPos(n: SNode, d: ND, side: 'in'|'out', idx: number) {
  const y = n.y + NHH + PSY + idx * PRH + PRH / 2;
  return { x: side === 'in' ? n.x : n.x + NW, y };
}

function bezier(x1:number,y1:number,x2:number,y2:number) {
  const dx = Math.max(Math.abs(x2-x1)*0.55, 60);
  return `M${x1},${y1} C${x1+dx},${y1} ${x2-dx},${y2} ${x2},${y2}`;
}

/* ── Signal propagation ─────────────────────────────────────────── */
interface PropResult {
  patches: { id: string; st?: Record<string,unknown>; iv?: Record<string,SigVal> }[];
  flashes: string[];
  delays:  { nodeId: string; ms: number }[];
  lamps:   string[];
}

function propagate(
  fromNodeId: string, fromPort: string, val: SigVal,
  nodes: SNode[], wires: Wire[],
  visited = new Set<string>(),
): PropResult {
  const res: PropResult = { patches:[], flashes:[], delays:[], lamps:[] };
  const key = `${fromNodeId}:${fromPort}`;
  if (visited.has(key)) return res; // cycle guard
  visited.add(key);

  const outWires = wires.filter(w => w.fNode === fromNodeId && w.fPort === fromPort);
  for (const w of outWires) {
    res.flashes.push(w.id);
    const tNode = nodes.find(n => n.id === w.tNode);
    if (!tNode) continue;

    const def = DEFS[tNode.kind];
    const newIv: Record<string,SigVal> = { ...tNode.iv, [w.tPort]: val };
    const newSt: Record<string,unknown> = { ...tNode.st };
    const next: { port: string; v: SigVal }[] = [];

    switch (tNode.kind) {
      case 'counter':
        if (w.tPort === 'inc' && val === null) newSt.n = ((newSt.n as number)||0)+1;
        if (w.tPort === 'rst' && val === null) newSt.n = 0;
        next.push({ port:'n', v: newSt.n as number });
        break;
      case 'ifnode': {
        const a = (w.tPort==='a' ? val : (tNode.iv['a'] ?? 0)) as number;
        // Use wired value if available, else fall back to manually configured threshold
        const b = (w.tPort==='b' ? val : (tNode.iv['b'] ?? tNode.cfg.threshold ?? 0)) as number;
        const op = tNode.cfg.op as string;
        const r = op==='>'?a>b : op==='<'?a<b : op==='>='?a>=b : op==='<='?a<=b : op==='=='?a===b : a!==b;
        next.push({ port: r?'T':'F', v: null });
        break;
      }
      case 'math': {
        const a = (w.tPort==='a' ? val : (tNode.iv['a'] ?? tNode.cfg.a ?? 0)) as number;
        const b = (w.tPort==='b' ? val : (tNode.iv['b'] ?? tNode.cfg.b ?? 0)) as number;
        const op = tNode.cfg.op as string;
        const r = op==='+'?a+b : op==='-'?a-b : op==='*'?a*b : op==='/'?(b?a/b:0) : (b?a%b:0);
        newSt.r = Math.round(r*1000)/1000;
        next.push({ port:'r', v: newSt.r as number });
        break;
      }
      case 'not':
        next.push({ port:'out', v: !val });
        break;
      case 'and': {
        const a = (w.tPort==='a' ? val : (tNode.iv['a']??false)) as boolean;
        const b = (w.tPort==='b' ? val : (tNode.iv['b']??false)) as boolean;
        next.push({ port:'out', v: a && b });
        break;
      }
      case 'or': {
        const a = (w.tPort==='a' ? val : (tNode.iv['a']??false)) as boolean;
        const b = (w.tPort==='b' ? val : (tNode.iv['b']??false)) as boolean;
        next.push({ port:'out', v: a || b });
        break;
      }
      case 'delay':
        if (val === null) res.delays.push({ nodeId: tNode.id, ms: (tNode.cfg.ms as number)||500 });
        break;
      case 'display':
        newSt.v = val;
        break;
      case 'lamp':
        newSt.on = val === null ? true : !!val;
        if (val === null) res.lamps.push(tNode.id);
        break;
      case 'colorbox':
        if (val === null) {
          const colors = tNode.cfg.colors as string[];
          newSt.i = (((tNode.st.i as number)||0) + 1) % colors.length;
        }
        break;
    }

    res.patches.push({ id: tNode.id, st: newSt, iv: newIv });

    // recurse with updated node
    const updatedNodes = nodes.map(n => n.id === tNode.id ? {...tNode, iv:newIv, st:newSt} : n);
    for (const ds of next) {
      const sub = propagate(tNode.id, ds.port, ds.v, updatedNodes, wires, visited);
      res.patches.push(...sub.patches);
      res.flashes.push(...sub.flashes);
      res.delays.push(...sub.delays);
      res.lamps.push(...sub.lamps);
    }
  }
  return res;
}

/* ── Node Controls ──────────────────────────────────────────────── */
interface CtrlProps {
  node: SNode;
  onFire: (nodeId: string, port: string, val: SigVal) => void;
  onUpdateCfg: (nodeId: string, cfg: Record<string,unknown>) => void;
  onUpdateSt:  (nodeId: string, st:  Record<string,unknown>) => void;
  timerOn: boolean;
  onToggleTimer: (nodeId: string) => void;
}

function NodeControls({ node, onFire, onUpdateCfg, onUpdateSt, timerOn, onToggleTimer }: CtrlProps) {
  const s = node.st;
  const c = node.cfg;

  const inp: React.CSSProperties = {
    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:6, color:'#EEF2FF', fontFamily:"'JetBrains Mono',monospace",
    fontSize:11, padding:'3px 7px', outline:'none', width:'100%', boxSizing:'border-box',
  };
  const btn = (active?: boolean): React.CSSProperties => ({
    background: active ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)',
    border: `1px solid ${active ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius:7, color: active ? '#93C5FD' : '#94A3B8',
    fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500,
    padding:'5px 10px', cursor:'pointer', transition:'all 0.2s',
  });

  switch (node.kind) {
    case 'button':
      return (
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <input style={inp} value={c.label as string}
            onChange={e => onUpdateCfg(node.id, {...c, label:e.target.value})}
            onMouseDown={e=>e.stopPropagation()} />
          <button style={{...btn(), textAlign:'center', fontWeight:600, letterSpacing:'0.02em'}}
            onMouseDown={e=>e.stopPropagation()}
            onClick={()=>onFire(node.id,'out',null)}>
            {c.label as string}
          </button>
        </div>
      );

    case 'timer':
      return (
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:11,color:'rgba(148,163,184,0.7)',fontFamily:"'JetBrains Mono',monospace"}}>ms</span>
            <input style={inp} type="number" value={c.ms as number} min={100} step={100}
              onMouseDown={e=>e.stopPropagation()}
              onChange={e=>onUpdateCfg(node.id,{...c,ms:Number(e.target.value)})} />
          </div>
          <button style={{...btn(timerOn),textAlign:'center'}}
            onMouseDown={e=>e.stopPropagation()}
            onClick={()=>onToggleTimer(node.id)}>
            {timerOn ? '⏹ Stop' : '▶ Start'}
          </button>
        </div>
      );

    case 'toggle': {
      const on = s.on as boolean;
      return (
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <button
            style={{
              width:44, height:24, borderRadius:12, cursor:'pointer',
              background: on ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)',
              border:`1px solid ${on ? 'rgba(96,165,250,0.6)' : 'rgba(255,255,255,0.12)'}`,
              position:'relative', transition:'all 0.25s', flexShrink:0,
            }}
            onMouseDown={e=>e.stopPropagation()}
            onClick={()=>{
              const next = !on;
              onUpdateSt(node.id, {...s, on:next});
              onFire(node.id,'val',next);
            }}>
            <span style={{
              position:'absolute', top:3, left: on?21:3,
              width:16, height:16, borderRadius:'50%',
              background: on ? '#93C5FD' : 'rgba(148,163,184,0.6)',
              transition:'all 0.25s',
            }}/>
          </button>
          <span style={{fontSize:12,color: on ? '#60A5FA' : '#64748B',
            fontFamily:"'JetBrains Mono',monospace", fontWeight:600}}>
            {on ? 'ON' : 'OFF'}
          </span>
        </div>
      );
    }

    case 'slider': {
      const val = s.val as number;
      const min = c.min as number; const max = c.max as number;
      return (
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <input type="range" min={min} max={max} value={val}
            style={{width:'100%',accentColor:'#60A5FA',cursor:'pointer'}}
            onMouseDown={e=>e.stopPropagation()}
            onChange={e=>{
              const v = Number(e.target.value);
              onUpdateSt(node.id, {...s, val:v});
              onFire(node.id,'val',v);
            }} />
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:10,color:'#475569',fontFamily:"'JetBrains Mono',monospace"}}>{min}</span>
            <span style={{fontSize:13,color:'#60A5FA',fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{val}</span>
            <span style={{fontSize:10,color:'#475569',fontFamily:"'JetBrains Mono',monospace"}}>{max}</span>
          </div>
        </div>
      );
    }

    case 'counter':
      return (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:'#60A5FA'}}>
            {s.n as number}
          </span>
          <button style={{...btn(),fontSize:11,padding:'3px 8px'}}
            onMouseDown={e=>e.stopPropagation()}
            onClick={()=>{onUpdateSt(node.id,{...s,n:0}); onFire(node.id,'n',0);}}>
            reset
          </button>
        </div>
      );

    case 'ifnode':
      return (
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {/* Operator row */}
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:10,color:'rgba(148,163,184,0.6)',fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>
              value
            </span>
            <select style={{...inp, flex:1, padding:'3px 5px'}}
              value={c.op as string}
              onMouseDown={e=>e.stopPropagation()}
              onChange={e=>onUpdateCfg(node.id,{...c,op:e.target.value})}>
              {['>','<','>=','<=','==','!='].map(o=><option key={o}>{o}</option>)}
            </select>
            <span style={{fontSize:10,color:'rgba(148,163,184,0.6)',fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>
              thresh
            </span>
          </div>
          {/* Threshold input */}
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:10,color:'rgba(96,165,250,0.7)',fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>
              ↑ threshold
            </span>
            <input
              style={{...inp, flex:1}}
              type="number"
              value={c.threshold as number}
              onMouseDown={e=>e.stopPropagation()}
              onChange={e=>onUpdateCfg(node.id,{...c,threshold:Number(e.target.value)})}
            />
          </div>
          <div style={{fontSize:10,color:'rgba(71,85,105,0.8)',fontFamily:"'JetBrains Mono',monospace",textAlign:'center'}}>
            (wire to port ↑ to override)
          </div>
        </div>
      );

    case 'math':
      return (
        <div style={{display:'flex',flexDirection:'column',gap:5}}>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <input style={{...inp, flex:1}} type="number" value={c.a as number}
              placeholder="A"
              onMouseDown={e=>e.stopPropagation()}
              onChange={e=>onUpdateCfg(node.id,{...c,a:Number(e.target.value)})} />
            <select style={{...inp, width:'auto', padding:'3px 4px', flexShrink:0}}
              value={c.op as string}
              onMouseDown={e=>e.stopPropagation()}
              onChange={e=>onUpdateCfg(node.id,{...c,op:e.target.value})}>
              {['+','-','*','/','%'].map(o=><option key={o}>{o}</option>)}
            </select>
            <input style={{...inp, flex:1}} type="number" value={c.b as number}
              placeholder="B"
              onMouseDown={e=>e.stopPropagation()}
              onChange={e=>onUpdateCfg(node.id,{...c,b:Number(e.target.value)})} />
          </div>
          <div style={{fontSize:10,color:'rgba(71,85,105,0.8)',fontFamily:"'JetBrains Mono',monospace",textAlign:'center'}}>
            (wire to A/B ports to override)
          </div>
          <div style={{textAlign:'center',fontFamily:"'JetBrains Mono',monospace",fontSize:14,
            color: s.r !== null ? '#60A5FA' : '#334155', fontWeight:700,
            background:'rgba(0,0,0,0.2)',borderRadius:6,padding:'4px 0'}}>
            = {s.r !== null ? String(s.r) : '—'}
          </div>
        </div>
      );

    case 'delay':
      return (
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <input style={inp} type="number" value={c.ms as number} min={50} step={50}
            onMouseDown={e=>e.stopPropagation()}
            onChange={e=>onUpdateCfg(node.id,{...c,ms:Number(e.target.value)})} />
          <span style={{fontSize:10,color:'#64748B',fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>ms</span>
        </div>
      );

    case 'display': {
      const v = s.v;
      const txt = v === null ? '—' : v === true ? 'true' : v === false ? 'false' : String(v);
      return (
        <div style={{
          fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700,
          color: v === null ? '#334155' : '#EEF2FF',
          background:'rgba(0,0,0,0.2)', borderRadius:8, padding:'8px 10px',
          textAlign:'center', minHeight:36, display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          {txt}
        </div>
      );
    }

    case 'lamp': {
      const on = s.on as boolean;
      const col = c.color as string;
      return (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
          <div style={{
            width:44, height:44, borderRadius:'50%',
            background: on ? col : 'rgba(255,255,255,0.05)',
            boxShadow: on ? `0 0 24px ${col}, 0 0 48px ${col}44` : 'none',
            border:`2px solid ${on ? col : 'rgba(255,255,255,0.1)'}`,
            transition:'all 0.2s',
          }}/>
          <div style={{display:'flex',gap:4}}>
            {['#F59E0B','#EF4444','#10B981','#3B82F6','#A78BFA'].map(col2=>(
              <button key={col2}
                style={{width:14,height:14,borderRadius:'50%',background:col2,cursor:'pointer',
                  border:`2px solid ${col2===col?'white':'transparent'}`,padding:0}}
                onMouseDown={e=>e.stopPropagation()}
                onClick={()=>onUpdateCfg(node.id,{...c,color:col2})}/>
            ))}
          </div>
        </div>
      );
    }

    case 'colorbox': {
      const idx = s.i as number;
      const colors = c.colors as string[];
      return (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <div style={{
            height:40, borderRadius:8,
            background: colors[idx],
            boxShadow:`0 0 20px ${colors[idx]}88`,
            transition:'background 0.3s, box-shadow 0.3s',
          }}/>
          <div style={{display:'flex',gap:3,justifyContent:'center'}}>
            {colors.map((col,i)=>(
              <div key={i} style={{
                width:12,height:12,borderRadius:'50%',background:col,
                border:`2px solid ${i===idx?'white':'transparent'}`,
                transition:'border-color 0.2s',
              }}/>
            ))}
          </div>
        </div>
      );
    }

    default: return null;
  }
}

/* ── Port dot ────────────────────────────────────────────────────── */
const DOT_HIT = 14;

/* ── Main component ─────────────────────────────────────────────── */
export default function ProjectDeltaSandbox() {
  const [nodes, setNodes]   = useState<SNode[]>([]);
  const [wires, setWires]   = useState<Wire[]>([]);
  const [draft, setDraft]   = useState<Draft | null>(null);
  const [timers, setTimers] = useState<Set<string>>(new Set());
  const [showHelp, setShowHelp] = useState(false);

  const nodesRef = useRef(nodes);
  const wiresRef = useRef(wires);
  useEffect(()=>{ nodesRef.current = nodes; },[nodes]);
  useEffect(()=>{ wiresRef.current = wires; },[wires]);

  const intervalRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const canvasRef    = useRef<HTMLDivElement>(null);
  const interact     = useRef<{
    mode:'idle'|'drag-node'|'drag-bg'|'draw-wire';
    nodeId?:string; startNX?:number; startNY?:number;
    startMX?:number; startMY?:number;
  }>({mode:'idle'});

  /* ── Fire signal ── */
  const fire = useCallback((fromNodeId: string, fromPort: string, val: SigVal) => {
    const curNodes = nodesRef.current;
    const curWires = wiresRef.current;
    const res = propagate(fromNodeId, fromPort, val, curNodes, curWires);

    if (res.patches.length || res.flashes.length) {
      setNodes(prev => {
        let next = prev;
        for (const p of res.patches) {
          next = next.map(n => n.id===p.id
            ? { ...n, ...(p.st!==undefined?{st:p.st}:{}), ...(p.iv!==undefined?{iv:p.iv}:{}) }
            : n
          );
        }
        return next;
      });
      if (res.flashes.length) {
        const now = Date.now();
        setWires(prev => prev.map(w => res.flashes.includes(w.id) ? {...w,flash:now} : w));
      }
    }

    // Async: delay nodes
    for (const d of res.delays) {
      const delayNode = curNodes.find(n=>n.id===d.nodeId);
      if (delayNode) {
        setTimeout(()=>{ fire(d.nodeId,'out',null); }, d.ms);
      }
    }

    // Async: lamp pulse off
    for (const lampId of res.lamps) {
      setTimeout(()=>{
        setNodes(prev=>prev.map(n=>n.id===lampId?{...n,st:{...n.st,on:false}}:n));
      }, 350);
    }
  }, []);

  /* ── Timer management ── */
  const toggleTimer = useCallback((nodeId: string) => {
    setTimers(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
        clearInterval(intervalRefs.current[nodeId]);
        delete intervalRefs.current[nodeId];
      } else {
        next.add(nodeId);
        const node = nodesRef.current.find(n=>n.id===nodeId);
        const ms = (node?.cfg.ms as number)||1000;
        intervalRefs.current[nodeId] = setInterval(()=>{
          fire(nodeId,'tick',null);
        }, ms);
      }
      return next;
    });
  }, [fire]);

  // Restart timer when ms changes
  const handleUpdateCfg = useCallback((nodeId: string, cfg: Record<string,unknown>) => {
    setNodes(prev=>prev.map(n=>n.id===nodeId?{...n,cfg}:n));
    if (timers.has(nodeId) && cfg.ms) {
      clearInterval(intervalRefs.current[nodeId]);
      intervalRefs.current[nodeId] = setInterval(()=>fire(nodeId,'tick',null), cfg.ms as number);
    }
  }, [timers, fire]);

  const handleUpdateSt = useCallback((nodeId: string, st: Record<string,unknown>) => {
    setNodes(prev=>prev.map(n=>n.id===nodeId?{...n,st}:n));
  }, []);

  /* ── Add node ── */
  const addNode = useCallback((kind: string) => {
    const def = DEFS[kind];
    const canvas = canvasRef.current;
    const cx = canvas ? canvas.scrollLeft + canvas.clientWidth/2 - NW/2 : 100;
    const cy = canvas ? canvas.scrollTop  + canvas.clientHeight/2 - 80 : 100;
    const id = `n-${Date.now()}`;
    setNodes(prev=>[...prev, {
      id, kind,
      x: cx + (prev.length%5)*20,
      y: cy + Math.floor(prev.length/5)*30,
      cfg: { ...def.defCfg },
      st:  { ...def.defSt  },
      iv:  {},
    }]);
  }, []);

  /* ── Remove node ── */
  const removeNode = useCallback((nodeId: string) => {
    if (timers.has(nodeId)) {
      clearInterval(intervalRefs.current[nodeId]);
      delete intervalRefs.current[nodeId];
      setTimers(prev=>{ const n=new Set(prev); n.delete(nodeId); return n; });
    }
    setNodes(prev=>prev.filter(n=>n.id!==nodeId));
    setWires(prev=>prev.filter(w=>w.fNode!==nodeId&&w.tNode!==nodeId));
  }, [timers]);

  /* ── Canvas mouse helpers ── */
  function canvasXY(e: React.MouseEvent) {
    const r = canvasRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - r.left + canvasRef.current!.scrollLeft,
      y: e.clientY - r.top  + canvasRef.current!.scrollTop,
    };
  }

  function hitInputPort(mx:number,my:number) {
    for (const n of nodesRef.current) {
      const d = DEFS[n.kind];
      for (let i=0; i<d.ins.length; i++) {
        const p = portPos(n,d,'in',i);
        if (Math.hypot(mx-p.x,my-p.y)<DOT_HIT) return {node:n,portIdx:i,port:d.ins[i]};
      }
    }
    return null;
  }

  function hitOutputPort(mx:number,my:number) {
    for (const n of nodesRef.current) {
      const d = DEFS[n.kind];
      for (let i=0; i<d.outs.length; i++) {
        const p = portPos(n,d,'out',i);
        if (Math.hypot(mx-p.x,my-p.y)<DOT_HIT) return {node:n,portIdx:i,port:d.outs[i]};
      }
    }
    return null;
  }

  /* ── Global mouse events ── */
  const onCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const {x,y} = canvasXY(e);

    // Check output port
    const outHit = hitOutputPort(x,y);
    if (outHit) {
      e.preventDefault();
      const p = portPos(outHit.node, DEFS[outHit.node.kind],'out',outHit.portIdx);
      setDraft({fNode:outHit.node.id, fPort:outHit.port.id, pType:outHit.port.type, x1:p.x,y1:p.y,mx:p.x,my:p.y});
      interact.current = {mode:'draw-wire'};
      return;
    }
    interact.current = {mode:'idle'};
  }, []);

  const onCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    const {x,y} = canvasXY(e);
    if (interact.current.mode==='draw-wire') {
      setDraft(d=>d?{...d,mx:x,my:y}:null);
    }
  }, []);

  const onCanvasMouseUp = useCallback((e: React.MouseEvent) => {
    const {x,y} = canvasXY(e);
    if (interact.current.mode==='draw-wire' && draft) {
      const inHit = hitInputPort(x,y);
      if (inHit && inHit.node.id !== draft.fNode) {
        const existing = wiresRef.current.find(
          w=>w.tNode===inHit.node.id&&w.tPort===inHit.port.id
        );
        if (!existing) {
          const newWire: Wire = {
            id:`w-${Date.now()}`,
            fNode:draft.fNode, fPort:draft.fPort,
            tNode:inHit.node.id, tPort:inHit.port.id,
            pType:draft.pType, flash:0,
          };
          setWires(prev=>[...prev,newWire]);
        }
      }
      setDraft(null);
    }
    interact.current = {mode:'idle'};
  }, [draft]);

  /* ── Node drag ── */
  function onNodeMouseDown(e: React.MouseEvent, nodeId: string) {
    if ((e.target as HTMLElement).closest('button,input,select,textarea')) return;
    // Let port-dot clicks bubble up to canvas so wire drawing can start
    const tag = (e.target as Element).tagName.toLowerCase();
    if (tag === 'circle') return;
    e.stopPropagation();
    const {x,y} = canvasXY(e);
    const node = nodesRef.current.find(n=>n.id===nodeId)!;
    interact.current = {mode:'drag-node',nodeId,startNX:node.x,startNY:node.y,startMX:x,startMY:y};
  }

  const onGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (interact.current.mode==='drag-node') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left + canvas.scrollLeft;
      const my = e.clientY - r.top  + canvas.scrollTop;
      const {nodeId,startNX,startNY,startMX,startMY} = interact.current;
      setNodes(prev=>prev.map(n=>n.id===nodeId
        ? {...n, x:startNX!+(mx-startMX!), y:startNY!+(my-startMY!)}
        : n
      ));
    }
  }, []);

  const onGlobalMouseUp = useCallback(() => {
    if (interact.current.mode === 'drag-node') {
      interact.current = {mode:'idle'};
    }
  }, []);

  useEffect(()=>{
    window.addEventListener('mousemove',onGlobalMouseMove);
    window.addEventListener('mouseup',onGlobalMouseUp);
    return ()=>{
      window.removeEventListener('mousemove',onGlobalMouseMove);
      window.removeEventListener('mouseup',onGlobalMouseUp);
    };
  },[onGlobalMouseMove,onGlobalMouseUp]);

  // Cleanup timers on unmount
  useEffect(()=>()=>{
    Object.values(intervalRefs.current).forEach(clearInterval);
  },[]);

  /* ── Wire flash animation check ── */
  const now = Date.now();

  /* ── Render ──────────────────────────────────────────────────── */
  const S: Record<string,React.CSSProperties> = {
    root: {
      minHeight:'100vh', background:'#060910', color:'#EEF2FF',
      fontFamily:"'DM Sans',sans-serif", display:'flex', flexDirection:'column',
    },
    header: {
      height:54, background:'rgba(11,17,32,0.95)',
      borderBottom:'1px solid rgba(255,255,255,0.06)',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 1.25rem', flexShrink:0, position:'sticky', top:0, zIndex:100,
    },
    body: { display:'flex', flex:1, overflow:'hidden', height:'calc(100vh - 54px)' },
    sidebar: {
      width:180, flexShrink:0,
      background:'rgba(7,10,18,0.85)',
      borderRight:'1px solid rgba(255,255,255,0.06)',
      overflowY:'auto', padding:'0.75rem 0.5rem',
    },
    canvas: {
      flex:1, overflow:'auto', position:'relative',
      backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.055) 1px,transparent 1px)',
      backgroundSize:'26px 26px',
      cursor: draft ? 'crosshair' : 'default',
    },
    inner: { position:'relative', width:4000, height:1400 },
  };

  return (
    <div style={S.root}>
      {/* Header */}
      <header style={S.header}>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <Link to="/" style={{
            display:'flex',alignItems:'center',gap:6,fontSize:13,
            color:'rgba(148,163,184,0.7)',textDecoration:'none',
            padding:'5px 10px', borderRadius:8,
            border:'1px solid rgba(255,255,255,0.07)',
            transition:'all 0.2s',
          }}>
            <ArrowLeft size={13}/> Portfolio
          </Link>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:'#EEF2FF'}}>
              Logic Sandbox
            </span>
            <span style={{
              fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:'0.12em',
              textTransform:'uppercase',color:'rgba(52,211,153,0.9)',
              background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',
              padding:'2px 8px',borderRadius:999,
            }}>Beta</span>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <button onClick={()=>setShowHelp(h=>!h)} style={{
            background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:8,color:'rgba(148,163,184,0.7)',cursor:'pointer',
            padding:'5px 10px',fontSize:12,display:'flex',alignItems:'center',gap:5,
          }}>
            ? Help
          </button>
          <button onClick={()=>{
            Object.values(intervalRefs.current).forEach(clearInterval);
            intervalRefs.current={};
            setTimers(new Set());
            setNodes([]); setWires([]); setDraft(null);
          }} style={{
            background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)',
            borderRadius:8,color:'rgba(252,165,165,0.8)',cursor:'pointer',
            padding:'5px 10px',fontSize:12,display:'flex',alignItems:'center',gap:5,
          }}>
            <RotateCcw size={12}/> Clear
          </button>
        </div>
      </header>

      <div style={S.body}>
        {/* Sidebar */}
        <aside style={S.sidebar}>
          {PALETTE.map(({ cat, label, kinds }) => (
            <div key={cat} style={{marginBottom:'1rem'}}>
              <p style={{
                fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:'0.16em',
                textTransform:'uppercase',color:CC[cat].tx,
                margin:'0 0 6px 4px',
              }}>{label}</p>
              {kinds.map(k=>{
                const d=DEFS[k];
                return (
                  <button key={k} onClick={()=>addNode(k)} style={{
                    display:'flex',alignItems:'center',gap:7,width:'100%',
                    background:'rgba(255,255,255,0.03)',
                    border:`1px solid rgba(255,255,255,0.06)`,
                    borderLeft:`2px solid ${CC[cat].bd}`,
                    borderRadius:7, padding:'6px 8px',
                    marginBottom:3, cursor:'pointer',
                    color:'rgba(148,163,184,0.85)',
                    fontFamily:"'DM Sans',sans-serif",fontSize:12,
                    textAlign:'left',transition:'all 0.15s',
                  }}
                  onMouseEnter={e=>{
                    (e.currentTarget as HTMLElement).style.background=CC[cat].hdr;
                    (e.currentTarget as HTMLElement).style.color='#EEF2FF';
                  }}
                  onMouseLeave={e=>{
                    (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)';
                    (e.currentTarget as HTMLElement).style.color='rgba(148,163,184,0.85)';
                  }}>
                    <span style={{fontSize:13,flexShrink:0}}>{d.icon}</span>
                    {d.label}
                  </button>
                );
              })}
            </div>
          ))}

          <div style={{
            marginTop:'auto',padding:'10px 8px 0',
            borderTop:'1px solid rgba(255,255,255,0.05)',
            fontSize:10,color:'rgba(61,77,96,0.9)',
            fontFamily:"'JetBrains Mono',monospace",lineHeight:1.7,
          }}>
            <p style={{margin:'0 0 3px',color:'rgba(96,165,250,0.6)'}}>How to connect:</p>
            <p style={{margin:0}}>Drag from a right-side port dot to a left-side port dot to wire nodes together.</p>
          </div>
        </aside>

        {/* Canvas */}
        <div ref={canvasRef} style={S.canvas}
          onMouseDown={onCanvasMouseDown}
          onMouseMove={onCanvasMouseMove}
          onMouseUp={onCanvasMouseUp}
          onMouseLeave={()=>{ if(interact.current.mode==='draw-wire') setDraft(null); }}>
          <div style={S.inner}>

            {/* SVG wire layer */}
            <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',overflow:'visible'}}>
              <defs>
                {['trigger','number','boolean','any'].map(pt=>(
                  <filter key={pt} id={`glow-${pt}`}>
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                ))}
              </defs>

              {/* Existing wires */}
              {wires.map(w=>{
                const fn = nodes.find(n=>n.id===w.fNode);
                const tn = nodes.find(n=>n.id===w.tNode);
                if (!fn||!tn) return null;
                const fd = DEFS[fn.kind]; const td = DEFS[tn.kind];
                const fi = fd.outs.findIndex(p=>p.id===w.fPort);
                const ti = td.ins.findIndex(p=>p.id===w.tPort);
                if (fi<0||ti<0) return null;
                const p1 = portPos(fn,fd,'out',fi);
                const p2 = portPos(tn,td,'in',ti);
                const col = PC[w.pType];
                const active = now - w.flash < 500;
                return (
                  <g key={w.id}>
                    {/* Glow layer */}
                    {active && (
                      <path d={bezier(p1.x,p1.y,p2.x,p2.y)}
                        fill="none" stroke={col} strokeWidth={5}
                        strokeOpacity={0.35} filter={`url(#glow-${w.pType})`}/>
                    )}
                    <path d={bezier(p1.x,p1.y,p2.x,p2.y)}
                      fill="none"
                      stroke={col}
                      strokeWidth={active ? 2.5 : 1.5}
                      strokeOpacity={active ? 1 : 0.45}
                      style={{transition:'stroke-opacity 0.4s, stroke-width 0.2s'}}
                    />
                    {/* Delete wire hit area */}
                    <path d={bezier(p1.x,p1.y,p2.x,p2.y)}
                      fill="none" stroke="transparent" strokeWidth={12}
                      style={{cursor:'pointer',pointerEvents:'stroke'}}
                      onMouseDown={e=>{
                        e.stopPropagation();
                        setWires(prev=>prev.filter(x=>x.id!==w.id));
                      }}
                    />
                  </g>
                );
              })}

              {/* Draft wire */}
              {draft && (
                <path d={bezier(draft.x1,draft.y1,draft.mx,draft.my)}
                  fill="none" stroke={PC[draft.pType]}
                  strokeWidth={2} strokeOpacity={0.7} strokeDasharray="6 4"/>
              )}
            </svg>

            {/* Nodes */}
            {nodes.map(node=>{
              const def = DEFS[node.kind];
              const col = CC[def.cat];
              const h   = nodeH(def);
              const rows = Math.max(def.ins.length, def.outs.length);

              return (
                <div key={node.id}
                  style={{
                    position:'absolute', left:node.x, top:node.y,
                    width:NW, height:h,
                    background:'rgba(10,15,28,0.97)',
                    border:`1px solid rgba(255,255,255,0.09)`,
                    borderRadius:12, overflow:'visible',
                    boxShadow:'0 4px 24px rgba(0,0,0,0.5)',
                    userSelect:'none',
                  }}
                  onMouseDown={e=>onNodeMouseDown(e,node.id)}>

                  {/* Header */}
                  <div style={{
                    height:NHH, background:col.hdr,
                    borderBottom:`1px solid ${col.bd}`,
                    borderRadius:'12px 12px 0 0',
                    display:'flex',alignItems:'center',justifyContent:'space-between',
                    padding:'0 10px', cursor:'grab',
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:13}}>{def.icon}</span>
                      <span style={{
                        fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,
                        color:col.tx, letterSpacing:'0.01em',
                      }}>{def.label}</span>
                    </div>
                    <button
                      style={{
                        background:'none',border:'none',cursor:'pointer',
                        color:'rgba(100,116,139,0.5)',padding:2,borderRadius:4,
                        display:'flex',alignItems:'center',
                      }}
                      onMouseDown={e=>e.stopPropagation()}
                      onClick={()=>removeNode(node.id)}>
                      <X size={11}/>
                    </button>
                  </div>

                  {/* Ports + Controls */}
                  <div style={{position:'relative', padding:`${PSY}px 0`}}>
                    {Array.from({length:rows}).map((_,i)=>{
                      const inp  = def.ins[i];
                      const outp = def.outs[i];
                      return (
                        <div key={i} style={{
                          display:'flex',alignItems:'center',justifyContent:'space-between',
                          height:PRH, padding:'0 10px',
                        }}>
                          {/* Input port */}
                          <div style={{display:'flex',alignItems:'center',gap:5, flex:1, minWidth:0}}>
                            {inp && <>
                              <span style={{
                                color:'rgba(100,116,139,0.7)',
                                fontSize:10, fontFamily:"'JetBrains Mono',monospace",
                                overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                              }}>{inp.label}</span>
                            </>}
                          </div>
                          {/* Output port */}
                          <div style={{display:'flex',alignItems:'center',gap:5, justifyContent:'flex-end', flex:1, minWidth:0}}>
                            {outp && <>
                              <span style={{
                                color:'rgba(100,116,139,0.7)',
                                fontSize:10, fontFamily:"'JetBrains Mono',monospace",
                                overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                              }}>{outp.label}</span>
                            </>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Controls area */}
                  {def.ctrlH > 0 && (
                    <div style={{
                      padding:'0 10px 10px',
                      borderTop: rows > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      paddingTop: rows > 0 ? 8 : 0,
                    }}>
                      <NodeControls
                        node={node}
                        onFire={fire}
                        onUpdateCfg={handleUpdateCfg}
                        onUpdateSt={handleUpdateSt}
                        timerOn={timers.has(node.id)}
                        onToggleTimer={toggleTimer}
                      />
                    </div>
                  )}

                  {/* SVG port dots — rendered in absolute so they overflow node bounds */}
                  <svg style={{
                    position:'absolute', inset:0, width:NW, height:h,
                    overflow:'visible', pointerEvents:'none',
                  }}>
                    {def.ins.map((p,i)=>{
                      const py = NHH + PSY + i*PRH + PRH/2;
                      return (
                        <circle key={p.id}
                          cx={0} cy={py} r={PR}
                          fill={PC[p.type]}
                          stroke="rgba(0,0,0,0.6)" strokeWidth={1.5}
                          style={{pointerEvents:'all',cursor: draft?'crosshair':'default',filter:'drop-shadow(0 0 3px '+PC[p.type]+'88)'}}
                        />
                      );
                    })}
                    {def.outs.map((p,i)=>{
                      const py = NHH + PSY + i*PRH + PRH/2;
                      return (
                        <circle key={p.id}
                          cx={NW} cy={py} r={PR}
                          fill={PC[p.type]}
                          stroke="rgba(0,0,0,0.6)" strokeWidth={1.5}
                          style={{pointerEvents:'all',cursor:'crosshair',filter:'drop-shadow(0 0 3px '+PC[p.type]+'88)'}}
                        />
                      );
                    })}
                  </svg>
                </div>
              );
            })}

            {/* Empty state */}
            {nodes.length === 0 && (
              <div style={{
                position:'absolute',top:'50%',left:'50%',
                transform:'translate(-50%,-55%)',
                textAlign:'center', pointerEvents:'none',
              }}>
                <div style={{fontSize:48,marginBottom:12,opacity:0.25}}>⬡</div>
                <p style={{
                  fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'1.25rem',
                  color:'rgba(255,255,255,0.15)',margin:'0 0 6px',
                }}>Logic Sandbox</p>
                <p style={{
                  fontFamily:"'JetBrains Mono',monospace",fontSize:11,
                  color:'rgba(255,255,255,0.08)',margin:0,
                }}>Add nodes from the sidebar to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help overlay */}
      {showHelp && (
        <>
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(4px)',zIndex:200}}
            onClick={()=>setShowHelp(false)}/>
          <div style={{
            position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
            width:'min(500px,92vw)',background:'#0B1120',
            border:'1px solid rgba(255,255,255,0.1)',borderRadius:16,
            zIndex:201,padding:'1.75rem',
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
              <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,margin:0,fontSize:'1.1rem'}}>How to use</h2>
              <button onClick={()=>setShowHelp(false)} style={{background:'none',border:'none',cursor:'pointer',color:'#64748B'}}>
                <X size={18}/>
              </button>
            </div>
            {[
              ['Add nodes','Click any node type in the left sidebar to place it on the canvas.'],
              ['Connect nodes','Drag from a colored dot on the right side of a node (output) to a dot on the left side of another node (input).'],
              ['Delete wires','Click on any wire to remove it.'],
              ['Delete nodes','Click the × in the node header.'],
              ['Drag nodes','Drag from the node header to reposition.'],
              ['Port types','🟡 Trigger (pulse) · 🔵 Number · 🟣 Boolean · ⚫ Any'],
              ['Logic example','Button → Counter → IF (count > 5) → Lamp'],
            ].map(([title,desc])=>(
              <div key={title} style={{marginBottom:'0.875rem'}}>
                <p style={{margin:'0 0 2px',fontWeight:600,fontSize:13,color:'#EEF2FF'}}>{title}</p>
                <p style={{margin:0,fontSize:12,color:'rgba(148,163,184,0.75)',lineHeight:1.6}}>{desc}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
