/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint no-underscore-dangle: 0 */

import 'bootstrap';
import './index.scss';
// import 'bootstrap/dist/css/bootstrap.min.css';

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

const checkbox = {
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
};

const numericTextInput = {
  valueProperty: 'value',
  defaultValue: 1,
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
};

const elements = [
  {
    selector: '#input-delay-suspend',
    ...numericTextInput,
    defaultValue: 60,
  },
  {
    selector: '#input-ignore-audible',
    ...checkbox,
  },
  {
    selector: '#input-ignore-pinned',
    ...checkbox,
    defaultValue: true,
  },
  {
    selector: '#input-suspend-planned',
    ...checkbox,
  },
  {
    selector: '#input-suspend-all-planned',
    ...checkbox,
  },
  {
    selector: '#input-disable-suspension',
    ...checkbox,
  },
  {
    selector: '#input-enable-whitelist',
    ...checkbox,
  },
  {
    selector: '#input-whitelist-pattern',
    valueProperty: 'value',
    defaultValue: '',
    postLoad: (loadedValue, defaultValue) => {
      this._whitelistPatterns = (loadedValue && loadedValue instanceof Set)
        ? loadedValue
        : new Set();

      this._whitelistEditing = null;

      const whitelistContainer = document.querySelector('#list-whitelist-container');
      whitelistContainer.innerHTML = '';

      const handleConfirm = (pattern, editField) => async () => {
        this._whitelistPatterns.delete(pattern);
        this._whitelistPatterns.add(editField.value);
        await saveToStorage('#input-whitelist-pattern', this._whitelistPatterns);
        this._whitelistEditing = null;
      };

      const handleDelete = pattern => async () => {
        this._whitelistPatterns.delete(pattern);
        await saveToStorage('#input-whitelist-pattern', this._whitelistPatterns);
      };

      const handleEdit = (item, pattern) => async () => {
        this._whitelistEditing = pattern;
        document.addEventListener('click', focusLostListener(item));
      };

      const focusLostListener = item => async (event) => {
        console.log(event.target, item.children, item.contains(event.target));
        /* if (!event.target.closest()) {
          console.log('outside');
          document.removeEventListener('click', focusLostListener);
          await handleConfirm(pattern)();
        } */
      };

      const editField = document.createElement('input');
      editField.type = 'text';
      editField.classList.add('form-control');

      const confirmEditButton = document.createElement('a');
      confirmEditButton.textContent = 'Confirm';
      confirmEditButton.classList.add('mx-1');

      const editButton = document.createElement('a');
      editButton.textContent = 'Edit';
      editButton.classList.add('mx-1');

      const deleteButton = document.createElement('a');
      deleteButton.textContent = 'Delete';
      deleteButton.classList.add('mx-1');

      [...this._whitelistPatterns].sort().forEach((pattern) => {
        const item = document.createElement('div');
        item.classList.add('list-group-item', 'list-group-item-action');
        item.textContent = pattern;
        item.addEventListener('mouseenter', () => {
          if (this._whitelistEditing === pattern) {
            while (item.firstChild) {
              item.removeChild(item.firstChild);
            }
            item.textContent = '';
            item.appendChild(editField);

            confirmEditButton.onclick = handleConfirm(pattern, editField);
            item.appendChild(confirmEditButton);
          } else {
            editButton.onclick = handleEdit(item, pattern);
            item.appendChild(editButton);

            deleteButton.onclick = handleDelete(pattern);
            item.appendChild(deleteButton);
          }
        });

        item.addEventListener('mouseleave', () => {
          while (item.firstChild) {
            item.removeChild(item.firstChild);
          }
          item.textContent = pattern;
        });

        whitelistContainer.appendChild(item);
      });
      return defaultValue;
    },
    preSave: (saveValue) => {
      this._whitelistPatterns.add(saveValue);
      return this._whitelistPatterns;
    },
    formatter: str => str.trim(),
  },
  {
    selector: '#input-enable-blacklist',
    ...checkbox,
  },
  {
    selector: '#input-blacklist-pattern',
    valueProperty: 'value',
    defaultValue: '',
    postLoad: (loadedValue, defaultValue) => {
      this._blacklistPatterns = (loadedValue && loadedValue instanceof Set)
        ? loadedValue
        : new Set();

      const blacklistContainer = document.querySelector('#list-blacklist-container');
      blacklistContainer.innerHTML = '';
      this._blacklistPatterns.forEach((pattern) => {
        const item = document.createElement('button');
        item.classList.add('list-group-item', 'list-group-item-action');
        item.textContent = pattern;
        item.addEventListener('click', async () => {
          this._blacklistPatterns.delete(pattern);
          await saveToStorage('#input-blacklist-pattern', this._blacklistPatterns);
        });
        blacklistContainer.appendChild(item);
      });
      return defaultValue;
    },
    preSave: (saveValue) => {
      this._blacklistPatterns.add(saveValue);
      return this._blacklistPatterns;
    },
    formatter: str => str.trim(),
  },
  {
    selector: '#input-suspend-threshold',
    ...numericTextInput,
  },
];

update(elements);
handleChanges(elements);
subscribeToUpdates(elements);
