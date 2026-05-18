'use client'
import { useState } from 'react'

const FORMATOS = [
  {
    id: 'reel',
    icon: '🎬',
    nome: 'Reel Instagram',
    dimensao: '1080×1920 · 9:16',
    duracao: '15s · 30s · 60s · 90s',
    desc: 'Vídeo curto vertical para Reels do Instagram. Máximo engajamento orgânico.',
    ferramenta: 'CapCut + Seedance 2.0',
    cor: 'bg-gradient-to-br from-purple-900 to-pink-900',
    dicas: ['Hook nos primeiros 3 segundos', 'Música trending do momento', 'Legenda com CTA no final'],
  },
  {
    id: 'stories',
    icon: '📸',
    nome: 'Stories Instagram',
    dimensao: '1080×1920 · 9:16',
    duracao: '15s por card',
    desc: 'Stories com stickers, enquetes e link. Perfeito para ofertas relâmpago.',
    ferramenta: 'CapCut + Template HTML',
    cor: 'bg-gradient-to-br from-orange-900 to-red-900',
    dicas: ['Use sticker de contagem regressiva', 'Enquete: "Quer essa oferta?"', 'Link direto para WhatsApp'],
  },
  {
    id: 'tiktok',
    icon: '🎵',
    nome: 'TikTok',
    dimensao: '1080×1920 · 9:16',
    duracao: '15s · 30s · 60s',
    desc: 'Vídeo nativo para TikTok. Tom mais descontraído, tendências e áudio viral.',
    ferramenta: 'CapCut + Seedance 2.0',
    cor: 'bg-gradient-to-br from-gray-900 to-black',
    dicas: ['Usar som em alta no TikTok', 'Texto na tela (acessibilidade)', 'Trend atual: preço + produto'],
  },
  {
    id: 'youtube',
    icon: '▶️',
    nome: 'YouTube Shorts',
    dimensao: '1080×1920 · 9:16',
    duracao: 'Até 60s',
    desc: 'Shorts do YouTube — alcance orgânico alto para novos públicos.',
    ferramenta: 'CapCut + Seedance 2.0',
    cor: 'bg-gradient-to-br from-red-900 to-red-950',
    dicas: ['Thumbnail chamativa', 'Título com palavra-chave local', 'CTA para visitar a loja'],
  },
  {
    id: 'feed-video',
    icon: '📹',
    nome: 'Vídeo Feed Instagram',
    dimensao: '1080×1080 · 1:1',
    duracao: '30s · 60s',
    desc: 'Vídeo quadrado para o feed. Ideal para apresentações de produtos e campanhas.',
    ferramenta: 'HeyGen + ElevenLabs',
    cor: 'bg-gradient-to-br from-blue-900 to-indigo-900',
    dicas: ['Avatar Beto ou Seu Neri', 'Voz Brian ElevenLabs', 'Fundo limpo com logo Índio'],
  },
  {
    id: 'tv-interno',
    icon: '📺',
    nome: 'TV Interna da Loja',
    dimensao: '1920×1080 · 16:9',
    duracao: '10s · 15s · 30s',
    desc: 'Vídeo horizontal para TVs internas das 10 lojas. Loop contínuo no caixa.',
    ferramenta: 'CapCut + GPT Image 2',
    cor: 'bg-gradient-to-br from-teal-900 to-cyan-900',
    dicas: ['Texto grande (leitura à distância)', 'Sem narração (som da loja)', 'Loop a cada 10 segundos'],
  },
]

const CAMPANHAS_SUGERIDAS = [
  { emoji: '🥩', nome: 'Sexta das Carnes', formato: 'Reel 30s', gancho: '"Hoje tem promoção que não pode perder!"', hashtags: '#SextaDasCarnes #SuperIndio #Gaúcho' },
  { emoji: '🥦', nome: 'Quarta do Horti', formato: 'Stories', gancho: '"Hortaliças frescas por esse preço?"', hashtags: '#QuartaDoHorti #FresquinhoNoIndio' },
  { emoji: '🎄', nome: 'Natal da Economia', formato: 'Reel 60s', gancho: '"Natal completo sem pesar no bolso"', hashtags: '#NatalIndio #NatalDaEconomia' },
  { emoji: '🔥', nome: 'Black Friday', formato: 'TikTok 15s', gancho: '"30% OFF só até meia-noite!"', hashtags: '#BlackFridayIndio #DescontaoGaucho' },
  { emoji: '🐎', nome: 'Farroupilha', formato: 'Reel 30s', gancho: '"Gaúcho de coração, Índio de escolha"', hashtags: '#Farroupilha #20deSetembro #RS' },
]

type LogLine = { msg: string; tipo: 'ok' | 'info' | 'warn' | 'prompt' }

