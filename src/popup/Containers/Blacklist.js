import Toggle from '../Components/Toggle';
import TextInput from '../Components/TextInput';

const Blacklist = {
  view: () => (
    <div>
      <Toggle
        title="Whitelist"
        id="input-enable-blacklist"
      />
      <div class="mb-4">Only tabs with URL's matching patterns from this list will be suspended</div>
      <TextInput
        id="input-blacklist-pattern"
        title="URL"
      />
      <div id="list-blacklist-container" class="container whitelist_container list-group"></div>
    </div>
  ),
};

export default Blacklist;
