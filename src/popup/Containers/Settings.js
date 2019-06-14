import TextInput from '../Components/TextInput';
import Toggle from '../Components/Toggle';
import store from '../../store';

const Settings = () => {
  return {
    view: () => (
      <div>
        <Toggle
          title="Suspension"
          checked={store['input-disable-suspension']}
          oninput={(e) => { store['input-disable-suspension'] = e.target.checked; }}
          onText="Disabled"
          offText="Enabled"
          purpose="warning"
        />
        <TextInput
          title="Suspend after this many seconds"
          value={store['input-delay-suspend']}
          oninput={(e) => { store['input-delay-suspend'] = e.target.value; }}
        />
        <Toggle
          title="Ignore tabs producing sound"
          checked={store['input-ignore-audible']}
          oninput={(e) => { store['input-ignore-audible'] = e.target.checked; }}
          purpose="secondary"
        />
        <Toggle
          title="Ignore pinned tabs"
          checked={store['input-ignore-pinned']}
          oninput={(e) => { store['input-ignore-pinned'] = e.target.checked; }}
          purpose="secondary"
        />
        <TextInput
          title="Suspend when the loaded tabs count reaches"
          value={store['input-suspend-threshold']}
          oninput={(e) => { store['input-suspend-threshold'] = e.target.value; }}
        />
      </div>
    ),
  };
};

export default Settings;
