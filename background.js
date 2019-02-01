const createHandler = (initialValue = 0) => {
  let counter = initialValue;
  return (isRemoved, isDetached) => {
    browser.tabs.query({currentWindow: true, active: false}).then((tabs) => {
        if (!isRemoved) {
            counter = tabs.length - 1;
        } else {
            counter = tabs.length;
        }
      
      browser.browserAction.setBadgeText({text: counter.toString()});
      browser.browserAction.setBadgeBackgroundColor({'color': 'black'});

      console.log(tabs);
      Promise.all(tabs.map(tab => browser.windows.get(tab.windowId))).then(data => console.log(data));
      const tabIdsToDiscard = tabs.map(tab => tab.id);
      browser.tabs.discard(tabIdsToDiscard);
    });
  };
};

const changeHandler = createHandler();
changeHandler();
browser.tabs.onRemoved.addListener(changeHandler.bind(null, true));
browser.tabs.onCreated.addListener(changeHandler);
browser.tabs.onActivated.addListener(changeHandler);
browser.tabs.onAttached.addListener(changeHandler);
browser.tabs.onDetached.addListener(changeHandler);