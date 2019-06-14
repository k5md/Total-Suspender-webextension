import Toggle from '../../Components/Toggle';
import TextInput from '../../Components/TextInput';
import store from '../../../store';

const Whitelist = () => {
  return {
    view: () => (
      <div>
        <Toggle
          title="Whitelist"
          checked={store['input-enable-whitelist']}
          oninput={(e) => { store['input-enable-whitelist'] = e.target.checked; }}
          purpose="secondary"
        />
        <div class="mb-4">Tabs with URL's matching patterns from this list will never be suspended</div>
        <TextInput
          value={store['input-whitelist-pattern']}
          oninput={(e) => { store['input-whitelist-pattern'] = e.target.value; }}
          title="URL"
        />
        <div id="list-whitelist-container" class="container whitelist_container list-group"></div>
      </div>
    ),
  };
};

export default Whitelist;
