const loadFromStorage = (key = null) => browser.storage.local.get(key);

class TabSuspender {
  constructor() {
    this.action = null;
    this.console = console;

    // NOTE: actions are applied sequentially,
    // modifiedTabs contain tabs changed in preceding actions, return them in actions!
    this.config = [
      {
        id: 'default',
        action: () => () => (raw, modified = raw) => modified
          .filter(tab => !tab.active && !tab.discarded),
        isEnabled: () => true,
      },
      {
        id: '#input-ignore-audible',
        action: () => () => (raw, modified = raw) => modified.filter(tab => !tab.audible),
        isEnabled: value => typeof value === 'boolean' && value,
        defaultValue: false,
      },
      {
        id: '#input-delay-suspend',
        action: value => () => (rawTabs, modifiedTabs = rawTabs) => {
          const ms = value * 1000;

          if (!this.delaySuspendTimeoutIds) {
            this.delaySuspendTimeoutIds = [];
          }

          // remove the timeout if the tab is not present in filter results
          const rest = rawTabs
            .filter(rawTab => modifiedTabs.findIndex(modTab => modTab.id === rawTab.id) === -1);

          rest.forEach((tab) => {
            if (!this.delaySuspendTimeoutIds[tab.id]) {
              return;
            }
            clearTimeout(this.delaySuspendTimeoutIds[tab.id]);
            this.delaySuspendTimeoutIds[tab.id] = null;
          });

          // TODO: add check for removed?
          // TODO: somehow process loading tabs
          modifiedTabs.forEach((tab) => {
            if (this.delaySuspendTimeoutIds[tab.id]) {
              return;
            }
            this.console.log('setting timeout for', tab.id);
            const delaySuspendTimeoutId = setTimeout(() => {
              this.console.log('time is out for tab', tab.id);
              browser.tabs.discard(tab.id);
              this.delaySuspendTimeoutIds[tab.id] = null;
            }, ms);

            this.delaySuspendTimeoutIds[tab.id] = delaySuspendTimeoutId;
          });
        },
        isEnabled: value => !Number.isNaN(value) && value > 0,
        defaultValue: 60, // value provided in seconds
      },
    ];

    this.tabHandlers = {
      onCreated: (tab) => {
        this.console.log(`tab ${tab.id} created`);
        this.handleAction({ type: 'created', id: tab.id });
      },
      onActivated: ({ tabId }) => {
        this.console.log(`tab ${tabId} activated`);
        this.handleAction({ type: 'activated', id: tabId });
      },
      onUpdated: (tabId, change) => {
        // TODO: change, add args in addListener to listen to specific changes
        if (change.audible) {
          this.console.log(`tab ${tabId} updated`, change);
          this.handleAction({ type: 'updated', id: tabId });
        }
      },
    };
  }

  handleAction(actionInfo) {
    browser.tabs.query({}).then((tabs) => {
      this.action(actionInfo)(tabs);
    });
  }

  async updateConfig() {
    const loadedOptions = await Promise.all(this.config.map(async (option) => {
      const { id, defaultValue } = option;
      const value = (await loadFromStorage(id))[id] || defaultValue;
      return { ...option, value };
    }));

    this.config = loadedOptions;
    this.console.log('config changed', this.config);
  }

  generateAction() {
    const activeOptions = this.config.filter(option => option.isEnabled(option.value));

    this.console.log('active options', activeOptions, this.config);
    const mergedActions = activeOptions.reduceRight(
      (acc, cur) => actionInfo => (rawTabs, modTabs) => {
        const newModTabs = cur.action(cur.value)(actionInfo)(rawTabs, modTabs);
        return acc(actionInfo)(rawTabs, newModTabs);
      },
      () => rawTabs => rawTabs,
    );

    this.action = mergedActions;
  }

  registerHandlers() {
    // handle tab actions
    Object.keys(this.tabHandlers)
      .forEach(event => browser.tabs[event].addListener(this.tabHandlers[event]));

    // reload config after every change
    browser.storage.onChanged.addListener(async () => {
      await this.updateConfig();
      this.generateAction();
    });
  }

  async run() {
    this.updateConfig = this.updateConfig.bind(this);
    await this.updateConfig();
    this.generateAction();
    this.registerHandlers();
  }
}

export default TabSuspender;
