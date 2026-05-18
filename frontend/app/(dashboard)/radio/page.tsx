'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Track = {
  id: string
  type: string
  title: string
  mood: string
  period: string
  license: string
  url: string
}

type ScheduleItem = {
  time: string
  type: string
  title: string
  meta: string
  url?: string
}

type Campaign = {
  brand: string
  name: string
  channel: string
  insertions: number
  status: string
}

// ─── Biblioteca padrão ────────────────────────────────────────────────────────
const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { time: '08:00', type: 'Música',          title: 'Ambiente Manhã — Demo Local',  meta: 'Leve, família, padaria, café',         url: '/radio-media/ambiente-manha.wav' },
  { time: '08:12', type: 'Vinheta',          title: 'Vinheta Rádio Índio',          meta: 'Assinatura sonora da marca',            url: '/radio-media/vinheta-radio-indio.wav' },
  { time: '08:18', type: 'Spot próprio',     title: 'Teste Locutor Índio',          meta: 'Locução comercial — oferta da semana',  url: '/radio-media/teste-locutor-indio.mp3' },
  { time: '08:28', type: 'Jingle',           title: 'No Índio a Gente',             meta: 'Jingle da marca',                       url: '/radio-media/jingle-no-indio-a-gente.mp3' },
  { time: '08:40', type: 'Música',          title: 'Ambiente Pico — Demo Local',   meta: 'Popular moderado, energia, fila',       url: '/radio-media/ambiente-pico.wav' },
  { time: '08:55', type: 'Jingle',           title: 'Tribo Super Índio',            meta: 'Jingle da marca',                       url: '/radio-media/jingle-tribo-super-indio.mp3' },
  { time: '09:10', type: 'Música',          title: 'Ambiente Tarde — Demo Local',  meta: 'Calma, compras longas',                 url: '/radio-media/ambiente-tarde.wav' },
]

const DEFAULT_CAMPAIGNS: Campaign[] = [
  { brand: 'PAN',            name: 'Biscoitos PAN — Junho',     channel: 'Rádio + TV + LED', insertions: 8,  status: 'Vendido'  },
  { brand: 'Açougue Índio',  name: 'Oferta da semana',          channel: 'Rádio + TV',       insertions: 10, status: 'Ativo'    },
  { brand: 'Clube de Ofertas', name: 'Cadastro via QR Code',    channel: 'Rádio',            insertions: 6,  status: 'Produção' },
]

const STATUS_COLOR: Record<string, string> = {
  'Vendido':  'bg-green-100 text-green-700',
  'Ativo':    'bg-blue-100 text-blue-700',
  'Produção': 'bg-yellow-100 text-yellow-700',
  'Proposta': 'bg-gray-100 text-gray-600',
}

