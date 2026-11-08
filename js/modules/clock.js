// ============================================================================
// MODUŁ PRZEDMIOTOWY: ZEGAR (CLOCK MODULE)
// Implementuje standardowy kontrakt modułu edukacyjnego
// ============================================================================

import { i18n } from '../i18n.js';

const state = {
  h: 9,
  m: 15,
  mode: 'digital', // 'digital' | 'words'
  lang: 'pl'
};

let callbacks = {
  onQuestionReady: null,
  onManualResetStreak: null
};

function getDayPeriodInfo(h) {
  if (h >= 5 && h < 12) {
    return { key: 'morning', icon: '🌅', colorClass: 'bg-amber-100 text-amber-800 border-amber-300' };
  } else if (h >= 12 && h < 18) {
    return { key: 'afternoon', icon: '☀️', colorClass: 'bg-sky-100 text-sky-800 border-sky-300' };
  } else if (h >= 18 && h < 22) {
    return { key: 'evening', icon: '🌆', colorClass: 'bg-orange-100 text-orange-800 border-orange-300' };
  } else {
    return { key: 'night', icon: '🌙', colorClass: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
  }
}

function formatDigital(h, m) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}`;
}

function formatWords(h, m, lang) {
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const nextH = (h12 % 12) + 1;

  if (lang === 'en') {
    const nums = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
    if (m === 0) return `${nums[h12]} o'clock`;
    if (m === 15) return `quarter past ${nums[h12]}`;
    if (m === 30) return `half past ${nums[h12]}`;
    if (m === 45) return `quarter to ${nums[nextH]}`;
    if (m < 30) return `${m} past ${nums[h12]}`;
    return `${60 - m} to ${nums[nextH]}`;
  }

  const nom = ['', 'pierwsza', 'druga', 'trzecia', 'czwarta', 'piąta', 'szósta', 'siódma', 'ósma', 'dziewiąta', 'dziesiąta', 'jedenasta', 'dwunasta'];
  const loc = ['', 'pierwszej', 'drugiej', 'trzeciej', 'czwartej', 'piątej', 'szóstej', 'siódmej', 'ósmej', 'dziewiątej', 'dziesiątej', 'jedenastej', 'dwunastej'];

  if (m === 0) return `pełna ${nom[h12]}`;
  if (m === 15) return `kwadrans po ${loc[h12]}`;
  if (m === 30) return `wpół do ${loc[nextH]}`;
  if (m === 45) return `za kwadrans ${nom[nextH]}`;
  if (m < 30) return `${m} min po ${loc[h12]}`;
  return `za ${60 - m} min ${nom[nextH]}`;
}

function formatOption(h, m, lang) {
  const normH = ((h % 24) + 24) % 24;
  const normM = ((m % 60) + 60) % 60;
  return state.mode === 'digital' ? formatDigital(normH, normM) : formatWords(normH, normM, lang);
}

