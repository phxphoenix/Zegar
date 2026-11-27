import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTestDOM } from './helpers/dom.js';
import {
  generateParentalChallenge,
  verifyParentalAnswer,
  openParentalGate,
  submitParentalGate,
  openParentZoneModal,
  closeParentZoneModal,
  getCurrentGateAnswerForTest
} from '../js/parentalGate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

describe('parentalGate & zgodność biznesowa (Sprint 1)', () => {
  beforeEach(() => {
    createTestDOM();
  });

  it('generuje zadanie wykraczające poza zakres tabliczki klas 1-3', () => {
    for (let i = 0; i < 20; i++) {
      const ch = generateParentalChallenge();
      assert.ok(ch.a >= 12 && ch.a <= 19);
      assert.ok(ch.b >= 6 && ch.b <= 9);
      assert.strictEqual(ch.answer, ch.a * ch.b);
      assert.strictEqual(verifyParentalAnswer(String(ch.answer), ch.answer), true);
      assert.strictEqual(verifyParentalAnswer(String(ch.answer + 1), ch.answer), false);
    }
  });

  it('blokuje błędną odpowiedź i otwiera Strefę Rodzica po poprawnej weryfikacji', () => {
    let unlocked = false;
    openParentalGate('pl', () => {
      unlocked = true;
      openParentZoneModal('pl');
    });

    const gateModal = document.getElementById('parental-gate-modal');
    const zoneModal = document.getElementById('parent-zone-modal');
    const input = document.getElementById('parental-gate-input');
    const errorEl = document.getElementById('parental-gate-error');

    assert.ok(!gateModal.classList.contains('hidden'), 'Bramka Rodzicielska powinna być otwarta');

    // Błędna odpowiedź
    input.value = '1';
    assert.strictEqual(submitParentalGate(), false);
    assert.strictEqual(unlocked, false);
    assert.ok(!errorEl.classList.contains('hidden'), 'Powinien pojawić się komunikat błędu');

    // Poprawna odpowiedź dla nowego zadania
    const expected = getCurrentGateAnswerForTest();
    input.value = String(expected);
    assert.strictEqual(submitParentalGate(), true);
    assert.strictEqual(unlocked, true);
    assert.ok(gateModal.classList.contains('hidden'), 'Bramka powinna się zamknąć po sukcesie');
    assert.ok(!zoneModal.classList.contains('hidden'), 'Strefa Rodzica powinna się otworzyć');

    closeParentZoneModal();
    assert.ok(zoneModal.classList.contains('hidden'));
  });

  it('spełnia wymogi higieny offline i dokumentów prawnych (brak Tailwind CDN, obecność CSS/RODO/Regulaminu)', () => {
    const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    assert.ok(!indexHtml.includes('cdn.tailwindcss.com'), 'index.html nie może ładować Tailwind Play CDN');
    assert.ok(indexHtml.includes('./css/styles.css'), 'index.html musi ładować lokalny plik ./css/styles.css');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'css', 'styles.css')), 'Brak skompilowanego pliku css/styles.css');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'privacy.html')), 'Brak pliku privacy.html (RODO)');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'terms.html')), 'Brak pliku terms.html (Regulamin)');
  });

  it('renderuje wszystkie 4 zakładki Strefy Rodzica i chroni ofertę PRO Bramką Rodzicielską', async () => {
    const { openProOfferModal, closeProOfferModal, handleProOfferCtaClick } = await import('../js/parentalGate.js');
    const { getProInterestStats } = await import('../js/entitlements.js');

    openParentZoneModal('pl', 'progress');
    const tabs = document.querySelectorAll('#parent-zone-tabs button');
    assert.strictEqual(tabs.length, 4, 'Strefa Rodzica powinna mieć 4 zakładki');

    // Przejście przez zakładki bez błędów
    tabs[1].click(); // Profile
    tabs[2].click(); // Karty PDF
    assert.ok(document.getElementById('pz-print-ws-btn'), 'Zakładka Karty PDF powinna mieć przycisk drukowania');
    tabs[3].click(); // PRO i Prawo
    assert.ok(document.getElementById('parent-zone-privacy-link'), 'Zakładka PRO i Prawo powinna mieć link do RODO');
    closeParentZoneModal();

    // Oferta PRO otwierana przez Bramkę Rodzicielską
    openParentalGate('pl', () => openProOfferModal('pl', 'math_grade_2'));
    const proModal = document.getElementById('pro-offer-modal');
    assert.ok(proModal.classList.contains('hidden'), 'Oferta PRO nie może być widoczna przed przejściem Bramki Rodzicielskiej');

    const input = document.getElementById('parental-gate-input');
    input.value = String(getCurrentGateAnswerForTest());
    assert.strictEqual(submitParentalGate(), true);
    assert.ok(!proModal.classList.contains('hidden'), 'Oferta PRO powinna się otworzyć po przejściu Bramki');

    handleProOfferCtaClick();
    assert.strictEqual(getProInterestStats().total, 1);
    assert.ok(!document.getElementById('pro-offer-feedback').classList.contains('hidden'));
    closeProOfferModal();
  });
});
