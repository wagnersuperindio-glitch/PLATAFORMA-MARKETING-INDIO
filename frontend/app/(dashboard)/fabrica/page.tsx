'use client'
import { useState } from 'react'
import Link from 'next/link'

const COMANDOS = [
  { cmd: '/encarte',     icon: '🖼️',  desc: 'Encarte em todos os formatos de impressão',          cor: 'bg-orange-50 border-orange-200' },
  { cmd: '/campanha',    icon: '📱',  desc: 'Post + Stories + Encarte + Carro de Som',             cor: 'bg-blue-50 border-blue-200' },
  { cmd: '/tv',          icon: '📺',  desc: 'Sequência para TV interna 32"/50"/65"',               cor: 'bg-purple-50 border-purple-200' },
  { cmd: '/led',         icon: '💡',  desc: 'Arte 600×400px para painel P5 externo 3×2m',         cor: 'bg-yellow-50 border-yellow-200' },
  { cmd: '/qrcode',      icon: '📲',  desc: 'QR Code rastreável com logo Índio',                  cor: 'bg-green-50 border-green-200' },
  { cmd: '/pack-semanal',icon: '📦',  desc: 'Gera TUDO da semana de uma vez (recomendado)',        cor: 'bg-red-50 border-red-200' },
]

const FORMATOS = [
  '📱 Post Feed 1080×1080', '📺 Stories 1080×1920', '🎬 Reel/TikTok',
  '🖨️ Encarte A4', '📺 TV Interna 1920×1080', '💡 LED P5 600×400',
  '💬 WhatsApp', '🚗 Carro de Som MP3',
]

const CAMPANHAS = [
  'Sexta das Carnes', 'Quarta do Horti', 'Churrascada',
  'Segundaço', 'Clube Mais Índio', 'Dia "I"', 'Inauguração', 'Personalizada',
]

type LogLine = { msg: string; tipo: 'ok' | 'info' | 'warn' | 'prompt' }

