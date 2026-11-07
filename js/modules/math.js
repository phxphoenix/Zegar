// ============================================================================
// MODUŁ PRZEDMIOTOWY: MATEMATYKA (KLASY 1-3 SZKOŁY PODSTAWOWEJ)
// Struktura deklaratywna przygotowana pod łatwe dodanie Klasy 4+ oraz Geometrii
// ============================================================================

import { i18n } from '../i18n.js';

const state = {
  grade: 1, // 1 | 2 | 3
  ops: ['add', 'sub'], // 'add' | 'sub' | 'mul' | 'div'
  currentQuestion: null, // { op, a, b, answer, options }
  hintVisible: false,
  lang: 'pl'
};

let callbacks = {
  onQuestionReady: null,
  onManualResetStreak: null
};

const OP_BADGE_STYLES = {
  add: { icon: '➕', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  sub: { icon: '➖', colorClass: 'bg-sky-100 text-sky-800 border-sky-300' },
  mul: { icon: '✖️', colorClass: 'bg-amber-100 text-amber-800 border-amber-300' },
  div: { icon: '➗', colorClass: 'bg-purple-100 text-purple-800 border-purple-300' }
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================================================
// GENERATORY ZADAŃ WG PODSTAWY PROGRAMOWEJ (KLASY 1, 2, 3)
// ============================================================================

function generateGrade1(op) {
  if (op === 'add') {
    // Dodawanie w zakresie 20 (często z przekroczeniem progu dziesiątkowego)
    const crossTen = Math.random() < 0.65;
    if (crossTen) {
      const a = randInt(5, 14);
      const minB = Math.max(1, 11 - a);
      const maxB = 20 - a;
      const b = randInt(minB, Math.max(minB, maxB));
      return { op, a, b, answer: a + b };
    }
    const a = randInt(1, 15);
    const b = randInt(1, 20 - a);
    return { op, a, b, answer: a + b };
  }

  if (op === 'sub') {
    // Odejmowanie w zakresie 20 (wynik >= 0)
    const a = randInt(5, 20);
    const b = randInt(1, a - 1);
    return { op, a, b, answer: a - b };
  }

  if (op === 'mul') {
    // Wstęp do mnożenia w zakresie do 20 (podwajanie, liczenie po 2, 3, 4, 5)
    const a = randInt(2, 5);
    const maxB = Math.floor(20 / a);
    const b = randInt(1, maxB);
    return { op, a, b, answer: a * b };
  }

  // div: Wstęp do dzielenia w zakresie do 20 bez reszty
  const b = randInt(2, 5);
  const maxQuotient = Math.floor(20 / b);
  const answer = randInt(1, maxQuotient);
  const a = answer * b;
  return { op, a, b, answer };
}

function generateGrade2(op) {
  if (op === 'add') {
    // Dodawanie w zakresie 100
    const a = randInt(12, 78);
    const b = randInt(6, 100 - a);
    return { op, a, b, answer: a + b };
  }

  if (op === 'sub') {
    // Odejmowanie w zakresie 100
    const a = randInt(22, 100);
    const b = randInt(6, a - 3);
    return { op, a, b, answer: a - b };
  }

  if (op === 'mul') {
    // Tabliczka mnożenia w zakresie do 50
    const a = randInt(2, 9);
    const maxB = Math.min(10, Math.floor(50 / a));
    const b = randInt(2, Math.max(2, maxB));
    return { op, a, b, answer: a * b };
  }

  // div: Dzielenie w zakresie do 50
  const b = randInt(2, 9);
  const maxQuotient = Math.min(10, Math.floor(50 / b));
  const answer = randInt(2, Math.max(2, maxQuotient));
  const a = answer * b;
  return { op, a, b, answer };
}

function generateGrade3(op) {
  if (op === 'add') {
    // Połowa zadań: trudniejsze dwucyfrowe do 100; połowa: dziesiątki/setki do 1000
    if (Math.random() < 0.45) {
      const a = randInt(25, 68);
      const b = randInt(18, 100 - a);
      return { op, a, b, answer: a + b };
    }
    const a = randInt(11, 65) * 10;
    const b = randInt(8, Math.floor((1000 - a) / 10)) * 10;
    return { op, a, b, answer: a + b };
  }

  if (op === 'sub') {
    if (Math.random() < 0.45) {
      const a = randInt(42, 100);
      const b = randInt(16, a - 8);
      return { op, a, b, answer: a - b };
    }
    const a = randInt(25, 95) * 10;
    const b = randInt(8, Math.floor(a / 10) - 5) * 10;
    return { op, a, b, answer: a - b };
  }

  if (op === 'mul') {
    // Pełna tabliczka mnożenia do 100 + mnożenie pełnych dziesiątek
    if (Math.random() < 0.75) {
      const a = randInt(3, 10);
      const b = randInt(3, 10);
      return { op, a, b, answer: a * b };
    }
    const a = randInt(2, 5) * 10;
    const b = randInt(2, Math.floor(200 / a));
    return { op, a, b, answer: a * b };
  }

  // div: Pełna tabliczka dzielenia do 100 + dzielenie pełnych dziesiątek
  if (Math.random() < 0.75) {
    const b = randInt(3, 10);
    const answer = randInt(3, 10);
    return { op, a: answer * b, b, answer };
  }
  const b = randInt(2, 6);
  const answer = randInt(2, 9) * 10;
  return { op, a: answer * b, b, answer };
}

function generateRawProblem(grade, op) {
  if (grade === 1) return generateGrade1(op);
  if (grade === 2) return generateGrade2(op);
  return generateGrade3(op);
}

// ============================================================================
// INTELIGENTNY GENERATOR ZMYŁEK (DISTRACTOR ENGINE)
// ============================================================================

function generateDistractors(problem) {
  const { op, a, b, answer } = problem;
  const candidates = [];

  const isMultiplesOfTen = answer >= 100 && a % 10 === 0 && b % 10 === 0;

  if (isMultiplesOfTen) {
    candidates.push(
      answer + 10,
      answer - 10,
      answer + 20,
      answer - 20,
      answer + 100,
      answer - 100
    );
  } else {
    // Typowe błędy w liczeniu o 1 lub 2 oraz błąd w dziesiątkach (±10)
    candidates.push(
      answer + 1,
      answer - 1,
      answer + 2,
      answer - 2,
      answer + 10,
      answer - 10
    );
  }

  if (op === 'add') {
    if (a > b) candidates.push(a - b);
    // Błąd niedopełnienia do dziesiątki
    candidates.push(answer + 3, answer - 3);
  } else if (op === 'sub') {
    candidates.push(a + b);
    // Błąd odjęcia mniejszej cyfry jedności od większej (np. 62 - 18 -> 56 zamiast 44)
    const onesA = a % 10;
    const onesB = b % 10;
    if (onesB > onesA) {
      const tensDiff = Math.floor(a / 10) - Math.floor(b / 10);
      const mistaken = tensDiff * 10 + (onesB - onesA);
      if (mistaken > 0) candidates.push(mistaken);
    }
  } else if (op === 'mul') {
    // Sąsiednie wyniki z tabliczki mnożenia
    candidates.push(
      a * (b + 1),
      a * (b - 1),
      (a + 1) * b,
      (a - 1) * b,
      a + b
    );
  } else if (op === 'div') {
    candidates.push(
      answer + 1,
      answer - 1,
      answer + 2,
      answer - 2,
      Math.max(1, a - b)
    );
  }

  const validSet = new Set([String(answer)]);
  // Tasujemy kandydatów, aby zmyłki nie były zawsze tego samego typu
  const shuffledCandidates = candidates
    .filter(n => typeof n === 'number' && !isNaN(n) && n >= 0 && n !== answer)
    .sort(() => Math.random() - 0.5);

  for (const cand of shuffledCandidates) {
    if (validSet.size >= 4) break;
    validSet.add(String(cand));
  }

  let offset = 3;
  while (validSet.size < 4) {
    const step = isMultiplesOfTen ? offset * 10 : offset;
    validSet.add(String(answer + step));
    offset++;
  }

  return Array.from(validSet).sort(() => Math.random() - 0.5);
}

// ============================================================================
// GENERATOR WIZUALNYCH PODPOWIEDZI (ON-DEMAND VISUAL HINTS)
// ============================================================================

function renderTenFrameDotsAdd(a, b) {
  const totalSlots = 20;
  let html = '<div class="flex flex-col gap-2 items-center my-2">';
  for (let row = 0; row < 2; row++) {
    html += '<div class="grid grid-cols-10 gap-1 sm:gap-1.5 p-2 bg-white rounded-xl border border-slate-200 shadow-inner">';
    for (let col = 0; col < 10; col++) {
      const idx = row * 10 + col;
      let dotClass = 'bg-slate-100 border border-slate-200';
      if (idx < a) {
        dotClass = 'bg-blue-500 border border-blue-600 shadow-sm';
      } else if (idx < a + b) {
        dotClass = 'bg-emerald-500 border border-emerald-600 shadow-sm';
      }
      html += `<span class="w-4 h-4 sm:w-5 sm:h-5 rounded-full inline-block ${dotClass}"></span>`;
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function renderTenFrameDotsSub(a, b) {
  const remaining = a - b;
  const rows = a > 10 ? 2 : 1;
  let html = '<div class="flex flex-col gap-2 items-center my-2">';
  for (let row = 0; row < rows; row++) {
    html += '<div class="grid grid-cols-10 gap-1 sm:gap-1.5 p-2 bg-white rounded-xl border border-slate-200 shadow-inner">';
    for (let col = 0; col < 10; col++) {
      const idx = row * 10 + col;
      if (idx < remaining) {
        html += `<span class="w-4 h-4 sm:w-5 sm:h-5 rounded-full inline-block bg-blue-500 border border-blue-600 shadow-sm"></span>`;
      } else if (idx < a) {
        html += `<span class="w-4 h-4 sm:w-5 sm:h-5 rounded-full inline-flex items-center justify-center bg-rose-100 border border-rose-400 text-rose-600 text-[10px] font-extrabold">✕</span>`;
      } else {
        html += `<span class="w-4 h-4 sm:w-5 sm:h-5 rounded-full inline-block bg-slate-100 border border-slate-200"></span>`;
      }
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function renderPlaceValueBars(num, colorBase = 'blue') {
  const tens = Math.floor((num % 100) / 10);
  const ones = num % 10;
  const hundreds = Math.floor(num / 100);

  const barColor = colorBase === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500';
  const dotColor = colorBase === 'emerald' ? 'bg-emerald-400' : 'bg-blue-400';

  let html = '<div class="inline-flex flex-wrap items-end gap-1.5 px-2.5 py-1.5 bg-white rounded-xl border border-slate-200">';
  for (let h = 0; h < hundreds; h++) {
    html += `<span class="px-1.5 py-1 rounded bg-indigo-600 text-white text-[10px] font-extrabold">100</span>`;
  }
  for (let t = 0; t < tens; t++) {
    html += `<span class="w-2.5 h-7 rounded-sm ${barColor} inline-block" title="10"></span>`;
  }
  if (ones > 0) {
    html += '<span class="inline-flex flex-wrap gap-0.5 max-w-[3.5rem] ml-1">';
    for (let o = 0; o < ones; o++) {
      html += `<span class="w-2 h-2 rounded-full ${dotColor} inline-block" title="1"></span>`;
    }
    html += '</span>';
  }
  html += '</div>';
  return html;
}

function buildHintHTML(problem, lang) {
  const dict = i18n[lang].math;
  const { op, a, b } = problem;

  // 1. Dodawanie w zakresie 20 – rama dziesiątkowa (Ten-Frame)
  if (op === 'add' && a + b <= 20) {
    const toTen = a < 10 ? Math.min(b, 10 - a) : 0;
    const rest = b - toTen;
    return `
      <div class="text-xs sm:text-sm text-slate-700 leading-relaxed mb-1">
        ${dict.hints.tenFrameAdd(a, b, toTen, rest)}
      </div>
      ${renderTenFrameDotsAdd(a, b)}
    `;
  }

  // 2. Odejmowanie w zakresie 20 – rama dziesiątkowa ze skreślaniem
  if (op === 'sub' && a <= 20) {
    return `
      <div class="text-xs sm:text-sm text-slate-700 leading-relaxed mb-1">
        ${dict.hints.tenFrameSub(a, b)}
      </div>
      ${renderTenFrameDotsSub(a, b)}
    `;
  }

  // 3. Dodawanie większych liczb (Klasa 2 i 3)
  if (op === 'add') {
    if (a + b <= 100) {
      const tensA = Math.floor(a / 10) * 10;
      const onesA = a % 10;
      const tensB = Math.floor(b / 10) * 10;
      const onesB = b % 10;
      return `
        <div class="text-xs sm:text-sm text-slate-700 leading-relaxed mb-2">
          ${dict.hints.decomposeAdd(a, b, tensA, onesA, tensB, onesB)}
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2">
          ${renderPlaceValueBars(a, 'blue')}
          <span class="font-extrabold text-slate-500">+</span>
          ${renderPlaceValueBars(b, 'emerald')}
        </div>
      `;
    }
    return `
      <div class="text-xs sm:text-sm text-slate-700 leading-relaxed">
        ${dict.hints.decomposeLargeAdd(a, b)}
      </div>
    `;
  }

  // 4. Odejmowanie większych liczb (Klasa 2 i 3)
  if (op === 'sub') {
    if (a <= 100) {
      const tensB = Math.floor(b / 10) * 10;
      const onesB = b % 10;
      return `
        <div class="text-xs sm:text-sm text-slate-700 leading-relaxed mb-2">
          ${dict.hints.decomposeSub(a, b, tensB, onesB)}
        </div>
        <div class="flex justify-center">
          ${renderPlaceValueBars(a, 'blue')}
        </div>
      `;
    }
    const hundredsB = Math.floor(b / 100) * 100;
    const restB = b % 100;
    return `
      <div class="text-xs sm:text-sm text-slate-700 leading-relaxed">
        ${dict.hints.decomposeLargeSub(a, b, hundredsB, restB)}
      </div>
    `;
  }

  // 5. Mnożenie – grupy elementów
  if (op === 'mul') {
    const groupsCount = Math.min(a, 10);
    const sumStr = Array.from({ length: Math.min(a, 6) }, () => b).join(' + ') + (a > 6 ? ' + ...' : '');
    let groupsHTML = '<div class="flex flex-wrap justify-center gap-1.5 mt-2">';
    for (let g = 0; g < groupsCount; g++) {
      if (b <= 10) {
        let dots = '';
        for (let d = 0; d < b; d++) {
          dots += '<span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>';
        }
        groupsHTML += `<div class="p-1.5 bg-white border border-amber-300 rounded-lg grid grid-cols-5 gap-1">${dots}</div>`;
      } else {
        groupsHTML += `<div class="px-2.5 py-1 bg-white border border-amber-300 rounded-lg font-bold text-xs text-amber-800">${b}</div>`;
      }
    }
    groupsHTML += '</div>';

    return `
      <div class="text-xs sm:text-sm text-slate-700 leading-relaxed">
        ${dict.hints.mulGroups(a, b, sumStr)}
      </div>
      ${groupsHTML}
    `;
  }

  // 6. Dzielenie – rozdzielanie do pudełek
  const quotient = problem.answer;
  let boxesHTML = '<div class="flex flex-wrap justify-center gap-1.5 mt-2">';
  const boxCount = Math.min(b, 10);
  for (let i = 0; i < boxCount; i++) {
    if (a <= 50 && quotient <= 10) {
      let dots = '';
      for (let d = 0; d < quotient; d++) {
        dots += '<span class="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>';
      }
      boxesHTML += `<div class="p-1.5 bg-white border border-purple-300 rounded-lg grid grid-cols-5 gap-1">${dots}</div>`;
    } else {
      boxesHTML += `<div class="px-2.5 py-1 bg-white border border-purple-300 rounded-lg font-bold text-xs text-purple-700">?</div>`;
    }
  }
  boxesHTML += '</div>';

  return `
    <div class="text-xs sm:text-sm text-slate-700 leading-relaxed">
      ${dict.hints.divGroups(a, b)}
    </div>
    ${boxesHTML}
  `;
}

// ============================================================================
// AKTUALIZACJA SCENY MATEMATYKI
// ============================================================================

function updateMathStageUI(lang) {
  if (!state.currentQuestion) return;
  const dict = i18n[lang].math;
  const { op, a, b } = state.currentQuestion;
  const symbol = dict.ops[op].symbol;

  // Odznaka nad zadaniem (np. Klasa 1 • Dodawanie)
  const badge = document.getElementById('math-context-badge');
  if (badge) {
    const style = OP_BADGE_STYLES[op];
    badge.className = `inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm sm:text-base shadow-sm border transition-all duration-300 ${style.colorClass}`;
    badge.textContent = `${dict.grades[state.grade].name} • ${dict.ops[op].short}`;
  }

  // Równanie główne
  const exprEl = document.getElementById('math-expression');
  if (exprEl) {
    exprEl.textContent = `${a} ${symbol} ${b} = ?`;
  }

  // Przycisk i kontener podpowiedzi
  const hintBtn = document.getElementById('math-hint-btn');
  const hintBox = document.getElementById('math-hint-box');
  const hintContent = document.getElementById('math-hint-content');

  if (hintBtn) {
    hintBtn.textContent = state.hintVisible ? dict.hideHintBtn : dict.showHintBtn;
  }

  if (hintBox && hintContent) {
    if (state.hintVisible) {
      hintContent.innerHTML = buildHintHTML(state.currentQuestion, lang);
      hintBox.classList.remove('hidden');
    } else {
      hintBox.classList.add('hidden');
    }
  }
}

export const mathModule = {
  id: 'math',

  mountStage(stageContainer, lang) {
    state.lang = lang;
    const dict = i18n[state.lang].math;
    stageContainer.innerHTML = `
      <!-- Odznaka klasy i aktualnego działania -->
      <div class="w-full flex justify-center mb-3">
        <div id="math-context-badge" class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm sm:text-base shadow-sm border transition-all duration-300"></div>
      </div>

      <!-- Karta główna z działaniem w miejscu zegara -->
      <div class="w-full max-w-md min-h-[240px] sm:min-h-[280px] bg-gradient-to-br from-indigo-50 via-white to-slate-50 border-4 border-slate-800 rounded-3xl shadow-md flex flex-col items-center justify-center p-6 text-center relative">
        <div id="math-expression" class="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight text-slate-800 select-none">
          8 + 5 = ?
        </div>

        <!-- Przycisk opcjonalnej podpowiedzi wizualnej -->
        <button
          id="math-hint-btn"
          type="button"
          class="mt-6 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm px-4 py-2 rounded-full transition shadow-sm"
        >
          ${dict.showHintBtn}
        </button>

        <!-- Rozwijana sekcja wizualizacji pomocniczej -->
        <div id="math-hint-box" class="hidden mt-4 w-full bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 text-center">
          <div id="math-hint-content"></div>
        </div>
      </div>
    `;

    const hintBtn = document.getElementById('math-hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        state.hintVisible = !state.hintVisible;
        updateMathStageUI(state.lang);
      });
    }

    updateMathStageUI(state.lang);
  },

  mountConfig(configContainer, lang, hooks) {
    state.lang = lang;
    callbacks = { ...callbacks, ...hooks };

    const renderConfigDOM = () => {
      const currentDict = i18n[state.lang].math;
      configContainer.innerHTML = `
        <div class="flex items-center justify-between">
          <h2 id="math-panel-title" class="font-bold text-slate-700 text-sm uppercase tracking-wider">${currentDict.panelTitle}</h2>
          <button id="math-btn-random" type="button" class="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg transition">
            ${currentDict.randomBtn}
          </button>
        </div>

        <!-- Wybór klasy 1, 2, 3 -->
        <div>
          <label id="math-lbl-grade" class="block text-xs font-semibold text-slate-500 mb-1.5">${currentDict.lblGrade}</label>
          <div class="grid grid-cols-3 gap-2">
            ${[1, 2, 3].map(g => {
              const active = state.grade === g;
              return `
                <button
                  type="button"
                  data-grade="${g}"
                  class="math-grade-btn py-2 px-2 rounded-xl font-bold text-xs sm:text-sm border-2 transition ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                  }"
                >
                  ${currentDict.grades[g].name}
                </button>
              `;
            }).join('')}
          </div>
          <p id="math-grade-desc" class="text-xs text-slate-500 mt-1.5 italic">
            ${currentDict.grades[state.grade].desc}
          </p>
        </div>

        <!-- Wybór działań (+, -, ×, ÷) -->
        <div>
          <label id="math-lbl-ops" class="block text-xs font-semibold text-slate-500 mb-1.5">${currentDict.lblOperations}</label>
          <div class="grid grid-cols-2 gap-2">
            ${['add', 'sub', 'mul', 'div'].map(opKey => {
              const active = state.ops.includes(opKey);
              return `
                <button
                  type="button"
                  data-op="${opKey}"
                  class="math-op-btn py-2 px-3 rounded-xl font-bold text-xs sm:text-sm border-2 transition flex items-center justify-center gap-1.5 ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                  }"
                >
                  ${currentDict.ops[opKey].label}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;

      document.getElementById('math-btn-random').addEventListener('click', () => {
        if (callbacks.onQuestionReady) {
          callbacks.onQuestionReady(this.generateQuestion(state.lang, true));
        }
      });

      configContainer.querySelectorAll('.math-grade-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const selectedGrade = parseInt(btn.getAttribute('data-grade'), 10);
          if (state.grade === selectedGrade) return;
          state.grade = selectedGrade;
          renderConfigDOM();
          if (callbacks.onManualResetStreak) callbacks.onManualResetStreak(false);
          if (callbacks.onQuestionReady) {
            callbacks.onQuestionReady(this.generateQuestion(state.lang, true));
          }
        });
      });

      configContainer.querySelectorAll('.math-op-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const opKey = btn.getAttribute('data-op');
          if (state.ops.includes(opKey)) {
            if (state.ops.length <= 1) return; // Zawsze min. 1 działanie aktywne
            state.ops = state.ops.filter(o => o !== opKey);
          } else {
            state.ops = [...state.ops, opKey];
          }
          renderConfigDOM();
          if (callbacks.onManualResetStreak) callbacks.onManualResetStreak(false);
          if (callbacks.onQuestionReady) {
            callbacks.onQuestionReady(this.generateQuestion(state.lang, true));
          }
        });
      });
    };

    renderConfigDOM();
  },

  generateQuestion(lang, randomize = true) {
    if (lang) state.lang = lang;
    if (randomize || !state.currentQuestion) {
      const chosenOp = state.ops[Math.floor(Math.random() * state.ops.length)] || 'add';
      const raw = generateRawProblem(state.grade, chosenOp);
      const options = generateDistractors(raw);
      state.currentQuestion = {
        ...raw,
        options
      };
      state.hintVisible = false;
    }

    updateMathStageUI(state.lang);

    return {
      correctAnswer: String(state.currentQuestion.answer),
      options: state.currentQuestion.options
    };
  },

  refreshLanguage(lang) {
    state.lang = lang;
    // Odświeżamy scenę i panel konfiguracji w nowym języku bez losowania nowego zadania
    const configContainer = document.getElementById('teacher-panel');
    if (configContainer) {
      this.mountConfig(configContainer, state.lang, callbacks);
    }
    updateMathStageUI(state.lang);
    if (!state.currentQuestion) {
      return this.generateQuestion(state.lang, true);
    }
    return {
      correctAnswer: String(state.currentQuestion.answer),
      options: state.currentQuestion.options
    };
  },

  getRankingPayload() {
    return {
      moduleId: 'math',
      mode: 'math',
      meta: {
        grade: state.grade,
        ops: [...state.ops]
      }
    };
  }
};
