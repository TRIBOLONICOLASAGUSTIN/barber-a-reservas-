import { Fragment } from 'react';
import Icon from '../../components/ui/Icon';

const STEPS = [1, 2, 3, 4];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="steps">
      {STEPS.map((n, i) => {
        const done = n < currentStep;
        const active = n === currentStep;
        return (
          <Fragment key={n}>
            {i > 0 && <div className={`step-line ${n <= currentStep ? 'done' : ''}`} />}
            <div className={`step ${done ? 'done' : active ? 'active' : ''}`}>
              <div className="step-dot">{done ? <Icon name="check" size={12} /> : n}</div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
