import { Console, saveToStorage, loadFromStorage } from './utils';

const m = require('mithril');
const stream = require('mithril/stream');

const storageConsole = new Console('Local storage', 'debug');
const stateConsole = new Console('State', 'debug');

// Store initial state
const initialState = {
  // Settings
  '#input-disable-suspension': false,
  '#input-delay-suspend': '60',
  '#input-ignore-audible': true,
  '#input-ignore-pinned': true,
  '#input-suspend-threshold': '1',

  // Actions
  '#input-suspend-planned': false,
  '#input-suspend-all-planned': false,

  // Whitelist
  '#input-enable-whitelist': true,
  '#input-whitelist-pattern': '',

  // Blacklist
  '#input-enable-blacklist': true,
  '#input-blacklist-pattern': '',
};

const state = stream(initialState);

const setState = (newState) => {
  const oldState = state();
  if (JSON.stringify(oldState) === JSON.stringify(newState)) {
    stateConsole.log('value not changed');
    return;
  }
  state(newState);
  stateConsole.log(state());
  // Keep localStorage in sync
  Object.entries(newState).forEach(([selector, newValue]) => saveToStorage(selector, newValue));

  m.redraw();
};

// Watch for changes in localStorage and keep state in sync
const storageListener = (changes, area) => {
  if (area !== 'local') {
    return;
  }

  const oldState = state();
  const newState = Object.entries(changes).reduce(
    (acc, [selector, { newValue }]) => ({ ...acc, [selector]: newValue }), oldState,
  );
  if (JSON.stringify(oldState) === JSON.stringify(newState)) {
    storageConsole.log('value not changed') 
    return;
  }
  setState(newState);
  storageConsole.log(state());
};


const rehydrate = async (sponge) => {
  const water = await loadFromStorage();
  return { ...sponge, ...water };
};

// Updates state from initialState with values from localStorage
const prepare = async () => {
  const newState = await rehydrate(initialState);
  state(newState);
  m.redraw();
  browser.storage.onChanged.addListener(storageListener);
};

prepare();

export { state, setState };
