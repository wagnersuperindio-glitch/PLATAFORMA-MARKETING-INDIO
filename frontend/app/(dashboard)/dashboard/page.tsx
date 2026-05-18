'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { API_URL } from '@/lib/api'

const SEMANA = [
  { dia: 'SEG', campanha: '🏷️ Segundaço', sub: 'Ofertas relâmpago', ativo: true },
  { dia: 'TER', campanha: '🚗 Carro de Som', sub: 'Rotas padrão', ativo: false },
  { dia: 'QUA', campanha: '🥦 Horti', sub: 'Frutas & Legumes', ativo: true },
  { dia: 'QUI', campanha: '🍗 Churrascada', sub: 'Cortes para churrasco', ativo: false },
  { dia: 'SEX', campanha: '🥩 Sexta Carnes', sub: 'Bovinos + Suínos', ativo: true },
  { dia: 'SÁB', campanha: '⭐ Dia "I"', sub: 'Promoção especial', ativo: false },
  { dia: 'DOM', campanha: '💳 Clube Mais', sub: 'Pontos & Cashback', ativo: false },
]

const FERRAMENTAS = [
  { nome: 'Fábrica de Conteúdo', icon: '🏭', desc: '/pack-semanal, /encarte, /tv, /led', href: '/fabrica',  status: 'Pronto',   cor: 'green' },
  { nome: 'Vídeos & Avatares',   icon: '🎬', desc: 'HeyGen · 5 avatares · Beto, Lurdes…',href: '/videos',   status: 'Pronto',   cor: 'green' },
  { nome: 'Áudio & Carro de Som',icon: '🎙️', desc: 'ElevenLabs · Brian · Spots',          href: '/audio',    status: 'Pronto',   cor: 'green' },
  { nome: 'Canva MCP',           icon: '🎨', desc: 'Brand Kit configurado · Encartes',    href: '/templates',status: 'Pronto',   cor: 'green' },
  { nome: 'Rádio Super Índio',   icon: '📻', desc: 'Player PWA · Grade · Trade',           href: '/radio',    status: 'Protótipo',cor: 'yellow' },
  { nome: 'WhatsApp Business',   icon: '💬', desc: 'Disparos · Campanhas · Listas',        href: '/whatsapp', status: 'Dev Mode', cor: 'yellow' },
  { nome: 'Publicar Redes',      icon: '📲', desc: 'Instagram · Facebook · WhatsApp',     href: '/publicar', status: 'Pronto',   cor: 'green' },
  { nome: 'Meta API',            icon: '📸', desc: 'Instagram · Facebook · Publicação',    href: '/publicar', status: 'Ativo',    cor: 'green' },
]

