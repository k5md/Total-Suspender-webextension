const tabSuspender = (tabId, windowId) => {
  browser.tabs.query({ windowId, active: false }).then((tabs) => {
    const tabIdsToDiscard = tabs.filter(tab => tab.id !== tabId).map(tab => tab.id);
    const tabsCount = tabIdsToDiscard.length;

    renderTabCount(tabsCount.toString(), windowId);
    browser.tabs.discard(tabIdsToDiscard);
  });   
};

const renderTabCount = (text, windowId) => {
  browser.browserAction.setBadgeText({ text, windowId });
  browser.browserAction.setBadgeBackgroundColor({'color': 'black'});
}

const handlers = {
    'onRemoved': (tabId, { windowId, isWindowClosing }) => {
      if (isWindowClosing) {
        return;
      }
      tabSuspender(tabId, windowId)
    },
    'onCreated': (tab) => tabSuspender(tab.id, tab.windowId),
    'onActivated': ({ tabId, windowId }) => tabSuspender(tabId, windowId),
    'onAttached': (tabId, { newWindowId }) => tabSuspender(tabId, newWindowId),
    'onDetached': (tabId, { oldWindowId }) => tabSuspender(tabId, oldWindowId),
};

Object.keys(handlers).map(event => browser.tabs[event].addListener(handlers[event]));
