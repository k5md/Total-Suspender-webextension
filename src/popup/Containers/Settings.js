import TextInput from '../Components/TextInput';
import Toggle from '../Components/Toggle';

const Settings = {
  view: () => (
    <div>
      <Toggle
        title="Suspension"
        id="input-disable-suspension"
        checked={true}
        onText="Disabled"
        offText="Enabled"
      />
      <TextInput
        title="Suspend after this many seconds"
        id="input-delay-suspend"
      />
      <Toggle
        title="Ignore tabs producing sound"
        id="input-ignore-audible"
        checked={true}
      />
      <Toggle
        title="Ignore pinned tabs"
        id="input-ignore-pinned"
        checked={true}
      />
      <TextInput
        title="Suspend when the loaded tabs count reaches"
        id="input-suspend-threshold"
      />
    </div>
  ),
};

export default Settings;
