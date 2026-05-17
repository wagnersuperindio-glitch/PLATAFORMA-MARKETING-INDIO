// URL base da API
// Produção (Vercel): string vazia → Vercel faz proxy de /api/* para o Railway (sem CORS)
// Dev local: aponta direto para localhost:3001
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : '')
