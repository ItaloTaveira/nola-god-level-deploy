const envBase = import.meta.env.VITE_API_URL;
const API_BASE = envBase && envBase.trim() !== '' ? envBase : window.location.origin;
export default API_BASE;
