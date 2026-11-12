/* Lesson 2: a full, bilingual, one-to-one AP CSA mission about Java expressions. */
(function () {
  var main = document.querySelector('#mission-main');
  var title = document.querySelector('.course-title');
  var tabs = Array.from(document.querySelectorAll('[data-course-lesson]'));
  var toolsButton = document.querySelector('#tools-toggle');
  var footer = document.querySelector('.mission-footer span:first-child');
  var storeKey = 'future-lesson-2-precision-market-v1';
  var titles = [
    ['Mission brief', '任務簡報'], ['Operator arcade', '運算子街機'],
    ['Split the cargo', '分配貨物'], ['Repair the counter', '修復計算台'],
    ['Build the calculator', '打造計算器'], ['AP checkpoint', 'AP 闖關檢核']
  ];
  var minutes = [6, 16, 16, 12, 32, 8];
  var active = false;
  var campaign = window.CourseCampaign;
  var campaignActive = false;
  var marketReviewStep = null;
  var teacherNavigationOpen = false;
  var basePaint = paint;

  function blankState() {
    return {
      stage: 0, maxStage: 0, retrieval: '', exprIndex: 0, exprAnswers: [],
      units: 17, squads: 5, splitReady: false, distributed: false,
      shareGuess: '', leftGuess: '', exactGuess: '', repairIndex: 0,
      repairs: [], codeTask: 0,
      codeText: [
        'int tokens = 17;\nint squads = 5;\n\n// TODO: declare int perSquad using /\n// TODO: declare int leftovers using %\n// TODO: declare double exactPerSquad using an explicit cast\n\nSystem.out.println(perSquad);\nSystem.out.println(leftovers);\nSystem.out.println(exactPerSquad);',
        'int credits = 120;\n\n// TODO: add 45 with +=\n// TODO: subtract 30 with -=\n// TODO: divide by 3 with /=\n// TODO: record one more delivery with ++\n\nSystem.out.println(credits);',
        'int subtotalCents = 5000;\ndouble taxRate = 0.08;\ndouble discountRate = 0.05;\nint crewSize = 3;\n\n// TODO: calculate taxCents and discountCents with explicit int casts\n// TODO: start totalCents at subtotalCents; add tax and subtract discount with compound assignment\n// TODO: calculate shareCents with integer division and leftoverCents with remainder\n// TODO: calculate exactShare with a double cast\n// TODO: declare orders = 2 and increment it\n\nSystem.out.println("Tax cents: " + taxCents);\nSystem.out.println("Discount cents: " + discountCents);\nSystem.out.println("Total cents: " + totalCents);\nSystem.out.println("Each gets: " + shareCents);\nSystem.out.println("Left over: " + leftoverCents);\nSystem.out.println("Exact share: " + exactShare);\nSystem.out.println("Orders: " + orders);'
      ],
      codePassed: [false, false, false], codeOutput: ['', '', ''], codeChecks: [[], [], []],
      apChoice: '', reflection: '', completed: false
    };
  }

  var state = blankState();
  try {
    var saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
    if (saved && typeof saved === 'object') state = Object.assign(blankState(), saved);
  } catch (error) {}
  var savedStage = Math.min(state.stage, state.maxStage);

  function lang() { return document.documentElement.lang === 'zh-Hant' ? 'zh' : 'en'; }
  function tx(en, zh) { return lang() === 'zh' ? zh : en; }
  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function save() {
    if (state.stage <= state.maxStage) savedStage = state.stage;
    try { localStorage.setItem(storeKey, JSON.stringify(Object.assign({}, state, { stage: savedStage }))); } catch (error) {}
  }
  function pulse(success) {
    window.dispatchEvent(new CustomEvent('mission:market-beat', { detail: { success: success } }));
  }
  function setActiveTab() {
    tabs.forEach(function (button) {
      var selected = !campaignActive && Number(button.dataset.courseLesson) === (active ? 2 : 1);
      button.setAttribute('aria-pressed', String(selected));
    });
    document.querySelector('[data-campaign-open="0"]')?.setAttribute('aria-pressed', String(campaignActive && campaign.location()?.[0] === 0));
    if (campaignActive) {
      if (title) title.textContent = tx('AP CSA Mission Lab', 'AP CSA 任務實驗室');
      if (toolsButton) toolsButton.hidden = true;
      if (footer) footer.textContent = tx('AP CSA practice', 'AP CSA 練習');
      return;
    }
    if (title) title.textContent = active ? 'Lesson 2 · Precision Market' : 'Lesson 1 · Restore the Grid';
    if (toolsButton) toolsButton.hidden = active;
    if (footer) footer.textContent = active ? 'Expressions & operators · One-to-one learning' : 'Java foundations · One-to-one learning';
  }
  function activate(lesson, target, step) {
    if (lesson === 0 || lesson >= 3) {
      if (!campaign || !campaign.open(lesson, step ?? target, teacherNavigationOpen)) return;
      active = false;
      campaignActive = true;
      document.body.classList.remove('week-two-active');
      document.querySelector('#mission-tools').hidden = true;
      setActiveTab();
      syncTeacherSteps();
      return;
    }
    campaign?.hide();
    campaignActive = false;
    marketReviewStep = lesson === 2 ? (step ?? null) : null;
    gridReviewStep = lesson === 1 ? (step ?? null) : null;
    active = lesson === 2;
    setActiveTab();
    if (active) {
      if (target !== undefined) state.stage = target;
      document.querySelector('#mission-tools').hidden = true;
      main.setAttribute('data-no-translate', '');
      document.body.classList.add('week-two-active');
      render();
    } else {
      if (target !== undefined) m.scene = target;
      main.removeAttribute('data-no-translate');
      document.body.classList.remove('week-two-active');
      basePaint();
      syncTeacherSteps();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  tabs.forEach(function (button) {
    button.addEventListener('click', function () { teacherNavigationOpen = false; activate(Number(button.dataset.courseLesson)); });
  });

  document.addEventListener('click', function (event) {
    var target = event.target.closest('[data-campaign-open]');
    if (!target) return;
    teacherNavigationOpen = false;
    activate(Number(target.dataset.campaignOpen));
  });
  window.addEventListener('campaign:open', function (event) {
    teacherNavigationOpen = false;
    activate(event.detail.id, event.detail.step);
  });
  window.addEventListener('campaign:teacher-step', function (event) {
    activate(event.detail[0], 0, event.detail[1]);
  });

  function route() {
    return '<nav class="market-route" aria-label="' + esc(tx('Week 2 mission route', '第二週任務路線')) + '"><ol>' + titles.map(function (row, index) {
      var current = index === state.stage;
      var complete = index < state.maxStage || (index === 5 && state.completed);
      var locked = index > state.maxStage && !current;
      return '<li class="' + (current ? 'current ' : '') + (complete ? 'complete ' : '') + (locked ? 'locked' : '') + '"><button type="button" data-stage="' + index + '" ' + (locked ? 'disabled' : '') + (current ? ' aria-current="step"' : '') + '><span class="route-number">' + (complete ? '✓' : String(index + 1).padStart(2, '0')) + '</span><span class="route-name">' + esc(tx(row[0], row[1])) + '</span></button></li>';
    }).join('') + '</ol></nav>';
  }
  function world() {
    var phase = state.stage === 0 ? tx('MARKET OPEN · 90-MINUTE QUEST', '市集開張 · 90 分鐘任務') : tx('LIVE MARKET · PHASE ', '市集即時任務 · 階段 ') + (state.stage + 1) + ' / 6';
    return '<section class="game-world market-world" data-game-stage="market" aria-label="' + esc(tx('Three-dimensional neon night market. Drag to rotate.', '3D 霓虹夜市。拖曳以旋轉場景。')) + '">' +
      '<canvas class="game-canvas" aria-hidden="true"></canvas><div class="market-world-hud"><div class="market-world-brand"><span class="market-orbit" aria-hidden="true">✦</span><span><b>MOONLIGHT</b><small>NIGHT MARKET · DISTRICT 02</small></span></div>' +
      '<div class="market-world-phase" id="market-world-phase">' + esc(phase) + '</div><p>' + esc(tx('Drag to look around · arrow keys also work', '拖曳環視市集 · 也可使用方向鍵')) + '</p></div><span class="market-world-stamp" aria-hidden="true">02</span></section>';
  }
  function top(titleText, subtitle) {
    return '<header class="market-stage-head"><div><span class="market-eyebrow">' + esc(tx('WEEK 2 · UNIT 1', '第二週 · 單元一')) + ' <i>／</i> ' + esc(tx('PRECISION MARKET', '精準市集')) + '</span><h1>' + esc(titleText) + '</h1><p>' + esc(subtitle) + '</p></div><div class="market-time"><small>' + esc(tx('SESSION TIME', '本階段時間')) + '</small><b>' + minutes[state.stage] + ' <span>' + esc(tx('MIN', '分鐘')) + '</span></b><small>' + esc(tx('90 minutes total', '總計 90 分鐘')) + '</small></div></header>';
  }
  function shell(body) {
    var heading = state.stage ? '<div class="market-stage-content">' + top(tx(titles[state.stage][0], titles[state.stage][1]), subtitles[state.stage]()) + route() + body + '</div>' : body;
    return '<div class="week-two-experience">' + world() + heading + '</div>';
  }
  var subtitles = [
    function () { return ''; },
    function () { return tx('Read the expression like a machine: one operator at a time, in Java precedence order.', '像機器一樣閱讀算式：依 Java 優先順序逐個運算子計算。'); },
    function () { return tx('Pack equal shares first. Use / for whole groups, % for what remains, and a cast for the exact share.', '先平均分配整數組。用 / 計算每組數量、用 % 找餘數，再用型別轉換求精確平均。'); },
    function () { return tx('Repair three counter programs by writing the corrected Java line yourself.', '親自改寫三行 Java，修好市集計算台的程式。'); },
    function () { return tx('Type, run, revise, and test three Java programs. The final calculator is your independent build.', '親自輸入、執行、修改並測試三個 Java 程式。最後的計算器由你獨立完成。'); },
    function () { return tx('Finish with an AP-style trace and explain the rule in your own words.', '用 AP 風格的程式追蹤題收尾，並用自己的話說明規則。'); }
  ];

  function brief() {
    return '<section class="market-brief screen-enter"><div class="brief-copy"><span class="market-eyebrow">' + esc(tx('MISSION 02 · EXPRESSIONS & TYPE BEHAVIOR', '任務 02 · 運算式與型別行為')) + '</span><h1>' + esc(tx('The Night Market\nneeds your math.', '夜市需要\n你的精準計算。')) + '</h1><p>' + esc(tx('The order scanners are mixing up totals, squads are splitting supplies, and one payment bot keeps rounding the wrong way. Build the Java calculator that gets every number right before the market closes.', '訂單掃描器算錯金額、隊伍分配補給時出現餘數，付款機器人也把小數截掉了。請在夜市打烊前，用 Java 打造可靠的精準計算器。')) + '</p><div class="brief-callout"><span class="brief-spark">✦</span><div><b>' + esc(tx('MIRA · MARKET CONTROL', 'MIRA · 市集控制台')) + '</b><p>' + esc(tx('“Every number has a rule behind it. Show me the math, then prove the code.”', '「每個數字都有規則。先說明計算方式，再用程式證明。」')) + '</p></div></div>' +
      '<div class="brief-warmup"><div><small>' + esc(tx('QUICK WARM-UP · 2 MIN', '快速暖身 · 2 分鐘')) + '</small><b>' + esc(tx('Predict: 8 + 2 * 5', '先預測：8 + 2 * 5')) + '</b></div><div class="warmup-answer"><input id="market-retrieval" inputmode="numeric" value="' + esc(state.retrieval) + '" placeholder="' + esc(tx('Your prediction', '輸入預測')) + '" aria-label="' + esc(tx('Predict 8 plus 2 times 5', '預測 8 加 2 乘 5')) + '"><button class="market-button market-button-small" id="check-retrieval">' + esc(tx('Check', '檢查')) + '</button></div><p id="retrieval-feedback" role="status"></p></div>' +
      '<button class="market-button market-button-primary" id="start-week-two" ' + (state.retrieval !== '18' ? 'disabled' : '') + '>' + esc(tx('Enter the night market', '進入夜市')) + ' <span aria-hidden="true">→</span></button><span class="brief-total">' + esc(tx('90 min · six stages · three typed Java programs', '90 分鐘 · 六個階段 · 三個親手輸入的 Java 程式')) + '</span></div>' +
      '<aside class="brief-side"><div class="market-route-card"><small>' + esc(tx('MISSION MAP', '任務地圖')) + '</small><h2>' + esc(tx('Five skill checkpoints', '五個技能關卡')) + '</h2><ol>' + titles.slice(1).map(function (row, index) { return '<li><span>' + String(index + 1).padStart(2, '0') + '</span><div><b>' + esc(tx(row[0], row[1])) + '</b><small>' + minutes[index + 1] + ' ' + esc(tx('min', '分鐘')) + '</small></div></li>'; }).join('') + '</ol></div><details class="market-tutor"><summary>' + esc(tx('One-to-one tutor cue', '一對一教學提示')) + '</summary><p>' + esc(tx('Ask the student to predict the warm-up silently. Have them say which operation happens first and why before opening the market.', '請學生先獨立預測暖身題。進入市集前，請他們說明哪個運算先執行以及原因。')) + '</p></details></aside></section>';
  }

  var expressions = [
    { code: '8 + 2 * 5', answer: '18', en: 'Multiplication happens before addition.', zh: '乘法先於加法執行。' },
    { code: '(8 + 2) * 5', answer: '50', en: 'Parentheses make the addition happen first.', zh: '括號讓加法先執行。' },
    { code: '11 / 4', answer: '2', en: 'Both operands are int, so Java discards the fractional part.', zh: '兩個運算元都是 int，因此 Java 會捨去小數部分。' },
    { code: '11 % 4', answer: '3', en: 'Two groups of four use eight; three remain.', zh: '兩組四個共用掉八個，因此餘數是三。' },
    { code: '(double) 11 / 4', answer: '2.75', en: 'The cast changes the division to floating-point before it runs.', zh: '型別轉換讓除法在執行前改為浮點數運算。' }
  ];
  function arcade() {
    var index = marketReviewStep ?? state.exprIndex;
    var item = expressions[index];
    var finished = index >= expressions.length;
    return '<section class="market-panel screen-enter"><div class="panel-rail"><span>' + esc(tx('OPERATOR ARCADE', '運算子街機')) + '</span><span>' + esc(tx('PUZZLE ', '題目 ')) + Math.min(index + 1, 5) + ' / 5</span></div>' +
      (finished ? '<div class="mission-clear"><span class="clear-glyph">✓</span><h2>' + esc(tx('Signal sequence cleared!', '運算子序列已破解！')) + '</h2><p>' + esc(tx('You used precedence, integer division, remainder, and casting. Next, make the same rules move physical cargo.', '你已使用優先順序、整數除法、餘數與型別轉換。接下來，讓相同規則分配實際貨物。')) + '</p><button class="market-button market-button-primary" data-next-stage="2">' + esc(tx('Load the cargo crates', '裝載貨物箱')) + ' →</button></div>' :
        '<div class="operator-challenge"><div class="operator-progress" aria-label="' + esc(tx('Puzzle progress', '題目進度')) + '">' + expressions.map(function (_, i) { return '<span class="' + (i === index ? 'now' : i < state.exprIndex ? 'done' : '') + '"></span>'; }).join('') + '</div><small>' + esc(tx('TYPE YOUR RESULT · NO RUN BUTTON YET', '輸入結果 · 暫不執行程式')) + '</small><div class="expression-display">' + esc(item.code) + '</div><p>' + esc(tx('Enter the value Java produces.', '輸入 Java 計算出的值。')) + '</p><div class="prediction-line"><input id="expression-answer" inputmode="decimal" value="' + esc(state.exprAnswers[index] || '') + '" placeholder="' + esc(tx('Predicted result', '預測結果')) + '" aria-label="' + esc(tx('Your predicted result', '你的預測結果')) + '"><button class="market-button market-button-primary" id="check-expression">' + esc(tx('Lock prediction', '鎖定預測')) + '</button></div><div id="expression-feedback" role="status" class="market-feedback"></div><details class="rule-card"><summary>' + esc(tx('Open the operator rule card', '打開運算子規則卡')) + '</summary><p><b>× / %</b> ' + esc(tx('before + / −', '先於 + / − 執行')) + ' · ' + esc(tx('parentheses first', '括號優先')) + ' · <code>int / int</code> ' + esc(tx('keeps the whole-number quotient', '只保留整數商')) + '</p></details></div>') + '</section>';
  }

  function cargoTokens(count) {
    return Array.from({ length: Math.min(count, 30) }, function (_, index) { return '<i style="--token-index:' + index + '" aria-hidden="true"></i>'; }).join('');
  }
  function bins() {
    var each = Math.floor(state.units / state.squads), left = state.units % state.squads;
    var groups = Array.from({ length: state.squads }, function (_, i) {
      return '<div class="cargo-bin" style="--bin-index:' + i + '"><small>' + esc(tx('SQUAD ', '小隊 ')) + (i + 1) + '</small><div class="bin-tokens">' + Array.from({ length: state.distributed ? each : 0 }, function (_, j) { return '<i style="--token-index:' + (i * each + j) + '" aria-hidden="true"></i>'; }).join('') + '</div><b>' + (state.distributed ? each : '?') + '</b></div>';
    }).join('');
    return '<div class="cargo-result ' + (state.distributed ? 'cargo-result-live' : '') + '" id="cargo-result" aria-live="polite"><div class="cargo-bins">' + groups + '<div class="cargo-bin cargo-leftover" style="--bin-index:' + state.squads + '"><small>' + esc(tx('LEFT OVER', '剩餘')) + '</small><div class="bin-tokens">' + Array.from({ length: state.distributed ? left : 0 }, function (_, j) { return '<i style="--token-index:' + (state.units - left + j) + '" aria-hidden="true"></i>'; }).join('') + '</div><b>' + (state.distributed ? left : '?') + '</b></div></div>' +
      (state.distributed ? '<div class="cargo-code-result"><code>int perSquad = ' + state.units + ' / ' + state.squads + ';</code><code>int leftovers = ' + state.units + ' % ' + state.squads + ';</code><code>double exact = (double) ' + state.units + ' / ' + state.squads + ';</code><strong>' + esc(tx('Exact share: ', '精確平均：')) + (state.units / state.squads).toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + '</strong></div>' : '') + '</div>';
  }
  function cargo() {
    return '<section class="market-panel screen-enter"><div class="panel-rail"><span>' + esc(tx('SUPPLY DOCK · INTERACTIVE SIMULATION', '補給碼頭 · 互動模擬')) + '</span><span>' + esc(tx('PREDICT → DISTRIBUTE', '先預測 → 再分配')) + '</span></div><div class="cargo-controls"><div class="cargo-meter"><div><small>' + esc(tx('UNITS IN THE CRATE', '貨箱中的單位數')) + '</small><b id="cargo-unit-count">' + state.units + '</b></div><div class="counter-buttons"><button id="units-down" aria-label="' + esc(tx('Remove one cargo unit', '減少一個貨物單位')) + '">−</button><button id="units-up" aria-label="' + esc(tx('Add one cargo unit', '增加一個貨物單位')) + '">+</button></div><div class="cargo-tokens" id="cargo-tokens">' + cargoTokens(state.units) + '</div></div><div class="cargo-meter crew-meter"><div><small>' + esc(tx('SQUADS TO SUPPLY', '補給小隊數')) + '</small><b id="squad-count">' + state.squads + '</b></div><div class="counter-buttons"><button id="squads-down" aria-label="' + esc(tx('Remove one squad', '減少一個小隊')) + '">−</button><button id="squads-up" aria-label="' + esc(tx('Add one squad', '增加一個小隊')) + '">+</button></div><div class="squad-figures" id="squad-figures">' + Array.from({ length: state.squads }, function (_, i) { return '<i style="--squad-index:' + i + '" aria-hidden="true"></i>'; }).join('') + '</div></div></div>' +
      '<p class="cargo-prompt">' + esc(tx('Before the robot moves, predict all three results for the current crate.', '機器人搬運前，先預測這批貨物的三個結果。')) + '</p><div class="cargo-predictions"><label><span>' + esc(tx('Whole units per squad · /', '每隊整數單位 · /')) + '</span><input id="share-guess" inputmode="numeric" value="' + esc(state.shareGuess) + '" placeholder="' + esc(tx('Whole number', '整數')) + '"></label><label><span>' + esc(tx('Units left over · %', '剩餘單位 · %')) + '</span><input id="left-guess" inputmode="numeric" value="' + esc(state.leftGuess) + '" placeholder="' + esc(tx('Remainder', '餘數')) + '"></label><label><span>' + esc(tx('Exact decimal share · cast', '精確小數平均 · 型別轉換')) + '</span><input id="exact-guess" inputmode="decimal" value="' + esc(state.exactGuess) + '" placeholder="' + esc(tx('Decimal answer', '小數答案')) + '"></label></div>' +
      '<div class="cargo-action"><button class="market-button market-button-primary" id="distribute-cargo">' + esc(state.distributed ? tx('Redistribute with these values', '使用目前數值重新分配') : tx('Lock predictions & distribute', '鎖定預測並分配')) + ' <span aria-hidden="true">→</span></button><span id="cargo-feedback" role="status">' + esc(state.distributed ? tx('Distribution complete. Change a value to try another test.', '分配完成。修改數值可嘗試另一組測試。') : tx('No score penalty for revising. Explain each operator to your tutor.', '修改答案不扣分。請向老師說明每個運算子。')) + '</span></div>' + bins() +
      '<div class="market-nextline"><button class="market-button market-button-primary" id="cargo-next" data-next-stage="3" ' + (state.distributed ? '' : 'disabled') + '>' + esc(tx('Repair the counter', '修復計算台')) + ' →</button><span>' + esc(tx('Complete the distribution simulation to unlock the next checkpoint.', '完成貨物分配模擬即可解鎖下一個檢查點。')) + '</span></div><details class="rule-card cargo-teacher"><summary>' + esc(tx('Ask your tutor', '一對一討論')) + '</summary><p>' + esc(tx('Why can / and % use the same two inputs but answer different questions? What changes when the first operand is cast to double?', '為什麼 / 與 % 使用相同輸入卻回答不同問題？第一個運算元轉型成 double 後有何不同？')) + '</p></details></section>';
  }

  var repairs = [
    { code: 'int sum = 9;\ndouble average = sum / 2;', label: ['Rewrite the average line so the result keeps its decimal part.', '改寫平均值那一行，保留小數部分。'], hint: ['Use a double operand or cast before division.', '讓其中一個運算元成為 double，或在除法前轉型。'], accepts: function (s) { return /^(?:doubleaverage=sum\/(?:2\.0|\(double\)2)|doubleaverage=\(double\)sum\/2);$/.test(s); } },
    { code: 'int value = 3.8;', label: ['The measured value must keep 3.8. Rewrite the declaration with the right type.', '測量值必須保留 3.8。請用正確型別改寫宣告。'], hint: ['The variable type must be able to store a decimal value.', '變數型別必須能儲存小數。'], accepts: function (s) { return /^doublevalue=3\.8;$/.test(s); } },
    { code: 'int count = 4;\ncount = count + 1;', label: ['Rewrite only the update using ++ or compound assignment.', '只改寫更新指令，使用 ++ 或複合指定。'], hint: ['Both count++ and count += 1 preserve the same result.', 'count++ 和 count += 1 都會得到相同結果。'], accepts: function (s) { return /^(?:count\+\+|\+\+count|count\+=1);$/.test(s); } }
  ];
  function normalizeJava(line) { return line.toLowerCase().replace(/\s+/g, '').replace(/;?$/, ';'); }
  function repairBench() {
    var index = marketReviewStep ?? state.repairIndex;
    var finished = index >= repairs.length;
    if (finished) return '<section class="market-panel screen-enter"><div class="mission-clear"><span class="clear-glyph">✓</span><h2>' + esc(tx('Counter repaired. Now build it.', '計算台已修復，接著親手打造。')) + '</h2><p>' + esc(tx('You found a stale calculation, a type mismatch, and a cleaner update. The next stage is all yours: three programs, typed from the specification.', '你找出了過期計算、型別不符，以及更簡潔的更新方式。下一階段由你親手完成：依照規格輸入三個程式。')) + '</p><button class="market-button market-button-primary" data-next-stage="4">' + esc(tx('Open the coding booth', '進入程式工作站')) + ' →</button></div></section>';
    var item = repairs[index];
    return '<section class="market-panel screen-enter"><div class="panel-rail"><span>' + esc(tx('TYPE & OPERATOR REPAIR', '型別與運算子修復')) + '</span><span>' + (index + 1) + ' / 3</span></div><div class="repair-layout"><div class="repair-progress">' + repairs.map(function (_, i) { return '<span class="' + (i === index ? 'active' : i < state.repairIndex ? 'fixed' : '') + '">' + (i < state.repairIndex && i !== index ? '✓' : String(i + 1).padStart(2, '0')) + '</span>'; }).join('') + '</div><div class="repair-job"><small>' + esc(tx('FAULTY JAVA · READ THE REQUIREMENT', '故障 Java 程式 · 閱讀規格')) + '</small><pre class="market-code-block">' + esc(item.code) + '</pre><p>' + esc(tx(item.label[0], item.label[1])) + '</p><input id="repair-answer" class="repair-input" value="' + esc(state.repairs[index] || '') + '" spellcheck="false" autocomplete="off" placeholder="' + esc(tx('Type your corrected Java line, including ;', '輸入修正後的 Java 指令，包含分號 ;')) + '"><div class="repair-buttons"><button class="market-button market-button-primary" id="check-repair">' + esc(tx('Compile this repair', '檢查這項修復')) + '</button><details class="rule-card"><summary>' + esc(tx('Hint', '提示')) + '</summary><p>' + esc(tx(item.hint[0], item.hint[1])) + '</p></details></div><div class="market-feedback" id="repair-feedback" role="status"></div></div></div><div class="repair-lesson"><b>' + esc(tx('AP NOTE', 'AP 重點')) + '</b><span>' + esc(tx('A double variable does not retroactively turn int / int into decimal division.', 'double 變數不會回頭把 int / int 變成小數除法。')) + '</span></div></section>';
  }

  var codingTasks = [
    { title: ['Split the courier cache', '分配快遞補給'], time: 11, en: 'The delivery bot carries 17 data tokens for 5 squads. Write the missing declarations. Use /, %, and an explicit cast. Print all three results.', zh: '配送機器人有 17 個資料代幣，要分給 5 個小隊。請補上缺少的宣告，使用 /、% 與明確型別轉換，並輸出三個結果。', hintEn: 'Check that both operands of / are int for perSquad. Cast tokens before dividing for the decimal average.', hintZh: '計算 perSquad 時，/ 的兩個運算元都應為 int。計算小數平均時，先將 tokens 轉型。', run: function (source) {
      var r = runJava(source), e = r.env;
      var base = e.perSquad?.t === 'int' && e.perSquad.v === 3 && e.leftovers?.t === 'int' && e.leftovers.v === 2 && e.exactPerSquad?.t === 'double' && Math.abs(e.exactPerSquad.v - 3.4) < 0.0001;
      var changed = replaceInputs(source, [['tokens', 29], ['squads', 4]]);
      var v = runJava(changed).env;
      return { output: r.output, checks: [['17 tokens → 3 each; 2 left', base], ['Prints each result on its own line', r.output.trim() === '3\n2\n3.4'], ['Explicit cast produces 3.4', e.exactPerSquad?.t === 'double' && Math.abs(e.exactPerSquad.v - 3.4) < 0.0001], ['Changed inputs 29 / 4 → 7 each; 1 left; 7.25 exact', v.perSquad?.v === 7 && v.leftovers?.v === 1 && Math.abs(v.exactPerSquad?.v - 7.25) < 0.0001]] };
    } },
    { title: ['Patch the payment bot', '修補付款機器人'], time: 8, en: 'Start with 120 credits. Add 45, subtract 30, divide the new total among 3 vendors, then record one extra delivery. Use +=, -=, /=, and ++ as separate statements.', zh: '從 120 點數開始。加上 45、扣除 30，將新總額分給 3 個攤商，再記錄一筆配送。請分別使用 +=、-=、/= 與 ++。', hintEn: 'A compound assignment updates the variable immediately. Keep the operators on separate statements so the trace is clear.', hintZh: '複合指定會立即更新變數。請將運算子放在獨立指令，方便追蹤。', run: function (source) {
      var r = runJava(source), e = r.env;
      var ops = /\bcredits\s*\+=/.test(source);
      var hasDash = /\bcredits\s*-=/.test(source), hasDivide = /\bcredits\s*\/=/.test(source), hasIncrement = /(?:\bcredits\s*\+\+|\+\+\s*credits\b)/.test(source);
      var base = e.credits?.t === 'int' && e.credits.v === 46;
      var changed = source.replace(/(int\s+credits\s*=\s*)120\b/, function (_, prefix) { return prefix + '200'; }).replace(/(credits\s*\+=\s*)45\b/, function (_, prefix) { return prefix + '28'; }).replace(/(credits\s*-=\s*)30\b/, function (_, prefix) { return prefix + '16'; }).replace(/(credits\s*\/=\s*)3\b/, function (_, prefix) { return prefix + '4'; });
      var transfer = runJava(changed).env;
      return { output: r.output, checks: [['Credits finish at 46', base], ['Prints the final credit value', r.output.trim() === '46'], ['Uses +=, -=, and /=', ops && hasDash && hasDivide], ['Uses ++ to record the final delivery', hasIncrement], ['Changed inputs finish at 54', transfer.credits?.v === 54 && runJava(changed).output.trim() === '54']] };
    } },
    { title: ['Build the Precision Calculator', '打造精準計算器'], time: 13, en: 'Use the displayed subtotal and rates to calculate taxCents and discountCents. Cast each result to int, update totalCents with compound assignment, split the total into a whole-cent share and remainder, then calculate the exact decimal share with a cast. Increment orders and print every labeled result.', zh: '使用畫面中的小計與稅率計算 taxCents 和 discountCents，將結果明確轉型成 int，再用複合指定更新 totalCents。把總額拆成每人的整數分與餘數，並用型別轉換計算精確小數平均。將 orders 加一，並輸出所有標籤結果。', hintEn: 'Cast subtotalCents * taxRate and subtotalCents * discountRate to int. Initialize totalCents from subtotalCents, then use += taxCents and -= discountCents.', hintZh: '將 subtotalCents * taxRate 與 subtotalCents * discountRate 明確轉型為 int。以 subtotalCents 初始化 totalCents，再使用 += taxCents 和 -= discountCents。', run: function (source) {
      var r = runJava(source), e = r.env;
      var base = e.taxCents?.t === 'int' && e.taxCents.v === 400 && e.discountCents?.t === 'int' && e.discountCents.v === 250 && e.totalCents?.t === 'int' && e.totalCents.v === 5150 && e.shareCents?.t === 'int' && e.shareCents.v === 1716 && e.leftoverCents?.t === 'int' && e.leftoverCents.v === 2 && e.exactShare?.t === 'double' && Math.abs(e.exactShare.v - 5150 / 3) < 0.0001 && e.orders?.v === 3;
      var variant = replaceInputs(source, [['subtotalCents', 6000], ['taxRate', 0.08], ['discountRate', 0.05], ['crewSize', 4]]);
      var v = runJava(variant).env;
      var labels = r.output.includes('Tax cents: 400') && r.output.includes('Discount cents: 250') && r.output.includes('Total cents: 5150') && r.output.includes('Each gets: 1716') && r.output.includes('Left over: 2') && r.output.includes('Exact share: 1716.6666666666667') && r.output.includes('Orders: 3');
      return { output: r.output, checks: [['Tax 400¢ and discount 250¢; total 5150¢', e.taxCents?.v === 400 && e.discountCents?.v === 250 && e.totalCents?.v === 5150], ['1716¢ per person; 2¢ left over', e.shareCents?.v === 1716 && e.leftoverCents?.v === 2], ['Exact share stored as double', e.exactShare?.t === 'double' && Math.abs(e.exactShare.v - 5150 / 3) < 0.0001], ['Labeled report includes every calculated value', labels], ['Changed inputs total 6180¢; share 1545¢; remainder 0', v.taxCents?.v === 480 && v.discountCents?.v === 300 && v.totalCents?.v === 6180 && v.shareCents?.v === 1545 && v.leftoverCents?.v === 0 && v.exactShare?.v === 1545]] };
    } }
  ];

  function replaceInputs(source, pairs) {
    var result = source;
    pairs.forEach(function (pair) {
      var name = pair[0], value = pair[1];
      result = result.replace(new RegExp('(\\b(?:int|double)\\s+' + name + '\\s*=\\s*)-?\\d+(?:\\.\\d+)?'), function (_, prefix) { return prefix + value; });
    });
    return result;
  }
  function coding() {
    var index = marketReviewStep ?? state.codeTask;
    var task = codingTasks[index];
    var checks = state.codeChecks[index] || [];
    return '<section class="market-panel screen-enter"><div class="panel-rail"><span>' + esc(tx('CODING BOOTH · TYPE YOUR PROGRAMS', '程式工作站 · 親手輸入程式')) + '</span><span>' + esc(tx('32 MIN · 3 PROGRAMS', '32 分鐘 · 3 個程式')) + '</span></div><div class="coding-task-tabs">' + codingTasks.map(function (item, tab) { return '<button type="button" data-code-task="' + tab + '" ' + (tab === index ? 'aria-current="step"' : '') + (marketReviewStep === null && tab > index && !state.codePassed.slice(0, tab).every(Boolean) ? 'disabled' : '') + '><span>' + String(tab + 1).padStart(2, '0') + '</span><b>' + esc(tx(item.title[0], item.title[1])) + '</b><small>' + item.time + ' ' + esc(tx('min', '分鐘')) + (state.codePassed[tab] ? ' · ✓' : '') + '</small></button>'; }).join('') + '</div>' +
      '<div class="coding-task-head"><div><small>' + esc(tx('PROGRAM ', '程式 ')) + (index + 1) + ' / 3</small><h2>' + esc(tx(task.title[0], task.title[1])) + '</h2><p>' + esc(tx(task.en, task.zh)) + '</p></div><div class="typing-seal"><span>JAVA</span><b>' + task.time + '</b><small>' + esc(tx('MIN', '分鐘')) + '</small></div></div>' +
      '<div class="coding-brief-grid"><div><b>' + esc(tx('SPECIFICATION', '程式規格')) + '</b><p>' + esc(tx(task.en, task.zh)) + '</p><small>' + esc(tx('Run once, inspect the checks, revise, then test the changed-input case.', '先執行一次、檢視測試、修改，再測試改變輸入後的結果。')) + '</small></div><details class="rule-card"><summary>' + esc(tx('Show one hint', '顯示一個提示')) + '</summary><p>' + esc(tx(task.hintEn, task.hintZh)) + '</p></details></div>' +
      '<label class="editor-label" for="market-code-editor"><span>' + esc(tx('YOUR JAVA CODE', '你的 Java 程式碼')) + '</span><small>' + esc(tx('The checker tests behavior, types, and changed inputs.', '自動檢查會測試執行結果、型別與變更後的輸入。')) + '</small></label><textarea id="market-code-editor" class="market-editor" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="' + esc(tx('Type your Java program', '輸入你的 Java 程式')) + '">' + esc(state.codeText[index] || '') + '</textarea>' +
      '<div class="coding-runline"><button class="market-button market-button-primary" id="run-market-code">' + esc(tx('Run & test this program', '執行並測試程式')) + ' ▶</button><span>' + esc(tx('Current version · ' + (state.codePassed[index] ? 'passed' : 'not verified'), '目前版本 · ' + (state.codePassed[index] ? '已通過' : '尚未驗證'))) + '</span></div>' +
      (checks.length ? '<div class="market-code-evidence"><div class="market-console"><small>' + esc(tx('CONSOLE OUTPUT', '主控台輸出')) + '</small><pre>' + esc(state.codeOutput[index] || '') + '</pre></div><ul class="market-checks">' + checks.map(function (check) { return '<li class="' + (check[1] ? 'pass' : 'retry') + '"><span>' + (check[1] ? '✓' : '↻') + '</span>' + esc(tx(check[0], translateCheck(check[0]))) + '</li>'; }).join('') + '</ul></div>' : '<p class="market-privacy-note">' + esc(tx('This browser runs a small Java practice subset, not a full Java compiler. Use your Java IDE for classes and methods.', '此瀏覽器使用精簡 Java 練習直譯器，並非完整 Java 編譯器。類別與方法請使用 Java IDE。')) + '</p>') +
      (state.codePassed.every(Boolean) ? '<div class="mission-clear compact-clear"><span class="clear-glyph">✓</span><div><h3>' + esc(tx('All three programs verified.', '三個程式皆已驗證。')) + '</h3><p>' + esc(tx('Your final calculator passed its changed-input test. One AP-style trace remains.', '最後的計算器通過了更改輸入測試。還有一題 AP 風格追蹤題。')) + '</p></div><button class="market-button market-button-primary" data-next-stage="5">' + esc(tx('Open AP checkpoint', '前往 AP 檢核')) + ' →</button></div>' : '') +
      '<details class="rule-card market-tutor-prompt"><summary>' + esc(tx('Tutor prompt · explain before you run', '教師提問 · 執行前先說明')) + '</summary><p>' + esc(tx('Ask the student to trace one variable at each statement. Before the transfer test, ask which input change is most likely to expose a hard-coded answer.', '請學生逐行追蹤一個變數。轉移測試前，問哪種輸入變化最容易抓出寫死的答案。')) + '</p></details></section>';
  }

  var apAnswers = ['3.0 3.0', '3.0 3.5', '3.5 3.5', '3 3.5'];
  function checkpoint() {
    return '<section class="market-panel screen-enter"><div class="panel-rail"><span>' + esc(tx('AP CHECKPOINT · 1 QUESTION', 'AP 闖關檢核 · 1 題')) + '</span><span>' + esc(tx('TRACE BEFORE CHOOSING', '先追蹤再作答')) + '</span></div><div class="checkpoint-layout"><div class="checkpoint-boss"><div class="boss-orbit">%<span>/</span></div><small>' + esc(tx('FINAL SCANNER', '最終掃描器')) + '<h2>' + esc(tx('Catch the type behavior.', '找出型別行為。')) + '</h2><p>' + esc(tx('Trace each expression before it is stored. Choose the exact console output.', '先追蹤每個運算式，再看它如何儲存。選出精確的主控台輸出。')) + '</p></div><div class="checkpoint-code"><pre class="market-code-block">int a = 7;\nint b = 2;\ndouble x = a / b;\ndouble y = (double) a / b;\nSystem.out.println(x + " " + y);</pre><fieldset class="answer-options"><legend>' + esc(tx('What is printed?', '會輸出什麼？')) + '</legend>' + apAnswers.map(function (answer, index) { var label = String.fromCharCode(65 + index); return '<label class="answer-option"><input type="radio" name="market-ap-answer" value="' + esc(label) + '" ' + (state.apChoice === label ? 'checked' : '') + '><span class="answer-letter">' + label + '</span><code>' + esc(answer) + '</code></label>'; }).join('') + '</fieldset><button class="market-button market-button-primary" id="check-ap-answer">' + esc(tx('Check my answer', '檢查答案')) + '</button><p class="market-feedback" id="ap-feedback" role="status"></p></div></div>' +
      (state.apChoice === 'B' ? '<div class="ap-explanation"><b>' + esc(tx('Correct · integer division first', '正確 · 先執行整數除法')) + '</b><p>' + esc(tx('For x, 7 / 2 is evaluated as int / int, so it becomes 3 before assignment to double. For y, the cast makes the division 7.0 / 2, which is 3.5.', '計算 x 時，7 / 2 會先以 int / int 執行，因此在指定給 double 前已變成 3。計算 y 時，型別轉換讓運算變成 7.0 / 2，所以結果是 3.5。')) + '</p><label for="market-reflection">' + esc(tx('Explain why x and y differ. Your tutor reviews this response.', '說明 x 和 y 為什麼不同。老師會檢視你的回答。')) + '</label><textarea id="market-reflection" placeholder="' + esc(tx('Use the words integer division, cast, or double.', '請使用整數除法、型別轉換或 double 等詞說明。')) + '">' + esc(state.reflection) + '</textarea><button class="market-button market-button-primary" id="finish-market-mission" ' + (state.completed || !state.reflection.trim() ? 'disabled' : '') + '>' + esc(tx(state.completed ? 'Evidence saved' : 'Submit mission evidence', state.completed ? '學習證據已儲存' : '提交任務證據')) + '</button>' + (state.completed ? '<div class="mission-complete"><span>✦</span><div><b>' + esc(tx('Market systems calibrated.', '市集計算系統已校準。')) + '</b><p>' + esc(tx('You predicted, coded, tested changed inputs, and explained the AP rule. Your Lesson 2 evidence is saved on this device.', '你完成了預測、打碼、變更輸入測試，並說明 AP 規則。第二課學習證據已儲存於此裝置。')) + '</p></div><button class="market-button" id="download-market-evidence">' + esc(tx('Download evidence', '下載學習紀錄')) + ' ↓</button><button type="button" class="market-button market-button-primary" data-campaign-open="3">' + esc(tx('Open Lesson 3', '開啟第 3 課')) + '</button></div>' : '') + '</div>' : '') + '</section>';
  }
  function translateCheck(en) {
    var map = {
      '17 tokens → 3 each; 2 left': '17 個代幣 → 每隊 3 個；剩下 2 個',
      'Explicit cast produces 3.4': '明確型別轉換得到 3.4',
      'Changed inputs 29 / 4 → 7 each; 1 left; 7.25 exact': '更改輸入 29 / 4 → 每隊 7 個；剩下 1 個；精確值 7.25',
      'Credits finish at 46': '點數結果為 46', 'Uses +=, -=, and /=': '使用 +=、-= 與 /=',
      'Uses ++ to record the final delivery': '使用 ++ 記錄最後一次配送', 'Changed inputs finish at 54': '更改輸入後結果為 54',
      '4933 cents total; 1644 each; 1 left': '總額 4933 分；每人 1644 分；剩餘 1 分',
      'Exact share stored as double': '精確平均以 double 儲存', 'Labeled console report is complete': '主控台標籤報表完整',
      'Changed inputs total 4500; share 1125; remainder 0': '更改輸入後總額 4500；每人 1125；餘數 0'
    };
    return map[en] || en;
  }

  function render() {
    if (!active) return;
    save();
    setActiveTab();
    document.body.classList.add('week-two-active');
    main.setAttribute('data-market-stage', String(state.stage));
    var body = state.stage === 0 ? brief() : state.stage === 1 ? arcade() : state.stage === 2 ? cargo() : state.stage === 3 ? repairBench() : state.stage === 4 ? coding() : checkpoint();
    main.innerHTML = shell(body);
    bindStage();
    syncTeacherSteps();
  }

  function nextStage(stage) {
    marketReviewStep = null;
    if (state.stage <= state.maxStage && stage > state.maxStage) state.maxStage = stage;
    state.stage = stage;
    save(); render();
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function bindStage() {
    main.querySelectorAll('[data-stage]').forEach(function (button) {
      button.addEventListener('click', function () { var target = Number(button.dataset.stage); if (target <= state.maxStage) nextStage(target); });
    });
    main.querySelectorAll('[data-next-stage]').forEach(function (button) {
      button.addEventListener('click', function () { nextStage(Number(button.dataset.nextStage)); });
    });
    if (state.stage === 0) bindBrief();
    if (state.stage === 1) bindArcade();
    if (state.stage === 2) bindCargo();
    if (state.stage === 3) bindRepairs();
    if (state.stage === 4) bindCoding();
    if (state.stage === 5) bindCheckpoint();
  }
  function bindBrief() {
    var input = main.querySelector('#market-retrieval');
    var check = main.querySelector('#check-retrieval');
    var start = main.querySelector('#start-week-two');
    input.addEventListener('input', function () { state.retrieval = input.value.trim(); save(); start.disabled = state.retrieval !== '18'; });
    check.addEventListener('click', function () {
      state.retrieval = input.value.trim(); save();
      var feedback = main.querySelector('#retrieval-feedback');
      if (state.retrieval === '18') { feedback.textContent = tx('Correct. Multiplication happens before addition, so the scanner reads 18.', '正確。乘法先於加法執行，因此掃描器讀到 18。'); feedback.className = 'success'; start.disabled = false; pulse(true); }
      else { feedback.textContent = tx('Recheck precedence: multiply 2 × 5 before adding 8.', '重新檢查優先順序：先計算 2 × 5，再加 8。'); feedback.className = 'retry'; start.disabled = true; }
    });
    start.addEventListener('click', function () { if (state.retrieval !== '18') return; nextStage(1); });
  }
  function bindArcade() {
    var input = main.querySelector('#expression-answer');
    var check = main.querySelector('#check-expression');
    if (!input) return;
    var index = marketReviewStep ?? state.exprIndex;
    input.addEventListener('input', function () { state.exprAnswers[index] = input.value; save(); });
    check.addEventListener('click', function () {
      var guess = input.value.trim(); state.exprAnswers[index] = guess; save();
      var item = expressions[index];
      var correct = Math.abs(Number(guess) - Number(item.answer)) < 0.0001;
      var feedback = main.querySelector('#expression-feedback');
      if (!correct) { feedback.textContent = index === 2 ? tx('Hint: both operands are int. What part of the quotient is kept?', '提示：兩個運算元都是 int。商數會保留哪一部分？') : index === 3 ? tx('Hint: % gives the amount left after forming whole groups.', '提示：% 會傳回分成整數組後剩下的數量。') : tx('Trace the operators in Java order. Parentheses first; then ×, /, %; then +, −.', '依 Java 順序追蹤運算子。先括號，再 ×、/、%，最後 +、−。'); feedback.className = 'market-feedback retry'; return; }
      acceptMarketAnswer('exprIndex', index, feedback, tx(item.en, item.zh));
    });
    input.addEventListener('keydown', function (event) { if (event.key === 'Enter') check.click(); });
  }
  function bindCargo() {
    var unitsLabel = main.querySelector('#cargo-unit-count'), squadsLabel = main.querySelector('#squad-count');
    var tokens = main.querySelector('#cargo-tokens'), figures = main.querySelector('#squad-figures');
    function updateValues() {
      state.shareGuess = ''; state.leftGuess = ''; state.exactGuess = ''; state.splitReady = false; state.distributed = false; save();
      unitsLabel.textContent = state.units; squadsLabel.textContent = state.squads;
      tokens.innerHTML = cargoTokens(state.units);
      figures.innerHTML = Array.from({ length: state.squads }, function (_, i) { return '<i style="--squad-index:' + i + '" aria-hidden="true"></i>'; }).join('');
      main.querySelector('#share-guess').value = ''; main.querySelector('#left-guess').value = ''; main.querySelector('#exact-guess').value = '';
      main.querySelector('#cargo-feedback').textContent = tx('Crate changed. Make a fresh prediction before distributing.', '貨箱數量已變更。請重新預測再分配。');
      main.querySelector('#cargo-result').innerHTML = '<div class="cargo-pending">' + esc(tx('The squads are waiting for your predictions.', '小隊正在等待你的預測。')) + '</div>';
      main.querySelector('#distribute-cargo').textContent = tx('Lock predictions & distribute →', '鎖定預測並分配 →');
      main.querySelector('#cargo-next').disabled = true;
    }
    main.querySelector('#units-down').onclick = function () { if (state.units > 1) { state.units--; updateValues(); } };
    main.querySelector('#units-up').onclick = function () { if (state.units < 30) { state.units++; updateValues(); } };
    main.querySelector('#squads-down').onclick = function () { if (state.squads > 2) { state.squads--; updateValues(); } };
    main.querySelector('#squads-up').onclick = function () { if (state.squads < 6) { state.squads++; updateValues(); } };
    [['#share-guess', 'shareGuess'], ['#left-guess', 'leftGuess'], ['#exact-guess', 'exactGuess']].forEach(function (entry) {
      main.querySelector(entry[0]).addEventListener('input', function (event) {
        state[entry[1]] = event.target.value; state.distributed = false; save();
        var result = main.querySelector('#cargo-result');
        if (result && result.querySelector('.cargo-bins')) result.innerHTML = '<div class="cargo-pending">' + esc(tx('Revise your predictions, then run the distribution again.', '修改預測後，再次執行分配。')) + '</div>';
        main.querySelector('#distribute-cargo').textContent = tx('Lock predictions & distribute →', '鎖定預測並分配 →');
        main.querySelector('#cargo-next').disabled = true;
      });
    });
    main.querySelector('#distribute-cargo').onclick = function () {
      var whole = Math.floor(state.units / state.squads), left = state.units % state.squads, exact = state.units / state.squads;
      var ok = Number(state.shareGuess) === whole && Number(state.leftGuess) === left && Math.abs(Number(state.exactGuess) - exact) < 0.001;
      var feedback = main.querySelector('#cargo-feedback');
      if (!ok) { feedback.textContent = tx('Not all three values match yet. Check / for the whole quotient, % for the remainder, and (double) for the exact share. Edit your predictions and try again.', '三個預測尚未全部正確。請檢查 / 的整數商、% 的餘數，以及 (double) 型別轉換後的精確平均。修改預測再試一次。'); feedback.className = 'retry'; return; }
      state.splitReady = true; state.distributed = true; save(); pulse(true);
      feedback.textContent = tx('All three predictions locked. Watch the cargo sort into equal squads.', '三個預測都已鎖定。觀察貨物平均分進各小隊。'); feedback.className = 'success';
      main.querySelector('#cargo-result').outerHTML = bins();
      main.querySelector('#distribute-cargo').textContent = tx('Distribution verified ✓', '分配已驗證 ✓');
      main.querySelector('#cargo-next').disabled = false;
    };
    main.querySelector('#cargo-tokens').addEventListener('animationend', function () { main.querySelector('#cargo-result')?.classList.add('cargo-result-settled'); });
  }
  function bindRepairs() {
    var input = main.querySelector('#repair-answer'); if (!input) return;
    var index = marketReviewStep ?? state.repairIndex;
    input.addEventListener('input', function () { state.repairs[index] = input.value; save(); });
    main.querySelector('#check-repair').onclick = function () {
      var source = normalizeJava(input.value); state.repairs[index] = input.value; save();
      var item = repairs[index]; var feedback = main.querySelector('#repair-feedback');
      if (!item.accepts(source)) { feedback.textContent = tx('The repair does not match the requirement yet. ' + item.hint[0], '修復方式尚未符合規格。' + item.hint[1]); feedback.className = 'market-feedback retry'; return; }
      acceptMarketAnswer('repairIndex', index, feedback, tx('Repair verified.', '修復已驗證。'));
    };
    input.addEventListener('keydown', function (event) { if (event.key === 'Enter') main.querySelector('#check-repair').click(); });
  }
  function acceptMarketAnswer(progressKey, index, feedback, message) {
    if (index === state[progressKey]) state[progressKey] += 1;
    save();
    pulse(true);
    if (marketReviewStep === null) render();
    else {
      feedback.textContent = message;
      feedback.className = 'market-feedback success';
    }
  }
  function bindCoding() {
    var index = marketReviewStep ?? state.codeTask;
    main.querySelectorAll('[data-code-task]').forEach(function (button) {
      button.onclick = function () { var next = Number(button.dataset.codeTask); if (marketReviewStep !== null) marketReviewStep = next;
        else if (next <= index || state.codePassed.slice(0, next).every(Boolean)) state.codeTask = next;
        else return;
        render(); };
    });
    var editor = main.querySelector('#market-code-editor');
    editor.addEventListener('input', function () { state.codeText[index] = editor.value; state.codePassed[index] = false; state.codeChecks[index] = []; save(); });
    main.querySelector('#run-market-code').onclick = function () {
      state.codeText[index] = editor.value;
      var result;
      try { result = codingTasks[index].run(editor.value); }
      catch (error) { result = { output: 'Statement error: ' + error.message, checks: [['Program runs without a Java error', false]] }; }
      state.codeOutput[index] = result.output || '(No output.)';
      state.codeChecks[index] = result.checks;
      state.codePassed[index] = result.checks.every(function (check) { return check[1]; });
      save(); if (state.codePassed[index]) pulse(true); render();
    };
  }
  function bindCheckpoint() {
    main.querySelectorAll('[name="market-ap-answer"]').forEach(function (radio) {
      radio.addEventListener('change', function () { state.apChoice = radio.value; save(); });
    });
    var check = main.querySelector('#check-ap-answer');
    check.onclick = function () {
      var selected = main.querySelector('[name="market-ap-answer"]:checked');
      if (selected) state.apChoice = selected.value;
      var feedback = main.querySelector('#ap-feedback');
      if (state.apChoice === 'B') { feedback.textContent = tx('Correct. The explicit cast changes how the second division is evaluated.', '正確。明確型別轉換改變了第二次除法的運算方式。'); feedback.className = 'success'; pulse(true); }
      else { feedback.textContent = tx('Trace x first: what type are 7 and 2 when a / b runs? Then trace y after the cast.', '先追蹤 x：執行 a / b 時 7 和 2 是什麼型別？再追蹤型別轉換後的 y。'); feedback.className = 'retry'; }
      save(); if (state.apChoice === 'B') render();
    };
    var reflection = main.querySelector('#market-reflection');
    if (reflection) reflection.addEventListener('input', function () { state.reflection = reflection.value; save(); main.querySelector('#finish-market-mission').disabled = !state.reflection.trim(); });
    var finish = main.querySelector('#finish-market-mission');
    if (finish) finish.onclick = function () { state.reflection = main.querySelector('#market-reflection').value; if (!state.reflection.trim()) return; state.completed = true; save(); pulse(true); render(); };
    var download = main.querySelector('#download-market-evidence'); if (download) download.onclick = downloadEvidence;
  }
  function downloadEvidence() {
    var report = [
      'DEBUG THE FUTURE · LESSON 2', 'Precision Market: Expressions and Type Behavior', '',
      'Expression predictions: ' + JSON.stringify(state.exprAnswers),
      'Cargo setup: ' + state.units + ' units / ' + state.squads + ' squads',
      'Cargo predictions: ' + JSON.stringify({ whole: state.shareGuess, remainder: state.leftGuess, exact: state.exactGuess }), '',
      'Repairs:', state.repairs.join('\n'), '', 'Programs:',
      codingTasks.map(function (task, i) { return '\n' + task.title[0] + '\n' + (state.codeText[i] || '') + '\nConsole:\n' + (state.codeOutput[i] || '') + '\nChecks: ' + JSON.stringify(state.codeChecks[i] || []); }).join('\n'),
      '', 'AP answer: ' + state.apChoice, 'Student explanation (teacher review required):', state.reflection,
      '', 'The browser runner supports a disclosed Java subset, not a JVM.'
    ].join('\n');
    var link = document.createElement('a'); var url = URL.createObjectURL(new Blob([report], { type: 'text/plain' }));
    link.href = url; link.download = 'lesson-2-precision-market-evidence.txt'; link.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  var jumpDialog = document.createElement('dialog');
  jumpDialog.className = 'teacher-jump';
  jumpDialog.setAttribute('aria-labelledby', 'teacher-jump-title');
  jumpDialog.setAttribute('data-no-translate', '');
  document.body.appendChild(jumpDialog);

  var teacherStepsBar = document.createElement('nav');
  teacherStepsBar.className = 'teacher-steps';
  teacherStepsBar.hidden = true;
  teacherStepsBar.setAttribute('data-no-translate', '');
  teacherStepsBar.innerHTML = '<button type="button" class="quiet" data-previous-step></button>' +
    '<button type="button" class="quiet" data-choose-step></button>' +
    '<button type="button" class="quiet" data-next-step></button>' +
    '<button type="button" class="quiet" data-exit-review></button>';
  main.before(teacherStepsBar);

  function gridLabel(name) {
    return lang() === 'zh' ? (window.translateMissionLabel?.(name) ?? name) : name;
  }

  function stepNames(lesson, stage) {
    if (lesson >= 3) return campaign.sectionNames(lesson);
    if (lesson === 1) {
      var labs = labsAt(stage);
      return labs.length ? [gridLabel('Core investigation')].concat(labs.map(function (lab) { return gridLabel(lab.title); })) : [];
    }
    if (stage === 1) return expressions.map(function (item) { return item.code; });
    if (stage === 3) return [
      tx('Keep the decimal in the average', '保留平均值的小數'),
      tx('Fix the variable type', '修正變數型別'),
      tx('Shorten the increment', '簡化加一指令')
    ];
    if (stage === 4) return codingTasks.map(function (task) { return tx(task.title[0], task.title[1]); });
    return [];
  }

  function currentTeacherLocation() {
    if (campaignActive) return campaign.location();
    if (!active) return [1, m.scene, currentGridStep()];
    var step = state.stage === 1 ? state.exprIndex : state.stage === 3 ? state.repairIndex : state.codeTask;
    return [2, state.stage, marketReviewStep ?? step];
  }

  function syncTeacherSteps() {
    teacherStepsBar.hidden = !teacherNavigationOpen;
    if (!teacherNavigationOpen) return;
    var [lesson, stage, step] = currentTeacherLocation();
    var count = stepNames(lesson, stage).length;
    teacherStepsBar.setAttribute('aria-label', tx('Teacher review navigation', '教師複習導覽'));
    var previous = teacherStepsBar.querySelector('[data-previous-step]');
    var choose = teacherStepsBar.querySelector('[data-choose-step]');
    var next = teacherStepsBar.querySelector('[data-next-step]');
    var exit = teacherStepsBar.querySelector('[data-exit-review]');
    previous.textContent = tx('← Previous step', '← 上一小關');
    choose.textContent = tx('Choose a step', '選擇關卡');
    next.textContent = tx('Next step →', '下一小關 →');
    exit.textContent = tx('Exit review', '結束複習');
    previous.disabled = !count || step < 1;
    next.disabled = !count || step + 1 >= count;
    previous.onclick = function () { activate(lesson, stage, step - 1); };
    choose.onclick = openTeacherJump;
    next.onclick = function () { activate(lesson, stage, step + 1); };
    exit.onclick = function () { teacherNavigationOpen = false; activate(lesson < 3 || campaign.isUnlocked(lesson) ? lesson : 0); main.focus({ preventScroll: true }); };
  }

  function openTeacherJump() {
    if (jumpDialog.open) return;
    var lessons = [
      { label: tx('Lesson 1 · Restore the Grid', '第 1 課 · 修復電網'), names: sceneNames.map(gridLabel) },
      { label: tx('Lesson 2 · Precision Market', '第 2 課 · 精準市集'), names: titles.map(function (row) { return tx(row[0], row[1]); }) }
    ];
    if (campaign) campaign.titles().forEach(function (name, index) {
      lessons.push({ label: tx('Lesson ', '第 ') + (index + 3) + tx(' · ', ' 課 · ') + name, names: [tx('Mission briefing', '任務簡報')] });
    });
    var options = lessons.map(function (lesson, index) {
      var entries = lesson.names.map(function (name, stage) {
        var target = (index + 1) + ':' + stage;
        var parent = '<option value="' + target + '">' + (stage + 1) + ' · ' + esc(name) + '</option>';
        var children = stepNames(index + 1, stage).map(function (stepName, step) {
          return '<option value="' + target + ':' + step + '">' + (stage + 1) + '.' + (step + 1) + ' · ' + esc(stepName) + '</option>';
        }).join('');
        return index < 2 ? parent + children : children;
      }).join('');
      return '<optgroup label="' + esc(lesson.label) + '">' + entries + '</optgroup>';
    }).join('');

    jumpDialog.innerHTML = '<form>' +
      '<h2 id="teacher-jump-title">' + tx('Jump to a level', '教師跳關') + '</h2>' +
      '<p>' + tx('Choose a whole level or open an individual question or program.', '可以選整個大關，也可以直接開啟其中一道題目或程式練習。') + '</p>' +
      '<div class="field"><label for="teacher-jump-level">' + tx('Choose a level or step', '選擇大關或小關') + '</label>' +
      '<select id="teacher-jump-level" autofocus>' + options + '</select></div>' +
      '<div class="teacher-jump-actions"><button type="button" class="quiet">' + tx('Cancel', '取消') + '</button>' +
      '<button type="submit" class="primary">' + tx('Open selection', '開啟選取的關卡') + '</button></div></form>';

    var level = jumpDialog.querySelector('select');
    var [lesson, stage, step] = currentTeacherLocation();
    if (lesson) level.value = lesson + ':' + stage + (step < stepNames(lesson, stage).length ? ':' + step : '');
    jumpDialog.querySelector('button[type="button"]').onclick = function () { jumpDialog.close(); };
    jumpDialog.querySelector('form').onsubmit = function (event) {
      event.preventDefault();
      var selection = level.value.split(':').map(Number);
      jumpDialog.close();
      toolsOpen = false;
      teacherNavigationOpen = true;
      activate(selection[0], selection[1], selection[2]);
      main.focus({ preventScroll: true });
    };
    jumpDialog.showModal();
  }

  document.addEventListener('keydown', function (event) {
    if (event.repeat || event.code !== 'KeyJ' || !event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    openTeacherJump();
  });

  var entryUrl = new URL(window.location.href);
  if (entryUrl.searchParams.get('teacher') === '1') {
    entryUrl.searchParams.delete('teacher');
    window.history.replaceState(window.history.state, '', entryUrl);
    document.addEventListener('DOMContentLoaded', openTeacherJump, { once: true });
  }

  paint = function () {
    if (campaignActive) { campaign.render(); syncTeacherSteps(); }
    else if (active) render();
    else { basePaint(); syncTeacherSteps(); }
  };
  var seenLanguage = document.documentElement.lang || 'en';
  new MutationObserver(function () {
    var currentLanguage = document.documentElement.lang || 'en';
    if (currentLanguage === seenLanguage) return;
    seenLanguage = currentLanguage;
    if (campaignActive) { campaign.render(); setActiveTab(); syncTeacherSteps(); }
    else if (active) render();
    else syncTeacherSteps();
  })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  if (campaign) activate(0);
  else setActiveTab();
})();
