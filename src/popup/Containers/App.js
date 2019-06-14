import Card from '../Components/Card';
import TabsList from '../Components/TabsList';
import Settings from './Settings';
import Actions from './Actions';
import Whitelist from './Whitelist';
import Blacklist from './Blacklist';

import '../index.scss';

const App = {
  view: () => (
    <Card title="Total Suspender">
      <TabsList
        tabs={[
          { id: 'Settings', render: () => <Settings /> },
          { id: 'Actions', render: () => <Actions /> },
          { id: 'Whitelist', render: () => <Whitelist /> },
          { id: 'Blacklist', render: () => <Blacklist /> },
        ]}
      />
    </Card>
  ),
};

export default App;
