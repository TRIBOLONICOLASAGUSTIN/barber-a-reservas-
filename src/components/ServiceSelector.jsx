export default function ServiceSelector({ services = [], selectedService, onSelect }) {
  return (
    <div className="services-container">
      <div className="services-grid-2x2">
        {services.map((service) => {
          const isSelected = selectedService?.id === service.id;
          return (
            <button
              type="button"
              key={service.id}
              onClick={() => onSelect(isSelected ? null : service)}
              className={`service-grid-card ${isSelected ? 'selected' : ''}`}
            >
              <span className="service-grid-icon">{service.icon}</span>
              <span className="service-grid-name">{service.name}</span>
              <span className="service-grid-price">{service.price}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
