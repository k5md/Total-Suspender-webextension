import Card from '../Components/Card';
import TabsList from '../Components/TabsList';
import Settings from './Settings';
import Actions from './Actions';
import Whitelist from './Whitelist';
import Blacklist from './Blacklist';

const App = {
  view: () => (
    <Card title="Total Suspender">
      <TabsList
        tabs={[
          { id: 'Settings', element: <Settings /> },
          { id: 'Actions', element: <Actions /> },
          { id: 'Whitelist', element: <Whitelist /> },
          { id: 'Blacklist', element: <Blacklist /> },
        ]}
      />
    </Card>
  ),
};

export default App;
