'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao entrar')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0066CC] to-[#004499]">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0066CC] mb-4">
            <span className="text-white text-2xl font-bold">Í</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Índio Marketing</h1>
          <p className="text-gray-500 text-sm mt-1">Plataforma Digital — Grupo Índio</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent outline-none text-gray-900"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent outline-none text-gray-900"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#0066CC] hover:bg-[#0052A3] disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Dica primeiro acesso */}
        <div className="mt-5 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-xs text-blue-700 font-medium mb-1">🔑 Primeiro acesso</p>
          <p className="text-xs text-blue-600">Admin: wagner@supermercadoindio.com.br</p>
          <p className="text-xs text-blue-600">Marketing: marketing@supermercadoindio.com.br</p>
          <p className="text-xs text-blue-500 mt-1">Rode o seed do banco antes de entrar</p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Supermercados Índio © 2026 — Sistema interno
        </p>
      </div>
    </div>
  )
}
