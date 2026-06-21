import Icon from '../../components/ui/Icon';
import { BARBER } from '../../config/shop';

export default function BarberCard() {
  return (
    <div className="barber-card glass anim-up">
      <div className="barber-card-top">
        <div className="barber-avatar">
          <img src={BARBER.foto} alt={BARBER.nombre} />
        </div>
        <div className="barber-info">
          <div className="barber-eyebrow"><Icon name="scissors" size={12} /> Tu barbero</div>
          <h3 className="barber-name">{BARBER.nombre}</h3>
          <div className="barber-titulo">{BARBER.titulo}</div>
          <p className="barber-bio">{BARBER.bio}</p>
        </div>
      </div>
      <div className="barber-tags">
        {BARBER.especialidades.map((e) => (
          <span key={e} className="barber-tag">{e}</span>
        ))}
      </div>
    </div>
  );
}
