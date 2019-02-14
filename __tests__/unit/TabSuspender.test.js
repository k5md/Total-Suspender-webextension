import TabSuspender from '../../src/background/TabSuspender';

/*describe('constructor', () => {

});

describe('handleAction', () => {

*/

describe('updateConfig', () => {
  it('initialize config with default values if no value is loaded from localStorage', async () => {
    const tabSuspender = new TabSuspender();

    const configBefore = [
      {
        id: 'default',
      },
      {
        id: 'foo',
        defaultValue: false,
      },
      {
        id: 'bar',
        defaultValue: 42,
      },
      {
        id: 'baz',
        defaultValue: null,
      },
    ];

    const configAfter = [
      {
        id: 'default',
        value: undefined,
      },
      {
        id: 'foo',
        defaultValue: false,
        value: false,
      },
      {
        id: 'bar',
        defaultValue: 42,
        value: 42,
      },
      {
        id: 'baz',
        defaultValue: null,
        value: null,
      },
    ];
    tabSuspender.config = configBefore;
    await tabSuspender.updateConfig();

    expect(tabSuspender.config).toEqual(configAfter);
  });
});

describe('generateAction', () => {
  it('set this.action as a merged action of those in config, which isEnabled evaluates to true', () => {
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

    expect(foo.mock.calls.length).toBe(1);
    expect(bar.mock.calls.length).toBe(0);
    expect(baz.mock.calls.length).toBe(1);
  });
});

/*describe('tabHandlers', () => {

});

describe('registerHandlers', () => {

});*/

/*describe('run', () => {

});*/
