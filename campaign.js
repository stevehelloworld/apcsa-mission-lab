/* Course map and Lessons 3–15. Java files run on the learner's JDK, outside the browser. */
(() => {
  const main = document.querySelector('#mission-main');
  const lessons = window.campaignLessons;
  const storageKey = 'future-course-campaign-v1';
  const blank = { completed: [], work: {}, last: null };
  let data = blank;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.completed) && saved.work && typeof saved.work === 'object') data = saved;
  } catch {}
  let view = null;
  let ticker;
  const teacherTimers = {};
  const formatId = id => String(id).padStart(2, '0');
  const t = (en, zh) => document.documentElement.lang === 'zh-Hant' ? zh : en;
  const label = pair => Array.isArray(pair) ? t(...pair) : pair;
  const e = value => String(value ?? '').replace(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const lessonFor = id => lessons.find(lesson => lesson.id === id);
  const sectionTitle = section => label(section.title);
  const getSteps = id => {
    const lesson = lessonFor(id);
    return lesson ? [
      { type: 'brief', title: ['Mission briefing', '任務簡報'] },
      ...lesson.tasks,
      { type: 'reflection', title: ['Debrief', '任務總結'] }
    ] : [];
  };
  const sectionNames = id => getSteps(id).map(sectionTitle);
  const workFor = id => data.work[id] ||= { frontier: 0, steps: {}, timers: {} };
  const answerFor = (id, step) => workFor(id).steps[step] ||= {};
  const allStepsDone = id => workFor(id).frontier >= getSteps(id).length;
  const isUnlocked = id => id <= 3 || data.completed.includes(id - 1) || data.completed.includes(id);
  const mockQuizCount = lessonFor(15).tasks.filter(task => task.type === 'quiz').length;
  const originalAnswersDone = () => Array.from({length: mockQuizCount}, (_, i) => workFor(15).steps[i + 1])
    .every(answer => answer?.first !== undefined);
  let transientStorage = false;

  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(data)); }
    catch { transientStorage = true; }
    const message = document.querySelector('#save-state');
    if (message) message.textContent = transientStorage
      ? t('This browser could not save progress', '瀏覽器無法儲存進度')
      : t('Progress saved on this device', '進度已儲存在此裝置');
  }

  function button(text, action, style = 'quiet', extra = '') {
    return '<button type="button" class="' + style + '" data-action="' + action + '" ' + extra + '>' + e(text) + '</button>';
  }

  function focusMain() {
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function hide() {
    view = null;
    clearInterval(ticker);
    document.body.classList.remove('campaign-active');
  }

  function open(id, step, review = false) {
    const shouldFocus = view !== null || document.activeElement !== document.body;
    if (id === 0) view = { id: 0 };
    else {
      const sections = getSteps(id);
      if (!sections.length || (!review && !isUnlocked(id))) return false;
      const work = workFor(id);
      const selected = step ?? Math.min(work.frontier, sections.length - 1);
      if (!Number.isInteger(selected) || selected < 0 || selected >= sections.length) return false;
      if (!review && selected > work.frontier) return false;
      view = { id, step: selected, review, frame: 0 };
      if (!review) {
        data.last = { id, step: selected };
        save();
      }
    }
    document.body.classList.add('campaign-active');
    main.setAttribute('data-no-translate', '');
    render();
    if (shouldFocus) focusMain();
    return true;
  }

  function markStep() {
    const { id, step, review } = view;
    const work = workFor(id);
    if (!review && step === work.frontier) {
      work.frontier += 1;
      if (allStepsDone(id) && !data.completed.includes(id)) data.completed.push(id);
    }
    save();
  }

  function next() {
    const { id, step, review } = view;
    if (step + 1 >= getSteps(id).length) return;
    if (review) {
      window.dispatchEvent(new CustomEvent('campaign:teacher-step', { detail: [id, step + 1] }));
      return;
    }
    open(id, step + 1);
  }

  function oldComplete(id) {
    try {
      if (id === 1) {
        const done = JSON.parse(localStorage.getItem('future-linear-mission-v3'))?.done ?? [];
        return [0, 1, 2, 3, 4, 5].every(stage => done.includes(stage));
      }
      const market = JSON.parse(localStorage.getItem('future-lesson-2-precision-market-v1'));
      return market?.completed && market.maxStage >= 5;
    } catch { return false; }
  }

  const legacy = [
    { id: 1, title: ['Restore the Grid', '修復電網'], topic: ['Java foundations', 'Java 基礎'] },
    { id: 2, title: ['Precision Market', '精準市集'], topic: ['Expressions & type behavior', '運算式與型別行為'] }
  ];
  const chapters = [
    { title: ['Objects and methods', '物件與方法'], ids: [1, 2, 3] },
    { title: ['Selection and iteration', '條件選擇與迴圈'], ids: [4, 5, 6, 7] },
    { title: ['Class creation', '類別建構'], ids: [8, 9] },
    { title: ['Data collections', '資料集合'], ids: [10, 11, 12, 13] },
    { title: ['FRQ workshop and final review', 'FRQ 工作坊與總複習'], ids: [14, 15] }
  ];

  function mapMarkup() {
    const finished = legacy.filter(row => oldComplete(row.id)).length + data.completed.length;
    const suggested = (data.last && isUnlocked(data.last.id) && !data.completed.includes(data.last.id) ? data.last.id : null) ??
      legacy.find(row => !oldComplete(row.id))?.id ?? lessons.find(lesson => isUnlocked(lesson.id) && !data.completed.includes(lesson.id))?.id;
    const resume = suggested >= 3 && data.last?.id === suggested && data.last.step <= workFor(suggested).frontier
      ? data.last.step : null;
    return '<div class="campaign-shell"><header class="campaign-map-hero"><img src="assets/city.jpg" alt="">' +
      '<div><h1>' + t('City Mission Map', '城市任務地圖') + '</h1>' +
      '<p>' + t('Restore the city through fifteen Java missions. Pick up your next assignment or revisit an unlocked lesson.', '完成十五堂 Java 任務，逐步修復城市。可繼續下一個任務，也能複習已解鎖的課程。') + '</p>' +
      '<p class="campaign-map-status">' + e(finished) + ' / 15 ' + t('missions completed', '堂任務已完成') + '</p>' +
      (suggested ? button(t('Continue to Lesson ', '前往第 ') + suggested + t('', ' 課'), 'open-lesson', 'primary', 'data-lesson="' + suggested + '"' + (resume !== null ? ' data-step="' + resume + '"' : '')) :
        button(t('Download course evidence', '下載課程學習紀錄'), 'evidence', 'primary')) + '</div></header>' +
      '<div class="campaign-map-list">' + chapters.map(chapter =>
        '<section><h2>' + e(label(chapter.title)) + '</h2><ol>' + chapter.ids.map(id => {
          const lesson = id < 3 ? legacy[id - 1] : lessonFor(id);
          const done = id < 3 ? oldComplete(id) : data.completed.includes(id);
          const locked = !isUnlocked(id);
          const status = done ? t('Completed', '已完成') : locked ? t('Locked', '未解鎖') : t('Available', '可開始');
          return '<li><button type="button" class="campaign-map-row" data-action="open-lesson" data-lesson="' + id + '"' +
            (locked ? ' disabled' : '') + '><span class="campaign-lesson-number">' + formatId(id) + '</span><span><strong>' +
            e(label(lesson.title)) + '</strong><small>' + e(label(lesson.topic)) + '</small></span><span class="campaign-row-status">' + e(status) + '</span></button></li>';
        }).join('') + '</ol></section>'
      ).join('') + '</div></div>';
  }

  function schedule(lesson) {
    if (lesson.id === 15) return [[8, ['Setup', '準備']], [18, ['Eight questions', '八題選擇']], [25, ['Free response', '自由作答']], [30, ['Review and retry', '檢討與重做']], [9, ['Study plan', '複習計畫']]];
    if (lesson.id === 14) return [[10, ['Read the contracts', '讀題與規格']], [48, ['Four FRQs', '四類自由作答']], [24, ['Integration and rubric', '整合與評分']], [8, ['Debrief', '任務總結']]];
    return [[10, ['Briefing and retrieval', '簡報與暖身']], [22, ['Predict, trace and repair', '預測、追蹤與除錯']], [43, ['Write, test and revise', '撰寫、測試與修正']], [15, ['Transfer and debrief', '遷移練習與總結']]];
  }

  function briefing(lesson) {
    return '<p class="campaign-lead">' + e(label(lesson.briefing)) + '</p><dl class="campaign-agenda">' +
      schedule(lesson).map(([minutes, title]) => '<div><dt>' + e(label(title)) + '</dt><dd>' + minutes + ' ' + t('min', '分鐘') + '</dd></div>').join('') +
      '</dl><p class="campaign-note">' + e(label(lesson.reference)) + '</p>' +
      '<div class="campaign-actions">' + button(t('Start mission', '開始任務'), 'begin', 'primary') + '</div>';
  }

  function choiceOrder(task, lessonId, step) {
    const options = [...task.distractors];
    options.splice((lessonId * 3 + step) % (options.length + 1), 0, task.correct);
    return options;
  }

  function quizMarkup(task, lesson) {
    const answer = answerFor(lesson.id, view.step);
    const mock = lesson.id === 15;
    const hasAnswer = answer.first !== undefined;
    const graded = view.review ? view.checked : mock ? answer.first : answer.checked;
    const seeFeedback = view.review ? graded !== undefined : mock ? originalAnswersDone() && hasAnswer : graded !== undefined;
    const options = choiceOrder(task, lesson.id, view.step);
    const correct = options.indexOf(task.correct);
    const selected = view.selection ?? (mock && hasAnswer ? answer.first : answer.selected ?? answer.checked);
    return (mock ? timerMarkup(18, 'quiz') : '') + '<p class="campaign-lead">' + e(label(task.prompt)) + '</p>' +
      (task.code ? '<pre class="campaign-code"><code>' + e(task.code) + '</code></pre>' : '') +
      '<fieldset class="campaign-options"><legend class="sr-only">' + t('Choose an answer', '選擇答案') + '</legend>' +
      options.map((option, index) => '<label><input type="radio" name="campaign-choice" value="' + index + '"' +
        (index === selected ? ' checked' : '') + (mock && hasAnswer && !view.review ? ' disabled' : '') +
        '><span>' + String.fromCharCode(65 + index) + '</span><code>' + e(label(option)) + '</code></label>').join('') + '</fieldset>' +
      (seeFeedback ? '<p class="campaign-feedback ' + (graded === correct ? 'correct' : 'retry') + '" role="status" tabindex="-1">' +
        e(label(task.feedback)) + (mock ? ' ' + t('Correct option ', '正確選項 ') + String.fromCharCode(65 + correct) + '.' : '') + '</p>' :
        (mock && hasAnswer ? '<p class="campaign-note">' + t('Answer recorded. Review feedback after all eight questions.', '初答已記錄。八題作答完畢後可檢視回饋。') + '</p>' : '')) +
      (seeFeedback && task.frames.length ? traceMarkup(task.frames) : '') +
      '<div class="campaign-actions">' + ((!mock || !hasAnswer || view.review) ? button(mock && !view.review ? t('Record answer', '記錄答案') : t('Check answer', '檢查答案'), 'quiz-submit', 'primary') : '') +
      ((view.review || (mock ? hasAnswer : answer.passed)) ? button(t('Next step', '下一小關'), 'next', 'quiet') : '') + '</div>';
  }

  function traceMarkup(frames) {
    const index = Math.min(view.frame, frames.length - 1);
    return '<figure class="campaign-trace"><figcaption>' + t('Step through the trace', '逐步查看程式追蹤') + '</figcaption>' +
      '<output aria-live="polite"><small>' + (index + 1) + ' / ' + frames.length + '</small><code>' + e(frames[index]) + '</code></output>' +
      '<div>' + button(t('Back', '上一步'), 'trace-back', 'quiet', index === 0 ? 'disabled' : '') +
      button(t('Step', '下一步'), 'trace-next', 'quiet', index === frames.length - 1 ? 'disabled' : '') + '</div></figure>';
  }

  function submitQuiz(task) {
    const selected = main.querySelector('input[name="campaign-choice"]:checked');
    if (!selected) { report(t('Select an answer to continue.', '請先選擇一個答案。')); return; }
    const answer = answerFor(view.id, view.step);
    const index = Number(selected.value);
    if (view.review) {
      view.checked = index;
    } else if (view.id === 15) {
      if (answer.first === undefined) answer.first = index;
      markStep();
    } else {
      answer.checked = index;
      const options = choiceOrder(task, view.id, view.step);
      if (options[index] === task.correct) {
        answer.passed = true;
        markStep();
      }
    }
    save();
    render();
    main.querySelector('.campaign-feedback')?.focus?.();
  }

  function labEvidenceStatus(answer) {
    if (!answer.submission) return '';
    const revised = answer.code !== answer.submission.code || answer.evidence !== answer.submission.evidence;
    return revised ? t('Your previous submission is saved. Record the revised evidence when it is ready.', '先前提交的版本已保留。修訂完成後，可重新記錄證據。')
      : t('Evidence recorded for teacher review.', '已記錄，供老師評閱。');
  }

  function labMarkup(task, lesson) {
    const answer = answerFor(lesson.id, view.step);
    return (lesson.id === 15 ? timerMarkup(25, 'lab') : '') +
      '<p class="campaign-lead">' + e(label(task.prompt)) + '</p>' +
      '<label class="campaign-label" for="campaign-editor">' + t('Your Java draft', '你的 Java 草稿') + '</label>' +
      '<textarea id="campaign-editor" data-field="code" class="campaign-editor" spellcheck="false" autocapitalize="off">' +
      e(answer.code ?? task.starter) + '</textarea>' +
      '<div class="campaign-lab-tools">' + button(t('Download Java & tests', '下載 Java 與測試'), 'download-lab') +
      '<code>javac MissionLab.java &amp;&amp; java MissionLab</code></div>' +
      '<p class="campaign-note">' + t('Save each download as MissionLab.java in its own folder and run it with a JDK or Java IDE. Paste a test result and explain one boundary case. For the timed attempt, write first and run the tests afterward.', '將每份下載存到各自的資料夾，檔名為 MissionLab.java，再用 JDK 或 Java IDE 執行。貼上一項測試結果並說明一個邊界情況。限時練習時先完成作答，再執行測試。') + '</p>' +
      '<details class="campaign-reference"><summary>' + t('Review criteria', '評閱重點') + '</summary><p>' + e(label(task.criteria)) + '</p></details>' +
      '<label class="campaign-label" for="campaign-test-note">' + t('Test result and explanation', '測試結果與說明') + '</label>' +
      '<textarea class="campaign-note-input" id="campaign-test-note" data-field="evidence" rows="3">' + e(answer.evidence) + '</textarea>' +
      '<p class="campaign-inline-status" role="status">' + e(labEvidenceStatus(answer)) + '</p>' +
      '<div class="campaign-actions">' + button(t('Record my test evidence', '記錄測試證據'), 'record-lab', 'primary') +
      ((answer.submission || view.review) ? button(t('Next step', '下一小關'), 'next') : '') + '</div>';
  }

  function javaFile(task, source) {
    const indent = (value, count) => value.split('\n').map(line => line ? ' '.repeat(count) + line : '').join('\n');
    return (task.imports ? task.imports + '\n\n' : '') +
      'public class MissionLab {\n' + indent(source, 4) + '\n\n' +
      '    static int failed = 0;\n' +
      '    static void check(boolean passed, String name) {\n' +
      '        System.out.println((passed ? "PASS: " : "FAIL: ") + name);\n' +
      '        if (!passed) failed++;\n' +
      '    }\n\n' +
      '    public static void main(String[] args) {\n' + indent(task.tests, 8) + '\n' +
      '        // Add your own check here.\n' +
      '        if (failed > 0) throw new AssertionError(failed + " test(s) failed");\n' +
      '        System.out.println("All published tests passed.");\n    }\n}\n';
  }

  function activeTimers() { return view.review ? teacherTimers : workFor(15).timers; }

  function timerMarkup(minutes, kind) {
    const timer = activeTimers()[kind];
    return '<div class="campaign-timer"><span>' + e(t(kind === 'quiz' ? 'Question timer' : 'Writing timer', kind === 'quiz' ? '選擇題計時' : '寫作計時')) +
      '</span><output data-clock="' + kind + '">' + formatClock(timer, minutes) + '</output>' +
      (!timer ? button(t('Start timer', '開始計時'), 'timer', 'quiet', 'data-kind="' + kind + '"') : '') + '</div>';
  }

  function formatClock(start, minutes) {
    const seconds = start ? Math.max(0, Math.ceil((start + minutes * 60000 - Date.now()) / 1000)) : minutes * 60;
    return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
  }

  function reflectionMarkup(lesson) {
    const answer = answerFor(lesson.id, view.step);
    const complete = !view.review && data.completed.includes(lesson.id);
    const final = lesson.id === 15;
    const count = final && originalAnswersDone() ? lesson.tasks.filter((task, index) =>
      task.type === 'quiz' && choiceOrder(task, lesson.id, index + 1)[answerFor(lesson.id, index + 1).first] === task.correct).length : null;
    return (count !== null ? '<p class="campaign-score">' + count + ' / ' + mockQuizCount + ' ' + t('correct on first attempt', '題初答正確') + '</p>' : '') +
      (complete ? '<p class="campaign-feedback correct" role="status">' +
        e(final ? t('Citywide check complete. Save your evidence and use your study plan to replay earlier missions.', '全城檢查已完成。下載學習紀錄，再依複習計畫回到前面的任務。') :
          t('Mission complete. The next district is available.', '任務完成，下一個地區已開放。')) + '</p>' : '') +
      '<p class="campaign-lead">' + e(label(lesson.reflection)) + '</p>' +
      '<label class="campaign-label" for="campaign-reflection">' + t('Your explanation', '你的說明') + '</label>' +
      '<textarea id="campaign-reflection" data-field="reflection" class="campaign-note-input" rows="5">' + e(answer.reflection) + '</textarea>' +
      '<p class="campaign-inline-status" role="status"></p><div class="campaign-actions">' +
      button(complete ? t('Save revised reflection', '儲存修訂的說明') : t('Save debrief', '儲存任務總結'), 'debrief', complete ? 'quiet' : 'primary') +
      (complete && !final ? button(t('Open Lesson ', '開啟第 ') + (lesson.id + 1) + t('', ' 課'), 'open-lesson', 'primary', 'data-lesson="' + (lesson.id + 1) + '"') : '') +
      (complete ? button(t('Download evidence', '下載學習紀錄'), 'evidence', final ? 'primary' : 'quiet') : '') + '</div>';
  }

  function lessonMarkup(lesson) {
    const steps = getSteps(lesson.id);
    const current = steps[view.step];
    const progress = workFor(lesson.id).frontier;
    const panel = current.type === 'brief' ? briefing(lesson) :
      current.type === 'quiz' ? quizMarkup(current, lesson) :
        current.type === 'lab' ? labMarkup(current, lesson) : reflectionMarkup(lesson);
    return '<div class="campaign-shell campaign-mission"><nav class="campaign-top" aria-label="' + t('Course route', '課程路線') + '">' +
      button(t('Mission map', '任務地圖'), 'map') + '<span>' + t('Lesson ', '第 ') + lesson.id + t(' / 15', ' / 15 課') + '</span></nav>' +
      '<header class="campaign-mission-header"><h1>' + e(label(lesson.title)) + '</h1><p>' + e(label(lesson.topic)) + '</p></header>' +
      '<div class="campaign-workspace"><aside class="campaign-route"><h2>' + t('Mission steps', '任務步驟') + '</h2><ol>' +
      steps.map((step, i) => '<li><button type="button" data-action="view-step" data-step="' + i + '"' +
        (i === view.step ? ' aria-current="step"' : '') + (!view.review && i > progress ? ' disabled' : '') +
        '><span>' + formatId(i + 1) + '</span><strong>' + e(sectionTitle(step)) + '</strong>' +
        (i < progress ? '<small>' + t('Done', '完成') + '</small>' : '') + '</button></li>').join('') + '</ol></aside>' +
      '<article class="campaign-task"><header><span>' + (view.step + 1) + ' / ' + steps.length + '</span><h2 tabindex="-1">' + e(sectionTitle(current)) + '</h2></header>' +
      panel + '<p class="campaign-global-status" role="status"></p>' +
      (current.type !== 'brief' && lesson.id !== 15 ? '<details class="campaign-reference"><summary>' + t('Java field notes', 'Java 重點筆記') +
        '</summary><p>' + e(label(lesson.reference)) + '</p></details>' : '') + '</article></div></div>';
  }

  function report(message) {
    const status = main.querySelector('.campaign-global-status');
    if (status) status.textContent = message;
  }

  function download(name, content, type = 'text/plain') {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadEvidence() {
    const report = lessons.filter(lesson => data.work[lesson.id]).map(lesson => {
      const steps = getSteps(lesson.id);
      const work = workFor(lesson.id);
      const evidence = Object.entries(work.steps).flatMap(([index, entry]) => {
        const task = steps[index];
        if (!task) return [];
        if (task.type === 'quiz') {
          const option = choiceOrder(task, lesson.id, Number(index))[entry.first ?? entry.checked];
          return option === undefined ? [] : [task.title[0] + '\nAnswer: ' + (Array.isArray(option) ? option[0] : option) + '\n'];
        }
        if (task.type === 'lab') {
          const latest = entry.submission ?? entry;
          const state = entry.submission ? 'Recorded submission' : 'Unsubmitted draft';
          return [task.title[0] + ' · ' + state + '\n' + (latest.code || '') + '\nEvidence: ' + (latest.evidence || '') + '\n'];
        }
        return entry.reflection ? [task.title[0] + '\n' + entry.reflection + '\n'] : [];
      });
      return '\nLesson ' + lesson.id + ' · ' + lesson.title[0] + '\n' + evidence.join('\n');
    });
    download('debug-the-future-course-evidence.txt', 'DEBUG THE FUTURE · COURSE EVIDENCE, LESSONS 3–15\n' + report.join('\n'));
  }

  function requestOpen(id, step) {
    window.dispatchEvent(new CustomEvent('campaign:open', { detail: { id, step } }));
  }

  function handleAction(control) {
    const action = control.dataset.action;
    if (action === 'map') { requestOpen(0); return; }
    if (action === 'open-lesson') {
      requestOpen(Number(control.dataset.lesson), control.dataset.step === undefined ? undefined : Number(control.dataset.step));
      return;
    }
    if (action === 'evidence') { downloadEvidence(); return; }
    const task = getSteps(view.id)[view.step];
    const answer = answerFor(view.id, view.step);
    if (action === 'view-step') {
      const step = Number(control.dataset.step);
      if (view.review) window.dispatchEvent(new CustomEvent('campaign:teacher-step', { detail: [view.id, step] }));
      else open(view.id, step);
    } else if (action === 'begin') {
      markStep();
      next();
    } else if (action === 'next') {
      next();
    } else if (action === 'quiz-submit') {
      submitQuiz(task);
    } else if (action === 'trace-back' || action === 'trace-next') {
      view.frame += action === 'trace-back' ? -1 : 1;
      render();
      const focusTarget = main.querySelector('[data-action="' + action + '"]:not([disabled])') ||
        main.querySelector('.campaign-trace button:not([disabled])');
      focusTarget?.focus();
    } else if (action === 'download-lab') {
      download('MissionLab.java', javaFile(task, answer.code ?? task.starter));
    } else if (action === 'record-lab') {
      if (!answer.code?.trim() || answer.code.trim() === task.starter.trim() || !answer.evidence?.trim()) {
        report(t('Write or paste your Java solution and add a test result before recording it.', '請撰寫或貼上 Java 解法，並填寫測試結果，再儲存紀錄。'));
        return;
      }
      if (view.review) {
        report(t('Draft saved for teacher review.', '已儲存草稿，供老師評閱。'));
        return;
      }
      answer.submission = { code: answer.code, evidence: answer.evidence };
      markStep();
      render();
    } else if (action === 'debrief') {
      if (!answer.reflection?.trim()) { report(t('Add your explanation before saving.', '儲存前請寫下你的說明。')); return; }
      markStep();
      render();
      if (view.review) report(t('Reflection saved for teacher review.', '已儲存說明，供老師評閱。'));
    } else if (action === 'timer' && !activeTimers()[control.dataset.kind]) {
      activeTimers()[control.dataset.kind] = Date.now();
      if (!view.review) save();
      render();
    }
  }

  function render() {
    if (!view) return;
    clearInterval(ticker);
    main.innerHTML = view.id === 0 ? mapMarkup() : lessonMarkup(lessonFor(view.id));
    const route = main.querySelector('.campaign-route ol');
    const current = route?.querySelector('[aria-current="step"]');
    if (current && route.scrollWidth > route.clientWidth) {
      const bounds = route.getBoundingClientRect();
      const step = current.getBoundingClientRect();
      if (step.right > bounds.right || step.left < bounds.left) route.scrollLeft += step.left - bounds.left - 5;
    }
    const clock = main.querySelector('[data-clock]');
    if (clock) {
      const kind = clock.dataset.clock;
      const start = activeTimers()[kind];
      if (start) ticker = setInterval(() => {
        clock.textContent = formatClock(start, kind === 'quiz' ? 18 : 25);
        if (clock.textContent === '00:00') clearInterval(ticker);
      }, 1000);
    }
  }

  main.addEventListener('click', event => {
    if (!view) return;
    const control = event.target.closest('button[data-action]');
    if (control) handleAction(control);
  });

  main.addEventListener('input', event => {
    if (!view?.id) return;
    const answer = answerFor(view.id, view.step);
    if (event.target.dataset.field) {
      const field = event.target.dataset.field;
      answer[field] = event.target.value;
      const status = main.querySelector('.campaign-inline-status');
      if (status && (field === 'code' || field === 'evidence')) status.textContent = labEvidenceStatus(answer);
      save();
    } else if (event.target.name === 'campaign-choice') {
      const selected = Number(event.target.value);
      if (view.review) view.selection = selected;
      else { answer.selected = selected; save(); }
    }
  });

  window.CourseCampaign = {
    open, hide, render, sectionNames, javaFile,
    titles: () => lessons.map(lesson => label(lesson.title)),
    location: () => view && [view.id, 0, view.step ?? 0],
    isUnlocked
  };
})();
