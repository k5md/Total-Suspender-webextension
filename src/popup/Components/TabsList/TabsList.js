
const TabsList = {
  view: ({
    attrs: {
      tabs,
    },
  }) => (
    <div>
      <ul className="nav nav-tabs nav-fill" role="tablist">
        {tabs.map((tab, tabIndex) => (
          <li className="nav-item">
            <a className={`nav-link ${!tabIndex && 'active'}`} href={`#${tab.id}`} role="tab" data-toggle="tab">{tab.title}</a>
          </li>
        ))}
      </ul>
      <div className="tab-content tabs mt-4">
        {tabs.map((tab, tabIndex) => (
          <div role="tabpanel" className={`tab-pane ${!tabIndex && 'active'}`} id={tab.id}>
            <div className="ml-4">
              {tab.render()}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export default TabsList;
