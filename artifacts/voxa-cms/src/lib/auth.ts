const TOKEN_KEY = 'adminToken';
const EMAIL_KEY = 'adminEmail';

export function getStoredToken() {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token: string, email: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(EMAIL_KEY, email);
}

export function getStoredEmail() {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(EMAIL_KEY);
}

export function clearStoredAuth() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(EMAIL_KEY);
}