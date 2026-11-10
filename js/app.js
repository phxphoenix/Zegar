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
  sortLeaderboard,
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
  const currentMode = activeMod?.getRankingPayload?.()?.mode;

  if (appState.activeModuleId === 'flags_logos' && (currentMode === 'flags' || currentMode === 'logos')) {
    leaderboardState.activeSubMode = currentMode;
  }

  document.getElementById('score-badge').textContent = `${dict.score}: ${appState.score}`;
  document.getElementById('ranking-btn').textContent = dict.rankingBtn;
  updateRankingModalHeader(appState.lang, appState.activeModuleId, leaderboardState.activeSubMode);
  document.getElementById('player-name-input').placeholder = dict.namePlaceholder;
  document.getElementById('save-score-btn').textContent = leaderboardState.isSavingScore ? dict.savingBtn : dict.saveBtn;
  document.getElementById('ranking-close-btn').textContent = dict.closeBtn;

  // Przycisk zakończenia quizu / pora spać
  const finishBtn = document.getElementById('finish-quiz-btn');
  const headerFinishBtn = document.getElementById('header-finish-btn');
  const tipEl = document.getElementById('finish-quiz-tip');

  if (tipEl) {
    tipEl.textContent = dict.finishQuizTip;
  }

  if (finishBtn) {
    if (appState.score > 0) {
      finishBtn.className = 'w-full sm:w-auto ml-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer';
      finishBtn.innerHTML = `<span>🌙</span><span>${dict.finishQuizBtnActive(appState.score)}</span>`;
    } else {
      finishBtn.className = 'w-full sm:w-auto ml-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition cursor-pointer';
      finishBtn.innerHTML = `<span>🌙</span><span>${dict.finishQuizBtnZero}</span>`;
    }
  }

  if (headerFinishBtn) {
    headerFinishBtn.textContent = dict.headerFinishBtn(appState.score);
  }

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
      const subMode = rankingPayload?.mode || null;
      const latestSectionList = await fetchLeaderboard(appState.lang, appState.activeModuleId, subMode);
      if (qualifiesForTop10(achievedScore, latestSectionList)) {
        leaderboardState.pendingScore = {
          score: achievedScore,
          ...rankingPayload,
          moduleId: appState.activeModuleId
        };
        openRankingModal(appState.lang, true, appState.activeModuleId, subMode);
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

function openGoodnightModal({ score, minScore, diff }) {
  const modal = document.getElementById('goodnight-modal');
  if (!modal) return;
  const dict = i18n[appState.lang];

  document.getElementById('goodnight-title').textContent = dict.finishGoodnightTitle;
  document.getElementById('goodnight-subtitle').innerHTML = dict.finishGoodnightSub(score, minScore, diff);

  document.getElementById('goodnight-score-lbl').textContent = dict.finishYourScoreLbl;
  document.getElementById('goodnight-score-val').textContent = `${score} ${dict.ptsUnit}`;

  document.getElementById('goodnight-top10-lbl').textContent = dict.finishTop10ThresholdLbl;
  document.getElementById('goodnight-top10-val').textContent = `${minScore} ${dict.ptsUnit}`;

  document.getElementById('goodnight-continue-btn').textContent = dict.finishContinueBtn;
  document.getElementById('goodnight-sleep-btn').textContent = dict.finishSleepBtn;
  document.getElementById('goodnight-view-ranking-btn').textContent = dict.finishViewRankingBtn;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeGoodnightModal() {
  const modal = document.getElementById('goodnight-modal');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
}

async function finishCurrentQuiz() {
  clearAutoNext();
  const dict = i18n[appState.lang];
  const feedback = document.getElementById('feedback-box');
  const activeMod = getActiveModule();

  // Przypadek 1: Brak punktów w bieżącej serii
  if (!appState.score || appState.score <= 0) {
    if (feedback) {
      feedback.className = 'mt-4 min-h-[2.5rem] flex items-center justify-center lg:justify-start font-bold text-sm text-indigo-600';
      feedback.textContent = dict.finishQuizHintZero;
    }
    return;
  }

  const finishBtn = document.getElementById('finish-quiz-btn');
  const headerFinishBtn = document.getElementById('header-finish-btn');
  const prevBtnHtml = finishBtn ? finishBtn.innerHTML : '';

  if (finishBtn) {
    finishBtn.disabled = true;
    finishBtn.innerHTML = `<span>⏳</span><span>${dict.loadingRanking || '...'}</span>`;
  }
  if (headerFinishBtn) headerFinishBtn.disabled = true;

  const currentScore = appState.score;
  const rankingPayload = activeMod.getRankingPayload();

  try {
    const subMode = rankingPayload?.mode || null;
    const latestList = await fetchLeaderboard(appState.lang, appState.activeModuleId, subMode);
    const qualifies = qualifiesForTop10(currentScore, latestList);

    if (qualifies) {
      // Zakwalifikowano do Top 10!
      leaderboardState.pendingScore = {
        score: currentScore,
        ...rankingPayload,
        moduleId: appState.activeModuleId,
        isBedtimeFinish: true
      };

      appState.score = 0;
      appState.answered = true;
      updateShellLabels();

      if (feedback) {
        feedback.className = 'mt-4 min-h-[2.5rem] flex items-center justify-center lg:justify-start font-bold text-sm text-emerald-600';
        feedback.textContent = dict.finishSavedFeedback;
      }

      const nextPayload = activeMod.generateQuestion(appState.lang, true);
      applyQuestionPayload(nextPayload);

      openRankingModal(appState.lang, true, appState.activeModuleId, subMode);
    } else {
      // Wynik dodatni, ale nie mieści się jeszcze w Top 10
      const sorted = sortLeaderboard(latestList);
      const minScore = sorted.length >= 10 ? sorted[sorted.length - 1].score : 1;
      const diff = Math.max(1, minScore - currentScore);

      openGoodnightModal({
        score: currentScore,
        minScore,
        diff
      });
    }
  } catch (err) {
    console.error('Błąd podczas sprawdzania kwalifikacji do rankingu:', err);
  } finally {
    if (finishBtn) {
      finishBtn.disabled = false;
      updateShellLabels();
    }
    if (headerFinishBtn) headerFinishBtn.disabled = false;
  }
}

// Inicjalizacja aplikacji i podpięcie zdarzeń globalnych
function initApp() {
  document.getElementById('ranking-btn').addEventListener('click', () => {
    const activeMod = getActiveModule();
    const subMode = activeMod?.getRankingPayload?.()?.mode || null;
    openRankingModal(appState.lang, false, appState.activeModuleId, subMode);
  });

  document.getElementById('lang-btn').addEventListener('click', toggleLang);
  document.getElementById('toggle-panel-btn').addEventListener('click', togglePanel);

  // Akcje zakończenia quizu / pora spać
  document.getElementById('finish-quiz-btn')?.addEventListener('click', finishCurrentQuiz);
  document.getElementById('header-finish-btn')?.addEventListener('click', finishCurrentQuiz);

  // Obsługa modala dobrej nocy
  document.getElementById('goodnight-close-x')?.addEventListener('click', closeGoodnightModal);
  document.getElementById('goodnight-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'goodnight-modal') {
      closeGoodnightModal();
    }
  });

  document.getElementById('goodnight-continue-btn')?.addEventListener('click', closeGoodnightModal);

  document.getElementById('goodnight-sleep-btn')?.addEventListener('click', () => {
    closeGoodnightModal();
    appState.score = 0;
    appState.answered = false;
    clearAutoNext();
    updateShellLabels();

    const activeMod = getActiveModule();
    const nextPayload = activeMod.generateQuestion(appState.lang, true);
    applyQuestionPayload(nextPayload);

    const feedback = document.getElementById('feedback-box');
    const dict = i18n[appState.lang];
    if (feedback) {
      feedback.className = 'mt-4 min-h-[2.5rem] flex items-center justify-center lg:justify-start font-bold text-sm text-indigo-600';
      feedback.textContent = dict.finishSleepFeedback;
    }
  });

  document.getElementById('goodnight-view-ranking-btn')?.addEventListener('click', () => {
    closeGoodnightModal();
    openRankingModal(appState.lang, false, appState.activeModuleId);
  });

  // Obsługa modala rankingu
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
    if (e.key === 'Escape') {
      if (!document.getElementById('goodnight-modal').classList.contains('hidden')) {
        closeGoodnightModal();
      } else if (!document.getElementById('ranking-modal').classList.contains('hidden')) {
        closeRankingModal();
      }
    }
  });

  switchModule('clock');
  fetchLeaderboard(appState.lang, appState.activeModuleId);
}

initApp();
