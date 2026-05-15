'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const stats = [
  { label: 'Pedidos Pendentes',   value: '—', icon: '🎨', color: 'text-orange-600', href: '/pedidos?status=PENDENTE' },
  { label: 'Publicações Esta Semana', value: '—', icon: '📣', color: 'text-blue-600',   href: '/campanhas' },
  { label: 'Alertas Concorrentes',    value: '—', icon: '👁️', color: 'text-red-600',    href: '/concorrentes' },
  { label: 'Alcance Mensal',          value: '—', icon: '📈', color: 'text-green-600',  href: '/analytics' },
]

const quickActions = [
  { label: 'Pedir Arte/Encarte',    icon: '🎨', href: '/pedidos/novo',         color: 'bg-blue-600 hover:bg-blue-700' },
  { label: 'Ver Concorrentes',      icon: '👁️', href: '/concorrentes',         color: 'bg-red-600 hover:bg-red-700' },
  { label: 'Calendário Editorial',  icon: '📅', href: '/calendario',           color: 'bg-purple-600 hover:bg-purple-700' },
  { label: 'Disparo WhatsApp',      icon: '💬', href: '/whatsapp',             color: 'bg-green-600 hover:bg-green-700' },
]

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bom dia{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {user?.store?.name ? `${user.store.name} — ${user.store.city}` : 'Painel de Marketing Digital'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Ações rápidas */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Ações Rápidas</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(action => (
            <Link key={action.label} href={action.href}
              className={`${action.color} text-white rounded-xl p-5 flex flex-col items-center gap-2 transition-colors`}>
              <span className="text-3xl">{action.icon}</span>
              <span className="text-sm font-medium text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Pedidos recentes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h2>
          <Link href="/pedidos" className="text-sm text-[#0066CC] hover:underline">Ver todos →</Link>
        </div>
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">🎨</p>
          <p className="text-sm">Nenhum pedido ainda.</p>
          <Link href="/pedidos/novo"
            className="mt-3 inline-block text-sm text-[#0066CC] font-medium hover:underline">
            Criar primeiro pedido →
          </Link>
        </div>
      </div>

      {/* Monitor concorrentes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">🔴 Monitor de Concorrentes</h2>
          <Link href="/concorrentes" className="text-sm text-[#0066CC] hover:underline">Configurar →</Link>
        </div>
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">👁️</p>
          <p className="text-sm">Configure os concorrentes para monitorar.</p>
          <Link href="/concorrentes"
            className="mt-3 inline-block text-sm text-[#0066CC] font-medium hover:underline">
            Adicionar concorrentes →
          </Link>
        </div>
      </div>
    </div>
  )
}
