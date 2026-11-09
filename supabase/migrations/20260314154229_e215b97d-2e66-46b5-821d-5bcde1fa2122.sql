
-- Função para atualizar timestamps automaticamente
CREATE OR REPLACE FUNCTION public.atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ===== PERFIS DE USUÁRIOS =====
CREATE TABLE public.perfis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfis visíveis para autenticados" ON public.perfis
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuário pode atualizar próprio perfil" ON public.perfis
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Inserir próprio perfil" ON public.perfis
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER atualizar_perfis_updated_at
  BEFORE UPDATE ON public.perfis
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_updated_at();

-- Trigger para criar perfil automaticamente no signup
CREATE OR REPLACE FUNCTION public.criar_perfil_no_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis (user_id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.criar_perfil_no_signup();

-- ===== ROLES DE USUÁRIOS =====
CREATE TYPE public.papel_usuario AS ENUM ('admin', 'operador');

CREATE TABLE public.papeis_usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  papel papel_usuario NOT NULL DEFAULT 'operador',
  UNIQUE (user_id, papel)
);

ALTER TABLE public.papeis_usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Papéis visíveis para autenticados" ON public.papeis_usuarios
  FOR SELECT TO authenticated USING (true);

-- Função para verificar papel
CREATE OR REPLACE FUNCTION public.tem_papel(_user_id UUID, _papel papel_usuario)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.papeis_usuarios
    WHERE user_id = _user_id AND papel = _papel
  )
$$;

-- Admins podem gerenciar papéis
CREATE POLICY "Admins inserem papéis" ON public.papeis_usuarios
  FOR INSERT TO authenticated
  WITH CHECK (public.tem_papel(auth.uid(), 'admin'));

CREATE POLICY "Admins deletam papéis" ON public.papeis_usuarios
  FOR DELETE TO authenticated
  USING (public.tem_papel(auth.uid(), 'admin'));

CREATE POLICY "Admins atualizam papéis" ON public.papeis_usuarios
  FOR UPDATE TO authenticated
  USING (public.tem_papel(auth.uid(), 'admin'));

-- ===== CATEGORIAS =====
CREATE TABLE public.categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorias visíveis para autenticados" ON public.categorias
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins inserem categorias" ON public.categorias
  FOR INSERT TO authenticated
  WITH CHECK (public.tem_papel(auth.uid(), 'admin'));

CREATE POLICY "Admins atualizam categorias" ON public.categorias
  FOR UPDATE TO authenticated
  USING (public.tem_papel(auth.uid(), 'admin'));

CREATE POLICY "Admins deletam categorias" ON public.categorias
  FOR DELETE TO authenticated
  USING (public.tem_papel(auth.uid(), 'admin'));

CREATE TRIGGER atualizar_categorias_updated_at
  BEFORE UPDATE ON public.categorias
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_updated_at();

-- ===== PRODUTOS =====
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  codigo_barras TEXT UNIQUE,
  categoria_id UUID REFERENCES public.categorias(id),
  preco_custo NUMERIC(10,2) NOT NULL DEFAULT 0,
  preco_venda NUMERIC(10,2) NOT NULL,
  estoque INTEGER NOT NULL DEFAULT 0,
  estoque_minimo INTEGER NOT NULL DEFAULT 5,
  ativo BOOLEAN NOT NULL DEFAULT true,
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Produtos visíveis para autenticados" ON public.produtos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins inserem produtos" ON public.produtos
  FOR INSERT TO authenticated
  WITH CHECK (public.tem_papel(auth.uid(), 'admin'));

CREATE POLICY "Autenticados atualizam produtos" ON public.produtos
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Admins deletam produtos" ON public.produtos
  FOR DELETE TO authenticated
  USING (public.tem_papel(auth.uid(), 'admin'));

CREATE TRIGGER atualizar_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_updated_at();

