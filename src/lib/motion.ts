/**
 * Shared Framer Motion variants.
 * Import and spread directly: <motion.div variants={fadeUp} ... />
 */
import type { Variants } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** Standard fade-up entrance */
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

/** Stagger wrapper — combine with fadeUp children */
export const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09 } },
};

/** Stagger with a longer delay between children */
export const staggerSlow: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.14 } },
};

/** Simple opacity fade */
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

/** Scale up from slightly small */
export const scaleUp: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease } },
};

/** Slide in from the right */
export const slideRight: Variants = {
  hidden:  { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease } },
};

/** Slide in from the left */
export const slideLeft: Variants = {
  hidden:  { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease } },
};

/** Full-page route transition */
export const page: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0,  transition: { duration: 0.4,  ease } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

/** Shared viewport trigger options */
export const viewport = { once: true, margin: '-80px' } as const;
