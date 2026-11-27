// ============================================================================
// LOKALNE PROFILE DZIECI (DO 4 PROFILI W WERSJI PRO, 1 PROFIL W FREE)
// Wszystkie dane przechowywane wyłącznie w localStorage na urządzeniu (RODO).
// ============================================================================

import { isProUser } from './entitlements.js';

const PROFILES_STORAGE_KEY = 'zegar_profiles_v1';
const MAX_PRO_PROFILES = 4;

export const PROFILE_AVATARS = ['🦊', '🦉', '🦁', '🐼', '🐰', '🐸', '🦋', '🚀'];

const DEFAULT_PROFILE = {
  id: 'default',
  name: 'Bystrzak',
  avatar: '🦉'
};

function sanitizeName(rawName) {
  return String(rawName ?? '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 16);
}

function loadRawState() {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!raw) {
      return {
        activeId: DEFAULT_PROFILE.id,
        profiles: [{ ...DEFAULT_PROFILE }]
      };
    }
    const parsed = JSON.parse(raw);
    const profiles = Array.isArray(parsed?.profiles) && parsed.profiles.length > 0
      ? parsed.profiles
          .filter(p => p && typeof p.id === 'string')
          .map(p => ({
            id: p.id,
            name: sanitizeName(p.name) || DEFAULT_PROFILE.name,
            avatar: PROFILE_AVATARS.includes(p.avatar) ? p.avatar : DEFAULT_PROFILE.avatar
          }))
      : [{ ...DEFAULT_PROFILE }];

    const activeId = profiles.some(p => p.id === parsed?.activeId)
      ? parsed.activeId
      : profiles[0].id;

    return { activeId, profiles };
  } catch {
    return {
      activeId: DEFAULT_PROFILE.id,
      profiles: [{ ...DEFAULT_PROFILE }]
    };
  }
}

function saveRawState(stateObj) {
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(stateObj));
  } catch {
    // Ignoruj błędy localStorage
  }
}

export function getProfiles() {
  const { profiles } = loadRawState();
  return isProUser() ? profiles : [profiles[0]];
}

export function getActiveProfile() {
  const { activeId, profiles } = loadRawState();
  if (!isProUser()) return profiles[0];
  return profiles.find(p => p.id === activeId) || profiles[0];
}

export function getActiveProfileId() {
  return getActiveProfile().id;
}

export function setActiveProfile(profileId) {
  const stateObj = loadRawState();
  if (!isProUser()) {
    stateObj.activeId = stateObj.profiles[0].id;
    saveRawState(stateObj);
    return stateObj.profiles[0];
  }
  const found = stateObj.profiles.find(p => p.id === profileId);
  if (found) {
    stateObj.activeId = found.id;
    saveRawState(stateObj);
    return found;
  }
  return getActiveProfile();
}

export function addProfile(name, avatar = '🦊') {
  if (!isProUser()) {
    return { ok: false, reason: 'pro_required' };
  }
  const cleanName = sanitizeName(name);
  if (!cleanName) {
    return { ok: false, reason: 'empty_name' };
  }
  const stateObj = loadRawState();
  if (stateObj.profiles.length >= MAX_PRO_PROFILES) {
    return { ok: false, reason: 'limit_reached' };
  }

  const safeAvatar = PROFILE_AVATARS.includes(avatar) ? avatar : PROFILE_AVATARS[0];
  const newProfile = {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: cleanName,
    avatar: safeAvatar
  };

  stateObj.profiles.push(newProfile);
  stateObj.activeId = newProfile.id;
  saveRawState(stateObj);
  return { ok: true, profile: newProfile };
}

export function removeProfile(profileId) {
  if (!isProUser()) return false;
  const stateObj = loadRawState();
  if (stateObj.profiles.length <= 1 || profileId === stateObj.profiles[0].id) {
    return false; // Nie usuwamy jedynego / głównego profilu
  }
  const next = stateObj.profiles.filter(p => p.id !== profileId);
  if (next.length === stateObj.profiles.length) return false;
  stateObj.profiles = next;
  if (stateObj.activeId === profileId) {
    stateObj.activeId = next[0].id;
  }
  saveRawState(stateObj);
  return true;
}

export function renameDefaultProfile(newName, avatar) {
  const cleanName = sanitizeName(newName);
  if (!cleanName) return false;
  const stateObj = loadRawState();
  stateObj.profiles[0].name = cleanName;
  if (avatar && PROFILE_AVATARS.includes(avatar)) {
    stateObj.profiles[0].avatar = avatar;
  }
  saveRawState(stateObj);
  return true;
}
