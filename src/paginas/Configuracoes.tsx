import { useState, useEffect } from 'react';
import { Save, Store, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/componentes/interface/button';
import { Input } from '@/componentes/interface/input';
import { Label } from '@/componentes/interface/label';
import { buscarConfiguracoes, salvarConfiguracao, criarLog } from '@/servicos/servicoBancoDados';
import { useAutenticacao } from '@/contextos/ContextoAutenticacao';
import EstruturaAplicacao from '@/componentes/EstruturaAplicacao';
import { toast } from 'sonner';
import { Switch } from '@/componentes/interface/switch';
import { mensagemErro } from '@/utilitarios/erros';
import { lerConfiguracaoLoja, lerConfiguracaoPagamento, type ConfiguracaoPagamento } from '@/utilitarios/configuracoes';

const Configuracoes = () => {
  const { usuario } = useAutenticacao();
  const [carregando, definirCarregando] = useState(true);
  const [salvando, definirSalvando] = useState(false);
  const [loja, definirLoja] = useState({ nome: '', endereco: '', telefone: '', cnpj: '' });
  const [pagamentos, definirPagamentos] = useState<Record<string, ConfiguracaoPagamento>>({});

  useEffect(() => {
    const carregar = async () => {
      try {
        const configuracoes = await buscarConfiguracoes();
        const lojaCarregada = lerConfiguracaoLoja(configuracoes.loja);
        if (lojaCarregada) {
          definirLoja({
            nome: lojaCarregada.nome || '',
            endereco: lojaCarregada.endereco || '',
            telefone: lojaCarregada.telefone || '',
            cnpj: lojaCarregada.cnpj || '',
          });
        }
        // Carregar configs de pagamento
        const pagamentosCarregados: Record<string, ConfiguracaoPagamento> = {};
        ['pagamento_dinheiro', 'pagamento_debito', 'pagamento_credito_avista', 'pagamento_credito_parcelado', 'pagamento_pix'].forEach(k => {
          const pagamento = lerConfiguracaoPagamento(configuracoes[k]);
          if (pagamento) pagamentosCarregados[k] = pagamento;
        });
        definirPagamentos(pagamentosCarregados);
      } catch (e: unknown) {
        toast.error('Erro: ' + mensagemErro(e));
      }
      definirCarregando(false);
    };
    carregar();
  }, []);

  const salvar = async () => {
    definirSalvando(true);
    try {
      await salvarConfiguracao('loja', loja);
      for (const [chave, valor] of Object.entries(pagamentos)) {
        await salvarConfiguracao(chave, valor);
      }
      await criarLog({
        tipo: 'configuracoes_atualizadas',
        descricao: 'Configurações atualizadas',
        usuario_id: usuario?.identificadorUsuario || '',
        usuario_nome: usuario?.nome || '',
      });
      toast.success('Configurações salvas!');
    } catch (e: unknown) {
      toast.error('Erro: ' + mensagemErro(e));
    }
    definirSalvando(false);
  };

  const atualizarPagamento = (chave: string, alteracoes: Partial<ConfiguracaoPagamento>) => {
    definirPagamentos(anterior => ({ ...anterior, [chave]: { ...anterior[chave], ...alteracoes } }));
  };

  const configuracoesPagamento = [
    { chave: 'pagamento_dinheiro', rotulo: 'Dinheiro' },
    { chave: 'pagamento_debito', rotulo: 'Cartão Débito' },
    { chave: 'pagamento_credito_avista', rotulo: 'Crédito à Vista' },
    { chave: 'pagamento_credito_parcelado', rotulo: 'Crédito Parcelado' },
    { chave: 'pagamento_pix', rotulo: 'PIX' },
  ];

  if (carregando) {
    return <EstruturaAplicacao exigirAdministrador><div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></EstruturaAplicacao>;
  }

  return (
    <EstruturaAplicacao exigirAdministrador>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground mt-1">Gerencie seu sistema</p>
          </div>
          <Button onClick={salvar} disabled={salvando} className="wine-gradient text-primary-foreground hover:opacity-90">
            {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Salvar
          </Button>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" /> Dados da Loja
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Nome da Loja</Label>
              <Input value={loja.nome} onChange={e => definirLoja(l => ({ ...l, nome: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">CNPJ</Label>
              <Input value={loja.cnpj} onChange={e => definirLoja(l => ({ ...l, cnpj: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Endereço</Label>
              <Input value={loja.endereco} onChange={e => definirLoja(l => ({ ...l, endereco: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Telefone</Label>
              <Input value={loja.telefone} onChange={e => definirLoja(l => ({ ...l, telefone: e.target.value }))} className="bg-secondary border-border" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold" /> Taxas de Pagamento
          </h2>
          <div className="space-y-4">
            {configuracoesPagamento.map(({ chave, rotulo }) => {
              const configuracao = pagamentos[chave] || { ativo: true, taxa: 0 };
              return (
                <div key={chave} className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">{rotulo}</h3>
                    <Switch checked={configuracao.ativo ?? true} onCheckedChange={v => atualizarPagamento(chave, { ativo: v })} />
                  </div>
                  {chave === 'pagamento_credito_parcelado' ? (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Taxas por Parcela</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[2, 3, 4, 5, 6].map(n => (
                          <div key={n} className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">{n}x</Label>
                            <Input type="number" value={configuracao.taxas?.[String(n)] || ''} onChange={e => {
                              const taxas = { ...(configuracao.taxas || {}), [String(n)]: parseFloat(e.target.value) || 0 };
                              atualizarPagamento(chave, { taxas });
                            }} className="bg-secondary border-border h-7 text-xs" min={0} step={0.01} placeholder="%" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Taxa Percentual (%)</Label>
                      <Input type="number" value={configuracao.taxa || ''} onChange={e => atualizarPagamento(chave, { taxa: parseFloat(e.target.value) || 0 })} className="bg-secondary border-border" min={0} step={0.01} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </EstruturaAplicacao>
  );
};

export default Configuracoes;
