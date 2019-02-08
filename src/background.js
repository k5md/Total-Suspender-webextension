let removedId;

const loadFromStorage = (key = null) => browser.storage.local.get(key);

const tabSuspender = (
  tabId,
  windowId,
  filterFn,
  action,
) => {
  browser.tabs.query({ windowId, active: false }).then((tabs) => {
    const tabsToDiscard = filterFn(tabs);
    const tabsCount = tabsToDiscard.length;

    action(tabsToDiscard);
    renderTabCount(tabsCount.toString(), windowId);
  });   
};

const renderTabCount = (text, windowId) => {
  browser.browserAction.setBadgeText({ text, windowId });
  browser.browserAction.setBadgeBackgroundColor({'color': 'black'});
}

const tabHandlers = (filterFn, action) => ({
  'onRemoved': (tabId, { windowId, isWindowClosing }) => {
    if (!isWindowClosing) tabSuspender(tabId, windowId, filterFn, action);
    // have to keep track of the removed id, if onActivated gets fired next immediately, 
    // removed id will be in tabs list
    removedId = tabId; 
  },
  'onCreated': (tab) => tabSuspender(tab.id, tab.windowId, filterFn, action),
  'onActivated': ({ tabId, windowId }) => tabSuspender(tabId, windowId, filterFn, action),
  'onAttached': (tabId, { newWindowId }) => tabSuspender(tabId, newWindowId, filterFn, action),
  'onDetached': (tabId, { oldWindowId }) => tabSuspender(tabId, oldWindowId, filterFn, action),
});

// filterFn returns list of tabs that will be discarded,
// action wraps other actions, but the chain always ends with tabs.discard
// options will be chained
// TODO: remove duplication, get rid of strings
const options = [
  {
    action: fn => tabsToDiscard => {
      console.log(tabsToDiscard, 'first option');
      fn(tabsToDiscard)
    },
    isEnabled: () => true
  },
  {
    id: '#input-max-active-tabs',
    isEnabled: value => !isNaN(parseInt(value)) && parseInt(value) >= 1,
    action: (fn, value) => {
      const counter = parseInt(value, 10);
      return tabsToDiscard => fn([...tabsToDiscard].sort().reverse().slice(counter));
    },
    defaultValue: '1',
  },
  {
    id: '#input-delay-suspend',
    isEnabled: value => !isNaN(parseInt(value)) && parseInt(value) >= 1,
    action: (fn, value) => tabsToDiscard => {
      // TODO: add checks that tabsToDiscard still exist
      const ms = parseInt(value) * 1000; // value provided in seconds
      setTimeout(() => fn(tabsToDiscard), ms)
    },
    defaultValue: '1',
  },
  {
    id: '#input-suspend-audible',
    isEnabled: value => typeof value === 'boolean' && value,
    filterFn: tabs => tabs.filter(tab => !tab.audible),
    defaultValue: false,
  },
];

const initialize = async (options) => {
  const loadedOptions = await Promise.all(options.map(async option => {
    const loadedValue = (await loadFromStorage(option.id))[option.id];
    const value = loadedValue || option.defaultValue;
    const isEnabled = option.isEnabled(value);

    return { 
      action: option.action, 
      filterFn: option.filterFn,
      value,
      isEnabled
    };
  }));

  const activeOptions = loadedOptions.filter(option => option.isEnabled);
  const defaultFilter = tabs => tabs.filter(tab => tab.id !== removedId);
  const defaultAction = tabsToDiscard => console.log('default action') || browser.tabs.discard(tabsToDiscard.map(tab => tab.id));

  //applies default, then filters from active options sequentially
  const mergedFilters = activeOptions.reduce((acc, cur) => {
    return (tabs) =>  typeof cur.filterFn === 'function' ? cur.filterFn(acc(tabs)) : acc(tabs);
  }, defaultFilter);

  const mergedActions = activeOptions.reduce((acc, cur) => {
    return typeof cur.action === 'function' ? cur.action(acc, cur.value) : acc;
  }, defaultAction);

  // TODO: watch changes in config
  const tabHandlersToApply = tabHandlers(mergedFilters, mergedActions);

  Object.keys(tabHandlersToApply).map(event => browser.tabs[event].addListener(tabHandlersToApply[event]));
  tabSuspender(null, null, mergedFilters, mergedActions);
};

initialize(options); // see constants
