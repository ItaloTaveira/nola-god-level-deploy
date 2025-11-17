// Normalize VITE API base URL used across components.
// - remove surrounding angle brackets if someone pasted a placeholder like <URL>
// - trim trailing slash
// - default to empty string so calls become relative (served from same origin)

const raw = import.meta.env.VITE_API_URL || '';

function sanitize(s) {
  if (!s) return '';
  // remove angle brackets used in docs/placeholders
  let v = s.replace(/^\s*<+/, '').replace(/>+\s*$/, '').trim();
  // remove trailing slash
  v = v.replace(/\/+$/, '');
  return v;
}

const API = sanitize(raw);

export default API;