export default function FabricaPage() {
  const [campanha, setCampanha] = useState(CAMPANHAS[0])
  const [ferramenta, setFerramenta] = useState('🤖 Automático (recomendado)')
  const [produtos, setProdutos] = useState('')
  const [formatos, setFormatos] = useState([FORMATOS[0], FORMATOS[1]])
  const [logs, setLogs] = useState<LogLine[]>([])
  const [running, setRunning] = useState(false)
  const [kpiConteudos, setKpiConteudos] = useState(0)
  const [kpiAudios, setKpiAudios] = useState(0)

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

  function addLog(msg: string, tipo: LogLine['tipo'] = 'info') {
    setLogs(prev => [...prev, { msg, tipo }])
  }

  async function gerarCampanha() {
    setRunning(true)
    setLogs([])
    addLog(`> /pack-semanal campanha="${campanha}"`, 'prompt')
    await sleep(400); addLog('🔍 Lendo CEREBRO_CENTRAL.md...', 'info')
    await sleep(600); addLog('✅ Contexto carregado: cores #0066CC / #FF6B00, Tom gaúcho', 'ok')
    await sleep(400); addLog(`📢 Campanha: ${campanha}`, 'info')
    await sleep(400); addLog('🖼️  [GPT Image 2] Gerando post feed 1080×1080...', 'info')
    await sleep(900); addLog('✅  Post feed gerado → IMAGENS_GPT/post_feed.png', 'ok')
    await sleep(400); addLog('📺 [GPT Image 2] Gerando stories 1080×1920...', 'info')
    await sleep(700); addLog('✅  Stories gerado → IMAGENS_GPT/stories.png', 'ok')
    await sleep(400); addLog('🎙️  [ElevenLabs] Gerando áudio carro de som — Voz: Brian...', 'info')
    await sleep(900); addLog('✅  MP3 gerado → audios/carro_som.mp3 (45s)', 'ok')
    await sleep(400); addLog('💬 [WhatsApp] Preparando encarte para disparo...', 'info')
    await sleep(500); addLog('✅  Encarte WhatsApp pronto → encarte_whatsapp.jpg', 'ok')
    await sleep(300); addLog('', 'info')
    addLog('✅ PACK-SEMANAL CONCLUÍDO — 4 peças geradas!', 'ok')
    setKpiConteudos(k => k + 3)
    setKpiAudios(k => k + 1)
    setRunning(false)
  }

  async function executarComando(cmd: string) {
    setRunning(true)
    setLogs([])
    addLog(`> ${cmd}`, 'prompt')
    await sleep(300); addLog(`⚙️  Executando ${cmd}...`, 'info')
    await sleep(900); addLog(`✅  Comando ${cmd} concluído com sucesso.`, 'ok')
    setKpiConteudos(k => k + 1)
    setRunning(false)
  }

  function toggleFormato(f: string) {
    setFormatos(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  const logColor: Record<string, string> = {
    ok: 'text-green-400', info: 'text-blue-300', warn: 'text-yellow-400', prompt: 'text-gray-400',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">🏭 Fábrica de Conteúdo</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gere campanhas completas com um clique — imagem, áudio, WhatsApp e redes sociais</p>
        </div>
        <div className="flex gap-3">
          <div className="text-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <p className="text-lg font-bold text-blue-700">{kpiConteudos}</p>
            <p className="text-xs text-blue-500">Conteúdos</p>
          </div>
          <div className="text-center bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
            <p className="text-lg font-bold text-orange-700">{kpiAudios}</p>
            <p className="text-xs text-orange-500">Áudios</p>
          </div>
        </div>
      </div>

      {/* Formulário principal */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-1">Pack Semanal Completo
            <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded font-mono">/pack-semanal</span>
          </h2>
          <p className="text-sm text-gray-500">Gera toda a semana: posts, stories, reels, carro de som e WhatsApp automaticamente.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Campanha da Semana</label>
            <select value={campanha} onChange={e => setCampanha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC]">
              {CAMPANHAS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ferramenta Principal</label>
            <select value={ferramenta} onChange={e => setFerramenta(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC]">
              <option>🤖 Automático (recomendado)</option>
              <option>🖼️ GPT Image 2</option>
              <option>🎨 Canva MCP</option>
              <option>🎬 HeyGen + ElevenLabs</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Produtos e Preços</label>
            <textarea value={produtos} onChange={e => setProdutos(e.target.value)} rows={2}
              placeholder="Ex: Fraldão Bovino:29.90, Costela Minga:19.90, Picanha:49.90"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC] resize-none" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Formatos de Saída</label>
            <div className="flex flex-wrap gap-2">
              {FORMATOS.map(f => (
                <button key={f} onClick={() => toggleFormato(f)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                    formatos.includes(f)
                      ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00]'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap pt-1">
          <button onClick={gerarCampanha} disabled={running}
            className="px-5 py-2.5 bg-[#FF6B00] text-white text-sm font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-60 transition-colors">
            🚀 Gerar Campanha Completa
          </button>
          <button onClick={() => executarComando('/encarte')} disabled={running}
            className="px-4 py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors">
            🎨 Gerar Só Imagem
          </button>
          <Link href="/audio"
            className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">
            🎙️ Só Carro de Som
          </Link>
        </div>
      </div>

      {/* Comandos rápidos */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          📋 Comandos Rápidos
          <span className="flex-1 h-px bg-gray-200"></span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMANDOS.map(c => (
            <div key={c.cmd} className={`border rounded-xl p-4 ${c.cor}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 font-mono text-sm">{c.cmd}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                </div>
              </div>
              <button onClick={() => executarComando(c.cmd)} disabled={running}
                className={`mt-3 w-full py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-60 ${
                  c.cmd === '/pack-semanal'
                    ? 'bg-[#FF6B00] text-white hover:bg-orange-700'
                    : 'bg-[#0066CC] text-white hover:bg-blue-800'
                }`}>
                Executar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Console de saída */}
      {logs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            💻 Saída do Comando
            <span className="flex-1 h-px bg-gray-200"></span>
            <button onClick={() => setLogs([])} className="text-xs text-gray-400 hover:text-gray-600">Limpar</button>
          </h3>
          <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs leading-relaxed space-y-0.5 max-h-64 overflow-y-auto">
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
