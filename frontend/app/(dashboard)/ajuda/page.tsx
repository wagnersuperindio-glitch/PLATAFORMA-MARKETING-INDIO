'use client'
// M0 — Guia da Equipe — passo a passo de uso da plataforma

const PASSOS = [
  {
    numero: '01',
    titulo: 'Acesse a plataforma',
    cor: 'bg-blue-600',
    icone: '🔐',
    steps: [
      { label: 'Abra o navegador (Chrome ou Edge)', detail: null },
      { label: 'Acesse o endereço da plataforma', detail: 'http://54.232.189.113:3000' },
      { label: 'Use seu e-mail e senha fornecidos pelo gestor', detail: null },
      { label: 'Clique em Entrar', detail: null },
    ],
    dica: 'Salve o link nos favoritos do navegador para acessar rápido toda vez.',
  },
  {
    numero: '02',
    titulo: 'Fazer um pedido de arte',
    cor: 'bg-orange-500',
    icone: '🎨',
    steps: [
      { label: 'No menu lateral, clique em Pedidos de Arte', detail: null },
      { label: 'Clique no botão "+ Novo Pedido"', detail: null },
      { label: 'Escolha o tipo: Post, Story, Encarte, Reels ou WhatsApp', detail: null },
      { label: 'Digite o título e os produtos com preços', detail: 'Ex: Alcatra Bovina — R$ 29,90/kg' },
      { label: 'Escolha os canais (Instagram, Facebook, WhatsApp)', detail: null },
      { label: 'Defina a prioridade e data de publicação', detail: null },
      { label: 'Clique em "Enviar para IA"', detail: null },
    ],
    dica: 'Quanto mais detalhado o pedido, melhor o resultado gerado pela IA.',
  },
  {
    numero: '03',
    titulo: 'A IA gera o conteúdo',
    cor: 'bg-purple-600',
    icone: '✨',
    steps: [
      { label: 'Após enviar, o pedido entra em "IA Processando"', detail: null },
      { label: 'Em segundos, o status muda para "Para Revisão"', detail: null },
      { label: 'Clique no pedido para ver o copy gerado', detail: null },
      { label: 'A IA gera: headline, legenda do Instagram, mensagem WhatsApp e hashtags', detail: null },
      { label: 'Use o botão 📋 para copiar cada texto', detail: null },
    ],
    dica: 'Se não gostar do resultado, clique em "✏️ Regerar" para a IA criar um novo.',
  },
  {
    numero: '04',
    titulo: 'Aprovar ou rejeitar conteúdo',
    cor: 'bg-green-600',
    icone: '✅',
    steps: [
      { label: 'Abra o pedido com status "Para Revisão"', detail: null },
      { label: 'Leia o copy gerado pela IA', detail: null },
      { label: 'Se estiver bom: clique em "✅ Aprovar"', detail: null },
      { label: 'Se precisar ajustar: clique em "✏️ Regerar"', detail: null },
      { label: 'Se não servir: clique em "✕ Rejeitar" com uma observação', detail: null },
    ],
    dica: 'Só gerentes e admins podem aprovar pedidos. Criadores podem apenas submeter.',
  },
  {
    numero: '05',
    titulo: 'Usar os templates de arte',
    cor: 'bg-red-600',
    icone: '🗂️',
    steps: [
      { label: 'No menu lateral, clique em Templates', detail: null },
      { label: 'Escolha o template: Sexta das Carnes, Quarta do Horti, Encarte, Story', detail: null },
      { label: 'Clique em "👁️ Visualizar" para ver a prévia', detail: null },
      { label: 'Clique em "📥 Abrir" para abrir o template em tela cheia', detail: null },
      { label: 'Botão direito → Inspecionar → edite os preços no HTML', detail: null },
      { label: 'Ctrl+Shift+S ou DevTools → "Capture screenshot" para salvar em PNG', detail: null },
    ],
    dica: 'Os templates já estão no tamanho certo: 1080×1080 para feed, 1080×1920 para stories.',
  },
  {
    numero: '06',
    titulo: 'Ver o desempenho (Analytics)',
    cor: 'bg-indigo-600',
    icone: '📈',
    steps: [
      { label: 'No menu lateral, clique em Analytics', detail: null },
      { label: 'Veja os KPIs: alcance total, engajamento, posts publicados', detail: null },
      { label: 'Compare o desempenho por canal (Instagram, Facebook, TikTok)', detail: null },
      { label: 'Veja os Top 5 posts da quinzena', detail: null },
      { label: 'Expanda o desempenho por loja clicando na seta', detail: null },
    ],
    dica: 'Os dados são atualizados automaticamente via Meta Business API.',
  },
  {
    numero: '07',
    titulo: 'Calendário editorial',
    cor: 'bg-teal-600',
    icone: '📅',
    steps: [
      { label: 'Clique em Calendário no menu lateral', detail: null },
      { label: 'Veja todos os posts programados do mês', detail: null },
      { label: 'Cores indicam o tipo: verde = FLV, vermelho = carnes, azul = encarte', detail: null },
      { label: 'A barra lateral mostra as próximas publicações em ordem', detail: null },
      { label: 'Datas importantes do varejo já estão marcadas', detail: null },
    ],
    dica: 'Consulte o calendário toda segunda-feira para planejar a semana.',
  },
  {
    numero: '08',
    titulo: 'Disparos no WhatsApp',
    cor: 'bg-emerald-600',
    icone: '💬',
    steps: [
      { label: 'Clique em WhatsApp no menu lateral', detail: null },
      { label: 'Veja as listas de transmissão por cidade/loja', detail: null },
      { label: 'Clique em "+ Novo Disparo" para enviar uma mensagem', detail: null },
      { label: 'Selecione a lista, escreva a mensagem e programe o horário', detail: null },
      { label: 'Clique em Agendar Disparo', detail: null },
    ],
    dica: 'Melhor horário para disparos: terças e quintas entre 9h e 11h.',
  },
]

