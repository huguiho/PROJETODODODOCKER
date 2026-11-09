import { useState } from 'react';
import { ArrowLeft, LayoutDashboard, ShoppingCart, Package, Boxes, BarChart3, Users, Settings, ClipboardList, FolderOpen, LogOut, Mail, Lock, LogIn, DollarSign, TrendingUp, AlertTriangle, Wallet, Sun, Moon, Menu, Bell, Search, ChevronDown, Home } from 'lucide-react';
import { Button } from '@/componentes/interface/button';
import { Link } from 'react-router-dom';

const itensBarraLateral = [
  { title: 'Painel', icon: LayoutDashboard },
  { title: 'PDV - Vendas', icon: ShoppingCart },
  { title: 'Produtos', icon: Package },
  { title: 'Categorias', icon: FolderOpen },
  { title: 'Estoque', icon: Boxes },
  { title: 'Relatórios', icon: BarChart3 },
  { title: 'Usuários', icon: Users },
  { title: 'Configurações', icon: Settings },
];

const dadosIndicadores = [
  { label: 'Vendas Hoje', value: 'R$ 2.450,00', icon: ShoppingCart, color: 'text-blue-400' },
  { label: 'Receita Mensal', value: 'R$ 38.900,00', icon: DollarSign, color: 'text-green-400' },
  { label: 'Lucro Bruto', value: 'R$ 12.300,00', icon: TrendingUp, color: 'text-amber-400' },
  { label: 'Estoque Baixo', value: '3', icon: AlertTriangle, color: 'text-red-400' },
];

// ==========================================
// LAYOUT 1 - MINIMAL / CLEAN (Tons claros)
// ==========================================
const EntradaClara = () => (
  <div className="h-full flex bg-slate-50">
    {/* Left panel - branding */}
    <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 items-center justify-center p-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">AdegaPDV</h2>
        <p className="text-indigo-200 text-sm">Gerencie sua adega com simplicidade</p>
      </div>
    </div>
    {/* Right panel - form */}
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Bem-vindo de volta</h1>
        <p className="text-slate-500 text-sm mb-6">Entre na sua conta para continuar</p>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Email</label>
            <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2.5 bg-white">
              <Mail className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-sm text-slate-400">seu@email.com</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Senha</label>
            <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2.5 bg-white">
              <Lock className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-sm text-slate-400">••••••••</span>
            </div>
          </div>
          <button className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" /> Entrar
          </button>
        </div>
      </div>
    </div>
  </div>
);

