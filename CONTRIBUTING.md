# 🤝 Jak rozwijać Akademię Bystrzaka (Contributing Guide)

Dziękujemy za chęć włączenia się w rozwój **Akademii Bystrzaka**! Aplikacja jest projektem open source mającym na celu wspieranie edukacji wczesnoszkolnej dzieci.

---

## 🛠️ Rozpoczęcie pracy lokalnej

1. **Sklonuj repozytorium**:
   ```bash
   git clone https://github.com/phxphoenix/Zegar.git
   cd Zegar
   ```
2. **Zainstaluj zależności deweloperskie**:
   ```bash
   npm install
   ```
3. **Uruchom testy automatyczne**:
   ```bash
   npm test
   ```
4. **Uruchom podgląd w przeglądarce**:
   ```bash
   npx serve .
   ```

---

## 🧪 Zasady tworzenia kodu i testów

1. **Vanilla JavaScript (ES Modules)**:
   - Kod aplikacji produkcyjnej nie może wymagać procesu budowania (Webpack, Vite, Rollup itp.).
   - Używamy standardowych modułów ECMAScript (`import` / `export`).
2. **Zgodność z podstawą programową**:
   - Wszystkie zadania matematyczne i słówka ortograficzne muszą być zgodne z programem nauczania dla klas 1–3 szkoły podstawowej.
3. **Każda zmiana wymaga testów**:
   - Dodając nowy moduł, funkcjonalność lub słówka, dopisz testy weryfikujące poprawność.
   - Wszystkie 63+ testów musi przechodzić (`npm test`).

---

## ✍️ Jak dodać nowe słówka ortograficzne?

Otwórz plik `js/modules/orthographyData.js` i dodaj obiekt do tablicy `ORTHOGRAPHY_WORDS`:
- Upewnij się, że pole `id` jest unikalne.
- Pole `masked` musi zawierać znak `_` w miejscu litery ćwiczonej w `target`.
- Pole `wrongWord` oraz wszystkie elementy w `distractorWords` **nie mogą być identyczne** z poprawnym słowem `word`.
- Pole `sentence` musi zawierać potrójne podkreślenie `___`.
- Uruchom `npm test`, aby automatyczna walidacja schematu potwierdziła poprawność wpisu.

---

## 📬 Jak zgłaszać Pull Requesty i cykl wydawniczy?

Projekt korzysta ze środowiska przedprodukcyjnego (**stage**):
1. Utwórz nową gałąź od gałęzi `stage` (`git checkout -b feature/nowy-modul stage`).
2. Wprowadź zmiany i upewnij się, że testy przechodzą: `npm test`.
3. Zacommituj zmiany ze zwięzłym opisem (`git commit -m "feat: dodanie modułu geometrii"`).
4. Wypchnij gałąź do repozytorium i utwórz **Pull Request kierowany do gałęzi `stage`**.
5. Po weryfikacji na środowisku testowym (staging), wersja kandydująca trafia do gałęzi `main` (PROD).
