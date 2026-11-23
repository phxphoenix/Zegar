import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as flagsDataModule from '../js/modules/flagsLogosData.js';
import { FLAG_CONTINENTS, FLAGS_DATA } from '../js/modules/flagsLogosData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

describe('flagsLogosData - Baza danych flag krajów świata (gałąź biznesowa, bez logotypów)', () => {
  it('nie zawiera logotypów marek ani kategorii marek (brak ryzyka znaków towarowych)', () => {
    assert.strictEqual(flagsDataModule.LOGOS_DATA, undefined, 'Gałąź biznesowa nie może eksportować LOGOS_DATA');
    assert.strictEqual(flagsDataModule.LOGO_CATEGORIES, undefined, 'Gałąź biznesowa nie może eksportować LOGO_CATEGORIES');
  });

  it('zawiera 6 kontynentów dla flag', () => {
    assert.ok(Array.isArray(FLAG_CONTINENTS));
    assert.strictEqual(FLAG_CONTINENTS.length, 6);
    const continentIds = FLAG_CONTINENTS.map(c => c.id);
    assert.deepStrictEqual(
      continentIds,
      ['europe', 'asia', 'africa', 'north_america', 'south_america', 'oceania']
    );
  });

  it('zawiera wszystkie flagi krajów świata (min. 195 państw)', () => {
    assert.ok(Array.isArray(FLAGS_DATA));
    assert.ok(FLAGS_DATA.length >= 195, `Oczekiwano min. 195 flag krajów świata, znaleziono: ${FLAGS_DATA.length}`);
  });

  it('wszystkie flagi posiadają unikalne id, kody ISO, lokalne pliki SVG offline oraz pełne opisy PL/EN', () => {
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

      assert.strictEqual(
        flag.flagUrl,
        `./assets/flags/${flag.code}.svg`,
        `Flaga ${flag.id} powinna używać lokalnej ścieżki offline ./assets/flags/${flag.code}.svg`
      );
      const localSvgPath = path.join(ROOT_DIR, 'assets', 'flags', `${flag.code}.svg`);
      assert.ok(fs.existsSync(localSvgPath), `Brak lokalnego pliku SVG na dysku: ${localSvgPath}`);

      assert.ok(flag.hintPl && flag.hintPl.length >= 20, `Zbyt krótki opis podpowiedzi PL dla ${flag.id}`);
      assert.ok(flag.hintEn && flag.hintEn.length >= 20, `Zbyt krótki opis podpowiedzi EN dla ${flag.id}`);
    }
  });

  it('każdy kontynent posiada co najmniej 10 państw', () => {
    for (const cont of FLAG_CONTINENTS) {
      const count = FLAGS_DATA.filter(f => f.continent === cont.id).length;
      assert.ok(count >= 10, `Kontynent ${cont.id} ma zbyt mało krajów: ${count}`);
    }
  });
});
