const purposes = {
  primary: 'btn-outline-primary',
  warning: 'btn-warning',
  secondary: 'btn-secondary',
};

const Button = {
  view: ({
    attrs: {
      title,
      onclick: onclick = () => {},
      purpose,
    },
  }) => (
    <button
      class={`btn ${purposes[purpose] || purposes.primary}`}
      type="button"
      onclick={onclick}
    >
      {title}
    </button>
  ),
};

export default Button;
