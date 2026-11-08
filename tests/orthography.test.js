import { test, describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDOM } from './helpers/dom.js';
import { orthographyModule } from '../js/modules/orthography.js';

describe('orthography - Moduł ortografii (Klasy 1-3)', () => {
  let env;

  beforeEach(() => {
    env = createTestDOM();
  });

  it('posiada poprawne id modułu', () => {
    assert.strictEqual(orthographyModule.id, 'orthography');
  });

  it('mountStage tworzy elementy sceny (odznakę kontekstową, ciało sceny, podpowiedź)', () => {
    const stage = document.getElementById('stage-container');
    orthographyModule.mountStage(stage, 'pl');
    orthographyModule.generateQuestion('pl', true);

    assert.ok(document.getElementById('ortho-context-badge'), 'Brak elementu #ortho-context-badge');
    assert.ok(document.getElementById('ortho-stage-body'), 'Brak elementu #ortho-stage-body');
    assert.ok(document.getElementById('ortho-hint-btn'), 'Brak przycisku #ortho-hint-btn');
    assert.ok(document.getElementById('ortho-hint-box'), 'Brak kontenera #ortho-hint-box');
  });

  it('generuje 4 unikalne opcje w trybie luki ("gap")', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');

    orthographyModule.mountStage(stage, 'pl');
    orthographyModule.mountConfig(config, 'pl', {});

    const modeSelect = document.getElementById('ortho-mode-select');
    if (modeSelect) {
      modeSelect.value = 'gap';
      modeSelect.dispatchEvent(new env.window.Event('change'));
    }

    for (let i = 0; i < 20; i++) {
      const q = orthographyModule.generateQuestion('pl', true);
      assert.strictEqual(q.options.length, 4, 'Opcje luki muszą zawierać 4 elementy');
      const set = new Set(q.options);
      assert.strictEqual(set.size, 4, 'Opcje luki muszą być unikalne');
      assert.ok(q.options.includes(q.correctAnswer), 'Opcje muszą zawierać poprawną literę');
      assert.ok(q.correctAnswer.length <= 2, 'Odpowiedź w trybie luki to litera lub dwuznak');
    }
  });

  it('generuje 4 unikalne opcje w trybie pełnych wyrazów ("word")', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');

    orthographyModule.mountStage(stage, 'pl');
    orthographyModule.mountConfig(config, 'pl', {});

    const modeSelect = document.getElementById('ortho-mode-select');
    assert.ok(modeSelect, 'Brak selektora trybu #ortho-mode-select');
    modeSelect.value = 'word';
    modeSelect.dispatchEvent(new env.window.Event('change'));

    for (let i = 0; i < 20; i++) {
      const q = orthographyModule.generateQuestion('pl', true);
      assert.strictEqual(q.options.length, 4, 'Opcje wyrazowe muszą zawierać 4 elementy');
      const set = new Set(q.options);
      assert.strictEqual(set.size, 4, 'Opcje wyrazowe muszą być unikalne');
      assert.ok(q.options.includes(q.correctAnswer), 'Opcje muszą zawierać poprawne słowo');
    }
  });

  it('generuje 4 unikalne opcje w trybie Bystre Oko ("spot")', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');

    orthographyModule.mountStage(stage, 'pl');
    orthographyModule.mountConfig(config, 'pl', {});

    const modeSelect = document.getElementById('ortho-mode-select');
    assert.ok(modeSelect, 'Brak selektora trybu #ortho-mode-select');
    modeSelect.value = 'spot';
    modeSelect.dispatchEvent(new env.window.Event('change'));

    for (let i = 0; i < 20; i++) {
      const q = orthographyModule.generateQuestion('pl', true);
      assert.strictEqual(q.options.length, 4, 'Opcje Bystre Oko muszą zawierać 4 elementy');
      const set = new Set(q.options);
      assert.strictEqual(set.size, 4, 'Opcje Bystre Oko muszą być unikalne');
      assert.ok(q.options.includes(q.correctAnswer), 'Opcje muszą zawierać poprawnie napisane słowo');
    }
  });

  it('poprawnie filtruje wyrazy według rodzaju reguły (oboczności vs do zapamiętania)', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');

    orthographyModule.mountStage(stage, 'pl');
    orthographyModule.mountConfig(config, 'pl', {});

    // Filtr: tylko oboczności i zasady (explainable)
    const explainableBtn = config.querySelector('button[data-rule="explainable"]');
    explainableBtn.click();

    for (let i = 0; i < 15; i++) {
      orthographyModule.generateQuestion('pl', true);
      const payload = orthographyModule.getRankingPayload();
      assert.strictEqual(payload.meta.ruleFilter, 'explainable');
    }

    // Filtr: tylko do zapamiętania (memory)
    const memoryBtn = config.querySelector('button[data-rule="memory"]');
    memoryBtn.click();

    for (let i = 0; i < 15; i++) {
      orthographyModule.generateQuestion('pl', true);
      const payload = orthographyModule.getRankingPayload();
      assert.strictEqual(payload.meta.ruleFilter, 'memory');
    }
  });

  it('obsługuje interaktywny panel podpowiedzi ortograficznej', () => {
    const stage = document.getElementById('stage-container');
    orthographyModule.mountStage(stage, 'pl');
    orthographyModule.generateQuestion('pl', true);

    const hintBtn = document.getElementById('ortho-hint-btn');
    const hintBox = document.getElementById('ortho-hint-box');
    assert.ok(hintBtn);
    assert.ok(hintBox.classList.contains('hidden'), 'Podpowiedź powinna być domyślnie ukryta');

    // Kliknięcie "Pokaż podpowiedź"
    hintBtn.click();
    assert.ok(!hintBox.classList.contains('hidden'), 'Podpowiedź powinna być widoczna');
    assert.ok(hintBox.innerHTML.includes('🔑'), 'Podpowiedź powinna zawierać regułę/oboczność');

    // Ponowne kliknięcie ukrywa podpowiedź
    hintBtn.click();
    assert.ok(hintBox.classList.contains('hidden'), 'Podpowiedź powinna być ukryta');
  });

  it('generuje poprawny ranking payload z metadanymi ortografii', () => {
    const payload = orthographyModule.getRankingPayload();
    assert.strictEqual(payload.moduleId, 'orthography');
    assert.ok(['gap', 'word', 'spot'].includes(payload.mode));
    assert.ok(payload.meta.grade >= 1 && payload.meta.grade <= 3);
    assert.ok(Array.isArray(payload.meta.categories));
    assert.ok(payload.meta.categories.length >= 1);
  });
});
