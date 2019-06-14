import _ from 'lodash';

const TextInput = {
  view: ({
    attrs: {
      title,
      id: id = _.uniqueId(),
      oninput: oninput = () => {},
      value: value = '',
    },
  }) => (
    <div className="input-group d-flex justify-content-between mb-4">
      {title && (
        <div className="input-group-prepend">
          <span className="input-group-text">{title}</span>
        </div>
      )}
      <input type="text" className="form-control" {...{ id, value, oninput }}/>
    </div>
  ),
};

export default TextInput;
