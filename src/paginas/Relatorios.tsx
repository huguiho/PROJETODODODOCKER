import { useState, useEffect, useMemo } from 'react';
import { Download, FileText, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/componentes/interface/button';
import { Input } from '@/componentes/interface/input';
import { Label } from '@/componentes/interface/label';
import { buscarVendas, buscarPerfis, type Perfil, type VendaCompleta } from '@/servicos/servicoBancoDados';
import EstruturaAplicacao from '@/componentes/EstruturaAplicacao';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentes/interface/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { mensagemErro } from '@/utilitarios/erros';

const estiloDica = { background: 'hsl(20,10%,12%)', border: '1px solid hsl(20,10%,20%)', borderRadius: '8px', color: 'hsl(30,20%,90%)', fontSize: '12px' };
const formatarMoeda = (v: number) => `R$ ${v.toFixed(2)}`;

const Relatorios = () => {
  const [carregando, definirCarregando] = useState(true);
  const [todasVendas, definirTodasVendas] = useState<VendaCompleta[]>([]);
  const [perfis, definirPerfis] = useState<Perfil[]>([]);
  const [filtros, definirFiltros] = useState({
    dataInicio: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    formaPagamento: 'todos',
    operadorId: 'todos',
  });

  useEffect(() => {
    const carregar = async () => {
      try {
        const [v, p] = await Promise.all([buscarVendas(), buscarPerfis()]);
        definirTodasVendas(v.filter(s => !s.cancelada));
        definirPerfis(p);
      } catch (e: unknown) {
        toast.error('Erro: ' + mensagemErro(e));
      }
      definirCarregando(false);
    };
    carregar();
  }, []);

  const vendas = useMemo(() => {
    let lista = todasVendas;
    if (filtros.dataInicio) lista = lista.filter(v => v.created_at >= filtros.dataInicio);
    if (filtros.dataFim) lista = lista.filter(v => v.created_at <= filtros.dataFim + 'T23:59:59');
    if (filtros.formaPagamento !== 'todos') lista = lista.filter(v => v.forma_pagamento === filtros.formaPagamento);
    if (filtros.operadorId !== 'todos') lista = lista.filter(v => v.usuario_id === filtros.operadorId);
    return lista;
  }, [todasVendas, filtros]);

  const totalBruto = vendas.reduce((s, v) => s + v.total, 0);
  const totalTaxa = vendas.reduce((s, v) => s + v.taxa_valor, 0);
  const totalLiquido = vendas.reduce((s, v) => s + v.valor_liquido, 0);
  const totalCusto = vendas.reduce((s, v) => s + v.itens.reduce((somaItens, i) => somaItens + i.preco_custo * i.quantidade, 0), 0);
  const lucro = totalBruto - totalCusto - totalTaxa;
  const totalItens = vendas.reduce((s, v) => s + v.itens.reduce((somaItens, i) => somaItens + i.quantidade, 0), 0);

  const desempenhosProdutos = useMemo(() => {
    const mapa: Record<string, { nome: string; qtd: number; receita: number; custo: number; lucro: number }> = {};
    vendas.forEach(v => v.itens.forEach(i => {
      if (!mapa[i.produto_id]) mapa[i.produto_id] = { nome: i.produto_nome, qtd: 0, receita: 0, custo: 0, lucro: 0 };
      mapa[i.produto_id].qtd += i.quantidade;
      mapa[i.produto_id].receita += i.subtotal;
      mapa[i.produto_id].custo += i.preco_custo * i.quantidade;
    }));
    return Object.values(mapa).map(p => ({ ...p, lucro: p.receita - p.custo })).sort((a, b) => b.receita - a.receita);
  }, [vendas]);

  const exportarCSV = () => {
    const cabecalhos = ['Data', 'ID', 'Operador', 'Itens', 'Bruto', 'Taxa', 'Líquido', 'Pagamento'];
    const linhas = vendas.map(v => [
      new Date(v.created_at).toLocaleString('pt-BR'), v.id.substring(0, 8), v.usuario_nome,
      v.itens.reduce((s, i) => s + i.quantidade, 0), v.total.toFixed(2), v.taxa_valor.toFixed(2),
      v.valor_liquido.toFixed(2), v.forma_pagamento,
    ]);
    const csv = [cabecalhos.join(';'), ...linhas.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const ligacao = document.createElement('a');
    ligacao.href = url;
    ligacao.download = `relatorio_${filtros.dataInicio}_${filtros.dataFim}.csv`;
    ligacao.click();
    URL.revokeObjectURL(url);
  };

  const exportarPDF = () => {
    const documento = new jsPDF();
    documento.setFontSize(16);
    documento.text('Relatório de Vendas', 14, 22);
    documento.setFontSize(10);
    documento.text(`Período: ${filtros.dataInicio} a ${filtros.dataFim}`, 14, 30);
    documento.text(`Total Bruto: ${formatarMoeda(totalBruto)} | Taxas: ${formatarMoeda(totalTaxa)} | Líquido: ${formatarMoeda(totalLiquido)}`, 14, 37);
    autoTable(documento, {
      startY: 45,
      head: [['Data', 'Itens', 'Pagamento', 'Bruto', 'Taxa', 'Líquido']],
      body: vendas.map(v => [
        new Date(v.created_at).toLocaleString('pt-BR'),
        v.itens.reduce((s, i) => s + i.quantidade, 0),
        v.forma_pagamento + (v.parcelas && v.parcelas > 1 ? ` ${v.parcelas}x` : ''),
        formatarMoeda(v.total), formatarMoeda(v.taxa_valor), formatarMoeda(v.valor_liquido),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [120, 30, 50] },
    });
    documento.save(`relatorio_${filtros.dataInicio}_${filtros.dataFim}.pdf`);
  };

  return (
    <EstruturaAplicacao exigirAdministrador>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground mt-1">Análise detalhada de vendas</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportarCSV} variant="outline" className="border-border text-foreground"><Download className="w-4 h-4 mr-2" /> CSV</Button>
            <Button onClick={exportarPDF} className="wine-gradient text-primary-foreground hover:opacity-90"><FileText className="w-4 h-4 mr-2" /> PDF</Button>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3"><Filter className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Filtros</span></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Data Início</Label>
              <Input type="date" value={filtros.dataInicio} onChange={e => definirFiltros(f => ({ ...f, dataInicio: e.target.value }))} className="bg-secondary border-border text-foreground text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Data Fim</Label>
              <Input type="date" value={filtros.dataFim} onChange={e => definirFiltros(f => ({ ...f, dataFim: e.target.value }))} className="bg-secondary border-border text-foreground text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Pagamento</Label>
              <Select value={filtros.formaPagamento} onValueChange={v => definirFiltros(f => ({ ...f, formaPagamento: v }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="debito">Débito</SelectItem>
                  <SelectItem value="credito">Crédito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Operador</Label>
              <Select value={filtros.operadorId} onValueChange={v => definirFiltros(f => ({ ...f, operadorId: v }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="todos">Todos</SelectItem>
                  {perfis.map(p => <SelectItem key={p.user_id} value={p.user_id}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {carregando ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Vendas', value: vendas.length },
                { label: 'Itens Vendidos', value: totalItens },
                { label: 'Total Bruto', value: formatarMoeda(totalBruto) },
                { label: 'Total Taxas', value: formatarMoeda(totalTaxa) },
                { label: 'Total Líquido', value: formatarMoeda(totalLiquido) },
                { label: 'Lucro', value: formatarMoeda(lucro) },
              ].map(s => (
                <div key={s.label} className="glass-card p-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold text-foreground mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="glass-card p-6">
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">Lucro por Produto</h2>
              {desempenhosProdutos.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">Sem dados no período</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={desempenhosProdutos.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(20,10%,20%)" />
                      <XAxis type="number" stroke="hsl(30,10%,55%)" fontSize={10} />
                      <YAxis dataKey="nome" type="category" width={130} stroke="hsl(30,10%,55%)" fontSize={10} tick={{ fill: 'hsl(30,20%,80%)' }} />
                      <Tooltip contentStyle={estiloDica} formatter={(v: number) => [formatarMoeda(v)]} />
                      <Bar dataKey="receita" fill="hsl(345,60%,40%)" name="Receita" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="lucro" fill="hsl(142,60%,40%)" name="Lucro" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="glass-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="font-display font-semibold text-foreground">Vendas no Período ({vendas.length})</h2>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border">
                      <th className="px-4 py-2 text-left text-xs text-muted-foreground font-medium">Data</th>
                      <th className="px-4 py-2 text-left text-xs text-muted-foreground font-medium">Operador</th>
                      <th className="px-4 py-2 text-center text-xs text-muted-foreground font-medium">Itens</th>
                      <th className="px-4 py-2 text-left text-xs text-muted-foreground font-medium">Pagamento</th>
                      <th className="px-4 py-2 text-right text-xs text-muted-foreground font-medium">Bruto</th>
                      <th className="px-4 py-2 text-right text-xs text-muted-foreground font-medium">Taxa</th>
                      <th className="px-4 py-2 text-right text-xs text-muted-foreground font-medium">Líquido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {vendas.map(v => (
                      <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2 text-xs text-foreground">{new Date(v.created_at).toLocaleString('pt-BR')}</td>
                        <td className="px-4 py-2 text-xs text-foreground">{v.usuario_nome}</td>
                        <td className="px-4 py-2 text-xs text-center text-foreground">{v.itens.reduce((s, i) => s + i.quantidade, 0)}</td>
                        <td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{v.forma_pagamento}{v.parcelas && v.parcelas > 1 ? ` ${v.parcelas}x` : ''}</span></td>
                        <td className="px-4 py-2 text-xs text-right text-foreground">{formatarMoeda(v.total)}</td>
                        <td className="px-4 py-2 text-xs text-right text-destructive">-{formatarMoeda(v.taxa_valor)}</td>
                        <td className="px-4 py-2 text-xs text-right text-gold font-medium">{formatarMoeda(v.valor_liquido)}</td>
                      </tr>
                    ))}
                    {vendas.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma venda no período</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </EstruturaAplicacao>
  );
};

export default Relatorios;
