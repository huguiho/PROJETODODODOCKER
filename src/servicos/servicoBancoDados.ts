// Serviço centralizado para todas as operações com o banco de dados
import { supabase } from '@/integrations/supabase/client';
import type { Json, Tables, TablesInsert } from '@/integrations/supabase/types';
import { calcularEstoquesDisponiveis } from './estoqueCompartilhado';

// ===== TIPOS =====
export type Produto = Tables<'produtos'> & { categoria_nome?: string };
export type Categoria = Tables<'categorias'>;
export type Venda = Tables<'vendas'>;
export type ItemVenda = Tables<'itens_venda'>;
export type MovimentacaoEstoque = Tables<'movimentacoes_estoque'>;
export type LogAtividade = Tables<'logs_atividade'>;
export type Configuracao = Tables<'configuracoes'>;
export type Perfil = Tables<'perfis'>;
export type PapelUsuario = Tables<'papeis_usuarios'>;

export type VendaCompleta = Venda & { itens: ItemVenda[] };

// ===== CATEGORIAS =====
export async function buscarCategorias(): Promise<Categoria[]> {
  const { data: dados, error: erro } = await supabase
    .from('categorias')
    .select('*')
    .order('nome');
  if (erro) throw erro;
  return dados || [];
}

export async function salvarCategoria(categoria: TablesInsert<'categorias'>): Promise<Categoria> {
  const { data: dados, error: erro } = await supabase
    .from('categorias')
    .upsert(categoria)
    .select()
    .single();
  if (erro) throw erro;
  return dados;
}

export async function excluirCategoria(id: string): Promise<void> {
  const { error: erro } = await supabase.from('categorias').delete().eq('id', id);
  if (erro) throw erro;
}

// ===== PRODUTOS =====
export async function buscarProdutos(): Promise<Produto[]> {
  const { data: dados, error: erro } = await supabase
    .from('produtos')
    .select('*, categorias!produtos_categoria_id_fkey(nome)')
    .order('nome');
  if (erro) throw erro;
  return calcularEstoquesDisponiveis((dados || []).map((p) => ({
    ...p,
    categoria_nome: p.categorias?.nome || 'Sem categoria',
  })));
}

export async function salvarProduto(produto: TablesInsert<'produtos'>): Promise<Produto> {
  // Editar o cadastro não deve sobrescrever o saldo que outra venda acabou de baixar.
  const { estoque, ...cadastro } = produto;
  const { data: dados, error: erro } = await supabase
    .from('produtos')
    .upsert(produto.id ? cadastro : { ...cadastro, estoque })
    .select('*, categorias!produtos_categoria_id_fkey(nome)')
    .single();
  if (erro) throw erro;
  return { ...dados, categoria_nome: dados.categorias?.nome || 'Sem categoria' };
}

export async function excluirProduto(id: string): Promise<void> {
  const { error: erro } = await supabase.from('produtos').delete().eq('id', id);
  if (erro) throw erro;
}

// ===== VENDAS =====
export async function buscarVendas(): Promise<VendaCompleta[]> {
  const { data: vendas, error: erro } = await supabase
    .from('vendas')
    .select('*')
    .order('created_at', { ascending: false });
  if (erro) throw erro;

  const { data: itens, error: erroItens } = await supabase
    .from('itens_venda')
    .select('*');
  if (erroItens) throw erroItens;

  return (vendas || []).map(v => ({
    ...v,
    itens: (itens || []).filter(i => i.venda_id === v.id),
  }));
}

export async function criarVenda(
  venda: TablesInsert<'vendas'>,
  itens: TablesInsert<'itens_venda'>[],
): Promise<string> {
  // O banco valida e grava venda, itens, baixa e histórico juntos.
  // Se qualquer etapa falhar, nenhuma alteração desta venda permanece.
  const { data: identificadorVenda, error: erro } = await supabase.rpc('registrar_venda_com_estoque', {
    dados_venda: venda,
    dados_itens: itens,
  });
  if (erro) throw erro;
  return identificadorVenda;
}

export async function movimentarEstoque(identificadorProduto: string, tipo: 'entrada' | 'saida' | 'ajuste', quantidade: number, motivo: string): Promise<void> {
  const { error: erro } = await supabase.rpc('registrar_movimentacao_estoque', {
    identificador_produto: identificadorProduto,
    tipo_movimentacao: tipo,
    quantidade_informada: quantidade,
    motivo_informado: motivo,
  });
  if (erro) throw erro;
}

export async function cancelarVenda(id: string): Promise<void> {
  const { error: erro } = await supabase
    .from('vendas')
    .update({ cancelada: true })
    .eq('id', id);
  if (erro) throw erro;
}

// ===== MOVIMENTAÇÕES DE ESTOQUE =====
export async function buscarMovimentacoes(): Promise<MovimentacaoEstoque[]> {
  const { data: dados, error: erro } = await supabase
    .from('movimentacoes_estoque')
    .select('*')
    .order('created_at', { ascending: false });
  if (erro) throw erro;
  return dados || [];
}

// ===== LOGS =====
export async function buscarLogs(): Promise<LogAtividade[]> {
  const { data: dados, error: erro } = await supabase
    .from('logs_atividade')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (erro) throw erro;
  return dados || [];
}

export async function criarLog(log: TablesInsert<'logs_atividade'>): Promise<void> {
  const { error: erro } = await supabase.from('logs_atividade').insert(log);
  if (erro) console.error('Erro ao criar log:', erro);
}

// ===== CONFIGURAÇÕES =====
export async function buscarConfiguracoes(): Promise<Record<string, Json>> {
  const { data: dados, error: erro } = await supabase
    .from('configuracoes')
    .select('*');
  if (erro) throw erro;
  const configuracoes: Record<string, Json> = {};
  (dados || []).forEach(c => {
    configuracoes[c.chave] = c.valor;
  });
  return configuracoes;
}

export async function salvarConfiguracao(chave: string, valor: Json): Promise<void> {
  const { error: erro } = await supabase
    .from('configuracoes')
    .update({ valor })
    .eq('chave', chave);
  if (erro) throw erro;
}

// ===== PERFIS/USUÁRIOS =====
export async function buscarPerfis(): Promise<(Perfil & { papel?: string })[]> {
  const { data: perfis, error: erro } = await supabase
    .from('perfis')
    .select('*')
    .order('nome');
  if (erro) throw erro;

  const { data: papeis } = await supabase
    .from('papeis_usuarios')
    .select('*');

  return (perfis || []).map(p => ({
    ...p,
    papel: papeis?.find(r => r.user_id === p.user_id)?.papel || 'operador',
  }));
}

export async function atualizarPerfil(identificadorUsuario: string, dados: { nome?: string; ativo?: boolean }): Promise<void> {
  const { error: erro } = await supabase
    .from('perfis')
    .update(dados)
    .eq('user_id', identificadorUsuario);
  if (erro) throw erro;
}

export async function atualizarPapel(identificadorUsuario: string, papel: 'admin' | 'operador'): Promise<void> {
  // Verificar se já existe
  const { data: dados } = await supabase
    .from('papeis_usuarios')
    .select('id')
    .eq('user_id', identificadorUsuario)
    .single();

  if (dados) {
    const { error: erro } = await supabase
      .from('papeis_usuarios')
      .update({ papel })
      .eq('user_id', identificadorUsuario);
    if (erro) throw erro;
  } else {
    const { error: erro } = await supabase
      .from('papeis_usuarios')
      .insert({ user_id: identificadorUsuario, papel });
    if (erro) throw erro;
  }
}
