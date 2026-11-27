import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDOM } from './helpers/dom.js';
import { setProStatus } from '../js/entitlements.js';
import {
  getProfiles,
  getActiveProfile,
  setActiveProfile,
  addProfile,
  removeProfile
} from '../js/profiles.js';

describe('profiles - Lokalne profile dzieci (1 Free / do 4 PRO)', () => {
  beforeEach(() => {
    createTestDOM();
    setProStatus(false);
  });

  it('w trybie Free udostępnia 1 profil domyślny i blokuje dodawanie kolejnych', () => {
    assert.strictEqual(getProfiles().length, 1);
    assert.strictEqual(getActiveProfile().id, 'default');

    const res = addProfile('Zosia', '🦊');
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.reason, 'pro_required');
  });

  it('w trybie PRO pozwala dodać do 4 profili, przełączać je, usuwać i oczyszcza XSS w nazwie', () => {
    setProStatus(true);

    const r1 = addProfile('<script>Zosia</script>', '🦊');
    assert.strictEqual(r1.ok, true);
    assert.ok(!r1.profile.name.includes('<') && !r1.profile.name.includes('>'), 'Znaki HTML muszą zostać usunięte z nazwy');

    const r2 = addProfile('Kuba', '🦁');
    const r3 = addProfile('Maja', '🐼');
    assert.strictEqual(r2.ok, true);
    assert.strictEqual(r3.ok, true);
    assert.strictEqual(getProfiles().length, 4);

    // 5. profil przekracza limit 4
    const r4 = addProfile('Olek', '🐸');
    assert.strictEqual(r4.ok, false);
    assert.strictEqual(r4.reason, 'limit_reached');

    // Przełączanie i usuwanie
    setActiveProfile(r2.profile.id);
    assert.strictEqual(getActiveProfile().name, 'Kuba');

    assert.strictEqual(removeProfile('default'), false, 'Nie wolno usunąć profilu domyślnego');
    assert.strictEqual(removeProfile(r2.profile.id), true);
    assert.strictEqual(getProfiles().length, 3);
    assert.strictEqual(getActiveProfile().id, 'default');
  });
});
