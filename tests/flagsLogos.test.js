import { test, describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDOM } from './helpers/dom.js';
import { flagsLogosModule, getFilteredPool } from '../js/modules/flagsLogos.js';
import { FLAGS_DATA } from '../js/modules/flagsLogosData.js';

describe('flagsLogos - Moduł Flaga/Logo', () => {
  let env;

  beforeEach(() => {
    env = createTestDOM();
  });

  it('posiada poprawne id modułu ("flags_logos")', () => {
    assert.strictEqual(flagsLogosModule.id, 'flags_logos');
  });

  it('mountStage renderuje elementy sceny (odznakę kontekstową, ciało sceny, przycisk podpowiedzi)', () => {
    const stage = document.getElementById('stage-container');
    flagsLogosModule.mountStage(stage, 'pl');
    flagsLogosModule.generateQuestion('pl', true);

    assert.ok(document.getElementById('fl-context-badge'), 'Brak elementu #fl-context-badge');
    assert.ok(document.getElementById('fl-stage-body'), 'Brak elementu #fl-stage-body');
    assert.ok(document.getElementById('fl-hint-btn'), 'Brak przycisku #fl-hint-btn');
    assert.ok(document.getElementById('fl-hint-box'), 'Brak kontenera #fl-hint-box');
  });

  it('w konfiguratorze pozwala na jednokrotny wybór pomiędzy Flagami a Logotypami', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');

    flagsLogosModule.mountStage(stage, 'pl');
    flagsLogosModule.mountConfig(config, 'pl', {});

    const flagsBtn = config.querySelector('button[data-quiz-type="flags"]');
    const logosBtn = config.querySelector('button[data-quiz-type="logos"]');
    assert.ok(flagsBtn && logosBtn, 'Brak przycisków wyboru Flagi / Logotypy');

    // Przełącz na Logotypy
    logosBtn.click();
    let payload = flagsLogosModule.getRankingPayload();
    assert.strictEqual(payload.mode, 'logos');
    assert.strictEqual(payload.meta.quizType, 'logos');
    assert.ok(document.getElementById('fl-logo-svg'), 'Scena powinna wyświetlać wektorowe logo SVG');
    assert.ok(
      config.querySelectorAll('.fl-logo-cat-btn').length === 6,
      'Powinno wyświetlić 6 kategorii logotypów'
    );

    // Przełącz z powrotem na Flagi
    flagsBtn.click();
    payload = flagsLogosModule.getRankingPayload();
    assert.strictEqual(payload.mode, 'flags');
    assert.strictEqual(payload.meta.quizType, 'flags');
    assert.ok(document.getElementById('fl-flag-img'), 'Scena powinna wyświetlać obraz flagi');
    assert.ok(
      config.querySelectorAll('.fl-continent-btn').length === 6,
      'Powinno wyświetlić 6 przycisków kontynentów'
    );
  });

  it('obsługuje wielokrotny wybór kontynentów dla flag (z blokadą odznaczenia ostatniego)', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');

    flagsLogosModule.mountStage(stage, 'pl');
    flagsLogosModule.mountConfig(config, 'pl', {});

    // Upewnij się, że jesteśmy w trybie flag
    config.querySelector('button[data-quiz-type="flags"]').click();

    // Zostaw tylko Europę i Azję
    for (const cont of ['africa', 'north_america', 'south_america', 'oceania']) {
      config.querySelector(`button[data-continent="${cont}"]`).click();
    }

    let payload = flagsLogosModule.getRankingPayload();
    assert.deepStrictEqual(payload.meta.continents.sort(), ['asia', 'europe']);

    // Odznacz Azję -> zostaje tylko Europa
    config.querySelector('button[data-continent="asia"]').click();
    payload = flagsLogosModule.getRankingPayload();
    assert.deepStrictEqual(payload.meta.continents, ['europe']);

    // Próba odznaczenia ostatniego kontynentu (Europy) powinna być zablokowana
    config.querySelector('button[data-continent="europe"]').click();
    payload = flagsLogosModule.getRankingPayload();
    assert.deepStrictEqual(payload.meta.continents, ['europe']);

    // Wszystkie losowane kraje muszą należeć do Europy
    const europeNames = new Set(FLAGS_DATA.filter(f => f.continent === 'europe').map(f => f.namePl));
    for (let i = 0; i < 15; i++) {
      const q = flagsLogosModule.generateQuestion('pl', true);
      assert.strictEqual(q.options.length, 4);
      assert.strictEqual(new Set(q.options).size, 4);
      assert.ok(europeNames.has(q.correctAnswer), `Wylosowano kraj spoza Europy: ${q.correctAnswer}`);
    }

    // Przywróć wszystkie kontynenty
    const selectAllBtn = document.getElementById('fl-select-all-continents');
    assert.ok(selectAllBtn);
    selectAllBtn.click();
    assert.strictEqual(flagsLogosModule.getRankingPayload().meta.continents.length, 6);
  });

  it('obsługuje wielokrotny wybór kategorii dla logotypów wraz z kategorią "Inne"', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');

    flagsLogosModule.mountStage(stage, 'pl');
    flagsLogosModule.mountConfig(config, 'pl', {});

    // Przełącz na Logotypy
    config.querySelector('button[data-quiz-type="logos"]').click();

    // Odznacz wszystko poza "automotive" i "other"
    for (const cat of ['tech', 'fashion', 'food', 'entertainment']) {
      config.querySelector(`button[data-logo-cat="${cat}"]`).click();
    }

    let payload = flagsLogosModule.getRankingPayload();
    assert.deepStrictEqual(payload.meta.categories.sort(), ['automotive', 'other']);

    // Odznacz "automotive" -> zostaje tylko "other"
    config.querySelector('button[data-logo-cat="automotive"]').click();
    payload = flagsLogosModule.getRankingPayload();
    assert.deepStrictEqual(payload.meta.categories, ['other']);

    // Próba odznaczenia ostatniej kategorii ("other") jest zablokowana
    config.querySelector('button[data-logo-cat="other"]').click();
    assert.deepStrictEqual(flagsLogosModule.getRankingPayload().meta.categories, ['other']);

    // Przywróć wszystkie kategorie
    document.getElementById('fl-select-all-categories').click();
    assert.strictEqual(flagsLogosModule.getRankingPayload().meta.categories.length, 6);
  });

  it('wyświetla i ukrywa charakterystyczny opis w podpowiedzi oraz tłumaczy nazwy PL <-> EN', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');

    flagsLogosModule.mountStage(stage, 'pl');
    flagsLogosModule.mountConfig(config, 'pl', {});
    config.querySelector('button[data-quiz-type="flags"]').click();

    const qPl = flagsLogosModule.generateQuestion('pl', true);
    assert.strictEqual(qPl.options.length, 4);

    const hintBtn = document.getElementById('fl-hint-btn');
    const hintBox = document.getElementById('fl-hint-box');
    assert.ok(hintBox.classList.contains('hidden'));

    hintBtn.click();
    assert.ok(!hintBox.classList.contains('hidden'), 'Podpowiedź powinna się otworzyć');
    assert.ok(hintBox.textContent.includes('Stolica:'), 'Podpowiedź dla flagi powinna zawierać stolicę i opis');

    // Przełączenie języka na EN tłumaczy opcje i podpowiedź bez utraty bieżącego pytania
    const qEn = flagsLogosModule.refreshLanguage('en');
    assert.strictEqual(qEn.options.length, 4);
    assert.ok(hintBox.textContent.includes('Capital:'));
  });
});
