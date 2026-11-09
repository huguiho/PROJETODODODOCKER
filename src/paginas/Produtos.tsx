import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/componentes/interface/button';
import { Input } from '@/componentes/interface/input';
import { Label } from '@/componentes/interface/label';
import { buscarProdutos, salvarProduto, excluirProduto, buscarCategorias, criarLog, type Produto, type Categoria } from '@/servicos/servicoBancoDados';
import { usarAutenticacao } from '@/contextos/ContextoAutenticacao';
import EstruturaAplicacao from '@/componentes/EstruturaAplicacao';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/componentes/interface/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentes/interface/select';
import { Switch } from '@/componentes/interface/switch';

const ITENS_POR_PAGINA = 10;

const Produtos = () => {
  const { usuario } = usarAutenticacao();
  const [produtos, definirProdutos] = useState<Produto[]>([]);
  const [categorias, definirCategorias] = useState<Categoria[]>([]);
  const [carregando, definirCarregando] = useState(true);
  const [busca, definirBusca] = useState('');
  const [filtroCategoria, definirFiltroCategoria] = useState('Todos');
  const [ordenacao, definirOrdenacao] = useState<'nome' | 'preco' | 'estoque'>('nome');
  const [pagina, definirPagina] = useState(1);
  const [modalAberto, definirModalAberto] = useState(false);
  const [editando, definirEditando] = useState<Produto | null>(null);
  const [salvando, definirSalvando] = useState(false);
  const [formulario, definirFormulario] = useState({
    nome: '', codigo_barras: '', categoria_id: '', preco_custo: 0, preco_venda: 0,
    estoque: 0, estoque_minimo: 5, ativo: true, produto_unitario_id: '', unidades_por_pacote: 12,
  });

  const carregar = async () => {
    definirCarregando(true);
    try {
      const [produtosCarregados, categoriasCarregadas] = await Promise.all([buscarProdutos(), buscarCategorias()]);
      definirProdutos(produtosCarregados);
      definirCategorias(categoriasCarregadas);
    } catch (e: any) {
      toast.error('Erro ao carregar produtos: ' + e.message);
    }
    definirCarregando(false);
  };

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => {
    let lista = produtos;
    if (busca) {
      const q = busca.toLowerCase();
      lista = lista.filter(p => p.nome.toLowerCase().includes(q) || (p.codigo_barras || '').includes(q));
    }
    if (filtroCategoria !== 'Todos') {
      lista = lista.filter(p => p.categoria_id === filtroCategoria);
    }
    lista = [...lista].sort((a, b) => {
      if (ordenacao === 'nome') return a.nome.localeCompare(b.nome);
      if (ordenacao === 'preco') return b.preco_venda - a.preco_venda;
      return a.estoque - b.estoque;
    });
    return lista;
  }, [produtos, busca, filtroCategoria, ordenacao]);

  const totalPaginas = Math.ceil(filtrados.length / ITENS_POR_PAGINA);
  const paginados = filtrados.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA);

  const abrirNovo = () => {
    definirEditando(null);
    definirFormulario({ nome: '', codigo_barras: '', categoria_id: categorias[0]?.id || '', preco_custo: 0, preco_venda: 0, estoque: 0, estoque_minimo: 5, ativo: true, produto_unitario_id: '', unidades_por_pacote: 12 });
    definirModalAberto(true);
  };

  const abrirEdicao = (p: Produto) => {
    definirEditando(p);
    definirFormulario({
      nome: p.nome, codigo_barras: p.codigo_barras || '', categoria_id: p.categoria_id || '',
      preco_custo: p.preco_custo, preco_venda: p.preco_venda, estoque: p.estoque,
      estoque_minimo: p.estoque_minimo, ativo: p.ativo,
      produto_unitario_id: p.produto_unitario_id || '', unidades_por_pacote: p.produto_unitario_id ? p.unidades_por_pacote : 12,
    });
    definirModalAberto(true);
  };

  const salvar = async () => {
    if (!formulario.nome) { toast.error('Preencha o nome do produto'); return; }
    if (formulario.produto_unitario_id && (!Number.isInteger(formulario.unidades_por_pacote) || formulario.unidades_por_pacote < 2)) { toast.error('Informe pelo menos duas unidades por pacote'); return; }
    definirSalvando(true);
    try {
      await salvarProduto({
        ...(editando ? { id: editando.id } : {}),
        nome: formulario.nome,
        codigo_barras: formulario.codigo_barras || null,
        categoria_id: formulario.categoria_id || null,
        preco_custo: formulario.preco_custo,
        preco_venda: formulario.preco_venda,
        estoque: formulario.produto_unitario_id ? 0 : formulario.estoque,
        produto_unitario_id: formulario.produto_unitario_id || null,
        unidades_por_pacote: formulario.produto_unitario_id ? formulario.unidades_por_pacote : 1,
        estoque_minimo: formulario.estoque_minimo,
        ativo: formulario.ativo,
      });
      await criarLog({
        tipo: editando ? 'produto_atualizado' : 'produto_criado',
        descricao: `${editando ? 'Editou' : 'Criou'} produto: ${formulario.nome}`,
        usuario_id: usuario?.identificadorUsuario || '',
        usuario_nome: usuario?.nome || '',
      });
      toast.success(editando ? 'Produto atualizado!' : 'Produto criado!');
      definirModalAberto(false);
      carregar();
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    }
    definirSalvando(false);
  };

  const excluir = async (p: Produto) => {
    if (!confirm(`Excluir "${p.nome}"?`)) return;
    try {
      await excluirProduto(p.id);
      await criarLog({
        tipo: 'produto_excluido',
        descricao: `Excluiu produto: ${p.nome}`,
        usuario_id: usuario?.identificadorUsuario || '',
        usuario_nome: usuario?.nome || '',
      });
      toast.success('Produto excluído');
      carregar();
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    }
  };

  const margem = formulario.preco_custo > 0 ? ((formulario.preco_venda - formulario.preco_custo) / formulario.preco_custo) * 100 : 0;

  return (
    <EstruturaAplicacao exigirAdministrador>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Produtos</h1>
            <p className="text-muted-foreground mt-1">{produtos.length} produtos cadastrados</p>
          </div>
          <Button onClick={abrirNovo} className="wine-gradient text-primary-foreground hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> Novo Produto
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={busca} onChange={e => { definirBusca(e.target.value); definirPagina(1); }} placeholder="Buscar por nome ou código..." className="pl-10 bg-secondary border-border" />
          </div>
          <Select value={filtroCategoria} onValueChange={v => { definirFiltroCategoria(v); definirPagina(1); }}>
            <SelectTrigger className="w-[180px] bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="Todos">Todas Categorias</SelectItem>
              {categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={ordenacao} onValueChange={v => definirOrdenacao(v as typeof ordenacao)}>
            <SelectTrigger className="w-[150px] bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="nome">Nome</SelectItem>
              <SelectItem value="preco">Preço</SelectItem>
              <SelectItem value="estoque">Estoque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {carregando ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Produto</th>
                    <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Código</th>
                    <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Categoria</th>
                    <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium">Custo</th>
                    <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium">Venda</th>
                    <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium">Margem</th>
                    <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium">Estoque</th>
                    <th className="px-4 py-3 text-center text-xs text-muted-foreground font-medium">Status</th>
                    <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginados.map(p => {
                    const m = p.preco_custo > 0 ? ((p.preco_venda - p.preco_custo) / p.preco_custo) * 100 : 0;
                    return (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-foreground font-medium">{p.nome}{p.produto_unitario_id && <span className="block text-xs text-muted-foreground">Pacote de {p.unidades_por_pacote} · {produtos.find(unitario => unitario.id === p.produto_unitario_id)?.nome}</span>}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{p.codigo_barras || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{p.categoria_nome}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-muted-foreground">R$ {p.preco_custo.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gold font-medium">R$ {p.preco_venda.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right text-success">{m.toFixed(1)}%</td>
                        <td className={`px-4 py-3 text-sm text-right font-medium ${p.estoque <= p.estoque_minimo ? 'text-destructive' : 'text-foreground'}`}>{p.estoque}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded ${p.ativo ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                            {p.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => abrirEdicao(p)} className="p-1.5 rounded hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => excluir(p)} className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-xs text-muted-foreground">{filtrados.length} resultados</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => definirPagina(p => Math.max(1, p - 1))} disabled={pagina === 1} className="p-1 rounded hover:bg-muted disabled:opacity-30"><ChevronLeft className="w-4 h-4 text-foreground" /></button>
                  <span className="text-sm text-foreground">{pagina} / {totalPaginas}</span>
                  <button onClick={() => definirPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas} className="p-1 rounded hover:bg-muted disabled:opacity-30"><ChevronRight className="w-4 h-4 text-foreground" /></button>
                </div>
              </div>
            )}
          </div>
        )}

        <Dialog open={modalAberto} onOpenChange={definirModalAberto}>
          <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">{editando ? 'Editar' : 'Novo'} Produto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label className="text-foreground text-xs">Nome</Label>
                  <Input id="nome-produto" aria-label="Nome do produto" value={formulario.nome} onChange={e => definirFormulario(f => ({ ...f, nome: e.target.value }))} className="bg-secondary border-border" />
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground text-xs">Código de Barras</Label>
                  <Input value={formulario.codigo_barras} onChange={e => definirFormulario(f => ({ ...f, codigo_barras: e.target.value }))} className="bg-secondary border-border" />
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground text-xs">Categoria</Label>
                  <Select value={formulario.categoria_id} onValueChange={v => definirFormulario(f => ({ ...f, categoria_id: v }))}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {categorias.filter(c => c.ativo).map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground text-xs">Preço de Custo</Label>
                  <Input type="number" value={formulario.preco_custo || ''} onChange={e => definirFormulario(f => ({ ...f, preco_custo: parseFloat(e.target.value) || 0 }))} className="bg-secondary border-border" min={0} step={0.01} />
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground text-xs">Preço de Venda</Label>
                  <Input type="number" value={formulario.preco_venda || ''} onChange={e => definirFormulario(f => ({ ...f, preco_venda: parseFloat(e.target.value) || 0 }))} className="bg-secondary border-border" min={0} step={0.01} />
                </div>
                <div className="col-span-2 p-2 rounded bg-secondary/50 text-sm text-muted-foreground">
                  Margem de lucro: <span className={`font-bold ${margem > 0 ? 'text-success' : 'text-destructive'}`}>{margem.toFixed(1)}%</span>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-foreground text-xs">Estoque vinculado</Label>
                  <Select value={formulario.produto_unitario_id || 'proprio'} onValueChange={valor => definirFormulario(atual => ({ ...atual, produto_unitario_id: valor === 'proprio' ? '' : valor }))}>
                    <SelectTrigger aria-label="Estoque vinculado" className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="proprio">Produto unitário / estoque próprio</SelectItem>
                      {produtos.filter(unitario => unitario.ativo && !unitario.produto_unitario_id && unitario.id !== editando?.id).map(unitario => <SelectItem key={unitario.id} value={unitario.id}>{unitario.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {formulario.produto_unitario_id ? (
                  <div className="space-y-1">
                    <Label className="text-foreground text-xs">Unidades por pacote</Label>
                    <Input aria-label="Unidades por pacote" type="number" min={2} step={1} value={formulario.unidades_por_pacote} onChange={evento => definirFormulario(atual => ({ ...atual, unidades_por_pacote: Number(evento.target.value) }))} className="bg-secondary border-border" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label className="text-foreground text-xs">Estoque Atual</Label>
                    <Input aria-label="Estoque atual" type="number" value={formulario.estoque || ''} onChange={e => definirFormulario(f => ({ ...f, estoque: parseInt(e.target.value) || 0 }))} className="bg-secondary border-border" min={0} disabled={!!editando} />
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-foreground text-xs">Estoque Mínimo</Label>
                  <Input type="number" value={formulario.estoque_minimo || ''} onChange={e => definirFormulario(f => ({ ...f, estoque_minimo: parseInt(e.target.value) || 0 }))} className="bg-secondary border-border" min={0} />
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <Label className="text-foreground text-xs">Produto Ativo</Label>
                  <Switch checked={formulario.ativo} onCheckedChange={v => definirFormulario(f => ({ ...f, ativo: v }))} />
                </div>
              </div>
              <Button onClick={salvar} disabled={salvando} className="w-full wine-gradient text-primary-foreground hover:opacity-90">
                {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar Produto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </EstruturaAplicacao>
  );
};

export default Produtos;
