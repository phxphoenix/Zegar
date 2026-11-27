// ============================================================================
// GENERATOR KART PRACY PDF / A4 DO DRUKU (100% LOKALNY, BEZ SERWERA)
// Generuje czarno-biały arkusz A4 (oszczędność tuszu) z zadaniami z Matematyki,
// Ortografii lub Powtórki z błędów dziecka + Klucz odpowiedzi na 2. stronie.
// ============================================================================

import { i18n } from './i18n.js';
import { isProUser, getFreeTierSummary } from './entitlements.js';
import { getTopMistakes } from './progressTracker.js';
import { ORTHOGRAPHY_WORDS } from './modules/orthographyData.js';

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateMathTasks(count, grade = 1) {
  const tasks = [];
  const used = new Set();
  let guard = 0;

  while (tasks.length < count && guard < 300) {
    guard++;
    let a;
    let b;
    let op;
    let answer;

    if (grade === 1) {
      const isAdd = Math.random() < 0.55;
      if (isAdd) {
        a = 1 + Math.floor(Math.random() * 14);
        b = 1 + Math.floor(Math.random() * (20 - a));
        op = '+';
        answer = a + b;
      } else {
        a = 4 + Math.floor(Math.random() * 17);
        b = 1 + Math.floor(Math.random() * (a - 1));
        op = '−';
        answer = a - b;
      }
    } else if (grade === 2) {
      const r = Math.random();
      if (r < 0.35) {
        a = 10 + Math.floor(Math.random() * 60);
        b = 5 + Math.floor(Math.random() * (95 - a));
        op = '+';
        answer = a + b;
      } else if (r < 0.7) {
        a = 20 + Math.floor(Math.random() * 80);
        b = 5 + Math.floor(Math.random() * (a - 5));
        op = '−';
        answer = a - b;
      } else {
        a = 2 + Math.floor(Math.random() * 7);
        b = 2 + Math.floor(Math.random() * 7);
        op = '×';
        answer = a * b;
      }
    } else {
      const r = Math.random();
      if (r < 0.35) {
        a = 2 + Math.floor(Math.random() * 9);
        b = 2 + Math.floor(Math.random() * 9);
        op = '×';
        answer = a * b;
      } else if (r < 0.65) {
        b = 2 + Math.floor(Math.random() * 8);
        answer = 2 + Math.floor(Math.random() * 9);
        a = b * answer;
        op = ':';
      } else {
        a = 50 + Math.floor(Math.random() * 450);
        b = 20 + Math.floor(Math.random() * 450);
        op = '+';
        answer = a + b;
      }
    }

    const prompt = `${a} ${op} ${b} = ______`;
    if (!used.has(prompt)) {
      used.add(prompt);
      tasks.push({
        prompt,
        answer: String(answer),
        hint: ''
      });
    }
  }
  return tasks;
}

function generateOrthoTasks(count, grade = 1) {
  const pool = ORTHOGRAPHY_WORDS.filter(w => w.grade === grade);
  const chosen = shuffle(pool.length > 0 ? pool : ORTHOGRAPHY_WORDS).slice(0, count);
  return chosen.map(item => ({
    prompt: `${item.masked}   (${item.emoji || ''})`.trim(),
    answer: `${item.word} (${item.answer})`,
    hint: item.hintPl || ''
  }));
}

export function buildWorksheetData({
  type = 'math', // 'math' | 'orthography' | 'mistakes'
  grade = 1,
  profileId = 'default',
  profileName = 'Bystrzak',
  lang = 'pl',
  count = 12
} = {}) {
  const pro = isProUser();
  const effectiveCount = pro
    ? Math.max(4, Math.min(20, Number(count) || 12))
    : getFreeTierSummary().worksheetPreviewCount;
  const effectiveGrade = pro ? Math.max(1, Math.min(3, Number(grade) || 1)) : 1;

  let tasks = [];
  let isFallbackFromMistakes = false;

  if (type === 'mistakes') {
    const mistakes = getTopMistakes(profileId, null, effectiveCount);
    tasks = mistakes.map(m => ({
      prompt: m.prompt ? `${m.prompt}  →  __________` : '__________',
      answer: m.expectedAnswer,
      hint: ''
    }));
    if (tasks.length < effectiveCount) {
      isFallbackFromMistakes = tasks.length === 0;
      const missing = effectiveCount - tasks.length;
      tasks = [...tasks, ...generateMathTasks(missing, effectiveGrade)];
    }
  } else if (type === 'orthography') {
    tasks = generateOrthoTasks(effectiveCount, effectiveGrade);
  } else {
    tasks = generateMathTasks(effectiveCount, effectiveGrade);
  }

  return {
    type,
    grade: effectiveGrade,
    profileName: String(profileName || 'Bystrzak'),
    lang,
    isPro: pro,
    isFallbackFromMistakes,
    generatedAt: new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'pl-PL'),
    tasks
  };
}

export function renderWorksheetHTML(worksheet) {
  const dict = i18n[worksheet.lang]?.worksheet || i18n.pl.worksheet;
  const typeLabel = dict.types[worksheet.type] || dict.types.math;
  const safeName = escapeHtml(worksheet.profileName);
  const safeDate = escapeHtml(worksheet.generatedAt);

  const itemsHtml = worksheet.tasks
    .map(
      (t, idx) => `
      <div class="worksheet-item">
        <span class="worksheet-num">${idx + 1}.</span>
        <span class="worksheet-prompt">${escapeHtml(t.prompt)}</span>
      </div>
    `
    )
    .join('');

  const answersHtml = worksheet.tasks
    .map(
      (t, idx) => `
      <div class="worksheet-answer-item">
        <strong>${idx + 1}.</strong> ${escapeHtml(t.answer)}
      </div>
    `
    )
    .join('');

  return `
    <div class="worksheet-page">
      <div class="worksheet-header">
        <div>
          <h1>${escapeHtml(dict.sheetTitle)}</h1>
          <p>${escapeHtml(typeLabel)} • ${escapeHtml(dict.gradeLabel(worksheet.grade))}</p>
        </div>
        <div class="worksheet-meta">
          <div>${escapeHtml(dict.studentLabel)}: <strong>${safeName}</strong></div>
          <div>${escapeHtml(dict.dateLabel)}: ${safeDate}</div>
        </div>
      </div>
      ${
        !worksheet.isPro
          ? `<div class="worksheet-preview-note">${escapeHtml(dict.previewLimitNote)}</div>`
          : ''
      }
      <div class="worksheet-grid">
        ${itemsHtml}
      </div>
    </div>

    <div class="worksheet-page worksheet-answer-key">
      <div class="worksheet-header">
        <div>
          <h2>${escapeHtml(dict.answerKeyTitle)}</h2>
          <p>${escapeHtml(typeLabel)} • ${safeName}</p>
        </div>
      </div>
      <div class="worksheet-answers-grid">
        ${answersHtml}
      </div>
    </div>
  `;
}

export function printWorksheet(options = {}) {
  const worksheet = buildWorksheetData(options);
  const root = document.getElementById('print-worksheet-root');
  if (root) {
    root.innerHTML = renderWorksheetHTML(worksheet);
  }
  if (typeof window !== 'undefined' && typeof window.print === 'function') {
    window.print();
  }
  return worksheet;
}
