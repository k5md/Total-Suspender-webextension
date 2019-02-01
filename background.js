const windowDispatcher = (tabEvent) => {

};


const tabCounter = (initialValue = 0) => {
  let counter = initialValue;
  return (isRemoved, isDetached) => {
    browser.tabs.query({}).then((tabs) => {
        if (!isRemoved) {
            counter = tabs.length - 1;
        } else {
            counter = tabs.length;
        }
      
      browser.browserAction.setBadgeText({text: counter.toString()});
      browser.browserAction.setBadgeBackgroundColor({'color': 'black'});

      const windowIds = new Set(tabs.map(tab => tab.windowId));
      const windows = [...windowIds].map(windowId => browser.windows.get(windowId));
      
      Promise.all(windows).then(data => console.log(tabs, data));
      const tabIdsToDiscard = tabs.map(tab => tab.id);
      browser.tabs.discard(tabIdsToDiscard);
    });
  };
};

const handlers = {
    'onRemoved': (tabId, { windowId, isWindowClosing }) => (),
    'onCreated': (tab) => (),
    'onActivated': ({ tabId, windowId }) => (),
    'onAttached': (tabId, { newWindowId, newPosition }) => (),
    'onDetached': (tabId, { oldWindowId, oldPosition }) => (),
};

Object.keys(handlers).map(event => browser.tabs[event].addListener(handlers[event]));