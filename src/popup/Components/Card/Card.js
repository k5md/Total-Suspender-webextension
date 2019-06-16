const Card = {
  view: ({
    attrs: {
      title,
      styles: {
        cardContainer = '',
        cardTitle = '',
        cardBody = '',
      },
    },
    children,
  }) => (
    <div className={`card border-primary ${cardContainer}`}>
      {title && (
        <div className={`card-title bg-primary ${cardTitle}`}>
          <h3 className="card-header font-weight-bold text-center">{title}</h3>
        </div>
      )}
      <div className={`card-body ${cardBody}`}>
        {children}
      </div>
    </div>
  ),
};

export default Card;
