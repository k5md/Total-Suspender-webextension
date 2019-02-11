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
    const bodyString = body.join(' ');
    console.log(`%c${this.title} --- %c${bodyString}`, 'color: red;', 'color: green;');
  }
}

const bconsole = new Console('background', 'debug');
