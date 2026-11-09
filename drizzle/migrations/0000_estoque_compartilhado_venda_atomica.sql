ALTER TABLE public.produtos ADD COLUMN produto_unitario_id uuid REFERENCES public.produtos(id), ADD COLUMN unidades_por_pacote integer NOT NULL DEFAULT 1;
ALTER TABLE public.produtos ADD CONSTRAINT produtos_pacote_valido CHECK ((produto_unitario_id IS NULL AND unidades_por_pacote = 1) OR (produto_unitario_id IS NOT NULL AND produto_unitario_id <> id AND unidades_por_pacote > 1));
ALTER TABLE public.movimentacoes_estoque ADD COLUMN venda_id uuid REFERENCES public.vendas(id);
CREATE INDEX movimentacoes_estoque_venda_idx ON public.movimentacoes_estoque(venda_id);
CREATE OR REPLACE FUNCTION public.validar_vinculo_pacote() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.produto_unitario_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.produtos WHERE id = NEW.produto_unitario_id AND produto_unitario_id IS NULL AND ativo) THEN RAISE EXCEPTION 'Selecione um produto unitário ativo; pacotes não podem conter outros pacotes'; END IF;
    IF EXISTS (SELECT 1 FROM public.produtos WHERE produto_unitario_id = NEW.id) THEN RAISE EXCEPTION 'Este produto já fornece estoque para pacotes'; END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER validar_vinculo_pacote BEFORE INSERT OR UPDATE OF produto_unitario_id, unidades_por_pacote ON public.produtos FOR EACH ROW EXECUTE FUNCTION public.validar_vinculo_pacote();
