# Debug the Future — AP CSA Mission Lab

A browser-based, one-to-one Java learning experience for students aged 12–18. Lesson 1 is a city-repair mission; Lesson 2 is a separate 90-minute night-market mission about expressions and type behavior. Both include progressive challenges, student-written Java, changed-input checks, bilingual controls, and local evidence export.

## Features

- English by default, with a Traditional Chinese interface switch.
- Two selectable, sequential course missions: Lesson 1 · Restore the Grid and Lesson 2 · Precision Market.
- Lesson 1: investigation, state tracing, debugging, and seven typed programs.
- Lesson 2: expression-order puzzles, animated integer division/remainder distribution, type repairs, three typed programs, and an AP-style checkpoint.
- Playable 3D city grid, statement-by-statement memory trace, and a distinct animated neon night market.
- Changed-input checks for student programs, with progress and downloadable evidence stored locally in the browser.
- Animated scene transitions and true per-statement memory/output replay.
- Pause, step and final-state controls; reduced-motion support.
- Browser-local progress and downloadable learning evidence.

## Hosting

This repository contains only the static student website. GitHub Pages publishes the `main` branch from `/`. `.nojekyll` keeps the files unchanged. All project assets use relative paths, so the website supports the repository subpath.

To preview locally, run `python3 -m http.server 4173` from this directory and open `http://127.0.0.1:4173/`.

The 3D scenes load a pinned Three.js module from jsDelivr. An internet connection is needed for those visuals; all lesson controls remain available if the module cannot load.

## Learning and runtime scope

This is introductory AP CSA Unit 1 practice, not a complete AP course or exam-readiness score. Lesson 2 aligns to the College Board's Unit 1 topics on evaluating arithmetic expressions, assignment operators, and operator sequencing. The runner implements a limited subset of Java statements, not a JVM or a full Java compiler. Explanations require a teacher's review. Teacher mode is a presentation aid, not an access-control boundary.

The lessons are independent educational work, not affiliated with College Board. See the [AP Computer Science A course overview](https://apstudents.collegeboard.org/courses/ap-computer-science-a).

No learner accounts, server-side execution, or database are included. Work is stored in the visitor's browser on this origin; export it before switching browsers or devices. Existing work on a localhost preview does not automatically transfer to GitHub Pages.

Images and their generation prompts are in `assets/`. Fonts load optionally from Google Fonts with system fallbacks. Private teacher solutions, local browser tests, earlier lesson documents and local platform configuration are not part of this repository.

This independent educational project is not affiliated with or endorsed by College Board.
