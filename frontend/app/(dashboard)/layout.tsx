'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const navGroups = [
  {
    label: 'CRIAÇÃO',
    items: [
      { href: '/fabrica',    label: 'Fábrica de Conteúdo', icon: '🏭' },
      { href: '/videos',     label: 'Vídeos & Avatares',   icon: '🎬' },
      { href: '/audio',      label: 'Áudio & Carro de Som',icon: '🎙️' },
      { href: '/templates',  label: 'Templates',           icon: '🗂️' },
      { href: '/conteudo',   label: 'Conteúdo Digital',    icon: '📱' },
    ],
  },
  {
    label: 'CANAIS',
    items: [
      { href: '/publicar',   label: 'Publicar',            icon: '📲' },
      { href: '/whatsapp',   label: 'WhatsApp',            icon: '💬' },
      { href: '/radio',      label: 'Rádio Indoor',        icon: '📻' },
    ],
  },
  {
    label: 'GESTÃO',
    items: [
      { href: '/dashboard',    label: 'Dashboard',         icon: '📊' },
      { href: '/pedidos',      label: 'Pedidos de Arte',   icon: '🎨' },
      { href: '/campanhas',    label: 'Campanhas',         icon: '📣' },
      { href: '/calendario',   label: 'Calendário',        icon: '📅' },
      { href: '/concorrentes', label: 'Concorrentes',      icon: '👁️' },
      { href: '/analytics',    label: 'Analytics',         icon: '📈' },
    ],
  },
  {
    label: 'SISTEMA',
    items: [
      { href: '/apis',         label: 'Conexões & APIs',   icon: '🔑' },
      { href: '/ajuda',        label: 'Guia da Equipe',    icon: '📖' },
      { href: '/configuracoes',label: 'Configurações',     icon: '⚙️' },
    ],
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token) { router.push('/login'); return }
    if (userData) setUser(JSON.parse(userData))
  }, [router])

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0066CC] transform transition-transform duration-200 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex flex-col items-center px-4 py-4 border-b border-[#0052A3]">
          <img
            src="/logo-indio.png"
            alt="Índio Supermercados"
            className="w-full max-w-[180px] object-contain drop-shadow-lg"
          />
          <p className="text-blue-200 text-[10px] font-medium tracking-wide mt-1.5">
            ❤️❤️ Juntos Somos Mais Forte
          </p>
          <p className="text-blue-300 text-[10px] mt-0.5">
            {user?.store?.name || 'Plataforma Digital'}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="px-4 mb-1 text-[10px] font-bold tracking-widest text-blue-300 uppercase">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-white text-[#0066CC]'
                          : 'text-blue-100 hover:bg-[#0052A3] hover:text-white'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-[#0052A3]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name || 'Usuário'}</p>
              <p className="text-blue-200 text-xs truncate">{user?.role || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-blue-200 hover:text-white text-xs text-left px-1 transition-colors"
          >
            Sair →
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-gray-500">
              {user?.store?.city && `📍 ${user.store.city}`}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#0066CC] flex items-center justify-center">
              <span className="text-white text-sm font-bold">{user?.name?.charAt(0) || 'U'}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
