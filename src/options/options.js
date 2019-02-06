const allowOnlyNumbers = str => str.replace(/[^0-9]/g, '');

const saveToStorage = (key, value) => browser.storage.local.set({ [key]: value });

const loadFromStorage = (key = null) => browser.storage.local.get(key);

const initialize = (elements) => {
  const nodes = Promise.all(elements.map(async ({ id, valueProperty, typeCheck, defaultValue }) => {
    const node = document.querySelector(id);
    const loadedValue = (await loadFromStorage(id))[id]; // storage.<type>.get returns object
    node[valueProperty] = typeCheck(loadedValue) ? loadedValue : defaultValue;
    return node;
  }));
  return nodes;
}

const handleChanges = (elements) => {
  const nodes = elements.map(({ id, valueProperty, formatter }) => {
    const node = document.querySelector(id);
    node.addEventListener('input', async () => {
      node[valueProperty] = formatter(node[valueProperty]);
      const saving = await saveToStorage(id, node[valueProperty]);
    });
    return node;
  });
  return nodes;
}

const elements = [
  { 
    id: '#input-suspend',
    valueProperty: 'checked',
    typeCheck: v => typeof v === 'boolean',
    defaultValue: false,
    formatter: v => v,
  },
  {
    id: '#input-max-active-tabs',
    valueProperty: 'value',
    typeCheck: v => typeof v === 'string',
    defaultValue: '0',
    formatter: allowOnlyNumbers,
  },
];

initialize(elements);
handleChanges(elements);
