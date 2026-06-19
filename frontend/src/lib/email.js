import emailjs from '@emailjs/browser';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUB_KEY     = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const TPL_CLIENT  = import.meta.env.VITE_EMAILJS_TEMPLATE_CLIENT;
const TPL_ADMIN   = import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN;
const ADMIN_DEST  = import.meta.env.VITE_ADMIN_NOTIFY_EMAIL || 'nicotribolo2005@gmail.com';

function ready() {
  return SERVICE_ID && PUB_KEY && TPL_CLIENT && TPL_ADMIN;
}

/* Envía confirmación al cliente y notificación al admin */
export async function enviarEmailReserva({ cliente, telefono, email, servicio, fecha, hora, precio }) {
  if (!ready()) return;

  const params = { cliente, telefono, email_cliente: email, servicio, fecha, hora, precio };

  await Promise.allSettled([
    // → cliente
    emailjs.send(SERVICE_ID, TPL_CLIENT, {
      to_name:  cliente,
      to_email: email,
      servicio,
      fecha,
      hora,
      precio,
      lugar: 'Av. de la Constitución 45, Sevilla',
    }, PUB_KEY),

    // → admin Gmail
    emailjs.send(SERVICE_ID, TPL_ADMIN, {
      ...params,
      to_email: ADMIN_DEST,
    }, PUB_KEY),
  ]);
}

/* Notificación al admin cuando un cliente cancela */
export async function enviarEmailCancelacion({ cliente, telefono, email, servicio, fecha, hora }) {
  if (!ready()) return;

  await emailjs.send(SERVICE_ID, TPL_ADMIN, {
    cliente,
    telefono,
    email_cliente: email,
    servicio,
    fecha,
    hora,
    precio: '—',
    to_email: ADMIN_DEST,
    asunto_extra: '❌ CANCELACIÓN',
  }, PUB_KEY).catch(() => null);
}
