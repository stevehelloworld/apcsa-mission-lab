# Debug the Future — AP CSA Mission Lab

Fifteen Java missions for learners aged 12–18 working one-to-one with a tutor. The mission map covers objects and methods, selection and iteration, class creation, data collections, and original exam practice.

## Playing and teaching

- Start from the mission map. Lessons 1 and 2 retain their city and night-market activities. Lesson 3 can serve as a starting point for learners who already know the basics. In Lessons 3–15, saving a debrief after the required steps opens the next mission.
- Lessons 3–13 combine prediction, trace or debugging questions with Java practice. Lesson 14 includes four free-response categories and a separate integration task. Lesson 15 includes a timed eight-question mini-mock, a timed programming task, and a personal study plan. The practice questions are original.
- English is the default. Select 繁體中文 for Traditional Chinese. Code and required output stay in Java or English.
- The teacher review menu can open a specific step in any lesson, including a lesson that students have not yet reached. Teacher review in Lessons 3–15 keeps the student’s unlock progress separate.
- The browser stores progress and drafts on the current device. Download evidence before changing devices. The new course export covers Lessons 3–15. Use the original lesson controls to export Lesson 1 and Lesson 2 evidence.

## Running Java practice

For Lessons 3–15, edit the draft in the site and choose **Download Java & tests**. Save the download as `MissionLab.java`, then compile and run it in a JDK or open it in a Java IDE.

```sh
javac MissionLab.java
java MissionLab
```

The generated file runs the displayed exercise's test cases. Add a test for another input and record the actual result with a short explanation on the site. The teacher reviews code quality and written explanations. The first two lessons use their built-in limited Java practice runner.

## Hosting and course scope

GitHub Pages publishes the `main` branch from the repository root. All local assets use relative paths. For a local preview, run `python3 -m http.server 4173` from this directory. The 3D opening scenes load a pinned Three.js module from jsDelivr and the original lesson controls remain available without the 3D module.

The mission sequence follows the four units described in the [College Board AP Computer Science A overview](https://apstudents.collegeboard.org/courses/ap-computer-science-a). This independent site is not affiliated with College Board. The mini-mock is short practice for pacing and review. Art provenance is recorded in `assets/provenance.json`.
