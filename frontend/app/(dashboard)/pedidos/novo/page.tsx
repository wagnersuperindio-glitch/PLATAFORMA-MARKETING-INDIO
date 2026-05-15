'use client'
// Portal de Pedidos — o time de marketing pede conteúdo aqui
// O agente Claude processa automaticamente
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Product = { name: string; price: string }

const tiposArte = [
  { value: 'ENCARTE',   label: 'Encarte de Ofertas', icon: '🛒' },
  { value: 'POST',      label: 'Post para Feed',      icon: '📸' },
  { value: 'STORY',     label: 'Story',               icon: '📱' },
  { value: 'REELS',     label: 'Reels / Vídeo',       icon: '🎬' },
  { value: 'WHATSAPP',  label: 'Mensagem WhatsApp',   icon: '💬' },
  { value: 'ANUNCIO',   label: 'Anúncio Pago',        icon: '📣' },
]

const canais = [
  { value: 'INSTAGRAM', label: 'Instagram', icon: '📸' },
  { value: 'FACEBOOK',  label: 'Facebook',  icon: '👍' },
  { value: 'TIKTOK',    label: 'TikTok',    icon: '🎵' },
  { value: 'WHATSAPP',  label: 'WhatsApp',  icon: '💬' },
]

const prioridades = [
  { value: 'URGENTE', label: '🔴 Urgente' },
  { value: 'ALTA',    label: '🟠 Alta' },
  { value: 'NORMAL',  label: '🟡 Normal' },
  { value: 'BAIXA',   label: '🟢 Baixa' },
]

export default function NovoPedidoPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [tipo, setTipo] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [produtos, setProdutos] = useState<Product[]>([{ name: '', price: '' }])
  const [canaisSel, setCanaisSel] = useState<string[]>(['INSTAGRAM'])
  const [prioridade, setPrioridade] = useState('NORMAL')
  const [dataPublicacao, setDataPublicacao] = useState('')

  function addProduto() {
    setProdutos(p => [...p, { name: '', price: '' }])
  }
  function updateProduto(i: number, field: keyof Product, val: string) {
    setProdutos(p => p.map((prod, idx) => idx === i ? { ...prod, [field]: val } : prod))
  }
  function removeProduto(i: number) {
    setProdutos(p => p.filter((_, idx) => idx !== i))
  }
  function toggleCanal(c: string) {
    setCanaisSel(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || '{}')

      const body = {
        storeId: user.store?.id,
        type: tipo,
        title: titulo,
        description: descricao,
        products: produtos.filter(p => p.name).map(p => ({
          name: p.name,
          price: parseFloat(p.price) || 0,
        })),
        channels: canaisSel,
        priority: prioridade,
        scheduledFor: dataPublicacao || undefined,
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar pedido')
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido enviado!</h2>
        <p className="text-gray-500 mb-2">A IA já está gerando o conteúdo.</p>
        <p className="text-gray-400 text-sm mb-6">Você receberá uma notificação quando estiver pronto para revisão.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/pedidos" className="px-5 py-2.5 bg-[#0066CC] text-white rounded-lg text-sm font-medium hover:bg-[#0052A3]">
            Ver pedidos
          </Link>
          <button onClick={() => { setSuccess(false); setStep(1); setTipo(''); setTitulo(''); setProdutos([{ name: '', price: '' }]) }}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
            Novo pedido
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/pedidos" className="text-gray-400 hover:text-gray-600 text-sm">← Pedidos</Link>
        <h1 className="text-xl font-bold text-gray-900">Novo Pedido de Arte</h1>
      </div>

      {/* Steps */}
      <div className="flex gap-2">
        {[1,2,3].map(s => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-[#0066CC]' : 'bg-gray-200'}`} />
        ))}
      </div>

      {/* Step 1 — Tipo */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Que tipo de conteúdo você precisa?</h2>
          <div className="grid grid-cols-2 gap-3">
            {tiposArte.map(t => (
              <button key={t.value} onClick={() => setTipo(t.value)}
                className={`p-4 border-2 rounded-xl flex items-center gap-3 transition-colors text-left ${
                  tipo === t.value ? 'border-[#0066CC] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <span className="text-2xl">{t.icon}</span>
                <span className="text-sm font-medium text-gray-700">{t.label}</span>
              </button>
            ))}
          </div>
          <button onClick={() => tipo && setStep(2)} disabled={!tipo}
            className="w-full py-3 bg-[#0066CC] text-white rounded-lg font-medium disabled:opacity-40 hover:bg-[#0052A3] transition-colors">
            Continuar →
          </button>
        </div>
      )}

      {/* Step 2 — Produtos */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Detalhes do conteúdo</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título do pedido *</label>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Sexta das Carnes — Fraldão"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / observações</label>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2}
              placeholder="Ex: Usar cor vermelha, destacar o desconto..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none resize-none" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Produtos e preços</label>
              <button onClick={addProduto} className="text-xs text-[#0066CC] hover:underline">+ Adicionar</button>
            </div>
            <div className="space-y-2">
              {produtos.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input value={p.name} onChange={e => updateProduto(i, 'name', e.target.value)}
                    placeholder="Nome do produto"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none" />
                  <input value={p.price} onChange={e => updateProduto(i, 'price', e.target.value)}
                    placeholder="R$ 0,00" type="number" step="0.01"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none" />
                  {produtos.length > 1 && (
                    <button onClick={() => removeProduto(i)} className="text-gray-400 hover:text-red-500 px-1">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
              ← Voltar
            </button>
            <button onClick={() => titulo && setStep(3)} disabled={!titulo}
              className="flex-1 py-3 bg-[#0066CC] text-white rounded-lg font-medium disabled:opacity-40 hover:bg-[#0052A3] transition-colors">
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Publicação */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Onde e quando publicar?</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Canais de publicação</label>
            <div className="grid grid-cols-2 gap-2">
              {canais.map(c => (
                <button key={c.value} onClick={() => toggleCanal(c.value)}
                  className={`p-3 border-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                    canaisSel.includes(c.value) ? 'border-[#0066CC] bg-blue-50 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  <span>{c.icon}</span>{c.label}
                  {canaisSel.includes(c.value) && <span className="ml-auto text-[#0066CC]">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <select value={prioridade} onChange={e => setPrioridade(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none">
                {prioridades.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de publicação</label>
              <input type="datetime-local" value={dataPublicacao} onChange={e => setDataPublicacao(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          {/* Resumo */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Tipo:</span> {tiposArte.find(t => t.value === tipo)?.label}</p>
            <p><span className="font-medium">Título:</span> {titulo}</p>
            <p><span className="font-medium">Produtos:</span> {produtos.filter(p => p.name).length} item(s)</p>
            <p><span className="font-medium">Canais:</span> {canaisSel.join(', ')}</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
              ← Voltar
            </button>
            <button onClick={handleSubmit} disabled={loading || canaisSel.length === 0}
              className="flex-1 py-3 bg-[#FF6B00] hover:bg-[#E05A00] disabled:opacity-40 text-white rounded-lg font-medium transition-colors">
              {loading ? 'Enviando...' : '🚀 Enviar para IA'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
