import TabSuspender from '../../src/background/TabSuspender';

describe('updateConfig', () => {
  const configBefore = [
    { id: 'default' },
    { id: 'foo', defaultValue: false },
    { id: 'bar', defaultValue: 42 },
    { id: 'baz', defaultValue: null },
  ];
  it('initializes config with default values if no value is loaded from localStorage', async () => {
    const tabSuspender = new TabSuspender();
    const configAfter = [
      { id: 'default', value: undefined },
      { id: 'foo', defaultValue: false, value: false },
      { id: 'bar', defaultValue: 42, value: 42 },
      { id: 'baz', defaultValue: null, value: null },
    ];
    tabSuspender.config = configBefore;
    await tabSuspender.updateConfig();

    expect(tabSuspender.config).toEqual(configAfter);
  });

  it('initializes config with values loaded from localStorage', async () => {
    const tabSuspender = new TabSuspender();
    const configAfter = [
      { id: 'default', value: 42 },
      { id: 'foo', defaultValue: false, value: 21 },
      { id: 'bar', defaultValue: 42, value: 11 },
      { id: 'baz', defaultValue: null, value: null },
    ];

    const storageBefore = {
      default: 42,
      foo: 21,
      bar: 11,
    };

    tabSuspender.config = configBefore;

    const storage = browser.storage.local;
    await storage.clear();
    await storage.set(storageBefore);

    await tabSuspender.updateConfig();

    expect(tabSuspender.config).toEqual(configAfter);
  });
});

describe('generateAction', () => {
  it('sets this.action as a merged action of those in config, which isEnabled evaluates to true', () => {
    const foo = jest.fn(() => () => (raw, modified = raw) => modified.filter(item => item > 0));
    const bar = jest.fn(value => () => (raw, modified = raw) => modified.map(() => value));
    const baz = jest.fn(value => () => (raw, modified = raw) => modified.map(item => item + value));

    const expectedRaw = [-2, 1, 'str', -10, 41, 23, 0];
    const expectedModified = [2, 42, 24];

    const config = [
      {
        action: foo,
        isEnabled: () => true,
      },
      {
        action: bar,
        isEnabled: () => false,
        value: 42,
      },
      {
        action: baz,
        isEnabled: () => true,
        value: 1,
      },
      {
        action: () => () => (raw, modified = raw) => {
          expect(raw).toEqual(expectedRaw);
          expect(modified).toEqual(expectedModified);
        },
        isEnabled: () => true,
      },
    ];

    const tabSuspender = new TabSuspender();
    tabSuspender.config = config;
    tabSuspender.generateAction();
    tabSuspender.action()(expectedRaw);

    expect(foo).toHaveBeenCalledTimes(1);
    expect(bar).not.toBeCalled();
    expect(baz).toHaveBeenCalledTimes(1);
  });
});
