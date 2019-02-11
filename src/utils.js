/* eslint no-unused-vars: off, no-console: off */

class Console {
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

const bconsole = new Console('background', 'debug');
