import _ from 'lodash';

const purposes = {
  primary: 'btn-outline-primary',
  warning: 'btn-warning',
  secondary: 'btn-secondary',
};

const Button = {
  view: ({
    attrs: {
      id: id = _.uniqueId(),
      title,
      onclick: onclick = () => {},
      purpose,
    },
  }) => (
    <input
      id={id}
      type="button"
      class={`btn ${purposes[purpose] || purposes.primary}`}
      onclick={onclick}
      value={title}
    />
  ),
};

export default Button;
