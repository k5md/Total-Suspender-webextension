/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint no-underscore-dangle: 0 */

const saveToStorage = (key, value) => browser.storage.local.set({ [key]: value });

const loadFromStorage = (key = null) => browser.storage.local.get(key);

const update = elements => Promise.all(elements.map(async ({
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
  selector, valueProperty, defaultValue, preSave, formatter, event, handler,
}) => {
  const node = document.querySelector(selector);

  const defaultHandler = async () => {
    node[valueProperty] = formatter(node[valueProperty]);
    const prepared = preSave(node[valueProperty], defaultValue);
    await saveToStorage(selector, prepared);
  };

  node.addEventListener(event || 'change', handler || defaultHandler);

  return node;
});

const subscribeToUpdates = (elements) => {
  browser.storage.onChanged.addListener(async () => {
    const loadedOptions = await Promise.all(elements.map(async (option) => {
      const { selector, defaultValue } = option;
      const value = (await loadFromStorage(selector))[selector] || defaultValue;
      return { ...option, value };
    }));
    loadedOptions.forEach(({
      selector, valueProperty, value, defaultValue, postLoad, formatter,
    }) => {
      const prepared = postLoad(value, defaultValue);
      document.querySelector(selector)[valueProperty] = formatter(prepared);
    });
  });
};

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
  {
    selector: '#input-suspend-planned',
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
  {
    selector: '#input-disable-suspension',
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
  {
    selector: '#input-whitelist-pattern',
    valueProperty: 'value',
    defaultValue: '',
    postLoad: (loadedValue, defaultValue) => {
      this._whitelistPatterns = (loadedValue && loadedValue instanceof Set)
        ? new Set(loadedValue)
        : new Set();
      this.console.log('loaded', loadedValue, this._whitelistPatterns);
      const whitelistContainer = document.querySelector('#list-whitelist-container');
      whitelistContainer.innerHTML = '';
      this._whitelistPatterns.forEach((pattern) => {
        const item = document.createElement('button');
        item.classList.add('list-group-item', 'list-group-item-action');
        item.textContent = pattern;
        item.addEventListener('click', async () => {
          this.console.log(this._whitelistPatterns);
          this._whitelistPatterns.delete(pattern);
          await saveToStorage('#input-whitelist-pattern', this._whitelistPatterns);
        });
        whitelistContainer.appendChild(item);
      });
      return defaultValue;
    },
    preSave: (saveValue) => {
      this.console.log(this._whitelistPatterns, saveValue);
      this._whitelistPatterns.add(saveValue);
      return this._whitelistPatterns;
    },
    formatter: str => str.trim(),
  },
];

update(elements);
handleChanges(elements);
subscribeToUpdates(elements);
