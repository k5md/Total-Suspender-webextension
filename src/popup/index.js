import 'bootstrap';
import './index.scss';

/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint no-underscore-dangle: 0 */

import { saveToStorage, loadFromStorage } from '../utils';

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

const stringTextInput = {
  valueProperty: 'value',
  defaultValue: '',
  postLoad: (loadedValue, defaultValue) => {
    if (typeof loadedValue !== 'string') {
      return defaultValue;
    }
    return loadedValue;
  },
  preSave: saveValue => String(saveValue),
  formatter: str => str.trim(),
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
    ...stringTextInput,
    postLoad: (loadedValue, defaultValue) => {
      this._whitelistEditing = null;
      const mount = () => {
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

        const whitelistContainer = document.querySelector('#list-whitelist-container');
        whitelistContainer.innerHTML = '';

        const handleDelete = (item, pattern) => async () => {
          this._whitelistPatterns.delete(pattern);
          await saveToStorage('#input-whitelist-pattern', this._whitelistPatterns);
        };

        const handleEdit = (item, pattern) => async () => {
          this._whitelistEditing = pattern;
          mount();
        };

        const handleConfirm = (item, pattern) => async () => {
          this._whitelistPatterns.delete(pattern);
          this._whitelistPatterns.add(editField.value);
          await saveToStorage('#input-whitelist-pattern', this._whitelistPatterns);
          this._whitelistEditing = null;
        };

        const handleMouseEnter = (item, pattern) => () => {
          if (this._whitelistEditing === pattern) {
            while (item.firstChild) {
              item.removeChild(item.firstChild);
            }
            item.textContent = '';

            editField.value = pattern;
            item.appendChild(editField);

            confirmEditButton.onclick = handleConfirm(item, pattern);
            item.appendChild(confirmEditButton);
          } else {
            editButton.onclick = handleEdit(item, pattern);
            item.appendChild(editButton);

            deleteButton.onclick = handleDelete(item, pattern);
            item.appendChild(deleteButton);
          }
        };

        const handleMouseLeave = (item, pattern) => () => {
          if (this._whitelistEditing !== pattern) {
            while (item.firstChild) {
              item.removeChild(item.firstChild);
            }
            item.textContent = pattern;
          }
        };

        this._whitelistPatterns = (loadedValue && loadedValue instanceof Set)
          ? loadedValue
          : new Set();

        [...this._whitelistPatterns].sort().forEach((pattern) => {
          const item = document.createElement('div');
          item.classList.add('list-group-item', 'list-group-item-action');
          item.textContent = pattern;

          item.onmouseenter = handleMouseEnter(item, pattern);
          item.onmouseleave = handleMouseLeave(item, pattern);

          whitelistContainer.appendChild(item);
        });
      };

      mount.bind(this)();
      return defaultValue;
    },
    preSave: (saveValue) => {
      this._whitelistPatterns.add(saveValue);
      return this._whitelistPatterns;
    },
  },
  {
    selector: '#input-enable-blacklist',
    ...checkbox,
  },
  {
    selector: '#input-blacklist-pattern',
    ...stringTextInput,
    postLoad: (loadedValue, defaultValue) => {
      this._blacklistEditing = null;
      const mount = () => {
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

        const blacklistContainer = document.querySelector('#list-blacklist-container');
        blacklistContainer.innerHTML = '';

        const handleDelete = (item, pattern) => async () => {
          this._whitelistPatterns.delete(pattern);
          await saveToStorage('#input-blackist-pattern', this._blacklistPatterns);
        };

        const handleEdit = (item, pattern) => async () => {
          this._whitelistEditing = pattern;
          mount();
        };

        const handleConfirm = (item, pattern) => async () => {
          this._whitelistPatterns.delete(pattern);
          this._whitelistPatterns.add(editField.value);
          await saveToStorage('#input-blacklist-pattern', this._blacklistPatterns);
          this._whitelistEditing = null;
        };

        const handleMouseEnter = (item, pattern) => () => {
          if (this._whitelistEditing === pattern) {
            while (item.firstChild) {
              item.removeChild(item.firstChild);
            }
            item.textContent = '';

            editField.value = pattern;
            item.appendChild(editField);

            confirmEditButton.onclick = handleConfirm(item, pattern);
            item.appendChild(confirmEditButton);
          } else {
            editButton.onclick = handleEdit(item, pattern);
            item.appendChild(editButton);

            deleteButton.onclick = handleDelete(item, pattern);
            item.appendChild(deleteButton);
          }
        };

        const handleMouseLeave = (item, pattern) => () => {
          if (this._whitelistEditing !== pattern) {
            while (item.firstChild) {
              item.removeChild(item.firstChild);
            }
            item.textContent = pattern;
          }
        };

        this._blacklistPatterns = (loadedValue && loadedValue instanceof Set)
          ? loadedValue
          : new Set();

        [...this._blacklistPatterns].sort().forEach((pattern) => {
          const item = document.createElement('div');
          item.classList.add('list-group-item', 'list-group-item-action');
          item.textContent = pattern;

          item.onmouseenter = handleMouseEnter(item, pattern);
          item.onmouseleave = handleMouseLeave(item, pattern);

          blacklistContainer.appendChild(item);
        });
      };

      mount.bind(this)();
      return defaultValue;
    },
    preSave: (saveValue) => {
      this._blacklistPatterns.add(saveValue);
      return this._blacklistPatterns;
    },
  },
  {
    selector: '#input-suspend-threshold',
    ...numericTextInput,
  },
];

update(elements);
handleChanges(elements);
subscribeToUpdates(elements);
