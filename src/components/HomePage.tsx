import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ALL_GROUPS, PART_NAMES, STEP_GROUPS, builtProjects, groupsUpTo } from '../buildData';
import { spacestationModules } from '../spacestationData';
import BuildModel from './build/BuildModel';
import { usePartLinks } from './build/usePartLinks';
import ContactForm from './ContactForm';

const SKILLS = ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Shopware', 'HTML / CSS', 'Twig', 'Bootstrap', 'Playwright', 'Jest', 'Scrum'];

const PartsBox: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`parts${className ? ` ${className}` : ''}`}>
    <p className="parts-title">{title}</p>
    {children}
  </div>
);

const HomePage = () => {
  const { t, language } = useLanguage();
  // 0 = cover (finished model), 1..n = build steps, n+1 = finished.
  const [step, setStep] = useState(0);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const lastStep = STEP_GROUPS.length + 1;

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setStep(Number((entry.target as HTMLElement).dataset.step));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const placed = useMemo(() => (step === 0 || step >= lastStep ? ALL_GROUPS : groupsUpTo(step)), [step, lastStep]);
  const newest = step >= 1 && step < lastStep ? STEP_GROUPS[step - 1] : null;
  const newestLabel = step === 1 ? t('step.deskPart') : step > 1 && step < lastStep ? PART_NAMES[builtProjects[step - 2].id][language] : undefined;

  // Clicking a part of the model scrolls to the step that adds it.
  const { stepNumber, labelFor, nameFor } = usePartLinks();
  const partLinks = {
    labelFor,
    nameFor,
    hrefFor: (group: string) => `#schritt-${stepNumber(group)}`,
    onPick: (group: string) => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById(`schritt-${stepNumber(group)}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    },
  };

  const register = (i: number) => (el: HTMLElement | null) => {
    stepRefs.current[i] = el;
  };

  return (
    <main id="main" className="booklet">
      <section className="cover" aria-labelledby="cover-title" ref={register(0)} data-step={0}>
        <div className="cover-text">
          <h1 id="cover-title" className="cover-name">{t('hero.name')}</h1>
          <p className="cover-lede">{t('cover.lede')}</p>
          <PartsBox title={t('cover.contents')} className="contents">
            <ol className="contents-list">
              <li><a href="#schritt-1"><span className="contents-num">1</span>{t('step.baseplate')}</a></li>
              {builtProjects.map((p, i) => (
                <li key={p.id}>
                  <a href={`#schritt-${i + 2}`}>
                    <span className="contents-num">{i + 2}</span>
                    <span className="swatch" data-color={p.brick.color} aria-hidden="true" />
                    {p.title[language]}
                  </a>
                </li>
              ))}
              <li><a href="#fertig"><span className="contents-num"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8.5 3.2 3L13 4.5" /></svg></span>{t('step.done')}</a></li>
            </ol>
          </PartsBox>
          <a className="btn" href="#schritt-1">{t('cover.start')}</a>
        </div>
        <div className="cover-model">
          <BuildModel placed={ALL_GROUPS} title={t('model.finished')} {...partLinks} />
        </div>
      </section>

      <div className="build">
        <div className="build-steps">
          <section id="schritt-1" className="step" ref={register(1)} data-step={1} aria-labelledby="step-1-title">
            <p className="step-num" aria-hidden="true">1</p>
            <h2 id="step-1-title" className="step-title">{t('step.baseplate')}</h2>
            <p className="step-lede">{t('step.baseplateLede')}</p>
            <PartsBox title={t('step.careerParts')}>
              <ol className="career">
                {spacestationModules.map((m) => (
                  <li key={m.id}>
                    <span className="career-date">{m.date[language]}</span>
                    <span className="career-what">
                      <b>{m.type === 'experience' ? m.title[language] : m.degree[language]}</b>
                      {m.type === 'experience' ? m.company : m.institution}
                    </span>
                  </li>
                ))}
              </ol>
            </PartsBox>
            <PartsBox title={t('step.skillParts')} className="parts--loose">
              <ul className="skills">
                {SKILLS.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </PartsBox>
          </section>

          {builtProjects.map((p, i) => {
            const n = i + 2;
            return (
              <section key={p.id} id={`schritt-${n}`} className="step" ref={register(n)} data-step={n} aria-labelledby={`step-${n}-title`}>
                <p className="step-num" aria-hidden="true">{n}</p>
                <p className="step-class">
                  <span className="swatch" data-color={p.brick.color} aria-hidden="true" />
                  {PART_NAMES[p.id][language]} · {p.objectClass[language]}
                </p>
                <h2 id={`step-${n}-title`} className="step-title">{p.title[language]}</h2>
                <p className="step-lede">{p.description[language]}</p>
                <PartsBox title={t('step.parts')}>
                  <ul className="part-list">
                    {p.technologies.map((tech) => (
                      <li key={tech}><span>{tech}</span><span className="qty">×1</span></li>
                    ))}
                  </ul>
                </PartsBox>
                <Link className="btn" to={`/project/${p.id}`}>{t('step.open')}</Link>
              </section>
            );
          })}
        </div>

        <div className="build-model" aria-hidden={step === 0}>
          <div className="build-model-inner">
            <BuildModel placed={placed} newest={newest} calloutLabel={newestLabel} title={t('model.inProgress')} {...partLinks} />
            <p className="build-progress">
              {step >= 1 && step < lastStep ? `${t('model.step')} ${step} / ${STEP_GROUPS.length}` : t('model.finished')}
            </p>
          </div>
        </div>
      </div>

      <section id="fertig" className="done" ref={register(lastStep)} data-step={lastStep} aria-labelledby="done-title">
        <div className="done-head">
          <BuildModel placed={ALL_GROUPS} title={t('model.finished')} className="model--small" {...partLinks} />
          <div>
            <h2 id="done-title" className="done-title">{t('step.done')}</h2>
            <p className="done-lede">{t('about.paragraph1')}</p>
            <p className="done-text">{t('about.paragraph2')}</p>
            <p className="done-text">{t('about.german')} · {t('about.english')}</p>
          </div>
        </div>
        <div className="done-contact" id="kontakt">
          <h3 className="done-contact-title">{t('contact.title')}</h3>
          <p className="done-text">{t('contact.intro')}</p>
          <ContactForm />
        </div>
      </section>
    </main>
  );
};

export default HomePage;
