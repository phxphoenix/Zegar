import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDOM } from './helpers/dom.js';
import { flagsLogosModule } from '../js/modules/flagsLogos.js';
import { FLAGS_DATA } from '../js/modules/flagsLogosData.js';

describe('flagsLogos - Moduł Flagi Świata (gałąź biznesowa)', () => {
  let env;

  beforeEach(() => {
    env = createTestDOM();
  });

  it('posiada poprawne id modułu ("flags_logos") i działa wyłącznie w trybie flag', () => {
    assert.strictEqual(flagsLogosModule.id, 'flags_logos');
    const payload = flagsLogosModule.getRankingPayload();
    assert.strictEqual(payload.mode, 'flags');
    assert.strictEqual(payload.meta.quizType, 'flags');
  });

  it('mountStage renderuje elementy sceny i lokalny obraz flagi bez przełącznika logotypów', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');
    flagsLogosModule.mountStage(stage, 'pl');
    flagsLogosModule.mountConfig(config, 'pl', {});
    flagsLogosModule.generateQuestion('pl', true);

    assert.ok(document.getElementById('fl-context-badge'), 'Brak elementu #fl-context-badge');
    assert.ok(document.getElementById('fl-stage-body'), 'Brak elementu #fl-stage-body');
    assert.ok(document.getElementById('fl-hint-btn'), 'Brak przycisku #fl-hint-btn');
    assert.ok(document.getElementById('fl-hint-box'), 'Brak kontenera #fl-hint-box');

    const img = document.getElementById('fl-flag-img');
    assert.ok(img, 'Scena powinna wyświetlać obraz flagi');
    assert.ok(img.getAttribute('src').startsWith('./assets/flags/'), 'Obraz flagi musi ładować lokalny plik offline');

    assert.strictEqual(config.querySelector('button[data-quiz-type="logos"]'), null, 'Brak trybu logotypów w gałęzi biznesowej');
    assert.strictEqual(config.querySelectorAll('.fl-continent-btn').length, 6, 'Powinno wyświetlić 6 przycisków kontynentów');
  });

  it('obsługuje wielokrotny wybór kontynentów dla flag (z blokadą odznaczenia ostatniego)', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');

    flagsLogosModule.mountStage(stage, 'pl');
    flagsLogosModule.mountConfig(config, 'pl', {});

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

  it('wyświetla i ukrywa charakterystyczny opis w podpowiedzi oraz tłumaczy nazwy PL <-> EN', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');

    flagsLogosModule.mountStage(stage, 'pl');
    flagsLogosModule.mountConfig(config, 'pl', {});

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
