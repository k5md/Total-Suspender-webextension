import _ from 'lodash';

const Toggle = {
  view: ({
    attrs: {
      title,
      checked: checked = true,
      id: id = _.uniqueId(),
      onText: onText = 'On',
      offText: offText = 'Off',
    },
  }) => (
    <div className="input-group d-flex justify-content-between mb-4">
      {title && (
        <div className="input-group-prepend">
          <span className="input-group-text">{title}</span>
        </div>
      )}
      <div className="toggle">
        <input type="checkbox" id={id} {...{ checked }} />
        <label className="btn btn-warning" for={id} data-on-text={onText} data-off-text={offText} />
      </div>
    </div>
  ),
};

export default Toggle;
