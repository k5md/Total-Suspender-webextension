import Toggle from '../../Components/Toggle';
import TextInput from '../../Components/TextInput';
import store from '../../../store';

const Blacklist = () => {
  return {
    view: () => (
      <div>
        <Toggle
          title="Blacklist"
          checked={store['input-enable-blacklist']}
          oninput={(e) => { store['input-enable-blacklist'] = e.target.checked; }}
          purpose="secondary"
        />
        <div class="mb-4">Only tabs with URL's matching patterns from this list will be suspended</div>
        <TextInput
          value={store['input-blacklist-pattern']}
          oninput={(e) => { store['input-blacklist-pattern'] = e.target.value; }}
          title="URL"
        />
        <div id="list-blacklist-container" class="container whitelist_container list-group"></div>
      </div>
    ),
  };
};

export default Blacklist;
