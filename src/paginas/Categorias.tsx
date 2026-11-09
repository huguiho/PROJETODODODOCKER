import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, FolderOpen } from 'lucide-react';
import { Button } from '@/componentes/interface/button';
import { Input } from '@/componentes/interface/input';
import { Label } from '@/componentes/interface/label';
import { buscarCategorias, salvarCategoria, excluirCategoria, criarLog, type Categoria } from '@/servicos/servicoBancoDados';
import { useAutenticacao } from '@/contextos/ContextoAutenticacao';
import EstruturaAplicacao from '@/componentes/EstruturaAplicacao';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/componentes/interface/dialog';
import { Switch } from '@/componentes/interface/switch';
import { mensagemErro } from '@/utilitarios/erros';

const Categorias = () => {
  const { usuario } = useAutenticacao();
  const [categorias, definirCategorias] = useState<Categoria[]>([]);
  const [carregando, definirCarregando] = useState(true);
  const [modalAberto, definirModalAberto] = useState(false);
  const [editando, definirEditando] = useState<Categoria | null>(null);
  const [salvando, definirSalvando] = useState(false);
  const [formulario, definirFormulario] = useState({ nome: '', descricao: '', ativo: true });

  const carregar = async () => {
    definirCarregando(true);
    try {
      definirCategorias(await buscarCategorias());
    } catch (e: unknown) {
      toast.error('Erro: ' + mensagemErro(e));
    }
    definirCarregando(false);
  };

  useEffect(() => { carregar(); }, []);

  const abrirNovo = () => {
    definirEditando(null);
    definirFormulario({ nome: '', descricao: '', ativo: true });
    definirModalAberto(true);
  };

  const abrirEdicao = (c: Categoria) => {
    definirEditando(c);
    definirFormulario({ nome: c.nome, descricao: c.descricao || '', ativo: c.ativo });
    definirModalAberto(true);
  };

  const salvar = async () => {
    if (!formulario.nome) { toast.error('Preencha o nome'); return; }
    definirSalvando(true);
    try {
      await salvarCategoria({
        ...(editando ? { id: editando.id } : {}),
        nome: formulario.nome,
        descricao: formulario.descricao || null,
        ativo: formulario.ativo,
      });
      await criarLog({
        tipo: editando ? 'categoria_atualizada' : 'categoria_criada',
        descricao: `${editando ? 'Editou' : 'Criou'} categoria: ${formulario.nome}`,
        usuario_id: usuario?.identificadorUsuario || '',
        usuario_nome: usuario?.nome || '',
      });
      toast.success(editando ? 'Categoria atualizada!' : 'Categoria criada!');
      definirModalAberto(false);
      carregar();
    } catch (e: unknown) {
      toast.error('Erro: ' + mensagemErro(e));
    }
    definirSalvando(false);
  };

  const excluir = async (c: Categoria) => {
    if (!confirm(`Excluir categoria "${c.nome}"?`)) return;
    try {
      await excluirCategoria(c.id);
      toast.success('Categoria excluída');
      carregar();
    } catch (e: unknown) {
      toast.error('Erro: ' + mensagemErro(e));
    }
  };

  return (
    <EstruturaAplicacao exigirAdministrador>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <FolderOpen className="w-8 h-8 text-primary" /> Categorias
            </h1>
            <p className="text-muted-foreground mt-1">{categorias.length} categorias cadastradas</p>
          </div>
          <Button onClick={abrirNovo} className="wine-gradient text-primary-foreground hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> Nova Categoria
          </Button>
        </div>

        {carregando ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorias.map(c => (
              <div key={c.id} className="glass-card p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground text-lg">{c.nome}</p>
                    {c.descricao && <p className="text-xs text-muted-foreground mt-1">{c.descricao}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => abrirEdicao(c)} className="p-1.5 rounded hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => excluir(c)} className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${c.ativo ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                  {c.ativo ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            ))}
          </div>
        )}

        <Dialog open={modalAberto} onOpenChange={definirModalAberto}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">{editando ? 'Editar' : 'Nova'} Categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-foreground text-xs">Nome</Label>
                <Input value={formulario.nome} onChange={e => definirFormulario(f => ({ ...f, nome: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground text-xs">Descrição</Label>
                <Input value={formulario.descricao} onChange={e => definirFormulario(f => ({ ...f, descricao: e.target.value }))} className="bg-secondary border-border" placeholder="Descrição opcional" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-foreground text-xs">Ativa</Label>
                <Switch checked={formulario.ativo} onCheckedChange={v => definirFormulario(f => ({ ...f, ativo: v }))} />
              </div>
              <Button onClick={salvar} disabled={salvando} className="w-full wine-gradient text-primary-foreground hover:opacity-90">
                {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </EstruturaAplicacao>
  );
};

export default Categorias;
