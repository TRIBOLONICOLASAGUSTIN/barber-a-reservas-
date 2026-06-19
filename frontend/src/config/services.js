// Catálogo de servicios. `name` es la clave que se guarda en turnos.servicio
// y la que mapea precios en la tabla `precios`.
export const DEFAULT_SERVICES = [
  { id: 'corte',       name: 'Corte de pelo',       icon: 'scissors', duration: '30 min', price: 15000 },
  { id: 'perfilado',   name: 'Perfilado de barba',  icon: 'razor',    duration: '20 min', price: 20000 },
  { id: 'barba',       name: 'Barba completa',      icon: 'beard',    duration: '30 min', price: 22000 },
  { id: 'tratamiento', name: 'Tratamiento capilar', icon: 'spray',    duration: '45 min', price: 30000 },
  { id: 'combo',       name: 'Corte + Barba',       icon: 'combo',    duration: '50 min', price: 36000, combo: true },
];

// Mapa name -> icono, para renderizar el ícono correcto a partir del string guardado.
export const ICON_BY_SERVICE = DEFAULT_SERVICES.reduce((acc, s) => {
  acc[s.name] = s.icon;
  return acc;
}, {});

export function iconForService(name) {
  return ICON_BY_SERVICE[name] || 'scissors';
}
