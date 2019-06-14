import Toggle from '../Components/Toggle';
import store from '../../store';

const Actions = () => {
  return {
    view: () => (
      <div>
        <Toggle
          checked={store['input-suspend-planned']}
          oninput={(e) => { store['input-suspend-planned'] = e.target.checked; }}
          offText="Suspend now if criteria match"
          onText="Suspending..."
        />
        <Toggle
          checked={store['input-suspend-all-planned']}
          oninput={(e) => { store['input-suspend-all-planned'] = e.target.checked; }}
          offText="Suspend all tabs now"
          onText="Suspending..."
        />
      </div>
    ),
  };
};

export default Actions;
