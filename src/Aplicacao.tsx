import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/componentes/interface/sonner";
import { Toaster } from "@/componentes/interface/toaster";
import { TooltipProvider } from "@/componentes/interface/tooltip";
import { ProvedorAutenticacao } from "@/contextos/ContextoAutenticacao";
import Entrar from "./paginas/Entrar";
import Cadastro from "./paginas/Cadastro";
import Painel from "./paginas/Painel";
import Vendas from "./paginas/Vendas";
import Produtos from "./paginas/Produtos";
import Categorias from "./paginas/Categorias";
import Estoque from "./paginas/Estoque";
import Relatorios from "./paginas/Relatorios";
import Usuarios from "./paginas/Usuarios";
import Atividades from "./paginas/Atividades";
import Configuracoes from "./paginas/Configuracoes";
import PaginaNaoEncontrada from "./paginas/PaginaNaoEncontrada";
import Demonstracao from "./paginas/Demonstracao";

const clienteConsultas = new QueryClient();

const Aplicacao = () => (
  <QueryClientProvider client={clienteConsultas}>
    <TooltipProvider>
      <ProvedorAutenticacao>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Entrar />} />
            <Route path="/register" element={<Cadastro />} />
            <Route path="/dashboard" element={<Painel />} />
            <Route path="/sales" element={<Vendas />} />
            <Route path="/products" element={<Produtos />} />
            <Route path="/categories" element={<Categorias />} />
            <Route path="/stock" element={<Estoque />} />
            <Route path="/reports" element={<Relatorios />} />
            <Route path="/users" element={<Usuarios />} />
            <Route path="/activity" element={<Atividades />} />
            <Route path="/settings" element={<Configuracoes />} />
            <Route path="/showcase" element={<Demonstracao />} />
            <Route path="*" element={<PaginaNaoEncontrada />} />
          </Routes>
        </BrowserRouter>
      </ProvedorAutenticacao>
    </TooltipProvider>
  </QueryClientProvider>
);

export default Aplicacao;
