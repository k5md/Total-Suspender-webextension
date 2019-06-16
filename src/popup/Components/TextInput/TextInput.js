import _ from 'lodash';

const TextInput = {
  view: ({
    attrs: {
      prepend,
      id: id = _.uniqueId(),
      onchange: onchange = () => {},
      oninput: oninput = () => {},
      value: value = '',
      append,
    },
  }) => (
    <div className="input-group d-flex justify-content-between mb-4">
      {prepend && (
        <div className="input-group-prepend">
          {prepend}
        </div>
      )}
      <input
        type="text"
        className="form-control"
        {...{
          id,
          value,
          onchange,
          oninput,
        }}
      />
      {append && (
        <div class="input-group-append">
          {append}
        </div>
      )}
    </div>
  ),
};

export default TextInput;
