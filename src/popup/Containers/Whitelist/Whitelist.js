import _ from 'lodash';
import Toggle from '../../Components/Toggle';
import TextInput from '../../Components/TextInput';
import { state, setState } from '../../../store';
import Button from '../../Components/Button';
import EditableList from '../EditableList';
import './index.scss';

const Whitelist = () => {
  const handleChanges = (selector, value) => {
    const oldState = state();
    const newState = { ...oldState, [selector]: value };
    setState(newState);
  };

  const localState = {
    addInputText: '',
    clearButtonWarn: false,
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

  const exportHandler = () => {
    const payload = JSON.stringify(state()['#input-whitelist-pattern']);
    const a = document.createElement('a');
    a.download = 'TotalSuspenderWhitelist.txt';
    a.href = `data:application/octet-stream,${payload}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const importHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = ((fileContainer) => {
      const raw = fileContainer.target.result;
      const parsed = JSON.parse(raw);
      const newSet = new Set([...state()['#input-whitelist-pattern'], ...parsed]);

      handleChanges('#input-whitelist-pattern', newSet);
    });
    reader.readAsText(file);
  };

  const clearHandler = () => {
    if (!state.clearButtonWarn) {
      state.clearButtonWarn = true;
      return;
    }
    state.clearButtonWarn = false;
    handleChanges('#input-whitelist-pattern', new Set());
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
          styles={{ listContainer: 'container mb-4' }}
        />

        <div className="d-flex justify-content-around align-items-center">
          <Button
            title="Export"
            onclick={exportHandler}
          />
          <label
            className="mt-2 btn btn-outline-primary"
            for="browse">
              Import
          </label>
          <input
            type="file"
            id="browse"
            style="display: none"
            onchange={importHandler}
          />
          <Button
            title="Clear list"
            onclick={clearHandler}
            purpose={state.clearButtonWarn && 'warning'}
          />
        </div>
      </div>
    ),
  };
};

export default Whitelist;
