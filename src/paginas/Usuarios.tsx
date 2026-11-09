import { useState, useEffect } from 'react';
import { Shield, UserIcon, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/componentes/interface/button';
import { Label } from '@/componentes/interface/label';
import { buscarPerfis, atualizarPerfil, atualizarPapel, criarLog, type Perfil } from '@/servicos/servicoBancoDados';
import { usarAutenticacao } from '@/contextos/ContextoAutenticacao';
import EstruturaAplicacao from '@/componentes/EstruturaAplicacao';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/componentes/interface/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentes/interface/select';
import { Switch } from '@/componentes/interface/switch';
import { Input } from '@/componentes/interface/input';

const Usuarios = () => {
  const { usuario } = usarAutenticacao();
  const [perfis, definirPerfis] = useState<(Perfil & { papel?: string })[]>([]);
  const [carregando, definirCarregando] = useState(true);
  const [modalAberto, definirModalAberto] = useState(false);
  const [editando, definirEditando] = useState<(Perfil & { papel?: string }) | null>(null);
  const [salvando, definirSalvando] = useState(false);
  const [formulario, definirFormulario] = useState({ nome: '', papel: 'operador' as 'admin' | 'operador', ativo: true });

  const carregar = async () => {
    definirCarregando(true);
    try {
      definirPerfis(await buscarPerfis());
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    }
    definirCarregando(false);
  };

  useEffect(() => { carregar(); }, []);

  const abrirEdicao = (p: Perfil & { papel?: string }) => {
    definirEditando(p);
    definirFormulario({ nome: p.nome, papel: (p.papel as 'admin' | 'operador') || 'operador', ativo: p.ativo });
    definirModalAberto(true);
  };

  const salvar = async () => {
    if (!editando) return;
    definirSalvando(true);
    try {
      await atualizarPerfil(editando.user_id, { nome: formulario.nome, ativo: formulario.ativo });
      await atualizarPapel(editando.user_id, formulario.papel);
      await criarLog({
        tipo: 'usuario_atualizado',
        descricao: `Editou usuário: ${formulario.nome}`,
        usuario_id: usuario?.identificadorUsuario || '',
        usuario_nome: usuario?.nome || '',
      });
      toast.success('Usuário atualizado!');
      definirModalAberto(false);
      carregar();
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    }
    definirSalvando(false);
  };

  return (
    <EstruturaAplicacao exigirAdministrador>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground mt-1">{perfis.length} usuários cadastrados</p>
          <p className="text-xs text-muted-foreground mt-2">Novos usuários são criados pela tela de registro. Aqui você pode editar permissões.</p>
        </div>

        {carregando ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {perfis.map(p => (
              <div key={p.id} className="glass-card p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold">
                      {p.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{p.nome}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </div>
                  </div>
                  <button onClick={() => abrirEdicao(p)} className="p-1.5 rounded hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${p.papel === 'admin' ? 'bg-gold/20 text-gold' : 'bg-primary/20 text-primary'}`}>
                    {p.papel === 'admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                    {p.papel === 'admin' ? 'Administrador' : 'Operador'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${p.ativo ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={modalAberto} onOpenChange={definirModalAberto}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">Editar Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-foreground text-xs">Nome</Label>
                <Input value={formulario.nome} onChange={e => definirFormulario(f => ({ ...f, nome: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground text-xs">Função</Label>
                <Select value={formulario.papel} onValueChange={v => definirFormulario(f => ({ ...f, papel: v as 'admin' | 'operador' }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="operador">Operador de Caixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-foreground text-xs">Ativo</Label>
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

export default Usuarios;
