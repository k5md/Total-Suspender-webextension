/* eslint no-console: off */

export const saveToStorage = (key, value) => browser.storage.local.set({ [key]: value });

export const loadFromStorage = (key = null) => browser.storage.local.get(key);

export class Console {
  constructor(title, level) {
    this.title = title;
    this.level = level;
  }

  log(...body) {
    if (this.level !== 'debug') {
      return;
    }
    console.log(`%c${this.title} ---`, 'color: red;', ...body);
  }
}
