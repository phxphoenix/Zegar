import { test, describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDOM } from './helpers/dom.js';

describe('app - Integracja powłoki aplikacji (App Shell & Quiz Engine)', () => {
  let env;

  before(async () => {
    env = createTestDOM();
    // Import powłoki aplikacji montuje aplikację w DOM
    await import('../js/app.js');
  });

  it('inicjalizuje aplikację z domyślnym modułem zegara i wynikiem 0', () => {
    const tabs = document.querySelectorAll('#module-tabs button');
    assert.strictEqual(tabs.length, 4, 'Górny pasek powinien zawierać 4 zakładki przedmiotów');
    assert.strictEqual(tabs[0].textContent.trim(), '🕒 Zegar');
    assert.strictEqual(tabs[3].textContent.trim(), '🚩 Flaga/Logo');
    assert.ok(tabs[0].classList.contains('bg-indigo-600'), 'Domyślnie aktywny powinien być moduł zegara');

    const scoreBadge = document.getElementById('score-badge');
    assert.strictEqual(scoreBadge.textContent.trim(), '🔥 Wynik: 0');

    const options = document.querySelectorAll('#options-container button');
    assert.strictEqual(options.length, 4, 'Powinny być wyrenderowane 4 warianty odpowiedzi');

    const teacherPanel = document.getElementById('teacher-panel');
    assert.ok(teacherPanel.classList.contains('hidden'), 'Panel opcji powinien być domyślnie ukryty');
  });

  it('obsługuje poprawną i błędną odpowiedź gracza oraz serię punktową', async () => {
    // Odczytujemy opcje
    const optionBtns = Array.from(document.querySelectorAll('#options-container button'));
    assert.strictEqual(optionBtns.length, 4);

    // Aby znaleźć poprawny przycisk, możemy sprawdzić, który przycisk ma odpowiedź pasującą do wskazówek
    // Lub klikamy pierwszy przycisk i sprawdzamy reakcję aplikacji
    const firstBtn = optionBtns[0];
    const firstText = firstBtn.textContent;
    firstBtn.click();

    const scoreBadge = document.getElementById('score-badge');
    const feedback = document.getElementById('feedback-box');

    // Po kliknięciu albo wynik wzrósł (jeśli był poprawny), albo pozostał 0 z informacją o błędzie
    if (scoreBadge.textContent.includes('Wynik: 1')) {
      assert.ok(firstBtn.classList.contains('border-emerald-500'));
      assert.ok(feedback.textContent.includes('Brawo'));
    } else {
      assert.ok(scoreBadge.textContent.includes('Wynik: 0'));
      assert.ok(firstBtn.classList.contains('border-rose-400'));
      assert.ok(feedback.textContent.includes('Błąd'));
    }
  });

  it('przełącza moduły przedmiotowe (Zegar -> Matematyka -> Ortografia)', () => {
    const tabs = document.querySelectorAll('#module-tabs button');
    const mathTab = tabs[1];
    const orthoTab = tabs[2];
    const clockTab = tabs[0];

    // Przełącz na Matematykę
    mathTab.click();
    const qTitleMath = document.getElementById('question-title');
    assert.ok(qTitleMath.textContent.includes('Ile to jest'), 'Tytuł pytania powinien odpowiadać matematyce');
    assert.ok(document.getElementById('math-expression'), 'Scena matematyki powinna być zamontowana');

    // Przełącz na Ortografię
    orthoTab.click();
    const qTitleOrtho = document.getElementById('question-title');
    assert.ok(
      qTitleOrtho.textContent.includes('Jak') || qTitleOrtho.textContent.includes('Bystre'),
      'Tytuł pytania powinien odpowiadać ortografii'
    );
    assert.ok(document.getElementById('ortho-context-badge'), 'Scena ortografii powinna być zamontowana');

    // Przełącz na Flaga/Logo
    const flTab = tabs[3];
    flTab.click();
    const qTitleFl = document.getElementById('question-title');
    assert.ok(
      qTitleFl.textContent.includes('flaga') || qTitleFl.textContent.includes('logotyp'),
      'Tytuł pytania powinien odpowiadać sekcji Flaga/Logo'
    );
    assert.ok(document.getElementById('fl-context-badge'), 'Scena Flaga/Logo powinna być zamontowana');

    // Powrót do Zegara
    clockTab.click();
    const qTitleClock = document.getElementById('question-title');
    assert.ok(qTitleClock.textContent.includes('godzina'), 'Tytuł pytania powinien odpowiadać zegarowi');
    assert.ok(document.getElementById('clock-svg'), 'Tarcza zegara powinna być zamontowana');
  });

  it('przełącza widoczność panelu konfiguracji (⚙️ Opcje)', () => {
    const toggleBtn = document.getElementById('toggle-panel-btn');
    const panel = document.getElementById('teacher-panel');

    assert.ok(panel.classList.contains('hidden'));

    toggleBtn.click();
    assert.ok(!panel.classList.contains('hidden'), 'Panel powinien być widoczny po kliknięciu');
    assert.ok(toggleBtn.textContent.includes('Ukryj opcje'));

    toggleBtn.click();
    assert.ok(panel.classList.contains('hidden'), 'Panel powinien być ponownie ukryty');
    assert.ok(toggleBtn.textContent.includes('Opcje'));
  });

  it('przełącza język interfejsu (PL <-> EN)', () => {
    const langBtn = document.getElementById('lang-btn');
    assert.strictEqual(langBtn.textContent.trim(), '🌐 PL');

    // Przełącz na angielski
    langBtn.click();
    assert.strictEqual(langBtn.textContent.trim(), '🌐 EN');
    assert.ok(document.getElementById('score-badge').textContent.includes('Score:'));
    assert.ok(document.getElementById('ranking-btn').textContent.includes('Ranking'));

    // Powrót do polskiego
    langBtn.click();
    assert.strictEqual(langBtn.textContent.trim(), '🌐 PL');
    assert.ok(document.getElementById('score-badge').textContent.includes('Wynik:'));
  });

  it('obsługuje przycisk zakończenia quizu przy wyniku 0 (wyświetla podpowiedź)', async () => {
    const finishBtn = document.getElementById('finish-quiz-btn');
    const feedback = document.getElementById('feedback-box');

    finishBtn.click();

    assert.ok(
      feedback.textContent.includes('Brak punktów') || feedback.textContent.includes('rozwiąż chociaż'),
      'Powinien wyświetlić zachętę do zdobycia punktów'
    );
  });

  it('otwiera i zamyka modal rankingu przyciskiem i klawiszem Escape', () => {
    const rankingBtn = document.getElementById('ranking-btn');
    const rankingModal = document.getElementById('ranking-modal');

    rankingBtn.click();
    assert.ok(!rankingModal.classList.contains('hidden'), 'Modal rankingu powinien być otwarty');

    // Klawisz Escape
    const escapeEvent = new env.window.KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    assert.ok(rankingModal.classList.contains('hidden'), 'Modal rankingu powinien być zamknięty po naciśnięciu Escape');
  });
});
