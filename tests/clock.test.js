import { test, describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDOM } from './helpers/dom.js';
import { clockModule } from '../js/modules/clock.js';

describe('clock - Moduł tarczy zegara i odczytu czasu', () => {
  let env;

  beforeEach(() => {
    env = createTestDOM();
  });

  it('posiada poprawne id modułu', () => {
    assert.strictEqual(clockModule.id, 'clock');
  });

  it('mountStage poprawnie buduje tarczę SVG (60 kresek minutowych, 12 cyfr, wskazówki)', () => {
    const stage = document.getElementById('stage-container');
    clockModule.mountStage(stage, 'pl');

    const svg = document.getElementById('clock-svg');
    assert.ok(svg, 'Brak elementu #clock-svg');

    const marksGroup = document.getElementById('clock-marks');
    assert.strictEqual(marksGroup.children.length, 60, 'Tarcza powinna zawierać 60 znaczników minutowych');

    const numbersGroup = document.getElementById('clock-numbers');
    assert.strictEqual(numbersGroup.children.length, 12, 'Tarcza powinna zawierać 12 liczb godzinowych');

    const hourHand = document.getElementById('hour-hand');
    const minuteHand = document.getElementById('minute-hand');
    assert.ok(hourHand, 'Brak wskazówki godzinowej');
    assert.ok(minuteHand, 'Brak wskazówki minutowej');

    const badge = document.getElementById('day-period-badge');
    assert.ok(badge, 'Brak odznaki pory dnia');
  });

  it('poprawnie wylicza kąty obrotu wskazówek zegara', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');

    clockModule.mountStage(stage, 'pl');
    clockModule.mountConfig(config, 'pl', {});

    // Ustawienie ręczne na 03:00 -> kąt godzinowy 90°, minutowy 0°
    document.getElementById('input-hour').value = '3';
    document.getElementById('input-minute').value = '0';
    document.getElementById('clock-btn-apply').click();

    const hourHand = document.getElementById('hour-hand');
    const minHand = document.getElementById('minute-hand');
    assert.strictEqual(hourHand.getAttribute('transform'), 'rotate(90 100 100)');
    assert.strictEqual(minHand.getAttribute('transform'), 'rotate(0 100 100)');

    // Ustawienie na 06:30 -> kąt godzinowy 6*30 + 30*0.5 = 195°, minutowy 30*6 = 180°
    document.getElementById('input-hour').value = '6';
    document.getElementById('input-minute').value = '30';
    document.getElementById('clock-btn-apply').click();

    assert.strictEqual(hourHand.getAttribute('transform'), 'rotate(195 100 100)');
    assert.strictEqual(minHand.getAttribute('transform'), 'rotate(180 100 100)');
  });

  it('wskazuje poprawną porę dnia dla różnych godzin doby', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');

    clockModule.mountStage(stage, 'pl');
    clockModule.mountConfig(config, 'pl', {});

    const testPeriod = (h, m, expectedText, expectedIcon) => {
      document.getElementById('input-hour').value = String(h);
      document.getElementById('input-minute').value = String(m);
      document.getElementById('clock-btn-apply').click();

      const textSpan = document.getElementById('day-period-text');
      const iconSpan = document.getElementById('day-period-icon');
      assert.strictEqual(textSpan.textContent, expectedText);
      assert.strictEqual(iconSpan.textContent, expectedIcon);
    };

    // Noc (22:00 - 04:59)
    testPeriod(2, 0, 'W nocy', '🌙');
    testPeriod(23, 15, 'W nocy', '🌙');

    // Rano (05:00 - 11:59)
    testPeriod(8, 30, 'Rano', '🌅');

    // Po południu (12:00 - 17:59)
    testPeriod(14, 0, 'Po południu', '☀️');

    // Wieczorem (18:00 - 21:59)
    testPeriod(19, 45, 'Wieczorem', '🌆');
  });

  it('generuje 4 unikalne opcje odpowiedzi w formacie cyfrowym', () => {
    const stage = document.getElementById('stage-container');
    clockModule.mountStage(stage, 'pl');

    const question = clockModule.generateQuestion('pl', true);
    assert.ok(question.correctAnswer);
    assert.ok(Array.isArray(question.options));
    assert.strictEqual(question.options.length, 4);

    const set = new Set(question.options);
    assert.strictEqual(set.size, 4, 'Opcje odpowiedzi muszą być unikalne');
    assert.ok(question.options.includes(question.correctAnswer), 'Opcje muszą zawierać poprawną odpowiedź');

    // Format cyfrowy: "HH:MM"
    const digitalRegex = /^\d{2}:\d{2}$/;
    for (const opt of question.options) {
      assert.ok(digitalRegex.test(opt), `Opcja "${opt}" nie pasuje do formatu HH:MM`);
    }
  });

  it('generuje poprawne opcje w trybie słownym w języku polskim i angielskim', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');

    clockModule.mountStage(stage, 'pl');
    clockModule.mountConfig(config, 'pl', {});

    // Przełącz na tryb słowny
    const modeSelect = document.getElementById('mode-select');
    modeSelect.value = 'words';
    modeSelect.dispatchEvent(new env.window.Event('change'));

    // Ustaw czas 14:15
    document.getElementById('input-hour').value = '14';
    document.getElementById('input-minute').value = '15';
    document.getElementById('clock-btn-apply').click();

    let question = clockModule.generateQuestion('pl', false);
    assert.strictEqual(question.correctAnswer, 'kwadrans po drugiej');
    assert.strictEqual(question.options.length, 4);
    assert.ok(question.options.includes('kwadrans po drugiej'));

    // Przełącz język na angielski
    question = clockModule.refreshLanguage('en');
    assert.strictEqual(question.correctAnswer, 'quarter past two');
    assert.strictEqual(question.options.length, 4);
    assert.ok(question.options.includes('quarter past two'));
  });

  it('zwraca właściwy ranking payload', () => {
    const payload = clockModule.getRankingPayload();
    assert.strictEqual(payload.moduleId, 'clock');
    assert.ok(payload.mode === 'digital' || payload.mode === 'words');
    assert.ok(payload.meta);
  });
});
