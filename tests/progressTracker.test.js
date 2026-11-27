import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDOM } from './helpers/dom.js';
import {
  recordAnswer,
  getProgressSummary,
  getTopMistakes,
  resetProgress
} from '../js/progressTracker.js';

describe('progressTracker - Lokalny tracker postępów i błędów (RODO / offline)', () => {
  let env;

  beforeEach(() => {
    env = createTestDOM();
  });

  it('zlicza skuteczność (%) per moduł i globalnie bez żadnych wywołań sieciowych', () => {
    let fetchCalled = false;
    env.setMockFetch(async () => {
      fetchCalled = true;
      return { ok: true, json: async () => ({}) };
    });

    recordAnswer({ profileId: 'p1', moduleId: 'math', isCorrect: true, prompt: '6 + 7', expectedAnswer: '13', givenAnswer: '13' });
    recordAnswer({ profileId: 'p1', moduleId: 'math', isCorrect: true, prompt: '8 + 4', expectedAnswer: '12', givenAnswer: '12' });
    recordAnswer({ profileId: 'p1', moduleId: 'math', isCorrect: false, prompt: '9 + 6', expectedAnswer: '15', givenAnswer: '14' });
    recordAnswer({ profileId: 'p1', moduleId: 'orthography', isCorrect: false, prompt: 'st_ł', expectedAnswer: 'ó', givenAnswer: 'u' });

    assert.strictEqual(fetchCalled, false, 'Tracker postępów nie może wysyłać danych do sieci');

    const summary = getProgressSummary('p1');
    assert.strictEqual(summary.totalAttempts, 4);
    assert.strictEqual(summary.totalCorrect, 2);
    assert.strictEqual(summary.totalWrong, 2);
    assert.strictEqual(summary.overallAccuracy, 50);
    assert.strictEqual(summary.byModule.math.accuracy, 67);
    assert.strictEqual(summary.byModule.orthography.accuracy, 0);
  });

  it('agreguje powtarzające się błędy i sortuje najczęstsze na górze (z limitem 50)', () => {
    recordAnswer({ profileId: 'default', moduleId: 'orthography', isCorrect: false, prompt: 'ż_łw', expectedAnswer: 'ó', givenAnswer: 'u' });
    recordAnswer({ profileId: 'default', moduleId: 'math', isCorrect: false, prompt: '7 × 8', expectedAnswer: '56', givenAnswer: '54' });
    recordAnswer({ profileId: 'default', moduleId: 'math', isCorrect: false, prompt: '7 × 8', expectedAnswer: '56', givenAnswer: '58' });
    recordAnswer({ profileId: 'default', moduleId: 'math', isCorrect: false, prompt: '7 × 8', expectedAnswer: '56', givenAnswer: '48' });

    const top = getTopMistakes('default', null, 5);
    assert.strictEqual(top[0].prompt, '7 × 8');
    assert.strictEqual(top[0].count, 3);
    assert.strictEqual(top[1].prompt, 'ż_łw');

    // Test limitu 50 błędów
    for (let i = 0; i < 60; i++) {
      recordAnswer({ profileId: 'default', moduleId: 'math', isCorrect: false, prompt: `${i} + 1`, expectedAnswer: `${i + 1}`, givenAnswer: '0' });
    }
    const allTop = getTopMistakes('default', null, 100);
    assert.ok(allTop.length <= 50, 'Liczba zapisanych błędów nie może przekroczyć 50');
  });

  it('czyści statystyki tylko dla wskazanego profilu', () => {
    recordAnswer({ profileId: 'zosia', moduleId: 'clock', isCorrect: true, prompt: '12:00', expectedAnswer: '12:00', givenAnswer: '12:00' });
    recordAnswer({ profileId: 'kuba', moduleId: 'clock', isCorrect: true, prompt: '13:00', expectedAnswer: '13:00', givenAnswer: '13:00' });

    resetProgress('zosia');
    assert.strictEqual(getProgressSummary('zosia').totalAttempts, 0);
    assert.strictEqual(getProgressSummary('kuba').totalAttempts, 1);
  });
});
