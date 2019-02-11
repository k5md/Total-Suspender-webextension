/* global bconsole */

const loadFromStorage = (key = null) => browser.storage.local.get(key);


class TabSuspender {
  constructor() {
    this.filter = null;
    this.action = null;
    this.tabs = [];
  }

  // TODO: rework tabHandlers, removed, attach and detach, as well as diff windows NOT working
  get tabHandlers() {
    return {
      onRemoved: (tabId) => {
        bconsole.log(`tab ${tabId} removed`);
        this.tabs = this.tabs.filter(cur => cur.id !== tabId);
      },
      onCreated: (tab) => {
        bconsole.log(`tab ${tab.id} created`);
        this.tabs = [...this.tabs, tab];
        this.suspendTabs({ actionType: 'created', id: tab.id });
      },
      onActivated: ({ tabId }) => {
        bconsole.log(`tab ${tabId} activated`);
        const updatedTabs = this.tabs.map(tab => tab.id === tabId ? {...tab, active: true} : {...tab, active: false});
        this.tabs = updatedTabs;
        this.suspendTabs({ actionType: 'activated', id: tabId });
      },
      onAttached: (tabId) => {
        bconsole.log(`tab ${tabId} attached`);
      },
      onDetached: (tabId) => {
        bconsole.log(`tab ${tabId} detached`);
      },
    };
  }

  get config() {
    return [
      {
        id: '#input-delay-suspend',
        isEnabled: value => !Number.isNaN(parseInt(value, 10)) && parseInt(value, 10) >= 1,
        action: (fn, value) => (tabsToDiscard, action) => {
          const ms = parseInt(value, 10) * 1000;
          // sets timeout for tabsToDiscard if no timeout has been set,
          // removes the timeout if the tab has been activated
          // TODO: add check for removed?
          // TODO: somehow process loading tabs
          const tabIdx = this.tabs.findIndex(tab => tab.id === action.id);

          if (action.actionType === 'activated') {
            bconsole.log('clearing timeout for', action.id);
            clearTimeout(this.tabs[tabIdx].TabSuspenderTimeoutId);
            this.tabs[tabIdx].TabSuspenderTimeoutId = null;
          }

          this.tabs.filter(tab => tab.id !== action.id && !tab.active).forEach((tab, tabIndex) => {
            if (!tab.TabSuspenderTimeoutId) {
              bconsole.log('setting timeout for', tab.id, tab.TabSuspenderTimeoutId);
              const TabSuspenderTimeoutId = setTimeout(() => {
                bconsole.log('time is out for tab', tab.id);
                browser.tabs.discard(tab.id);
                this.tabs[tabIndex].TabSuspenderTimeoutId = null;
              }, ms);

              this.tabs[tabIndex].TabSuspenderTimeoutId = TabSuspenderTimeoutId;
            }
          });
          // NOTE: no fn call!
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
        id: 'default',
        action: fn => (tabsToDiscard, action) => {
          bconsole.log('default action');
          tabsToDiscard.map(tab => browser.tabs.discard(tab.id));
          fn(tabsToDiscard, action);
        },
        isEnabled: () => true,
      },
    ];
  }

  async updateConfig() {
    const loadedOptions = await Promise.all(this.config.map(async (option) => {
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

    // applies default, then filters from active options sequentially
    const mergedFilters = activeOptions.reduce((acc, cur) => tabs => (typeof cur.filterFn === 'function' ? cur.filterFn(acc(tabs)) : acc(tabs)), tabs => tabs);
    const mergedActions = activeOptions.reduceRight((acc, cur) => (typeof cur.action === 'function' ? cur.action(acc, cur.value) : acc), () => {});

    this.filter = mergedFilters;
    this.action = mergedActions;
  }

  suspendTabs(tabId) {
    browser.tabs.query({ active: false, discarded: false }).then((tabs) => {
      const tabsToDiscard = this.filter(tabs);
      this.action(tabsToDiscard, tabId);
    });
  }

  registerHandlers() {
    Object.keys(this.tabHandlers)
      .forEach(event => browser.tabs[event].addListener(this.tabHandlers[event]));

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
