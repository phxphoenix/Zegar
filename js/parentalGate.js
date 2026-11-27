// ============================================================================
// BRAMKA RODZICIELSKA (PARENTAL GATE), STREFA RODZICA I OFERTA BYSTRZAK PRO
// Wymóg zgodności z Apple App Store Kids Category (Guideline 1.3) oraz
// Google Play Families Policy przed linkami zewnętrznymi, statystykami,
// generatorami kart PDF i ekranem oferty PRO.
// ============================================================================

import { i18n } from './i18n.js';
import {
  isProUser,
  setProStatus,
  recordProInterestClick,
  PRO_WAITLIST_URL
} from './entitlements.js';
import {
  PROFILE_AVATARS,
  getProfiles,
  getActiveProfile,
  setActiveProfile,
  addProfile,
  removeProfile
} from './profiles.js';
import {
  getProgressSummary,
  getTopMistakes,
  resetProgress
} from './progressTracker.js';
import {
  escapeHtml,
  printWorksheet
} from './worksheetGenerator.js';

const gateState = {
  a: 12,
  b: 7,
  answer: 84,
  lang: 'pl',
  onSuccess: null
};

const parentZoneState = {
  lang: 'pl',
  activeTab: 'progress', // 'progress' | 'profiles' | 'worksheets' | 'settings'
  selectedAvatar: PROFILE_AVATARS[0],
  onStateChange: null
};

const proOfferState = {
  lang: 'pl',
  featureKey: 'general'
};

export function setParentZoneChangeListener(fn) {
  parentZoneState.onStateChange = typeof fn === 'function' ? fn : null;
}

export function generateParentalChallenge() {
  // Mnożenie wykraczające poza zakres tabliczki klas 1-3 (np. 12..19 × 6..9)
  const a = 12 + Math.floor(Math.random() * 8); // 12..19
  const b = 6 + Math.floor(Math.random() * 4);  // 6..9
  return { a, b, answer: a * b };
}

export function verifyParentalAnswer(inputValue, expectedAnswer = gateState.answer) {
  const parsed = Number.parseInt(String(inputValue ?? '').trim(), 10);
  return Number.isFinite(parsed) && parsed === expectedAnswer;
}

export function openParentalGate(lang = 'pl', onSuccess = null) {
  gateState.lang = lang;
  gateState.onSuccess = typeof onSuccess === 'function' ? onSuccess : null;

  const challenge = generateParentalChallenge();
  gateState.a = challenge.a;
  gateState.b = challenge.b;
  gateState.answer = challenge.answer;

  const modal = document.getElementById('parental-gate-modal');
  if (!modal) return challenge;

  const dict = i18n[lang].parentalGate;
  const titleEl = document.getElementById('parental-gate-title');
  const descEl = document.getElementById('parental-gate-desc');
  const questionEl = document.getElementById('parental-gate-question');
  const inputEl = document.getElementById('parental-gate-input');
  const errorEl = document.getElementById('parental-gate-error');
  const submitBtn = document.getElementById('parental-gate-submit');
  const cancelBtn = document.getElementById('parental-gate-cancel');

  if (titleEl) titleEl.textContent = dict.title;
  if (descEl) descEl.textContent = dict.desc;
  if (questionEl) questionEl.textContent = `${challenge.a} × ${challenge.b} = ?`;
  if (inputEl) {
    inputEl.value = '';
    inputEl.placeholder = dict.placeholder;
  }
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
  if (submitBtn) submitBtn.textContent = dict.confirmBtn;
  if (cancelBtn) cancelBtn.textContent = dict.cancelBtn;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (inputEl) setTimeout(() => inputEl.focus(), 50);

  return challenge;
}

export function closeParentalGate() {
  const modal = document.getElementById('parental-gate-modal');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
  gateState.onSuccess = null;
}

