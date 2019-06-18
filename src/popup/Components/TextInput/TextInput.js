import _ from 'lodash';

const TextInput = {
  view: ({
    attrs: {
      prepend,
      id: id = _.uniqueId(),
      onchange,
      oninput,
      value: value = '',
      append,
      pattern,
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
          pattern,
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
