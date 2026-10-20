# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primarily fellow developers and peers. It is a personal showcase and a playground where Leon Hecke experiments with frontend techniques and shows them to other developers. The audience is mostly German, with English as the secondary audience. Recruiters or clients may visit, but they are not the target the site is built for.

## Product Purpose
A personal portfolio for Leon Hecke, a frontend developer (React, TypeScript, JavaScript, Shopware stores). It exists to show and try out frontend craft through working, interactive projects rather than static descriptions. Success means peers explore the projects, try the demos, and come away with a sense of how Leon builds things.

## Positioning
The projects are live, interactive demos you can use inside the portfolio, not screenshots. They come with a technical insight and code snippets that explain how they work. The portfolio itself is part of the experiment.

## Operating Context
- Home page is a building-instructions booklet for a desk workstation: the career is the desk, each project is one part on it. Project pages (`/project/:id`) are single build steps with the live demo.
- Clicking a part of the model jumps to its build step.
- Bilingual UI through `LanguageContext` (EN/DE), defaulting to German and remembering the choice.
- Visitors are developers, so they may inspect code, open devtools, and judge technical quality.

## Capabilities and Constraints
- Stack: React 19 + TypeScript + Vite, SCSS, react-router, dnd-kit, Immer, react-syntax-highlighter. Express server (`server/server.js`) serves the built `dist/` (it still has an unused `/api/planets` endpoint).
- Projects live in `src/ProjectData.ts` (bilingual title, description, technical insight, code snippets); their model geometry lives in `src/buildData.ts`.
- Current projects (all working demos, built 2026-10-20, no public repositories yet): CSS Grid Generator, Image Compressor, Contrast Checker, Kanban Board, Regex Tester, Fluid Type Calculator, Focus Timer. Planetary Dashboard, WIP Sandbox and Project Gamma were removed. Career entries live in `src/spacestationData.ts`.
- Undecided: whether the contact form gets a backend. Today it composes a mailto only when `VITE_CONTACT_EMAIL` is set.
- Repository links are left empty (`repo` field) until real repositories exist.

## Brand Commitments
- The space theme is no longer binding (changed by Leon on 2026-10-20). A Webb deep-field version was built and felt overwhelming, so the visual world is open again.
- Name: Leon Hecke. Current tagline: "A creative developer passionate about building engaging web experiences."

## Evidence on Hand
- Real, working demos: the seven projects above, each runnable in the browser.
- Skills list and two career-path entries in About (translations in `src/contexts/LanguageContext.tsx`). Languages: German (native), English (B2).
- Absent: testimonials, client names, employer names, metrics, and a real GitHub/contact link. Do not fabricate any of these.

## Product Principles
1. Show, don't describe: every project should be something a visitor can use, with the reasoning and code behind it.
2. The portfolio is itself a craft piece: peers will judge its own implementation, performance, and accessibility.
3. Calm over spectacle: the site must never overwhelm. One clear thing per view, and motion and detail are earned, not piled on.
4. German first, English always: every user-facing string exists in both languages.
5. Honest about progress: work in progress is labeled as such, and placeholders are never presented as finished work.