export function submitParentalGate() {
  const inputEl = document.getElementById('parental-gate-input');
  const errorEl = document.getElementById('parental-gate-error');
  const dict = i18n[gateState.lang].parentalGate;

  if (!inputEl) return false;

  if (verifyParentalAnswer(inputEl.value, gateState.answer)) {
    const callback = gateState.onSuccess;
    closeParentalGate();
    if (callback) callback();
    return true;
  }

  // Błędna odpowiedź — generujemy nowe zadanie, aby uniemożliwić zgadywanie
  const nextChallenge = generateParentalChallenge();
  gateState.a = nextChallenge.a;
  gateState.b = nextChallenge.b;
  gateState.answer = nextChallenge.answer;

  const questionEl = document.getElementById('parental-gate-question');
  if (questionEl) questionEl.textContent = `${nextChallenge.a} × ${nextChallenge.b} = ?`;
  inputEl.value = '';
  if (errorEl) {
    errorEl.textContent = dict.wrongAnswer;
    errorEl.classList.remove('hidden');
  }
  inputEl.focus();
  return false;
}

function renderParentZoneContent() {
  const lang = parentZoneState.lang;
  const fullDict = i18n[lang];
  const dict = fullDict.parentZone;
  const wsDict = fullDict.worksheet;
  const activeProfile = getActiveProfile();
  const pro = isProUser();

  const tabsEl = document.getElementById('parent-zone-tabs');
  const bodyEl = document.getElementById('parent-zone-body');
  if (!tabsEl || !bodyEl) return;

  const tabKeys = ['progress', 'profiles', 'worksheets', 'settings'];
  tabsEl.innerHTML = tabKeys
    .map(key => {
      const isActive = parentZoneState.activeTab === key;
      return `
        <button
          type="button"
          data-pz-tab="${key}"
          class="px-2.5 py-2 rounded-xl text-xs font-bold transition ${
            isActive
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }"
        >
          ${escapeHtml(dict.tabs[key])}
        </button>
      `;
    })
    .join('');

  tabsEl.querySelectorAll('[data-pz-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      parentZoneState.activeTab = btn.getAttribute('data-pz-tab');
      renderParentZoneContent();
    });
  });

  if (parentZoneState.activeTab === 'progress') {
    const summary = getProgressSummary(activeProfile.id);
    const mistakes = getTopMistakes(activeProfile.id, null, 5);
    const modules = ['clock', 'math', 'orthography', 'flags_logos'];

    bodyEl.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-2xl p-3.5">
          <div>
            <div class="text-xs text-indigo-700 font-semibold">${escapeHtml(activeProfile.avatar)} ${escapeHtml(activeProfile.name)} • ${escapeHtml(dict.overallAccuracy)}</div>
            <div class="text-2xl font-extrabold text-indigo-800">${summary.overallAccuracy}%</div>
          </div>
          <div class="text-right text-xs text-slate-600 font-semibold">
            <div>✅ ${summary.totalCorrect} / ${summary.totalAttempts} ${escapeHtml(dict.attemptsUnit)}</div>
            <div>❌ ${summary.totalWrong}</div>
          </div>
        </div>

        ${
          summary.totalAttempts === 0
            ? `<p class="text-xs text-slate-500 text-center py-3 bg-slate-50 rounded-xl border border-slate-100">${escapeHtml(dict.noStatsYet)}</p>`
            : `<div class="space-y-2">
                ${modules
                  .map(modId => {
                    const m = summary.byModule[modId];
                    const modName = fullDict.modules[modId]?.navLabel || modId;
                    return `
                      <div class="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                        <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
                          <span>${escapeHtml(modName)}</span>
                          <span>${m.accuracy}% (${m.correct}/${m.attempts})</span>
                        </div>
                        <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div class="h-full bg-indigo-600 rounded-full" style="width: ${m.accuracy}%"></div>
                        </div>
                      </div>
                    `;
                  })
                  .join('')}
              </div>`
        }

        <div class="pt-1">
          <div class="text-xs font-bold text-slate-700 mb-1.5">${escapeHtml(dict.mistakesTitle)}</div>
          ${
            mistakes.length === 0
              ? `<p class="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">${escapeHtml(dict.noMistakesYet)}</p>`
              : `<div class="space-y-1.5">
                  ${mistakes
                    .map(
                      m => `
                      <div class="flex items-center justify-between gap-2 text-xs bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                        <span class="font-bold text-slate-800 truncate">${escapeHtml(m.prompt || m.expectedAnswer)}</span>
                        <span class="text-emerald-700 font-extrabold shrink-0">→ ${escapeHtml(m.expectedAnswer)} (${m.count}×)</span>
                      </div>
                    `
                    )
                    .join('')}
                </div>`
          }
        </div>

        ${
          summary.totalAttempts > 0
            ? `<button id="pz-reset-stats-btn" type="button" class="w-full text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl py-2 transition">
                ${escapeHtml(dict.resetStatsBtn)}
              </button>`
            : ''
        }
      </div>
    `;

    document.getElementById('pz-reset-stats-btn')?.addEventListener('click', () => {
      resetProgress(activeProfile.id);
      renderParentZoneContent();
    });
    return;
  }

  if (parentZoneState.activeTab === 'profiles') {
    const profiles = getProfiles();
    bodyEl.innerHTML = `
      <div class="space-y-3">
        <p class="text-xs text-slate-600">${escapeHtml(dict.profilesIntro)}</p>
        <div class="space-y-2">
          ${profiles
            .map(p => {
              const isAct = p.id === activeProfile.id;
              return `
                <div class="flex items-center justify-between gap-2 p-2.5 rounded-xl border ${
                  isAct ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200'
                }">
                  <button type="button" data-select-profile="${escapeHtml(p.id)}" class="flex items-center gap-2 text-sm font-bold text-slate-800 flex-1 text-left">
                    <span class="text-xl">${escapeHtml(p.avatar)}</span>
                    <span>${escapeHtml(p.name)}</span>
                    ${
                      isAct
                        ? `<span class="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">${escapeHtml(dict.profileActiveBadge)}</span>`
                        : ''
                    }
                  </button>
                  ${
                    pro && p.id !== 'default'
                      ? `<button type="button" data-delete-profile="${escapeHtml(p.id)}" class="text-xs text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg font-bold">✕</button>`
                      : ''
                  }
                </div>
              `;
            })
            .join('')}
        </div>

        ${
          pro
            ? profiles.length >= 4
              ? `<p class="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-2.5">${escapeHtml(dict.profileLimitNote)}</p>`
              : `<div class="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2.5">
                  <div class="flex flex-wrap gap-1.5">
                    ${PROFILE_AVATARS.map(
                      av => `
                        <button type="button" data-pick-avatar="${av}" class="w-8 h-8 rounded-lg border text-base flex items-center justify-center ${
                          parentZoneState.selectedAvatar === av
                            ? 'bg-indigo-100 border-indigo-500'
                            : 'bg-white border-slate-200'
                        }">${av}</button>
                      `
                    ).join('')}
                  </div>
                  <div class="flex gap-2">
                    <input id="pz-new-profile-name" type="text" maxlength="16" placeholder="${escapeHtml(dict.addProfilePlaceholder)}" class="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800" />
                    <button id="pz-add-profile-btn" type="button" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition">${escapeHtml(dict.addProfileBtn)}</button>
                  </div>
                </div>`
            : `<div class="bg-amber-50 border border-amber-200 rounded-2xl p-3 space-y-2 text-center">
                <p class="text-xs text-amber-900 font-semibold">🔒 ${escapeHtml(dict.profileProLockedNote)}</p>
                <button id="pz-open-pro-from-profiles" type="button" class="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition">${escapeHtml(dict.unlockProBtn)}</button>
              </div>`
        }
      </div>
    `;

    bodyEl.querySelectorAll('[data-select-profile]').forEach(btn => {
      btn.addEventListener('click', () => {
        setActiveProfile(btn.getAttribute('data-select-profile'));
        renderParentZoneContent();
        if (parentZoneState.onStateChange) parentZoneState.onStateChange();
      });
    });

    bodyEl.querySelectorAll('[data-delete-profile]').forEach(btn => {
      btn.addEventListener('click', () => {
        removeProfile(btn.getAttribute('data-delete-profile'));
        renderParentZoneContent();
        if (parentZoneState.onStateChange) parentZoneState.onStateChange();
      });
    });

    bodyEl.querySelectorAll('[data-pick-avatar]').forEach(btn => {
      btn.addEventListener('click', () => {
        parentZoneState.selectedAvatar = btn.getAttribute('data-pick-avatar');
        renderParentZoneContent();
      });
    });

    document.getElementById('pz-add-profile-btn')?.addEventListener('click', () => {
      const inp = document.getElementById('pz-new-profile-name');
      if (!inp) return;
      const res = addProfile(inp.value, parentZoneState.selectedAvatar);
      if (res.ok) {
        renderParentZoneContent();
        if (parentZoneState.onStateChange) parentZoneState.onStateChange();
      }
    });

    document.getElementById('pz-open-pro-from-profiles')?.addEventListener('click', () => {
      closeParentZoneModal();
      openProOfferModal(lang, 'multi_profiles');
    });
    return;
  }

  if (parentZoneState.activeTab === 'worksheets') {
    bodyEl.innerHTML = `
      <div class="space-y-3">
        <div>
          <h4 class="text-sm font-extrabold text-slate-800">${escapeHtml(wsDict.title)}</h4>
          <p class="text-xs text-slate-600 mt-0.5">${escapeHtml(wsDict.desc)}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">${escapeHtml(wsDict.typeLabel)}</label>
            <select id="pz-ws-type" class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700">
              <option value="math">${escapeHtml(wsDict.types.math)}</option>
              <option value="orthography">${escapeHtml(wsDict.types.orthography)}</option>
              <option value="mistakes">${escapeHtml(wsDict.types.mistakes)}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">${escapeHtml(wsDict.gradeLabelSelect)}</label>
            <select id="pz-ws-grade" class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700">
              <option value="1">${escapeHtml(wsDict.gradeLabel(1))}</option>
              <option value="2" ${!pro ? 'disabled' : ''}>${escapeHtml(wsDict.gradeLabel(2))}${!pro ? ' 🔒 PRO' : ''}</option>
              <option value="3" ${!pro ? 'disabled' : ''}>${escapeHtml(wsDict.gradeLabel(3))}${!pro ? ' 🔒 PRO' : ''}</option>
            </select>
          </div>
        </div>

        ${
          !pro
            ? `<div class="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                ${escapeHtml(wsDict.previewLimitNote)}
              </div>`
            : ''
        }

        <button id="pz-print-ws-btn" type="button" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-sm">
          ${escapeHtml(wsDict.printBtn)}
        </button>
      </div>
    `;

    document.getElementById('pz-print-ws-btn')?.addEventListener('click', () => {
      const wsType = document.getElementById('pz-ws-type')?.value || 'math';
      const wsGrade = parseInt(document.getElementById('pz-ws-grade')?.value || '1', 10);
      printWorksheet({
        type: wsType,
        grade: wsGrade,
        profileId: activeProfile.id,
        profileName: activeProfile.name,
        lang
      });
    });
    return;
  }

  // Tab: settings (PRO status + legal links)
  bodyEl.innerHTML = `
    <div class="space-y-3">
      <div class="p-3.5 rounded-2xl border ${
        pro ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'
      } space-y-2.5">
        <div class="text-xs sm:text-sm font-extrabold text-slate-800">
          ${escapeHtml(pro ? dict.proStatusActive : dict.proStatusFree)}
        </div>
        <div class="flex flex-wrap gap-2">
          ${
            !pro
              ? `<button id="pz-open-pro-offer" type="button" class="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition">${escapeHtml(dict.unlockProBtn)}</button>`
              : ''
          }
          <button id="pz-toggle-pro-demo" type="button" class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold px-3 py-2 rounded-xl transition">
            ${escapeHtml(pro ? dict.proDemoToggleOff : dict.proDemoToggleOn)}
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <a id="parent-zone-privacy-link" href="./privacy.html" target="_blank" rel="noopener noreferrer" class="w-full text-center bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm border border-slate-200 transition">
          ${escapeHtml(dict.privacyLink)}
        </a>
        <a id="parent-zone-terms-link" href="./terms.html" target="_blank" rel="noopener noreferrer" class="w-full text-center bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm border border-slate-200 transition">
          ${escapeHtml(dict.termsLink)}
        </a>
      </div>

      <p id="parent-zone-offline-note" class="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 font-medium">
        ${escapeHtml(dict.offlineNote)}
      </p>
    </div>
  `;

  document.getElementById('pz-open-pro-offer')?.addEventListener('click', () => {
    closeParentZoneModal();
    openProOfferModal(lang, 'parent_zone_settings');
  });

  document.getElementById('pz-toggle-pro-demo')?.addEventListener('click', () => {
    setProStatus(!isProUser());
    renderParentZoneContent();
    if (parentZoneState.onStateChange) parentZoneState.onStateChange();
  });
}

export function openParentZoneModal(lang = 'pl', initialTab = 'progress') {
  const modal = document.getElementById('parent-zone-modal');
  if (!modal) return;
  parentZoneState.lang = lang;
  parentZoneState.activeTab = initialTab;

  const dict = i18n[lang].parentZone;
  const titleEl = document.getElementById('parent-zone-title');
  const subtitleEl = document.getElementById('parent-zone-subtitle');
  const closeBtn = document.getElementById('parent-zone-close-btn');

  if (titleEl) titleEl.textContent = dict.title;
  if (subtitleEl) subtitleEl.textContent = dict.subtitle;
  if (closeBtn) closeBtn.textContent = i18n[lang].closeBtn;

  renderParentZoneContent();

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

export function closeParentZoneModal() {
  const modal = document.getElementById('parent-zone-modal');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
}

export function openProOfferModal(lang = 'pl', featureKey = 'general') {
  const modal = document.getElementById('pro-offer-modal');
  if (!modal) return;

  proOfferState.lang = lang;
  proOfferState.featureKey = featureKey;

  const dict = i18n[lang].proOffer;
  const titleEl = document.getElementById('pro-offer-title');
  const subEl = document.getElementById('pro-offer-subtitle');
  const priceEl = document.getElementById('pro-offer-price');
  const freeColTitle = document.getElementById('pro-offer-free-title');
  const proColTitle = document.getElementById('pro-offer-pro-title');
  const freeList = document.getElementById('pro-offer-free-list');
  const proList = document.getElementById('pro-offer-pro-list');
  const ctaBtn = document.getElementById('pro-offer-cta-btn');
  const restoreBtn = document.getElementById('pro-offer-restore-btn');
  const feedbackEl = document.getElementById('pro-offer-feedback');

  if (titleEl) titleEl.textContent = dict.title;
  if (subEl) subEl.textContent = dict.subtitle;
  if (priceEl) priceEl.textContent = dict.priceTag;
  if (freeColTitle) freeColTitle.textContent = dict.freeColTitle;
  if (proColTitle) proColTitle.textContent = dict.proColTitle;
  if (freeList) {
    freeList.innerHTML = dict.freeFeatures
      .map(f => `<li class="flex items-start gap-1.5"><span>•</span><span>${escapeHtml(f)}</span></li>`)
      .join('');
  }
  if (proList) {
    proList.innerHTML = dict.proFeatures
      .map(f => `<li class="flex items-start gap-1.5"><span>✅</span><span>${escapeHtml(f)}</span></li>`)
      .join('');
  }
  if (ctaBtn) ctaBtn.textContent = dict.ctaBtn;
  if (restoreBtn) restoreBtn.textContent = dict.restoreBtn;
  if (feedbackEl) {
    feedbackEl.textContent = '';
    feedbackEl.classList.add('hidden');
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

export function closeProOfferModal() {
  const modal = document.getElementById('pro-offer-modal');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
}

export function handleProOfferCtaClick() {
  recordProInterestClick(proOfferState.featureKey);
  const dict = i18n[proOfferState.lang].proOffer;
  const feedbackEl = document.getElementById('pro-offer-feedback');
  if (feedbackEl) {
    feedbackEl.textContent = dict.fakeDoorThanks;
    feedbackEl.classList.remove('hidden');
  }
  if (PRO_WAITLIST_URL && typeof window !== 'undefined' && typeof window.open === 'function') {
    window.open(PRO_WAITLIST_URL, '_blank', 'noopener,noreferrer');
  }
}

export function handleProRestoreClick() {
  const dict = i18n[proOfferState.lang].proOffer;
  const feedbackEl = document.getElementById('pro-offer-feedback');
  if (feedbackEl) {
    feedbackEl.textContent = dict.restoreInfo;
    feedbackEl.classList.remove('hidden');
  }
}

export function getCurrentGateAnswerForTest() {
  return gateState.answer;
}
