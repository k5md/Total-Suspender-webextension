import _ from 'lodash';
import Toggle from '../../Components/Toggle';
import TextInput from '../../Components/TextInput';
import { state, setState } from '../../../store';
import Button from '../../Components/Button';
import EditableList from '../EditableList';

const Whitelist = () => {
  const handleChanges = (selector, value) => {
    const oldState = state();
    const newState = { ...oldState, [selector]: value };
    setState(newState);
  };

  const localState = {
    addInputText: '',
  };

  const addHandler = () => {
    if (!localState.addInputText) {
      return;
    }
    const oldSet = state()['#input-whitelist-pattern'];
    const newSet = new Set(oldSet);
    newSet.add(localState.addInputText);

    handleChanges('#input-whitelist-pattern', newSet);
    localState.addInputText = '';
  };

  const replaceHandler = (oldValue, newValue) => {
    const oldSet = state()['#input-whitelist-pattern'];
    const newSet = new Set(oldSet);
    newSet.delete(oldValue);
    newSet.add(newValue);

    handleChanges('#input-whitelist-pattern', newSet);
  };

  const deleteHandler = (value) => {
    const oldSet = state()['#input-whitelist-pattern'];
    const newSet = new Set(oldSet);
    newSet.delete(value);

    handleChanges('#input-whitelist-pattern', newSet);
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
          prepend={(<span className="input-group-text">URL</span>)}
          append={(
            <Button
              title="Add"
              purpose="secondary"
              onclick={addHandler}
            />
          )}
          value={localState.addInputText}
          oninput={(e) => { localState.addInputText = e.target.value; }}
        />
        <EditableList
          onEdit={replaceHandler}
          onDelete={deleteHandler}
          entries={[...state()['#input-whitelist-pattern']]}
          styles={{ listContainer: 'container' }}
        />
      </div>
    ),
  };
};

export default Whitelist;
