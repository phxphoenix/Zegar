// ============================================================================
// WSPÓLNY MODUŁ RANKINGU TOP 10 (FIREBASE REST API + LOCALSTORAGE FALLBACK)
// Obsługuje wszystkie moduły przedmiotowe oraz zachowuje kompatybilność wsteczną
// ============================================================================

import { i18n } from './i18n.js';

const FIREBASE_DB_URL = 'https://zegar-eda05-default-rtdb.europe-west1.firebasedatabase.app';
const LOCAL_STORAGE_CACHE_KEY = 'zegar_leaderboard_top10_v1';
const LOCAL_STORAGE_NAME_KEY = 'zegar_last_player_name_v1';

const OP_ICONS = {
  add: '➕',
  sub: '➖',
  mul: '✖️',
  div: '➗'
};

export const leaderboardState = {
  list: [],
  pendingScore: null, // { score: number, moduleId: string, mode: string, meta: object }
  lastSavedId: null,
  isSavingScore: false
};

function getFirebaseEndpoint() {
  const trimmed = (FIREBASE_DB_URL || '').trim().replace(/\/+$/, '');
  if (!trimmed) return null;
  return `${trimmed}/leaderboard.json`;
}

function loadLocalCache() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sortLeaderboard(parsed) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalCache(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(list));
  } catch (e) {
    // Ignoruj błędy przepełnienia/prywatności localStorage
  }
}

export function sortLeaderboard(list) {
  return (list || [])
    .filter(item => item && typeof item.score === 'number' && item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 10);
}

export function qualifiesForTop10(score, list) {
  if (!score || score <= 0) return false;
  const sorted = sortLeaderboard(list);
  if (sorted.length < 10) return true;
  return score >= sorted[sorted.length - 1].score;
}

export async function fetchLeaderboard(lang = 'pl') {
  const endpoint = getFirebaseEndpoint();
  const dict = i18n[lang];
  const statusEl = document.getElementById('ranking-sync-status');

  if (!endpoint) {
    leaderboardState.list = loadLocalCache();
    if (statusEl) statusEl.textContent = dict.syncLocalFallback;
    return leaderboardState.list;
  }

  try {
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rawList = Array.isArray(data) ? data : Object.values(data || {});
    const sorted = sortLeaderboard(rawList);
    leaderboardState.list = sorted;
    saveLocalCache(sorted);
    if (statusEl) statusEl.textContent = dict.syncCloudOk;
    return sorted;
  } catch (err) {
    console.warn('Firebase fetch fallback to local cache:', err);
    leaderboardState.list = loadLocalCache();
    if (statusEl) statusEl.textContent = dict.syncCloudError;
    return leaderboardState.list;
  }
}

async function saveEntryToLeaderboard(newEntry, lang) {
  const endpoint = getFirebaseEndpoint();
  const currentList = await fetchLeaderboard(lang);
  const updated = sortLeaderboard([newEntry, ...currentList]);
  leaderboardState.list = updated;
  saveLocalCache(updated);

  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error('Failed to save leaderboard to Firebase:', err);
    }
  }
  return updated;
}

function formatShortDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function formatEntryBadge(entry, dict) {
  const moduleId = entry.moduleId || (entry.mode === 'math' ? 'math' : 'clock');

  if (moduleId === 'math') {
    const grade = entry.meta?.grade || 1;
    const ops = Array.isArray(entry.meta?.ops) && entry.meta.ops.length > 0
      ? entry.meta.ops
      : ['add', 'sub'];
    const icons = ops.map(op => OP_ICONS[op] || '').join('');
    return {
      text: `${dict.badges.mathPrefix} • ${dict.badges.gradeShort(grade)} ${icons}`,
      className: 'bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold'
    };
  }

  if (entry.meta?.customBadge) {
    return {
      text: entry.meta.customBadge,
      className: 'bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-semibold'
    };
  }

  // Domyślnie: Zegar (w tym wpisy historyczne bez pola moduleId)
  const clockMode = entry.meta?.mode || entry.mode;
  return {
    text: clockMode === 'words' ? dict.badges.clockWords : dict.badges.clockDigital,
    className: 'bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md font-semibold'
  };
}

