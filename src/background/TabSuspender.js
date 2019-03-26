/* eslint no-underscore-dangle: 0 */

const saveToStorage = (key, value) => browser.storage.local.set({ [key]: value });

const loadFromStorage = (key = null) => browser.storage.local.get(key);

class TabSuspender {
  constructor() {
    this.action = null;
    this.console = console;
    this.discardEventEmitter = document;

    // NOTE: actions are applied sequentially,
    // modifiedTabs contain tabs changed in preceding actions, return them in actions!
    this.config = [
      {
        id: '#input-disable-suspension',
        action:
          () => () => () => ({}), // just return empty modified tabs to prevent any actions
        isEnabled: value => typeof value === 'boolean' && value,
        defaultValue: false,
      },
      {
        id: 'default',
        action: () => () => (rawTabs, modifiedTabs = rawTabs) => modifiedTabs
          .filter(tab => !tab.active && !tab.discarded && !tab.pinned),
        isEnabled: () => true,
      },
      {
        id: '#input-ignore-audible',
        action:
          () => () => (rawTabs, modifiedTabs = rawTabs) => modifiedTabs.filter(tab => !tab.audible),
        isEnabled: value => typeof value === 'boolean' && value,
        defaultValue: false,
      },
      {
        id: '#input-whitelist-pattern',
        action: value => () => (rawTabs, modifiedTabs = rawTabs) => {
          // check for those updating from previous versions
          // since trying to load value from storage by non-existing key returns empty object
          this._whitelistPatterns = (value && value instanceof Set) ? value : new Set();

          return modifiedTabs;
        },
        isEnabled: () => true,
      },
      {
        id: '#input-enable-whitelist',
        action: () => () => (rawTabs, modifiedTabs = rawTabs) => {
          if (!this._whitelistPatterns) {
            return modifiedTabs;
          }

          const whitelistPatterns = [...this._whitelistPatterns];

          return modifiedTabs.filter(
            tab => whitelistPatterns.findIndex(pattern => tab.url.includes(pattern)) === -1,
          );
        },
        isEnabled: value => typeof value === 'boolean' && value,
        defaultValue: true,
      },
      {
        id: '#input-suspend-planned',
        action: () => () => (rawTabs, modifiedTabs = rawTabs) => {
          this.console.log('suspending on planned', modifiedTabs);
          browser.tabs.discard(modifiedTabs.map(tab => tab.id));
          // better make action generator accept async functions since this
          // below can cause unexpected behaviour
          saveToStorage('#input-suspend-planned', false);
          return modifiedTabs;
        },
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

          return modifiedTabs;
        },
        isEnabled: value => !Number.isNaN(value) && value > 0,
        defaultValue: 60, // value provided in seconds
      },
    ];

    this.tabHandlers = {
      onCreated: (tab) => {
        const event = new CustomEvent('discard', { detail: { type: 'created', id: tab.id } });
        this.discardEventEmitter.dispatchEvent(event);
      },
      onActivated: ({ tabId }) => {
        const event = new CustomEvent('discard', { detail: { type: 'activated', id: tabId } });
        this.discardEventEmitter.dispatchEvent(event);
      },
      onUpdated: (tabId, change) => {
        // TODO: change, add args in addListener to listen to specific changes
        if (change.audible) {
          const event = new CustomEvent('discard', { detail: { type: 'updated', id: tabId } });
          this.discardEventEmitter.dispatchEvent(event);
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

    this.discardEventEmitter.addEventListener('discard', (e) => {
      this.console.log('event', e.detail.type, e.detail.id);
      this.handleAction({ type: e.detail.type, id: e.detail.id });
    }, false);

    // reload config after every change
    browser.storage.onChanged.addListener(async () => {
      await this.updateConfig();
      this.generateAction();
      const event = new CustomEvent('discard', { detail: { type: 'configChange' } });
      this.discardEventEmitter.dispatchEvent(event);
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