CREATE OR REPLACE FUNCTION public.registrar_venda_com_estoque(dados_venda jsonb, dados_itens jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  identificador_venda uuid;
  identificador_usuario uuid := auth.uid();
  nome_usuario text;
  item jsonb;
  produto public.produtos%ROWTYPE;
  estoque_base public.produtos%ROWTYPE;
  quantidade_vendida integer;
  unidades_retiradas integer;
  total_itens numeric := 0;
  subtotal_itens numeric := 0;
  identificadores uuid[];
BEGIN
  IF identificador_usuario IS NULL OR NOT EXISTS (SELECT 1 FROM public.perfis WHERE user_id = identificador_usuario AND ativo) THEN RAISE EXCEPTION 'Usuário não autorizado'; END IF;
  SELECT nome INTO nome_usuario FROM public.perfis WHERE user_id = identificador_usuario;
  IF jsonb_typeof(dados_itens) <> 'array' OR jsonb_array_length(dados_itens) = 0 THEN RAISE EXCEPTION 'Carrinho vazio'; END IF;
  SELECT array_agg(DISTINCT identificador) INTO identificadores FROM (
    SELECT (elemento->>'produto_id')::uuid identificador FROM jsonb_array_elements(dados_itens) elemento
    UNION SELECT p.produto_unitario_id FROM public.produtos p JOIN jsonb_array_elements(dados_itens) elemento ON p.id = (elemento->>'produto_id')::uuid WHERE p.produto_unitario_id IS NOT NULL
  ) lista;
  -- Ordem fixa evita disputas entre duas vendas dos mesmos produtos.
  PERFORM id FROM public.produtos WHERE id = ANY(identificadores) ORDER BY id FOR UPDATE;
  FOR item IN SELECT value FROM jsonb_array_elements(dados_itens) LOOP
    SELECT * INTO produto FROM public.produtos WHERE id = (item->>'produto_id')::uuid AND ativo;
    IF NOT FOUND THEN RAISE EXCEPTION 'Produto não encontrado ou inativo'; END IF;
    quantidade_vendida := (item->>'quantidade')::integer;
    IF quantidade_vendida <= 0 OR (item->>'quantidade')::numeric <> quantidade_vendida THEN RAISE EXCEPTION 'Quantidade inválida'; END IF;
    IF (item->>'preco_unitario')::numeric IS DISTINCT FROM produto.preco_venda OR (item->>'preco_custo')::numeric IS DISTINCT FROM produto.preco_custo THEN RAISE EXCEPTION 'Preço atualizado; recarregue os produtos'; END IF;
    IF (item->>'subtotal')::numeric < 0 OR (item->>'subtotal')::numeric > produto.preco_venda * quantidade_vendida THEN RAISE EXCEPTION 'Total do item inválido'; END IF;
    total_itens := total_itens + (item->>'subtotal')::numeric;
    subtotal_itens := subtotal_itens + produto.preco_venda * quantidade_vendida;
  END LOOP;
  IF abs(total_itens - (dados_venda->>'total')::numeric) > 0.01 OR abs(subtotal_itens - (dados_venda->>'subtotal')::numeric) > 0.01 OR (dados_venda->>'taxa_valor')::numeric < 0 OR (dados_venda->>'taxa_valor')::numeric > total_itens OR abs((dados_venda->>'valor_liquido')::numeric - (total_itens - (dados_venda->>'taxa_valor')::numeric)) > 0.01 THEN RAISE EXCEPTION 'Valores da venda inválidos'; END IF;
  INSERT INTO public.vendas(usuario_id, usuario_nome, subtotal, desconto, acrescimo, total, forma_pagamento, taxa_valor, valor_liquido, parcelas)
  VALUES(identificador_usuario, nome_usuario, subtotal_itens, subtotal_itens - total_itens, 0, total_itens, dados_venda->>'forma_pagamento', (dados_venda->>'taxa_valor')::numeric, (dados_venda->>'valor_liquido')::numeric, COALESCE((dados_venda->>'parcelas')::integer,1)) RETURNING id INTO identificador_venda;
  FOR item IN SELECT value FROM jsonb_array_elements(dados_itens) LOOP
    SELECT * INTO produto FROM public.produtos WHERE id = (item->>'produto_id')::uuid;
    SELECT * INTO estoque_base FROM public.produtos WHERE id = COALESCE(produto.produto_unitario_id, produto.id) AND ativo;
    IF NOT FOUND THEN RAISE EXCEPTION 'Produto unitário inativo'; END IF;
    quantidade_vendida := (item->>'quantidade')::integer;
    unidades_retiradas := quantidade_vendida * produto.unidades_por_pacote;
    IF estoque_base.estoque < unidades_retiradas THEN RAISE EXCEPTION 'Estoque insuficiente para %: disponível %, necessário %', produto.nome, estoque_base.estoque, unidades_retiradas; END IF;
    INSERT INTO public.itens_venda(venda_id, produto_id, produto_nome, quantidade, preco_unitario, preco_custo, subtotal) VALUES(identificador_venda, produto.id, produto.nome, quantidade_vendida, produto.preco_venda, produto.preco_custo, (item->>'subtotal')::numeric);
    UPDATE public.produtos SET estoque = estoque_base.estoque - unidades_retiradas WHERE id = estoque_base.id;
    INSERT INTO public.movimentacoes_estoque(produto_id, produto_nome, tipo, quantidade, estoque_anterior, estoque_novo, motivo, usuario_id, usuario_nome, venda_id)
    VALUES(estoque_base.id, estoque_base.nome, 'saida', unidades_retiradas, estoque_base.estoque, estoque_base.estoque - unidades_retiradas, 'Venda ' || left(identificador_venda::text,8) || ': ' || quantidade_vendida || ' × ' || produto.nome, identificador_usuario, nome_usuario, identificador_venda);
  END LOOP;
  INSERT INTO public.logs_atividade(tipo, descricao, usuario_id, usuario_nome, metadados) VALUES('venda','Venda de R$ ' || total_itens || ' via ' || (dados_venda->>'forma_pagamento'),identificador_usuario,nome_usuario,jsonb_build_object('venda_id',identificador_venda));
  RETURN identificador_venda;
END $$;
REVOKE ALL ON FUNCTION public.registrar_venda_com_estoque(jsonb,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.registrar_venda_com_estoque(jsonb,jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.registrar_movimentacao_estoque(identificador_produto uuid, tipo_movimentacao text, quantidade_informada integer, motivo_informado text DEFAULT '') RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE produto public.produtos%ROWTYPE; novo_estoque integer; nome_usuario text;
BEGIN
  IF auth.uid() IS NULL OR NOT public.tem_papel(auth.uid(),'admin') THEN RAISE EXCEPTION 'Somente administradores podem movimentar estoque'; END IF;
  SELECT * INTO produto FROM public.produtos WHERE id = identificador_produto FOR UPDATE;
  IF NOT FOUND OR produto.produto_unitario_id IS NOT NULL THEN RAISE EXCEPTION 'Movimente o produto unitário, não o pacote'; END IF;
  IF quantidade_informada < 0 OR (tipo_movimentacao <> 'ajuste' AND quantidade_informada = 0) THEN RAISE EXCEPTION 'Quantidade inválida'; END IF;
  CASE tipo_movimentacao WHEN 'entrada' THEN novo_estoque := produto.estoque + quantidade_informada; WHEN 'saida' THEN novo_estoque := produto.estoque - quantidade_informada; WHEN 'ajuste' THEN novo_estoque := quantidade_informada; ELSE RAISE EXCEPTION 'Tipo inválido'; END CASE;
  IF novo_estoque < 0 THEN RAISE EXCEPTION 'Estoque insuficiente'; END IF;
  SELECT nome INTO nome_usuario FROM public.perfis WHERE user_id = auth.uid() AND ativo;
  IF nome_usuario IS NULL THEN RAISE EXCEPTION 'Usuário inativo'; END IF;
  UPDATE public.produtos SET estoque = novo_estoque WHERE id = produto.id;
  INSERT INTO public.movimentacoes_estoque(produto_id,produto_nome,tipo,quantidade,estoque_anterior,estoque_novo,motivo,usuario_id,usuario_nome) VALUES(produto.id,produto.nome,tipo_movimentacao,abs(novo_estoque-produto.estoque),produto.estoque,novo_estoque,COALESCE(NULLIF(motivo_informado,''),'Movimentação manual'),auth.uid(),nome_usuario);
  INSERT INTO public.logs_atividade(tipo,descricao,usuario_id,usuario_nome) VALUES('estoque_'||tipo_movimentacao,produto.nome||': '||produto.estoque||' → '||novo_estoque,auth.uid(),nome_usuario);
END $$;
REVOKE ALL ON FUNCTION public.registrar_movimentacao_estoque(uuid,text,integer,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.registrar_movimentacao_estoque(uuid,text,integer,text) TO authenticated;