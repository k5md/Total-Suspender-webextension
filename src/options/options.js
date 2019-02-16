/* eslint no-param-reassign: ["error", { "props": false }] */

const saveToStorage = (key, value) => browser.storage.local.set({ [key]: value });

const loadFromStorage = (key = null) => browser.storage.local.get(key);

const initialize = elements => Promise.all(elements.map(async ({
  selector, valueProperty, defaultValue, postLoad, formatter,
}) => {
  const node = document.querySelector(selector);
  const payload = await loadFromStorage(selector);
  const loadedValue = payload[selector]; // storage.<type>.get returns object
  const prepared = postLoad(loadedValue, defaultValue);
  node[valueProperty] = formatter(prepared);

  return node;
}));

const handleChanges = elements => elements.map(({
  selector, valueProperty, defaultValue, preSave, formatter,
}) => {
  const node = document.querySelector(selector);

  node.addEventListener('input', async () => {
    node[valueProperty] = formatter(node[valueProperty]);
    const prepared = preSave(node[valueProperty], defaultValue);
    await saveToStorage(selector, prepared);
  });

  return node;
});

const elements = [
  {
    selector: '#input-delay-suspend',
    valueProperty: 'value',
    defaultValue: 60,
    postLoad: (loadedValue, defaultValue) => {
      const defaultString = defaultValue.toString();
      if (!loadedValue) {
        return defaultString;
      }

      const loadedString = loadedValue.toString();
      if (Number.isNaN(loadedValue) || parseInt(loadedString, 10) < 1) {
        return defaultString;
      }
      return loadedString;
    },
    preSave: (saveValue, defaultValue) => {
      const saveNumber = parseInt(saveValue, 10);

      return Number.isNaN(saveNumber) ? defaultValue : saveNumber;
    },
    formatter: str => str.replace(/[^0-9]/g, ''),
  },
  {
    selector: '#input-ignore-audible',
    valueProperty: 'checked',
    defaultValue: false,
    postLoad: (loadedValue, defaultValue) => {
      if (typeof loadedValue !== 'boolean') {
        return defaultValue;
      }
      return loadedValue;
    },
    preSave: saveValue => Boolean(saveValue),
    formatter: v => v,
  },
];

initialize(elements);
handleChanges(elements);
