import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Percent, Wallet, BarChart2, Loader2, Bell } from 'lucide-react';
import EstruturaAplicacao from '@/componentes/EstruturaAplicacao';
import { buscarVendas, buscarProdutos, type VendaCompleta, type Produto } from '@/servicos/servicoBancoDados';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

const CORES_GRAFICOS = ['hsl(345,60%,40%)', 'hsl(42,70%,55%)', 'hsl(142,60%,40%)', 'hsl(200,60%,50%)', 'hsl(280,60%,50%)'];
const estiloDica = { background: 'hsl(20,10%,12%)', border: '1px solid hsl(20,10%,20%)', borderRadius: '8px', color: 'hsl(30,20%,90%)', fontSize: '12px' };
const formatarMoeda = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

const Painel = () => {
  const [carregando, definirCarregando] = useState(true);
  const [vendas, definirVendas] = useState<VendaCompleta[]>([]);
  const [produtos, definirProdutos] = useState<Produto[]>([]);
  const [notificacoesVistas, definirNotificacoesVistas] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      try {
        const [v, p] = await Promise.all([buscarVendas(), buscarProdutos()]);
        definirVendas(v.filter(s => !s.cancelada));
        definirProdutos(p);

        // Notificações de estoque baixo
        const estBaixo = p.filter(prod => prod.ativo && prod.estoque <= prod.estoque_minimo);
        if (estBaixo.length > 0) {
          toast.warning(`${estBaixo.length} produto(s) com estoque baixo!`, {
            description: estBaixo.slice(0, 3).map(pr => `${pr.nome}: ${pr.estoque} un.`).join(', '),
            duration: 8000,
          });
        }
      } catch (e: any) {
        toast.error('Erro: ' + e.message);
      }
      definirCarregando(false);
    };
    carregar();
  }, []);

  if (carregando) {
    return <EstruturaAplicacao><div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></EstruturaAplicacao>;
  }

  const agora = new Date();
  const dataHoje = agora.toISOString().split('T')[0];
  const mesAtual = dataHoje.substring(0, 7);
  const anoAtual = dataHoje.substring(0, 4);

  const vendasHoje = vendas.filter(s => s.created_at.startsWith(dataHoje));
  const vendasMes = vendas.filter(s => s.created_at.startsWith(mesAtual));
  const vendasAno = vendas.filter(s => s.created_at.startsWith(anoAtual));

  const receitaHoje = vendasHoje.reduce((s, v) => s + v.total, 0);
  const receitaMes = vendasMes.reduce((s, v) => s + v.total, 0);
  const receitaAno = vendasAno.reduce((s, v) => s + v.total, 0);
  const ticketMedio = vendas.length > 0 ? vendas.reduce((s, v) => s + v.total, 0) / vendas.length : 0;

  const totalCusto = vendas.reduce((soma, v) => soma + v.itens.reduce((somaItens, i) => somaItens + i.preco_custo * i.quantidade, 0), 0);
  const receitaTotal = vendas.reduce((s, v) => s + v.total, 0);
  const lucroBruto = receitaTotal - totalCusto;
  const totalTaxas = vendas.reduce((s, v) => s + v.taxa_valor, 0);
  const lucroLiquido = lucroBruto - totalTaxas;

  const mapaProdutos: Record<string, { nome: string; qtd: number; receita: number }> = {};
  vendas.forEach(v => v.itens.forEach(i => {
    if (!mapaProdutos[i.produto_id]) mapaProdutos[i.produto_id] = { nome: i.produto_nome, qtd: 0, receita: 0 };
    mapaProdutos[i.produto_id].qtd += i.quantidade;
    mapaProdutos[i.produto_id].receita += i.subtotal;
  }));
  const produtosMaisVendidos = Object.values(mapaProdutos).sort((a, b) => b.receita - a.receita).slice(0, 10);

  const mapaPagamento: Record<string, { name: string; value: number; count: number }> = {};
  vendas.forEach(v => {
    const chave = v.forma_pagamento;
    if (!mapaPagamento[chave]) mapaPagamento[chave] = { name: chave, value: 0, count: 0 };
    mapaPagamento[chave].value += v.total;
    mapaPagamento[chave].count += 1;
  });
  const pagamentosMaisUsados = Object.values(mapaPagamento).sort((a, b) => b.value - a.value);

  const estoqueBaixo = produtos.filter(p => p.ativo && p.estoque <= p.estoque_minimo);

  const vendasDiarias: { date: string; revenue: number; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const chave = d.toISOString().split('T')[0];
    const dv = vendas.filter(s => s.created_at.startsWith(chave));
    vendasDiarias.push({ date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), revenue: dv.reduce((s, v) => s + v.total, 0), count: dv.length });
  }

  const indicadores = [
    { label: 'Vendas Hoje', value: formatarMoeda(receitaHoje), sub: `${vendasHoje.length} vendas`, icon: ShoppingCart, color: 'text-primary' },
    { label: 'Receita Mensal', value: formatarMoeda(receitaMes), sub: 'Este mês', icon: DollarSign, color: 'text-success' },
    { label: 'Receita Anual', value: formatarMoeda(receitaAno), sub: 'Este ano', icon: TrendingUp, color: 'text-gold' },
    { label: 'Ticket Médio', value: formatarMoeda(ticketMedio), sub: 'Por venda', icon: BarChart2, color: 'text-wine-light' },
    { label: 'Lucro Bruto', value: formatarMoeda(lucroBruto), sub: 'Receita - Custo', icon: Wallet, color: 'text-success' },
    { label: 'Lucro Líquido', value: formatarMoeda(lucroLiquido), sub: 'Após taxas', icon: DollarSign, color: 'text-gold' },
    { label: 'Total em Taxas', value: formatarMoeda(totalTaxas), sub: 'Taxas pagas', icon: Percent, color: 'text-destructive' },
    { label: 'Estoque Baixo', value: estoqueBaixo.length, sub: 'Produtos', icon: AlertTriangle, color: estoqueBaixo.length > 0 ? 'text-destructive' : 'text-success' },
  ];

  return (
    <EstruturaAplicacao>
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Painel</h1>
            <p className="text-muted-foreground mt-1 text-sm">Visão geral da sua adega</p>
          </div>
          {estoqueBaixo.length > 0 && (
            <button
              onClick={() => {
                definirNotificacoesVistas(!notificacoesVistas);
                const elemento = document.getElementById('estoque-baixo');
                elemento?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="relative p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-all active:scale-95"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {estoqueBaixo.length}
              </span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {indicadores.map(s => (
            <div key={s.label} className="glass-card p-3 md:p-5 hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <span className="text-[10px] md:text-xs text-muted-foreground">{s.label}</span>
                <s.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${s.color}`} />
              </div>
              <p className="text-base md:text-xl font-bold text-foreground truncate">{s.value}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="glass-card p-4 md:p-6">
            <h2 className="text-base md:text-lg font-display font-semibold text-foreground mb-3 md:mb-4">Vendas Diárias (30 dias)</h2>
            <div className="h-44 md:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendasDiarias}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(20,10%,20%)" />
                  <XAxis dataKey="date" stroke="hsl(30,10%,55%)" fontSize={10} interval="preserveStartEnd" />
                  <YAxis stroke="hsl(30,10%,55%)" fontSize={10} />
                  <Tooltip contentStyle={estiloDica} formatter={(v: number) => [formatarMoeda(v), 'Receita']} />
                  <Bar dataKey="revenue" fill="hsl(345,60%,40%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-4 md:p-6">
            <h2 className="text-base md:text-lg font-display font-semibold text-foreground mb-3 md:mb-4">Formas de Pagamento</h2>
            {pagamentosMaisUsados.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
            ) : (
              <div className="h-40 md:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pagamentosMaisUsados} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name: nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                      {pagamentosMaisUsados.map((_, i) => <Cell key={i} fill={CORES_GRAFICOS[i % CORES_GRAFICOS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={estiloDica} formatter={(v: number) => [formatarMoeda(v)]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-4 md:p-6">
          <h2 className="text-base md:text-lg font-display font-semibold text-foreground mb-3 md:mb-4">Produtos Mais Vendidos</h2>
          {produtosMaisVendidos.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-auto">
              {produtosMaisVendidos.map((p, i) => {
                const maiorReceita = produtosMaisVendidos[0]?.receita || 1;
                return (
                  <div key={i} className="flex items-center gap-2 md:gap-3">
                    <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs md:text-sm text-foreground truncate">{p.nome}</span>
                        <span className="text-xs text-gold font-medium ml-2 whitespace-nowrap">{formatarMoeda(p.receita)}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full wine-gradient rounded-full" style={{ width: `${(p.receita / maiorReceita) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-10 md:w-12 text-right whitespace-nowrap">{p.qtd} un.</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {estoqueBaixo.length > 0 && (
          <div id="estoque-baixo" className="glass-card p-4 md:p-6 border-destructive/30">
            <h2 className="text-base md:text-lg font-display font-semibold text-foreground mb-3 md:mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Produtos com Estoque Baixo
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {estoqueBaixo.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{p.nome}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.categoria_nome}</p>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="text-sm font-bold text-destructive">{p.estoque} un.</p>
                    <p className="text-xs text-muted-foreground">Mín: {p.estoque_minimo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </EstruturaAplicacao>
  );
};

export default Painel;
