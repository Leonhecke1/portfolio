import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavSection {
  id: string;
  label: string;
}

const SECTIONS: NavSection[] = [
  { id: 'hero',                  label: 'Home'     },
  { id: 'about',                 label: 'About'    },
  { id: 'spacestation-timeline', label: 'Career'   },
  { id: 'projects',              label: 'Projects' },
  { id: 'lab',                   label: 'Lab'      },
  { id: 'contact',               label: 'Contact'  },
];

const SideNav = () => {
  const [active, setActive] = useState('hero');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleScroll = useCallback(() => {
    if (!isHome) return;
    const mid = window.scrollY + window.innerHeight * 0.4;
    let current = SECTIONS[0].id;
    for (const { id } of SECTIONS) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= mid) current = id;
    }
    setActive(current);
  }, [isHome]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Section navigation"
      style={{
        position: 'fixed',
        right: '1.75rem',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 30,
        display: 'none',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
      }}
      className="lg:flex"
    >
      {SECTIONS.map(({ id, label }, i) => {
        const isActive = active === id && isHome;
        const isHovered = hoveredId === id;

        return (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Connecting line above (not for first) */}
            {i > 0 && (
              <div
                style={{
                  width: '1px',
                  height: '20px',
                  background: isActive
                    ? 'linear-gradient(to bottom, rgba(96,165,250,0.3), rgba(96,165,250,0.15))'
                    : 'rgba(255,255,255,0.06)',
                  transition: 'background 0.3s',
                }}
              />
            )}

            {/* Dot + tooltip wrapper */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {/* Tooltip */}
              <div
                style={{
                  position: 'absolute',
                  right: 'calc(100% + 12px)',
                  whiteSpace: 'nowrap',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  color: isActive ? '#60A5FA' : 'rgba(148,163,184,0.7)',
                  letterSpacing: '0.06em',
                  opacity: isHovered || isActive ? 1 : 0,
                  transform: isHovered || isActive ? 'translateX(0)' : 'translateX(4px)',
                  transition: 'opacity 0.2s ease, transform 0.2s ease, color 0.3s ease',
                  pointerEvents: 'none',
                  textTransform: 'uppercase',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {label}
              </div>

              {/* Dot */}
              {isHome ? (
                <button
                  onClick={() => scrollTo(id)}
                  onMouseEnter={() => setHoveredId(id)}
                  onMouseLeave={() => setHoveredId(null)}
                  aria-label={`Scroll to ${label}`}
                  style={{
                    width: isActive ? '9px' : '6px',
                    height: isActive ? '9px' : '6px',
                    borderRadius: '50%',
                    background: isActive ? '#3B82F6' : 'rgba(255,255,255,0.15)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'width 0.25s ease, height 0.25s ease, background 0.25s ease, box-shadow 0.25s ease',
                    boxShadow: isActive
                      ? '0 0 10px rgba(59,130,246,0.7), 0 0 20px rgba(59,130,246,0.3)'
                      : isHovered
                      ? '0 0 8px rgba(255,255,255,0.2)'
                      : 'none',
                  }}
                />
              ) : (
                <Link
                  to={`/#${id}`}
                  aria-label={`Go to ${label}`}
                  onMouseEnter={() => setHoveredId(id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: 'block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    transition: 'background 0.2s',
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </nav>
  );
};

export default SideNav;
