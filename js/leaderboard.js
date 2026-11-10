// ============================================================================
// MODUŁ RANKINGU TOP 10 PER SEKCJA (FIREBASE REST API + LOCALSTORAGE FALLBACK)
// Każdy moduł przedmiotowy (Zegar, Matematyka, Ortografia, ...) posiada własną
// niezależną listę Top 10. Zawiera automatyczną migrację ze wspólnej tablicy v1.
// ============================================================================

import { i18n } from './i18n.js';

const FIREBASE_DB_URL = 'https://zegar-eda05-default-rtdb.europe-west1.firebasedatabase.app';
const LEGACY_LOCAL_STORAGE_KEY = 'zegar_leaderboard_top10_v1';
const LOCAL_STORAGE_BY_MODULE_KEY = 'zegar_leaderboards_by_module_v2';
const LOCAL_STORAGE_NAME_KEY = 'zegar_last_player_name_v1';

const OP_ICONS = {
  add: '➕',
  sub: '➖',
  mul: '✖️',
  div: '➗'
};

const ORTHO_CAT_SHORT = {
  u_o: 'Ó/U',
  rz_z: 'RZ/Ż',
  ch_h: 'CH/H'
};

export const leaderboardState = {
  activeModuleId: 'clock',
  activeSubMode: 'flags', // 'flags' | 'logos' (dla modułu flags_logos)
  byModule: {}, // { clock: [...], math: [...], orthography: [...], flags_logos_flags: [...], flags_logos_logos: [...] }
  list: [],     // Aktualnie wyświetlana lista Top 10 dla aktywnego modułu/podtrybu
  pendingScore: null, // { score: number, moduleId: string, mode: string, meta: object }
  lastSavedId: null,
  isSavingScore: false
};

function getFirebaseBaseUrl() {
  const trimmed = (FIREBASE_DB_URL || '').trim().replace(/\/+$/, '');
  return trimmed || null;
}

function getFirebaseRootEndpoint() {
  const base = getFirebaseBaseUrl();
  return base ? `${base}/leaderboard.json` : null;
}

function getFirebaseModuleEndpoint(bucketKey) {
  const base = getFirebaseBaseUrl();
  return base ? `${base}/leaderboard/${encodeURIComponent(bucketKey)}.json` : null;
}

export function resolveEntryModuleId(entry) {
  if (!entry || typeof entry !== 'object') return 'clock';
  if (entry.moduleId === 'flags_logos_flags' || entry.moduleId === 'flags_logos_logos') {
    return 'flags_logos';
  }
  if (entry.moduleId) return entry.moduleId;
  if (entry.mode === 'math') return 'math';
  if (entry.mode === 'gap' || entry.mode === 'word' || entry.mode === 'spot' || entry.mode === 'orthography') {
    return 'orthography';
  }
  if (entry.mode === 'flags' || entry.mode === 'logos') {
    return 'flags_logos';
  }
  return 'clock';
}

export function resolveStorageBucketKey(moduleId, subMode = null) {
  const modId = moduleId || leaderboardState.activeModuleId || 'clock';
  if (modId === 'flags_logos_flags' || modId === 'flags_logos_logos') {
    return modId;
  }
  if (modId === 'flags_logos') {
    const effectiveSub = subMode || leaderboardState.activeSubMode || 'flags';
    return effectiveSub === 'logos' ? 'flags_logos_logos' : 'flags_logos_flags';
  }
  return modId;
}