const TYPE_ICON: Record<string, string> = {
  'Música': '🎵', 'Vinheta': '📻', 'Spot próprio': '🎙️',
  'Jingle': '🎶', 'Institucional': '🏪', 'Fornecedor': '🤝',
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function RadioPage() {
  const [activeTab, setActiveTab] = useState<'player' | 'grade' | 'trade' | 'producao'>('player')
  const [playing, setPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [volume, setVolume] = useState(68)
  const [playCount, setPlayCount] = useState(128)
  const [schedule, setSchedule] = useState<ScheduleItem[]>(DEFAULT_SCHEDULE)
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEFAULT_CAMPAIGNS)
  const [libraryStatus, setLibraryStatus] = useState('Biblioteca demo pronta. Clique Play para iniciar.')
  const [streamInput, setStreamInput] = useState('')
  const [spotPrompt, setSpotPrompt] = useState('Oferta de costela bovina a R$ 29,90 o kg, válida hoje em todas as lojas do Supermercado Índio. Tom animado, popular e direto.')
  const [spotOutput, setSpotOutput] = useState('')
  const [assetType, setAssetType] = useState('spot')
  const [assetCampaign, setAssetCampaign] = useState('Sexta das Carnes')
  const [assetOffer, setAssetOffer] = useState('Costela bovina kg por R$ 29,90 hoje')
  const [assetDuration, setAssetDuration] = useState('30 segundos')
  const [assetOutput, setAssetOutput] = useState('Aguardando briefing.')
  const [newCampaign, setNewCampaign] = useState({ brand: '', name: '', channel: 'Rádio', insertions: 8 })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const synthTimerRef = useRef<NodeJS.Timeout | null>(null)

  const current = schedule[currentIndex]

  // ── Boot: carrega biblioteca local ──
  useEffect(() => {
    if (typeof window === 'undefined') return
    fetch('/radio-media/library.json', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const tracks: Track[] = data.tracks || []
        const built: ScheduleItem[] = tracks.map((t, i) => ({
          time: `${String(8 + Math.floor(i / 3)).padStart(2, '0')}:${String((i % 3) * 12).padStart(2, '0')}`,
          type: t.type === 'music' ? 'Música' : t.type.charAt(0).toUpperCase() + t.type.slice(1),
          title: t.title,
          meta: `${t.mood} — ${t.license}`,
          url: `/radio-media/${t.url.replace('media/', '')}`,
        }))
        setSchedule(built)
        setLibraryStatus(`Biblioteca carregada: ${tracks.length} áudios prontos para tocar.`)
      })
      .catch(() => setLibraryStatus('Usando grade padrão da rádio.'))
  }, [])

  // ── Sincroniza volume no elemento audio ──
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100
  }, [volume])

  // ── Para áudio ao desmontar ──
  useEffect(() => {
    return () => {
      if (synthTimerRef.current) clearInterval(synthTimerRef.current)
      audioRef.current?.pause()
    }
  }, [])

  const stopAudio = useCallback(() => {
    if (synthTimerRef.current) { clearInterval(synthTimerRef.current); synthTimerRef.current = null }
    audioRef.current?.pause()
  }, [])

  const startAudio = useCallback((trackUrl?: string) => {
    stopAudio()
    const url = trackUrl || current?.url
    if (!url || !audioRef.current) {
      // fallback: tom sintético
      try {
        audioCtxRef.current ||= new (window.AudioContext || (window as any).webkitAudioContext)()
        const notes = [196, 246.94, 293.66, 329.63, 392]
        let step = 0
        synthTimerRef.current = setInterval(() => {
          const ctx = audioCtxRef.current!
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.value = notes[step % notes.length]
          gain.gain.value = volume / 1000
          osc.connect(gain); gain.connect(ctx.destination)
          osc.start()
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28)
          osc.stop(ctx.currentTime + 0.3)
          step++
        }, 360)
      } catch {}
      return
    }
    audioRef.current.src = url
    audioRef.current.volume = volume / 100
    audioRef.current.play().catch(() => {
      setLibraryStatus('Clique Play novamente para liberar o áudio (política do navegador).')
    })
  }, [current, volume, stopAudio])

  function togglePlay() {
    if (playing) {
      stopAudio()
      setPlaying(false)
    } else {
      startAudio()
      setPlaying(true)
    }
  }

  function nextTrack() {
    setCurrentIndex(i => {
      const next = (i + 1) % schedule.length
      if (playing) startAudio(schedule[next]?.url)
      return next
    })
    setPlayCount(c => c + 1)
  }

  function loadStream() {
    if (!streamInput.trim() || !audioRef.current) return
    audioRef.current.src = streamInput.trim()
    if (playing) audioRef.current.play().catch(() => {})
  }

  function generateSpot() {
    const base = spotPrompt.trim() || 'Oferta especial do Supermercado Índio.'
    setSpotOutput([
      'VERSÃO CURTA:\nAtenção, cliente Índio! Hoje tem oferta especial esperando por você: ' + base,
      'VERSÃO ANIMADA:\nPassou no Índio, economizou de verdade! Aproveite agora essa oferta e garanta o melhor para sua família.',
      'VERSÃO INSTITUCIONAL:\nSupermercado Índio, perto de você, com preço, qualidade e ofertas para o dia a dia.',
    ].join('\n\n'))
  }

  function buildProductionFlow(e: React.FormEvent) {
    e.preventDefault()
    const spotText = `Atenção, clientes do Supermercado Índio! ${assetOffer}. É hoje, é por tempo limitado. Corre pro Índio mais perto de você. Supermercado Índio, o Índio é de casa!`
    const sunoPrompt = `Jingle curto para supermercado regional gaúcho. Campanha: ${assetCampaign}. Mensagem: ${assetOffer}. Estilo animado, familiar, memorável, varejo popular, duração ${assetDuration}. Assinatura: O Índio é de casa.`
    setAssetOutput([
      `Material: ${assetType}  |  Campanha: ${assetCampaign}  |  Duração: ${assetDuration}`,
      '',
      '1. TEXTO PARA LOCUÇÃO:',
      spotText,
      '',
      '2. API ElevenLabs:',
      'POST /api/audio/elevenlabs com ELEVENLABS_API_KEY',
      'voice_id: nPczCjzI2devNBz1zQrb  |  model: eleven_multilingual_v2',
      '',
      assetType === 'jingle' ? '3. PROMPT SUNO:' : '3. PUBLICAÇÃO:',
      assetType === 'jingle' ? sunoPrompt : 'Salvar MP3, marcar como "aguardando aprovação", publicar na grade.',
      '',
      '4. APROVAÇÃO:',
      'Marketing ouve, aprova, e o player da loja baixa no próximo cache.',
    ].join('\n'))
  }

  function addCampaign(e: React.FormEvent) {
    e.preventDefault()
    setCampaigns(c => [{ ...newCampaign, status: 'Proposta' }, ...c])
    setNewCampaign({ brand: '', name: '', channel: 'Rádio', insertions: 8 })
  }

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <audio ref={audioRef} onEnded={nextTrack} onError={nextTrack} preload="none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">📻 Rádio Super Índio</h1>
          <p className="text-sm text-gray-500 mt-0.5">Indoor Media — controle de programação das lojas</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${playing ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="text-xs font-medium text-gray-600">{playing ? 'No ar' : 'Pausado'}</span>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Inserções hoje', value: playCount, icon: '📡', color: 'text-blue-600' },
          { label: 'Lojas online',   value: '4/10',    icon: '🏪', color: 'text-green-600' },
          { label: 'Campanhas ativas', value: campaigns.filter(c => c.status === 'Ativo').length, icon: '📣', color: 'text-orange-600' },
          { label: 'Receita potencial', value: 'R$ 18,4k', icon: '💰', color: 'text-purple-600' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl">{m.icon}</span>
              <span className={`text-2xl font-bold ${m.color}`}>{m.value}</span>
            </div>
            <p className="text-xs text-gray-500">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['player', 'grade', 'trade', 'producao'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-white text-[#0066CC] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab === 'player' ? '▶ Player' : tab === 'grade' ? '📋 Grade' : tab === 'trade' ? '🤝 Trade' : '🎙️ Produção'}
          </button>
        ))}
      </div>

      {/* ── TAB PLAYER ── */}
      {activeTab === 'player' && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Player principal */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Tocando agora</p>
                <h3 className="font-bold text-gray-900 mt-0.5">{current?.title || '—'}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{current?.type} — {current?.meta}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${playing ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {playing ? '● No ar' : '○ Parado'}
              </span>
            </div>

            {/* Botões de controle */}
            <div className="flex items-center gap-3 justify-center">
              <button onClick={nextTrack}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
                ⏭
              </button>
              <button onClick={togglePlay}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all shadow-lg ${
                  playing
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-[#0066CC] hover:bg-[#0052A3]'
                }`}>
                {playing ? '⏸' : '▶'}
              </button>
              <button onClick={() => { stopAudio(); setPlaying(false); setCurrentIndex(0) }}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
                ⏹
              </button>
            </div>

            {/* Volume */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600">🔊 Volume da loja</label>
                <span className="text-xs font-bold text-[#0066CC]">{volume}%</span>
              </div>
              <input type="range" min="0" max="100" value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                className="w-full accent-[#0066CC]" />
            </div>

            {/* Stream URL */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">URL do stream (futuro)</label>
              <div className="flex gap-2">
                <input type="url" value={streamInput} onChange={e => setStreamInput(e.target.value)}
                  placeholder="https://.../radio.mp3"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent" />
                <button onClick={loadStream}
                  className="px-3 py-2 bg-[#0066CC] text-white text-sm rounded-lg hover:bg-[#0052A3] transition-colors">
                  Carregar
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <p className="text-xs text-blue-700">{libraryStatus}</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-2">
              <p className="text-xs text-amber-700">🔒 Player de loja: sem permissão para editar grade ou remover anúncios. Controle fica na matriz.</p>
            </div>
          </div>

          {/* Grade do dia */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Grade de programação</h3>
              <button onClick={nextTrack}
                className="text-xs text-[#0066CC] hover:underline">
                Avançar faixa →
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {schedule.map((item, i) => (
                <div key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    i === currentIndex
                      ? 'bg-[#0066CC] text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                  <span className="text-xs font-mono w-12 shrink-0">{item.time}</span>
                  <span className="text-base">{TYPE_ICON[item.type] || '🎵'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${i === currentIndex ? 'text-white' : 'text-gray-900'}`}>
                      {item.title}
                    </p>
                    <p className={`text-xs truncate ${i === currentIndex ? 'text-blue-100' : 'text-gray-400'}`}>
                      {item.type}
                    </p>
                  </div>
                  {i === currentIndex && playing && (
                    <span className="text-xs animate-pulse">●</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB GRADE ── */}
      {activeTab === 'grade' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Regras de programação</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Regra musical',    desc: '3 a 5 músicas entre blocos comerciais para não cansar cliente nem equipe.' },
              { title: 'Repetição',        desc: 'Mesmo spot não repete muito próximo. Controlar intervalo mínimo por loja e campanha.' },
              { title: 'Prioridade',       desc: 'Urgente, alta, normal e baixa. Oferta relâmpago supera campanha comum.' },
              { title: 'Horário inteligente', desc: 'Padaria de manhã, açougue perto do almoço, hortifrúti no giro de reposição.' },
              { title: 'Obrigatórios',     desc: 'Campanhas institucionais, avisos internos, Clube de Ofertas, QR Codes e segurança.' },
              { title: 'Cache offline',    desc: 'Player baixa próximos áudios e mantém a loja tocando se a internet oscilar.' },
            ].map(r => (
              <div key={r.title} className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-sm text-gray-900 mb-1">{r.title}</p>
                <p className="text-xs text-gray-500">{r.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <h4 className="font-semibold text-sm text-gray-900 mb-3">Tipos de playlist por horário</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { period: 'Manhã',       desc: 'leve, família, padaria, café',         color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                { period: 'Pico',        desc: 'popular moderado, energia, fila',       color: 'bg-orange-50 border-orange-200 text-orange-700' },
                { period: 'Tarde',       desc: 'ambiente, compras longas',              color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { period: 'Fechamento',  desc: 'mais calmo, avisos e limpeza',          color: 'bg-purple-50 border-purple-200 text-purple-700' },
                { period: 'Sazonal',     desc: 'Natal, Semana Farroupilha, Páscoa',     color: 'bg-green-50 border-green-200 text-green-700' },
              ].map(p => (
                <div key={p.period} className={`border rounded-lg px-3 py-2 ${p.color}`}>
                  <p className="text-xs font-bold">{p.period}</p>
                  <p className="text-xs opacity-80">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB TRADE ── */}
      {activeTab === 'trade' && (
        <div className="space-y-5">
          {/* Resumo trade */}
          <div className="bg-gradient-to-r from-[#0066CC] to-purple-600 rounded-xl p-5 text-white">
            <p className="text-sm font-semibold mb-1">💰 Transformar loja em canal de mídia</p>
            <p className="text-blue-100 text-xs">O maior valor não está só na música — está em vender rádio, TV e LED para marcas no momento que o cliente decide a compra.</p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { canal: 'Rádio', freq: '8x/dia', tipo: 'Spot 15s' },
                { canal: 'TV',    freq: '12x/dia', tipo: 'Vídeo 10s' },
                { canal: 'LED',   freq: '20x/dia', tipo: 'Card de oferta' },
              ].map(p => (
                <div key={p.canal} className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-blue-200">{p.canal}</p>
                  <p className="font-bold">{p.freq}</p>
                  <p className="text-xs text-blue-100">{p.tipo}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabela de campanhas */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Campanhas de fornecedores</h3>
              <span className="text-xs text-gray-400">{campaigns.length} cadastradas</span>
            </div>
            <div className="divide-y divide-gray-50">
              {campaigns.map((c, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.brand} · {c.channel}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{c.insertions}x/dia</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[c.status] || 'bg-gray-100 text-gray-500'}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="w-20 shrink-0">
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-1.5 bg-[#0066CC] rounded-full"
                        style={{ width: `${Math.min(100, c.insertions * 9)}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 text-right">{Math.min(100, c.insertions * 9)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adicionar campanha */}
          <form onSubmit={addCampaign} className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">+ Adicionar campanha de fornecedor</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Marca / Fornecedor</label>
                <input value={newCampaign.brand} onChange={e => setNewCampaign(n => ({ ...n, brand: e.target.value }))}
                  placeholder="Ex: PAN, Nestlé, Seara"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Nome da campanha</label>
                <input value={newCampaign.name} onChange={e => setNewCampaign(n => ({ ...n, name: e.target.value }))}
                  placeholder="Ex: Biscoitos PAN — Julho"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Canal</label>
                <select value={newCampaign.channel} onChange={e => setNewCampaign(n => ({ ...n, channel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent">
                  <option>Rádio + TV + LED</option>
                  <option>Rádio</option>
                  <option>TV Indoor</option>
                  <option>Painel de LED</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Inserções por dia</label>
                <input type="number" min="1" value={newCampaign.insertions}
                  onChange={e => setNewCampaign(n => ({ ...n, insertions: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent" />
              </div>
            </div>
            <button type="submit"
              className="mt-4 px-5 py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-lg hover:bg-[#0052A3] transition-colors">
              Adicionar campanha
            </button>
          </form>
        </div>
      )}

      {/* ── TAB PRODUÇÃO ── */}
      {activeTab === 'producao' && (
        <div className="space-y-5">
          {/* Fluxo de produção */}
          <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { step: '1', title: 'Briefing',   desc: 'Produto, preço, lojas, canal, tom, duração' },
              { step: '2', title: 'Texto',       desc: 'Claude gera curta, animada e institucional' },
              { step: '3', title: 'Voz',         desc: 'ElevenLabs converte texto em áudio MP3' },
              { step: '4', title: 'Jingle',      desc: 'Suno gera letra e prompt musical' },
              { step: '5', title: 'Aprovação',   desc: 'Marketing ouve e aprova antes de publicar' },
              { step: '6', title: 'Publicação',  desc: 'Entra na grade e baixa nos players das lojas' },
            ].map(s => (
              <div key={s.step} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="w-7 h-7 rounded-full bg-[#0066CC] text-white text-xs font-bold flex items-center justify-center mx-auto mb-2">
                  {s.step}
                </div>
                <p className="text-xs font-semibold text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Gerador de spot (texto) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">🎙️ Gerador de spot — texto</h3>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Briefing da oferta</label>
                <textarea value={spotPrompt} onChange={e => setSpotPrompt(e.target.value)} rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent resize-none" />
              </div>
              <button onClick={generateSpot}
                className="w-full py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-lg hover:bg-[#0052A3] transition-colors">
                ✨ Gerar 3 versões de texto
              </button>
              {spotOutput && (
                <pre className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {spotOutput}
                </pre>
              )}
            </div>

            {/* Gerador de material completo */}
            <form onSubmit={buildProductionFlow} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">🎬 Fluxo de produção completo</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Tipo de material</label>
                  <select value={assetType} onChange={e => setAssetType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent">
                    <option value="spot">Spot de oferta</option>
                    <option value="aviso">Aviso interno</option>
                    <option value="jingle">Jingle</option>
                    <option value="vinheta">Vinheta</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Duração</label>
                  <select value={assetDuration} onChange={e => setAssetDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent">
                    <option>15 segundos</option>
                    <option>30 segundos</option>
                    <option>45 segundos</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Produto / campanha</label>
                <input value={assetCampaign} onChange={e => setAssetCampaign(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Oferta ou mensagem</label>
                <input value={assetOffer} onChange={e => setAssetOffer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent" />
              </div>
              <button type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-[#0066CC] to-purple-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
                🚀 Gerar fluxo de produção
              </button>
              {assetOutput !== 'Aguardando briefing.' && (
                <pre className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {assetOutput}
                </pre>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
