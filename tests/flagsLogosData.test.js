import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FLAG_CONTINENTS,
  LOGO_CATEGORIES,
  FLAGS_DATA,
  LOGOS_DATA
} from '../js/modules/flagsLogosData.js';

describe('flagsLogosData - Baza danych flag krajów świata i logotypów marek', () => {
  it('zawiera 6 kontynentów dla flag oraz 6 kategorii (w tym "other" / Inne) dla logotypów', () => {
    assert.ok(Array.isArray(FLAG_CONTINENTS));
    assert.strictEqual(FLAG_CONTINENTS.length, 6);
    const continentIds = FLAG_CONTINENTS.map(c => c.id);
    assert.deepStrictEqual(
      continentIds,
      ['europe', 'asia', 'africa', 'north_america', 'south_america', 'oceania']
    );

    assert.ok(Array.isArray(LOGO_CATEGORIES));
    assert.strictEqual(LOGO_CATEGORIES.length, 6);
    const categoryIds = LOGO_CATEGORIES.map(c => c.id);
    assert.ok(categoryIds.includes('other'), 'Kategorie logotypów muszą zawierać "other" (Inne)');
    assert.deepStrictEqual(
      categoryIds,
      ['automotive', 'tech', 'fashion', 'food', 'entertainment', 'other']
    );
  });

  it('zawiera wszystkie flagi krajów świata (197 państw) oraz podobną liczbę logotypów marek (197 marek)', () => {
    assert.ok(Array.isArray(FLAGS_DATA));
    assert.ok(FLAGS_DATA.length >= 195, `Oczekiwano min. 195 flag krajów świata, znaleziono: ${FLAGS_DATA.length}`);

    assert.ok(Array.isArray(LOGOS_DATA));
    assert.strictEqual(
      LOGOS_DATA.length,
      FLAGS_DATA.length,
      'Liczba logotypów marek powinna odpowiadać liczbie flag krajów świata'
    );
  });

  it('wszystkie flagi posiadają unikalne id, kody ISO oraz pełne opisy charakterystyczne do podpowiedzi', () => {
    const validContinents = new Set(FLAG_CONTINENTS.map(c => c.id));
    const seenIds = new Set();
    const seenCodes = new Set();

    for (const flag of FLAGS_DATA) {
      assert.ok(flag.id && flag.id.startsWith('flag_'), `Niepoprawne id flagi: ${flag.id}`);
      assert.ok(!seenIds.has(flag.id), `Zduplikowane id flagi: ${flag.id}`);
      seenIds.add(flag.id);

      assert.ok(/^[a-z]{2}$/.test(flag.code), `Niepoprawny kod ISO kraju: ${flag.code}`);
      assert.ok(!seenCodes.has(flag.code), `Zduplikowany kod ISO kraju: ${flag.code}`);
      seenCodes.add(flag.code);

      assert.ok(validContinents.has(flag.continent), `Niepoprawny kontynent "${flag.continent}" dla ${flag.id}`);
      assert.ok(flag.namePl && flag.namePl.length >= 2, `Brak polskiej nazwy dla ${flag.id}`);
      assert.ok(flag.nameEn && flag.nameEn.length >= 2, `Brak angielskiej nazwy dla ${flag.id}`);
      assert.ok(flag.capitalPl && flag.capitalPl.length >= 2, `Brak polskiej stolicy dla ${flag.id}`);
      assert.ok(flag.capitalEn && flag.capitalEn.length >= 2, `Brak angielskiej stolicy dla ${flag.id}`);
      assert.ok(flag.emoji && flag.emoji.length >= 2, `Brak emoji flagi dla ${flag.id}`);
      assert.ok(flag.flagUrl && flag.flagUrl.startsWith('https://flagcdn.com/'), `Niepoprawny flagUrl dla ${flag.id}`);
      assert.ok(flag.hintPl && flag.hintPl.length >= 20, `Zbyt krótki opis podpowiedzi PL dla ${flag.id}`);
      assert.ok(flag.hintEn && flag.hintEn.length >= 20, `Zbyt krótki opis podpowiedzi EN dla ${flag.id}`);
    }
  });

  it('wszystkie logotypy marek posiadają unikalne id, ścieżkę wektorową SVG, kategorię i opisy podpowiedzi', () => {
    const validCategories = new Set(LOGO_CATEGORIES.map(c => c.id));
    const seenIds = new Set();

    for (const logo of LOGOS_DATA) {
      assert.ok(logo.id && logo.id.startsWith('logo_'), `Niepoprawne id logotypu: ${logo.id}`);
      assert.ok(!seenIds.has(logo.id), `Zduplikowane id logotypu: ${logo.id}`);
      seenIds.add(logo.id);

      assert.ok(validCategories.has(logo.category), `Niepoprawna kategoria "${logo.category}" dla ${logo.id}`);
      assert.ok(logo.name && logo.name.length >= 1, `Brak nazwy marki dla ${logo.id}`);
      assert.ok(/^#[0-9A-Fa-f]{6}$/.test(logo.color), `Niepoprawny kolor HEX "${logo.color}" dla ${logo.id}`);
      assert.ok(logo.svgPath && logo.svgPath.length >= 10, `Brak ścieżki SVG dla ${logo.id}`);
      assert.ok(logo.originPl && logo.originPl.length >= 2, `Brak kraju pochodzenia PL dla ${logo.id}`);
      assert.ok(logo.originEn && logo.originEn.length >= 2, `Brak kraju pochodzenia EN dla ${logo.id}`);
      assert.ok(logo.hintPl && logo.hintPl.length >= 20, `Zbyt krótki opis podpowiedzi PL dla ${logo.id}`);
      assert.ok(logo.hintEn && logo.hintEn.length >= 20, `Zbyt krótki opis podpowiedzi EN dla ${logo.id}`);
    }
  });

  it('każdy kontynent i każda kategoria logotypów posiada co najmniej 10 pozycji', () => {
    for (const cont of FLAG_CONTINENTS) {
      const count = FLAGS_DATA.filter(f => f.continent === cont.id).length;
      assert.ok(count >= 10, `Kontynent ${cont.id} ma zbyt mało krajów: ${count}`);
    }

    for (const cat of LOGO_CATEGORIES) {
      const count = LOGOS_DATA.filter(l => l.category === cat.id).length;
      assert.ok(count >= 20, `Kategoria logotypów ${cat.id} ma zbyt mało marek: ${count}`);
    }
  });
});
