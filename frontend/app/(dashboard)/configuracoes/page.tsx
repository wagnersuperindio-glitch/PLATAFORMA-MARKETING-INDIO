'use client'
// M18 — Configurações: lojas, usuários, tokens de redes sociais
const LOJAS = [
  { id: '1', nome: 'Matriz',            cidade: 'Guaíba',          bairro: 'Vila Iolanda',   endereco: 'Rua Adão Foques, 777' },
  { id: '2', nome: 'Nestor',            cidade: 'Guaíba',          bairro: 'Coronel Nassuca',endereco: 'Av. Nestor de Moura Jardim, 420' },
  { id: '3', nome: 'Passo Fundo',       cidade: 'Guaíba',          bairro: 'Passo Fundo',    endereco: 'Rua Carlos Motta, 60' },
  { id: '4', nome: 'Centro',            cidade: 'Guaíba',          bairro: 'Centro',         endereco: 'Rua Vinte de Setembro, 999' },
  { id: '5', nome: 'Eldorado Cidade Verde', cidade: 'Eldorado do Sul', bairro: 'Cidade Verde', endereco: 'Av. Getúlio Vargas, 1001' },
  { id: '6', nome: 'Eldorado Centro',   cidade: 'Eldorado do Sul', bairro: 'Centro',         endereco: 'Av. Getúlio Vargas, 270' },
  { id: '7', nome: 'São Jerônimo',      cidade: 'São Jerônimo',    bairro: 'São Thomas',     endereco: 'Rua Antonio Pinto, 220' },
  { id: '8', nome: 'Arroio dos Ratos',  cidade: 'Arroio dos Ratos',bairro: 'Centro',         endereco: 'Rua Argemiro Dorneles, 36' },
  { id: '9', nome: 'Charqueadas 1º Maio', cidade: 'Charqueadas',   bairro: 'Centro',         endereco: 'Av. Primeiro de Maio, 1035' },
  { id: '10',nome: 'Charqueadas Salgado Filho', cidade: 'Charqueadas', bairro: 'Centro',     endereco: 'Av. Sen. Salgado Filho, 867' },
]

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-0.5">Lojas, usuários e integrações</p>
      </div>

      {/* Lojas */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">🏪 Lojas (10 unidades)</h2>
          <button className="text-sm text-[#0066CC] hover:underline">+ Nova Loja</button>
        </div>
        <div className="divide-y divide-gray-100">
          {LOJAS.map(loja => (
            <div key={loja.id} className="px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0066CC] flex items-center justify-center text-white text-xs font-bold">
                  {loja.id}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Índio {loja.nome}</p>
                  <p className="text-xs text-gray-400">{loja.endereco} — {loja.cidade}</p>
                </div>
              </div>
              <button className="text-xs text-gray-400 hover:text-[#0066CC] whitespace-nowrap">Configurar</button>
            </div>
          ))}
        </div>
      </div>

      {/* Integrações */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">🔗 Integrações de API</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { nome: 'Meta (Instagram + Facebook)', icon: '📸', status: 'Configurar', color: 'text-blue-600' },
            { nome: 'WhatsApp Business API',       icon: '💬', status: 'Configurar', color: 'text-green-600' },
            { nome: 'TikTok API',                  icon: '🎵', status: 'Configurar', color: 'text-gray-600' },
            { nome: 'Claude API (Anthropic)',       icon: '🤖', status: 'Ativo',      color: 'text-purple-600' },
            { nome: 'OpenAI Whisper',               icon: '🎙️', status: 'Configurar', color: 'text-gray-600' },
            { nome: 'SCANNTECH (Preços)',            icon: '💰', status: 'Configurar', color: 'text-orange-600' },
            { nome: 'Apify (Monitor Concorrentes)', icon: '👁️', status: 'Configurar', color: 'text-red-600' },
          ].map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm font-medium text-gray-700">{item.nome}</p>
              </div>
              <button className={`text-xs font-medium ${item.color} hover:underline`}>
                {item.status}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Usuários */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">👥 Usuários</h2>
          <button className="text-sm text-[#0066CC] hover:underline">+ Novo Usuário</button>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { nome: 'Wagner Antonelli',  email: 'wagner@supermercadoindio.com.br',   role: 'ADMIN',   loja: 'Todas' },
            { nome: 'Time Marketing',    email: 'marketing@supermercadoindio.com.br', role: 'CRIADOR', loja: 'Guaíba' },
          ].map((u, i) => (
            <div key={i} className="px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center text-white text-xs font-bold">
                  {u.nome.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{u.nome}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {u.role}
                </span>
                <span className="text-xs text-gray-400">{u.loja}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
