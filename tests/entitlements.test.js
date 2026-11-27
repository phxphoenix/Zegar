import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDOM } from './helpers/dom.js';
import {
  isProUser,
  setProStatus,
  canAccessMathGrade,
  canAccessOrthoGrade,
  canAccessContinent,
  canUseMultiProfiles,
  canUseFullWorksheets,
  recordProInterestClick,
  getProInterestStats,
  getFreeTierSummary
} from '../js/entitlements.js';
import { mathModule } from '../js/modules/math.js';
import { orthographyModule } from '../js/modules/orthography.js';
import { flagsLogosModule } from '../js/modules/flagsLogos.js';

describe('entitlements - Podział Darmowe (Free) vs Bystrzak PRO', () => {
  beforeEach(() => {
    createTestDOM();
    setProStatus(false);
  });

  it('domyślnie uruchamia tryb Free z dostępem do Klasy 1 i Europy', () => {
    assert.strictEqual(isProUser(), false);
    assert.strictEqual(canAccessMathGrade(1), true);
    assert.strictEqual(canAccessMathGrade(2), false);
    assert.strictEqual(canAccessMathGrade(3), false);

    assert.strictEqual(canAccessOrthoGrade(1), true);
    assert.strictEqual(canAccessOrthoGrade(2), false);
    assert.strictEqual(canAccessOrthoGrade(3), false);

    assert.strictEqual(canAccessContinent('europe'), true);
    assert.strictEqual(canAccessContinent('asia'), false);
    assert.strictEqual(canAccessContinent('africa'), false);
    assert.strictEqual(canUseMultiProfiles(), false);
    assert.strictEqual(canUseFullWorksheets(), false);

    const summary = getFreeTierSummary();
    assert.deepStrictEqual(summary.mathGrades, [1]);
    assert.deepStrictEqual(summary.continents, ['europe']);
  });

  it('odblokowuje wszystkie klasy, kontynenty, profile i pełne karty PDF w trybie PRO', () => {
    setProStatus(true);
    assert.strictEqual(isProUser(), true);
    assert.strictEqual(canAccessMathGrade(2), true);
    assert.strictEqual(canAccessMathGrade(3), true);
    assert.strictEqual(canAccessOrthoGrade(2), true);
    assert.strictEqual(canAccessOrthoGrade(3), true);
    assert.strictEqual(canAccessContinent('asia'), true);
    assert.strictEqual(canAccessContinent('oceania'), true);
    assert.strictEqual(canUseMultiProfiles(), true);
    assert.strictEqual(canUseFullWorksheets(), true);
  });

  it('blokuje kliknięcie Klasy 2/3 i kontynentów spoza Europy w UI i wywołuje onProFeatureRequested', () => {
    const stage = document.getElementById('stage-container');
    const config = document.getElementById('teacher-panel');
    const requested = [];

    // Matematyka: Klasa 2 zablokowana
    mathModule.mountStage(stage, 'pl');
    mathModule.mountConfig(config, 'pl', {
      onProFeatureRequested: (key) => requested.push(key)
    });
    const mathG2 = config.querySelector('button[data-grade="2"]');
    assert.strictEqual(mathG2.getAttribute('data-pro-locked'), 'true');
    mathG2.click();
    assert.strictEqual(mathModule.getRankingPayload().meta.grade, 1);
    assert.ok(requested.includes('math_grade_2'));

    // Ortografia: Klasa 3 zablokowana
    orthographyModule.mountStage(stage, 'pl');
    orthographyModule.mountConfig(config, 'pl', {
      onProFeatureRequested: (key) => requested.push(key)
    });
    const orthoG3 = config.querySelector('button[data-grade="3"]');
    assert.strictEqual(orthoG3.getAttribute('data-pro-locked'), 'true');
    orthoG3.click();
    assert.strictEqual(orthographyModule.getRankingPayload().meta.grade, 1);
    assert.ok(requested.includes('ortho_grade_3'));

    // Flagi: Azja zablokowana w Free
    flagsLogosModule.mountStage(stage, 'pl');
    flagsLogosModule.mountConfig(config, 'pl', {
      onProFeatureRequested: (key) => requested.push(key)
    });
    const asiaBtn = config.querySelector('button[data-continent="asia"]');
    assert.strictEqual(asiaBtn.getAttribute('data-pro-locked'), 'true');
    asiaBtn.click();
    assert.deepStrictEqual(flagsLogosModule.getRankingPayload().meta.continents, ['europe']);
    assert.ok(requested.includes('flags_continent_asia'));
  });

  it('zlicza lokalnie kliknięcia intencji PRO (Fake Door)', () => {
    assert.strictEqual(getProInterestStats().total, 0);
    recordProInterestClick('math_grade_2');
    recordProInterestClick('math_grade_2');
    recordProInterestClick('multi_profiles');

    const stats = getProInterestStats();
    assert.strictEqual(stats.total, 3);
    assert.strictEqual(stats.byFeature.math_grade_2, 2);
    assert.strictEqual(stats.byFeature.multi_profiles, 1);
  });
});
