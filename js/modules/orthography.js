// ============================================================================
// MODUŁ PRZEDMIOTOWY: ORTOGRAFIA (KLASY 1-3 SZKOŁY PODSTAWOWEJ)
// Obsługuje słówka z obocznościami, zasadami pisowni oraz wyrazy do zapamiętania
// Architektura gotowa do rozbudowy o klasy 4-8 i kolejne kategorie ortograficzne
// ============================================================================

import { i18n } from '../i18n.js';
import { ORTHOGRAPHY_WORDS } from './orthographyData.js';

const state = {
  grade: 1, // 1 | 2 | 3
  categories: ['u_o', 'rz_z', 'ch_h'], // 'u_o' | 'rz_z' | 'ch_h'
  ruleFilter: 'all', // 'all' | 'explainable' | 'memory'
  quizMode: 'gap', // 'gap' | 'word' | 'spot'
  showContextSentence: true,
  currentQuestion: null, // { item, correctAnswer, options, mode }
  hintVisible: false,
  recentIds: [],
  lang: 'pl'
};

let callbacks = {
  onQuestionReady: null,
  onManualResetStreak: null
};

const CATEGORY_BADGE_STYLES = {
  u_o: { colorClass: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  rz_z: { colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  ch_h: { colorClass: 'bg-amber-100 text-amber-800 border-amber-300' }
};

const RULE_BADGE_STYLES = {
  alternation: 'bg-sky-100 text-sky-800 border-sky-300',
  rule: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  memory: 'bg-purple-100 text-purple-800 border-purple-300'
};

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getFilteredPool() {
  let pool = ORTHOGRAPHY_WORDS.filter(
    w => w.grade === state.grade && state.categories.includes(w.category)
  );

  if (state.ruleFilter === 'explainable') {
    pool = pool.filter(w => w.ruleType === 'alternation' || w.ruleType === 'rule');
  } else if (state.ruleFilter === 'memory') {
    pool = pool.filter(w => w.ruleType === 'memory');
  }

  // Zabezpieczenie na wypadek zbyt wąskiego filtra
  if (pool.length === 0) {
    pool = ORTHOGRAPHY_WORDS.filter(
      w => w.grade === state.grade && state.categories.includes(w.category)
    );
  }
  if (pool.length === 0) {
    pool = ORTHOGRAPHY_WORDS;
  }

  return pool;
}

function pickRandomWordItem() {
  const pool = getFilteredPool();
  const candidates = pool.filter(w => !state.recentIds.includes(w.id));
  const activePool = candidates.length > 0 ? candidates : pool;
  const chosen = activePool[Math.floor(Math.random() * activePool.length)];

  state.recentIds.push(chosen.id);
  const maxHistory = Math.min(10, Math.max(1, pool.length - 1));
  if (state.recentIds.length > maxHistory) {
    state.recentIds.shift();
  }

  return chosen;
}

function buildQuestionFromItem(item) {
  const mode = state.quizMode;

  // Tryb 1: Uzupełnij lukę (4 warianty literowe / dwuznakowe)
  if (mode === 'gap') {
    const set = new Set([item.target, ...(item.letterOptions || [])]);
    const fallbacks = ['ó', 'u', 'rz', 'ż', 'ch', 'h', 'sz', 'o'];
    for (const fb of fallbacks) {
      if (set.size >= 4) break;
      set.add(fb);
    }
    return {
      item,
      mode,
      correctAnswer: item.target,
      options: shuffleArray(Array.from(set).slice(0, 4))
    };
  }

  // Tryb 2: Pełne wyrazy (4 warianty zapisu tego samego słowa)
  if (mode === 'word') {
    const set = new Set([item.word]);
    if (item.wrongWord) set.add(item.wrongWord);
    for (const d of item.distractorWords || []) {
      if (set.size >= 4) break;
      if (d && d !== item.word) set.add(d);
    }
    // Dodatkowe zabezpieczenie do 4 unikalnych opcji
    const pool = getFilteredPool();
    for (const other of shuffleArray(pool)) {
      if (set.size >= 4) break;
      if (other.id !== item.id && other.wrongWord) {
        set.add(other.wrongWord);
      }
    }
    return {
      item,
      mode,
      correctAnswer: item.word,
      options: shuffleArray(Array.from(set).slice(0, 4))
    };
  }

  // Tryb 3: Bystre oko (1 poprawny wyraz oraz 3 błędnie zapisane inne wyrazy z puli)
  const pool = getFilteredPool().filter(w => w.id !== item.id);
  const widerPool = ORTHOGRAPHY_WORDS.filter(
    w => w.id !== item.id && state.categories.includes(w.category)
  );
  const sourcePool = pool.length >= 3 ? pool : widerPool;

  const wrongSet = new Set();
  for (const other of shuffleArray(sourcePool)) {
    if (wrongSet.size >= 3) break;
    if (other.wrongWord && other.wrongWord !== item.word) {
      wrongSet.add(other.wrongWord);
    }
  }

  const options = shuffleArray([item.word, ...Array.from(wrongSet)]);
  return {
    item,
    mode: 'spot',
    correctAnswer: item.word,
    options
  };
}

function renderMaskedWordHTML(maskedStr) {
  // Zamienia ciąg podkreśleń ('_' lub '__') na wyraźny kafel z pytajnikiem
  return maskedStr.replace(
    /_+/g,
    '<span class="inline-flex items-center justify-center px-2.5 py-0.5 mx-1 rounded-xl bg-amber-100 border-2 border-amber-400 text-amber-800 font-black shadow-sm">?</span>'
  );
}

function renderContextSentenceHTML(sentence) {
  return sentence.replace(
    /___/g,
    '<span class="inline-block px-2 py-0.5 mx-0.5 rounded-md bg-indigo-100 text-indigo-700 font-bold border border-indigo-200">…</span>'
  );
}

function buildHintHTML(item, lang) {
  const dict = i18n[lang].orthography;
  const ruleBadgeClass = RULE_BADGE_STYLES[item.ruleType] || RULE_BADGE_STYLES.memory;
  const ruleLabel = dict.ruleBadges[item.ruleType] || dict.ruleBadges.memory;
  const explanation = lang === 'en' ? item.hintEn : item.hintPl;

  return `
    <div class="flex flex-wrap items-center justify-center gap-2 mb-2">
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${ruleBadgeClass}">
        ${ruleLabel}
      </span>
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-white text-slate-800 border border-amber-300 shadow-sm">
        🔑 ${item.alternation}
      </span>
    </div>
    <div class="text-xs sm:text-sm text-slate-700 leading-relaxed">
      ${explanation}
    </div>
  `;
}

function updateQuestionTitleInShell(lang) {
  const dict = i18n[lang];
  const orthoModDict = dict.modules.orthography;
  const questionTitleEl = document.getElementById('question-title');
  if (questionTitleEl && orthoModDict) {
    questionTitleEl.textContent =
      orthoModDict.questionTitleByMode?.[state.quizMode] || orthoModDict.questionTitle;
  }
}

function updateOrthoStageUI(lang) {
  if (!state.currentQuestion) return;
  const dict = i18n[lang].orthography;
  const { item, mode } = state.currentQuestion;

  updateQuestionTitleInShell(lang);

  // Odznaka kontekstowa nad kartą
  const badge = document.getElementById('ortho-context-badge');
  if (badge) {
    const catStyle = CATEGORY_BADGE_STYLES[item.category] || CATEGORY_BADGE_STYLES.u_o;
    const catShort = dict.categories[item.category]?.short || item.category;
    const modeShort = dict.quizModes[mode]?.short || '';
    badge.className = `inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm sm:text-base shadow-sm border transition-all duration-300 ${catStyle.colorClass}`;
    badge.textContent = `${dict.grades[state.grade].name} • ${catShort} • ${modeShort}`;
  }

  // Główna zawartość karty
  const mainBody = document.getElementById('ortho-stage-body');
  if (mainBody) {
    const enGlossHTML =
      lang === 'en' && item.enMeaning
        ? `<div class="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">${dict.enGlossPrefix} <strong>${item.enMeaning}</strong></div>`
        : '';

    const sentenceHTML =
      state.showContextSentence && item.sentence
        ? `<p class="mt-3 text-xs sm:text-sm text-slate-600 bg-white/80 border border-slate-200/80 rounded-2xl px-3.5 py-2 leading-relaxed max-w-sm mx-auto shadow-inner">
             „${renderContextSentenceHTML(item.sentence)}”
           </p>`
        : '';

    if (mode === 'gap') {
      mainBody.innerHTML = `
        <div class="text-5xl sm:text-6xl mb-2 select-none" aria-hidden="true">${item.emoji}</div>
        <div class="text-3xl sm:text-4xl xl:text-5xl font-black tracking-wide text-slate-800 select-none my-1">
          ${renderMaskedWordHTML(item.masked)}
        </div>
        ${enGlossHTML}
        ${sentenceHTML}
      `;
    } else if (mode === 'word') {
      mainBody.innerHTML = `
        <div class="text-5xl sm:text-6xl mb-2 select-none" aria-hidden="true">${item.emoji}</div>
        <div class="text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
          ${dict.wordStagePrompt}
        </div>
        ${enGlossHTML}
        ${sentenceHTML}
      `;
    } else {
      // mode === 'spot' (Bystre oko)
      mainBody.innerHTML = `
        <div class="text-5xl sm:text-6xl mb-2 select-none" aria-hidden="true">🕵️‍♂️</div>
        <div class="text-lg sm:text-xl font-extrabold text-slate-800">
          ${dict.spotStageTitle}
        </div>
        <p class="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-xs mx-auto leading-relaxed">
          ${dict.spotStageSubtitle}
        </p>
        ${state.hintVisible ? `<div class="mt-2 text-2xl">${item.emoji}</div>${enGlossHTML}` : ''}
      `;
    }
  }

  // Przycisk i boks podpowiedzi z obocznością / zasadą
  const hintBtn = document.getElementById('ortho-hint-btn');
  const hintBox = document.getElementById('ortho-hint-box');
  const hintContent = document.getElementById('ortho-hint-content');

  if (hintBtn) {
    hintBtn.textContent = state.hintVisible ? dict.hideHintBtn : dict.showHintBtn;
  }

  if (hintBox && hintContent) {
    if (state.hintVisible) {
      hintContent.innerHTML = buildHintHTML(item, lang);
      hintBox.classList.remove('hidden');
    } else {
      hintBox.classList.add('hidden');
    }
  }
}

export const orthographyModule = {
  id: 'orthography',

  mountStage(stageContainer, lang) {
    state.lang = lang;
    const dict = i18n[state.lang].orthography;

    stageContainer.innerHTML = `
      <!-- Odznaka klasy, kategorii i trybu -->
      <div class="w-full flex justify-center mb-3">
        <div id="ortho-context-badge" class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm sm:text-base shadow-sm border transition-all duration-300"></div>
      </div>

      <!-- Karta główna zadania ortograficznego -->
      <div class="w-full max-w-md min-h-[250px] sm:min-h-[290px] bg-gradient-to-br from-amber-50/70 via-white to-indigo-50/60 border-4 border-slate-800 rounded-3xl shadow-md flex flex-col items-center justify-center p-5 sm:p-6 text-center relative">
        <div id="ortho-stage-body" class="flex flex-col items-center justify-center w-full"></div>

        <!-- Przycisk podpowiedzi (oboczności / zasady pisowni) -->
        <button
          id="ortho-hint-btn"
          type="button"
          class="mt-5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm px-4 py-2 rounded-full transition shadow-sm"
        >
          ${dict.showHintBtn}
        </button>

        <!-- Rozwijana sekcja z wyjaśnieniem oboczności lub reguły -->
        <div id="ortho-hint-box" class="hidden mt-3.5 w-full bg-amber-50/95 border border-amber-200 rounded-2xl p-3.5 text-center shadow-sm">
          <div id="ortho-hint-content"></div>
        </div>
      </div>
    `;

    const hintBtn = document.getElementById('ortho-hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        state.hintVisible = !state.hintVisible;
        updateOrthoStageUI(state.lang);
      });
    }

    updateOrthoStageUI(state.lang);
  },

  mountConfig(configContainer, lang, hooks) {
    state.lang = lang;
    callbacks = { ...callbacks, ...hooks };

    const renderConfigDOM = () => {
      const currentDict = i18n[state.lang].orthography;
      const poolCount = getFilteredPool().length;

      configContainer.innerHTML = `
        <div class="flex items-center justify-between">
          <h2 id="ortho-panel-title" class="font-bold text-slate-700 text-sm uppercase tracking-wider">
            ${currentDict.panelTitle}
            <span class="ml-1 text-xs font-semibold text-slate-400">(${poolCount})</span>
          </h2>
          <button id="ortho-btn-random" type="button" class="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg transition">
            ${currentDict.randomBtn}
          </button>
        </div>

        <!-- 1. Wybór klasy 1, 2, 3 -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">${currentDict.lblGrade}</label>
          <div class="grid grid-cols-3 gap-2">
            ${[1, 2, 3].map(g => {
              const active = state.grade === g;
              return `
                <button
                  type="button"
                  data-grade="${g}"
                  class="ortho-grade-btn py-2 px-2 rounded-xl font-bold text-xs sm:text-sm border-2 transition ${
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
          <p class="text-xs text-slate-500 mt-1.5 italic">
            ${currentDict.grades[state.grade].desc}
          </p>
        </div>

        <!-- 2. Wybór kategorii trudności ortograficznych (Ó/U, RZ/Ż, CH/H) -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">${currentDict.lblCategories}</label>
          <div class="grid grid-cols-3 gap-2">
            ${['u_o', 'rz_z', 'ch_h'].map(catKey => {
              const active = state.categories.includes(catKey);
              return `
                <button
                  type="button"
                  data-cat="${catKey}"
                  class="ortho-cat-btn py-2 px-2 rounded-xl font-bold text-xs sm:text-sm border-2 transition flex items-center justify-center gap-1 ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                  }"
                >
                  ${currentDict.categories[catKey].label}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 3. Filtr typu reguł (Wszystkie / Oboczności i zasady / Do zapamiętania) -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">${currentDict.lblRuleFilter}</label>
          <div class="grid grid-cols-3 gap-2">
            ${['all', 'explainable', 'memory'].map(rfKey => {
              const active = state.ruleFilter === rfKey;
              return `
                <button
                  type="button"
                  data-rule="${rfKey}"
                  class="ortho-rule-btn py-2 px-2 rounded-xl font-bold text-xs border-2 transition ${
                    active
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                  }"
                >
                  ${currentDict.ruleFilters[rfKey].label}
                </button>
              `;
            }).join('')}
          </div>
          <p class="text-xs text-slate-500 mt-1 italic">
            ${currentDict.ruleFilters[state.ruleFilter].desc}
          </p>
        </div>

        <!-- 4. Tryb wyzwania + przełącznik zdania kontekstowego -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/80">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">${currentDict.lblQuizMode}</label>
            <select id="ortho-mode-select" class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              ${['gap', 'word', 'spot'].map(mKey => `
                <option value="${mKey}" ${state.quizMode === mKey ? 'selected' : ''}>
                  ${currentDict.quizModes[mKey].label}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="flex items-end pb-1">
            <label class="inline-flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm font-semibold text-slate-700">
              <input
                id="ortho-context-checkbox"
                type="checkbox"
                ${state.showContextSentence ? 'checked' : ''}
                class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span>${currentDict.lblContextToggle}</span>
            </label>
          </div>
        </div>
      `;

      document.getElementById('ortho-btn-random').addEventListener('click', () => {
        if (callbacks.onQuestionReady) {
          callbacks.onQuestionReady(this.generateQuestion(state.lang, true));
        }
      });

      configContainer.querySelectorAll('.ortho-grade-btn').forEach(btn => {
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

      configContainer.querySelectorAll('.ortho-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const catKey = btn.getAttribute('data-cat');
          if (state.categories.includes(catKey)) {
            if (state.categories.length <= 1) return; // Zawsze min. 1 kategoria aktywna
            state.categories = state.categories.filter(c => c !== catKey);
          } else {
            state.categories = [...state.categories, catKey];
          }
          renderConfigDOM();
          if (callbacks.onManualResetStreak) callbacks.onManualResetStreak(false);
          if (callbacks.onQuestionReady) {
            callbacks.onQuestionReady(this.generateQuestion(state.lang, true));
          }
        });
      });

      configContainer.querySelectorAll('.ortho-rule-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const rfKey = btn.getAttribute('data-rule');
          if (state.ruleFilter === rfKey) return;
          state.ruleFilter = rfKey;
          renderConfigDOM();
          if (callbacks.onManualResetStreak) callbacks.onManualResetStreak(false);
          if (callbacks.onQuestionReady) {
            callbacks.onQuestionReady(this.generateQuestion(state.lang, true));
          }
        });
      });

      const modeSelect = document.getElementById('ortho-mode-select');
      if (modeSelect) {
        modeSelect.addEventListener('change', (e) => {
          state.quizMode = e.target.value;
          if (callbacks.onManualResetStreak) callbacks.onManualResetStreak(false);
          if (callbacks.onQuestionReady) {
            // Przebudowujemy aktualne słówko pod nowy tryb bez konieczności losowania innego
            const item = state.currentQuestion?.item || pickRandomWordItem();
            state.currentQuestion = buildQuestionFromItem(item);
            state.hintVisible = false;
            updateOrthoStageUI(state.lang);
            callbacks.onQuestionReady({
              correctAnswer: state.currentQuestion.correctAnswer,
              options: state.currentQuestion.options
            });
          }
        });
      }

      const contextCheckbox = document.getElementById('ortho-context-checkbox');
      if (contextCheckbox) {
        contextCheckbox.addEventListener('change', (e) => {
          state.showContextSentence = e.target.checked;
          updateOrthoStageUI(state.lang);
        });
      }
    };

    renderConfigDOM();
  },

  generateQuestion(lang, randomize = true) {
    if (lang) state.lang = lang;
    if (randomize || !state.currentQuestion) {
      const item = pickRandomWordItem();
      state.currentQuestion = buildQuestionFromItem(item);
      state.hintVisible = false;
    }

    updateOrthoStageUI(state.lang);

    return {
      correctAnswer: state.currentQuestion.correctAnswer,
      options: state.currentQuestion.options
    };
  },

  refreshLanguage(lang) {
    state.lang = lang;
    const configContainer = document.getElementById('teacher-panel');
    if (configContainer) {
      this.mountConfig(configContainer, state.lang, callbacks);
    }
    updateOrthoStageUI(state.lang);
    if (!state.currentQuestion) {
      return this.generateQuestion(state.lang, true);
    }
    return {
      correctAnswer: state.currentQuestion.correctAnswer,
      options: state.currentQuestion.options
    };
  },

  getRankingPayload() {
    return {
      moduleId: 'orthography',
      mode: state.quizMode,
      meta: {
        grade: state.grade,
        categories: [...state.categories],
        ruleFilter: state.ruleFilter,
        quizMode: state.quizMode
      }
    };
  }
};