export function renderRankingList(lang = 'pl') {
  const container = document.getElementById('ranking-list-container');
  if (!container) return;
  const dict = i18n[lang];
  container.innerHTML = '';

  if (!leaderboardState.list || leaderboardState.list.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'text-center py-10 text-slate-400 font-medium text-sm';
    emptyDiv.textContent = dict.emptyRanking;
    container.appendChild(emptyDiv);
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];

  leaderboardState.list.forEach((entry, idx) => {
    const isJustSaved = leaderboardState.lastSavedId && entry.id === leaderboardState.lastSavedId;
    const row = document.createElement('div');
    row.className = `flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl border transition ${
      isJustSaved
        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
        : idx < 3
        ? 'bg-slate-50 border-slate-200'
        : 'bg-white border-slate-100'
    }`;

    const left = document.createElement('div');
    left.className = 'flex items-center gap-3 min-w-0';

    const posBadge = document.createElement('span');
    posBadge.className = 'w-7 text-center font-extrabold text-base shrink-0';
    posBadge.textContent = idx < 3 ? medals[idx] : `${idx + 1}.`;

    const infoCol = document.createElement('div');
    infoCol.className = 'min-w-0';

    const nameEl = document.createElement('div');
    nameEl.className = 'font-bold text-slate-800 text-sm sm:text-base truncate';
    nameEl.textContent = entry.name || dict.defaultPlayerName;

    const metaEl = document.createElement('div');
    metaEl.className = 'flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5';

    const badgeInfo = formatEntryBadge(entry, dict);
    const modeSpan = document.createElement('span');
    modeSpan.className = badgeInfo.className;
    modeSpan.textContent = badgeInfo.text;

    const dateSpan = document.createElement('span');
    dateSpan.textContent = formatShortDate(entry.date);

    metaEl.appendChild(modeSpan);
    if (dateSpan.textContent) metaEl.appendChild(dateSpan);

    infoCol.appendChild(nameEl);
    infoCol.appendChild(metaEl);

    left.appendChild(posBadge);
    left.appendChild(infoCol);

    const scoreBadge = document.createElement('span');
    scoreBadge.className = 'bg-indigo-100 text-indigo-700 font-extrabold px-3 py-1 rounded-full text-sm shrink-0';
    scoreBadge.textContent = `${entry.score} ${dict.ptsUnit}`;

    row.appendChild(left);
    row.appendChild(scoreBadge);
    container.appendChild(row);
  });
}

export async function openRankingModal(lang = 'pl', withNewScoreForm = false) {
  const modal = document.getElementById('ranking-modal');
  const formSection = document.getElementById('new-score-section');
  const nameInput = document.getElementById('player-name-input');
  const newScoreMsg = document.getElementById('new-score-msg');
  const container = document.getElementById('ranking-list-container');
  const dict = i18n[lang];

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  if (withNewScoreForm && leaderboardState.pendingScore) {
    formSection.classList.remove('hidden');
    newScoreMsg.textContent = dict.newRecordMsg(leaderboardState.pendingScore.score);
    try {
      nameInput.value = localStorage.getItem(LOCAL_STORAGE_NAME_KEY) || '';
    } catch (e) {
      nameInput.value = '';
    }
    setTimeout(() => nameInput.focus(), 50);
  } else {
    formSection.classList.add('hidden');
  }

  container.innerHTML = `<div class="text-center py-10 text-slate-400 font-medium text-sm">${dict.loadingRanking}</div>`;
  await fetchLeaderboard(lang);
  renderRankingList(lang);
}

export function closeRankingModal() {
  const modal = document.getElementById('ranking-modal');
  modal.classList.remove('flex');
  modal.classList.add('hidden');
  leaderboardState.pendingScore = null;
}

export async function submitTop10Score(lang = 'pl') {
  if (!leaderboardState.pendingScore || leaderboardState.isSavingScore) return;
  const dict = i18n[lang];
  const nameInput = document.getElementById('player-name-input');
  const saveBtn = document.getElementById('save-score-btn');
  const rawName = (nameInput.value || '').trim();
  const playerName = rawName.slice(0, 16) || dict.defaultPlayerName;

  try {
    if (rawName) localStorage.setItem(LOCAL_STORAGE_NAME_KEY, playerName);
  } catch (e) {}

  leaderboardState.isSavingScore = true;
  saveBtn.disabled = true;
  saveBtn.textContent = dict.savingBtn;

  const entryId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const pending = leaderboardState.pendingScore;

  const newEntry = {
    id: entryId,
    name: playerName,
    score: pending.score,
    moduleId: pending.moduleId || 'clock',
    mode: pending.mode || 'digital',
    meta: pending.meta || {},
    date: new Date().toISOString()
  };

  leaderboardState.lastSavedId = entryId;
  await saveEntryToLeaderboard(newEntry, lang);

  leaderboardState.pendingScore = null;
  leaderboardState.isSavingScore = false;
  saveBtn.disabled = false;
  saveBtn.textContent = dict.saveBtn;

  document.getElementById('new-score-section').classList.add('hidden');
  renderRankingList(lang);
}
