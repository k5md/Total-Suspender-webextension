/* eslint import/extensions: off */

import TabSuspender from './TabSuspender.js';
import Console from './utils.js';

const tabSuspender = new TabSuspender();

tabSuspender.console = new Console('TabSuspender', ''); // set second parameter to 'debug' for verbose output
tabSuspender.run();
