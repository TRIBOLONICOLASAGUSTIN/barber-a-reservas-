import { useState } from 'react';
import Icon from '../../components/ui/Icon';
import { money, parseMoney } from '../../lib/format';
import { guardarPrecios } from '../../lib/prices';

export default function PreciosTab({ servicios, refresh }) {
  const [valores, setValores] = useState(() =>
    Object.fromEntries(servicios.map((s) => [s.name, money(s.price)]))
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const guardar = async () => {
    setBusy(true); setMsg('');
    try {
      await guardarPrecios(servicios.map((s) => ({ servicio: s.name, precio: parseMoney(valores[s.name]) })));
      await refresh();
      setMsg('Precios actualizados.');
    } catch { setMsg('Error al guardar los precios.'); }
    setBusy(false);
  };

  return (
    <>
      <div className="sec-h" style={{ padding: '8px 18px 2px' }}>
        <p>Editá el precio de cada categoría.</p>
      </div>
      {msg && <div className="alert alert-ok"><Icon name="check" size={15} /> {msg}</div>}
      {servicios.map((s) => (
        <div key={s.id} className="price-row">
          <div className="p-ic"><Icon name={s.icon} size={21} /></div>
          <div className="p-name">{s.name}{s.combo && <span className="p-tag">COMBO</span>}</div>
          <input className="p-input" inputMode="numeric" value={valores[s.name]}
            onChange={(e) => setValores({ ...valores, [s.name]: e.target.value })}
            onBlur={(e) => setValores({ ...valores, [s.name]: money(parseMoney(e.target.value)) })} />
        </div>
      ))}
      <div className="actions">
        <button className="btn" onClick={guardar} disabled={busy}>
          {busy ? <span className="spinner" /> : <><Icon name="check" /> Guardar precios</>}
        </button>
      </div>
      <div className="h20" />
    </>
  );
}
