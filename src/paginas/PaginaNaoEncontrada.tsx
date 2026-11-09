import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const PaginaNaoEncontrada = () => {
  const localizacao = useLocation();

  useEffect(() => {
    console.error("Erro 404: tentativa de acessar página inexistente:", localizacao.pathname);
  }, [localizacao.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Página não encontrada</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Voltar ao início
        </a>
      </div>
    </div>
  );
};

export default PaginaNaoEncontrada;