function normalizeEntry(entry, forcedBucketOrModuleId = null) {
  if (!entry || typeof entry !== 'object') return null;
  let moduleId = resolveEntryModuleId(entry);
  let forcedSubMode = null;

  if (forcedBucketOrModuleId === 'flags_logos_flags') {
    moduleId = 'flags_logos';
    forcedSubMode = 'flags';
  } else if (forcedBucketOrModuleId === 'flags_logos_logos') {
    moduleId = 'flags_logos';
    forcedSubMode = 'logos';
  } else if (forcedBucketOrModuleId) {
    moduleId = forcedBucketOrModuleId;
  }

  const defaultMode =
    moduleId === 'math'
      ? 'math'
      : moduleId === 'orthography'
      ? 'gap'
      : moduleId === 'flags_logos'
      ? forcedSubMode || entry.meta?.quizType || 'flags'
      : 'digital';

  const mode = forcedSubMode || entry.mode || defaultMode;
  const meta = entry.meta && typeof entry.meta === 'object' ? { ...entry.meta } : {};

  if (moduleId === 'clock' && !meta.mode) {
    meta.mode = mode === 'words' ? 'words' : 'digital';
  }
  if (moduleId === 'flags_logos' && !meta.quizType) {
    meta.quizType = mode === 'logos' ? 'logos' : 'flags';
  }

  return {
    ...entry,
    moduleId,
    mode,
    meta
  };
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

function isLegacyFlatPayload(data) {
  if (!data) return false;
  if (Array.isArray(data)) {
    return data.some(item => item && typeof item === 'object' && typeof item.score === 'number');
  }
  if (typeof data === 'object') {
    const values = Object.values(data);
    return values.length > 0 && values.some(item => item && typeof item === 'object' && typeof item.score === 'number');
  }
  return false;
}

function splitFlatListByModule(flatList) {
  const grouped = {};
  const seenIds = new Set();

  (flatList || []).forEach(rawItem => {
    if (!rawItem || typeof rawItem.score !== 'number' || rawItem.score <= 0) return;
    const dedupKey = rawItem.id || `${rawItem.name}_${rawItem.score}_${rawItem.date}`;
    if (seenIds.has(dedupKey)) return;
    seenIds.add(dedupKey);

    const normalized = normalizeEntry(rawItem);
    const modId = normalized.moduleId;
    const bucketKey =
      modId === 'flags_logos'
        ? resolveStorageBucketKey('flags_logos', normalized.mode)
        : modId;
    if (!grouped[bucketKey]) grouped[bucketKey] = [];
    grouped[bucketKey].push(normalized);
  });

  Object.keys(grouped).forEach(modId => {
    grouped[modId] = sortLeaderboard(grouped[modId]);
  });

  return grouped;
}

function normalizePerModuleMap(rawMap) {
  const result = {};
  if (!rawMap || typeof rawMap !== 'object') return result;

  Object.entries(rawMap).forEach(([modId, rawModList]) => {
    const arr = Array.isArray(rawModList)
      ? rawModList
      : rawModList && typeof rawModList === 'object'
      ? Object.values(rawModList)
      : [];
    const normalizedArr = arr
      .map(item => normalizeEntry(item, modId))
      .filter(Boolean);

    if (modId === 'flags_logos') {
      const flagsArr = normalizedArr.filter(it => it.mode !== 'logos');
      const logosArr = normalizedArr.filter(it => it.mode === 'logos');
      if (flagsArr.length > 0) {
        result.flags_logos_flags = sortLeaderboard([
          ...(result.flags_logos_flags || []),
          ...flagsArr
        ]);
      }
      if (logosArr.length > 0) {
        result.flags_logos_logos = sortLeaderboard([
          ...(result.flags_logos_logos || []),
          ...logosArr
        ]);
      }
    } else {
      result[modId] = sortLeaderboard([...(result[modId] || []), ...normalizedArr]);
    }
  });

  return result;
}

function loadLegacyLocalFlatList() {
  try {
    const raw = localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function loadLocalCacheAll() {
  try {
    const rawV2 = localStorage.getItem(LOCAL_STORAGE_BY_MODULE_KEY);
    if (rawV2) {
      const parsedV2 = JSON.parse(rawV2);
      if (parsedV2 && typeof parsedV2 === 'object' && !Array.isArray(parsedV2)) {
        return normalizePerModuleMap(parsedV2);
      }
    }

    // Automatyczna migracja lokalnego cache v1 -> v2 (podział na moduły)
    const legacyFlat = loadLegacyLocalFlatList();
    if (legacyFlat.length > 0) {
      const migrated = splitFlatListByModule(legacyFlat);
      saveLocalCacheAll(migrated);
      return migrated;
    }
  } catch (e) {
    // Ignoruj błędy dostępu do localStorage
  }
  return {};
}

function saveLocalCacheAll(byModuleMap) {
  try {
    localStorage.setItem(LOCAL_STORAGE_BY_MODULE_KEY, JSON.stringify(byModuleMap));
  } catch (e) {
    // Ignoruj błędy przepełnienia/prywatności localStorage
  }
}

function syncActiveModuleList(moduleId, subMode = null) {
  let modId = moduleId || leaderboardState.activeModuleId || 'clock';
  if (modId === 'flags_logos_flags') {
    modId = 'flags_logos';
    subMode = 'flags';
  } else if (modId === 'flags_logos_logos') {
    modId = 'flags_logos';
    subMode = 'logos';
  }

  leaderboardState.activeModuleId = modId;
  if (subMode === 'flags' || subMode === 'logos') {
    leaderboardState.activeSubMode = subMode;
  }

  if (modId === 'flags_logos') {
    const effectiveSub = leaderboardState.activeSubMode === 'logos' ? 'logos' : 'flags';
    const bucketKey = resolveStorageBucketKey('flags_logos', effectiveSub);
    const bucketList = leaderboardState.byModule[bucketKey] || [];
    const directShared = (leaderboardState.byModule.flags_logos || []).filter(item =>
      effectiveSub === 'logos' ? item.mode === 'logos' : item.mode !== 'logos'
    );
    leaderboardState.list = sortLeaderboard([...bucketList, ...directShared]);
    return leaderboardState.list;
  }

  leaderboardState.list = leaderboardState.byModule[modId] || [];
  return leaderboardState.list;
}

export function qualifiesForTop10(score, list) {
  if (!score || score <= 0) return false;
  const sorted = sortLeaderboard(list);
  if (sorted.length < 10) return true;
  return score >= sorted[sorted.length - 1].score;
}

export async function fetchLeaderboard(lang = 'pl', moduleId = null, subMode = null) {
  const targetModuleId = moduleId || leaderboardState.activeModuleId || 'clock';
  leaderboardState.activeModuleId = targetModuleId;
  if (subMode === 'flags' || subMode === 'logos') {
    leaderboardState.activeSubMode = subMode;
  }

  const rootEndpoint = getFirebaseRootEndpoint();
  const dict = i18n[lang];
  const statusEl = document.getElementById('ranking-sync-status');

  if (!rootEndpoint) {
    leaderboardState.byModule = loadLocalCacheAll();
    if (statusEl) statusEl.textContent = dict.syncLocalFallback;
    return syncActiveModuleList(targetModuleId, subMode);
  }

  try {
    const res = await fetch(rootEndpoint, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    let byModule = {};

    if (!data) {
      byModule = loadLocalCacheAll();
    } else if (isLegacyFlatPayload(data)) {
      // Automatyczna migracja płaskiej tablicy z chmury (+ ewentualnego cache v1) na podział wg sekcji
      const cloudFlat = Array.isArray(data) ? data : Object.values(data);
      const localLegacy = loadLegacyLocalFlatList();
      byModule = splitFlatListByModule([...cloudFlat, ...localLegacy]);

      // Zapisz zmigrowaną strukturę z powrotem do Firebase, aby każda sekcja miała swój węzeł
      try {
        await fetch(rootEndpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(byModule)
        });
      } catch (migErr) {
        console.warn('Could not persist migrated structure to Firebase:', migErr);
      }
    } else {
      byModule = normalizePerModuleMap(data);
    }

    leaderboardState.byModule = byModule;
    saveLocalCacheAll(byModule);
    if (statusEl) statusEl.textContent = dict.syncCloudOk;
    return syncActiveModuleList(targetModuleId, subMode);
  } catch (err) {
    console.warn('Firebase fetch fallback to local cache:', err);
    leaderboardState.byModule = loadLocalCacheAll();
    if (statusEl) statusEl.textContent = dict.syncCloudError;
    return syncActiveModuleList(targetModuleId, subMode);
  }
}

async function saveEntryToLeaderboard(newEntry, lang) {
  const moduleId = resolveEntryModuleId(newEntry);
  const subMode =
    moduleId === 'flags_logos'
      ? newEntry.mode === 'logos' || newEntry.meta?.quizType === 'logos'
        ? 'logos'
        : 'flags'
      : null;
  const bucketKey = resolveStorageBucketKey(moduleId, subMode);

  const currentModuleList = await fetchLeaderboard(lang, moduleId, subMode);
  const updatedModuleList = sortLeaderboard([
    normalizeEntry(newEntry, bucketKey),
    ...currentModuleList
  ]);

  leaderboardState.byModule[bucketKey] = updatedModuleList;
  syncActiveModuleList(moduleId, subMode);
  saveLocalCacheAll(leaderboardState.byModule);

  const moduleEndpoint = getFirebaseModuleEndpoint(bucketKey);
  if (moduleEndpoint) {
    try {
      const res = await fetch(moduleEndpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedModuleList)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error(`Failed to save ${bucketKey} leaderboard to Firebase:`, err);
    }
  }
  return updatedModuleList;
}

function formatShortDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function formatEntryBadge(entry, dict) {
  const moduleId = resolveEntryModuleId(entry);

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

  if (moduleId === 'orthography') {
    const grade = entry.meta?.grade || 1;
    const cats = Array.isArray(entry.meta?.categories) && entry.meta.categories.length > 0
      ? entry.meta.categories
      : ['u_o', 'rz_z', 'ch_h'];
    const catLabels = cats.map(c => ORTHO_CAT_SHORT[c] || c).join(', ');
    return {
      text: `${dict.badges.orthoPrefix} • ${dict.badges.gradeShort(grade)} (${catLabels})`,
      className: 'bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-semibold'
    };
  }

  if (moduleId === 'flags_logos') {
    const isLogos = entry.mode === 'logos' || entry.meta?.quizType === 'logos';
    const flDict = dict.flags_logos;

    if (isLogos) {
      const cats = Array.isArray(entry.meta?.categories) ? entry.meta.categories : [];
      const catSummary =
        cats.length === 0 || cats.length >= 6
          ? dict.badges.allCategories
          : cats.map(c => flDict?.logoCategories?.[c]?.short || c).join(', ');
      return {
        text: `${dict.badges.logosPrefix} • ${catSummary}`,
        className: 'bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-semibold'
      };
    }

    const conts = Array.isArray(entry.meta?.continents) ? entry.meta.continents : [];
    const contSummary =
      conts.length === 0 || conts.length >= 6
        ? dict.badges.allContinents
        : conts.map(c => flDict?.continents?.[c]?.short || c).join(', ');
    return {
      text: `${dict.badges.flagsPrefix} • ${contSummary}`,
      className: 'bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md font-semibold'
    };
  }

  if (entry.meta?.customBadge) {
    return {
      text: entry.meta.customBadge,
      className: 'bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-semibold'
    };
  }

  // Domyślnie: Zegar
  const clockMode = entry.meta?.mode || entry.mode;
  return {
    text: clockMode === 'words' ? dict.badges.clockWords : dict.badges.clockDigital,
    className: 'bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md font-semibold'
  };
}

export function updateRankingModalHeader(lang = 'pl', moduleId = null, subMode = null) {
  const dict = i18n[lang];
  let modId = moduleId || leaderboardState.activeModuleId || 'clock';
  if (modId === 'flags_logos_flags') {
    modId = 'flags_logos';
    subMode = 'flags';
  } else if (modId === 'flags_logos_logos') {
    modId = 'flags_logos';
    subMode = 'logos';
  }

  let modLabel = dict.modules[modId]?.navLabel || modId;
  if (modId === 'flags_logos') {
    const effectiveSub = subMode || leaderboardState.activeSubMode || 'flags';
    const subLabel =
      dict.flags_logos?.quizTypes?.[effectiveSub]?.short ||
      (effectiveSub === 'logos' ? 'Logo' : 'Flagi');
    modLabel = `${modLabel} (${subLabel})`;
  }

  const titleEl = document.getElementById('ranking-modal-title');
  if (titleEl) {
    titleEl.textContent = dict.rankingTitleForModule
      ? dict.rankingTitleForModule(modLabel)
      : `${dict.rankingTitle} – ${modLabel}`;
  }
}

export function renderRankingList(lang = 'pl', moduleId = null, subMode = null) {
  const container = document.getElementById('ranking-list-container');
  if (!container) return;
  const dict = i18n[lang];
  let targetModuleId = moduleId || leaderboardState.activeModuleId || 'clock';
  if (targetModuleId === 'flags_logos_flags') {
    targetModuleId = 'flags_logos';
    subMode = 'flags';
  } else if (targetModuleId === 'flags_logos_logos') {
    targetModuleId = 'flags_logos';
    subMode = 'logos';
  }

  syncActiveModuleList(targetModuleId, subMode);
  updateRankingModalHeader(lang, targetModuleId, leaderboardState.activeSubMode);

  container.innerHTML = '';

  // Przełącznik podkategorii rankingu dla modułu Flaga/Logo (Flagi vs Logotypy)
  if (targetModuleId === 'flags_logos' && dict.flags_logos) {
    const tabsWrapper = document.createElement('div');
    tabsWrapper.id = 'ranking-submode-tabs';
    tabsWrapper.className = 'grid grid-cols-2 gap-2 mb-3 p-1 bg-slate-100 rounded-2xl';

    ['flags', 'logos'].forEach(modeKey => {
      const isActive = leaderboardState.activeSubMode === modeKey;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-ranking-submode', modeKey);
      btn.className = isActive
        ? 'py-2 px-3 rounded-xl font-extrabold text-xs sm:text-sm bg-indigo-600 text-white shadow-sm transition'
        : 'py-2 px-3 rounded-xl font-bold text-xs sm:text-sm text-slate-600 hover:bg-slate-200/70 transition';
      btn.textContent = dict.flags_logos.quizTypes[modeKey].label;
      btn.addEventListener('click', () => {
        if (leaderboardState.activeSubMode !== modeKey) {
          leaderboardState.activeSubMode = modeKey;
          renderRankingList(lang, 'flags_logos', modeKey);
        }
      });
      tabsWrapper.appendChild(btn);
    });

    container.appendChild(tabsWrapper);
  }

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

export async function openRankingModal(lang = 'pl', withNewScoreForm = false, moduleId = null, subMode = null) {
  const targetModuleId =
    moduleId ||
    leaderboardState.pendingScore?.moduleId ||
    leaderboardState.activeModuleId ||
    'clock';
  leaderboardState.activeModuleId = targetModuleId;

  const targetSubMode =
    subMode ||
    (targetModuleId === 'flags_logos' && leaderboardState.pendingScore?.mode) ||
    leaderboardState.activeSubMode ||
    'flags';
  if (targetModuleId === 'flags_logos') {
    leaderboardState.activeSubMode = targetSubMode === 'logos' ? 'logos' : 'flags';
  }

  const modal = document.getElementById('ranking-modal');
  const formSection = document.getElementById('new-score-section');
  const nameInput = document.getElementById('player-name-input');
  const newScoreMsg = document.getElementById('new-score-msg');
  const container = document.getElementById('ranking-list-container');
  const dict = i18n[lang];

  updateRankingModalHeader(lang, targetModuleId);

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  if (withNewScoreForm && leaderboardState.pendingScore) {
    formSection.classList.remove('hidden');
    if (leaderboardState.pendingScore.isBedtimeFinish && dict.finishRecordBedtimeMsg) {
      newScoreMsg.textContent = dict.finishRecordBedtimeMsg(leaderboardState.pendingScore.score);
    } else {
      newScoreMsg.textContent = dict.newRecordMsg(leaderboardState.pendingScore.score);
    }
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
  await fetchLeaderboard(lang, targetModuleId, leaderboardState.activeSubMode);
  renderRankingList(lang, targetModuleId, leaderboardState.activeSubMode);
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
  const targetModuleId = pending.moduleId || leaderboardState.activeModuleId || 'clock';

  const newEntry = {
    id: entryId,
    name: playerName,
    score: pending.score,
    moduleId: targetModuleId,
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
  renderRankingList(lang, targetModuleId);
}
