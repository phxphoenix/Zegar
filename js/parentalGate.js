// ============================================================================
// BRAMKA RODZICIELSKA (PARENTAL GATE)
// Wymóg zgodności z Apple App Store Kids Category (Guideline 1.3) oraz
// dobrych praktyk Google Play Families Policy przed linkami zewnętrznymi,
// dokumentami prawnymi i przyszłymi zakupami PRO.
// ============================================================================

import { i18n } from './i18n.js';

const gateState = {
  a: 12,
  b: 7,
  answer: 84,
  lang: 'pl',
  onSuccess: null
};

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

export function openParentZoneModal(lang = 'pl') {
  const modal = document.getElementById('parent-zone-modal');
  if (!modal) return;
  const dict = i18n[lang].parentZone;

  const titleEl = document.getElementById('parent-zone-title');
  const subtitleEl = document.getElementById('parent-zone-subtitle');
  const privacyLink = document.getElementById('parent-zone-privacy-link');
  const termsLink = document.getElementById('parent-zone-terms-link');
  const closeBtn = document.getElementById('parent-zone-close-btn');
  const offlineNote = document.getElementById('parent-zone-offline-note');

  if (titleEl) titleEl.textContent = dict.title;
  if (subtitleEl) subtitleEl.textContent = dict.subtitle;
  if (privacyLink) privacyLink.textContent = dict.privacyLink;
  if (termsLink) termsLink.textContent = dict.termsLink;
  if (closeBtn) closeBtn.textContent = i18n[lang].closeBtn;
  if (offlineNote) offlineNote.textContent = dict.offlineNote;

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

export function getCurrentGateAnswerForTest() {
  return gateState.answer;
}
