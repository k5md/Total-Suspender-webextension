import _ from 'lodash';
import TextInput from '../../Components/TextInput';

const EditableList = () => {
  const componentId = _.uniqueId('EditableList');

  const state = {
    editedEntryId: null, // id of node with the entry being edited
    oldEditedEntryValue: null, // value of entry being edited
    newEditedEntryValue: null,
    hoveredEntry: null, // value of entry hovered
  };

  const confirmEditHandler = (onEdit) => {
    onEdit(state.oldEditedEntryValue, state.newEditedEntryValue);
    state.oldEditedEntryValue = null;
    state.newEditedEntryValue = null;
    state.editedEntryId = null;
  };

  const clickOutsideListener = (e) => {
    const {
      editedEntryId,
      oldEditedEntryValue,
      newEditedEntryValue,
    } = state;
    if (!editedEntryId || oldEditedEntryValue || newEditedEntryValue) {
      return;
    }
    const container = document.getElementById(editedEntryId);
    const clickedInside = container.contains(e.target);
    if (!clickedInside) {
      state.oldEditedEntryValue = null;
      state.newEditedEntryValue = null;
      state.editedEntryId = null;
    }
  };

  const editHandler = (entry, editedEntryId) => {
    state.hoveredEntry = null;
    state.oldEditedEntryValue = entry;
    state.newEditedEntryValue = entry;
    state.editedEntryId = editedEntryId;
  };

  const deleteHandler = (entry, onDelete) => {
    onDelete(entry);
  };

  return {
    oncreate: () => {
      document.addEventListener('click', clickOutsideListener);
    },
    onremove: () => {
      document.removeEventListener('click', clickOutsideListener);
    },
    view: ({
      attrs: {
        onEdit: onEdit = () => {},
        onDelete: onDelete = () => {},
        entries: entries = [],
        styles: {
          listContainer = '',
          listEntry = '',
        },
      },
    }) => (
      <div className={`list-group ${listContainer}`}>
        {entries.map((entry, entryIndex) => ((state.oldEditedEntryValue !== entry)
          ? (
            <div
              id={`${componentId}${entryIndex}`}
              className={`list-group-item list-group-item-action ${listEntry}`}
              onmouseenter={() => { state.hoveredEntry = entry; }}
              onmouseleave={() => { state.hoveredEntry = null; }}
            >
              {entry}
              {state.hoveredEntry === entry && (
                <div>
                  <a className="mx-1" onclick={() => editHandler(entry, `${componentId}${entryIndex}`)}>{browser.i18n.getMessage('buttonEditEntry') || 'Edit'}</a>
                  <a className="mx-1" onclick={() => deleteHandler(entry, onDelete)}>{browser.i18n.getMessage('buttonDeleteEntry') || 'Delete'}</a>
                </div>
              )}
            </div>
          ) : (
            <div
              id={`${componentId}${entryIndex}`}
              className={`list-group-item list-group-item-action ${listEntry}`}
            >
              <TextInput
                value={state.newEditedEntryValue}
                oninput={(e) => { state.newEditedEntryValue = e.target.value; }}
              />
              <a className="mx-1" onclick={() => confirmEditHandler(onEdit)} >{browser.i18n.getMessage('buttonConfirmEditEntry') || 'Confirm'}</a>
            </div>
          )
        ))}
      </div>
    ),
  };
};

export default EditableList;
