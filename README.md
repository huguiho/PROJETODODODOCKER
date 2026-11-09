# Sistema PDV — Ponto de Venda

Um sistema **PDV (Ponto de Venda)** completo e profissional para pequenos e médios comércios. Desenvolvido com foco em usabilidade, responsividade e dados reais persistidos em nuvem.

---

## Funcionalidades Principais

| Módulo | Descrição |
|--------|-----------|
| **Dashboard** | Visão geral do negócio com gráficos de vendas, produtos mais vendidos e alertas de estoque baixo |
| **PDV de Vendas** | Tela de vendas com carrinho, busca rápida, filtros por categoria, pagamento misto (PIX + dinheiro, etc.) e histórico de cupons |
| **Cadastro de Produtos** | CRUD completo de produtos com controle de estoque mínimo, código de barras e preços |
| **Categorias** | Organização dos produtos por categorias personalizáveis |
| **Controle de Estoque** | Movimentações de entrada e saída, alertas automáticos de estoque baixo |
| **Relatórios** | Relatórios de vendas, produtos e movimentações com gráficos e tabelas |
| **Gestão de Usuários** | Cadastro de operadores do sistema com controle de acesso |
| **Log de Atividades** | Registro de todas as ações realizadas no sistema |
| **Configurações** | Personalização do sistema para o negócio |

### Destaques Técnicos

- **Responsivo** — Funciona em desktops, tablets e celulares. No mobile, o carrinho vira uma gaveta deslizante.
- **Pagamento Misto** — Permite dividir uma venda em múltiplas formas de pagamento (ex: metade PIX, metade dinheiro).
- **Confirmação de E-mail** — Fluxo de verificação de e-mail no cadastro para maior segurança.
- **Notificações de Estoque** — Alertas automáticos quando produtos atingem o estoque mínimo.
- **Histórico de Cupons** — Visualize e reimprima cupons de vendas anteriores.
- **Atalhos de Teclado** — Navegação rápida com teclas de atalho (F2, F4, F8, etc.) no PDV.

---

## Tecnologias Utilizadas

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (estilização)
- **shadcn/ui** (componentes de UI)
- **Supabase** (banco de dados PostgreSQL, autenticação e storage)
- **TanStack Query** (gerenciamento de dados assíncronos)
- **React Router** (navegação)
- **Recharts** (gráficos e dashboards)
- **React Hook Form + Zod** (formulários e validação)
- **jsPDF + AutoTable** (geração de relatórios PDF)

---

## Como Rodar o Projeto

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm, yarn, pnpm ou bun

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd <nome-do-projeto>

# Instale as dependências
npm install
# ou
bun install

# Configure as variáveis de ambiente
# Crie um arquivo .env na raiz com:
# VITE_SUPABASE_URL=<sua-url-do-supabase>
# VITE_SUPABASE_ANON_KEY=<sua-chave-anon>

# Inicie o servidor de desenvolvimento
npm run dev
# ou
bun dev
```

O projeto estará disponível em `http://localhost:5173`.

### Build para produção

```bash
npm run build
# ou
bun run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

---

## Estrutura do Projeto

```
├── public/              # Arquivos estáticos
├── src/
│   ├── components/        # Componentes reutilizáveis (shadcn/ui + customizados)
│   ├── contexts/          # Contextos React (autenticação, etc.)
│   ├── hooks/             # Hooks customizados
│   ├── integrations/      # Integrações externas (Supabase)
│   ├── lib/               # Utilitários e helpers
│   ├── pages/             # Páginas do sistema
│   │   ├── Dashboard.tsx
│   │   ├── Sales.tsx        # PDV de vendas
│   │   ├── Products.tsx
│   │   ├── Categories.tsx
│   │   ├── Stock.tsx
│   │   ├── Reports.tsx
│   │   ├── UsersPage.tsx
│   │   ├── Activity.tsx
│   │   └── Settings.tsx
│   ├── services/          # Serviços de API/Supabase
│   ├── types/             # Tipos TypeScript
│   └── App.tsx            # Rotas principais
├── supabase/              # Configurações e migrations do Supabase
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## Como Usar o Sistema

### 1. Primeiro Acesso

1. Acesse a tela de **Cadastro** (`/register`) e crie uma conta.
2. Confirme seu e-mail através do link enviado.
3. Faça login na tela de **Login** (`/`).

### 2. Dashboard

Após o login, você verá o **Dashboard** com:
- Resumo de vendas do dia/mês
- Produtos mais vendidos
- Alertas de estoque baixo
- Gráficos de faturamento

### 3. PDV de Vendas (`/sales`)

A tela principal de vendas:
- **Busca rápida** — Digite o nome ou código do produto.
- **Filtros** — Filtre produtos por categoria.
- **Carrinho** — Adicione produtos e ajuste quantidades.
- **Pagamento** — Escolha uma ou mais formas de pagamento (dinheiro, PIX, cartão débito, cartão crédito).
- **Histórico** — Clique no botão de histórico para ver vendas anteriores e reimprimir cupons.

> **Dica:** Use os atalhos de teclado exibidos na tela para agilizar o atendimento.

### 4. Cadastro de Produtos (`/products`)

- Cadastre produtos com nome, preço, estoque, estoque mínimo, código de barras e categoria.
- O sistema alerta automaticamente quando um produto atinge o estoque mínimo.

### 5. Controle de Estoque (`/stock`)

- Registre entradas e saídas de produtos.
- Acompanhe o saldo em tempo real.
- Visualize o histórico de movimentações.

### 6. Relatórios (`/reports`)

- Exporte relatórios de vendas e estoque em PDF.
- Filtre por período e categoria.

---

## Screenshots

> Adicione aqui screenshots das principais telas do sistema (Dashboard, PDV, Relatórios).

---

## Contribuição

Contribuições são bem-vindas! Siga os passos:

1. Faça um fork do projeto.
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`).
3. Commit suas mudanças (`git commit -m 'feat: nova funcionalidade'`).
4. Push para a branch (`git push origin feature/nova-funcionalidade`).
5. Abra um Pull Request.

---

## Licença

Este projeto foi desenvolvido para fins acadêmicos (TCC). Consulte o autor para uso comercial.

---

## Autor

Desenvolvido como Trabalho de Conclusão de Curso (TCC).

---

> **Nota:** Este projeto utiliza o **Supabase** como backend (banco de dados PostgreSQL + autenticação). Certifique-se de configurar corretamente as variáveis de ambiente antes de rodar.
