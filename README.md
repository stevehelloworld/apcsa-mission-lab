# Debug the Future — AP CSA Mission Lab

A browser-based, one-to-one Java learning experience for students aged 12–18. Lesson 1 follows a linear city-repair mission with seven student-written programs, automated checks, code-execution replay, and optional teaching prompts.

## Features

- English by default, with a Traditional Chinese interface switch.
- Sequential investigation, tracing, debugging and independent implementation.
- Seven typed programs, with changed-input tests where applicable.
- Animated scene transitions and true per-statement memory/output replay.
- Pause, step and final-state controls; reduced-motion support.
- Browser-local progress and downloadable learning evidence.

## Hosting

This repository contains only the static student website. GitHub Pages publishes the `main` branch from `/`. `.nojekyll` keeps the files unchanged. All project assets use relative paths, so the website supports the repository subpath.

To preview locally, run `python3 -m http.server 4173` from this directory and open `http://127.0.0.1:4173/`.

## Learning and runtime scope

This is introductory AP CSA Unit 1 practice, not a complete AP course or exam-readiness score. The runner implements a limited subset of Java statements, not a JVM or a full Java compiler. Explanations require a teacher's review. Teacher mode is a presentation aid, not an access-control boundary.

No learner accounts, server-side execution, or database are included. Work is stored in the visitor's browser on this origin; export it before switching browsers or devices. Existing work on a localhost preview does not automatically transfer to GitHub Pages.

Images and their generation prompts are in `assets/`. Fonts load optionally from Google Fonts with system fallbacks. Private teacher solutions, local browser tests, earlier lesson documents and local platform configuration are not part of this repository.

This independent educational project is not affiliated with or endorsed by College Board.
