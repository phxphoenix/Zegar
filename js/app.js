// ============================================================================
// RDZEŃ APLIKACJI (APP SHELL & QUIZ ENGINE)
// Zarządza nawigacją między modułami, seriami punktowymi, językiem i rankingiem
// ============================================================================

import { i18n } from './i18n.js';
import { MODULES, getModuleById } from './modules/registry.js';
import {
  leaderboardState,
  fetchLeaderboard,
  qualifiesForTop10,
  openRankingModal,
  closeRankingModal,
  submitTop10Score,
  renderRankingList,
  updateRankingModalHeader
} from './leaderboard.js';

const appState = {
  activeModuleId: 'clock',
  lang: 'pl',
  panelVisible: false,
  score: 0,
  answered: false,
  options: [],
  correctAnswer: '',
  autoNextTimeout: null
};

function clearAutoNext() {
  if (appState.autoNextTimeout) {
    clearTimeout(appState.autoNextTimeout);
    appState.autoNextTimeout = null;
  }
}

function getActiveModule() {
  return getModuleById(appState.activeModuleId);
}

// Renderowanie zakładek wyboru przedmiotu w górnym pasku
function renderModuleTabs() {
  const navContainer = document.getElementById('module-tabs');
  if (!navContainer) return;
  const dict = i18n[appState.lang];
  navContainer.innerHTML = '';

  MODULES.forEach((mod) => {
    const isActive = mod.id === appState.activeModuleId;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = isActive
      ? 'px-4 py-2 rounded-2xl font-extrabold text-sm sm:text-base bg-indigo-600 text-white shadow-sm transition'
      : 'px-4 py-2 rounded-2xl font-bold text-sm sm:text-base bg-slate-100 hover:bg-slate-200 text-slate-700 transition';
    btn.textContent = dict.modules[mod.id]?.navLabel || mod.id;
    btn.addEventListener('click', () => {
      if (appState.activeModuleId !== mod.id) {
        switchModule(mod.id);
      }
    });
    navContainer.appendChild(btn);
  });
}

function updateShellLabels() {
  const dict = i18n[appState.lang];
  const modDict = dict.modules[appState.activeModuleId];
  const activeMod = getActiveModule();

  document.getElementById('score-badge').textContent = `${dict.score}: ${appState.score}`;
  document.getElementById('ranking-btn').textContent = dict.rankingBtn;
  updateRankingModalHeader(appState.lang, appState.activeModuleId);
  document.getElementById('player-name-input').placeholder = dict.namePlaceholder;
  document.getElementById('save-score-btn').textContent = leaderboardState.isSavingScore ? dict.savingBtn : dict.saveBtn;
  document.getElementById('ranking-close-btn').textContent = dict.closeBtn;

  if (leaderboardState.pendingScore) {
    document.getElementById('new-score-msg').textContent = dict.newRecordMsg(leaderboardState.pendingScore.score);
  }

  document.getElementById('lang-btn').textContent = `🌐 ${appState.lang.toUpperCase()}`;

  const toggleBtn = document.getElementById('toggle-panel-btn');
  toggleBtn.textContent = appState.panelVisible ? dict.hidePanel : dict.showPanel;
  toggleBtn.className = appState.panelVisible
    ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold px-3 py-1.5 rounded-xl text-sm transition border border-amber-300'
    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-xl text-sm transition border border-slate-200';

  const questionTitle = document.getElementById('question-title');
  if (questionTitle && modDict) {
    const mode = activeMod?.getRankingPayload?.()?.mode;
    questionTitle.textContent =
      (mode && modDict.questionTitleByMode?.[mode]) || modDict.questionTitle;
  }

  renderModuleTabs();
}

function applyQuestionPayload(payload) {
  clearAutoNext();
  appState.answered = false;
  appState.correctAnswer = payload.correctAnswer;
  appState.options = payload.options;

  const feedback = document.getElementById('feedback-box');
  if (feedback) feedback.textContent = '';

  renderOptions();
}

function renderOptions() {
  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }

  const container = document.getElementById('options-container');
  container.innerHTML = '';

  appState.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn w-full py-3.5 px-4 rounded-2xl border-2 border-slate-200 bg-white font-bold text-slate-700 text-lg transition text-center shadow-sm';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      btn.blur();
      checkAnswer(opt, btn);
    });
    container.appendChild(btn);
  });
}

