/* global bconsole */

const loadFromStorage = (key = null) => browser.storage.local.get(key);

class TabSuspender {
  constructor() {
    this.action = null;
  }

  handleAction(actionInfo) {
    browser.tabs.query({}).then((tabs) => {
      this.action(tabs, actionInfo);
    });
  }

  get config() {
    // NOTE: actions are applied sequentially,
    // modifiedTabs contain tabs changed in preceding actions, return them in actions!
    return [
      {
        id: 'active',
        action: () => (rawTabs, modifiedTabs = rawTabs, actionInfo) => {
          console.log(rawTabs, modifiedTabs, actionInfo);
          return modifiedTabs.filter(tab => !tab.active)
        },
        isEnabled: () => true,
      },
      {
        id: '#input-ignore-audible',
        action: () => (rawTabs, modifiedTabs = rawTabs) => modifiedTabs.filter(tab => !tab.audible),
        isEnabled: value => typeof value === 'boolean' && value,
        defaultValue: false,
      },
      {
        id: '#input-delay-suspend',
        action: value => (rawTabs, modifiedTabs = rawTabs) => {
          bconsole.log('in delay', rawTabs, modifiedTabs);
          const ms = parseInt(value, 10) * 1000;

          const rest = rawTabs.filter(
            thisTab => modifiedTabs.findIndex(tabToDiscard => tabToDiscard.id === thisTab.id) === -1,
          );

          // remove the timeout if the tab is not present in filter results
          rest.forEach((tab) => {
            bconsole.log('clearing timeout for', tab.id);
            clearTimeout(this.delaySuspendTimeoutIds);
            this.delaySuspendTimeoutIds[tab.id] = null;
          });

          filtered.forEach((tab) => {
          // TODO: add check for removed?
          // TODO: somehow process loading tabs
            if (!this.delaySuspendTimeoutIds[tab.id]) {
              bconsole.log('setting timeout for', tab.id);
              const delaySuspendTimeoutId = setTimeout(() => {
                bconsole.log('time is out for tab', tab.id);
                browser.tabs.discard(tab.id);
                this.delaySuspendTimeoutIds[tab.id] = null;
              }, ms);

              this.delaySuspendTimeoutIds[tab.id] = delaySuspendTimeoutId;
            }
          });
        },
        isEnabled: value => !Number.isNaN(parseInt(value, 10)) && parseInt(value, 10) >= 1,
        defaultValue: '60', // value provided in seconds
      },
    ];
  }

  async updateConfig() {
    const loadedOptions = await Promise.all(this.config.map(async (option) => {
      const { id, defaultValue } = option;
      const value = (await loadFromStorage(id))[id] || defaultValue;
      return { ...option, value };
    }));

    const activeOptions = loadedOptions.filter(option => option.isEnabled(option.value));

    const mergedActions = activeOptions.reduceRight(
      (acc, cur) => (rawTabs, modTabs) => acc(rawTabs, cur.action(cur.value)(rawTabs, modTabs)),
      (rawTabs, modTabs) => rawTabs,
    );

    this.action = mergedActions;
  }

  get tabHandlers() {
    return {
      onCreated: (tab) => {
        bconsole.log(`tab ${tab.id} created`);
        this.handleAction({ type: 'created', id: tab.id });
      },
      onActivated: ({ tabId }) => {
        bconsole.log(`tab ${tabId} activated`);
        this.handleAction({ type: 'activated', id: tabId });
      },
      onUpdated: (tabId) => {
        bconsole.log(`tab ${tabId} updated`);
        this.handleAction({ type: 'updated', id: tabId });
      },
      onRemoved: (tabId) => {
        bconsole.log(`tab ${tabId} removed`);
      },
      onAttached: (tabId) => {
        bconsole.log(`tab ${tabId} attached`);
      },
      onDetached: (tabId) => {
        bconsole.log(`tab ${tabId} detached`);
      },
    };
  }

  registerHandlers() {
    // handle tab actions
    Object.keys(this.tabHandlers)
      .forEach(event => browser.tabs[event].addListener(this.tabHandlers[event]));

    // reload config after every change
    browser.storage.onChanged.addListener(this.updateConfig);
  }

  async run() {
    this.updateConfig = this.updateConfig.bind(this);
    this.registerHandlers = this.registerHandlers.bind(this);
    this.handleAction = this.handleAction.bind(this);
    await this.updateConfig();
    this.registerHandlers();
  }
}

const tabSuspender = new TabSuspender();
tabSuspender.run();
