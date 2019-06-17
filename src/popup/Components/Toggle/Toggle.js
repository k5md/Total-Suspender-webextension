import _ from 'lodash';
import './index.scss';

const purposes = {
  primary: 'btn-outline-primary',
  warning: 'btn-warning',
  secondary: 'btn-secondary',
};

const Toggle = {
  view: ({
    attrs: {
      title,
      checked: checked = true,
      onchange: onchange = () => {},
      id: id = _.uniqueId(),
      onText: onText = browser.i18n.getMessage('toggleDefaultOn') || 'On',
      offText: offText = browser.i18n.getMessage('toggleDefaultOff') || 'Off',
      purpose: purpose = 'primary',
    },
  }) => (
    <div className="input-group d-flex justify-content-between mb-4">
      {title && (
        <div className="input-group-prepend">
          <span className="input-group-text">{title}</span>
        </div>
      )}
      <div className="toggle">
        <input type="checkbox" {...{ id, checked, onchange }}/>
        <label className={`btn ${purposes[purpose]}`} for={id} data-on-text={onText} data-off-text={offText} />
      </div>
    </div>
  ),
};

export default Toggle;
