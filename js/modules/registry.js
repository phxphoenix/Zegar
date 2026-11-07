// ============================================================================
// REJESTR MODUŁÓW PRZEDMIOTOWYCH (MODULE REGISTRY)
// Aby dodać nowy dział (np. Geometria, Język polski, Przyroda),
// utwórz plik w js/modules/ i dopisz go do tablicy MODULES poniżej.
// ============================================================================

import { clockModule } from './clock.js';
import { mathModule } from './math.js';

export const MODULES = [
  clockModule,
  mathModule
];

export function getModuleById(id) {
  return MODULES.find(m => m.id === id) || MODULES[0];
}
