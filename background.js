const createHandler = (initialValue = 0) => {
  let counter = initialValue;
  return () => {
    browser.tabs.query({currentWindow: true, active: false}).then((tabs) => {
      counter = (tabs.length === counter) ? tabs.length - 1 : tabs.length;

      browser.browserAction.setBadgeText({text: counter.toString()});
      browser.browserAction.setBadgeBackgroundColor({'color': 'black'});

      console.log(tabs);
      const tabsToDiscard = tabs.map(tab => tab.id);
      browser.tabs.discard(tabsToDiscard);
    });
  };
};

const changeHandler = createHandler();
changeHandler();
browser.tabs.onRemoved.addListener(changeHandler);
browser.tabs.onCreated.addListener(changeHandler);