const PainelClaro = () => (
  <div className="h-full flex bg-slate-50">
    {/* Sidebar clean */}
    <aside className="w-56 bg-white border-r border-slate-100 flex flex-col">
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-bold text-indigo-600 text-lg">AdegaPDV</h2>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {itensBarraLateral.map((item, i) => (
          <div key={item.title} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${i === 0 ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
            <item.icon className="w-4 h-4" />
            <span>{item.title}</span>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
          <LogOut className="w-4 h-4" /> Sair
        </div>
      </div>
    </aside>
    {/* Content */}
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">Painel</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-400 gap-2">
            <Search className="w-4 h-4" /> Buscar...
          </div>
          <Bell className="w-5 h-5 text-slate-400" />
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">A</div>
        </div>
      </header>
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {dadosIndicadores.map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-100 h-44">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Vendas Diárias</h3>
            <div className="flex items-end gap-1.5 h-28">
              {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                <div key={i} className="flex-1 bg-indigo-100 rounded-t" style={{ height: `${h}%` }}>
                  <div className="w-full bg-indigo-500 rounded-t" style={{ height: `${h * 0.7}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-100 h-44">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Top Produtos</h3>
            <div className="space-y-3 mt-3">
              {['Vinho Tinto Reserva', 'Espumante Brut', 'Whisky 12 anos'].map((p, i) => (
                <div key={p} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-4">{i + 1}.</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${90 - i * 20}%` }} />
                  </div>
                  <span className="text-xs text-slate-600">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// LAYOUT 2 - NEON / CYBERPUNK (Dark + neon)
// ==========================================
const EntradaNeon = () => (
  <div className="h-full flex items-center justify-center bg-gray-950 relative overflow-hidden">
    {/* Neon glow bg */}
    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />
    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[100px]" />
    <div className="relative z-10 w-full max-w-sm p-8 border border-cyan-500/20 rounded-2xl bg-gray-900/80 backdrop-blur-md">
      <div className="text-center mb-6">
        <div className="w-14 h-14 border-2 border-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
          <ShoppingCart className="w-7 h-7 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Adega<span className="text-cyan-400">PDV</span></h1>
        <p className="text-gray-500 text-xs mt-1">Sistema de Ponto de Venda</p>
      </div>
      <div className="space-y-4">
        <div className="border border-gray-700 rounded-lg px-3 py-2.5 flex items-center gap-2 focus-within:border-cyan-500 transition-colors">
          <Mail className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">seu@email.com</span>
        </div>
        <div className="border border-gray-700 rounded-lg px-3 py-2.5 flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">••••••••</span>
        </div>
        <button className="w-full py-2.5 rounded-lg text-sm font-bold bg-cyan-500 text-gray-950 shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center justify-center gap-2">
          <LogIn className="w-4 h-4" /> Entrar
        </button>
      </div>
    </div>
  </div>
);

const PainelNeon = () => (
  <div className="h-full flex bg-gray-950">
    {/* Sidebar neon */}
    <aside className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4">
      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-6">
        <ShoppingCart className="w-5 h-5 text-cyan-400" />
      </div>
      <nav className="flex-1 space-y-2">
        {itensBarraLateral.map((item, i) => (
          <div key={item.title} className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer ${i === 0 ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'text-gray-500 hover:text-gray-300'}`} title={item.title}>
            <item.icon className="w-5 h-5" />
          </div>
        ))}
      </nav>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400">
        <LogOut className="w-5 h-5" />
      </div>
    </aside>
    {/* Content */}
    <div className="flex-1 overflow-auto">
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Painel</h1>
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-gray-500" />
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-400">A</div>
        </div>
      </header>
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {dadosIndicadores.map((s, i) => {
            const coresNeon = ['cyan', 'emerald', 'amber', 'rose'];
            const c = coresNeon[i];
            return (
              <div key={s.label} className={`rounded-xl p-4 border bg-gray-900/80 border-${c}-500/20`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">{s.label}</span>
                  <s.icon className={`w-4 h-4 text-${c}-400`} />
                </div>
                <p className="text-xl font-bold text-white">{s.value}</p>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl p-5 border border-gray-800 bg-gray-900/80 h-44">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Vendas Diárias</h3>
            <div className="flex items-end gap-1.5 h-28">
              {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                <div key={i} className="flex-1 bg-gray-800 rounded-t" style={{ height: `${h}%` }}>
                  <div className="w-full bg-cyan-500 rounded-t shadow-[0_0_6px_rgba(34,211,238,0.4)]" style={{ height: '100%' }} />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl p-5 border border-gray-800 bg-gray-900/80 h-44">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Top Produtos</h3>
            <div className="space-y-3 mt-3">
              {['Vinho Tinto Reserva', 'Espumante Brut', 'Whisky 12 anos'].map((p, i) => (
                <div key={p} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-4">{i + 1}.</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full shadow-[0_0_4px_rgba(34,211,238,0.4)]" style={{ width: `${90 - i * 20}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// LAYOUT 3 - WARM / EARTH TONES (Amadeirado)
// ==========================================
const EntradaAmadeirada = () => (
  <div className="h-full flex items-center justify-center bg-amber-50">
    <div className="w-full max-w-4xl mx-auto grid grid-cols-2 rounded-2xl overflow-hidden shadow-xl">
      <div className="bg-gradient-to-br from-amber-900 to-amber-800 p-10 flex flex-col justify-center">
        <div className="w-14 h-14 bg-amber-700/50 rounded-2xl flex items-center justify-center mb-6">
          <ShoppingCart className="w-7 h-7 text-amber-200" />
        </div>
        <h2 className="text-3xl font-bold text-amber-50 mb-2">AdegaPDV</h2>
        <p className="text-amber-300 text-sm leading-relaxed">Gerencie vendas, produtos e estoque da sua adega com elegância e praticidade.</p>
        <div className="mt-8 flex gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-100">500+</p>
            <p className="text-xs text-amber-400">Vendas/mês</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-100">98%</p>
            <p className="text-xs text-amber-400">Satisfação</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-10 flex flex-col justify-center">
        <h1 className="text-xl font-bold text-amber-900 mb-1">Entrar</h1>
        <p className="text-amber-600 text-sm mb-6">Acesse sua conta</p>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-amber-700 mb-1 block">Email</label>
            <div className="flex items-center border border-amber-200 rounded-lg px-3 py-2.5 bg-amber-50/50">
              <Mail className="w-4 h-4 text-amber-400 mr-2" />
              <span className="text-sm text-amber-400">seu@email.com</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-amber-700 mb-1 block">Senha</label>
            <div className="flex items-center border border-amber-200 rounded-lg px-3 py-2.5 bg-amber-50/50">
              <Lock className="w-4 h-4 text-amber-400 mr-2" />
              <span className="text-sm text-amber-400">••••••••</span>
            </div>
          </div>
          <button className="w-full bg-amber-800 text-amber-50 rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-amber-900 transition">
            <LogIn className="w-4 h-4" /> Entrar
          </button>
        </div>
      </div>
    </div>
  </div>
);

const PainelAmadeirado = () => (
  <div className="h-full flex bg-amber-50">
    {/* Sidebar warm */}
    <aside className="w-56 bg-amber-900 flex flex-col">
      <div className="p-4 border-b border-amber-800">
        <h2 className="font-bold text-amber-100 text-lg">Adega<span className="text-amber-400">PDV</span></h2>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {itensBarraLateral.map((item, i) => (
          <div key={item.title} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${i === 0 ? 'bg-amber-800 text-amber-100 font-medium' : 'text-amber-300 hover:bg-amber-800/50'}`}>
            <item.icon className="w-4 h-4" />
            <span>{item.title}</span>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-amber-800">
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-amber-400">
          <LogOut className="w-4 h-4" /> Sair
        </div>
      </div>
    </aside>
    {/* Content */}
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b border-amber-100 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-amber-900">Painel</h1>
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-amber-400" />
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">A</div>
        </div>
      </header>
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {dadosIndicadores.map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-amber-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-amber-600">{s.label}</span>
                <s.icon className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl font-bold text-amber-900">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 border border-amber-100 h-44 shadow-sm">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">Vendas Diárias</h3>
            <div className="flex items-end gap-1.5 h-28">
              {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                <div key={i} className="flex-1 bg-amber-100 rounded-t" style={{ height: `${h}%` }}>
                  <div className="w-full bg-amber-600 rounded-t" style={{ height: `${h * 0.7}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-amber-100 h-44 shadow-sm">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">Top Produtos</h3>
            <div className="space-y-3 mt-3">
              {['Vinho Tinto Reserva', 'Espumante Brut', 'Whisky 12 anos'].map((p, i) => (
                <div key={p} className="flex items-center gap-2">
                  <span className="text-xs text-amber-400 w-4">{i + 1}.</span>
                  <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${90 - i * 20}%` }} />
                  </div>
                  <span className="text-xs text-amber-700">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// SHOWCASE PAGE
// ==========================================
type ChaveEstilo = 'layout1' | 'layout2' | 'layout3';
type ChaveTela = 'login' | 'dashboard';

const estilos: Record<ChaveEstilo, { name: string; desc: string; tags: string[] }> = {
  layout1: { name: 'Minimal Clean', desc: 'Layout claro e minimalista com tons de índigo. Sidebar expandida, header com busca.', tags: ['Claro', 'Minimalista', 'Moderno'] },
  layout2: { name: 'Neon Cyberpunk', desc: 'Layout escuro com acentos neon em ciano. Sidebar compacta (ícones), visual futurista.', tags: ['Escuro', 'Neon', 'Futurista'] },
  layout3: { name: 'Warm Earth', desc: 'Layout com tons amadeirados e âmbar. Sidebar escura quente, visual sofisticado.', tags: ['Quente', 'Elegante', 'Amadeirado'] },
};

const Demonstracao = () => {
  const [estiloAtivo, definirEstiloAtivo] = useState<ChaveEstilo>('layout1');
  const [telaAtiva, definirTelaAtiva] = useState<ChaveTela>('login');

  const renderizarDemonstracao = () => {
    if (estiloAtivo === 'layout1') return telaAtiva === 'login' ? <EntradaClara /> : <PainelClaro />;
    if (estiloAtivo === 'layout2') return telaAtiva === 'login' ? <EntradaNeon /> : <PainelNeon />;
    return telaAtiva === 'login' ? <EntradaAmadeirada /> : <PainelAmadeirado />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar ao sistema
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-display font-bold">Showcase de Layouts</h1>
            <p className="text-xs text-muted-foreground">Compare 3 variações visuais do seu sistema — sem alterar o original</p>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Layout selector */}
        <div className="flex flex-wrap gap-4">
          {(Object.keys(estilos) as ChaveEstilo[]).map(chave => {
            const l = estilos[chave];
            const estaAtivo = estiloAtivo === chave;
            return (
              <button
                key={chave}
                onClick={() => definirEstiloAtivo(chave)}
                className={`flex-1 min-w-[200px] p-4 rounded-xl border-2 transition-all text-left ${
                  estaAtivo
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground/30 bg-card'
                }`}
              >
                <h3 className={`font-bold text-sm ${estaAtivo ? 'text-primary' : 'text-foreground'}`}>{l.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{l.desc}</p>
                <div className="flex gap-1.5 mt-2">
                  {l.tags.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{t}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Visualizar:</span>
          <Button
            variant={telaAtiva === 'login' ? 'default' : 'outline'}
            size="sm"
            onClick={() => definirTelaAtiva('login')}
          >
            Tela de Login
          </Button>
          <Button
            variant={telaAtiva === 'dashboard' ? 'default' : 'outline'}
            size="sm"
            onClick={() => definirTelaAtiva('dashboard')}
          >
            Painel
          </Button>
        </div>

        {/* Preview frame */}
        <div className="border-2 border-border rounded-2xl overflow-hidden shadow-lg">
          {/* Browser chrome */}
          <div className="bg-muted px-4 py-2 flex items-center gap-2 border-b border-border">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-secondary rounded-md px-3 py-1 text-xs text-muted-foreground text-center">
                https://adegapdv.com/{telaAtiva === 'login' ? '' : 'dashboard'}
              </div>
            </div>
          </div>
          {/* Preview content */}
          <div className="h-[520px]">
            {renderizarDemonstracao()}
          </div>
        </div>

        {/* Current layout indicator */}
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Layout atual do sistema: <span className="text-primary font-bold">Dark Purple + Gold</span></p>
            <p className="text-xs text-muted-foreground">Os layouts acima são apenas previews visuais. Seu sistema original permanece inalterado.</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary font-medium">Somente preview</span>
        </div>
      </div>
    </div>
  );
};

export default Demonstracao;
