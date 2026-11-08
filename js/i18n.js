// ============================================================================
// SŁOWNIK WIELOJĘZYCZNY (PL / EN)
// Struktura przygotowana pod łatwe dodawanie kolejnych modułów przedmiotowych
// ============================================================================

export const i18n = {
  pl: {
    appTitle: 'Akademia Bystrzaka – Nauka przez zabawę',
    score: '🔥 Wynik',
    rankingBtn: '🏆 Ranking',
    rankingTitle: '🏆 Ranking Top 10',
    rankingTitleForModule: (modLabel) => `🏆 Top 10 – ${modLabel}`,
    newRecordMsg: (pts) => `🎉 Brawo! Wynik ${pts} pkt daje miejsce w Top 10 tej sekcji! Wpisz imię:`,
    namePlaceholder: 'Wpisz swoje imię...',
    saveBtn: 'Zapisz',
    savingBtn: 'Zapisywanie...',
    closeBtn: 'Zamknij',
    emptyRanking: 'Brak zapisanych wyników w tej sekcji. Rozwiąż zadania i bądź pierwszy!',
    loadingRanking: '⏳ Pobieranie rankingu...',
    ptsUnit: 'pkt',
    syncCloudOk: '☁️ Wspólny ranking online (Firebase)',
    syncLocalFallback: '💾 Tryb lokalny (uzupełnij FIREBASE_DB_URL dla synchronizacji)',
    syncCloudError: '⚠️ Błąd połączenia z chmurą – wyświetlono kopię lokalną',
    defaultPlayerName: 'Gracz',
    hidePanel: '👁️ Ukryj opcje',
    showPanel: '⚙️ Opcje',
    correct: '✅ Brawo! Za chwilę kolejne zadanie...',
    wrong: '❌ Błąd! Seria wyzerowana – spróbuj znaleźć poprawną odpowiedź.',
    wrongWithScore: (pts) => `❌ Błąd! Koniec serii (twój wynik: ${pts} pkt). Spróbuj jeszcze raz!`,

    // Zakończenie quizu i pora spać
    headerFinishBtn: (pts) => pts > 0 ? `🌙 Koniec (${pts})` : '🌙 Koniec',
    finishQuizBtnZero: 'Koniec na dziś',
    finishQuizBtnActive: (pts) => `Zakończ i zapisz (${pts} pkt)`,
    finishQuizTip: 'Zmęczony? Możesz zapisać wynik i odpocząć!',
    finishQuizHintZero: '🌙 Brak punktów w bieżącej serii – rozwiąż chociaż jedno zadanie, aby zapisać wynik!',
    finishGoodnightTitle: '🌙 Pora spać! Dobra robota!',
    finishGoodnightSub: (pts, min, diff) =>
      `Zdobyłeś <strong>${pts} pkt</strong>. Do wejścia do Top 10 w tej sekcji potrzeba minimum <strong>${min} pkt</strong> (brakuje jeszcze <strong>${diff} pkt</strong>).`,
    finishYourScoreLbl: 'Twój wynik',
    finishTop10ThresholdLbl: 'Próg Top 10',
    finishContinueBtn: '💪 Gram dalej (chcę do Top 10!)',
    finishSleepBtn: '🌙 Idę spać (zakończ serię)',
    finishViewRankingBtn: '🏆 Zobacz pełny ranking Top 10',
    finishSavedFeedback: '🎉 Wynik zapisany w Top 10! Słodkich snów i do jutra! 🌙😴',
    finishSleepFeedback: '🌙 Dobrej nocy i kolorowych snów! Odpocznij przed kolejnymi wyzwaniami! ⭐',
    finishRecordBedtimeMsg: (pts) => `🌙 Świetny wynik na dobranoc! ${pts} pkt daje miejsce w Top 10! Wpisz swoje imię:`,

    // Nazwy modułów w górnym pasku
    modules: {
      clock: {
        navLabel: '🕒 Zegar',
        questionTitle: 'Która godzina jest na zegarze?'
      },
      math: {
        navLabel: '🧮 Matematyka',
        questionTitle: 'Ile to jest? Wybierz poprawny wynik:'
      },
      orthography: {
        navLabel: '✍️ Ortografia',
        questionTitle: 'Jak poprawnie zapisać ten wyraz?',
        questionTitleByMode: {
          gap: 'Jaką literę lub dwuznak należy wstawić w lukę?',
          word: 'Który wyraz jest napisany poprawnie?',
          spot: 'Bystre oko: wskaż jedyny wyraz napisany BEZ błędu!'
        }
      }
    },

    // Plakietki w rankingu
    badges: {
      clockDigital: '🕒 Zegar • Cyfrowy',
      clockWords: '🕒 Zegar • Słownie',
      mathPrefix: '🧮 Matematyka',
      orthoPrefix: '✍️ Ortografia',
      gradeShort: (g) => `Kl. ${g}`
    },

    // Moduł: Zegar
    clock: {
      hourHand: 'Godzinowa (krótka)',
      minHand: 'Minutowa (długa)',
      panelTitle: 'Ustawienia zegara',
      randomBtn: '🎲 Losuj czas',
      lblHours: 'Godzina (0-23)',
      lblMinutes: 'Minuty (0-59)',
      lblMode: 'Format odpowiedzi',
      modeDigital: '🔢 Cyfrowy (np. 15:30 / 09:15)',
      modeWords: '💬 Słownie (np. wpół do czwartej)',
      btnApply: 'Ustaw',
      btnApplyHide: 'Ustaw i ukryj',
      periods: {
        night: 'W nocy',
        morning: 'Rano',
        afternoon: 'Po południu',
        evening: 'Wieczorem'
      }
    },

    // Moduł: Matematyka
    math: {
      panelTitle: 'Konfiguracja matematyki',
      randomBtn: '🎲 Nowe zadanie',
      lblGrade: 'Poziom trudności (Szkoła Podstawowa)',
      grades: {
        1: { name: '🎒 Klasa 1', desc: 'Dodawanie i odejmowanie do 20, wstęp do mnożenia/dzielenia' },
        2: { name: '📘 Klasa 2', desc: 'Działania do 100, tabliczka mnożenia i dzielenia do 50' },
        3: { name: '🎓 Klasa 3', desc: 'Działania do 100 i 1000, pełna tabliczka mnożenia do 100' }
      },
      lblOperations: 'Ćwiczone działania (wybierz min. 1)',
      ops: {
        add: { label: '➕ Dodawanie', short: '➕ Dodawanie', symbol: '+' },
        sub: { label: '➖ Odejmowanie', short: '➖ Odejmowanie', symbol: '−' },
        mul: { label: '✖️ Mnożenie', short: '✖️ Mnożenie', symbol: '×' },
        div: { label: '➗ Dzielenie', short: '➗ Dzielenie', symbol: ':' }
      },
      showHintBtn: '💡 Pokaż podpowiedź',
      hideHintBtn: '🙈 Ukryj podpowiedź',
      hintTitle: 'Podpowiedź krok po kroku:',
      hints: {
        tenFrameAdd: (a, b, toTen, rest) =>
          toTen > 0 && rest > 0
            ? `Dopełnij do 10: najpierw <strong>${a} + ${toTen} = 10</strong>, a potem dodaj pozostałe <strong>${rest}</strong> kropki.`
            : `Policz niebieskie kropki (<strong>${a}</strong>) i dolicz zielone (<strong>${b}</strong>).`,
        tenFrameSub: (a, b) =>
          `Z <strong>${a}</strong> kropek skreślamy <strong>${b}</strong> (czerwone ✕). Policz, ile kropek zostało!`,
        decomposeAdd: (a, b, tensA, onesA, tensB, onesB) =>
          `Rozbij na dziesiątki i jedności: <strong>(${tensA} + ${tensB})</strong> oraz <strong>(${onesA} + ${onesB})</strong>.`,
        decomposeSub: (a, b, tensB, onesB) =>
          tensB > 0 && onesB > 0
            ? `Odejmij najpierw dziesiątki: <strong>${a} − ${tensB} = ${a - tensB}</strong>, a potem jedności: <strong>${a - tensB} − ${onesB}</strong>.`
            : `Odejmij krok po kroku dziesiątki i jedności.`,
        decomposeLargeAdd: (a, b) =>
          `Policz najpierw setki i dziesiątki, a na końcu jedności: <strong>${a} + ${b}</strong>.`,
        decomposeLargeSub: (a, b, hundredsB, restB) =>
          hundredsB > 0 && restB > 0
            ? `Odejmij najpierw <strong>${a} − ${hundredsB} = ${a - hundredsB}</strong>, a potem jeszcze <strong>${restB}</strong>.`
            : `Odejmij setki od setek i dziesiątki od dziesiątek.`,
        mulGroups: (a, b, sumStr) =>
          `<strong>${a} × ${b}</strong> to inaczej <strong>${a}</strong> grupy po <strong>${b}</strong> elementów (${sumStr}).`,
        divGroups: (a, b) =>
          `Rozdzielamy <strong>${a}</strong> po równo na <strong>${b}</strong> pudełka. Pomyśl: <strong>? × ${b} = ${a}</strong>.`
      }
    },

    // Moduł: Ortografia
    orthography: {
      panelTitle: 'Konfiguracja ortografii',
      randomBtn: '🎲 Nowe słówko',
      lblGrade: 'Poziom trudności (Szkoła Podstawowa)',
      grades: {
        1: { name: '🎒 Klasa 1', desc: 'Podstawowe słówka z elementarza, proste oboczności (ó→o, rz→r, ch→sz) i wyrazy z ó/u, rz/ż, ch/h' },
        2: { name: '📘 Klasa 2', desc: 'Szerszy słownik, przyrostki -ówka, -unek, rz po spółgłoskach, oboczności ó→e, ż→g/dz' },
        3: { name: '🎓 Klasa 3', desc: 'Trudniejsze wyrazy słownikowe, oboczności ó→a, ż→h/s, wyjątki (pszczoła, kształt, skuwka, druh)' }
      },
      lblCategories: 'Ćwiczone trudności (wybierz min. 1)',
      categories: {
        u_o: { label: '🅰️ Ó oraz U', short: 'Ó / U' },
        rz_z: { label: '🅱️ RZ oraz Ż', short: 'RZ / Ż' },
        ch_h: { label: '🅲 CH oraz H', short: 'CH / H' }
      },
      lblRuleFilter: 'Rodzaj wyrazów (filtr reguł)',
      ruleFilters: {
        all: { label: '🌟 Wszystkie', desc: 'Mieszane: wyrazy z obocznościami, zasadami i do zapamiętania' },
        explainable: { label: '🔄 Oboczności i zasady', desc: 'Tylko wyrazy wymienne (np. ó→o, rz→r, ż→g) i oparte na regule' },
        memory: { label: '🧠 Do zapamiętania', desc: 'Tylko wyrazy niewymienne (słownikowe) oraz wyjątki' }
      },
      lblQuizMode: 'Tryb wyzwania',
      quizModes: {
        gap: { label: '🧩 Uzupełnij lukę (litery)', short: 'Luka' },
        word: { label: '📝 Pełne wyrazy (4 warianty)', short: 'Wyrazy' },
        spot: { label: '🔍 Bystre oko (znajdź poprawny)', short: 'Bystre oko' }
      },
      lblContextToggle: '💬 Pokazuj zdanie przykładowe na scenie',
      showHintBtn: '💡 Pokaż podpowiedź (oboczność / zasada)',
      hideHintBtn: '🙈 Ukryj podpowiedź',
      ruleBadges: {
        alternation: '🔄 Wyraz wymienny (oboczność)',
        rule: '📏 Zasada ortograficzna',
        memory: '🧠 Wyraz do zapamiętania'
      },
      spotStageTitle: 'Detektyw Ortografii',
      spotStageSubtitle: 'Trzy poniższe wyrazy mają błąd ortograficzny, a tylko JEDEN jest napisany poprawnie!',
      wordStagePrompt: 'Wskaż poprawną pisownię wyrazu pasującego do ilustracji i zdania:',
      enGlossPrefix: '🇬🇧 Ang.:'
    }
  },

  en: {
    appTitle: 'Smart Kids Academy – Learn & Play',
    score: '🔥 Score',
    rankingBtn: '🏆 Ranking',
    rankingTitle: '🏆 Top 10 Leaderboard',
    rankingTitleForModule: (modLabel) => `🏆 Top 10 – ${modLabel}`,
    newRecordMsg: (pts) => `🎉 Awesome! ${pts} pts makes the Top 10 in this section! Enter your name:`,
    namePlaceholder: 'Enter your name...',
    saveBtn: 'Save',
    savingBtn: 'Saving...',
    closeBtn: 'Close',
    emptyRanking: 'No scores in this section yet. Answer questions and be the first!',
    loadingRanking: '⏳ Loading leaderboard...',
    ptsUnit: 'pts',
    syncCloudOk: '☁️ Shared online leaderboard (Firebase)',
    syncLocalFallback: '💾 Local mode (set FIREBASE_DB_URL for cloud sync)',
    syncCloudError: '⚠️ Cloud connection error – showing local backup',
    defaultPlayerName: 'Player',
    hidePanel: '👁️ Hide options',
    showPanel: '⚙️ Options',
    correct: '✅ Great job! Next question coming up...',
    wrong: '❌ Wrong! Streak reset – try to find the right answer.',
    wrongWithScore: (pts) => `❌ Wrong! Streak ended (your score: ${pts} pts). Try again!`,

    // Finish quiz and bedtime
    headerFinishBtn: (pts) => pts > 0 ? `🌙 Done (${pts})` : '🌙 Done',
    finishQuizBtnZero: 'Done for today',
    finishQuizBtnActive: (pts) => `Finish & save (${pts} pts)`,
    finishQuizTip: 'Tired? You can save your score and call it a day!',
    finishQuizHintZero: '🌙 No points in this streak yet – solve at least one question to save your score!',
    finishGoodnightTitle: '🌙 Bedtime! Great job!',
    finishGoodnightSub: (pts, min, diff) =>
      `You scored <strong>${pts} pts</strong>. Top 10 in this section requires <strong>${min} pts</strong> (just <strong>${diff} pts</strong> more needed).`,
    finishYourScoreLbl: 'Your score',
    finishTop10ThresholdLbl: 'Top 10 threshold',
    finishContinueBtn: '💪 Keep playing (aim for Top 10!)',
    finishSleepBtn: '🌙 Go to sleep (end streak)',
    finishViewRankingBtn: '🏆 View full Top 10 leaderboard',
    finishSavedFeedback: '🎉 Score saved in Top 10! Sweet dreams and see you tomorrow! 🌙😴',
    finishSleepFeedback: '🌙 Good night and sweet dreams! Rest up for tomorrow\'s challenges! ⭐',
    finishRecordBedtimeMsg: (pts) => `🌙 Great bedtime score! ${pts} pts makes the Top 10! Enter your name:`,

    modules: {
      clock: {
        navLabel: '🕒 Clock',
        questionTitle: 'What time is it on the clock?'
      },
      math: {
        navLabel: '🧮 Math',
        questionTitle: 'What is the result? Pick the right answer:'
      },
      orthography: {
        navLabel: '✍️ Polish Spelling',
        questionTitle: 'How do you spell this Polish word correctly?',
        questionTitleByMode: {
          gap: 'Which letter or digraph belongs in the gap?',
          word: 'Which Polish spelling is correct?',
          spot: 'Sharp Eye: spot the ONLY word spelled WITHOUT an error!'
        }
      }
    },

    badges: {
      clockDigital: '🕒 Clock • Digital',
      clockWords: '🕒 Clock • Words',
      mathPrefix: '🧮 Math',
      orthoPrefix: '✍️ Spelling',
      gradeShort: (g) => `Gr. ${g}`
    },

    clock: {
      hourHand: 'Hour hand (short)',
      minHand: 'Minute hand (long)',
      minHandShort: 'Min',
      panelTitle: 'Clock settings',
      randomBtn: '🎲 Random time',
      lblHours: 'Hour (0-23)',
      lblMinutes: 'Minutes (0-59)',
      lblMode: 'Answer format',
      modeDigital: '🔢 Digital (e.g. 15:30 / 09:15)',
      modeWords: '💬 In words (English)',
      btnApply: 'Set time',
      btnApplyHide: 'Set & Hide',
      periods: {
        night: 'At night',
        morning: 'In the morning',
        afternoon: 'In the afternoon',
        evening: 'In the evening'
      }
    },

    math: {
      panelTitle: 'Math configuration',
      randomBtn: '🎲 New question',
      lblGrade: 'Difficulty level (Primary School)',
      grades: {
        1: { name: '🎒 Grade 1', desc: 'Add & subtract up to 20, intro to multiply/divide' },
        2: { name: '📘 Grade 2', desc: 'Operations up to 100, times tables up to 50' },
        3: { name: '🎓 Grade 3', desc: 'Operations up to 100 & 1000, full times tables up to 100' }
      },
      lblOperations: 'Practiced operations (pick at least 1)',
      ops: {
        add: { label: '➕ Addition', short: '➕ Addition', symbol: '+' },
        sub: { label: '➖ Subtraction', short: '➖ Subtraction', symbol: '−' },
        mul: { label: '✖️ Multiplication', short: '✖️ Multiplication', symbol: '×' },
        div: { label: '➗ Division', short: '➗ Division', symbol: '÷' }
      },
      showHintBtn: '💡 Show visual hint',
      hideHintBtn: '🙈 Hide hint',
      hintTitle: 'Step-by-step visual hint:',
      hints: {
        tenFrameAdd: (a, b, toTen, rest) =>
          toTen > 0 && rest > 0
            ? `Make 10 first: <strong>${a} + ${toTen} = 10</strong>, then add the remaining <strong>${rest}</strong> dots.`
            : `Count the blue dots (<strong>${a}</strong>) and add the green ones (<strong>${b}</strong>).`,
        tenFrameSub: (a, b) =>
          `Start with <strong>${a}</strong> dots and cross out <strong>${b}</strong> (red ✕). Count how many are left!`,
        decomposeAdd: (a, b, tensA, onesA, tensB, onesB) =>
          `Split into tens and ones: <strong>(${tensA} + ${tensB})</strong> and <strong>(${onesA} + ${onesB})</strong>.`,
        decomposeSub: (a, b, tensB, onesB) =>
          tensB > 0 && onesB > 0
            ? `Subtract tens first: <strong>${a} − ${tensB} = ${a - tensB}</strong>, then subtract ones: <strong>${a - tensB} − ${onesB}</strong>.`
            : `Subtract tens and ones step by step.`,
        decomposeLargeAdd: (a, b) =>
          `Add hundreds and tens first, then ones: <strong>${a} + ${b}</strong>.`,
        decomposeLargeSub: (a, b, hundredsB, restB) =>
          hundredsB > 0 && restB > 0
            ? `Subtract <strong>${a} − ${hundredsB} = ${a - hundredsB}</strong> first, then subtract <strong>${restB}</strong>.`
            : `Subtract hundreds from hundreds and tens from tens.`,
        mulGroups: (a, b, sumStr) =>
          `<strong>${a} × ${b}</strong> means <strong>${a}</strong> groups of <strong>${b}</strong> items (${sumStr}).`,
        divGroups: (a, b) =>
          `Share <strong>${a}</strong> equally into <strong>${b}</strong> boxes. Think: <strong>? × ${b} = ${a}</strong>.`
      }
    },

    // Moduł: Ortografia (Polish Orthography with English UI support)
    orthography: {
      panelTitle: 'Polish Spelling Configuration',
      randomBtn: '🎲 New word',
      lblGrade: 'Difficulty level (Primary School)',
      grades: {
        1: { name: '🎒 Grade 1', desc: 'Basic words, simple alternations (ó→o, rz→r, ch→sz) and core ó/u, rz/ż, ch/h vocabulary' },
        2: { name: '📘 Grade 2', desc: 'Broader vocabulary, suffixes -ówka, -unek, rz after consonants, ó→e and ż→g/dz alternations' },
        3: { name: '🎓 Grade 3', desc: 'Advanced words, ó→a and ż→h/s alternations, spelling exceptions (pszczoła, kształt, skuwka, druh)' }
      },
      lblCategories: 'Practiced spelling pairs (pick at least 1)',
      categories: {
        u_o: { label: '🅰️ Ó and U', short: 'Ó / U' },
        rz_z: { label: '🅱️ RZ and Ż', short: 'RZ / Ż' },
        ch_h: { label: '🅲 CH and H', short: 'CH / H' }
      },
      lblRuleFilter: 'Word rule filter',
      ruleFilters: {
        all: { label: '🌟 All words', desc: 'Mixed: alternating words, rule-based words, and words to memorize' },
        explainable: { label: '🔄 Alternations & rules', desc: 'Only words explained by root alternation (e.g. ó→o, rz→r) or a rule' },
        memory: { label: '🧠 Memorize & exceptions', desc: 'Only non-alternating dictionary words and exceptions' }
      },
      lblQuizMode: 'Challenge mode',
      quizModes: {
        gap: { label: '🧩 Fill the gap (letters)', short: 'Gap' },
        word: { label: '📝 Full words (4 variants)', short: 'Words' },
        spot: { label: '🔍 Sharp eye (find the right one)', short: 'Sharp eye' }
      },
      lblContextToggle: '💬 Show example sentence on stage',
      showHintBtn: '💡 Show hint (alternation / rule)',
      hideHintBtn: '🙈 Hide hint',
      ruleBadges: {
        alternation: '🔄 Root alternation',
        rule: '📏 Spelling rule',
        memory: '🧠 Word to memorize'
      },
      spotStageTitle: 'Spelling Detective',
      spotStageSubtitle: 'Three words below contain a spelling mistake, and only ONE is written correctly!',
      wordStagePrompt: 'Pick the correct spelling for the word matching the picture and sentence:',
      enGlossPrefix: '🇬🇧 Meaning:'
    }
  }
};
