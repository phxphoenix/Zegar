import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDOM } from './helpers/dom.js';
import { setProStatus } from '../js/entitlements.js';
import { recordAnswer } from '../js/progressTracker.js';
import {
  buildWorksheetData,
  renderWorksheetHTML,
  escapeHtml
} from '../js/worksheetGenerator.js';

describe('worksheetGenerator - Generator Kart Pracy A4 PDF', () => {
  beforeEach(() => {
    createTestDOM();
    setProStatus(false);
  });

  it('w trybie Free generuje podgląd 4 zadań (Klasa 1), a w PRO pełny arkusz 12 zadań', () => {
    const freeSheet = buildWorksheetData({ type: 'math', grade: 3, profileName: 'Zosia', lang: 'pl', count: 12 });
    assert.strictEqual(freeSheet.isPro, false);
    assert.strictEqual(freeSheet.grade, 1);
    assert.strictEqual(freeSheet.tasks.length, 4);

    setProStatus(true);
    const proSheet = buildWorksheetData({ type: 'orthography', grade: 2, profileName: 'Kuba', lang: 'pl', count: 12 });
    assert.strictEqual(proSheet.isPro, true);
    assert.strictEqual(proSheet.grade, 2);
    assert.strictEqual(proSheet.tasks.length, 12);
    for (const t of proSheet.tasks) {
      assert.ok(t.prompt.length > 0 && t.answer.length > 0);
    }
  });

  it('generuje arkusz z błędów dziecka oraz bezpieczny fallback przy pustej historii', () => {
    setProStatus(true);
    const fallbackSheet = buildWorksheetData({ type: 'mistakes', grade: 1, profileId: 'empty', count: 8 });
    assert.strictEqual(fallbackSheet.isFallbackFromMistakes, true);
    assert.strictEqual(fallbackSheet.tasks.length, 8);

    recordAnswer({ profileId: 'p_err', moduleId: 'math', isCorrect: false, prompt: '8 × 7', expectedAnswer: '56', givenAnswer: '54' });
    const errSheet = buildWorksheetData({ type: 'mistakes', grade: 2, profileId: 'p_err', count: 6 });
    assert.strictEqual(errSheet.isFallbackFromMistakes, false);
    assert.ok(errSheet.tasks[0].prompt.includes('8 × 7'));
    assert.strictEqual(errSheet.tasks[0].answer, '56');
  });

  it('renderuje arkusz A4 z kluczem odpowiedzi na 2. stronie i bezpiecznie escapuje XSS', () => {
    const html = renderWorksheetHTML({
      type: 'math',
      grade: 1,
      profileName: '<img src=x onerror=alert(1)>',
      lang: 'pl',
      isPro: true,
      generatedAt: '2026-11-27',
      tasks: [{ prompt: '2 + 2 = ______', answer: '4' }]
    });

    assert.ok(html.includes('worksheet-answer-key'), 'Arkusz musi zawierać 2. stronę z kluczem odpowiedzi');
    assert.ok(!html.includes('<img src=x'), 'Kod HTML nie może zawierać niezescapowanego tagu XSS');
    assert.ok(html.includes(escapeHtml('<img src=x onerror=alert(1)>')));
  });
});
