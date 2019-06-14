import { watch } from 'melanke-watchjs';
import { Console, saveToStorage, loadFromStorage } from './utils';

const cconsole = new Console('Store', 'debug');
// Store initial state
const store = {
  // Settings
  'input-disable-suspension': false,
  'input-delay-suspend': '60',
  'input-ignore-audible': true,
  'input-ignore-pinned': true,
  'input-suspend-threshold': '1',

  // Actions
  'input-suspend-planned': false,
  'input-suspend-all-planned': false,

  // Whitelist
  'input-enable-whitelist': true,
  'input-whitelist-pattern': '',

  // Blacklist
  'input-enable-blacklist': true,
  'input-blacklist-pattern': '',
};

const prepare = async () => {
  cconsole.log('store initialization', store);

  // Rehydrate store with values stored in localStorage
  const rehydrate = async (sponge) => {
    const water = await loadFromStorage();
    Object.keys(sponge).forEach((key) => {
      /* eslint-disable-next-line no-param-reassign */
      if (water[key]) sponge[key] = water[key];
    });
  };

  await rehydrate(store);
  cconsole.log('store rehydrated', store);


  // NOTE: Avoid intensive updating (like changing store in oninput of text input elements)
  // since it would put store in circular update loop
  // TODO: Fix this behaviour

  // Watch for changes in store and keep localStorage in sync
  watch(store, async (prop, action, newValue) => {
    cconsole.log('state changed', prop, newValue);
    await saveToStorage(prop, newValue);
  });

  // Watch for changes in localStorage and keep store in sync
  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') {
      return;
    }
    Object.entries(changes).forEach(([selector, { newValue }]) => {
      // Ignore storage items not belonging to the store, do not update unchanged items
      if (!Object.prototype.hasOwnProperty.call(store, selector)
        && JSON.stringify(store[selector]) === JSON.stringify(newValue)
      ) {
        return;
      }
      cconsole.log('storage changed', selector, newValue);
      store[selector] = newValue;
    });
  });
};

prepare();

export default store;
