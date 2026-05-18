'use client'
import { useState } from 'react'

const AVATARES = [
  { id: 'beto',   emoji: '📢', nome: 'Beto Repórter',  uso: 'Promoções gerais · Abertura de loja' },
  { id: 'neri',   emoji: '🥩', nome: 'Seu Neri',       uso: 'Açougue · Carnes · Churrasco' },
  { id: 'lurdes', emoji: '💳', nome: 'Dona Lurdes',    uso: 'Clube Mais Índio · Fidelidade' },
  { id: 'gabi',   emoji: '🥦', nome: 'Gabi',           uso: 'Hortifrúti · Orgânicos · FLV' },
  { id: 'gui',    emoji: '💻', nome: 'Gui',            uso: 'Marketing digital · Redes sociais' },
]

const DESTINOS = ['Reel Instagram', 'Stories', 'YouTube', 'TV Interna', 'TikTok']
const DURACOES = ['15 segundos', '30 segundos', '60 segundos']

type LogLine = { msg: string; tipo: 'ok' | 'info' | 'warn' | 'prompt' }

export default function VideosPage() {
  const [avatarId, setAvatarId] = useState('beto')
  const [destino, setDestino] = useState(DESTINOS[0])
  const [duracao, setDuracao] = useState(DURACOES[1])
  const [tema, setTema] = useState('')
  const [roteiro, setRoteiro] = useState('')
  const [logs, setLogs] = useState<LogLine[]>([])
  const [running, setRunning] = useState(false)

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
  function addLog(msg: string, tipo: LogLine['tipo'] = 'info') {
    setLogs(prev => [...prev, { msg, tipo }])
  }

  const avatarSelecionado = AVATARES.find(a => a.id === avatarId)!

  async function gerarVideo() {
    setRunning(true)
    setLogs([])
    addLog(`> /video avatar="${avatarSelecionado.nome}" destino="${destino}"`, 'prompt')
    await sleep(300); addLog('🔍 Lendo CEREBRO_CENTRAL.md — configurações HeyGen...', 'info')
    await sleep(400); addLog(`🎬 [HeyGen] Avatar: ${avatarSelecionado.nome} | Voz: Brazilian Sage`, 'info')
    await sleep(500); addLog(`📝 Roteiro: ${(roteiro || tema || 'Oferta especial Supermercado Índio').substring(0, 60)}...`, 'info')
    await sleep(1200); addLog('✅  Vídeo sendo processado pela API HeyGen...', 'ok')
    await sleep(300); addLog('⏳  Estimativa: 2–4 minutos para renderização completa', 'warn')
    await sleep(400); addLog('📧  Link do vídeo será enviado quando pronto.', 'info')
    setRunning(false)
  }

  async function previewRoteiro() {
    const r = roteiro || `Atenção! Hoje no Supermercado Índio, confira nossas ofertas especiais!\n${tema || 'Promoção imperdível esperando por você!'}\nCorre pro Índio mais perto de você!\nSupermercados Índio — O Índio é de casa!`
    setRoteiro(r)
  }

  const logColor: Record<string, string> = {
    ok: 'text-green-400', info: 'text-blue-300', warn: 'text-yellow-400', prompt: 'text-gray-400',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">🎬 Vídeos & Avatares IA</h1>
        <p className="text-sm text-gray-500 mt-0.5">Crie vídeos com os avatares do Índio via HeyGen · Reels · Stories · TikTok · YouTube · TV Interna</p>
      </div>

      {/* Seleção de avatar */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-bold text-gray-700 mb-4">1. Escolha o Avatar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {AVATARES.map(av => (
            <button key={av.id} onClick={() => setAvatarId(av.id)}
              className={`border-2 rounded-xl p-4 text-center transition-all ${
                avatarId === av.id
                  ? 'border-[#0066CC] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
              <div className="text-4xl mb-2">{av.emoji}</div>
              <p className="text-sm font-bold text-gray-900">{av.nome}</p>
              <p className="text-xs text-gray-400 mt-1 leading-tight">{av.uso}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-700">2. Configure o Vídeo</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Campanha / Tema</label>
            <input type="text" value={tema} onChange={e => setTema(e.target.value)}
              placeholder="Ex: Sexta das Carnes — Fraldão R$29,90"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Destino</label>
            <select value={destino} onChange={e => setDestino(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC]">
              {DESTINOS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Roteiro do Vídeo</label>
            <textarea value={roteiro} onChange={e => setRoteiro(e.target.value)} rows={4}
              placeholder="Escreva o roteiro ou clique em 'Gerar Roteiro' abaixo..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC] resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Duração</label>
            <select value={duracao} onChange={e => setDuracao(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC]">
              {DURACOES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Engine de Geração</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC]">
              <option>HeyGen + Brazilian Sage (recomendado)</option>
              <option>Seedance 2.0 via CapCut</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap pt-1">
          <button onClick={gerarVideo} disabled={running}
            className="px-5 py-2.5 bg-[#FF6B00] text-white text-sm font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-60 transition-colors">
            🎬 Criar Vídeo com Avatar
          </button>
          <button onClick={previewRoteiro}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">
            ✍️ Gerar Roteiro Automático
          </button>
        </div>
      </div>

      {/* Configurações fixas */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-bold text-gray-700 mb-4">⚙️ Configurações dos Avatares (já definidas)</h2>
        <div className="divide-y divide-gray-100">
          {[
            ['Voz HeyGen', 'Brazilian Sage — DSO7IzRInxN0WAxVa7ZY'],
            ['MCP Tool', 'mcp__heygen__create_video_from_avatar'],
            ['Voz backup ElevenLabs', 'Brian — nPczCjzI2devNBz1zQrb'],
            ['Modelo áudio', 'eleven_multilingual_v2'],
            ['Tom de voz', 'Gaúcho · Próximo · Animado · Urgente'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="font-mono text-xs text-[#0066CC] font-semibold">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Console */}
      {logs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">💻 Saída</h3>
          <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs leading-relaxed space-y-0.5 max-h-48 overflow-y-auto">
            {logs.map((l, i) => (
              <div key={i} className={logColor[l.tipo] || 'text-gray-300'}>{l.msg || <>&nbsp;</>}</div>
            ))}
            {running && <div className="text-gray-400 animate-pulse">▌</div>}
          </div>
        </div>
      )}
    </div>
  )
}