function initClockFace() {
  const marksGroup = document.getElementById('clock-marks');
  const numbersGroup = document.getElementById('clock-numbers');
  if (!marksGroup || !numbersGroup) return;

  marksGroup.innerHTML = '';
  numbersGroup.innerHTML = '';

  for (let i = 0; i < 60; i++) {
    const angle = (i * 6) * (Math.PI / 180);
    const isHour = i % 5 === 0;
    const rOuter = 88;
    const rInner = isHour ? 78 : 83;

    const x1 = 100 + rInner * Math.sin(angle);
    const y1 = 100 - rInner * Math.cos(angle);
    const x2 = 100 + rOuter * Math.sin(angle);
    const y2 = 100 - rOuter * Math.cos(angle);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', isHour ? '#1e293b' : '#94a3b8');
    line.setAttribute('stroke-width', isHour ? '2.5' : '1');
    line.setAttribute('stroke-linecap', 'round');
    marksGroup.appendChild(line);
  }

  for (let num = 1; num <= 12; num++) {
    const angle = (num * 30) * (Math.PI / 180);
    const rText = 64;
    const x = 100 + rText * Math.sin(angle);
    const y = 100 - rText * Math.cos(angle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('fill', '#0f172a');
    text.setAttribute('font-size', '14');
    text.setAttribute('font-weight', '700');
    text.textContent = num;
    numbersGroup.appendChild(text);
  }
}

function updateClockVisuals(lang) {
  const hourHand = document.getElementById('hour-hand');
  const minHand = document.getElementById('minute-hand');
  if (hourHand && minHand) {
    const hourAngle = ((state.h % 12) * 30) + (state.m * 0.5);
    const minAngle = state.m * 6;
    hourHand.setAttribute('transform', `rotate(${hourAngle} 100 100)`);
    minHand.setAttribute('transform', `rotate(${minAngle} 100 100)`);
  }

  const badge = document.getElementById('day-period-badge');
  const iconSpan = document.getElementById('day-period-icon');
  const textSpan = document.getElementById('day-period-text');
  if (badge && iconSpan && textSpan) {
    const periodInfo = getDayPeriodInfo(state.h);
    const dict = i18n[lang].clock;
    badge.className = `inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm sm:text-base shadow-sm border transition-all duration-300 ${periodInfo.colorClass}`;
    iconSpan.textContent = periodInfo.icon;
    textSpan.textContent = dict.periods[periodInfo.key];
  }
}

function buildOptionsForCurrentTime(lang) {
  const correct = formatOption(state.h, state.m, lang);
  const isPM = state.h >= 12;
  const candidates = [];

  // Przeciwny wariant 12h vs 24h (np. 15:15 vs 03:15)
  const oppositeH = (state.h + 12) % 24;
  candidates.push([oppositeH, state.m]);

  // Zamiana wskazówek
  let swappedH = Math.floor(state.m / 5) || 12;
  if (isPM && swappedH < 12) swappedH += 12;
  else if (!isPM && swappedH === 12) swappedH = 0;
  candidates.push([swappedH, (state.h % 12) * 5]);

  // Przesunięcia czasowe
  candidates.push([state.h, (state.m + 5) % 60]);
  candidates.push([state.h, (state.m + 55) % 60]);
  candidates.push([(state.h + 1) % 24, state.m]);
  candidates.push([(state.h + 23) % 24, state.m]);
  candidates.push([state.h, (60 - state.m) % 60]);
  candidates.push([(state.h + 1) % 24, (state.m + 15) % 60]);

  const set = new Set([correct]);
  for (const [ch, cm] of candidates) {
    if (set.size >= 4) break;
    set.add(formatOption(ch, cm, lang));
  }

  while (set.size < 4) {
    let rh = Math.floor(Math.random() * 12);
    if (isPM) rh += 12;
    const rm = Math.floor(Math.random() * 12) * 5;
    set.add(formatOption(rh, rm, lang));
  }

  return {
    correctAnswer: correct,
    options: Array.from(set).sort(() => Math.random() - 0.5)
  };
}

export const clockModule = {
  id: 'clock',

  mountStage(stageContainer, lang) {
    state.lang = lang;
    const dict = i18n[state.lang].clock;
    stageContainer.innerHTML = `
      <!-- Wskaźnik pory dnia nad zegarem -->
      <div class="w-full flex justify-center mb-2">
        <div id="day-period-badge" class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm sm:text-base shadow-sm border transition-all duration-300">
          <span id="day-period-icon">☀️</span>
          <span id="day-period-text"></span>
        </div>
      </div>

      <!-- Tarcza zegara SVG -->
      <div class="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 xl:w-[400px] xl:h-[400px]">
        <svg id="clock-svg" viewBox="0 0 200 200" class="w-full h-full drop-shadow-md">
          <circle cx="100" cy="100" r="95" fill="#ffffff" stroke="#334155" stroke-width="6" />
          <circle cx="100" cy="100" r="88" fill="none" stroke="#e2e8f0" stroke-width="1" />
          
          <g id="clock-marks"></g>
          <g id="clock-numbers"></g>

          <line id="hour-hand" x1="100" y1="100" x2="100" y2="52" stroke="#2563eb" stroke-width="6" stroke-linecap="round" class="hand-transition" transform="rotate(0 100 100)" />
          <line id="minute-hand" x1="100" y1="100" x2="100" y2="28" stroke="#ef4444" stroke-width="4" stroke-linecap="round" class="hand-transition" transform="rotate(0 100 100)" />

          <circle cx="100" cy="100" r="5" fill="#1e293b" />
          <circle cx="100" cy="100" r="2" fill="#f8fafc" />
        </svg>
      </div>

      <div class="flex gap-4 mt-3 text-xs font-medium text-slate-500">
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-blue-600 inline-block"></span> <span id="lbl-hour-hand">${dict.hourHand}</span></span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red-500 inline-block"></span> <span id="lbl-min-hand">${dict.minHand}</span></span>
      </div>
    `;

    initClockFace();
    updateClockVisuals(lang);
  },

  mountConfig(configContainer, lang, hooks) {
    state.lang = lang;
    callbacks = { ...callbacks, ...hooks };
    const dict = i18n[state.lang].clock;

    configContainer.innerHTML = `
      <div class="flex items-center justify-between">
        <h2 id="clock-panel-title" class="font-bold text-slate-700 text-sm uppercase tracking-wider">${dict.panelTitle}</h2>
        <button id="clock-btn-random" type="button" class="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg transition">
          ${dict.randomBtn}
        </button>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label id="clock-lbl-hours" class="block text-xs font-semibold text-slate-500 mb-1">${dict.lblHours}</label>
          <input id="input-hour" type="number" min="0" max="23" value="${state.h}" class="w-full text-center text-xl font-bold bg-white border border-slate-300 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label id="clock-lbl-minutes" class="block text-xs font-semibold text-slate-500 mb-1">${dict.lblMinutes}</label>
          <input id="input-minute" type="number" min="0" max="59" value="${state.m}" class="w-full text-center text-xl font-bold bg-white border border-slate-300 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div class="flex flex-wrap gap-2 items-center justify-between pt-1">
        <select id="mode-select" class="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none">
          <option value="digital" ${state.mode === 'digital' ? 'selected' : ''}>${dict.modeDigital}</option>
          <option value="words" ${state.mode === 'words' ? 'selected' : ''}>${dict.modeWords}</option>
        </select>

        <div class="flex gap-2">
          <button id="clock-btn-apply" type="button" class="bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
            ${dict.btnApply}
          </button>
          <button id="clock-btn-apply-hide" type="button" class="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
            ${dict.btnApplyHide}
          </button>
        </div>
      </div>
    `;

    const applyManual = (hideAfter) => {
      const hVal = parseInt(document.getElementById('input-hour').value, 10);
      const mVal = parseInt(document.getElementById('input-minute').value, 10);
      state.h = isNaN(hVal) ? 0 : Math.min(23, Math.max(0, hVal));
      state.m = isNaN(mVal) ? 0 : Math.min(59, Math.max(0, mVal));
      document.getElementById('input-hour').value = state.h;
      document.getElementById('input-minute').value = state.m;

      updateClockVisuals(state.lang);

      if (callbacks.onManualResetStreak) {
        callbacks.onManualResetStreak(hideAfter);
      }
      if (callbacks.onQuestionReady) {
        callbacks.onQuestionReady(this.generateQuestion(state.lang, false));
      }
    };

    document.getElementById('clock-btn-random').addEventListener('click', () => {
      if (callbacks.onQuestionReady) {
        callbacks.onQuestionReady(this.generateQuestion(state.lang, true));
      }
    });

    document.getElementById('mode-select').addEventListener('change', (e) => {
      state.mode = e.target.value;
      if (callbacks.onQuestionReady) {
        callbacks.onQuestionReady(this.generateQuestion(state.lang, false));
      }
    });

    document.getElementById('clock-btn-apply').addEventListener('click', () => applyManual(false));
    document.getElementById('clock-btn-apply-hide').addEventListener('click', () => applyManual(true));

    ['input-hour', 'input-minute'].forEach(id => {
      const inp = document.getElementById(id);
      if (inp) {
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') applyManual(false);
        });
      }
    });
  },

  generateQuestion(lang, randomize = true) {
    if (lang) state.lang = lang;
    if (randomize) {
      state.h = Math.floor(Math.random() * 24);
      state.m = Math.floor(Math.random() * 12) * 5;
      const inpH = document.getElementById('input-hour');
      const inpM = document.getElementById('input-minute');
      if (inpH) inpH.value = state.h;
      if (inpM) inpM.value = state.m;
    }

    updateClockVisuals(state.lang);
    return buildOptionsForCurrentTime(state.lang);
  },

  refreshLanguage(lang) {
    state.lang = lang;
    const dict = i18n[state.lang].clock;
    const elHourHand = document.getElementById('lbl-hour-hand');
    const elMinHand = document.getElementById('lbl-min-hand');
    if (elHourHand) elHourHand.textContent = dict.hourHand;
    if (elMinHand) elMinHand.textContent = dict.minHand;

    const elPanelTitle = document.getElementById('clock-panel-title');
    const elBtnRandom = document.getElementById('clock-btn-random');
    const elLblHours = document.getElementById('clock-lbl-hours');
    const elLblMinutes = document.getElementById('clock-lbl-minutes');
    const elModeSelect = document.getElementById('mode-select');
    const elBtnApply = document.getElementById('clock-btn-apply');
    const elBtnApplyHide = document.getElementById('clock-btn-apply-hide');

    if (elPanelTitle) elPanelTitle.textContent = dict.panelTitle;
    if (elBtnRandom) elBtnRandom.textContent = dict.randomBtn;
    if (elLblHours) elLblHours.textContent = dict.lblHours;
    if (elLblMinutes) elLblMinutes.textContent = dict.lblMinutes;
    if (elModeSelect && elModeSelect.options.length >= 2) {
      elModeSelect.options[0].textContent = dict.modeDigital;
      elModeSelect.options[1].textContent = dict.modeWords;
    }
    if (elBtnApply) elBtnApply.textContent = dict.btnApply;
    if (elBtnApplyHide) elBtnApplyHide.textContent = dict.btnApplyHide;

    updateClockVisuals(lang);
    return buildOptionsForCurrentTime(lang);
  },

  getRankingPayload() {
    return {
      moduleId: 'clock',
      mode: state.mode,
      meta: { mode: state.mode }
    };
  }
};
