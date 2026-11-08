// ============================================================================
// REJESTR MODUŁÓW PRZEDMIOTOWYCH (MODULE REGISTRY)
// Aby dodać nowy dział (np. Geometria, Przyroda, Język angielski),
// utwórz plik w js/modules/ i dopisz go do tablicy MODULES poniżej.
// ============================================================================

import { clockModule } from './clock.js';
import { mathModule } from './math.js';
import { orthographyModule } from './orthography.js';

export const MODULES = [
  clockModule,
  mathModule,
  orthographyModule
];

export function getModuleById(id) {
  return MODULES.find(m => m.id === id) || MODULES[0];
}