const LOGINS = [
  { cargo: 'Admin / CEO', email: 'wagner@supermercadoindio.com.br', senha: 'indio2026' },
  { cargo: 'Marketing', email: 'marketing@supermercadoindio.com.br', senha: 'indio2026' },
  { cargo: 'Gerente Guaíba', email: 'guaiba@supermercadoindio.com.br', senha: 'indio2026' },
  { cargo: 'Gerente Charqueadas', email: 'charqueadas@supermercadoindio.com.br', senha: 'indio2026' },
  { cargo: 'Gerente São Jerônimo', email: 'saojeronimo@supermercadoindio.com.br', senha: 'indio2026' },
]

const DUVIDAS = [
  {
    q: 'A IA demorou muito para gerar o conteúdo. O que fazer?',
    a: 'Aguarde até 30 segundos. Se o status travar em "IA Processando", recarregue a página e clique em "Regerar".',
  },
  {
    q: 'Não consigo acessar a plataforma de outro computador.',
    a: 'Verifique se está usando o endereço correto: http://54.232.189.113:3000. O servidor precisa estar ligado na sede.',
  },
  {
    q: 'Posso editar o copy gerado pela IA antes de aprovar?',
    a: 'Sim! Copie o texto, edite no Word ou Google Docs e use a versão editada. A aprovação é sobre o pedido, não trava o texto.',
  },
  {
    q: 'Como peço um encarte completo quinzenal?',
    a: 'Use Pedidos de Arte → tipo "Encarte" e adicione todos os produtos. Ou vá em Templates → Encarte Quinzenal e edite direto no HTML.',
  },
  {
    q: 'Quem pode aprovar um pedido?',
    a: 'Apenas usuários com perfil Gerente ou Admin. Criadores só submetem pedidos.',
  },
]

export default function AjudaPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0066CC] to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
            <span className="text-[#0066CC] font-black text-2xl">Í</span>
          </div>
          <div>
            <h1 className="text-2xl font-black">Guia da Equipe de Marketing</h1>
            <p className="text-blue-200 text-sm mt-0.5">Supermercados Índio — Plataforma Digital</p>
          </div>
        </div>
        <p className="text-blue-100 text-sm leading-relaxed">
          Tudo que você precisa saber para usar a plataforma. Do login até gerar conteúdo com IA, aprovar artes e monitorar o desempenho nas redes sociais.
        </p>
      </div>

      {/* Acesso rápido */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
        <h2 className="font-bold text-yellow-800 text-sm mb-3">🔑 Acesso à Plataforma</h2>
        <div className="mb-3">
          <p className="text-xs text-yellow-700 font-medium mb-1">Endereço:</p>
          <code className="bg-white border border-yellow-300 rounded px-3 py-1.5 text-sm font-mono text-gray-800 block">
            http://54.232.189.113:3000
          </code>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-yellow-700 font-semibold">
                <th className="text-left pb-2">Cargo</th>
                <th className="text-left pb-2">E-mail</th>
                <th className="text-left pb-2">Senha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-100">
              {LOGINS.map((l, i) => (
                <tr key={i}>
                  <td className="py-1.5 text-gray-600 font-medium">{l.cargo}</td>
                  <td className="py-1.5 text-gray-700 font-mono">{l.email}</td>
                  <td className="py-1.5 text-gray-700 font-mono">{l.senha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-yellow-600 mt-3">⚠️ Troque sua senha após o primeiro acesso em Configurações.</p>
      </div>

      {/* Passos */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Passo a Passo</h2>
        <div className="space-y-4">
          {PASSOS.map((passo) => (
            <div key={passo.numero} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Header do passo */}
              <div className={`${passo.cor} px-5 py-4 flex items-center gap-3`}>
                <span className="text-white font-black text-lg opacity-60">{passo.numero}</span>
                <span className="text-2xl">{passo.icone}</span>
                <h3 className="text-white font-bold text-sm">{passo.titulo}</h3>
              </div>

              {/* Steps */}
              <div className="p-5">
                <ol className="space-y-2.5">
                  {passo.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-sm text-gray-700">{step.label}</span>
                        {step.detail && (
                          <code className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                            {step.detail}
                          </code>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Dica */}
                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 flex items-start gap-2">
                  <span className="text-blue-500 text-sm shrink-0">💡</span>
                  <p className="text-xs text-blue-700 leading-relaxed">{passo.dica}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dúvidas frequentes */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">❓ Dúvidas Frequentes</h2>
        <div className="space-y-3">
          {DUVIDAS.map((d, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="font-semibold text-gray-900 text-sm mb-1.5">{d.q}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{d.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suporte */}
      <div className="bg-gray-900 rounded-xl p-6 text-center">
        <p className="text-white font-bold text-sm mb-1">Precisa de ajuda?</p>
        <p className="text-gray-400 text-xs">Fale com o Wagner ou com o time de TI</p>
        <p className="text-[#FF6B00] font-mono text-sm mt-2">wagner@supermercadoindio.com.br</p>
      </div>

    </div>
  )
}
