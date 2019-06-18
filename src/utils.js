/* eslint no-console: off */

export const saveToStorage = hash => browser.storage.local.set(hash);

export const loadFromStorage = (key = null) => browser.storage.local.get(key);

// https://stackoverflow.com/a/874742
export const stringToRegex = (str) => {
  const flags = str.replace(/.*\/([gimy]*)$/, '$1');
  const pattern = str.replace(new RegExp(`^/(.*?)/${flags}$`), '$1');
  return new RegExp(pattern, flags);
};

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
