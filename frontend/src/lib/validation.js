// Validación de email: sintaxis (nivel 1) + sugerencia de typos (nivel 2).

// Nivel 1 — formato válido: algo@dominio.ext (sin espacios, con punto en el dominio).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailValido(email) {
  return EMAIL_RE.test((email || '').trim());
}

// Dominios más comunes para detectar typos.
const DOMINIOS = [
  'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com',
  'live.com', 'hotmail.es', 'yahoo.es', 'outlook.es', 'protonmail.com',
];

// Distancia de edición (Levenshtein): cuántos cambios separan dos textos.
function distancia(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// Nivel 2 — devuelve un email corregido si detecta un typo en el dominio, o null.
// Ej: "juan@gmial.com" → "juan@gmail.com"
export function sugerirEmail(email) {
  const e = (email || '').trim().toLowerCase();
  const at = e.lastIndexOf('@');
  if (at < 1) return null;
  const dom = e.slice(at + 1);
  if (!dom || DOMINIOS.includes(dom)) return null; // ya es un dominio conocido
  let best = null, bestD = 99;
  for (const d of DOMINIOS) {
    const dist = distancia(dom, d);
    if (dist < bestD) { bestD = dist; best = d; }
  }
  // Solo sugerir si está a 1–2 cambios (typo plausible, no un dominio distinto).
  return best && bestD >= 1 && bestD <= 2 ? e.slice(0, at + 1) + best : null;
}
