# 🚀 Plan Realizacji Sprintu 2 — Akademia Bystrzaka (Gałąź `business`)

> **Cel Sprintu 2:** Zbudować realną wartość wersji **„Bystrzak PRO”** (podział Darmowe vs PRO, Panel Rodzica ze statystykami błędów, profile dzieci, Generator Kart Pracy PDF do druku) oraz warstwę walidacji popytu na Web — **bez podpinania jeszcze płatności i bez zakładania JDG (Etap 0: 0 zł przychodu)**.
>
> **Jak korzystać z tego pliku lokalnie:**
> 1. Upewnij się, że jesteś na gałęzi `business` (`git checkout business && git pull`).
> 2. Realizuj etapy po kolei (**2.1 → 2.6**).
> 3. Przed każdym etapem przełącz model AI na rekomendowany w tabeli poniżej i wklej gotowy prompt startowy z danego etapu.
> 4. Po każdym etapie uruchom: `npm run build:css && npm test` i zrób osobny commit.

---

## 🧠 Mapa Doboru Modeli Gemini 4 (Neon / Carbon / Hydrogen)

| Etap | Zakres prac | Model | Poziom (*Thinking*) | Dlaczego ten dobór? |
| :--- | :--- | :--- | :---: | :--- |
| **2.1** | Warstwa uprawnień (`entitlements.js`) + podział Darmowe vs PRO w 3 modułach | **Neon** | `high` | Refaktoryzacja wieloplikowa z zachowaniem czystego kontraktu modułów i 76 testów. |
| **2.2** | Lokalny tracker postępów i błędów dziecka (`progressTracker.js`) | **Hydrogen** | `high` | Jasno zdefiniowany, autonomiczny moduł logiki + testy jednostkowe — szybko i tanio. |
| **2.3** | Panel Rodzica (statystyki błędów + profile rodzeństwa) za Bramką Rodzicielską | **Neon** | `high` | Złożony UI, synchronizacja stanów między profilami, i18n PL/EN i pełna integracja z `parentalGate.js`. |
| **2.4** | Generator Kart Pracy PDF do druku (`@media print`, arkusz A4) | **Neon** | `medium` | Precyzyjne stylowanie druku A4 i generowanie arkuszy z błędów dziecka bez zbędnego narzutu tokenów. |
| **2.5** | Ekran „Odblokuj PRO” + walidacja popytu (*Fake Door* / lista oczekujących) | **Hydrogen** | `medium` | Przewidywalny komponent UI + teksty sprzedażowe PL/EN w `i18n.js` — idealne dla szybkiego Hydrogena. |
| **2.6** | Audyt końcowy (bezpieczeństwo, RODO/Kids, edge case'y, CSS i regresja testów) | **Carbon** | `high` | Carbon to model do głębokiej weryfikacji, audytu zgodności i wyłapywania ukrytych błędów na końcu sprintu. |

> **Wskazówka kosztowa:** `Carbon` obsługuje 3 poziomy (`low`, `medium`, `high` — bez `xhigh`). `Neon` i `Hydrogen` mają 4 poziomy (`low`, `medium`, `high`, `xhigh`), przy czym w tym sprincie `xhigh` nie jest nigdzie potrzebne (zwiększa zużycie tokenów bez realnego zysku przy tej skali kodu).

---

## 📋 Etap 2.1: Architektura Uprawnień (Free vs PRO) i Podział Treści

* **Model:** `Gemini 4 Neon` | **Poziom:** `high`
* **Cel:** Wydzielić centralną warstwę uprawnień, która w przyszłości podepnie się zarówno pod płatności Web (Paddle/Polar/BLIK), jak i RevenueCat (Google Play / App Store), a teraz pozwoli czysto rozdzielić treści darmowe od PRO.

### Zakres zmian
1. **[NEW] `js/entitlements.js`**
   * Klucz `localStorage`: `zegar_pro_status_v1`.
   * Funkcje: `isProUser()`, `setProStatus(enabled)` (do testów lokalnych i przyszłego zakupu), `canAccessMathGrade(grade)`, `canAccessOrthoGrade(grade)`, `canAccessContinent(continentId)`, `getFreeTierSummary()`.
   * **Reguły podziału:**
     * **Darmowe (Free):** Zegar (100% darmowy), Matematyka **Klasa 1**, Ortografia **Klasa 1**, Flagi **Europa**.
     * **Bystrzak PRO:** Matematyka **Klasy 2–3**, Ortografia **Klasy 2–3**, Flagi **wszystkie 6 kontynentów** (Azja, Afryka, Ameryka Płn., Ameryka Płd., Oceania).
   * Domyślne ustawienia startowe w `flagsLogos.js` dla użytkownika Free: aktywna tylko `['europe']` (dla PRO: wszystkie 6 kontynentów).
2. **[MODIFY] `js/modules/math.js`, `js/modules/orthography.js`, `js/modules/flagsLogos.js`**
   * Oznaczenie zablokowanych opcji (Klasa 2, Klasa 3, kontynenty spoza Europy) ikoną `🔒 PRO`.
   * Kliknięcie zablokowanej opcji wywołuje callback `hooks.onProFeatureRequested(featureKey)` zamiast zmieniać stan.
3. **[MODIFY] `js/app.js`**
   * Przekazanie `onProFeatureRequested` do `mountConfig(...)` (na tym etapie może otwierać Bramkę Rodzicielską → tymczasowy komunikat/modal PRO).
4. **[NEW] `tests/entitlements.test.js` + aktualizacja istniejących testów**
   * Ważne: upewnić się, że istniejące testy dla Klas 2–3 i kontynentów ustawiają `setProStatus(true)` w `beforeEach`, a nowe testy sprawdzają blokadę w trybie Free!

### Gotowy prompt startowy (Etap 2.1)
```text
Zrealizuj wyłącznie Etap 2.1 z pliku docs/SPRINT_2_PLAN.md na gałęzi business.
Utwórz js/entitlements.js, wprowadź podział Free vs PRO w math.js, orthography.js i flagsLogos.js,
dodaj tests/entitlements.test.js oraz zaktualizuj dotknięte testy.
Na koniec uruchom `npm run build:css && npm test` i upewnij się, że 100% testów przechodzi.
```

### Kryteria akceptacji
- [ ] Użytkownik Free ma pełny Zegar, Klasę 1 (Matematyka, Ortografia) i Europę (Flagi).
- [ ] Kliknięcie Klasy 2/3 lub kontynentu spoza Europy w trybie Free pokazuje kłódkę `🔒 PRO` i wywołuje hook `onProFeatureRequested`.
- [ ] Przełączenie `setProStatus(true)` natychmiast odblokowuje wszystkie klasy i kontynenty.
- [ ] `npm run build:css && npm test` → 0 błędów.

---

## 📋 Etap 2.2: Lokalny Tracker Postępów i Błędów Dziecka

* **Model:** `Gemini 4 Hydrogen` | **Poziom:** `high`
* **Cel:** Zbierać lokalnie (wyłącznie na urządzeniu, 100% zgodnie z RODO) statystyki poprawnych i błędnych odpowiedzi z podziałem na moduły oraz konkretne „trudne pytania” (np. które słówka ortograficzne lub działania z tabliczki sprawiają dziecku trudność).

### Zakres zmian
1. **[NEW] `js/progressTracker.js`**
   * Klucz `localStorage`: `zegar_progress_stats_v1`.
   * Struktura danych (per profil dziecka, domyślny profil `'default'`):
     * `byModule`: `{ clock, math, orthography, flags_logos }` → `{ attempts, correct, wrong, lastPlayedAt }`.
     * `recentMistakes`: tablica max 50 ostatnich błędów `{ moduleId, prompt, expectedAnswer, givenAnswer, meta, timestamp }` (deduplikacja lub licznik `count` dla powtarzających się błędów).
   * API: `recordAnswer({ profileId, moduleId, isCorrect, prompt, expectedAnswer, givenAnswer, meta })`, `getProgressSummary(profileId)`, `getTopMistakes(profileId, moduleId?, limit)`, `resetProgress(profileId)`.
2. **[MODIFY] `js/app.js`**
   * Wywołanie `recordAnswer(...)` w `checkAnswer()` (zarówno przy poprawnej, jak i błędnej odpowiedzi, z przekazaniem opisu pytania z aktywnego modułu lub payloadu).
3. **[NEW] `tests/progressTracker.test.js`**
   * Testy zliczania skuteczności (%), limitu 50 błędów, sortowania najczęstszych błędów i resetowania danych.

### Gotowy prompt startowy (Etap 2.2)
```text
Zrealizuj wyłącznie Etap 2.2 z pliku docs/SPRINT_2_PLAN.md.
Utwórz js/progressTracker.js, podepnij zbieranie statystyk w js/app.js (bez wysyłania żadnych danych do sieci)
i napisz testy jednostkowe w tests/progressTracker.test.js. Zweryfikuj przez `npm test`.
```

### Kryteria akceptacji
- [ ] Każda odpowiedź dziecka aktualizuje lokalne statystyki w `localStorage`.
- [ ] Brak jakichkolwiek zapytań sieciowych (`fetch`).
- [ ] `getTopMistakes()` zwraca najczęstsze błędy dziecka (gotowe pod Panel Rodzica i Generator PDF).
- [ ] `npm test` → 100% PASS.

---

## 📋 Etap 2.3: Panel Rodzica (Statystyki + Profile Rodzeństwa)

* **Model:** `Gemini 4 Neon` | **Poziom:** `high`
* **Cel:** Rozbudować istniejący modal **Strefy Rodzica** (chroniony Bramką Rodzicielską z Sprintu 1) o realną wartość dla rodzica: podgląd skuteczności dziecka, listę trudnych haseł/działań oraz obsługę do 4 lokalnych profili dzieci (np. *Zosia*, *Kuba*) w wersji PRO.

### Zakres zmian
1. **[NEW] `js/profiles.js`**
   * Zarządzanie profilami dzieci w `localStorage` (`zegar_profiles_v1`): w trybie Free 1 profil domyślny, w trybie PRO do 4 profili (imię/pseudonim + wybór emoji awatara, np. 🦊, 🦉, 🦁, 🐼).
   * Przełączanie aktywnego profilu synchronizuje statystyki w `progressTracker.js`.
2. **[MODIFY] `index.html` + `js/parentalGate.js` + `js/i18n.js`**
   * Rozbudowa modala `#parent-zone-modal` o zakładki (wewnątrz Strefy Rodzica):
     * **📊 Postępy dziecka:** paski skuteczności % dla 4 modułów + sekcja „Nad czym warto poćwiczyć” (top 5 błędów z `progressTracker.js`) + przycisk „Wyczyść statystyki”.
     * **👨‍👩‍👧‍👦 Profile (PRO):** lista profili dzieci, dodawanie/wybór aktywnego profilu (w trybie Free widoczny podgląd z kłódką `🔒 PRO`).
     * **⚙️ Status PRO i Dokumenty:** przełącznik trybu podglądu/testowego PRO (wyłącznie w trybie dev lub z kodem testowym, wyraźnie oznaczony), linki do `privacy.html` i `terms.html`.
3. **[NEW] `tests/profiles.test.js` + rozszerzenie `tests/parentalGate.test.js`**

### Gotowy prompt startowy (Etap 2.3)
```text
Zrealizuj wyłącznie Etap 2.3 z pliku docs/SPRINT_2_PLAN.md.
Dodaj js/profiles.js oraz rozbuduj Strefę Rodzica (#parent-zone-modal) o zakładki Postępy, Profile (PRO) i Dokumenty,
z pełnym wsparciem PL/EN w js/i18n.js. Wszystkie funkcje muszą pozostać za Bramką Rodzicielską.
Zbuduj CSS i uruchom `npm run build:css && npm test`.
```

### Kryteria akceptacji
- [ ] Panel Rodzica otwiera się wyłącznie po przejściu Bramki Rodzicielskiej.
- [ ] Wyświetla realne statystyki skuteczności i najczęstsze błędy z `progressTracker.js`.
- [ ] W trybie Free pozwala na 1 profil, w trybie PRO do 4 profili z awatarami.
- [ ] Działa w języku PL i EN; `npm run build:css && npm test` → 100% PASS.

---

## 📋 Etap 2.4: Generator Kart Pracy PDF do Druku (A4)

* **Model:** `Gemini 4 Neon` | **Poziom:** `medium`
* **Cel:** Stworzyć unikalny wyróżnik wersji Web PRO — przycisk w Panelu Rodzica **„🖨️ Wygeneruj kartę pracy do druku (PDF / A4)”**, który bez żadnego serwera (czysty `window.print()` + dedykowane style `@media print`) generuje estetyczny arkusz A4 z zadaniami i kluczem odpowiedzi na drugiej stronie.

### Zakres zmian
1. **[NEW] `js/worksheetGenerator.js`**
   * Generuje 12–16 zadań na arkusz A4 w wybranym dziale (Matematyka, Ortografia lub „Powtórka z ostatnich błędów dziecka”!):
     * Dla **Matematyki**: czytelna siatka działań z miejscem na wpisanie wyniku (`_____`).
     * Dla **Ortografii**: wyrazy z luką (`st__ł`, `ż__łw`) + opcjonalna ramka z podpowiedzią reguły.
     * **Strona 2 (Klucz odpowiedzi dla rodzica):** zwarta tabela z poprawnymi odpowiedziami (`page-break-before: always`).
   * W trybie Free: podgląd z ograniczeniem (np. 4 zadania pokazowe) lub oznaczenie `🔒 PRO` z przyciskiem odblokowania.
2. **[MODIFY] `css/input.css`**
   * Reguły `@media print`: ukrycie całej aplikacji (`.no-print`), wyświetlenie wyłącznie kontenera `#print-worksheet-root` z czystą typografią czarno-białą (oszczędność tuszu w domowej drukarce!), marginesami A4 i łamaniem stron.
3. **[MODIFY] `index.html` + `js/parentalGate.js` + `js/i18n.js`**
   * Dodanie sekcji Generatora Kart Pracy w Panelu Rodzica oraz ukrytego kontenera `#print-worksheet-root`.
4. **[NEW] `tests/worksheetGenerator.test.js`**
   * Testy poprawności wygenerowanej liczby zadań, spójności klucza odpowiedzi i obsługi pustej listy błędów (fallback na losowe zadania z aktywnej klasy).

### Gotowy prompt startowy (Etap 2.4)
```text
Zrealizuj wyłącznie Etap 2.4 z pliku docs/SPRINT_2_PLAN.md.
Utwórz js/worksheetGenerator.js (arkusz A4 + klucz odpowiedzi dla rodzica na 2. stronie),
dodaj reguły @media print w css/input.css i podepnij generator w Panelu Rodzica.
Dodaj tests/worksheetGenerator.test.js, uruchom `npm run build:css && npm test`.
```

### Kryteria akceptacji
- [ ] Kliknięcie „Drukuj / Zapisz jako PDF” generuje czysty, czarno-biały arkusz A4 bez elementów interfejsu gry.
- [ ] Na 2. stronie znajduje się poprawny klucz odpowiedzi dla rodzica.
- [ ] Generator potrafi wykorzystać listę błędów z `progressTracker.js` (z bezpiecznym fallbackiem).
- [ ] `npm run build:css && npm test` → 100% PASS.

---

## 📋 Etap 2.5: Ekran „Bystrzak PRO” i Walidacja Popytu (*Fake Door*, 0 zł)

* **Model:** `Gemini 4 Hydrogen` | **Poziom:** `medium`
* **Cel:** Przygotować estetyczny modal oferty **„Bystrzak PRO”** (zawsze otwierany **za Bramką Rodzicielską**!), który pozwala zmierzyć realne zainteresowanie rodziców przed włączeniem płatności (Etap 0 — brak przychodu, brak JDG).

### Zakres zmian
1. **[MODIFY] `index.html` + `js/i18n.js` + `js/parentalGate.js`**
   * Modal `#pro-offer-modal` (PL / EN) z czytelnym porównaniem **Darmowe vs Bystrzak PRO**:
     * Jednorazowa opłata **29 zł** (lub **\$6.99** w EN) — *bez ukrytych abonamentów, bez reklam dla dzieci*.
     * Lista korzyści: Klasy 2–3 (Matematyka + Ortografia), 6 kontynentów Flag, do 4 profili rodzeństwa, Panel Rodzica ze statystykami, Generator Kart Pracy PDF.
   * Przycisk CTA **„Odblokuj PRO (wkrótce — sprawdź premierę)”**:
     * W fazie walidacji (*Fake Door*) wyświetla komunikat o premierze + zlicza lokalne intencje (a po podaniu w konfiguracji opcjonalnego linku do formularza listy oczekujących — np. Tally/Google Forms — otwiera zapis na rabat -30%).
   * Przycisk **„Przywróć zakup”** (przygotowany z myślą o wymogu Apple App Store w Sprincie 4).
2. **[MODIFY] `tests/parentalGate.test.js`**
   * Test weryfikujący, że próba otwarcia oferty PRO zawsze przechodzi przez Bramkę Rodzicielską (dziecko nie może samo zobaczyć cennika ani kliknąć przycisku zakupu).

### Gotowy prompt startowy (Etap 2.5)
```text
Zrealizuj wyłącznie Etap 2.5 z pliku docs/SPRINT_2_PLAN.md.
Dodaj modal oferty Bystrzak PRO (#pro-offer-modal) dostępny wyłącznie po przejściu Bramki Rodzicielskiej,
z pełnymi tłumaczeniami PL/EN w js/i18n.js i trybem walidacji (Fake Door).
Dodaj test ochrony Bramką Rodzicielską i uruchom `npm run build:css && npm test`.
```

### Kryteria akceptacji
- [ ] Kliknięcie jakiejkolwiek kłódki `🔒 PRO` najpierw otwiera **Bramkę Rodzicielską**, a dopiero po jej rozwiązaniu pokazuje modal oferty PRO.
- [ ] Brak agresywnych dark patterns (żadnych fałszywych liczników czasu, zero nacisku na dziecko).
- [ ] Pełne tłumaczenia PL i EN.

---

## 📋 Etap 2.6: Audyt Końcowy, Weryfikacja Zgodności i Wdrożenie na Cloudflare

* **Model:** `Gemini 4 Carbon` | **Poziom:** `high`
* **Cel:** Przeprowadzić rygorystyczny przegląd całego Sprintu 2 pod kątem jakości kodu, zgodności z **RODO / Google Play Families Policy / Apple Kids Category 1.3**, braku wycieków danych oraz spójności z Cloudflare Workers.

### Zakres weryfikacji
1. **Audyt bezpieczeństwa i prywatności:**
   * Brak zewnętrznych skryptów CDN, brak nieautoryzowanych logotypów marek, brak wysyłania danych dzieci przez `fetch`.
   * Każda ścieżka do linków zewnętrznych (`privacy.html`, `terms.html`, lista oczekujących) i ekranu oferty PRO jest **bezwzględnie zablokowana Bramką Rodzicielską**.
   * Bezpieczne escapowanie danych użytkownika (np. imię w profilu dziecka / rankingu nie może wykonać XSS przy renderowaniu w Panelu Rodzica lub w karcie pracy PDF!).
2. **Audyt UX i regresji:**
   * Pełny cykl w trybie Free i w trybie PRO, przełączanie języka PL ↔ EN na każdym otwartym modalu, sprawdzenie `.assetsignore` pod kątem nowych plików.
3. **Finalna kompilacja i testy:**
   * `npm run build:css` (aktualizacja `css/styles.css` o wszystkie nowe klasy Tailwinda z Sprintu 2).
   * `npm test` (100% testów PASS, w tym nowe testy jednostkowe i bezpieczeństwa XSS).
   * Push na `origin/business` + sprawdzenie zielonego CI w GitHub Actions + wdrożenie na `https://zegar-business.phx-poczta.workers.dev/`.

### Gotowy prompt startowy (Etap 2.6)
```text
Przeprowadź audyt końcowy Etapu 2.6 z pliku docs/SPRINT_2_PLAN.md.
Sprawdź: (1) ochronę wszystkich ścieżek PRO/linków Bramką Rodzicielską, (2) brak podatności XSS w nazwach profili i generatorze kart PDF,
(3) brak zewnętrznych CDN/trackerów/logotypów, (4) aktualność .assetsignore i css/styles.css.
Napraw ewentualne znaleziska, uruchom `npm run build:css && npm test` i przygotuj podsumowanie do commitu.
```

### Kryteria akceptacji (Koniec Sprintu 2)
- [ ] Audyt bezpieczeństwa (w tym XSS w `innerHTML`) — 0 uwag krytycznych.
- [ ] `npm run build:css && npm test` → 100% PASS (lokalnie i na GitHub Actions).
- [ ] Zaktualizowana wersja live działa na `https://zegar-business.phx-poczta.workers.dev/`.
- [ ] Odhaczono zadanie `w3` (+120 XP → awans na **Poziom L3: Budowniczy MVP!**) w `Business-streem`.
