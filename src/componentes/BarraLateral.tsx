import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Wine, LayoutDashboard, ShoppingCart, BarChart3, LogOut,
  Package, Boxes, Users, Settings, ClipboardList, ChevronLeft, ChevronRight, FolderOpen
} from 'lucide-react';
import { usarAutenticacao } from '@/contextos/ContextoAutenticacao';
import { useState } from 'react';
import logo from "../assets/favicon.ico"
const itensAdministrador = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'PDV - Vendas', url: '/sales', icon: ShoppingCart },
  { title: 'Produtos', url: '/products', icon: Package },
  { title: 'Categorias', url: '/categories', icon: FolderOpen },
  { title: 'Estoque', url: '/stock', icon: Boxes },
  { title: 'Relatórios', url: '/reports', icon: BarChart3 },
  { title: 'Usuários', url: '/users', icon: Users },
  { title: 'Atividades', url: '/activity', icon: ClipboardList },
  { title: 'Configurações', url: '/settings', icon: Settings },
];

const itensOperador = [
  { title: 'PDV - Vendas', url: '/sales', icon: ShoppingCart },
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
];

const BarraLateral = () => {
  const { usuario, sair, ehAdministrador: ehAdministrador } = usarAutenticacao();
  const navegar = useNavigate();
  const localizacao = useLocation();
  const [recolhida, definirRecolhida] = useState(false);

  const itens = ehAdministrador ? itensAdministrador : itensOperador;

  const realizarSaida = async () => {
    await sair();
    navegar('/');
  };

  return (
    <aside className={`${recolhida ? 'w-16' : 'w-64'} min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300`}>
      <div className={`p-4 border-b border-sidebar-border flex items-center ${recolhida ? 'justify-center' : 'justify-between'}`}>
        {!recolhida && (
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo"
              className="w-7 h-7 object-contain"
            />
            <h2 className="font-display font-bold text-foreground text-base">Adega<span className="gold-text">PDV</span></h2>
          </div>
        )}
        {recolhida && (
          <div className="w-9 h-9 flex items-center justify-center">
  <img
    src={logo}
    alt="Logo"
    className="w-7 h-7 object-contain"
  />
</div>
        )}
      </div>

      <button
        onClick={() => definirRecolhida(!recolhida)}
        className="mx-auto my-2 w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {recolhida ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <nav className="flex-1 px-2 space-y-1">
        {itens.map(item => {
          const estaAtivo = localizacao.pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              title={item.title}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                estaAtivo
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              } ${recolhida ? 'justify-center' : ''}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!recolhida && <span className="font-medium text-sm">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        {!recolhida && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
              {usuario?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{usuario?.nome}</p>
              <p className="text-[10px] text-muted-foreground truncate">{usuario?.papel === 'admin' ? 'Administrador' : 'Operador'}</p>
            </div>
          </div>
        )}
        <button
          onClick={realizarSaida}
          title="Sair"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full ${recolhida ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4" />
          {!recolhida && <span className="text-sm">Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default BarraLateral;