export default function ConteudoPage() {
  const [formatoId, setFormatoId] = useState('reel')
  const [campanha, setCampanha] = useState('')
  const [gancho, setGancho] = useState('')
  const [logs, setLogs] = useState<LogLine[]>([])
  const [running, setRunning] = useState(false)

  const formato = FORMATOS.find(f => f.id === formatoId)!
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
  function addLog(msg: string, tipo: LogLine['tipo'] = 'info') { setLogs(p => [...p, { msg, tipo }]) }

  async function gerarConteudo() {
    setRunning(true)
    setLogs([])
    addLog(`> /conteudo formato="${formato.nome}" campanha="${campanha || 'Oferta Semanal'}"`, 'prompt')
    await sleep(300); addLog(`🔍 Carregando configurações ${formato.ferramenta}...`, 'info')
    await sleep(500); addLog(`📐 Dimensão: ${formato.dimensao} | Duração: ${formato.duracao}`, 'info')
    await sleep(400); addLog(`🎬 Iniciando geração via ${formato.ferramenta}...`, 'info')
    if (formato.id === 'reel' || formato.id === 'tiktok' || formato.id === 'stories') {
      await sleep(600); addLog('🎵 Buscando áudio trending compatível...', 'info')
      await sleep(400); addLog('✅  Áudio selecionado: faixa trending da semana', 'ok')
    }
    if (formato.id === 'feed-video' || formato.id === 'tv-interno') {
      await sleep(600); addLog('🎙️  [ElevenLabs] Gerando narração com Voz Brian...', 'info')
      await sleep(800); addLog('✅  Narração gerada → audio_narração.mp3', 'ok')
    }
    await sleep(600); addLog(`✅  ${formato.nome} gerado com sucesso!`, 'ok')
    await sleep(200); addLog('📤  Pronto para publicação.', 'info')
    setRunning(false)
  }

  function usarSugestao(s: typeof CAMPANHAS_SUGERIDAS[0]) {
    setCampanha(s.nome)
    setGancho(s.gancho)
  }

  const logColor: Record<string, string> = { ok: 'text-green-400', info: 'text-blue-300', warn: 'text-yellow-400', prompt: 'text-gray-400' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">🎬 Conteúdo Digital</h1>
        <p className="text-sm text-gray-500 mt-0.5">Reels · Stories · TikTok · YouTube Shorts · TV Interna — via CapCut, Seedance 2.0 e HeyGen</p>
      </div>

      {/* Seleção de formato */}
      <div>
        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">1. Escolha o Formato</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {FORMATOS.map(f => (
            <button key={f.id} onClick={() => setFormatoId(f.id)}
              className={`rounded-xl p-3 text-center border-2 transition-all ${
                formatoId === f.id ? 'border-[#0066CC] bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}>
              <div className="text-3xl mb-2">{f.icon}</div>
              <p className="text-xs font-bold text-gray-900 leading-tight">{f.nome}</p>
              <p className="text-[10px] text-gray-400 mt-1">{f.dimensao}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Detalhes do formato selecionado */}
      <div className={`${formato.cor} rounded-xl p-5 text-white`}>
        <div className="flex items-start gap-4">
          <span className="text-4xl">{formato.icon}</span>
          <div className="flex-1">
            <h3 className="text-lg font-bold">{formato.nome}</h3>
            <p className="text-sm opacity-80 mb-2">{formato.desc}</p>
            <div className="flex gap-4 text-xs opacity-70">
              <span>📐 {formato.dimensao}</span>
              <span>⏱️ {formato.duracao}</span>
              <span>🛠️ {formato.ferramenta}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {formato.dicas.map((d, i) => (
            <div key={i} className="bg-white/10 rounded-lg px-3 py-2 text-xs">
              💡 {d}
            </div>
          ))}
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-700">2. Configure o Conteúdo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Campanha / Tema</label>
            <input type="text" value={campanha} onChange={e => setCampanha(e.target.value)}
              placeholder="Ex: Sexta das Carnes — Fraldão R$29,90"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hook (gancho inicial)</label>
            <input type="text" value={gancho} onChange={e => setGancho(e.target.value)}
              placeholder='Ex: "Hoje tem oferta que não pode perder!"'
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC]" />
          </div>
        </div>
        <button onClick={gerarConteudo} disabled={running}
          className="px-6 py-2.5 bg-[#FF6B00] text-white text-sm font-bold rounded-lg hover:bg-orange-700 disabled:opacity-60 transition-colors">
          🎬 Gerar {formato.nome}
        </button>
      </div>

      {/* Console */}
      {logs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            💻 Saída
            <span className="flex-1 h-px bg-gray-200"></span>
            <button onClick={() => setLogs([])} className="text-xs text-gray-400">Limpar</button>
          </h3>
          <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs leading-relaxed space-y-0.5 max-h-40 overflow-y-auto">
            {logs.map((l, i) => <div key={i} className={logColor[l.tipo] || 'text-gray-300'}>{l.msg}</div>)}
            {running && <div className="text-gray-400 animate-pulse">▌</div>}
          </div>
        </div>
      )}

      {/* Campanhas sugeridas */}
      <div>
        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">⚡ Campanhas Sugeridas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CAMPANHAS_SUGERIDAS.map(s => (
            <div key={s.nome} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{s.emoji}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{s.nome}</p>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">{s.formato}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 italic mb-1">{s.gancho}</p>
              <p className="text-xs text-gray-400 mb-3">{s.hashtags}</p>
              <button onClick={() => usarSugestao(s)}
                className="w-full py-1.5 text-xs font-semibold text-[#0066CC] border border-[#0066CC] rounded-lg hover:bg-blue-50 transition-colors">
                Usar este modelo
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Ferramentas */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-4">🛠️ Ferramentas Configuradas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🎵', nome: 'CapCut', desc: 'Edição de vídeo com IA · Reels · TikTok · Shorts', status: 'Disponível', info: 'User ID: 7611692021371732993' },
            { icon: '🎬', nome: 'Seedance 2.0', desc: 'Geração de vídeo IA via CapCut · Cenas realistas', status: 'Disponível', info: 'Acesso via CapCut → AI Video' },
            { icon: '🤖', nome: 'HeyGen', desc: 'Avatares IA para vídeos · 5 apresentadores do Índio', status: 'Ativo', info: 'API Key configurada' },
          ].map(f => (
            <div key={f.nome} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{f.nome}</p>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">{f.status}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-1">{f.desc}</p>
              <p className="text-xs font-mono text-[#0066CC]">{f.info}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
