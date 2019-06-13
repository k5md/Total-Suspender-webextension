import Toggle from '../Components/Toggle';
import TextInput from '../Components/TextInput';

const Whitelist = {
  view: () => (
    <div>
      <Toggle
        title="Whitelist"
        id="input-enable-whitelist"
      />
      <div class="mb-4">Tabs with URL's matching patterns from this list will never be suspended</div>
      <TextInput
        id="input-whitelist-pattern"
        title="URL"
      />
      <div id="list-whitelist-container" class="container whitelist_container list-group"></div>
    </div>
  ),
};

export default Whitelist;
