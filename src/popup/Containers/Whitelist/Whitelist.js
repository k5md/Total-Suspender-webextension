import Toggle from '../../Components/Toggle';
import TextInput from '../../Components/TextInput';
import { state, setState } from '../../../store';

const Whitelist = () => {
  const handleChanges = (selector, value) => {
    const oldState = state();
    const newState = { ...oldState, [selector]: value };
    setState(newState);
  };

  return {
    view: () => (
      <div>
        <Toggle
          title="Whitelist"
          checked={state()['#input-enable-whitelist']}
          onchange={(e) => { handleChanges('#input-enable-whitelist', e.target.checked); }}
          purpose="secondary"
        />
        <div class="mb-4">Tabs with URL's matching patterns from this list will never be suspended</div>
        <TextInput
          value={state()['#input-whitelist-pattern']}
          onchange={(e) => { handleChanges('#input-whitelist-pattern', e.target.value); }}
          title="URL"
        />
        <div id="list-whitelist-container" class="container whitelist_container list-group"></div>
      </div>
    ),
  };
};

export default Whitelist;
