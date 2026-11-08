// ============================================================================
// TEST HELPER: JSDOM ENVIRONMENT LOADER
// Tworzy czyste środowisko DOM bazujące na index.html dla testów jednostkowych i integracyjnych
// ============================================================================

import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const HTML_PATH = path.join(ROOT_DIR, 'index.html');
const HTML_CONTENT = fs.readFileSync(HTML_PATH, 'utf8');

export function createTestDOM(initialUrl = 'http://localhost/') {
  const dom = new JSDOM(HTML_CONTENT, {
    url: initialUrl,
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });

  const { window } = dom;

  // Polyfill / Mock storage
  const storageMap = new Map();
  const mockLocalStorage = {
    getItem(key) {
      return storageMap.has(key) ? storageMap.get(key) : null;
    },
    setItem(key, value) {
      storageMap.set(key, String(value));
    },
    removeItem(key) {
      storageMap.delete(key);
    },
    clear() {
      storageMap.clear();
    },
    get length() {
      return storageMap.size;
    },
    key(index) {
      return Array.from(storageMap.keys())[index] || null;
    }
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });

  // Polyfill global fetch
  let mockFetchHandler = null;
  const mockFetch = async (url, options = {}) => {
    if (mockFetchHandler) {
      return mockFetchHandler(url, options);
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({})
    };
  };

  window.fetch = mockFetch;

  // Ustawienie referencji na obiekt globalny Node
  global.window = window;
  global.document = window.document;
  global.localStorage = window.localStorage;
  global.fetch = window.fetch;
  global.HTMLElement = window.HTMLElement;
  global.Element = window.Element;
  global.Node = window.Node;

  return {
    dom,
    window,
    document: window.document,
    localStorage: mockLocalStorage,
    setMockFetch(handler) {
      mockFetchHandler = handler;
    },
    cleanup() {
      mockFetchHandler = null;
      storageMap.clear();
    }
  };
}
