import Toggle from '../../Components/Toggle';
import TextInput from '../../Components/TextInput';
import { state, setState } from '../../../store';

const Blacklist = () => {
  const handleChanges = (selector, value) => {
    const oldState = state();
    const newState = { ...oldState, [selector]: value };
    setState(newState);
  };

  return {
    view: () => (
      <div>
        <Toggle
          title="Blacklist"
          checked={state()['#input-enable-blacklist']}
          onchange={(e) => { handleChanges('#input-enable-blacklist', e.target.checked); }}
          purpose="secondary"
        />
        <div class="mb-4">Only tabs with URL's matching patterns from this list will be suspended</div>
        <TextInput
          value={state()['#input-blacklist-pattern']}
          onchange={(e) => { handleChanges('#input-blacklist-pattern', e.target.value); }}
          title="URL"
        />
        <div id="list-blacklist-container" class="container whitelist_container list-group"></div>
      </div>
    ),
  };
};

export default Blacklist;
