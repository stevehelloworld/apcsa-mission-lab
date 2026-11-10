/* Playable first two mission levels: live grid controls and a prediction-first trace run. */
(function () {
  var traceFrames = [];
  try {
    traceFrames = runJava(codeTrace, { trace: true }).trace || [];
  } catch (error) {
    traceFrames = [];
  }

  if (!m.traceGameVersion) {
    if (m.coreDone && (m.coreDone[2] || m.done.includes(2))) {
      m.traceLocked = true;
      m.traceStep = traceFrames.length;
    } else {
      m.traceLocked = false;
      m.traceStep = 0;
    }
    m.traceGameVersion = 1;
    persist();
  }

  var baseBodyScene = bodyScene;
  bodyScene = function () {
    var html = baseBodyScene();
    if (m.scene === 1 && !activeLab()) {
      html = html.replace(/<div class="reactor">[\s\S]*?<\/div><div class="sliders">/, gridStage() + '<div class="sliders">');
      html = html.replace('<p class="actual">', powerObjectives() + '<p class="actual">');
    }
    if (m.scene === 2 && !activeLab()) {
      html = html.replace('<p>Read without running. Supply and usage both change between calculations. Predict exactly what the two print statements report.</p>',
        '<p>Predict both reports before the trace starts. Seal your answers, then execute each statement and watch the memory relay.</p>');
      html = html.replace('<pre class="code">' + safe(codeTrace) + '</pre>', traceStage() + traceProgram());
      html = html.replace('Verify both reports', 'Seal prediction & activate trace');
      html = html.replace('<div id="trace-feedback" role="status"></div>', '<div id="trace-feedback" role="status"></div>' + traceControls());
    }
    return html;
  };

  function gridStage() {
    return '<section class="game-world power-world" data-game-stage="grid" aria-label="Level 1: three-dimensional city power grid">' +
      '<canvas class="game-canvas" aria-hidden="true"></canvas>' +
      '<div class="world-topline"><span class="world-level">LEVEL 1 <i>／</i> GRID CONTROL</span><span class="world-phase" id="power-phase">Tune the readings</span></div>' +
      '<div class="world-readouts"><div class="world-stat"><span>LIVE BALANCE</span><strong id="world-balance">' + (m.power.energy - m.power.used) + '</strong><small>units</small></div>' +
      '<div class="memory-display"><span>STORED IN MEMORY</span><strong id="stored">' + m.power.stored + '</strong><code>remaining</code></div></div>' +
      '<p class="world-cue">Drag to rotate the grid. The controls below change the live readings.</p>' +
      '<p class="game-load-status" role="status" aria-live="polite">Connecting the 3D grid...</p>' +
      '<button class="world-reset" type="button" data-world-reset="grid" aria-label="Reset 3D view">Reset view</button></section>';
  }

  function powerObjectives() {
    var calibrated = m.power.energy === 120 && m.power.used === 45;
    var predicted = calibrated && q('#control-answer') && q('#control-answer').value === '75';
    var complete = !!(m.coreDone && m.coreDone[1]);
    var current = complete ? 3 : !calibrated ? 1 : !predicted ? 2 : 3;
    return '<ol class="quest-track" aria-label="Level 1 objectives">' +
      objectiveItem(1, 'Set both sensor readings', calibrated, current) +
      objectiveItem(2, 'Predict the stored value', predicted, current) +
      objectiveItem(3, 'Execute the assignment', complete, current) + '</ol>';
  }

  function objectiveItem(index, label, done, current) {
    return '<li class="' + (done ? 'complete' : index === current ? 'current' : '') + '" data-power-objective="' + index + '"><span class="quest-marker">' +
      (done ? '✓' : index) + '</span><span>' + label + '</span></li>';
  }

  function traceProgram() {
    var step = Math.max(0, Math.min(traceFrames.length, Number(m.traceStep) || 0));
    var items = codeTrace.split('\n').map(function (line, index) {
      var state = index < step ? 'done' : index === step && step < traceFrames.length ? 'active' : '';
      return '<li class="' + state + '" data-trace-line="' + index + '"><span>' + (index + 1) + '</span><code>' + safe(line) + '</code></li>';
    }).join('');
    return '<ol class="trace-program" aria-label="Java program, highlighted one statement at a time">' + items + '</ol>';
  }

  function traceControls() {
    return '<div class="trace-play-controls"><button class="primary" id="trace-next" type="button" disabled>Execute next statement <span aria-hidden="true">→</span></button>' +
      '<button class="link-button" id="trace-revise" type="button" hidden>Revise prediction</button>' +
      '<span class="trace-guidance" id="trace-guidance" role="status" aria-live="polite">Enter both predictions first, then seal them to activate the trace.</span></div>';
  }

  function traceStage() {
    var step = Math.max(0, Math.min(traceFrames.length, Number(m.traceStep) || 0));
    var frame = step ? traceFrames[step - 1] : null;
    var memory = frame ? frame.memory : {};
    var output = frame ? frame.output : '';
    return '<section class="game-world trace-world" data-game-stage="trace" data-trace-step="' + step + '" aria-label="Level 2: three-dimensional Java memory trace">' +
      '<canvas class="game-canvas" aria-hidden="true"></canvas>' +
      '<div class="world-topline"><span class="world-level">LEVEL 2 <i>／</i> SIGNAL TRACE</span><span class="world-phase" id="trace-count">' + step + ' / ' + traceFrames.length + ' statements</span></div>' +
      '<div class="trace-hud"><div class="trace-memory" aria-label="Variable memory after the current statement">' +
      memorySlot('energy', memory) + memorySlot('used', memory) + memorySlot('remaining', memory) + '</div>' +
      '<div class="trace-console"><span>PROGRAM OUTPUT</span><div class="trace-output" id="trace-output">' + safe(output || 'No output yet.') + '</div></div></div>' +
      '<p class="world-cue">Lock your prediction, then step through the program to watch memory change.</p>' +
      '<p class="game-load-status" role="status" aria-live="polite">Connecting the 3D trace relay...</p>' +
      '<button class="world-reset" type="button" data-world-reset="trace" aria-label="Reset 3D view">Reset view</button></section>';
  }

  function memorySlot(name, memory) {
    var item = memory[name];
    return '<div class="memory-slot" data-memory-slot="' + name + '"><code>' + name + '</code><strong>' +
      (item ? safe(String(item.v)) : '—') + '</strong><span>' + (item ? safe(item.t) : 'unassigned') + '</span></div>';
  }

  var basePaint = paint;
  paint = function () {
    basePaint();
    syncPower();
    syncTrace();
  };

  var baseBind = bindMission;
  bindMission = function () {
    baseBind();
    bindInteractiveLevel();
  };

  function bindInteractiveLevel() {
    if (m.scene === 1 && !activeLab()) {
      var execute = q('#execute-assignment');
      if (execute) execute.onclick = executePowerAssignment;
    }
    if (m.scene === 2 && !activeLab()) {
      var seal = q('#check-trace');
      var advance = q('#trace-next');
      var revise = q('#trace-revise');
      if (seal) seal.onclick = sealTracePrediction;
      if (advance) advance.onclick = advanceTrace;
      if (revise) revise.onclick = reviseTrace;
    }
  }

  function executePowerAssignment() {
    m.power.energy = Number(q('#energy').value);
    m.power.used = Number(q('#used').value);
    var ok = m.power.energy === 120 && m.power.used === 45 && q('#control-answer').value === '75';
    window.dispatchEvent(new CustomEvent('mission:power-attempt', { detail: { ok: ok, energy: m.power.energy, used: m.power.used } }));
    if (ok) {
      m.power.stored = 75;
      q('#stored').textContent = '75';
      q('#actual').textContent = String(m.power.energy - m.power.used);
      q('#memory-state').textContent = 'Memory matches.';
      mark(1);
      refreshContinue();
      window.dispatchEvent(new CustomEvent('mission:power-run', { detail: { balance: m.power.energy - m.power.used } }));
    }
    persist();
    syncPower();
    feedback('#control-feedback', ok ?
      '<strong>Reading updated: 75.</strong>The assignment evaluated 120 − 45 now and replaced the stored 65. The mismatch is explained.' :
      'Set supply to 120 and usage to 45, then predict their difference. Memory does not update until the assignment executes.', ok);
  }

  function syncPower() {
    if (m.scene !== 1 || !q('.power-world')) return;
    var energy = q('#energy') ? Number(q('#energy').value) : m.power.energy;
    var used = q('#used') ? Number(q('#used').value) : m.power.used;
    var balance = energy - used;
    var targetReady = energy === 120 && used === 45;
    var answerReady = targetReady && q('#control-answer') && q('#control-answer').value === '75';
    var complete = !!(m.coreDone && m.coreDone[1]);
    q('#world-balance').textContent = String(balance);
    q('#power-phase').textContent = complete ? 'Grid signal restored' : !targetReady ? 'Tune the readings' : !answerReady ? 'Predict the stored value' : 'Execute the assignment';
    var objectiveList = q('.quest-track');
    if (objectiveList) objectiveList.outerHTML = powerObjectives();
    window.dispatchEvent(new CustomEvent('mission:power-values', { detail: { energy: energy, used: used, balance: balance, stored: m.power.stored } }));
  }

  function syncTrace() {
    if (m.scene !== 2 || !q('.trace-world')) return;
    var step = Math.max(0, Math.min(traceFrames.length, Number(m.traceStep) || 0));
    var frame = step ? traceFrames[step - 1] : null;
    var locked = !!m.traceLocked;
    var complete = step >= traceFrames.length;
    var count = q('#trace-count');
    if (count) count.textContent = step + ' / ' + traceFrames.length + ' statements';
    var output = q('#trace-output');
    if (output) output.textContent = frame && frame.output ? frame.output : 'No output yet.';
    document.querySelectorAll('[data-memory-slot]').forEach(function (slot) {
      var name = slot.dataset.memorySlot;
      var item = frame && frame.memory[name];
      slot.querySelector('strong').textContent = item ? String(item.v) : '—';
      slot.querySelector('span').textContent = item ? item.t : 'unassigned';
      slot.classList.toggle('changed', !!item && (!step || !traceFrames[step - 2] || !traceFrames[step - 2].memory[name] || traceFrames[step - 2].memory[name].v !== item.v));
    });
    document.querySelectorAll('[data-trace-line]').forEach(function (line) {
      var index = Number(line.dataset.traceLine);
      line.classList.toggle('done', index < step);
      line.classList.toggle('active', index === step && !complete);
    });
    var seal = q('#check-trace');
    var advance = q('#trace-next');
    var revise = q('#trace-revise');
    if (q('#first-output')) q('#first-output').disabled = locked;
    if (q('#second-output')) q('#second-output').disabled = locked;
    if (seal) {
      seal.disabled = locked;
      seal.textContent = locked ? (complete ? 'Prediction sealed · trace complete' : 'Prediction sealed') : 'Seal prediction & activate trace';
      seal.hidden = locked;
    }
    if (advance) {
      advance.disabled = !locked || complete;
      advance.innerHTML = complete ? 'Trace complete' : 'Execute next statement <span aria-hidden="true">→</span>';
      advance.hidden = !locked || complete;
    }
    if (revise) revise.hidden = !locked;
    var guidance = q('#trace-guidance');
    if (guidance) guidance.textContent = !locked ? 'Enter both predictions first, then seal them to activate the trace.' : complete ?
      'Trace complete. Compare the two outputs with your prediction.' : 'Statement ' + (step + 1) + ' of ' + traceFrames.length + ' is next. Step once to update memory.';
    var world = q('.trace-world');
    if (world) world.dataset.traceStep = String(step);
  }

  function sealTracePrediction() {
    var correct = q('#first-output').value === '85' && q('#second-output').value === '105';
    if (!m.notes.traceReason || !m.notes.traceReason.trim()) {
      feedback('#trace-feedback', 'Add your reasoning before sealing the prediction. Your teacher will review the explanation.', false);
      return;
    }
    if (!correct) {
      feedback('#trace-feedback', 'The first report uses the earlier stored value. After the second calculation, the report uses the new readings. Recheck the assignment order.', false);
      return;
    }
    m.traceLocked = true;
    m.traceStep = 0;
    persist();
    syncTrace();
    window.dispatchEvent(new CustomEvent('mission:trace-start'));
    feedback('#trace-feedback', '<strong>Prediction locked.</strong> Execute one statement at a time and watch the three stored variables.', true);
    q('#trace-next').focus({ preventScroll: true });
  }

  function advanceTrace() {
    if (!m.traceLocked || Number(m.traceStep) >= traceFrames.length) return;
    m.traceStep = Number(m.traceStep) + 1;
    var frame = traceFrames[m.traceStep - 1];
    persist();
    syncTrace();
    window.dispatchEvent(new CustomEvent('mission:trace-step', { detail: { index: m.traceStep, frame: frame } }));
    if (m.traceStep >= traceFrames.length) {
      mark(2);
      refreshContinue();
      feedback('#trace-feedback', '<strong>Both reports verified: 85, then 105.</strong> The first reads the earlier stored result. The second uses energy = 150 and used = 45.', true);
    }
  }

  function resetTrace() {
    if (m.scene !== 2 || !q('.trace-world')) return;
    m.traceLocked = false;
    m.traceStep = 0;
    persist();
    syncTrace();
    window.dispatchEvent(new CustomEvent('mission:trace-reset'));
  }

  function reviseTrace() {
    baseInvalidate(2);
    resetTrace();
    q('#first-output').focus({ preventScroll: true });
  }

  q('#mission-main').addEventListener('input', function (event) {
    if (m.scene === 1 && event.target.matches('#energy, #used, #control-answer')) syncPower();
  });

  q('#mission-main').addEventListener('click', function (event) {
    var reset = event.target.closest('[data-world-reset]');
    if (reset) {
      window.dispatchEvent(new CustomEvent('mission:world-reset', { detail: { scene: reset.dataset.worldReset } }));
    }
  });

  var baseInvalidate = invalidateFrom;
  invalidateFrom = function (scene) {
    baseInvalidate(scene);
    if (scene === 2) resetTrace();
    if (scene === 1) syncPower();
  };

  paint();
})();
