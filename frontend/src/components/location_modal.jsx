export default function LocationModal({ proposal, onClose }) {
  const lat = proposal.latitude ?? 22.5726;
  const lng = proposal.longitude ?? 88.3639;

  return (
    <div
      className="location-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="location-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="close-button"
          aria-label="Close location"
          onClick={onClose}
        >
          ×
        </button>
        <span className="eyebrow">PROPOSAL LOCATION</span>
        <h2 id="location-title">{proposal.title}</h2>
        <p className="location-name">
          ⌖ {proposal.area} · {proposal.ward}, Kolkata
        </p>
        <div
          className="map-placeholder"
          aria-label="Map integration placeholder"
        >
          <span>⌖</span>
          <strong>Swarup Part</strong>
          <p>
            map module gonna be connect here.
          </p>
        </div>
        <p className="coordinates">
          Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
      </section>
    </div>
  );
}
