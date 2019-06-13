
const TabsList = {
  view: ({
    attrs: {
      tabs,
    },
  }) => (
    <div>
      <ul className="nav nav-tabs nav-fill" role="tablist">
        {tabs.map(tab => (
          <li className="nav-item">
            <a className="nav-link active" href={`#${tab.id}`} role="tab" data-toggle="tab">{tab.id}</a>
          </li>
        ))}
      </ul>
      <div className="tab-content tabs mt-4">
        {tabs.map(tab => (
          <div role="tabpanel" className="tab-pane active" id={tab.id}>
            <div className="ml-4">
              {tab.element}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export default TabsList;
