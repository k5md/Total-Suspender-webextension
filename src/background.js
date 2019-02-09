let removedId;

const loadFromStorage = (key = null) => browser.storage.local.get(key);

const renderTabCount = (text, windowId) => {
  browser.browserAction.setBadgeText({ text, windowId });
  browser.browserAction.setBadgeBackgroundColor({ color: 'black' });
};

const tabSuspender = (tabId, windowId, filterFn, action) => {
  browser.tabs.query({ windowId, active: false }).then((tabs) => {
    const tabsToDiscard = filterFn(tabs);
    const tabsCount = tabsToDiscard.length;

    action(tabsToDiscard);
    renderTabCount(tabsCount.toString(), windowId);
  });
};

const tabHandlers = (filterFn, action) => ({
  onRemoved: (tabId, { windowId, isWindowClosing }) => {
    if (!isWindowClosing) tabSuspender(tabId, windowId, filterFn, action);
    // have to keep track of the removed id, if onActivated gets fired next immediately,
    // removed id will be in tabs list
    removedId = tabId;
  },
  onCreated: tab => tabSuspender(tab.id, tab.windowId, filterFn, action),
  onActivated: ({ tabId, windowId }) => tabSuspender(tabId, windowId, filterFn, action),
  onAttached: (tabId, { newWindowId }) => tabSuspender(tabId, newWindowId, filterFn, action),
  onDetached: (tabId, { oldWindowId }) => tabSuspender(tabId, oldWindowId, filterFn, action),
});

// filterFn returns list of tabs that will be discarded,
// action wraps other actions, but the chain always ends with tabs.discard
// options will be chained
// TODO: remove duplication, get rid of strings
const acceptedOptions = [
  {
    id: 'end',
    action: fn => (tabsToDiscard) => {
      console.log(tabsToDiscard, 'last option');
      fn(tabsToDiscard);
    },
    isEnabled: () => true,
  },
  {
    id: '#input-max-active-tabs',
    isEnabled: value => !Number.isNaN(parseInt(value, 10)) && parseInt(value, 10) >= 1,
    action: (fn, value) => {
      const counter = parseInt(value, 10);
      return tabsToDiscard => fn([...tabsToDiscard].sort().reverse().slice(counter));
    },
    defaultValue: '1',
  },
  {
    id: '#input-delay-suspend',
    isEnabled: value => !Number.isNaN(parseInt(value, 10)) && parseInt(value, 10) >= 1,
    action: (fn, value) => (tabsToDiscard) => {
      // TODO: add checks that tabsToDiscard still exist
      const ms = parseInt(value, 10) * 1000;
      setTimeout(() => fn(tabsToDiscard), ms);
    },
    defaultValue: '60', // value provided in seconds
  },
  {
    id: '#input-ignore-audible',
    isEnabled: value => typeof value === 'boolean' && value,
    filterFn: tabs => tabs.filter(tab => !tab.audible),
    defaultValue: false,
  },
  {
    id: 'begin',
    action: fn => (tabsToDiscard) => {
      console.log(tabsToDiscard, 'first option');
      fn(tabsToDiscard);
    },
    isEnabled: () => true,
  },
];

const prepareOptions = (options) => {
  const activeOptions = options.filter(option => option.isEnabled(option.value));

  const defaultFilter = tabs => tabs.filter(tab => tab.id !== removedId);
  const defaultAction = tabsToDiscard => browser.tabs.discard(tabsToDiscard.map(tab => tab.id));

  // applies default, then filters from active options sequentially
  const mergedFilters = activeOptions.reduce((acc, cur) => tabs => (typeof cur.filterFn === 'function' ? cur.filterFn(acc(tabs)) : acc(tabs)), defaultFilter);
  const mergedActions = activeOptions.reduce((acc, cur) => (typeof cur.action === 'function' ? cur.action(acc, cur.value) : acc), defaultAction);
  return [mergedFilters, mergedActions];
};

const run = (options) => {
  const [mergedFilters, mergedActions] = prepareOptions(options);
  const tabHandlersToApply = tabHandlers(mergedFilters, mergedActions);

  // register eventHandlers parametrized with options
  Object.keys(tabHandlersToApply).forEach((event) => {
    browser.tabs[event].addListener(tabHandlersToApply[event]);
  });

  // initial run after eventListeners attached
  tabSuspender(null, null, mergedFilters, mergedActions);

  // watch for changes in config
  // NOTE: avoid using this in a loop without removing previously attached onChanged listener
  const handleConfigChanges = (changes, scope) => {
    if (scope !== 'local') {
      return;
    }

    // remove old event listeners
    Object.keys(tabHandlersToApply).forEach((event) => {
      browser.tabs[event].removeListener(tabHandlersToApply[event]);
    });

    // reattach event listeners with new args from config
    // basically, this means another call to run function
    const delta = Object.entries(changes)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value.newValue }), {});

    const updatedOptions = options
      .reduce((acc, option) => [...acc, { ...option, value: delta[option.id] }], []);

    // TODO: refactor code to remove this ugly hack
    browser.storage.onChanged.removeListener(handleConfigChanges);
    run(updatedOptions);
  };

  browser.storage.onChanged.addListener(handleConfigChanges);
};

const initialize = async (options) => {
  const loadedOptions = await Promise.all(options.map(async (option) => {
    const {
      id,
      action,
      filterFn,
      isEnabled,
      defaultValue,
    } = option;

    const loadedValue = (await loadFromStorage(id))[id];
    const value = loadedValue || defaultValue;

    return {
      id,
      action,
      filterFn,
      isEnabled,
      value,
    };
  }));

  return loadedOptions;
};

initialize(acceptedOptions).then(loadedOptions => run(loadedOptions));
// TODO: consider rewriting using classes or native messaging to handle config change
