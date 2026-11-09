
-- Corrigir policy permissiva em produtos (UPDATE)
DROP POLICY "Autenticados atualizam produtos" ON public.produtos;

-- Permitir update apenas para admins ou para o próprio estoque durante vendas
CREATE POLICY "Autenticados atualizam produtos" ON public.produtos
  FOR UPDATE TO authenticated
  USING (public.tem_papel(auth.uid(), 'admin') OR true);

-- Na verdade, operadores precisam atualizar estoque ao vender. 
-- Vamos restringir para que qualquer autenticado possa atualizar apenas estoque
-- Como não dá para restringir colunas em RLS, vamos manter admin-only e usar service role para estoque
DROP POLICY "Autenticados atualizam produtos" ON public.produtos;

CREATE POLICY "Admins atualizam produtos" ON public.produtos
  FOR UPDATE TO authenticated
  USING (public.tem_papel(auth.uid(), 'admin'));

-- Para itens_venda, vincular ao usuario da venda
DROP POLICY "Autenticados criam itens" ON public.itens_venda;

CREATE POLICY "Autenticados criam itens de venda" ON public.itens_venda
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vendas 
      WHERE vendas.id = venda_id 
      AND vendas.usuario_id = auth.uid()
    )
  );
