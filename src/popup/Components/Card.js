
const Card = {
  view: ({
    attrs: {
      title,
    },
    children,
  }) => (
    <div className="card border-primary options_card">
      {title && (
        <div className="card-title bg-primary options_card_title">
          <h3 className="card-header font-weight-bold text-center">{title}</h3>
        </div>
      )}
      <div className="card-body options_card_body">
        {children}
      </div>
    </div>
  ),
};

export default Card;
