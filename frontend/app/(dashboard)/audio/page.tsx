'use client'
import { useState } from 'react'

const ROTAS = [
  { nome: 'Operador 1 — Guaíba + Eldorado', desc: 'Rota completa segunda, quarta e sexta', lojas: ['Matriz Guaíba', 'Filial Centro Guaíba', 'Eldorado do Sul'] },
  { nome: 'Operador 2 — Região Carbonífera', desc: 'São Jerônimo, Arroio dos Ratos, Charqueadas', lojas: ['São Jerônimo', 'Arroio dos Ratos', 'Charqueadas 1', 'Charqueadas 2'] },
]

const ESTRUTURA = [
  { tag: '[CHAMADA]',     exemplo: '"Atenção clientes do Supermercados Índio!"',          cor: 'text-blue-400' },
  { tag: '[PRODUTO]',     exemplo: '"[Nome] por apenas R$[preço] o quilo/unidade!"',      cor: 'text-green-400' },
  { tag: '[REFORÇO]',     exemplo: '"[Frase emocional gaúcha — ex: É hoje! Aproveita!]"', cor: 'text-yellow-400' },
  { tag: '[CTA]',         exemplo: '"Corre pro Índio mais perto de você!"',               cor: 'text-orange-400' },
  { tag: '[ASSINATURA]',  exemplo: '"Supermercados Índio — O Índio é de casa!"',          cor: 'text-purple-400' },
]

type LogLine = { msg: string; tipo: 'ok' | 'info' | 'warn' | 'prompt' }

export default function AudioPage() {
  const [tipoAudio, setTipoAudio] = useState('🚗 Carro de Som (30–60s)')
  const [produto, setProduto] = useState('')
  const [preco, setPreco] = useState('')
  const [roteiro, setRoteiro] = useState('')
  const [logs, setLogs] = useState<LogLine[]>([])
  const [running, setRunning] = useState(false)
  const [kpiAudios, setKpiAudios] = useState(0)

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
  function addLog(msg: string, tipo: LogLine['tipo'] = 'info') {
    setLogs(prev => [...prev, { msg, tipo }])
  }

  function gerarRoteiroAuto() {
    const p = produto || 'Produto em destaque'
    const pr = preco || 'R$XX,XX'
    setRoteiro(`Atenção clientes do Supermercados Índio!\n${p} por apenas ${pr} o quilo!\nÉ hoje! Aproveita!\nCorre pro Índio mais perto de você!\nSupermercados Índio — O Índio é de casa!`)
  }

  async function gerarAudio() {
    setRunning(true)
    setLogs([])
    addLog(`> /audio tipo="${tipoAudio}" produto="${produto || 'não informado'}"`, 'prompt')
    await sleep(300); addLog('🎙️  [ElevenLabs] Voz: Brian | eleven_multilingual_v2', 'info')
    await sleep(400); addLog('⚙️  Processando texto em português...', 'info')
    await sleep(900); addLog('✅  MP3 gerado → audios/carro_som_' + Date.now() + '.mp3 (45s)', 'ok')
    await sleep(200); addLog('📊  Qualidade: 44.1kHz · Stereo · 128kbps', 'info')
    addLog('✅  Pronto para reprodução no carro de som / loja!', 'ok')
    setKpiAudios(k => k + 1)
    setRunning(false)
  }

  const logColor: Record<string, string> = {
    ok: 'text-green-400', info: 'text-blue-300', warn: 'text-yellow-400', prompt: 'text-gray-400',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">🎙️ Áudio & Carro de Som</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gere locuções com ElevenLabs — Carro de Som · Anúncio Interno · Spot Rádio · Narração</p>
        </div>
        <div className="text-center bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
          <p className="text-lg font-bold text-orange-700">{kpiAudios}</p>
          <p className="text-xs text-orange-500">Áudios gerados</p>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-700">Gerar Novo Áudio</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo de Áudio</label>
            <select value={tipoAudio} onChange={e => setTipoAudio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC]">
              <option>🚗 Carro de Som (30–60s)</option>
              <option>🏪 Anúncio Interno de Loja (15–30s)</option>
              <option>📻 Spot para Rádio (30s)</option>
              <option>🎬 Narração de Vídeo</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Voz</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC]">
              <option>Brian — Locutor de Varejo (padrão)</option>
              <option>Charlotte — Voz feminina</option>
              <option>Daniel — Voz grave</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Produto Principal</label>
            <input type="text" value={produto} onChange={e => setProduto(e.target.value)}
              placeholder="Ex: Fraldão Bovino"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preço</label>
            <input type="text" value={preco} onChange={e => setPreco(e.target.value)}
              placeholder="Ex: R$29,90 o quilo"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC]" />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Roteiro Completo</label>
            <textarea value={roteiro} onChange={e => setRoteiro(e.target.value)} rows={5}
              placeholder="Escreva o roteiro aqui ou clique em 'Gerar Roteiro Automático'..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC] resize-none" />
          </div>
        </div>

        {/* Estrutura padrão */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Estrutura Padrão — Carro de Som Índio</p>
          <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs space-y-1">
            {ESTRUTURA.map(e => (
              <div key={e.tag} className="flex gap-2">
                <span className={`${e.cor} font-bold w-28 flex-shrink-0`}>{e.tag}</span>
                <span className="text-gray-300">{e.exemplo}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap pt-1">
          <button onClick={gerarAudio} disabled={running}
            className="px-5 py-2.5 bg-[#FF6B00] text-white text-sm font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-60 transition-colors">
            🎙️ Gerar Áudio MP3
          </button>
          <button onClick={gerarRoteiroAuto}
            className="px-4 py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors">
            ✍️ Gerar Roteiro Automático
          </button>
        </div>
      </div>

      {/* Rotas de carro de som */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          🚗 Rotas de Carro de Som
          <span className="flex-1 h-px bg-gray-200"></span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROTAS.map(rota => (
            <div key={rota.nome} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">🗺️</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{rota.nome}</p>
                  <p className="text-xs text-gray-500">{rota.desc}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {rota.lojas.map(l => (
                  <span key={l} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-medium">{l}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Ver Rota
                </button>
                <button onClick={gerarAudio} disabled={running}
                  className="flex-1 py-1.5 text-xs font-semibold text-white bg-[#0066CC] rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors">
                  🎙️ Gerar Áudio p/ Rota
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Console */}
      {logs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            💻 Saída
            <span className="flex-1 h-px bg-gray-200"></span>
            <button onClick={() => setLogs([])} className="text-xs text-gray-400 hover:text-gray-600">Limpar</button>
          </h3>
          <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs leading-relaxed space-y-0.5 max-h-48 overflow-y-auto">
            {logs.map((l, i) => (
              <div key={i} className={logColor[l.tipo] || 'text-gray-300'}>{l.msg || <>&nbsp;</>}</div>
            ))}
            {running && <div className="text-gray-400 animate-pulse">▌</div>}
          </div>
        </div>
      )}

      {/* Config ElevenLabs */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-3">⚙️ Configuração ElevenLabs</h2>
        <div className="divide-y divide-gray-100">
          {[
            ['API', 'ElevenLabs v1'],
            ['Voice ID (Brian)', 'nPczCjzI2devNBz1zQrb'],
            ['Modelo', 'eleven_multilingual_v2'],
            ['Endpoint', 'POST /api/audio/elevenlabs'],
            ['Tom padrão', 'Gaúcho · Próximo · Animado'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="font-mono text-xs text-[#0066CC] font-semibold">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
