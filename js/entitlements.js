// ============================================================================
// WARSTWA UPRAWNIEŃ: DARMOWE (FREE) vs BYSTRZAK PRO
// Zarządza dostępem do klas 2-3, kontynentów spoza Europy, profili rodzeństwa
// oraz pełnego generatora kart pracy PDF. Gotowa pod przyszłe podpięcie
// płatności Web (Paddle / Polar / BLIK) oraz RevenueCat (Google Play / iOS).
// ============================================================================

const PRO_STORAGE_KEY = 'zegar_pro_status_v1';
const PRO_INTEREST_KEY = 'zegar_pro_interest_clicks_v1';

// Opcjonalny link do formularza listy oczekujących (np. Tally / Google Forms).
// Zostaw pusty w fazie czystego testu lokalnego (Fake Door).
export const PRO_WAITLIST_URL = '';

export const FREE_CONTINENTS = ['europe'];

export function isProUser() {
  try {
    return localStorage.getItem(PRO_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setProStatus(enabled) {
  const value = Boolean(enabled);
  try {
    localStorage.setItem(PRO_STORAGE_KEY, value ? 'true' : 'false');
  } catch {
    // Ignoruj błędy localStorage (np. tryb prywatny)
  }
  return value;
}

export function canAccessMathGrade(grade) {
  return Number(grade) === 1 || isProUser();
}

export function canAccessOrthoGrade(grade) {
  return Number(grade) === 1 || isProUser();
}

export function canAccessContinent(continentId) {
  return FREE_CONTINENTS.includes(continentId) || isProUser();
}

export function canUseMultiProfiles() {
  return isProUser();
}

export function canUseFullWorksheets() {
  return isProUser();
}

export function recordProInterestClick(featureKey = 'general') {
  try {
    const raw = localStorage.getItem(PRO_INTEREST_KEY);
    const data = raw ? JSON.parse(raw) : { total: 0, byFeature: {} };
    data.total = (Number(data.total) || 0) + 1;
    data.byFeature = data.byFeature && typeof data.byFeature === 'object' ? data.byFeature : {};
    data.byFeature[featureKey] = (Number(data.byFeature[featureKey]) || 0) + 1;
    data.lastClickedAt = new Date().toISOString();
    localStorage.setItem(PRO_INTEREST_KEY, JSON.stringify(data));
    return data;
  } catch {
    return { total: 1, byFeature: { [featureKey]: 1 } };
  }
}

export function getProInterestStats() {
  try {
    const raw = localStorage.getItem(PRO_INTEREST_KEY);
    if (!raw) return { total: 0, byFeature: {} };
    const parsed = JSON.parse(raw);
    return {
      total: Number(parsed?.total) || 0,
      byFeature: parsed?.byFeature && typeof parsed.byFeature === 'object' ? parsed.byFeature : {},
      lastClickedAt: parsed?.lastClickedAt || null
    };
  } catch {
    return { total: 0, byFeature: {} };
  }
}

export function getFreeTierSummary() {
  return {
    clock: 'full',
    mathGrades: [1],
    orthoGrades: [1],
    continents: [...FREE_CONTINENTS],
    maxProfiles: 1,
    worksheetPreviewCount: 4
  };
}
