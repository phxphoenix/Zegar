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
    syncCloudOk: '💾 Prywatny ranking rodzinny (zapisany na urządzeniu)',
    syncLocalFallback: '💾 Prywatny ranking rodzinny (zapisany lokalnie na urządzeniu)',
    syncCloudError: '⚠️ Błąd połączenia – wyświetlono kopię lokalną',
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

    // Strefa Rodzica i Bramka Rodzicielska
    parentZoneBtn: '🛡️ Dla Rodziców',
    parentalGate: {
      title: '🛡️ Strefa Rodzica – Weryfikacja',
      desc: 'Aby otworzyć informacje dla rodziców i dokumenty prawne, rozwiąż krótkie zadanie dla dorosłych:',
      placeholder: 'Wpisz wynik...',
      confirmBtn: 'Potwierdź',
      cancelBtn: 'Anuluj',
      wrongAnswer: 'Niepoprawny wynik – spróbuj ponownie z nowym zadaniem.'
    },
    parentZone: {
      title: '🛡️ Strefa Rodzica',
      subtitle: 'Postępy dziecka, profile, karty pracy A4 oraz dokumenty prawne.',
      privacyLink: '🛡️ Polityka Prywatności (RODO / UE)',
      termsLink: '📄 Regulamin aplikacji',
      offlineNote: 'Wszystkie wyniki i statystyki zapisywane są wyłącznie lokalnie na tym urządzeniu.',
      tabs: {
        progress: '📊 Postępy',
        profiles: '👨‍👩‍👧‍👦 Profile',
        worksheets: '🖨️ Karty PDF',
        settings: '⚙️ PRO i Prawo'
      },
      overallAccuracy: 'Ogólna skuteczność',
      attemptsUnit: 'zadań',
      noStatsYet: 'Brak zapisanych odpowiedzi dla tego profilu. Rozwiąż kilka zadań w quizie!',
      mistakesTitle: 'Nad czym warto poćwiczyć (najczęstsze błędy):',
      noMistakesYet: 'Świetnie! Brak zapisanych błędów do powtórki.',
      resetStatsBtn: '🗑️ Wyczyść statystyki profilu',
      profilesIntro: 'Zarządzaj profilami rodzeństwa (w wersji Darmowej: 1 profil, w Bystrzak PRO: do 4 profili).',
      addProfilePlaceholder: 'Imię dziecka (np. Zosia)...',
      addProfileBtn: '+ Dodaj profil',
      profileActiveBadge: 'Aktywny',
      profileLimitNote: 'Osiągnięto limit 4 profili PRO.',
      profileProLockedNote: 'Dodawanie profili rodzeństwa (do 4 dzieci) dostępne w Bystrzak PRO.',
      unlockProBtn: '⭐ Sprawdź Bystrzak PRO',
      proStatusActive: 'Aktywny plan: ⭐ Bystrzak PRO',
      proStatusFree: 'Aktywny plan: Darmowy (Zegar + Klasa 1 + Europa)',
      proDemoToggleOn: 'Włącz podgląd PRO (tryb testowy)',
      proDemoToggleOff: 'Wróć do wersji Darmowej (tryb testowy)'
    },
    worksheet: {
      title: 'Generator Kart Pracy A4 (PDF)',
      desc: 'Wygeneruj czarno-biały arkusz do wydruku w domu wraz z kluczem odpowiedzi dla rodzica na 2. stronie.',
      typeLabel: 'Rodzaj arkusza',
      gradeLabelSelect: 'Poziom klasy',
      printBtn: '🖨️ Drukuj / Zapisz jako PDF',
      sheetTitle: 'Akademia Bystrzaka – Karta Pracy',
      answerKeyTitle: 'Klucz odpowiedzi (dla Rodzica)',
      studentLabel: 'Uczeń',
      dateLabel: 'Data',
      gradeLabel: (g) => `Klasa ${g}`,
      previewLimitNote: 'Podgląd wersji darmowej (4 zadania). Wersja Bystrzak PRO generuje pełne arkusze 12–20 zadań dla klas 1–3.',
      types: {
        math: '🧮 Matematyka',
        orthography: '✍️ Ortografia',
        mistakes: '🎯 Powtórka z błędów dziecka'
      }
    },
    proOffer: {
      title: '⭐ Bystrzak PRO – Pełna Akademia',
      subtitle: 'Jednorazowe odblokowanie pełnej wersji edukacyjnej. Bez abonamentów i bez reklam dla dzieci.',
      priceTag: '29 zł jednorazowo',
      freeColTitle: 'Darmowa',
      proColTitle: 'Bystrzak PRO',
      freeFeatures: [
        'Pełny moduł Zegar (cyfrowy i słowny)',
        'Matematyka i Ortografia – Klasa 1',
        'Flagi Europy + lokalny ranking',
        '1 profil dziecka + podgląd karty PDF (4 zad.)'
      ],
      proFeatures: [
        'Matematyka i Ortografia – Klasy 1, 2 i 3',
        'Wszystkie 6 kontynentów Flag (197 państw)',
        'Do 4 profili rodzeństwa na urządzeniu',
        'Pełny Generator Kart Pracy PDF A4 (12–20 zad.)',
        '100% bez reklam i bez subskrypcji'
      ],
      ctaBtn: '🚀 Odblokuj PRO (zapisz się na premierę)',
      restoreBtn: 'Przywróć zakup',
      fakeDoorThanks: '🎉 Dziękujemy za zainteresowanie! Wersja Bystrzak PRO startuje wkrótce — Twoja intencja została odnotowana. Możesz przetestować funkcje PRO w Strefie Rodzica (tryb testowy).',
      restoreInfo: 'Przywracanie zakupów będzie aktywne po uruchomieniu płatności sklepowych (Google Play / App Store).'
    },

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
      },
      flags_logos: {
        navLabel: '🚩 Flagi',
        questionTitle: 'Do jakiego kraju należy ta flaga?',
        questionTitleByMode: {
          flags: 'Do jakiego kraju należy ta flaga?'
        }
      }
    },

    // Plakietki w rankingu
    badges: {
      clockDigital: '🕒 Zegar • Cyfrowy',
      clockWords: '🕒 Zegar • Słownie',
      mathPrefix: '🧮 Matematyka',
      orthoPrefix: '✍️ Ortografia',
      flagsPrefix: '🚩 Flagi',
      logosPrefix: '🏷️ Logotypy',
      allContinents: 'Wszystkie kontynenty',
      allCategories: 'Wszystkie kategorie',
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
    },

    // Moduł: Flagi Świata (gałąź biznesowa – bez logotypów marek)
    flags_logos: {
      panelTitle: 'Konfiguracja Flag Świata',
      randomBtn: '🎲 Nowe pytanie',
      quizTypes: {
        flags: {
          label: '🚩 Flagi państw',
          short: 'Flagi',
          desc: 'Rozpoznawanie flag wszystkich 197 krajów świata z podziałem na kontynenty'
        }
      },
      lblContinents: 'Kontynenty (wielokrotny wybór – min. 1)',
      selectAllBtn: 'Zaznacz wszystkie',
      continents: {
        europe: { label: '🌍 Europa', short: 'Europa' },
        asia: { label: '🌏 Azja', short: 'Azja' },
        africa: { label: '🌍 Afryka', short: 'Afryka' },
        north_america: { label: '🌎 Ameryka Płn.', short: 'Am. Płn.' },
        south_america: { label: '🌎 Ameryka Płd.', short: 'Am. Płd.' },
        oceania: { label: '🌏 Australia i Oceania', short: 'Oceania' }
      },
      showHintBtn: '💡 Pokaż podpowiedź (opis charakterystyczny)',
      hideHintBtn: '🙈 Ukryj podpowiedź',
      capitalLabel: '🏛️ Stolica:',
      flagPrompt: 'Wskaż państwo, do którego należy powyższa flaga:'
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
    syncCloudOk: '💾 Private family leaderboard (saved on this device)',
    syncLocalFallback: '💾 Private family leaderboard (saved locally on this device)',
    syncCloudError: '⚠️ Connection error – showing local backup',
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

    // Parent Zone & Parental Gate
    parentZoneBtn: '🛡️ For Parents',
    parentalGate: {
      title: '🛡️ Parent Zone – Verification',
      desc: 'To open parent information and legal documents, please solve this quick adult check:',
      placeholder: 'Enter answer...',
      confirmBtn: 'Confirm',
      cancelBtn: 'Cancel',
      wrongAnswer: 'Incorrect answer – please try the new question.'
    },
    parentZone: {
      title: '🛡️ Parent Zone',
      subtitle: 'Child progress, sibling profiles, A4 worksheets, and legal documents.',
      privacyLink: '🛡️ Privacy Policy (GDPR / Kids)',
      termsLink: '📄 Terms of Service',
      offlineNote: 'All scores and statistics are saved exclusively locally on this device.',
      tabs: {
        progress: '📊 Progress',
        profiles: '👨‍👩‍👧‍👦 Profiles',
        worksheets: '🖨️ PDF Sheets',
        settings: '⚙️ PRO & Legal'
      },
      overallAccuracy: 'Overall accuracy',
      attemptsUnit: 'answers',
      noStatsYet: 'No recorded answers for this profile yet. Solve a few quiz questions first!',
      mistakesTitle: 'Areas to practice (most frequent mistakes):',
      noMistakesYet: 'Great job! No recorded mistakes to review.',
      resetStatsBtn: '🗑️ Clear profile statistics',
      profilesIntro: 'Manage sibling profiles (Free tier: 1 profile, Smart Kids PRO: up to 4 profiles).',
      addProfilePlaceholder: 'Child name (e.g. Sophie)...',
      addProfileBtn: '+ Add profile',
      profileActiveBadge: 'Active',
      profileLimitNote: 'Maximum of 4 PRO profiles reached.',
      profileProLockedNote: 'Adding sibling profiles (up to 4 kids) is available in Smart Kids PRO.',
      unlockProBtn: '⭐ Explore Smart Kids PRO',
      proStatusActive: 'Active plan: ⭐ Smart Kids PRO',
      proStatusFree: 'Active plan: Free (Clock + Grade 1 + Europe)',
      proDemoToggleOn: 'Enable PRO preview (test mode)',
      proDemoToggleOff: 'Switch back to Free (test mode)'
    },
    worksheet: {
      title: 'A4 Printable Worksheet Generator (PDF)',
      desc: 'Generate a clean black-and-white A4 printable sheet with a Parent Answer Key on page 2.',
      typeLabel: 'Worksheet topic',
      gradeLabelSelect: 'Grade level',
      printBtn: '🖨️ Print / Save as PDF',
      sheetTitle: 'Smart Kids Academy – Worksheet',
      answerKeyTitle: 'Answer Key (For Parents)',
      studentLabel: 'Student',
      dateLabel: 'Date',
      gradeLabel: (g) => `Grade ${g}`,
      previewLimitNote: 'Free preview (4 tasks). Smart Kids PRO generates full 12–20 task sheets for Grades 1–3.',
      types: {
        math: '🧮 Math',
        orthography: '✍️ Polish Spelling',
        mistakes: '🎯 Review Child Mistakes'
      }
    },
    proOffer: {
      title: '⭐ Smart Kids PRO – Full Academy',
      subtitle: 'One-time unlock for the full educational suite. No subscriptions and zero ads for children.',
      priceTag: '$6.99 one-time',
      freeColTitle: 'Free',
      proColTitle: 'Smart Kids PRO',
      freeFeatures: [
        'Full Clock module (digital & words)',
        'Math & Polish Spelling – Grade 1',
        'European Flags + local leaderboard',
        '1 child profile + PDF sheet preview (4 tasks)'
      ],
      proFeatures: [
        'Math & Polish Spelling – Grades 1, 2 & 3',
        'All 6 Flag continents (197 countries)',
        'Up to 4 sibling profiles on device',
        'Full A4 PDF Worksheet Generator (12–20 tasks)',
        '100% ad-free & no recurring subscription'
      ],
      ctaBtn: '🚀 Unlock PRO (Join launch waitlist)',
      restoreBtn: 'Restore purchase',
      fakeDoorThanks: '🎉 Thank you for your interest! Smart Kids PRO is launching soon — your interest has been noted. You can preview PRO features in Parent Zone (test mode).',
      restoreInfo: 'Purchase restoration will be active once store billing (Google Play / App Store) is enabled.'
    },

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
      },
      flags_logos: {
        navLabel: '🚩 Flags',
        questionTitle: 'Which country does this flag belong to?',
        questionTitleByMode: {
          flags: 'Which country does this flag belong to?'
        }
      }
    },

    badges: {
      clockDigital: '🕒 Clock • Digital',
      clockWords: '🕒 Clock • Words',
      mathPrefix: '🧮 Math',
      orthoPrefix: '✍️ Spelling',
      flagsPrefix: '🚩 Flags',
      logosPrefix: '🏷️ Logos',
      allContinents: 'All continents',
      allCategories: 'All categories',
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
    },

    // Module: World Flags (business branch – no brand logos)
    flags_logos: {
      panelTitle: 'World Flags Configuration',
      randomBtn: '🎲 New question',
      quizTypes: {
        flags: {
          label: '🚩 Country Flags',
          short: 'Flags',
          desc: 'Recognize flags of all 197 countries of the world divided by continents'
        }
      },
      lblContinents: 'Continents (multi-select – pick at least 1)',
      selectAllBtn: 'Select all',
      continents: {
        europe: { label: '🌍 Europe', short: 'Europe' },
        asia: { label: '🌏 Asia', short: 'Asia' },
        africa: { label: '🌍 Africa', short: 'Africa' },
        north_america: { label: '🌎 North America', short: 'N. America' },
        south_america: { label: '🌎 South America', short: 'S. America' },
        oceania: { label: '🌏 Australia & Oceania', short: 'Oceania' }
      },
      showHintBtn: '💡 Show hint (characteristic description)',
      hideHintBtn: '🙈 Hide hint',
      capitalLabel: '🏛️ Capital:',
      flagPrompt: 'Pick the country that this flag belongs to:'
    }
  }
};
