import Toggle from '../../Components/Toggle';
import { state, setState } from '../../../store';

const Actions = () => {
  const handleChanges = (selector, value) => {
    const oldState = state();
    const newState = { ...oldState, [selector]: value };
    setState(newState);
  };

  return {
    view: () => (
      <div>
        <Toggle
          checked={state()['#input-suspend-planned']}
          onchange={(e) => { handleChanges('#input-suspend-planned', e.target.checked); }}
          offText="Suspend now if criteria match"
          onText="Suspending..."
        />
        <Toggle
          checked={state()['#input-suspend-all-planned']}
          onchange={(e) => { handleChanges('#input-suspend-all-planned', e.target.checked); }}
          offText="Suspend all tabs now"
          onText="Suspending..."
        />
      </div>
    ),
  };
};

export default Actions;
