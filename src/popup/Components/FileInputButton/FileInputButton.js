import _ from 'lodash';

const purposes = {
  primary: 'btn-outline-primary',
  warning: 'btn-warning',
  secondary: 'btn-secondary',
};

const FileImportButton = () => {
  const id = _.uniqueId();

  return {
    view: ({
      attrs: {
        title,
        onchange: onchange = () => {},
        purpose,
      },
    }) => (
      <div>
        <label
          className={`btn ${purposes[purpose] || purposes.primary}`}
          for={id}
        >
         {title}
        </label>
        <input
          type="file"
          id={id}
          style="display: none"
          onchange={onchange}
        />
      </div>
    ),
  };
};

export default FileImportButton;
