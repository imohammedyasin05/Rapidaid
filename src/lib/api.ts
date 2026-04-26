// API Base URL configuration for deployment
// In development, we use an empty string to use the current origin (proxied by the server)
// In production, we use the RENDER_BACKEND_URL provided in the environment variables

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// If the URL ends with a slash, remove it for consistency
export const getApiUrl = (path: string) => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
