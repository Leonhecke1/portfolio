import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

// Define the shape of our language context
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string; // Translation function
}

// Create the context with a default (though unused) value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define the type for the props of the LanguageProvider
interface LanguageProviderProps {
  children: ReactNode;
}

// LanguageProvider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<string>('en'); // Default language

  // Simple translation data (in a real app, this would be loaded from JSON files)
  const translations: Record<string, Record<string, string>> = {
    en: {
      'header.title': 'My Portfolio',
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.projects': 'Projects',
      'nav.contact': 'Contact',
      'nav.dashboard': 'Planetary Dashboard',
      'hero.greeting': 'Hello, I\'m',
      'hero.name': 'Leon Hecke',
      'hero.tagline': 'A creative developer passionate about building engaging web experiences.',
      'language.select': 'Select Language',
      'language.en': 'English',
      'language.de': 'German',
      'about.title': 'About Me',
      'contact.title': 'Contact Me',
      'about.paragraph1': 'As a dedicated Frontend Developer with a passion for modern web technologies, I bring solid knowledge in React, TypeScript, and JavaScript. My expertise includes the conception, development, and maintenance of interactive web applications and Shopware stores.',
      'about.paragraph2': 'I place great importance on performance optimization, user-friendliness, and accessibility. Using agile methods like Scrum and an eye for detail, I create efficient and scalable solutions.',
      'about.skillsTitle': 'Skills:',
      'about.languagesTitle': 'Languages:',
      'about.german': 'German (native speaker)',
      'about.english': 'English (B2)',
      'projects.title': 'Project Constellations',
      'projects.subtitle': 'An interactive map of my work. Click a star to begin.',
      'projects.instruction': 'Click a star to explore a project',
      'contact.nameLabel': 'Name',
      'contact.emailLabel': 'Email address',
      'contact.messageLabel': 'Message',
      'contact.submitButton': 'Send Message',
      'about.careerPathTitle': 'Career Path',
      'career.entry1': 'Starting my journey as a Junior Frontend Developer, I quickly immersed myself in modern web frameworks and best practices.',
      'career.entry2': 'Over the years, I\'ve gained experience in building robust, user-friendly interfaces and contributing to various web projects.',
      'dashboard.title': 'Planetary Data Dashboard',
      'dashboard.subtitle': 'Explore fascinating facts about our solar system\'s planets.',
      'dashboard.loading': 'Loading planetary data...',
      'dashboard.error': 'Failed to load planetary data',
      'dashboard.filterBy': 'Filter by',
      'dashboard.allTypes': 'All Types',
      'dashboard.sortBy': 'Sort by',
      'dashboard.planetName': 'Name',
      'dashboard.planetType': 'Type',
      'dashboard.mass': 'Mass',
      'dashboard.diameter': 'Diameter',
      'dashboard.distance': 'Distance from Sun',
      'dashboard.orbitalPeriod': 'Orbital Period',
      'dashboard.minTemp': 'Min. Temp.',
      'dashboard.type': 'Type',
      'dashboard.temperature': 'Temperature',
      'dashboard.days': 'days',
      'project.technicalInsightsTitle': 'Technical Insights: How It Works',
      'project.codeSnippetsTitle': 'Key Code Snippets',
      'velox.label.mode': 'mode',
      'velox.label.palette': 'palette',
      'velox.label.particles': 'n',
      'velox.label.force': 'force',
      'velox.mode.attract': 'attract',
      'velox.mode.repel': 'repel',
      'velox.mode.orbit': 'orbit',
      'velox.btn.web': 'web',
      'velox.btn.play': '▶ play',
      'velox.btn.pause': '⏸ pause',
      'velox.btn.reset': '↺ reset',
      'velox.hint.hoverLabel': 'hover',
      'velox.hint.hover': 'apply force',
      'velox.hint.clickLabel': 'click',
      'velox.hint.click': 'burst explosion',
      'velox.hint.webLabel': 'web',
      'velox.hint.web': 'proximity graph',
    },
    de: {
      'header.title': 'Mein Portfolio',
      'nav.home': 'Startseite',
      'nav.about': 'Über mich',
      'nav.projects': 'Projekte',
      'nav.contact': 'Kontakt',
      'nav.dashboard': 'Planeten-Dashboard',
      'hero.greeting': 'Hallo, ich bin',
      'hero.name': 'Leon Hecke',
      'hero.tagline': 'Ein kreativer Entwickler mit Leidenschaft für fesselnde Weberlebnisse.',
      'language.select': 'Sprache wählen',
      'language.en': 'Englisch',
      'language.de': 'Deutsch',
      'about.title': 'Über mich',
      'contact.title': 'Kontaktieren Sie mich',
      'about.paragraph1': 'Als engagierter Frontend-Entwickler mit einer Leidenschaft für moderne Webtechnologien bringe ich fundierte Kenntnisse in React, TypeScript und JavaScript mit. Meine Expertise umfasst die Konzeption, Entwicklung und Wartung von interaktiven Webanwendungen und Shopware-Shops.',
      'about.paragraph2': 'Ich lege großen Wert auf Performance-Optimierung, Benutzerfreundlichkeit und Barrierefreiheit. Mit agilen Methoden wie Scrum und einem Auge für Details schaffe ich effiziente und skalierbare Lösungen.',
      'about.skillsTitle': 'Qualifikationen:',
      'about.languagesTitle': 'Sprachen:',
      'about.german': 'Deutsch (Muttersprache)',
      'about.english': 'Englisch (B2)',
      'projects.title': 'Projekt-Konstellationen',
      'projects.subtitle': 'Eine interaktive Karte meiner Arbeit. Klicken Sie auf einen Stern, um zu beginnen.',
      'projects.instruction': 'Klicken Sie auf einen Stern, um ein Projekt zu erkunden',
      'contact.nameLabel': 'Name',
      'contact.emailLabel': 'E-Mail-Adresse',
      'contact.messageLabel': 'Nachricht',
      'contact.submitButton': 'Nachricht senden',
      'about.careerPathTitle': 'Werdegang',
      'career.entry1': 'Als Junior Frontend-Entwickler begann ich meine Reise und vertiefte mich schnell in moderne Web-Frameworks und Best Practices.',
      'career.entry2': 'Im Laufe der Jahre sammelte ich Erfahrungen im Aufbau robuster, benutzerfreundlicher Oberflächen und trug zu verschiedenen Webprojekten bei.',
      'dashboard.title': 'Planeten-Daten-Dashboard',
      'dashboard.subtitle': 'Entdecken Sie faszinierende Fakten über die Planeten unseres Sonnensystems.',
      'dashboard.loading': 'Planeten-Daten werden geladen...',
      'dashboard.error': 'Fehler beim Laden der Planeten-Daten',
      'dashboard.filterBy': 'Filtern nach',
      'dashboard.allTypes': 'Alle Typen',
      'dashboard.sortBy': 'Sortieren nach',
      'dashboard.planetName': 'Name',
      'dashboard.planetType': 'Typ',
      'dashboard.mass': 'Masse',
      'dashboard.diameter': 'Durchmesser',
      'dashboard.distance': 'Entfernung zur Sonne',
      'dashboard.orbitalPeriod': 'Umlaufzeit',
      'dashboard.minTemp': 'Min. Temp.',
      'dashboard.type': 'Typ',
      'dashboard.temperature': 'Temperatur',
      'dashboard.days': 'Tage',
      'project.technicalInsightsTitle': 'Technische Einblicke: So funktioniert es',
      'project.codeSnippetsTitle': 'Wichtige Code-Ausschnitte',
      'velox.label.mode': 'Modus',
      'velox.label.palette': 'Palette',
      'velox.label.particles': 'n',
      'velox.label.force': 'Kraft',
      'velox.mode.attract': 'anziehen',
      'velox.mode.repel': 'abstoßen',
      'velox.mode.orbit': 'orbit',
      'velox.btn.web': 'Netz',
      'velox.btn.play': '▶ abspielen',
      'velox.btn.pause': '⏸ pausieren',
      'velox.btn.reset': '↺ zurücksetzen',
      'velox.hint.hoverLabel': 'hover',
      'velox.hint.hover': 'Kraft anwenden',
      'velox.hint.clickLabel': 'klick',
      'velox.hint.click': 'Explosion auslösen',
      'velox.hint.webLabel': 'netz',
      'velox.hint.web': 'Nähe-Graph',
    },
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language]?.[key] || key; // Fallback to key if translation not found
  };

  const setLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguageState(lang);
    } else {
      console.warn(`Language '${lang}' not supported.`);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
