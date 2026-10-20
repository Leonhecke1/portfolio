import { useLanguage } from '../../contexts/LanguageContext';
import { PART_NAMES, STEP_GROUPS, builtProjects } from '../../buildData';

// Names and step targets for the clickable parts of the model.
export const usePartLinks = () => {
  const { t, language } = useLanguage();
  const projectOf = (group: string) => builtProjects.find((p) => `project-${p.id}` === group);
  const stepNumber = (group: string) => STEP_GROUPS.indexOf(group) + 1;

  const labelFor = (group: string) => {
    const p = projectOf(group);
    const target = `${t('model.step')} ${stepNumber(group)}`;
    return p ? `${PART_NAMES[p.id][language]}: ${p.title[language]} (${target})` : `${t('step.deskPart')}: ${t('nav.career')} (${target})`;
  };

  const nameFor = (group: string) => {
    const p = projectOf(group);
    return p ? PART_NAMES[p.id][language] : t('step.deskPart');
  };

  return { projectOf, stepNumber, labelFor, nameFor };
};
