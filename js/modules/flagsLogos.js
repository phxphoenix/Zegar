// ============================================================================
// MODUŁ PRZEDMIOTOWY (GAŁĄŹ BIZNESOWA): FLAGI ŚWIATA (197 KRAJÓW)
// Obsługuje:
// - wielokrotny wybór kontynentów (6 kontynentów, zawsze min. 1 aktywny)
// - lokalne zasoby SVG (./assets/flags/<code>.svg, 100% offline, bez hotlinków)
// - krótkie, charakterystyczne opisy i stolice do podpowiedzi (PL / EN)
// ============================================================================

import { i18n } from '../i18n.js';
import {
  FLAG_CONTINENTS,
  FLAGS_DATA
} from './flagsLogosData.js';

const ALL_CONTINENT_IDS = FLAG_CONTINENTS.map(c => c.id);

const state = {
  quizType: 'flags',
  continents: [...ALL_CONTINENT_IDS], // wielokrotny wybór dla flag
  currentQuestion: null, // { item, optionItems, correctAnswer, options, quizType }
  hintVisible: false,
  recentIds: [],
  lang: 'pl'
};

let callbacks = {
  onQuestionReady: null,
  onManualResetStreak: null
};

const CONTINENT_BADGE_STYLES = {
  europe: 'bg-blue-100 text-blue-800 border-blue-300',
  asia: 'bg-amber-100 text-amber-900 border-amber-300',
  africa: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  north_america: 'bg-rose-100 text-rose-800 border-rose-300',
  south_america: 'bg-teal-100 text-teal-800 border-teal-300',
  oceania: 'bg-purple-100 text-purple-800 border-purple-300'
};

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getItemDisplayName(item, lang) {
  if (!item) return '';
  return lang === 'en' ? (item.nameEn || item.name) : (item.namePl || item.name);
}

export function getFilteredPool() {
  const pool = FLAGS_DATA.filter(item => state.continents.includes(item.continent));
  return pool.length > 0 ? pool : FLAGS_DATA;
}

function pickRandomItem() {
  const pool = getFilteredPool();
  const candidates = pool.filter(item => !state.recentIds.includes(item.id));
  const activePool = candidates.length > 0 ? candidates : pool;
  const chosen = activePool[Math.floor(Math.random() * activePool.length)];

  state.recentIds.push(chosen.id);
  const maxHistory = Math.min(15, Math.max(1, pool.length - 1));
  if (state.recentIds.length > maxHistory) {
    state.recentIds.shift();
  }

  return chosen;
}

function buildQuestionFromItem(item, lang) {
  const pool = getFilteredPool();

  // Preferujemy dystraktory z tego samego kontynentu, aby utrzymać wyzwanie edukacyjne
  const sameGroupPool = pool.filter(
    other => other.id !== item.id && other.continent === item.continent
  );
  const otherFilteredPool = pool.filter(
    other => other.id !== item.id && other.continent !== item.continent
  );
  const fallbackPool = FLAGS_DATA.filter(other => other.id !== item.id);

  const selectedItems = [item];
  const usedNames = new Set([getItemDisplayName(item, lang)]);

  const candidateLists = [
    shuffleArray(sameGroupPool),
    shuffleArray(otherFilteredPool),
    shuffleArray(fallbackPool)
  ];

  for (const list of candidateLists) {
    for (const candidate of list) {
      if (selectedItems.length >= 4) break;
      const candidateName = getItemDisplayName(candidate, lang);
      if (!usedNames.has(candidateName)) {
        usedNames.add(candidateName);
        selectedItems.push(candidate);
      }
    }
    if (selectedItems.length >= 4) break;
  }

  const shuffledItems = shuffleArray(selectedItems.slice(0, 4));
  const correctAnswer = getItemDisplayName(item, lang);
  const options = shuffledItems.map(it => getItemDisplayName(it, lang));

  return {
    item,
    optionItems: shuffledItems,
    quizType: 'flags',
    correctAnswer,
    options
  };
}

