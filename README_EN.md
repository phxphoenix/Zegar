# 🎓 Smart Kids Academy (Akademia Bystrzaka)
### Interactive Early-Education Platform for Primary School (Grades 1–3)

<p align="center">
  <a href="README.md">🇵🇱 Wersja polska</a> •
  <a href="README_EN.md"><strong>🇬🇧 English version</strong></a>
</p>

<p align="center">
  <a href="https://github.com/phxphoenix/Zegar/actions/workflows/ci.yml"><img src="https://github.com/phxphoenix/Zegar/actions/workflows/ci.yml/badge.svg" alt="CI Tests" /></a>
  <a href="https://phxphoenix.github.io/Zegar/"><img src="https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-2563eb?style=flat&logo=github" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-16a34a.svg" alt="Node.js" />
  <img src="https://img.shields.io/badge/Tests-63%20passed-success.svg" alt="Tests" />
  <img src="https://img.shields.io/badge/Architecture-ES%20Modules-f59e0b.svg" alt="Architecture" />
  <img src="https://img.shields.io/badge/i18n-PL%20%7C%20EN-7c3aed.svg" alt="i18n" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" /></a>
</p>

> 🚀 **Try it live in your browser**: [https://phxphoenix.github.io/Zegar/](https://phxphoenix.github.io/Zegar/)

---

**Smart Kids Academy** is a modern, responsive web application designed for early childhood and primary school education (Grades 1 to 3). Built with zero-build Vanilla ES Modules and Tailwind CSS, it offers gamified, stress-free practice in time-reading, primary school mathematics, and Polish spelling.

---

## 📑 Table of Contents
1. [Interactive Modules](#-interactive-modules)
   - [🕒 Clock & Time Reading](#-clock--time-reading)
   - [🧮 Primary School Mathematics (Grades 1–3)](#-primary-school-mathematics-grades-13)
   - [✍️ Polish Orthography & Spelling](#️-polish-orthography--spelling)
2. [Gamification & Top 10 Leaderboards](#-gamification--top-10-leaderboards)
   - [Bedtime / Finish for Today Feature (🌙)](#bedtime--finish-for-today-feature-)
   - [Cloud Sync & Offline LocalStorage](#cloud-sync--offline-localstorage)
3. [Architecture & Design Patterns](#-architecture--design-patterns)
4. [Quick Start & Running Locally](#-quick-start--running-locally)
5. [Automated Testing Suite (63 tests)](#-automated-testing-suite-63-tests)
6. [GitHub Actions CI / CD](#-github-actions-ci--cd)
7. [Extensibility & Developer Guide](#-extensibility--developer-guide)
8. [License](#-license)

---

## 🌟 Interactive Modules

### 🕒 Clock & Time Reading
* **Dynamic Vector SVG Clock**:
  - 60 distinct minute ticks and 12 clear hour numbers.
  - Smooth animated hands with mathematically exact rotation angles:
    $$\text{Hour Angle} = (\text{hour} \pmod{12}) \times 30^\circ + \text{minutes} \times 0.5^\circ$$
    $$\text{Minute Angle} = \text{minutes} \times 6^\circ$$
* **Time of Day Indicator**:
  - Contextual badge reflecting the selected time: **Night** (🌙 22:00–04:59), **Morning** (🌅 05:00–11:59), **Afternoon** (☀️ 12:00–17:59), **Evening** (🌆 18:00–21:59).
* **Two Answer Modes**:
  - **Digital 24h**: Clear military/24-hour single notation (e.g. `15:30` vs `03:30`).
  - **In Words**: Natural verbal format in Polish (e.g., *wpół do czwartej*, *kwadrans po drugiej*) and English (*half past three*, *quarter past two*).
* **Parent & Teacher Panel (⚙️)**:
  - Manual time input with instant clock face update.
  - Random time generator stepping in 5-minute intervals.

---

### 🧮 Primary School Mathematics (Grades 1–3)
Curriculum-aligned arithmetic engine:
* **Grade 1**: Addition and subtraction within 20 (including crossing the tens threshold), gentle introduction to multiplication/division (groups of 2–5).
* **Grade 2**: Operations within 100, multiplication and division tables up to 50.
* **Grade 3**: Operations within 100 and full tens/hundreds up to 1000, full times tables up to 100.
* **Four Operations**: Addition (`➕`), Subtraction (`➖`), Multiplication (`✖️`), Division (`➗`). Select any combination with a multi-select toggle (at least 1 always active).
* **Distractor Engine**:
  - Avoids completely random numbers; generates realistic arithmetic slip-ups (off-by-one $\pm 1$, $\pm 2$, tens errors $\pm 10$, regrouping errors, neighboring times-table products).
* **Visual Hints On-Demand**:
  - **Ten-frame dot model**: visualizes addends with blue and green dots, and subtrahends with red cancellation crosses `✕`.
  - **Place-value decomposition bars**: visualizes tens and ones for double-digit numbers.
  - **Equal grouping diagrams**: clarifies multiplication as equal groups and division as sharing into equal boxes.

---

### ✍️ Polish Orthography & Spelling
Curated database of over 135 thoroughly validated words across three core Polish spelling difficulties:
* **Categories**:
  - 🅰️ **Ó vs U** (`u_o`)
  - 🅱️ **RZ vs Ż** (`rz_z`)
  - 🅲 **CH vs H** (`ch_h`)
* **Rule Taxonomy**:
  - **Root Alternation (*Oboczności*)**: e.g. *ó → o* (*stół : stoły*), *rz → r* (*morze : morski*), *ż → g* (*książka : księga*), *ch → sz* (*mucha : muszka*).
  - **Orthographic Rules**: e.g., *rz* after consonants (*b, p, d, t, k, g, w, ch, j*), suffixes *-ówka*, *-unek*, verbs ending with *-uje*.
  - **Memory & Exceptions**: dictionary non-alternating words (*żaba, córka, herbata*) and core exceptions (*pszczoła, kształt, skuwka, druh*).
* **3 Challenge Modes**:
  - 🧩 **Fill the Gap (*gap*)**: select the missing letter or digraph (`st_ł` $\rightarrow$ `ó`).
  - 📝 **Full Word Selection (*word*)**: 4 spelling variations of the same word.
  - 🔍 **Sharp Eye Detective (*spot*)**: 4 different words shown — 3 contain an intentional spelling mistake, only ONE is correct!
* **Contextual Features**:
  - Primer-style example sentences (toggleable).
  - Highlighting emoji and English glossary translations.
  - On-demand hint with rule keys (🔑) and pedagogical explanations.

---

## 🏆 Gamification & Top 10 Leaderboards

### Per-Section Independent Rankings
Each subject area maintains its own dedicated Top 10 leaderboard with context-aware badges:
- **Clock**: Digital vs Words badge.
- **Math**: Grade badge (*Gr. 2*) with operation icons (`➕➖✖️`).
- **Orthography**: Grade badge (*Gr. 1*) with category pills (`Ó/U, RZ/Ż`).

### Bedtime / Finish for Today Feature (🌙)
Built to promote digital wellbeing and healthy sleep habits:
1. The **"🌙 Done for today"** button allows children to conclude their session anytime without losing progress.
2. **Top 10 Qualification**:
   - If the active streak score qualifies for the section's Top 10, the leaderboard dialog immediately opens with a celebratory bedtime greeting!
3. **Below Threshold Summary**:
   - A soothing bedtime modal appears, stating the points scored, the current 10th-place threshold, and the difference.
   - The child chooses between **"💪 Keep playing"** (resume streak) and **"🌙 Go to sleep"** (safely end session with sweet dreams feedback).

### Cloud Sync & Offline LocalStorage
- **Cloud (Firebase Realtime Database REST API)**: Enables shared leaderboards across classroom or family devices in real time.
- **Offline Fallback (LocalStorage)**: Seamlessly operates in full offline mode when internet connectivity is unavailable.
- **Auto-migration**: Transparently upgrades legacy v1 flat leaderboards into modular per-section v2 storage.

---

## 🏛️ Architecture & Design Patterns

The project follows a **Zero-Build Vanilla ES Modules** architecture:

```
HTML5 + Tailwind CSS (CDN)
       ↓
js/app.js (Shell, State Machine, Streak Engine)
  ├── js/modules/registry.js (Module Catalog)
  │     ├── js/modules/clock.js (SVG Clock Face)
  │     ├── js/modules/math.js (Arithmetic + Visual Hints)
  │     └── js/modules/orthography.js (Spelling Engine)
  │           └── js/modules/orthographyData.js (135+ Vocabulary Items)
  ├── js/leaderboard.js (Top 10 REST API + LocalStorage Fallback)
  └── js/i18n.js (Bilingual PL / EN Dictionary)
```

Every educational module implements the uniform **EducationalModule Contract**:
- `mountStage(stageContainer, lang)`: renders the visual interaction area.
- `mountConfig(configContainer, lang, hooks)`: renders the parent/teacher controls.
- `generateQuestion(lang, randomize)`: returns `{ correctAnswer, options: [4] }`.
- `refreshLanguage(lang)`: live updates text and returns localized question payload.
- `getRankingPayload()`: supplies section ID and filter metadata for score recording.

---

## 🚀 Quick Start & Running Locally

### Prerequisites
- Modern web browser (Chrome, Edge, Firefox, Safari).
- Node.js ($\ge$ 18.0.0) — required to run the automated test suite.

### Running with a Local Web Server
Since the application uses native ECMAScript modules (`type="module"`), run it via any HTTP server:

```bash
# Using Node.js
npx serve .

# Or using Python 3
python -m http.server 8000
```
Then navigate to `http://localhost:3000` (or `http://localhost:8000`).

---

## 🧪 Automated Testing Suite (63 tests)

The project includes **63 automated tests** powered by Node's native test runner (`node:test`) and [JSDOM](https://github.com/jsdom/jsdom).

### Running all tests:
```bash
npm test
```
Or directly:
```bash
node --test tests/**/*.test.js
```

### Test Suite Overview:

| Suite File | Tests | Coverage Scope |
| :--- | :---: | :--- |
| `tests/i18n.test.js` | **7** | PL and EN dictionary parity, dynamic formatters, math hints, orthography badges. |
| `tests/orthographyData.test.js` | **6** | 135+ words schema validation, ID uniqueness, mask verification, distractor integrity. |
| `tests/registry.test.js` | **4** | Standard educational module contract compliance and unknown module fallback. |
| `tests/leaderboard.test.js` | **17** | Top 10 sort algorithm, date tie-breaking, threshold qualifying, v1 $\rightarrow$ v2 migration, offline fallback. |
| `tests/clock.test.js` | **7** | SVG face generation (60 marks, 12 numbers), hand angles, time of day, digital & verbal formats. |
| `tests/math.test.js` | **7** | Grade 1–3 ranges, arithmetic operations, distractor generator, single-operation constraint, hints toggle. |
| `tests/orthography.test.js` | **8** | Gap, Word, and Spot challenge modes, rule filtering, anti-repetition memory, hint box toggle. |
| `tests/app.test.js` | **7** | App shell integration, module tab switching, streak tracking, language toggle, bedtime modal, Escape key. |
| **TOTAL** | **63** | **100% Passing (0 failures, ~1.8s execution)** |

---

## ⚙️ GitHub Actions CI / CD

The repository is configured with GitHub Actions:
- **Continuous Integration (`.github/workflows/ci.yml`)**: executes `npm test` across Node.js versions (18.x, 20.x, 22.x) on every `push` and `pull_request` to `main`.
- **GitHub Pages Deployment (`.github/workflows/pages.yml`)**: automatically deploys the latest version to GitHub Pages when changes are merged into `main`.

---

## 🛠️ Extensibility & Developer Guide

### Adding a New Subject Module
1. Create your module file `js/modules/myModule.js`.
2. Implement the standard module contract (`id`, `mountStage`, `mountConfig`, `generateQuestion`, `refreshLanguage`, `getRankingPayload`).
3. Register your module in `js/modules/registry.js`.
4. Add localized UI strings in `js/i18n.js`.
5. Run `npm test` to verify your implementation!

### Adding New Spelling Words
Add an entry to `ORTHOGRAPHY_WORDS` in `js/modules/orthographyData.js`:
```javascript
{
  id: 'my_word',
  grade: 2,
  category: 'u_o',
  ruleType: 'alternation',
  word: 'ogród',
  masked: 'ogr_d',
  target: 'ó',
  wrongWord: 'ogrud',
  distractorWords: ['ogrud', 'ogrod', 'ogrut'],
  letterOptions: ['ó', 'u', 'o', 'a'],
  emoji: '🏡',
  sentence: 'Wiosną w naszym ___ zakwitły kolorowe tulipany.',
  enMeaning: 'garden',
  alternation: 'ó → o',
  hintPl: 'Oboczność <strong>ó → o</strong>: <em>ogr<strong>o</strong>dy</em>.',
  hintEn: 'Alternation <strong>ó → o</strong>: related to <em>ogr<strong>o</strong>dy</em>.'
}
```
`npm test` automatically checks the new entry for schema errors and duplicate distractors!

---

## 📄 License
Released under the [MIT License](LICENSE).
Free to use, adapt, and share for schools, educators, parents, and students!
