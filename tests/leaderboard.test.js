import { test, describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDOM } from './helpers/dom.js';
import {
  leaderboardState,
  resolveEntryModuleId,
  sortLeaderboard,
  qualifiesForTop10,
  fetchLeaderboard,
  renderRankingList,
  openRankingModal,
  closeRankingModal,
  submitTop10Score,
  updateRankingModalHeader
} from '../js/leaderboard.js';

describe('leaderboard - Moduł rankingu Top 10', () => {
  let env;

  beforeEach(() => {
    env = createTestDOM();
    leaderboardState.activeModuleId = 'clock';
    leaderboardState.byModule = {};
    leaderboardState.list = [];
    leaderboardState.pendingScore = null;
    leaderboardState.lastSavedId = null;
    leaderboardState.isSavingScore = false;
  });

  describe('resolveEntryModuleId', () => {
    it('poprawnie rozpoznaje moduł z pola moduleId', () => {
      assert.strictEqual(resolveEntryModuleId({ moduleId: 'math' }), 'math');
      assert.strictEqual(resolveEntryModuleId({ moduleId: 'orthography' }), 'orthography');
      assert.strictEqual(resolveEntryModuleId({ moduleId: 'flags_logos' }), 'flags_logos');
      assert.strictEqual(resolveEntryModuleId({ moduleId: 'flags_logos_flags' }), 'flags_logos');
      assert.strictEqual(resolveEntryModuleId({ moduleId: 'flags_logos_logos' }), 'flags_logos');
      assert.strictEqual(resolveEntryModuleId({ moduleId: 'clock' }), 'clock');
    });

    it('poprawnie mapuje archiwalne wpisy po polu mode', () => {
      assert.strictEqual(resolveEntryModuleId({ mode: 'math' }), 'math');
      assert.strictEqual(resolveEntryModuleId({ mode: 'gap' }), 'orthography');
      assert.strictEqual(resolveEntryModuleId({ mode: 'word' }), 'orthography');
      assert.strictEqual(resolveEntryModuleId({ mode: 'spot' }), 'orthography');
      assert.strictEqual(resolveEntryModuleId({ mode: 'orthography' }), 'orthography');
      assert.strictEqual(resolveEntryModuleId({ mode: 'flags' }), 'flags_logos');
      assert.strictEqual(resolveEntryModuleId({ mode: 'logos' }), 'flags_logos');
      assert.strictEqual(resolveEntryModuleId({ mode: 'digital' }), 'clock');
      assert.strictEqual(resolveEntryModuleId({ mode: 'words' }), 'clock');
    });

    it('domyślnie zwraca clock dla nieznanych lub pustych danych', () => {
      assert.strictEqual(resolveEntryModuleId(null), 'clock');
      assert.strictEqual(resolveEntryModuleId(undefined), 'clock');
      assert.strictEqual(resolveEntryModuleId({}), 'clock');
      assert.strictEqual(resolveEntryModuleId({ mode: 'unknown' }), 'clock');
    });
  });

  describe('sortLeaderboard', () => {
    it('sortuje wyniki malejąco według liczby punktów', () => {
      const input = [
        { name: 'Adam', score: 5, date: '2026-11-01T10:00:00Z' },
        { name: 'Basia', score: 12, date: '2026-11-01T10:00:00Z' },
        { name: 'Celina', score: 8, date: '2026-11-01T10:00:00Z' }
      ];
      const sorted = sortLeaderboard(input);
      assert.strictEqual(sorted.length, 3);
      assert.strictEqual(sorted[0].name, 'Basia');
      assert.strictEqual(sorted[1].name, 'Celina');
      assert.strictEqual(sorted[2].name, 'Adam');
    });

    it('przy równej liczbie punktów nowszy wynik ma wyższą pozycję', () => {
      const input = [
        { name: 'Dawid', score: 10, date: '2026-11-01T08:00:00Z' },
        { name: 'Ewa', score: 10, date: '2026-11-05T12:00:00Z' }
      ];
      const sorted = sortLeaderboard(input);
      assert.strictEqual(sorted[0].name, 'Ewa');
      assert.strictEqual(sorted[1].name, 'Dawid');
    });

    it('odrzuca wyniki mniejsze lub równe zero oraz niepoprawne obiekty', () => {
      const input = [
        null,
        undefined,
        { name: 'Filip', score: 0 },
        { name: 'Grażyna', score: -3 },
        { name: 'Hubert', score: 'dziesięć' },
        { name: 'Iga', score: 7 }
      ];
      const sorted = sortLeaderboard(input);
      assert.strictEqual(sorted.length, 1);
      assert.strictEqual(sorted[0].name, 'Iga');
    });

    it('obcina listę do maksymalnie 10 najlepszych wyników', () => {
      const input = [];
      for (let i = 1; i <= 15; i++) {
        input.push({ name: `Gracz ${i}`, score: i, date: '2026-11-01T10:00:00Z' });
      }
      const sorted = sortLeaderboard(input);
      assert.strictEqual(sorted.length, 10);
      assert.strictEqual(sorted[0].score, 15);
      assert.strictEqual(sorted[9].score, 6);
    });

    it('bezpiecznie radzi sobie z pustymi wartościami wejściowymi', () => {
      assert.deepStrictEqual(sortLeaderboard(null), []);
      assert.deepStrictEqual(sortLeaderboard([]), []);
    });
  });

  describe('qualifiesForTop10', () => {
    it('zwraca false dla punktacji <= 0', () => {
      assert.strictEqual(qualifiesForTop10(0, []), false);
      assert.strictEqual(qualifiesForTop10(-5, []), false);
      assert.strictEqual(qualifiesForTop10(null, []), false);
    });

    it('zwraca true, gdy na liście jest mniej niż 10 graczy', () => {
      const list = [
        { name: 'Jan', score: 20 },
        { name: 'Kasia', score: 15 }
      ];
      assert.strictEqual(qualifiesForTop10(1, list), true);
    });

    it('porównuje z 10. miejscem, gdy lista jest pełna', () => {
      const fullList = [
        { score: 30 }, { score: 28 }, { score: 25 }, { score: 22 }, { score: 20 },
        { score: 18 }, { score: 15 }, { score: 12 }, { score: 10 }, { score: 8 }
      ];

      // Wynik wyższy niż 10. miejsce (8)
      assert.strictEqual(qualifiesForTop10(9, fullList), true);
      // Wynik równy 10. miejscu (8) kwalifikuje się (remis na korzyść nowego gracza)
      assert.strictEqual(qualifiesForTop10(8, fullList), true);
      // Wynik niższy niż 10. miejsce
      assert.strictEqual(qualifiesForTop10(7, fullList), false);
    });
  });

  describe('renderRankingList i interfejs modala', () => {
    it('renderuje komunikat o braku wyników, gdy lista jest pusta', () => {
      leaderboardState.list = [];
      renderRankingList('pl', 'clock');
      const container = document.getElementById('ranking-list-container');
      assert.ok(container.textContent.includes('Brak zapisanych wyników'));
    });

    it('renderuje wpisy z medalami i odznakami', () => {
      leaderboardState.byModule = {
        clock: [
          { id: '1', name: 'Zosia', score: 15, mode: 'digital', date: '2026-11-08T12:00:00Z' },
          { id: '2', name: 'Tomek', score: 10, mode: 'words', date: '2026-11-08T11:00:00Z' },
          { id: '3', name: 'Ola', score: 5, mode: 'digital', date: '2026-11-08T10:00:00Z' }
        ]
      };
      leaderboardState.activeModuleId = 'clock';

      renderRankingList('pl', 'clock');
      const container = document.getElementById('ranking-list-container');
      const rows = container.children;
      assert.strictEqual(rows.length, 3);
      assert.ok(rows[0].textContent.includes('🥇'));
      assert.ok(rows[0].textContent.includes('Zosia'));
      assert.ok(rows[0].textContent.includes('15 pkt'));

      assert.ok(rows[1].textContent.includes('🥈'));
      assert.ok(rows[1].textContent.includes('Tomek'));

      assert.ok(rows[2].textContent.includes('🥉'));
      assert.ok(rows[2].textContent.includes('Ola'));
    });

    it('aktualizuje nagłówek modala w zależności od wybranego modułu', () => {
      updateRankingModalHeader('pl', 'math');
      const title = document.getElementById('ranking-modal-title');
      assert.ok(title.textContent.includes('Matematyka'));

      updateRankingModalHeader('pl', 'orthography');
      assert.ok(title.textContent.includes('Ortografia'));

      updateRankingModalHeader('en', 'clock');
      assert.ok(title.textContent.includes('Clock'));
    });

    it('otwiera i zamyka modal rankingu', async () => {
      const modal = document.getElementById('ranking-modal');
      assert.ok(modal.classList.contains('hidden'));

      await openRankingModal('pl', false, 'clock');
      assert.ok(!modal.classList.contains('hidden'));
      assert.ok(modal.classList.contains('flex'));

      closeRankingModal();
      assert.ok(modal.classList.contains('hidden'));
      assert.ok(!modal.classList.contains('flex'));
    });
  });

  describe('migracja pamięci lokalnej (Local Storage) i synchronizacja', () => {
    it('automatycznie migruje płaską tablicę v1 do podzielonej struktury v2', async () => {
      const legacyData = [
        { id: 'c1', name: 'Kamil', score: 10, mode: 'digital', date: '2026-11-01' },
        { id: 'm1', name: 'Maja', score: 8, mode: 'math', date: '2026-11-02' },
        { id: 'o1', name: 'Oliwier', score: 14, mode: 'gap', date: '2026-11-03' }
      ];
      localStorage.setItem('zegar_leaderboard_top10_v1', JSON.stringify(legacyData));

      // Mock fetch rzucający błąd, aby wymusić fallback do pamięci podręcznej
      env.setMockFetch(async () => {
        throw new Error('Network error');
      });

      const listClock = await fetchLeaderboard('pl', 'clock');
      assert.strictEqual(listClock.length, 1);
      assert.strictEqual(listClock[0].name, 'Kamil');

      const listMath = await fetchLeaderboard('pl', 'math');
      assert.strictEqual(listMath.length, 1);
      assert.strictEqual(listMath[0].name, 'Maja');

      const listOrtho = await fetchLeaderboard('pl', 'orthography');
      assert.strictEqual(listOrtho.length, 1);
      assert.strictEqual(listOrtho[0].name, 'Oliwier');

      // Weryfikacja zapisu w nowym kluczu v2
      const savedV2 = JSON.parse(localStorage.getItem('zegar_leaderboards_by_module_v2'));
      assert.ok(savedV2.clock && savedV2.math && savedV2.orthography);
    });

    it('zapisuje nowy wynik gracza i aktualizuje listę', async () => {
      let savedPayload = null;
      env.setMockFetch(async (url, options) => {
        if (options && options.method === 'PUT') {
          savedPayload = JSON.parse(options.body);
          return { ok: true, json: async () => ({}) };
        }
        return { ok: true, json: async () => ({}) };
      });

      leaderboardState.pendingScore = {
        score: 25,
        moduleId: 'math',
        mode: 'math',
        meta: { grade: 2, ops: ['add', 'mul'] }
      };

      document.getElementById('player-name-input').value = 'SuperBystrzak';

      await submitTop10Score('pl');

      assert.strictEqual(leaderboardState.isSavingScore, false);
      assert.strictEqual(leaderboardState.pendingScore, null);
      assert.ok(savedPayload);
      assert.strictEqual(savedPayload[0].name, 'SuperBystrzak');
      assert.strictEqual(savedPayload[0].score, 25);
      assert.strictEqual(localStorage.getItem('zegar_last_player_name_v1'), 'SuperBystrzak');
    });

    it('rozróżnia w rankingu wyniki dla Flag i Logotypów (osobne listy Top 10 oraz odznaki)', async () => {
      leaderboardState.byModule = {
        flags_logos_flags: [
          {
            id: 'fl1',
            name: 'Geograf',
            score: 18,
            moduleId: 'flags_logos',
            mode: 'flags',
            meta: { quizType: 'flags', continents: ['europe', 'asia'] },
            date: '2026-11-10T12:00:00Z'
          }
        ],
        flags_logos_logos: [
          {
            id: 'lg1',
            name: 'ZnawcaMarek',
            score: 22,
            moduleId: 'flags_logos',
            mode: 'logos',
            meta: { quizType: 'logos', categories: ['automotive', 'tech'] },
            date: '2026-11-10T13:00:00Z'
          }
        ]
      };

      // Widok rankingu Flag
      renderRankingList('pl', 'flags_logos', 'flags');
      const container = document.getElementById('ranking-list-container');
      const title = document.getElementById('ranking-modal-title');
      assert.ok(title.textContent.includes('Flagi'), 'Nagłówek powinien wskazywać podkategorię Flagi');
      assert.ok(container.textContent.includes('Geograf'));
      assert.ok(!container.textContent.includes('ZnawcaMarek'), 'Lista Flag nie powinna mieszać się z Logotypami');
      assert.ok(container.textContent.includes('🚩 Flagi • Europa, Azja'));

      // Przełączenie na widok rankingu Logotypów przyciskiem w modalu
      const logosTabBtn = container.querySelector('button[data-ranking-submode="logos"]');
      assert.ok(logosTabBtn, 'Brak przełącznika podkategorii Logotypy w modalu rankingu');
      logosTabBtn.click();

      assert.ok(title.textContent.includes('Logotypy'), 'Nagłówek powinien wskazywać podkategorię Logotypy');
      assert.ok(container.textContent.includes('ZnawcaMarek'));
      assert.ok(!container.textContent.includes('Geograf'));
      assert.ok(container.textContent.includes('🏷️ Logotypy • Moto, Tech'));
    });
  });
});
