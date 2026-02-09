// Define interfaces for different types of spacestation entries
export interface ExperienceModule {
  type: 'experience';
  id: string;
  date: string;
  title: string;
  company: string;
  description: string[];
  moduleType: 'command' | 'habitat' | 'lab' | 'observatory'; // Visual type for module
}

export interface EducationModule {
  type: 'education';
  id: string;
  date: string;
  degree: string;
  institution: string;
  moduleType: 'storage' | 'training' | 'archive'; // Visual type for module
}

// Union type for all possible spacestation entries
export type SpacestationModule = ExperienceModule | EducationModule;

export const spacestationModules: SpacestationModule[] = [
  {
    type: 'experience',
    id: 'exp-eintracht',
    date: 'Aug 2025 - Aktuell',
    title: 'Ehrenamtlicher Mitarbeiter',
    company: '1. Eintracht Spandau e.V.',
    description: [
      'Implementierung und Gestaltung einer modernen Vereinswebseite',
      'Verbesserung der Suchmaschinenplatzierung und Barrierefreiheit durch gezielte SEO- und Accessibility-Maßnahmen',
    ],
    moduleType: 'command',
  },
  {
    type: 'experience',
    id: 'exp-webneo',
    date: 'Aug 2024 - Aktuell',
    title: 'Frontend-Entwickler',
    company: 'WEBneo GmbH',
    description: [
      'Konzeption, Entwicklung und Wartung moderner Shopware-Shops sowie individuelle Plugin-Entwicklung',
      'Optimierung der Performance durch Bildkomprimierung, Code-Minimierung und Ladezeit-Analyse',
    ],
    moduleType: 'lab',
  },
  {
    type: 'education',
    id: 'edu-telekom',
    date: 'Sep 2021 - Aug 2024',
    degree: 'Ausbildung als Fachinformatiker für Anwendungsentwicklung',
    institution: 'Telekom AG',
    moduleType: 'training',
  },
  {
    type: 'education',
    id: 'edu-gymnasium',
    date: 'Aug 2019 - Jul 2021',
    degree: 'Fachhochschulreife',
    institution: 'Berufliches Gymnasium Göttingen',
    moduleType: 'archive',
  },
  {
    type: 'education',
    id: 'edu-realschule',
    date: 'Aug 2016 - Aug 2019',
    degree: 'Mittlerer Schulabschluss',
    institution: 'Voigt-Realschule Göttingen',
    moduleType: 'storage',
  },
];