function buildHintHTML(item, lang) {
  const dict = i18n[lang].flags_logos;
  const hintText = lang === 'en' ? item.hintEn : item.hintPl;
  const contLabel = dict.continents[item.continent]?.label || item.continent;
  const contBadgeClass = CONTINENT_BADGE_STYLES[item.continent] || CONTINENT_BADGE_STYLES.europe;
  const capital = lang === 'en' ? item.capitalEn : item.capitalPl;

  return `
    <div class="flex flex-wrap items-center justify-center gap-2 mb-2">
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${contBadgeClass}">
        ${contLabel}
      </span>
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-white text-slate-800 border border-amber-300 shadow-sm">
        ${dict.capitalLabel} <strong>${capital}</strong>
      </span>
    </div>
    <div class="text-xs sm:text-sm text-slate-700 leading-relaxed">
      ${hintText}
    </div>
  `;
}

function updateQuestionTitleInShell(lang) {
  const dict = i18n[lang];
  const flModDict = dict.modules.flags_logos;
  const questionTitleEl = document.getElementById('question-title');
  if (questionTitleEl && flModDict) {
    questionTitleEl.textContent =
      flModDict.questionTitleByMode?.flags || flModDict.questionTitle;
  }
}

function updateStageUI(lang) {
  if (!state.currentQuestion) return;
  const dict = i18n[lang].flags_logos;
  const { item } = state.currentQuestion;

  updateQuestionTitleInShell(lang);

  const badge = document.getElementById('fl-context-badge');
  if (badge) {
    const contStyle = CONTINENT_BADGE_STYLES[item.continent] || CONTINENT_BADGE_STYLES.europe;
    const contLabel = dict.continents[item.continent]?.label || item.continent;
    badge.className = `inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm sm:text-base shadow-sm border transition-all duration-300 ${contStyle}`;
    badge.textContent = `${dict.quizTypes.flags.label} • ${contLabel}`;
  }

  const mainBody = document.getElementById('fl-stage-body');
  if (mainBody) {
    mainBody.innerHTML = `
      <div class="w-full flex flex-col items-center justify-center my-2 min-h-[150px] sm:min-h-[180px]">
        <img
          id="fl-flag-img"
          src="${item.flagUrl}"
          alt="Flaga"
          class="max-h-36 sm:max-h-44 max-w-[260px] sm:max-w-[300px] w-auto object-contain rounded-xl shadow-md border-2 border-slate-200 bg-white"
        />
        <div id="fl-flag-fallback" class="hidden text-7xl sm:text-8xl select-none my-2" aria-hidden="true">
          ${item.emoji}
        </div>
      </div>
      <div class="mt-2 text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
        ${dict.flagPrompt}
      </div>
    `;

    const flagImg = document.getElementById('fl-flag-img');
    const flagFallback = document.getElementById('fl-flag-fallback');
    if (flagImg && flagFallback) {
      flagImg.addEventListener('error', () => {
        flagImg.classList.add('hidden');
        flagFallback.classList.remove('hidden');
      });
    }
  }

  const hintBtn = document.getElementById('fl-hint-btn');
  const hintBox = document.getElementById('fl-hint-box');
  const hintContent = document.getElementById('fl-hint-content');

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

export const flagsLogosModule = {
  id: 'flags_logos',

  mountStage(stageContainer, lang) {
    state.lang = lang;
    const dict = i18n[state.lang].flags_logos;

    stageContainer.innerHTML = `
      <!-- Odznaka kontynentu -->
      <div class="w-full flex justify-center mb-3">
        <div id="fl-context-badge" class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm sm:text-base shadow-sm border transition-all duration-300"></div>
      </div>

      <!-- Karta główna zadania Flagi Świata -->
      <div class="w-full max-w-md min-h-[260px] sm:min-h-[300px] bg-gradient-to-br from-sky-50/70 via-white to-indigo-50/60 border-4 border-slate-800 rounded-3xl shadow-md flex flex-col items-center justify-center p-5 sm:p-6 text-center relative">
        <div id="fl-stage-body" class="flex flex-col items-center justify-center w-full"></div>

        <!-- Przycisk podpowiedzi z opisem charakterystycznym -->
        <button
          id="fl-hint-btn"
          type="button"
          class="mt-4 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm px-4 py-2 rounded-full transition shadow-sm"
        >
          ${dict.showHintBtn}
        </button>

        <!-- Rozwijana sekcja z charakterystycznym opisem kraju -->
        <div id="fl-hint-box" class="hidden mt-3.5 w-full bg-amber-50/95 border border-amber-200 rounded-2xl p-3.5 text-center shadow-sm">
          <div id="fl-hint-content"></div>
        </div>
      </div>
    `;

    const hintBtn = document.getElementById('fl-hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        state.hintVisible = !state.hintVisible;
        updateStageUI(state.lang);
      });
    }

    updateStageUI(state.lang);
  },

  mountConfig(configContainer, lang, hooks) {
    state.lang = lang;
    callbacks = { ...callbacks, ...hooks };

    const renderConfigDOM = () => {
      const currentDict = i18n[state.lang].flags_logos;
      const poolCount = getFilteredPool().length;

      configContainer.innerHTML = `
        <div class="flex items-center justify-between">
          <h2 id="fl-panel-title" class="font-bold text-slate-700 text-sm uppercase tracking-wider">
            ${currentDict.panelTitle}
            <span class="ml-1 text-xs font-semibold text-slate-400">(${poolCount})</span>
          </h2>
          <button id="fl-btn-random" type="button" class="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg transition">
            ${currentDict.randomBtn}
          </button>
        </div>

        <p class="text-xs text-slate-500 italic">
          ${currentDict.quizTypes.flags.desc}
        </p>

        <!-- Podział na kontynenty (wielokrotny wybór) -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-semibold text-slate-500">${currentDict.lblContinents}</label>
            ${
              state.continents.length < ALL_CONTINENT_IDS.length
                ? `<button id="fl-select-all-continents" type="button" class="text-xs font-bold text-indigo-600 hover:underline">${currentDict.selectAllBtn}</button>`
                : ''
            }
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${ALL_CONTINENT_IDS.map(contKey => {
              const active = state.continents.includes(contKey);
              return `
                <button
                  type="button"
                  data-continent="${contKey}"
                  class="fl-continent-btn py-2 px-2.5 rounded-xl font-bold text-xs border-2 transition flex items-center justify-center gap-1 ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                  }"
                >
                  ${currentDict.continents[contKey].label}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;

      document.getElementById('fl-btn-random')?.addEventListener('click', () => {
        const nextQ = this.generateQuestion(state.lang, true);
        if (callbacks.onQuestionReady) {
          callbacks.onQuestionReady(nextQ);
        }
      });

      configContainer.querySelectorAll('.fl-continent-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const contKey = btn.getAttribute('data-continent');
          if (state.continents.includes(contKey)) {
            if (state.continents.length <= 1) return; // Zawsze min. 1 kontynent aktywny
            state.continents = state.continents.filter(c => c !== contKey);
          } else {
            state.continents = [...state.continents, contKey];
          }
          renderConfigDOM();
          if (callbacks.onManualResetStreak) callbacks.onManualResetStreak(false);
          const nextQ = this.generateQuestion(state.lang, true);
          if (callbacks.onQuestionReady) {
            callbacks.onQuestionReady(nextQ);
          }
        });
      });

      document.getElementById('fl-select-all-continents')?.addEventListener('click', () => {
        state.continents = [...ALL_CONTINENT_IDS];
        renderConfigDOM();
        if (callbacks.onManualResetStreak) callbacks.onManualResetStreak(false);
        const nextQ = this.generateQuestion(state.lang, true);
        if (callbacks.onQuestionReady) {
          callbacks.onQuestionReady(nextQ);
        }
      });
    };

    renderConfigDOM();
  },

  generateQuestion(lang, randomize = true) {
    if (lang) state.lang = lang;
    if (randomize || !state.currentQuestion) {
      const item = pickRandomItem();
      state.currentQuestion = buildQuestionFromItem(item, state.lang);
      state.hintVisible = false;
    }

    updateStageUI(state.lang);

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

    if (!state.currentQuestion) {
      return this.generateQuestion(state.lang, true);
    }

    // Przetłumacz aktualne opcje bez zmiany wylosowanego kraju
    state.currentQuestion.correctAnswer = getItemDisplayName(state.currentQuestion.item, state.lang);
    state.currentQuestion.options = state.currentQuestion.optionItems.map(it =>
      getItemDisplayName(it, state.lang)
    );

    updateStageUI(state.lang);

    return {
      correctAnswer: state.currentQuestion.correctAnswer,
      options: state.currentQuestion.options
    };
  },

  getRankingPayload() {
    return {
      moduleId: 'flags_logos',
      mode: 'flags',
      meta: {
        quizType: 'flags',
        continents: [...state.continents]
      }
    };
  }
};
