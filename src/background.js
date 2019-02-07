let removedId;

const loadFromStorage = (key = null) => browser.storage.local.get(key);

const tabSuspender = (
  tabId,
  windowId,
  filterFn,
  action = tabsToDiscard => browser.tabs.discard(tabsToDiscard.map(tab => tab.id)),
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

const tabHandlers = () => ({
  'onRemoved': (tabId, { windowId, isWindowClosing }) => {
    if (!isWindowClosing) tabSuspender(tabId, windowId);
    // have to keep track of the removed id, if onActivated gets fired next immediately, 
    // removed id will be in tabs list
    removedId = tabId; 
  },
  'onCreated': (tab) => tabSuspender(tab.id, tab.windowId),
  'onActivated': ({ tabId, windowId }) => tabSuspender(tabId, windowId),
  'onAttached': (tabId, { newWindowId }) => tabSuspender(tabId, newWindowId),
  'onDetached': (tabId, { oldWindowId }) => tabSuspender(tabId, oldWindowId),
});

// filterFn returns list of tabs that will be discarded,
// action wraps other actions, but the chain always ends with tabs.discard
// options will be chained
// TODO: remove duplication, get rid of strings
const options = [
  {
    id: '#input-max-active-tabs',
    isEnabled: value => !isNaN(parseInt(value)) && parseInt(value) >= 1,
    action: () => {},
    defaultValue: '1',
  },
  {
    id: '#input-delay-suspend',
    isEnabled: value => !isNaN(parseInt(value)) && parseInt(value) >= 1,
    action: fn => () => setTimeout(fn), // when chaining, add checks that tabsToDiscard still exist
    defaultValue: '60',
  },
  {
    id: '#input-suspend-audible',
    isEnabled: value => typeof value === 'boolean' && value,
    filterFn: tabs => tabs.filter(tab => !tab.audible),
    defaultValue: false,
  },
];

const defaultFilter = tabs => tabs.filter(tab => tab.id !== removedId);

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
  const mergedFilters = loadedOptions.reduce((acc, cur) => {
    return (tabs) =>  typeof cur.filterFn === 'function' ? cur.filterFn(acc(tabs)) : acc(tabs);
  }, defaultFilter);

  console.log(activeOptions);
  //TODO: mergedActions reducer, watch changes in config
  //Object.keys(tabHandlers).map(event => browser.tabs[event].addListener(tabHandlers[event]));
  //tabSuspender();
};

initialize(options); // see constants