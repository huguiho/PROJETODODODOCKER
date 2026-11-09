import { useState, useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/componentes/interface/button';
import { Input } from '@/componentes/interface/input';
import { Label } from '@/componentes/interface/label';
import { buscarProdutos, buscarMovimentacoes, movimentarEstoque, type Produto, type MovimentacaoEstoque } from '@/servicos/servicoBancoDados';
import EstruturaAplicacao from '@/componentes/EstruturaAplicacao';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/componentes/interface/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentes/interface/select';

type TipoMovimentacao = 'entrada' | 'saida' | 'ajuste';

const Estoque = () => {
  const [produtos, definirProdutos] = useState<Produto[]>([]);
  const [movimentacoes, definirMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [carregando, definirCarregando] = useState(true);
  const [modalAberto, definirModalAberto] = useState(false);
  const [produtoSelecionado, definirProdutoSelecionado] = useState('');
  const [tipo, definirTipo] = useState<TipoMovimentacao>('entrada');
  const [quantidade, definirQuantidade] = useState(0);
  const [motivo, definirMotivo] = useState('');
  const [salvando, definirSalvando] = useState(false);

  const carregar = async () => {
    definirCarregando(true);
    try {
      const [produtosCarregados, movimentacoesCarregadas] = await Promise.all([buscarProdutos(), buscarMovimentacoes()]);
      definirProdutos(produtosCarregados);
      definirMovimentacoes(movimentacoesCarregadas);
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    }
    definirCarregando(false);
  };

  useEffect(() => { carregar(); }, []);

  const estoqueBaixo = produtos.filter(p => p.ativo && p.estoque <= p.estoque_minimo);

  const registrarMovimentacao = async () => {
    const produto = produtos.find(p => p.id === produtoSelecionado);
    if (!produto) { toast.error('Selecione um produto'); return; }
    if (!Number.isInteger(quantidade) || quantidade < 0 || (quantidade === 0 && tipo !== 'ajuste')) { toast.error('Quantidade inválida'); return; }

    definirSalvando(true);
    try {
      await movimentarEstoque(produto.id, tipo, quantidade, motivo);

      toast.success('Movimentação registrada!');
      definirModalAberto(false);
      definirProdutoSelecionado('');
      definirQuantidade(0);
      definirMotivo('');
      carregar();
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    }
    definirSalvando(false);
  };

  const rotulosTipo: Record<TipoMovimentacao, string> = { entrada: 'Entrada', saida: 'Saída', ajuste: 'Ajuste' };
  const tipoCor: Record<TipoMovimentacao, string> = { entrada: 'text-success', saida: 'text-destructive', ajuste: 'text-gold' };
  const tipoIcone: Record<TipoMovimentacao, React.ReactNode> = {
    entrada: <ArrowDownCircle className="w-4 h-4 text-success" />,
    saida: <ArrowUpCircle className="w-4 h-4 text-destructive" />,
    ajuste: <RefreshCw className="w-4 h-4 text-gold" />,
  };

  return (
    <EstruturaAplicacao exigirAdministrador>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Controle de Estoque</h1>
            <p className="text-muted-foreground mt-1">{movimentacoes.length} movimentações registradas</p>
          </div>
          <Button onClick={() => definirModalAberto(true)} className="wine-gradient text-primary-foreground hover:opacity-90">Nova Movimentação</Button>
        </div>

        {estoqueBaixo.length > 0 && (
          <div className="glass-card p-4 border-destructive/30">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-destructive" /> Estoque Baixo ({estoqueBaixo.length} produtos)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {estoqueBaixo.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded bg-destructive/10 border border-destructive/20">
                  <span className="text-xs text-foreground truncate">{p.nome}</span>
                  <span className="text-xs font-bold text-destructive ml-2">{p.estoque}/{p.estoque_minimo}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {carregando ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-display font-semibold text-foreground">Histórico de Movimentações</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Data</th>
                    <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Produto</th>
                    <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium">Qtd</th>
                    <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium">Estoque</th>
                    <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Motivo</th>
                    <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {movimentacoes.slice(0, 50).map(m => (
                    <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2 text-xs text-foreground">{new Date(m.created_at).toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-2">
                        <span className={`flex items-center gap-1 text-xs font-medium ${tipoCor[m.tipo as TipoMovimentacao] || ''}`}>
                          {tipoIcone[m.tipo as TipoMovimentacao]} {rotulosTipo[m.tipo as TipoMovimentacao] || m.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-foreground">{m.produto_nome}</td>
                      <td className="px-4 py-2 text-sm text-right text-foreground">{m.quantidade}</td>
                      <td className="px-4 py-2 text-xs text-right text-muted-foreground">{m.estoque_anterior} → {m.estoque_novo}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{m.motivo}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{m.usuario_nome}</td>
                    </tr>
                  ))}
                  {movimentacoes.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma movimentação registrada</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Dialog open={modalAberto} onOpenChange={definirModalAberto}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader><DialogTitle className="font-display text-foreground">Nova Movimentação</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-foreground text-xs">Tipo</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['entrada', 'saida', 'ajuste'] as TipoMovimentacao[]).map(t => (
                    <button key={t} onClick={() => definirTipo(t)}
                      className={`p-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1 justify-center ${tipo === t ? 'border-primary bg-primary/20 text-primary' : 'border-border bg-secondary text-foreground'}`}>
                      {tipoIcone[t]} {rotulosTipo[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-foreground text-xs">Produto</Label>
                <Select value={produtoSelecionado} onValueChange={definirProdutoSelecionado}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-popover border-border max-h-48">
                    {produtos.filter(p => p.ativo && !p.produto_unitario_id).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nome} (Estoque: {p.estoque})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-foreground text-xs">{tipo === 'ajuste' ? 'Novo Estoque' : 'Quantidade'}</Label>
                <Input type="number" value={quantidade || ''} onChange={e => definirQuantidade(parseInt(e.target.value) || 0)} className="bg-secondary border-border" min={0} />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground text-xs">Motivo (opcional)</Label>
                <Input value={motivo} onChange={e => definirMotivo(e.target.value)} className="bg-secondary border-border" placeholder="Motivo da movimentação" />
              </div>
              <Button onClick={registrarMovimentacao} disabled={salvando} className="w-full wine-gradient text-primary-foreground hover:opacity-90">
                {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Registrar Movimentação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </EstruturaAplicacao>
  );
};

export default Estoque;
