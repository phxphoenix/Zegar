// ============================================================================
// LOKALNY TRACKER POSTĘPÓW I BŁĘDÓW DZIECKA (100% OFFLINE / RODO)
// Przechowuje skuteczność per moduł oraz do 50 najczęstszych/ostatnich błędów
// oddzielnie dla każdego lokalnego profilu dziecka w localStorage.
// ============================================================================

const PROGRESS_STORAGE_KEY = 'zegar_progress_stats_v1';
const MAX_MISTAKES = 50;
const TRACKED_MODULES = ['clock', 'math', 'orthography', 'flags_logos'];

function createEmptyModuleStats() {
  return {
    attempts: 0,
    correct: 0,
    wrong: 0,
    lastPlayedAt: null
  };
}

function createEmptyProfileData() {
  const byModule = {};
  for (const modId of TRACKED_MODULES) {
    byModule[modId] = createEmptyModuleStats();
  }
  return {
    byModule,
    recentMistakes: []
  };
}

function loadAllProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveAllProgress(allData) {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(allData));
  } catch {
    // Ignoruj błędy localStorage
  }
}

function ensureProfileData(allData, profileId = 'default') {
  const pid = profileId || 'default';
  if (!allData[pid] || typeof allData[pid] !== 'object') {
    allData[pid] = createEmptyProfileData();
  }
  if (!allData[pid].byModule || typeof allData[pid].byModule !== 'object') {
    allData[pid].byModule = createEmptyProfileData().byModule;
  }
  for (const modId of TRACKED_MODULES) {
    if (!allData[pid].byModule[modId]) {
      allData[pid].byModule[modId] = createEmptyModuleStats();
    }
  }
  if (!Array.isArray(allData[pid].recentMistakes)) {
    allData[pid].recentMistakes = [];
  }
  return allData[pid];
}

export function recordAnswer({
  profileId = 'default',
  moduleId = 'clock',
  isCorrect = false,
  prompt = '',
  expectedAnswer = '',
  givenAnswer = '',
  meta = {}
} = {}) {
  const allData = loadAllProgress();
  const profileData = ensureProfileData(allData, profileId);
  const modKey = TRACKED_MODULES.includes(moduleId) ? moduleId : 'clock';
  const modStats = profileData.byModule[modKey];
  const now = new Date().toISOString();

  modStats.attempts += 1;
  if (isCorrect) {
    modStats.correct += 1;
  } else {
    modStats.wrong += 1;
    const cleanPrompt = String(prompt || '').trim().slice(0, 120);
    const cleanExpected = String(expectedAnswer || '').trim().slice(0, 80);
    const cleanGiven = String(givenAnswer || '').trim().slice(0, 80);

    if (cleanExpected) {
      const existing = profileData.recentMistakes.find(
        m => m.moduleId === modKey && m.prompt === cleanPrompt && m.expectedAnswer === cleanExpected
      );
      if (existing) {
        existing.count = (Number(existing.count) || 1) + 1;
        existing.givenAnswer = cleanGiven;
        existing.timestamp = now;
      } else {
        profileData.recentMistakes.unshift({
          moduleId: modKey,
          prompt: cleanPrompt,
          expectedAnswer: cleanExpected,
          givenAnswer: cleanGiven,
          meta: meta && typeof meta === 'object' ? meta : {},
          count: 1,
          timestamp: now
        });
      }

      if (profileData.recentMistakes.length > MAX_MISTAKES) {
        profileData.recentMistakes = profileData.recentMistakes.slice(0, MAX_MISTAKES);
      }
    }
  }
  modStats.lastPlayedAt = now;

  saveAllProgress(allData);
  return modStats;
}

export function getProgressSummary(profileId = 'default') {
  const allData = loadAllProgress();
  const profileData = ensureProfileData(allData, profileId);

  let totalAttempts = 0;
  let totalCorrect = 0;
  let totalWrong = 0;
  const byModule = {};

  for (const modId of TRACKED_MODULES) {
    const s = profileData.byModule[modId] || createEmptyModuleStats();
    const attempts = Number(s.attempts) || 0;
    const correct = Number(s.correct) || 0;
    const wrong = Number(s.wrong) || 0;
    const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

    totalAttempts += attempts;
    totalCorrect += correct;
    totalWrong += wrong;

    byModule[modId] = {
      attempts,
      correct,
      wrong,
      accuracy,
      lastPlayedAt: s.lastPlayedAt || null
    };
  }

  return {
    profileId: profileId || 'default',
    totalAttempts,
    totalCorrect,
    totalWrong,
    overallAccuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    byModule
  };
}

export function getTopMistakes(profileId = 'default', moduleId = null, limit = 5) {
  const allData = loadAllProgress();
  const profileData = ensureProfileData(allData, profileId);

  const filtered = moduleId
    ? profileData.recentMistakes.filter(m => m.moduleId === moduleId)
    : [...profileData.recentMistakes];

  return filtered
    .sort((a, b) => {
      const countDiff = (Number(b.count) || 1) - (Number(a.count) || 1);
      if (countDiff !== 0) return countDiff;
      return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
    })
    .slice(0, Math.max(1, Number(limit) || 5));
}

export function resetProgress(profileId = 'default') {
  const allData = loadAllProgress();
  allData[profileId || 'default'] = createEmptyProfileData();
  saveAllProgress(allData);
}
