/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint no-underscore-dangle: 0 */
import 'bootstrap';

import App from './Containers/App';

const m = require('mithril');

const entrypoint = document.getElementById('entrypoint');
m.mount(entrypoint, App);
