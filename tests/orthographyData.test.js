import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ORTHOGRAPHY_WORDS, ORTHOGRAPHY_CATEGORIES } from '../js/modules/orthographyData.js';

describe('orthographyData - Baza słówek ortograficznych', () => {
  it('zawiera zdefiniowane kategorie ortograficzne (u_o, rz_z, ch_h)', () => {
    assert.ok(Array.isArray(ORTHOGRAPHY_CATEGORIES));
    assert.strictEqual(ORTHOGRAPHY_CATEGORIES.length, 3);
    const catIds = ORTHOGRAPHY_CATEGORIES.map(c => c.id);
    assert.deepStrictEqual(catIds.sort(), ['ch_h', 'rz_z', 'u_o']);
  });

  it('baza słówek nie jest pusta i zawiera bogaty zbiór (powyżej 100 haseł)', () => {
    assert.ok(Array.isArray(ORTHOGRAPHY_WORDS));
    assert.ok(ORTHOGRAPHY_WORDS.length >= 100, `Oczekiwano min. 100 słówek, znaleziono: ${ORTHOGRAPHY_WORDS.length}`);
  });

  it('wszystkie słówka posiadają unikalne identyfikatory (id)', () => {
    const ids = new Set();
    for (const item of ORTHOGRAPHY_WORDS) {
      assert.ok(item.id, `Brak pola id w obiekcie: ${JSON.stringify(item)}`);
      assert.ok(!ids.has(item.id), `Zduplikowane id: "${item.id}"`);
      ids.add(item.id);
    }
  });

  it('każdy wpis spełnia pełną walidację schematu danych', () => {
    const validGrades = new Set([1, 2, 3]);
    const validCategories = new Set(['u_o', 'rz_z', 'ch_h']);
    const validRuleTypes = new Set(['alternation', 'rule', 'memory']);

    for (const item of ORTHOGRAPHY_WORDS) {
      const label = `Słówko "${item.word}" (id: ${item.id})`;

      assert.ok(validGrades.has(item.grade), `${label} ma niepoprawną klasę: ${item.grade}`);
      assert.ok(validCategories.has(item.category), `${label} ma niepoprawną kategorię: ${item.category}`);
      assert.ok(validRuleTypes.has(item.ruleType), `${label} ma niepoprawny ruleType: ${item.ruleType}`);

      assert.strictEqual(typeof item.word, 'string', `${label} brak stringa word`);
      assert.ok(item.word.length >= 2, `${label} wyraz zbyt krótki`);

      assert.ok(item.masked && item.masked.includes('_'), `${label} masked musi zawierać znak podkreślenia '_'`);
      assert.strictEqual(typeof item.target, 'string', `${label} target musi być stringiem`);
      assert.ok(item.target.length >= 1, `${label} target nie może być pusty`);

      // Weryfikacja spójności maski z targetem
      const reconstructed = item.masked.replace(/_+/g, item.target);
      assert.strictEqual(
        reconstructed.toLowerCase(),
        item.word.toLowerCase(),
        `${label} Rekonstrukcja "${reconstructed}" nie pasuje do wyrazu "${item.word}"`
      );

      // Błędny zapis (wrongWord)
      assert.strictEqual(typeof item.wrongWord, 'string', `${label} brak wrongWord`);
      assert.notStrictEqual(item.wrongWord, item.word, `${label} wrongWord nie może być identyczny z poprawnym word!`);

      // Dystraktory (distractorWords)
      assert.ok(Array.isArray(item.distractorWords), `${label} distractorWords musi być tablicą`);
      assert.ok(item.distractorWords.length >= 3, `${label} wymaga co najmniej 3 dystraktorów`);
      for (const dw of item.distractorWords) {
        assert.notStrictEqual(dw, item.word, `${label} dystraktor "${dw}" nie może być poprawnym słowem`);
      }

      // Opcje literowe (letterOptions)
      assert.ok(Array.isArray(item.letterOptions), `${label} letterOptions musi być tablicą`);
      assert.ok(item.letterOptions.length >= 2, `${label} wymaga co najmniej 2 opcji literowych`);
      assert.ok(
        item.letterOptions.includes(item.target),
        `${label} letterOptions ${JSON.stringify(item.letterOptions)} musi zawierać target "${item.target}"`
      );

      // Zdanie kontekstowe i emoji
      assert.ok(item.emoji && item.emoji.length > 0, `${label} brak emoji`);
      assert.ok(
        item.sentence && item.sentence.includes('___'),
        `${label} zdanie kontekstowe musi zawierać potrójne podkreślenie '___'`
      );

      // Tłumaczenie i wskazówki
      assert.ok(item.enMeaning && item.enMeaning.length > 0, `${label} brak enMeaning`);
      assert.ok(item.alternation && item.alternation.length > 0, `${label} brak etykiety alternation`);
      assert.ok(item.hintPl && item.hintPl.length > 0, `${label} brak hintPl`);
      assert.ok(item.hintEn && item.hintEn.length > 0, `${label} brak hintEn`);
    }
  });

  it('posiada zrównoważoną dystrybucję słówek pomiędzy klasami 1, 2 i 3', () => {
    const byGrade = { 1: 0, 2: 0, 3: 0 };
    for (const item of ORTHOGRAPHY_WORDS) {
      byGrade[item.grade]++;
    }

    assert.ok(byGrade[1] >= 20, `Za mało słówek dla klasy 1: ${byGrade[1]}`);
    assert.ok(byGrade[2] >= 20, `Za mało słówek dla klasy 2: ${byGrade[2]}`);
    assert.ok(byGrade[3] >= 20, `Za mało słówek dla klasy 3: ${byGrade[3]}`);
  });

  it('posiada reprezentację wszystkich 3 kategorii w każdej klasie', () => {
    for (const g of [1, 2, 3]) {
      for (const cat of ['u_o', 'rz_z', 'ch_h']) {
        const matching = ORTHOGRAPHY_WORDS.filter(w => w.grade === g && w.category === cat);
        assert.ok(
          matching.length >= 5,
          `Klasa ${g}, kategoria ${cat} ma zbyt mało słówek (${matching.length}, wymagane min. 5)`
        );
      }
    }
  });
});
