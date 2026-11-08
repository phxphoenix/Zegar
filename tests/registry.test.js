import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MODULES, getModuleById } from '../js/modules/registry.js';
import { clockModule } from '../js/modules/clock.js';
import { mathModule } from '../js/modules/math.js';
import { orthographyModule } from '../js/modules/orthography.js';

describe('registry - Rejestr modułów przedmiotowych', () => {
  it('zawiera zarejestrowane 3 moduły: Zegar, Matematyka, Ortografia', () => {
    assert.ok(Array.isArray(MODULES));
    assert.strictEqual(MODULES.length, 3);
    const ids = MODULES.map(m => m.id);
    assert.deepStrictEqual(ids, ['clock', 'math', 'orthography']);
  });

  it('każdy zarejestrowany moduł spełnia standardowy kontrakt modułu edukacyjnego', () => {
    const requiredMethods = [
      'mountStage',
      'mountConfig',
      'generateQuestion',
      'refreshLanguage',
      'getRankingPayload'
    ];

    for (const mod of MODULES) {
      assert.strictEqual(typeof mod.id, 'string', `Moduł musi posiadać string id`);
      assert.ok(mod.id.length > 0, `Id modułu nie może być puste`);

      for (const methodName of requiredMethods) {
        assert.strictEqual(
          typeof mod[methodName],
          'function',
          `Moduł "${mod.id}" musi implementować metodę "${methodName}"`
        );
      }
    }
  });

  it('getModuleById poprawnie zwraca żądany moduł', () => {
    assert.strictEqual(getModuleById('clock'), clockModule);
    assert.strictEqual(getModuleById('math'), mathModule);
    assert.strictEqual(getModuleById('orthography'), orthographyModule);
  });

  it('getModuleById zwraca moduł domyślny (MODULES[0]) dla nieznanego id', () => {
    assert.strictEqual(getModuleById('nieznany_modul'), MODULES[0]);
    assert.strictEqual(getModuleById(null), MODULES[0]);
    assert.strictEqual(getModuleById(undefined), MODULES[0]);
  });
});
