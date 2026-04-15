import { projects as defaultProjects } from '../ProjectData';
import { spacestationModules as defaultTimeline } from '../spacestationData';
import type { Project } from '../ProjectData';
import type { SpacestationModule } from '../spacestationData';

export interface SkillCategory {
  id: string;
  label: string;
  skills: string[];
}

export interface StatItem {
  id: string;
  target: number;
  suffix: string;
  label: string;
}

export interface CapabilityCard {
  number: string;
  title: string;
  headline: string;
  body: string;
  tools: string[];
}

export interface SiteContent {
  hero: {
    role: string;
    location: string;
    status: string;
  };
  about: {
    skills: SkillCategory[];
  };
  capabilities: {
    stats: StatItem[];
    cards: CapabilityCard[];
  };
  projects: Project[];
  timeline: SpacestationModule[];
  contact: {
    email: string;
  };
}

export const defaultContent: SiteContent = {
  hero: {
    role: 'Frontend Developer',
    location: '@ WEBneo GmbH · Berlin, Germany',
    status: 'Available for work',
  },
  about: {
    skills: [
      { id: 'frontend', label: 'Frontend', skills: ['React', 'TypeScript', 'JavaScript', 'SCSS / CSS', 'Tailwind CSS'] },
      { id: 'backend',  label: 'Backend',  skills: ['Node.js', 'Express.js', 'REST APIs', 'Shopware'] },
      { id: 'tooling',  label: 'Tooling',  skills: ['Git', 'Vite', 'Scrum / Agile', 'SEO'] },
      { id: 'visual',   label: 'Visual',   skills: ['Three.js', 'Framer Motion', 'Figma', 'Accessibility'] },
    ],
  },
  capabilities: {
    stats: [
      { id: 'years',    target: 3,   suffix: '+', label: 'Years\nExperience'   },
      { id: 'projects', target: 15,  suffix: '+', label: 'Projects\nDelivered' },
      { id: 'tech',     target: 10,  suffix: '+', label: 'Technologies\nUsed'  },
      { id: 'remote',   target: 100, suffix: '%', label: 'Remote\nReady'       },
    ],
    cards: [
      {
        number: '01',
        title: 'Interfaces',
        headline: 'Pixel-perfect UI development',
        body: 'Crafting responsive, accessible React applications with clean architecture, semantic markup, and obsessive attention to detail.',
        tools: ['React', 'TypeScript', 'Tailwind CSS', 'SCSS'],
      },
      {
        number: '02',
        title: 'Motion & 3D',
        headline: 'Animation and spatial experiences',
        body: 'Bringing depth and life to the web through fluid animations, page transitions, and interactive 3D scenes built with Three.js.',
        tools: ['Three.js', 'R3F', 'Framer Motion', 'WebGL'],
      },
      {
        number: '03',
        title: 'Architecture',
        headline: 'Scalable and performant systems',
        body: 'Building robust frontend foundations — clean APIs, optimized bundles, developer-friendly codebases that teams actually enjoy working in.',
        tools: ['Node.js', 'Vite', 'Express', 'REST APIs'],
      },
    ],
  },
  projects: defaultProjects,
  timeline: defaultTimeline,
  contact: {
    email: 'email@leon-luca.de',
  },
};
