import { useState, useEffect } from 'react';
import Icon from '../../components/ui/Icon';

export default function InstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwa-install-dismissed') === '1'
  );

  useEffect(() => {
    if (dismissed) return;
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  if (!prompt || dismissed) return null;

  const install = async () => {
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', '1');
  };

  const dismiss = () => {
    setPrompt(null);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', '1');
  };

  return (
    <div className="install-banner glass anim-up">
      <div className="install-banner-txt">
        <strong>Agregá la app</strong>
        <span>Accedé rápido desde tu pantalla de inicio</span>
      </div>
      <div className="install-banner-actions">
        <button className="btn btn-sm" style={{ width: 'auto', padding: '0 14px', background: 'var(--gold)', color: '#fff' }} onClick={install}>
          Instalar
        </button>
        <button className="icon-btn" onClick={dismiss} title="Cerrar">
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>
  );
}
