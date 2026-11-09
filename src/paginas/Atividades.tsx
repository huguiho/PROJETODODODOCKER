import { useState, useEffect } from 'react';
import { ClipboardList, Loader2 } from 'lucide-react';
import { buscarLogs, type LogAtividade } from '@/servicos/servicoBancoDados';
import EstruturaAplicacao from '@/componentes/EstruturaAplicacao';
import { toast } from 'sonner';

const rotulosTipos: Record<string, string> = {
  login: 'Login', logout: 'Logout', venda: 'Venda', cancelamento: 'Cancelamento',
  produto_criado: 'Produto Criado', produto_atualizado: 'Produto Editado', produto_excluido: 'Produto Excluído',
  estoque_entrada: 'Entrada Estoque', estoque_saida: 'Saída Estoque', estoque_ajuste: 'Ajuste Estoque',
  usuario_criado: 'Usuário Criado', usuario_atualizado: 'Usuário Editado',
  configuracoes_atualizadas: 'Config. Atualizada', categoria_criada: 'Categoria Criada', categoria_atualizada: 'Categoria Editada',
};

const tipoCores: Record<string, string> = {
  login: 'bg-success/20 text-success', logout: 'bg-muted text-muted-foreground', venda: 'bg-gold/20 text-gold',
  cancelamento: 'bg-destructive/20 text-destructive', produto_criado: 'bg-primary/20 text-primary',
  produto_atualizado: 'bg-primary/20 text-primary', produto_excluido: 'bg-destructive/20 text-destructive',
  estoque_entrada: 'bg-success/20 text-success', estoque_saida: 'bg-destructive/20 text-destructive',
  estoque_ajuste: 'bg-gold/20 text-gold', usuario_criado: 'bg-primary/20 text-primary',
  usuario_atualizado: 'bg-primary/20 text-primary', configuracoes_atualizadas: 'bg-muted text-muted-foreground',
  categoria_criada: 'bg-primary/20 text-primary', categoria_atualizada: 'bg-primary/20 text-primary',
};

const Atividades = () => {
  const [logs, definirLogs] = useState<LogAtividade[]>([]);
  const [carregando, definirCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        definirLogs(await buscarLogs());
      } catch (e: any) {
        toast.error('Erro: ' + e.message);
      }
      definirCarregando(false);
    };
    carregar();
  }, []);

  return (
    <EstruturaAplicacao exigirAdministrador>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-primary" /> Logs de Atividade
          </h1>
          <p className="text-muted-foreground mt-1">{logs.length} atividades registradas</p>
        </div>

        {carregando ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto max-h-[70vh]">
              <table className="w-full">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Data</th>
                    <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Descrição</th>
                    <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Usuário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2 text-xs text-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${tipoCores[log.tipo] || 'bg-muted text-muted-foreground'}`}>
                          {rotulosTipos[log.tipo] || log.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-foreground">{log.descricao}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{log.usuario_nome}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma atividade registrada</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </EstruturaAplicacao>
  );
};

export default Atividades;
