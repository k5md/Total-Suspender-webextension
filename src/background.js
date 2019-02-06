let removedId;

const tabSuspender = (tabId, windowId) => {
  browser.tabs.query({ windowId, active: false }).then((tabs) => {
    const tabIds = tabs.map(tab => tab.id);
    const tabIdsToDiscard = tabIds.filter(tabId => tabId !== removedId);
    const tabsCount = tabIdsToDiscard.length;

    browser.tabs.discard(tabIdsToDiscard);
    renderTabCount(tabsCount.toString(), windowId);
  });   
};

const renderTabCount = (text, windowId) => {
  browser.browserAction.setBadgeText({ text, windowId });
  browser.browserAction.setBadgeBackgroundColor({'color': 'black'});
}

const tabHandlers = {
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
};

Object.keys(tabHandlers).map(event => browser.tabs[event].addListener(tabHandlers[event]));


tabSuspender();
