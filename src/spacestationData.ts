// Career entries. German is the source text; English mirrors it.
type Localized = { de: string; en: string };

export interface ExperienceModule {
  type: 'experience';
  id: string;
  date: Localized;
  title: Localized;
  company: string;
  description: Localized[];
}

export interface EducationModule {
  type: 'education';
  id: string;
  date: Localized;
  degree: Localized;
  institution: string;
}

export type SpacestationModule = ExperienceModule | EducationModule;

export const spacestationModules: SpacestationModule[] = [
  {
    type: 'experience',
    id: 'exp-eintracht',
    date: { de: 'Aug 2025 – heute', en: 'Aug 2025 – present' },
    title: { de: 'Ehrenamtlicher Mitarbeiter', en: 'Volunteer' },
    company: '1. Eintracht Spandau e.V.',
    description: [
      {
        de: 'Implementierung und Gestaltung einer modernen Vereinswebseite',
        en: 'Built and designed a modern website for the club',
      },
      {
        de: 'Verbesserung der Suchmaschinenplatzierung und Barrierefreiheit durch gezielte SEO- und Accessibility-Maßnahmen',
        en: 'Improved search ranking and accessibility through targeted SEO and accessibility work',
      },
    ],
  },
  {
    type: 'experience',
    id: 'exp-webneo',
    date: { de: 'Aug 2024 – heute', en: 'Aug 2024 – present' },
    title: { de: 'Frontend-Entwickler', en: 'Frontend Developer' },
    company: 'WEBneo GmbH',
    description: [
      {
        de: 'Konzeption, Entwicklung und Wartung moderner Shopware-Shops sowie individuelle Plugin-Entwicklung',
        en: 'Concept, development and maintenance of modern Shopware stores, plus custom plugin development',
      },
      {
        de: 'Optimierung der Performance durch Bildkomprimierung, Code-Minimierung und Ladezeit-Analyse',
        en: 'Performance work through image compression, code minification and load-time analysis',
      },
    ],
  },
  {
    type: 'education',
    id: 'edu-telekom',
    date: { de: 'Sep 2021 – Aug 2024', en: 'Sep 2021 – Aug 2024' },
    degree: {
      de: 'Ausbildung als Fachinformatiker für Anwendungsentwicklung',
      en: 'Apprenticeship as an IT specialist for application development',
    },
    institution: 'Telekom AG',
  },
  {
    type: 'education',
    id: 'edu-gymnasium',
    date: { de: 'Aug 2019 – Jul 2021', en: 'Aug 2019 – Jul 2021' },
    degree: { de: 'Fachhochschulreife', en: 'Advanced technical college entrance qualification' },
    institution: 'Berufliches Gymnasium Göttingen',
  },
  {
    type: 'education',
    id: 'edu-realschule',
    date: { de: 'Aug 2016 – Aug 2019', en: 'Aug 2016 – Aug 2019' },
    degree: { de: 'Mittlerer Schulabschluss', en: 'Secondary school certificate' },
    institution: 'Voigt-Realschule Göttingen',
  },
];