async function checkAnswer(selected, btnElement) {
  const dict = i18n[appState.lang];
  const feedback = document.getElementById('feedback-box');
  const activeMod = getActiveModule();

  if (selected === appState.correctAnswer) {
    if (!appState.answered) {
      appState.score++;
      appState.answered = true;
    }

    const allBtns = document.querySelectorAll('#options-container button');
    allBtns.forEach(btn => { btn.disabled = true; });

    btnElement.className = 'option-btn w-full py-3.5 px-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 font-bold text-emerald-700 text-lg transition text-center shadow-sm';
    feedback.className = 'mt-4 min-h-[2.5rem] flex items-center justify-center lg:justify-start font-bold text-sm text-emerald-600 animate-pulse';
    feedback.textContent = dict.correct;
    updateShellLabels();

    clearAutoNext();
    appState.autoNextTimeout = setTimeout(() => {
      const nextPayload = activeMod.generateQuestion(appState.lang, true);
      applyQuestionPayload(nextPayload);
    }, 1200);
  } else {
    const achievedScore = !appState.answered ? appState.score : 0;
    const rankingPayload = activeMod.getRankingPayload();

    appState.answered = true;
    appState.score = 0;

    btnElement.className = 'option-btn w-full py-3.5 px-4 rounded-2xl border-2 border-rose-400 bg-rose-50 font-bold text-rose-700 text-lg transition text-center shadow-sm';
    feedback.className = 'mt-4 min-h-[2.5rem] flex items-center justify-center lg:justify-start font-bold text-sm text-rose-600';
    feedback.textContent = achievedScore > 0 ? dict.wrongWithScore(achievedScore) : dict.wrong;
    updateShellLabels();

    if (achievedScore > 0) {
      const latestSectionList = await fetchLeaderboard(appState.lang, appState.activeModuleId);
      if (qualifiesForTop10(achievedScore, latestSectionList)) {
        leaderboardState.pendingScore = {
          score: achievedScore,
          ...rankingPayload,
          moduleId: appState.activeModuleId
        };
        openRankingModal(appState.lang, true, appState.activeModuleId);
      }
    }
  }
}

function switchModule(moduleId) {
  clearAutoNext();
  appState.activeModuleId = moduleId;
  leaderboardState.activeModuleId = moduleId;
  appState.score = 0;

  const activeMod = getActiveModule();
  const stageContainer = document.getElementById('stage-container');
  const configContainer = document.getElementById('teacher-panel');

  activeMod.mountStage(stageContainer, appState.lang);
  activeMod.mountConfig(configContainer, appState.lang, {
    onQuestionReady: (payload) => applyQuestionPayload(payload),
    onManualResetStreak: (hideAfter) => {
      appState.score = 0;
      if (hideAfter && appState.panelVisible) {
        togglePanel();
      } else {
        updateShellLabels();
      }
    }
  });

  updateShellLabels();
  const initialPayload = activeMod.generateQuestion(appState.lang, true);
  applyQuestionPayload(initialPayload);
}

function togglePanel() {
  appState.panelVisible = !appState.panelVisible;
  const panel = document.getElementById('teacher-panel');
  if (appState.panelVisible) {
    panel.classList.remove('hidden');
    panel.classList.add('flex');
  } else {
    panel.classList.remove('flex');
    panel.classList.add('hidden');
  }
  updateShellLabels();
}

function toggleLang() {
  appState.lang = appState.lang === 'pl' ? 'en' : 'pl';
  updateShellLabels();

  const activeMod = getActiveModule();
  const updatedPayload = activeMod.refreshLanguage(appState.lang);
  applyQuestionPayload(updatedPayload);

  if (!document.getElementById('ranking-modal').classList.contains('hidden')) {
    renderRankingList(appState.lang, appState.activeModuleId);
  }
}

// Inicjalizacja aplikacji i podpięcie zdarzeń globalnych
function initApp() {
  document.getElementById('ranking-btn').addEventListener('click', () => {
    openRankingModal(appState.lang, false, appState.activeModuleId);
  });

  document.getElementById('lang-btn').addEventListener('click', toggleLang);
  document.getElementById('toggle-panel-btn').addEventListener('click', togglePanel);

  document.getElementById('ranking-close-x').addEventListener('click', closeRankingModal);
  document.getElementById('ranking-close-btn').addEventListener('click', closeRankingModal);
  document.getElementById('save-score-btn').addEventListener('click', () => {
    submitTop10Score(appState.lang);
  });

  document.getElementById('ranking-modal').addEventListener('click', (e) => {
    if (e.target.id === 'ranking-modal') {
      closeRankingModal();
    }
  });

  document.getElementById('player-name-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitTop10Score(appState.lang);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('ranking-modal').classList.contains('hidden')) {
      closeRankingModal();
    }
  });

  switchModule('clock');
  fetchLeaderboard(appState.lang, appState.activeModuleId);
}

initApp();
