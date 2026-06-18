const STEPS = [
  { n: 1, label: 'Servicio' },
  { n: 2, label: 'Fecha' },
  { n: 3, label: 'Datos' },
  { n: 4, label: 'Confirmar' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="step-indicator">
      {STEPS.map((s, i) => {
        const done   = s.n < currentStep;
        const active = s.n === currentStep;
        const state  = done ? 'done' : active ? 'active' : 'pending';

        return (
          <div key={s.n} className="step-item-wrapper">
            {i > 0 && (
              <div className={`step-connector ${done ? 'done' : ''}`} />
            )}
            <div className="step-item">
              <div className={`step-circle ${state}`}>
                {done ? '✓' : s.n}
              </div>
              <span className={`step-label ${active ? 'active' : ''}`}>
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
