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
          title={browser.i18n.getMessage('titleDisableSuspension')}
          checked={state()['#input-disable-suspension']}
          onchange ={(e) => { handleChanges('#input-disable-suspension', e.target.checked); }}
          onText={browser.i18n.getMessage('toggleDisableSuspensionOn')}
          offText={browser.i18n.getMessage('toggleDisableSuspensionOff')}
          purpose="warning"
        />
        <TextInput
          prepend={(<span className="input-group-text">{browser.i18n.getMessage('titleDelaySuspend')}</span>)}
          value={state()['#input-delay-suspend']}
          onchange={(e) => { handleChanges('#input-delay-suspend', e.target.value); }}
          pattern="[0-9]{1,4}"
        />
        <Toggle
          title={browser.i18n.getMessage('titleIgnoreAudible')}
          checked={state()['#input-ignore-audible']}
          onchange={(e) => { handleChanges('#input-ignore-audible', e.target.checked); }}
          purpose="secondary"
        />
        <Toggle
          title={browser.i18n.getMessage('titleIgnorePinned')}
          checked={state()['#input-ignore-pinned']}
          onchange={(e) => { handleChanges('#input-ignore-pinned', e.target.checked); }}
          purpose="secondary"
        />
        <TextInput
          prepend={(<span className="input-group-text">{browser.i18n.getMessage('titleSuspendThreshold')}</span>)}
          value={state()['#input-suspend-threshold']}
          onchange={(e) => { handleChanges('#input-suspend-threshold', e.target.value); }}
          pattern="[0-9]{1,4}"
        />
      </div>
    ),
  };
};

export default Settings;
