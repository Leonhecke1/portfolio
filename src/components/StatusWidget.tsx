import { motion } from 'framer-motion';
import { MapPin, Zap } from 'lucide-react';
import { fadeUp, viewport } from '../lib/motion';

/* Real-time local time in Berlin */
const useBerlinTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('de-DE', {
    timeZone: 'Europe/Berlin',
    hour: '2-digit', minute: '2-digit',
  });
};

const STATUS_ITEMS = [
  {
    icon: null, // custom pulsing dot
    label: 'Status',
    value: 'Open to Work',
    color: 'rgba(52,211,153,0.9)',
    bg:    'rgba(16,185,129,0.08)',
    border:'rgba(52,211,153,0.2)',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Berlin, Germany',
    color: 'rgba(147,197,253,0.85)',
    bg:    'rgba(59,130,246,0.06)',
    border:'rgba(96,165,250,0.15)',
  },
  {
    icon: Zap,
    label: 'Focus',
    value: 'Frontend Architecture',
    color: 'rgba(196,181,253,0.85)',
    bg:    'rgba(124,58,237,0.06)',
    border:'rgba(167,139,250,0.15)',
  },
];

export default function StatusWidget() {
  const time = useBerlinTime();

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      style={{
        padding: '1.25rem',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px', letterSpacing: '0.18em',
          color: 'rgba(61,77,96,0.8)', textTransform: 'uppercase',
        }}>
          current status
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px', color: 'rgba(61,77,96,0.7)',
          letterSpacing: '0.06em',
        }}>
          {time} CET
        </span>
      </div>

      {/* Status items */}
      {STATUS_ITEMS.map(({ icon: Icon, label, value, color, bg, border }) => (
        <div
          key={label}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.5rem 0.75rem', borderRadius: '10px',
            background: bg, border: `1px solid ${border}`,
          }}
        >
          {/* Icon / pulsing dot */}
          {Icon ? (
            <Icon size={12} color={color} />
          ) : (
            <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px', flexShrink: 0 }}>
              <span style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: color, opacity: 0.55,
                animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
              }} />
              <span style={{
                position: 'relative', width: '8px', height: '8px',
                borderRadius: '50%', background: color,
              }} />
            </span>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '9px', color: 'rgba(61,77,96,0.8)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {label}
            </span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px', color,
              fontWeight: 500,
            }}>
              {value}
            </span>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