const COR: Record<string, string> = {
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [summary, setSummary] = useState({ pendentes: 0, campanhasAtivas: 0, concorrentes: 0 })

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))

    const token = localStorage.getItem('token')
    if (!token) return
    fetch(`${API_URL}/api/analytics/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) setSummary({
          pendentes: d.pendingRequests ?? 0,
          campanhasAtivas: d.activeCampaigns ?? 0,
          concorrentes: d.recentCompetitorAlerts ?? 0,
        })
      })
      .catch(() => {})
  }, [])

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const diaIdx = (new Date().getDay() + 6) % 7 // 0=SEG … 6=DOM

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {saudacao}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            {user?.store?.name ? `${user.store.name} — ${user.store.city}` : 'Supermercados Índio — Plataforma de Marketing Digital'}
          </p>
        </div>
        <Link href="/fabrica"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors">
          🚀 Pack Semanal
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Instagram',      value: '45.2k', icon: '📸', cor: 'text-pink-600',   sub: '@supermercadosindio',    href: '/analytics' },
          { label: 'Facebook',       value: '58.1k', icon: '💙', cor: 'text-blue-600',   sub: 'Curtidas na página',     href: '/analytics' },
          { label: 'Pedidos Pend.',  value: summary.pendentes, icon: '🎨', cor: 'text-orange-600', sub: 'Aguardando revisão', href: '/pedidos' },
          { label: 'Campanhas Ativas',value: summary.campanhasAtivas, icon: '📣', cor: 'text-green-600', sub: 'Rodando agora', href: '/campanhas' },
        ].map(s => (
          <Link key={s.label} href={s.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span className={`text-2xl font-bold ${s.cor}`}>{s.value}</span>
            </div>
            <p className="text-sm font-semibold text-gray-700">{s.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </Link>
        ))}
      </div>

      {/* Ações rápidas */}
      <div>
        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">⚡ Ações Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Gerar Campanha', icon: '🏭', href: '/fabrica',     cor: 'bg-[#FF6B00] hover:bg-orange-700' },
            { label: 'Criar Vídeo',    icon: '🎬', href: '/videos',      cor: 'bg-[#0066CC] hover:bg-blue-800' },
            { label: 'Gerar Áudio',    icon: '🎙️', href: '/audio',       cor: 'bg-purple-600 hover:bg-purple-700' },
            { label: 'Publicar',       icon: '📲', href: '/publicar',    cor: 'bg-green-600 hover:bg-green-700' },
            { label: 'Pedido de Arte', icon: '🎨', href: '/pedidos/novo',cor: 'bg-indigo-600 hover:bg-indigo-700' },
            { label: 'Concorrentes',   icon: '👁️', href: '/concorrentes',cor: 'bg-red-600 hover:bg-red-700' },
            { label: 'Calendário',     icon: '📅', href: '/calendario',  cor: 'bg-teal-600 hover:bg-teal-700' },
            { label: 'Analytics',      icon: '📈', href: '/analytics',   cor: 'bg-gray-700 hover:bg-gray-800' },
          ].map(a => (
            <Link key={a.label} href={a.href}
              className={`${a.cor} text-white rounded-xl p-4 flex flex-col items-center gap-2 transition-colors`}>
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-semibold text-center">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Calendário semanal */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          📅 Campanhas Recorrentes — Esta Semana
          <span className="flex-1 h-px bg-gray-100"></span>
          <Link href="/calendario" className="text-xs text-[#0066CC] hover:underline">Ver calendário →</Link>
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {SEMANA.map((d, i) => (
            <div key={d.dia} className={`rounded-lg border p-2.5 text-center text-xs ${
              i === diaIdx
                ? 'border-[#FF6B00] bg-orange-50'
                : d.ativo
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-100 bg-gray-50'
            }`}>
              <p className={`font-bold mb-1 ${i === diaIdx ? 'text-[#FF6B00]' : d.ativo ? 'text-blue-700' : 'text-gray-400'}`}>{d.dia}</p>
              <p className="font-semibold text-gray-700 leading-tight">{d.campanha}</p>
              <p className="text-gray-400 mt-0.5 text-[10px]">{d.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status das ferramentas */}
      <div>
        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">🔧 Status das Ferramentas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FERRAMENTAS.map(f => (
            <Link key={f.nome} href={f.href}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xl">{f.icon}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${COR[f.cor]}`}>{f.status}</span>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{f.nome}</p>
              <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Alertas */}
      {summary.concorrentes > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔴</span>
            <div>
              <p className="font-semibold text-red-800 text-sm">{summary.concorrentes} alerta{summary.concorrentes > 1 ? 's' : ''} de concorrentes</p>
              <p className="text-xs text-red-600">Novos posts detectados com ofertas</p>
            </div>
          </div>
          <Link href="/concorrentes" className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700">Ver →</Link>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">✅</span>
          <div>
            <p className="font-semibold text-green-800 text-sm">Meta API conectada</p>
            <p className="text-xs text-green-600">Token ativo (renovado 17/05/2026) — Instagram + Facebook funcionando</p>
          </div>
        </div>
        <Link href="/publicar" className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700">Publicar →</Link>
      </div>
    </div>
  )
}
