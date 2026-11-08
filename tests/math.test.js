import { test, describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDOM } from './helpers/dom.js';
import { mathModule } from '../js/modules/math.js';

describe('math - Moduł matematyki (Klasy 1-3)', () => {
  let env;

  beforeEach(() => {
    env = createTestDOM();
  });

  it('posiada poprawne id modułu', () => {
    assert.strictEqual(mathModule.id, 'math');
  });

  it('generuje 4 unikalne opcje zawierające poprawną odpowiedź', () => {
    const stage = document.getElementById('stage-container');
    mathModule.mountStage(stage, 'pl');

    for (let i = 0; i < 20; i++) {
      const q = mathModule.generateQuestion('pl', true);
      assert.strictEqual(q.options.length, 4, 'Wymagane dokładnie 4 opcje odpowiedzi');
      const unique = new Set(q.options);
      assert.strictEqual(unique.size, 4, 'Opcje odpowiedzi muszą być unikalne');
      assert.ok(q.options.includes(q.correctAnswer), 'Opcje muszą zawierać poprawną odpowiedź');
    }
  });

  it('generuje zadania matematyczne zgodne z zakresem klas 1, 2 i 3', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');

    mathModule.mountStage(stage, 'pl');
    mathModule.mountConfig(config, 'pl', {});

    // Klasa 1: zakres do 20
    const grade1Btn = config.querySelector('button[data-grade="1"]');
    grade1Btn.click();

    for (let i = 0; i < 30; i++) {
      const q = mathModule.generateQuestion('pl', true);
      const ans = parseInt(q.correctAnswer, 10);
      assert.ok(!isNaN(ans), 'Odpowiedź musi być liczbą');
      assert.ok(ans >= 0, 'Wynik nie może być ujemny');
      assert.ok(ans <= 20, `Wynik w klasie 1 (${ans}) nie powinien przekraczać 20`);
    }

    // Klasa 2: zakres do 100
    const grade2Btn = config.querySelector('button[data-grade="2"]');
    grade2Btn.click();

    for (let i = 0; i < 30; i++) {
      const q = mathModule.generateQuestion('pl', true);
      const ans = parseInt(q.correctAnswer, 10);
      assert.ok(ans >= 0 && ans <= 100, `Wynik w klasie 2 (${ans}) powinien mieścić się w zakresie 0-100`);
    }

    // Klasa 3: zakres do 1000
    const grade3Btn = config.querySelector('button[data-grade="3"]');
    grade3Btn.click();

    for (let i = 0; i < 30; i++) {
      const q = mathModule.generateQuestion('pl', true);
      const ans = parseInt(q.correctAnswer, 10);
      assert.ok(ans >= 0 && ans <= 1000, `Wynik w klasie 3 (${ans}) powinien mieścić się w zakresie 0-1000`);
    }
  });

  it('obsługuje wszystkie 4 operacje arytmetyczne (+, -, ×, ÷)', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');

    mathModule.mountStage(stage, 'pl');
    mathModule.mountConfig(config, 'pl', {});

    const opButtons = config.querySelectorAll('.math-op-btn');
    const opMap = {};
    opButtons.forEach(b => { opMap[b.getAttribute('data-op')] = b; });

    // Test dzielenia (div)
    // Wyłącz add i sub, włącz div
    if (opMap.add.classList.contains('bg-emerald-600')) opMap.add.click();
    if (opMap.sub.classList.contains('bg-emerald-600')) opMap.sub.click();
    if (!opMap.div.classList.contains('bg-emerald-600')) opMap.div.click();

    for (let i = 0; i < 15; i++) {
      const q = mathModule.generateQuestion('pl', true);
      const ans = parseInt(q.correctAnswer, 10);
      assert.ok(Number.isInteger(ans), 'Wynik dzielenia musi być liczbą całkowitą');
      assert.ok(ans >= 1, 'Wynik dzielenia powinien być >= 1');
    }

    // Test mnożenia (mul)
    opMap.mul.click();
    opMap.div.click();

    for (let i = 0; i < 15; i++) {
      const q = mathModule.generateQuestion('pl', true);
      const ans = parseInt(q.correctAnswer, 10);
      assert.ok(ans >= 2, 'Wynik mnożenia powinien być >= 2');
    }
  });

  it('nie pozwala na odznaczenie wszystkich działań (zawsze minimum 1 aktywne)', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');

    mathModule.mountStage(stage, 'pl');
    mathModule.mountConfig(config, 'pl', {});

    const getActiveBtns = () => config.querySelectorAll('.math-op-btn.bg-emerald-600');

    // Redukujemy liczbę aktywnych działań do dokładnie 1
    let active = getActiveBtns();
    while (active.length > 1) {
      active[0].click();
      active = getActiveBtns();
    }

    assert.strictEqual(active.length, 1, 'Powinno być dokładnie 1 aktywne działanie');
    const soleOp = active[0].getAttribute('data-op');

    // Próba odznaczenia jedynego aktywnego działania
    active[0].click();

    const activeAfter = getActiveBtns();
    assert.strictEqual(activeAfter.length, 1, 'Nadal powinno pozostać dokładnie 1 aktywne działanie');
    assert.strictEqual(activeAfter[0].getAttribute('data-op'), soleOp, 'To samo działanie powinno pozostać aktywne');
  });

  it('obsługuje interaktywny panel podpowiedzi (pokazywanie i ukrywanie)', () => {
    const stage = document.getElementById('stage-container');
    mathModule.mountStage(stage, 'pl');
    mathModule.generateQuestion('pl', true);

    const hintToggleBtn = document.getElementById('math-hint-btn');
    const hintBox = document.getElementById('math-hint-box');
    assert.ok(hintToggleBtn);
    assert.ok(hintBox.classList.contains('hidden'), 'Podpowiedź powinna być domyślnie ukryta');

    // Kliknięcie "Pokaż podpowiedź"
    hintToggleBtn.click();
    assert.ok(!hintBox.classList.contains('hidden'), 'Podpowiedź powinna być widoczna');
    assert.ok(hintBox.innerHTML.length > 20, 'Podpowiedź powinna zawierać wizualizację');

    // Kliknięcie "Ukryj podpowiedź"
    hintToggleBtn.click();
    assert.ok(hintBox.classList.contains('hidden'), 'Podpowiedź powinna być ponownie ukryta');
  });

  it('generuje poprawny ranking payload', () => {
    const payload = mathModule.getRankingPayload();
    assert.strictEqual(payload.moduleId, 'math');
    assert.strictEqual(payload.mode, 'math');
    assert.ok(payload.meta.grade >= 1 && payload.meta.grade <= 3);
    assert.ok(Array.isArray(payload.meta.ops));
    assert.ok(payload.meta.ops.length >= 1);
  });
});
