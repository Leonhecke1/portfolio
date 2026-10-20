import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Language = 'de' | 'en';

// Define the shape of our language context
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string; // Translation function
}

// Create the context with a default (though unused) value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define the type for the props of the LanguageProvider
interface LanguageProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'lh-language';

// German is the primary audience; English mirrors every key.
const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.skip': 'Skip to content',
    'nav.label': 'Main',
    'nav.home': 'Leon Hecke, to the start',
    'nav.projects': 'Projects',
    'nav.career': 'Career',
    'nav.contact': 'Contact',
    'cover.lede': 'Frontend developer. This portfolio is the building instructions for my workstation: my career is the desk, every project is a part on it, and its technologies are the pieces.',
    'step.deskPart': 'Desk',
    'cover.contents': 'Contents',
    'cover.start': 'Start building',
    'step.baseplate': 'The desk: career',
    'step.baseplateLede': 'Everything else is built on this: training, school and the work I do every day.',
    'step.careerParts': 'Parts in this step',
    'step.skillParts': 'Loose parts: skills',
    'step.parts': 'Parts',
    'step.open': 'Open this step',
    'step.done': 'Done',
    'model.finished': 'The finished model: a workstation with desk, monitor, keyboard and coffee mug',
    'model.inProgress': 'The model so far',
    'model.step': 'Step',
    'footer.edition': 'Building instructions · Edition 2026',
    'project.stepNav': 'Steps',
    'project.repo': 'Repository on GitHub',
    'meta.title': 'Leon Hecke · Frontend developer',
    'language.switch': 'Language',
    'language.en': 'English',
    'language.de': 'German',
    'hero.name': 'Leon Hecke',
    'hero.role': 'Frontend developer',
    'hero.stack': 'React · TypeScript · Shopware',
    'about.paragraph1': 'As a dedicated Frontend Developer with a passion for modern web technologies, I bring solid knowledge in React, TypeScript, and JavaScript. My expertise includes the conception, development, and maintenance of interactive web applications and Shopware stores.',
    'about.paragraph2': 'I place great importance on performance optimization, user-friendliness, and accessibility. Using agile methods like Scrum and an eye for detail, I create efficient and scalable solutions.',
    'about.languagesTitle': 'Languages',
    'about.german': 'German (native speaker)',
    'about.english': 'English (B2)',
    'contact.title': 'Send a transmission',
    'contact.intro': 'Questions about a demo, the code behind it, or anything else: write me.',
    'contact.nameLabel': 'Name',
    'contact.emailLabel': 'Email address',
    'contact.messageLabel': 'Message',
    'contact.submitButton': 'Open in mail app',
    'contact.offline': 'Transmitter offline: no contact address is configured for this build yet.',
    'contact.required': 'Please fill in your name, email address and message.',
    'contact.opened': 'Your mail app should open with the message prefilled.',
    'project.back': 'Back to the instructions',
    'project.technicalInsightsTitle': 'Technical insights: how it works',
    'project.codeSnippetsTitle': 'Key code snippets',
    'project.live': 'View live project',
    'project.demo': 'Sub-assembly: live demo',
    'project.notFound': 'Step not found',
    'project.notFoundText': 'There is no step with this number. Go back to the instructions and pick another one.',
    'project.comingSoon': 'No demo or screenshot for this project yet.',
  },
  de: {
    'nav.skip': 'Zum Inhalt springen',
    'nav.label': 'Hauptnavigation',
    'nav.home': 'Leon Hecke, zum Anfang',
    'nav.projects': 'Projekte',
    'nav.career': 'Werdegang',
    'nav.contact': 'Kontakt',
    'cover.lede': 'Frontend-Entwickler. Dieses Portfolio ist die Bauanleitung für meinen Arbeitsplatz: Mein Werdegang ist der Schreibtisch, jedes Projekt ein Bauteil darauf, und seine Technologien sind die Teile.',
    'step.deskPart': 'Schreibtisch',
    'cover.contents': 'Inhalt',
    'cover.start': 'Bauanleitung starten',
    'step.baseplate': 'Der Schreibtisch: Werdegang',
    'step.baseplateLede': 'Darauf baut alles andere auf: Ausbildung, Schule und die Arbeit, die ich jeden Tag mache.',
    'step.careerParts': 'Teile in diesem Schritt',
    'step.skillParts': 'Lose Teile: Können',
    'step.parts': 'Teile',
    'step.open': 'Bauschritt öffnen',
    'step.done': 'Fertig',
    'model.finished': 'Das fertige Modell: ein Arbeitsplatz mit Schreibtisch, Monitor, Tastatur und Kaffeetasse',
    'model.inProgress': 'Das Modell bis hierher',
    'model.step': 'Schritt',
    'footer.edition': 'Bauanleitung · Ausgabe 2026',
    'project.stepNav': 'Bauschritte',
    'project.repo': 'Repository auf GitHub',
    'meta.title': 'Leon Hecke · Frontend-Entwickler',
    'language.switch': 'Sprache',
    'language.en': 'Englisch',
    'language.de': 'Deutsch',
    'hero.name': 'Leon Hecke',
    'hero.role': 'Frontend-Entwickler',
    'hero.stack': 'React · TypeScript · Shopware',
    'about.paragraph1': 'Als engagierter Frontend-Entwickler mit einer Leidenschaft für moderne Webtechnologien bringe ich fundierte Kenntnisse in React, TypeScript und JavaScript mit. Meine Expertise umfasst die Konzeption, Entwicklung und Wartung von interaktiven Webanwendungen und Shopware-Shops.',
    'about.paragraph2': 'Ich lege großen Wert auf Performance-Optimierung, Benutzerfreundlichkeit und Barrierefreiheit. Mit agilen Methoden wie Scrum und einem Auge für Details schaffe ich effiziente und skalierbare Lösungen.',
    'about.languagesTitle': 'Sprachen',
    'about.german': 'Deutsch (Muttersprache)',
    'about.english': 'Englisch (B2)',
    'contact.title': 'Eine Nachricht senden',
    'contact.intro': 'Fragen zu einer Demo, zum Code dahinter oder zu etwas ganz anderem: Schreib mir.',
    'contact.nameLabel': 'Name',
    'contact.emailLabel': 'E-Mail-Adresse',
    'contact.messageLabel': 'Nachricht',
    'contact.submitButton': 'In Mail-App öffnen',
    'contact.offline': 'Sender offline: Für diesen Build ist noch keine Kontaktadresse hinterlegt.',
    'contact.required': 'Bitte Name, E-Mail-Adresse und Nachricht ausfüllen.',
    'contact.opened': 'Deine Mail-App sollte sich mit der vorbereiteten Nachricht öffnen.',
    'project.back': 'Zurück zur Bauanleitung',
    'project.technicalInsightsTitle': 'Technische Einblicke: So funktioniert es',
    'project.codeSnippetsTitle': 'Wichtige Code-Ausschnitte',
    'project.live': 'Live-Projekt ansehen',
    'project.demo': 'Baugruppe: Live-Demo',
    'project.notFound': 'Bauschritt nicht gefunden',
    'project.notFoundText': 'Einen Bauschritt mit dieser Nummer gibt es nicht. Geh zurück zur Bauanleitung und wähle einen anderen.',
    'project.comingSoon': 'Für dieses Projekt gibt es noch keine Demo und keinen Screenshot.',
  },
};

const readStoredLanguage = (): Language => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'de' || stored === 'en') return stored;
  } catch {
    // Storage can be unavailable (private mode, blocked site data); fall back to German.
  }
  return 'de';
};

// LanguageProvider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translations[language]['meta.title'];
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Not persisting is fine; the choice still applies for this visit.
    }
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    return translations[language]?.[key] || key; // Fallback to key if translation not found
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageState, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
