---
version: 1
slug: "src-components-homepage-tsx"
primary_target: "src/components/HomePage.tsx"
related_targets: ["src/App.tsx","src/components/ProjectDetail.tsx"]
---

# Surface brief: portfolio home (Bauanleitung) and site shell

Scope: whole site. The home page is the building instructions; project pages are single build steps; the demo routes inherit the booklet shell. Mode: Experience.
Audience: developer peers, German first, EN secondary. Job: understand who Leon is and what he builds, then open and use a demo.
Constraints: keep the EN/DE switch and respect reduced motion. Calm over spectacle: one clear thing per view (the deep-field version overwhelmed). Demo internals keep working.
History: a Webb deep-field world was built and rejected as overwhelming. Space is no longer binding.
Unresolved: Project Gamma is unconfirmed, so it is left out of the steps. The contact form has no backend (mailto when VITE_CONTACT_EMAIL is set).

## Direction contract

THESIS: Leon's portfolio is one model, built step by step: the career is the baseplate, each project is a brick, and its technologies are its parts list. It refuses the hero + card-grid portfolio and the dark neon dev page.

OWN-WORLD: Instruction-booklet paper (#f4f4f1) and ink (#1d1f24). Bricks in four solid colours, one per object: baseplate green, red, blue, yellow (yellow is work in progress). Rounded grey parts boxes, numbered round callouts, huge bold step numerals, ×1 quantities, sub-assembly frames. Rubik throughout; mono only for code. No gradients, glass or glow.

STORY: The visitor sees the finished model on the cover, then scrolls through the steps while the model rebuilds brick by brick. Each step names its parts and opens into that project's build page with the live demo. It ends with the finished model, about and contact.

FIRST VIEWPORT: Left: "Leon Hecke" at about 6rem, a one-sentence lede, and a parts box listing the steps (Inhalt) with a primary "Bauanleitung starten" action. Right: the finished isometric model at about 55% width with numbered callouts. Quiet header with name, links and DE/EN.

FORM: Bauanleitung (building instructions), my top-ranked candidate (position 1 of 7), chosen by Leon as the pick; seed:447317ab4304ee74. Signature interaction: a sticky isometric model that adds each brick with a short drop as its step scrolls into view, with a ×1 callout on the newest part. Motion grammar: the drop only, ease-out, no bounce, and nothing else moves.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