-- ===== VENDAS =====
CREATE TABLE public.vendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  usuario_nome TEXT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  desconto NUMERIC(10,2) NOT NULL DEFAULT 0,
  acrescimo NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  forma_pagamento TEXT NOT NULL,
  taxa_valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_liquido NUMERIC(10,2) NOT NULL,
  parcelas INTEGER DEFAULT 1,
  cancelada BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendas visíveis para autenticados" ON public.vendas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Autenticados criam vendas" ON public.vendas
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Admins atualizam vendas" ON public.vendas
  FOR UPDATE TO authenticated
  USING (public.tem_papel(auth.uid(), 'admin'));

-- ===== ITENS DA VENDA =====
CREATE TABLE public.itens_venda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id UUID NOT NULL REFERENCES public.vendas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  produto_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario NUMERIC(10,2) NOT NULL,
  preco_custo NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL
);

ALTER TABLE public.itens_venda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Itens visíveis para autenticados" ON public.itens_venda
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Autenticados criam itens" ON public.itens_venda
  FOR INSERT TO authenticated WITH CHECK (true);

-- ===== MOVIMENTAÇÕES DE ESTOQUE =====
CREATE TABLE public.movimentacoes_estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  produto_nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste')),
  quantidade INTEGER NOT NULL,
  estoque_anterior INTEGER NOT NULL,
  estoque_novo INTEGER NOT NULL,
  motivo TEXT,
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  usuario_nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Movimentações visíveis para autenticados" ON public.movimentacoes_estoque
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Autenticados criam movimentações" ON public.movimentacoes_estoque
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);

-- ===== CONFIGURAÇÕES DA LOJA =====
CREATE TABLE public.configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  valor JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Configurações visíveis para autenticados" ON public.configuracoes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins inserem configurações" ON public.configuracoes
  FOR INSERT TO authenticated
  WITH CHECK (public.tem_papel(auth.uid(), 'admin'));

CREATE POLICY "Admins atualizam configurações" ON public.configuracoes
  FOR UPDATE TO authenticated
  USING (public.tem_papel(auth.uid(), 'admin'));

CREATE POLICY "Admins deletam configurações" ON public.configuracoes
  FOR DELETE TO authenticated
  USING (public.tem_papel(auth.uid(), 'admin'));

-- ===== LOGS DE ATIVIDADE =====
CREATE TABLE public.logs_atividade (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  usuario_nome TEXT NOT NULL,
  metadados JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.logs_atividade ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Logs visíveis para autenticados" ON public.logs_atividade
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Autenticados criam logs" ON public.logs_atividade
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);

-- ===== DADOS INICIAIS =====
INSERT INTO public.categorias (nome, descricao) VALUES
  ('Vinhos Tintos', 'Vinhos tintos nacionais e importados'),
  ('Vinhos Brancos', 'Vinhos brancos e rosés'),
  ('Espumantes', 'Espumantes e champanhes'),
  ('Cervejas', 'Cervejas artesanais e importadas'),
  ('Destilados', 'Whisky, vodka, gin e outros destilados'),
  ('Acessórios', 'Taças, abridores e acessórios');

INSERT INTO public.configuracoes (chave, valor) VALUES
  ('loja', '{"nome": "Adega Premium", "endereco": "Rua das Vinhas, 123", "telefone": "(11) 99999-9999", "cnpj": "12.345.678/0001-90"}'::jsonb),
  ('pagamento_debito', '{"ativo": true, "taxa": 1.49}'::jsonb),
  ('pagamento_credito_avista', '{"ativo": true, "taxa": 2.99}'::jsonb),
  ('pagamento_credito_parcelado', '{"ativo": true, "taxas": {"2": 3.49, "3": 4.49, "4": 5.49, "5": 6.49, "6": 7.49}}'::jsonb),
  ('pagamento_pix', '{"ativo": true, "taxa": 0.99}'::jsonb),
  ('pagamento_dinheiro', '{"ativo": true, "taxa": 0}'::jsonb);
