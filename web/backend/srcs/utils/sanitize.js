// Sanitization utilities for removing sensitive data from responses

export function sanitizeUser(user) {
  if (!user) return null;

  const { psw, token, ...safeUser } = user;
  return safeUser;
}

export function sanitizeUsers(users) {
  if (!Array.isArray(users)) return [];
  return users.map(user => sanitizeUser(user));
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  // Basic XSS prevention - escape HTML special characters
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
