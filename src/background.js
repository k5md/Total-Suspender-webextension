const loadFromStorage = (key = null) => browser.storage.local.get(key);

class TabSuspender {
  constructor() {
    this.filter = null;
    this.action = null;
    this.tabs = [];
  }

  static get config() {
    return [
      {
        id: 'end',
        action: fn => (tabsToDiscard) => {
          console.log(tabsToDiscard, 'last option');
          fn(tabsToDiscard);
        },
        isEnabled: () => true,
      },
      /*{
        id: '#input-max-active-tabs',
        isEnabled: value => !Number.isNaN(parseInt(value, 10)) && parseInt(value, 10) >= 1,
        action: (fn, value) => {
          const counter = parseInt(value, 10);
          return tabsToDiscard => fn([...tabsToDiscard].sort().reverse().slice(counter));
        },
        defaultValue: '1',
      },*/
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
  }

  async updateConfig() {
    const loadedOptions = await Promise.all(TabSuspender.config.map(async (option) => {
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

    const activeOptions = loadedOptions.filter(option => option.isEnabled(option.value));

    const defaultFilter = tabs => tabs;
    const defaultAction = tabsToDiscard => browser.tabs.discard(tabsToDiscard.map(tab => tab.id));

    // applies default, then filters from active options sequentially
    const mergedFilters = activeOptions.reduce((acc, cur) => tabs => (typeof cur.filterFn === 'function' ? cur.filterFn(acc(tabs)) : acc(tabs)), defaultFilter);
    const mergedActions = activeOptions.reduce((acc, cur) => (typeof cur.action === 'function' ? cur.action(acc, cur.value) : acc), defaultAction);

    this.filter = mergedFilters;
    this.action = mergedActions;
  }

  suspendTabs() {
    browser.tabs.query({ active: false, discarded: false }).then((tabs) => {
      const tabsToDiscard = this.filter(tabs);
      console.log(this.tabs, tabs, tabsToDiscard);
      this.action(tabsToDiscard);
    });
  }

  registerHandlers() {
    // TODO: rework tabHandlers, removed, attach and detach, as well as diff windows NOT working
    const tabHandlers = {
      onRemoved: (tabId, { windowId, isWindowClosing }) => {
        this.tabs = this.tabs.filter(cur => cur !== tabId);
        this.suspendTabs();
      },
      onCreated: (tab) => {
        this.tabs = [...this.tabs, tab.id];
        this.suspendTabs();
      },
      onActivated: ({ tabId, windowId }) => {
        this.tabs = this.tabs.filter(cur => cur !== tabId);
        this.suspendTabs();
      },
      onAttached: (tabId, { newWindowId }) => {
        this.suspendTabs();
      },
      onDetached: (tabId, { oldWindowId }) => {
        this.suspendTabs();
      },
    };

    // register eventHandlers parametrized with options
    Object.keys(tabHandlers).forEach(event => browser.tabs[event].addListener(tabHandlers[event]));

    // reload config after every change
    browser.storage.onChanged.addListener(this.updateConfig);
  }

  async run() {
    this.updateConfig = this.updateConfig.bind(this);
    this.registerHandlers = this.registerHandlers.bind(this);
    this.suspendTabs = this.suspendTabs.bind(this);
    await this.updateConfig();
    this.registerHandlers();
    const tabs = await browser.tabs.query({});
    this.tabs = tabs;
  }
}

const tabSuspender = new TabSuspender();
tabSuspender.run();
