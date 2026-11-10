import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { i18n } from '../js/i18n.js';

describe('i18n - Słownik wielojęzyczny', () => {
  it('zawiera obsługę języka polskiego (pl) i angielskiego (en)', () => {
    assert.ok(i18n.pl, 'Brakuje słownika języka polskiego (pl)');
    assert.ok(i18n.en, 'Brakuje słownika języka angielskiego (en)');
  });

  it('posiada zgodne klucze podstawowego interfejsu w obu językach', () => {
    const requiredKeys = [
      'appTitle',
      'score',
      'rankingBtn',
      'rankingTitle',
      'namePlaceholder',
      'saveBtn',
      'savingBtn',
      'closeBtn',
      'emptyRanking',
      'loadingRanking',
      'ptsUnit',
      'syncCloudOk',
      'syncLocalFallback',
      'syncCloudError',
      'defaultPlayerName',
      'hidePanel',
      'showPanel',
      'correct',
      'wrong',
      'finishQuizBtnZero',
      'finishQuizTip',
      'finishQuizHintZero',
      'finishGoodnightTitle',
      'finishYourScoreLbl',
      'finishTop10ThresholdLbl',
      'finishContinueBtn',
      'finishSleepBtn',
      'finishViewRankingBtn',
      'finishSavedFeedback',
      'finishSleepFeedback'
    ];

    for (const key of requiredKeys) {
      assert.strictEqual(typeof i18n.pl[key], 'string', `Brak stringa pl.${key}`);
      assert.strictEqual(typeof i18n.en[key], 'string', `Brak stringa en.${key}`);
      assert.ok(i18n.pl[key].length > 0, `Pusty string w pl.${key}`);
      assert.ok(i18n.en[key].length > 0, `Pusty string w en.${key}`);
    }
  });

  it('poprawnie formatuje dynamiczne komunikaty rankingowe i zakończenia', () => {
    // rankingTitleForModule
    assert.strictEqual(i18n.pl.rankingTitleForModule('Zegar'), '🏆 Top 10 – Zegar');
    assert.strictEqual(i18n.en.rankingTitleForModule('Clock'), '🏆 Top 10 – Clock');

    // newRecordMsg
    const plRec = i18n.pl.newRecordMsg(15);
    assert.ok(plRec.includes('15 pkt'), 'pl.newRecordMsg powinno zawierać "15 pkt"');
    const enRec = i18n.en.newRecordMsg(15);
    assert.ok(enRec.includes('15 pts'), 'en.newRecordMsg powinno zawierać "15 pts"');

    // wrongWithScore
    assert.ok(i18n.pl.wrongWithScore(7).includes('7 pkt'));
    assert.ok(i18n.en.wrongWithScore(7).includes('7 pts'));

    // headerFinishBtn
    assert.strictEqual(i18n.pl.headerFinishBtn(0), '🌙 Koniec');
    assert.strictEqual(i18n.pl.headerFinishBtn(5), '🌙 Koniec (5)');
    assert.strictEqual(i18n.en.headerFinishBtn(0), '🌙 Done');
    assert.strictEqual(i18n.en.headerFinishBtn(5), '🌙 Done (5)');

    // finishQuizBtnActive
    assert.strictEqual(i18n.pl.finishQuizBtnActive(10), 'Zakończ i zapisz (10 pkt)');
    assert.strictEqual(i18n.en.finishQuizBtnActive(10), 'Finish & save (10 pts)');

    // finishGoodnightSub
    const plSub = i18n.pl.finishGoodnightSub(4, 10, 6);
    assert.ok(plSub.includes('4 pkt') && plSub.includes('10 pkt') && plSub.includes('6 pkt'));
    const enSub = i18n.en.finishGoodnightSub(4, 10, 6);
    assert.ok(enSub.includes('4 pts') && enSub.includes('10 pts') && enSub.includes('6 pts'));

    // finishRecordBedtimeMsg
    assert.ok(i18n.pl.finishRecordBedtimeMsg(12).includes('12 pkt'));
    assert.ok(i18n.en.finishRecordBedtimeMsg(12).includes('12 pts'));
  });

  it('posiada kompletną strukturę modułów (clock, math, orthography, flags_logos)', () => {
    const modules = ['clock', 'math', 'orthography', 'flags_logos'];
    for (const mod of modules) {
      assert.ok(i18n.pl.modules[mod], `Brak sekcji pl.modules.${mod}`);
      assert.ok(i18n.en.modules[mod], `Brak sekcji en.modules.${mod}`);
      assert.ok(i18n.pl.modules[mod].navLabel, `Brak pl.modules.${mod}.navLabel`);
      assert.ok(i18n.en.modules[mod].navLabel, `Brak en.modules.${mod}.navLabel`);
    }

    // Ortografia posiada specyficzne pytania dla każdego z trybów
    const modes = ['gap', 'word', 'spot'];
    for (const m of modes) {
      assert.ok(i18n.pl.modules.orthography.questionTitleByMode[m], `Brak pytania dla trybu ${m} w pl`);
      assert.ok(i18n.en.modules.orthography.questionTitleByMode[m], `Brak pytania dla trybu ${m} w en`);
    }

    // Flaga/Logo posiada specyficzne pytania dla flag i logotypów
    for (const flMode of ['flags', 'logos']) {
      assert.ok(i18n.pl.modules.flags_logos.questionTitleByMode[flMode]);
      assert.ok(i18n.en.modules.flags_logos.questionTitleByMode[flMode]);
    }
  });

  it('weryfikuje konfigurację i podpowiedzi modułu matematyki', () => {
    for (const lang of ['pl', 'en']) {
      const math = i18n[lang].math;
      assert.ok(math.panelTitle);
      assert.ok(math.randomBtn);
      assert.ok(math.grades[1] && math.grades[2] && math.grades[3]);

      for (const op of ['add', 'sub', 'mul', 'div']) {
        assert.ok(math.ops[op].label, `Brak op label dla ${op} w ${lang}`);
        assert.ok(math.ops[op].symbol, `Brak op symbol dla ${op} w ${lang}`);
      }

      // Funkcje podpowiedzi
      assert.ok(typeof math.hints.tenFrameAdd === 'function');
      assert.ok(typeof math.hints.tenFrameSub === 'function');
      assert.ok(typeof math.hints.decomposeAdd === 'function');
      assert.ok(typeof math.hints.decomposeSub === 'function');
      assert.ok(typeof math.hints.decomposeLargeAdd === 'function');
      assert.ok(typeof math.hints.decomposeLargeSub === 'function');
      assert.ok(typeof math.hints.mulGroups === 'function');
      assert.ok(typeof math.hints.divGroups === 'function');

      const tenAddStr = math.hints.tenFrameAdd(8, 5, 2, 3);
      assert.ok(tenAddStr.includes('8') && tenAddStr.includes('10'));
    }
  });

  it('weryfikuje konfigurację modułu ortografii', () => {
    for (const lang of ['pl', 'en']) {
      const ortho = i18n[lang].orthography;
      assert.ok(ortho.panelTitle);
      assert.ok(ortho.grades[1] && ortho.grades[2] && ortho.grades[3]);

      for (const cat of ['u_o', 'rz_z', 'ch_h']) {
        assert.ok(ortho.categories[cat].label);
        assert.ok(ortho.categories[cat].short);
      }

      for (const filter of ['all', 'explainable', 'memory']) {
        assert.ok(ortho.ruleFilters[filter].label);
        assert.ok(ortho.ruleFilters[filter].desc);
      }

      for (const mode of ['gap', 'word', 'spot']) {
        assert.ok(ortho.quizModes[mode].label);
        assert.ok(ortho.quizModes[mode].short);
      }

      for (const rule of ['alternation', 'rule', 'memory']) {
        assert.ok(ortho.ruleBadges[rule], `Brak etykiety odznaki reguły ${rule} w ${lang}`);
      }
    }
  });

  it('weryfikuje konfigurację modułu zegara', () => {
    for (const lang of ['pl', 'en']) {
      const clock = i18n[lang].clock;
      assert.ok(clock.hourHand);
      assert.ok(clock.minHand);
      assert.ok(clock.periods.night);
      assert.ok(clock.periods.morning);
      assert.ok(clock.periods.afternoon);
      assert.ok(clock.periods.evening);
    }
  });
});
