import Toggle from '../Components/Toggle';

const Actions = {
  view: () => (
    <div>
      <Toggle
        id="input-suspend-planned"
        data-off-text="Suspend now if criteria match"
        data-on-text="Suspending..."
      />
      <Toggle
        id="input-suspend-all-planned"
        data-off-text="Suspend all tabs now"
        data-on-text="Suspending..."
      />
    </div>
  ),
};

export default Actions;
