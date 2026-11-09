import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '@/contextos/ContextoAutenticacao';
import BarraLateral from '@/componentes/BarraLateral';
import { Loader2 } from 'lucide-react';

interface PropriedadesEstrutura {
  children: ReactNode;
  exigirAdministrador?: boolean;
}

const EstruturaAplicacao = ({ children, exigirAdministrador: exigirAdministrador = false }: PropriedadesEstrutura) => {
  const { estaAutenticado: estaAutenticado, ehAdministrador: ehAdministrador, carregando } = useAutenticacao();
  const navegar = useNavigate();

  useEffect(() => {
    if (!carregando) {
      if (!estaAutenticado) navegar('/');
      else if (exigirAdministrador && !ehAdministrador) navegar('/sales');
    }
  }, [estaAutenticado, ehAdministrador, exigirAdministrador, navegar, carregando]);

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <BarraLateral />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default EstruturaAplicacao;
