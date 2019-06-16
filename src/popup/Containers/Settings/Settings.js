import TextInput from '../../Components/TextInput';
import Toggle from '../../Components/Toggle';
import { state, setState } from '../../../store';

const Settings = () => {
  const handleChanges = (selector, value) => {
    const oldState = state();
    const newState = { ...oldState, [selector]: value };
    setState(newState);
  };

  return {
    view: () => (
      <div>
        <Toggle
          title="Suspension"
          checked={state()['#input-disable-suspension']}
          onchange ={(e) => { handleChanges('#input-disable-suspension', e.target.checked); }}
          onText="Disabled"
          offText="Enabled"
          purpose="warning"
        />
        <TextInput
          prepend={(<span className="input-group-text">"Suspend after this many seconds"</span>)}
          value={state()['#input-delay-suspend']}
          onchange={(e) => { handleChanges('#input-delay-suspend', e.target.value); }}
        />
        <Toggle
          title="Ignore tabs producing sound"
          checked={state()['#input-ignore-audible']}
          onchange={(e) => { handleChanges('#input-ignore-audible', e.target.checked); }}
          purpose="secondary"
        />
        <Toggle
          title="Ignore pinned tabs"
          checked={state()['#input-ignore-pinned']}
          onchange={(e) => { handleChanges('#input-ignore-pinned', e.target.checked); }}
          purpose="secondary"
        />
        <TextInput
          prepend={(<span className="input-group-text">Suspend when the loaded tabs count reaches</span>)}
          value={state()['#input-suspend-threshold']}
          onchange={(e) => { handleChanges('#input-suspend-threshold', e.target.value); }}
        />
      </div>
    ),
  };
};

export default Settings;
