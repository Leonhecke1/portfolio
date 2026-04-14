import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar        from './components/Navbar';
import Footer        from './components/Footer';
import SideNav       from './components/SideNav';
import StarBackground from './components/StarBackground';
import ScrollProgress from './components/ScrollProgress';
import CursorGlow    from './components/CursorGlow';
import HomePage       from './components/HomePage';
import { useNavigation } from './contexts/NavigationContext';
import { VisualModeProvider, useVisualMode } from './contexts/VisualModeContext';
import { page } from './lib/motion';

/* Lazy-load heavy routes — these are never visited on initial page load */
const ProjectDetail       = lazy(() => import('./components/ProjectDetail'));
const PlanetaryDashboard  = lazy(() => import('./components/PlanetaryDashboard'));
const ProjectDeltaSandbox = lazy(() => import('./components/ProjectDeltaSandbox'));

/* ── Fixed nebula blobs ─────────────────────────────────────────── */
const Nebula = () => {
  const { enhanced } = useVisualMode();
  return (
    <>
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
        background:
          `radial-gradient(ellipse 70% 50% at 10% 15%, rgba(59,130,246,${enhanced ? '0.09' : '0.055'}) 0%, transparent 70%),` +
          `radial-gradient(ellipse 60% 50% at 90% 80%, rgba(124,58,237,${enhanced ? '0.085' : '0.05'}) 0%, transparent 70%),` +
          `radial-gradient(ellipse 40% 30% at 50% 50%, rgba(14,165,233,${enhanced ? '0.045' : '0.025'}) 0%, transparent 70%)`,
        transition: 'background 0.8s ease',
      }} />
      {/* Extra enhanced-only glow orbs */}
      {enhanced && (
        <div aria-hidden="true" style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
          background:
            'radial-gradient(ellipse 45% 35% at 75% 20%, rgba(59,130,246,0.06) 0%, transparent 60%),' +
            'radial-gradient(ellipse 35% 25% at 25% 85%, rgba(167,139,250,0.055) 0%, transparent 60%)',
          animation: 'nebula-drift 12s ease-in-out infinite alternate',
        }} />
      )}
    </>
  );
};

function App() {
  const location = useLocation();
  const { isMenuOpen, toggleMenu } = useNavigation();
  const prevPath = useRef(location.pathname);

  /* Scroll / hash handling */
  useEffect(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (isMenuOpen && location.pathname !== prevPath.current) toggleMenu();
    prevPath.current = location.pathname;
  }, [location.pathname, isMenuOpen, toggleMenu]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text-1)', position: 'relative' }}>

      {/* ── Background layers ──────────────────────────────── */}
      <StarBackground />   {/* z-index: 0 — star canvas, fixed */}
      <Nebula />           {/* z-index: 1 — nebula gradients, fixed */}
      <CursorGlow />       {/* z-index: 6 — cursor ambient light */}
      <ScrollProgress />   {/* z-index: 200 — reading indicator */}

      {/* Mobile overlay */}
      {isMenuOpen && (
        <div onClick={toggleMenu} style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
        }} />
      )}

      {/* ── Persistent UI ──────────────────────────────────── */}
      <SideNav />   {/* z-index: 30 */}
      <Navbar />    {/* z-index: 50 */}

      {/* ── Page content with route transitions ────────────── */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={page}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Suspense boundary covers all lazy routes */}
            <Suspense fallback={null}>
              <Routes location={location}>
                <Route path="/"                    element={<HomePage />} />
                <Route path="/project/:projectId"  element={<ProjectDetail />} />
                <Route path="/planetary-dashboard" element={<PlanetaryDashboard />} />
                <Route path="/project-delta"       element={<ProjectDeltaSandbox />} />
              </Routes>
            </Suspense>
            <Footer />
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}

export default function AppWithProviders() {
  return (
    <VisualModeProvider>
      <App />
    </VisualModeProvider>
  );
}
