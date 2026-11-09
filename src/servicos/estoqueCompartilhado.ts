/** Uma embalagem não tem estoque próprio: sua disponibilidade vem das unidades. */
export interface ProdutoComEstoque {
  id: string;
  estoque: number;
  produto_unitario_id: string | null;
  unidades_por_pacote: number;
}

export function calcularEstoquesDisponiveis<Produto extends ProdutoComEstoque>(produtos: Produto[]): Produto[] {
  const produtosPorIdentificador = new Map(produtos.map(produto => [produto.id, produto]));
  return produtos.map(produto => {
    if (!produto.produto_unitario_id) return produto;
    const unitario = produtosPorIdentificador.get(produto.produto_unitario_id);
    return { ...produto, estoque: Math.floor((unitario?.estoque ?? 0) / produto.unidades_por_pacote) };
  });
}