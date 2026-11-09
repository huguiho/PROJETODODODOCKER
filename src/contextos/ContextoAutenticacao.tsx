import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface PerfilUsuario {
  id: string;
  identificadorUsuario: string;
  nome: string;
  email: string;
  papel: 'admin' | 'operador';
  ativo: boolean;
}

interface DadosAutenticacao {
  session: Session | null;
  usuario: PerfilUsuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<{ sucesso: boolean; erro?: string }>;
  registrar: (nome: string, email: string, senha: string) => Promise<{ sucesso: boolean; erro?: string }>;
  sair: () => Promise<void>;
  ehAdministrador: boolean;
  estaAutenticado: boolean;
}

const ContextoAutenticacao = createContext<DadosAutenticacao | undefined>(undefined);

export function ProvedorAutenticacao({ children }: { children: ReactNode }) {
  const [session, definirSessao] = useState<Session | null>(null);
  const [usuario, definirUsuario] = useState<PerfilUsuario | null>(null);
  const [carregando, definirCarregando] = useState(true);

  const carregarPerfil = async (user: User) => {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: dadosPapel } = await supabase
      .from('papeis_usuarios')
      .select('papel')
      .eq('user_id', user.id)
      .single();

    if (perfil) {
      definirUsuario({
        id: perfil.id,
        identificadorUsuario: perfil.user_id,
        nome: perfil.nome,
        email: perfil.email,
        papel: dadosPapel?.papel || 'operador',
        ativo: perfil.ativo,
      });
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (eventoAutenticacao, session) => {
        definirSessao(session);
        if (session?.user) {
          setTimeout(async () => {
            await carregarPerfil(session.user);
            definirCarregando(false);
          }, 0);
        } else {
          definirUsuario(null);
          definirCarregando(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      definirSessao(session);
      if (session?.user) {
        await carregarPerfil(session.user);
      }
      definirCarregando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const entrar = async (email: string, senha: string) => {
    const { error: erro, data: dados } = await supabase.auth.signInWithPassword({ email, password: senha });
    
    if (erro) {
      if (erro.message.includes('Email not confirmed')) {
        return { sucesso: false, erro: 'Email não confirmado. Verifique sua caixa de entrada.' };
      }
      return { sucesso: false, erro: erro.message };
    }

    // Log de atividade
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: perfil } = await supabase.from('perfis').select('nome').eq('user_id', user.id).single();
      await supabase.from('logs_atividade').insert({
        tipo: 'login',
        descricao: `${perfil?.nome || email} fez login`,
        usuario_id: user.id,
        usuario_nome: perfil?.nome || email,
      });
    }

    return { sucesso: true };
  };

  const registrar = async (nome: string, email: string, senha: string) => {
    const { error: erro, data: dados } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });
    if (erro) return { sucesso: false, erro: erro.message };

    // Se o email precisa ser confirmado, não navegar automaticamente
    // O papel será atribuído quando o usuário confirmar o email e fizer login
    if (dados.user && !dados.session) {
      // Email confirmation required - papel será criado após confirmação
      // Tentamos criar o papel agora, mas se falhar, o trigger criará depois
      try {
        await supabase.from('papeis_usuarios').insert({
          user_id: dados.user.id,
          papel: 'operador',
        });
      } catch (e) {
        console.log('Papel será atribuído após confirmação');
      }
    } else if (dados.user && dados.session) {
      const identificadorUsuario = dados.user.id;
      // Auto-confirm está ativado
      setTimeout(async () => {
        await supabase.from('papeis_usuarios').insert({
          user_id: identificadorUsuario,
          papel: 'operador',
        });
      }, 1000);
    }

    return { sucesso: true };
  };

  const sair = async () => {
    if (usuario) {
      await supabase.from('logs_atividade').insert({
        tipo: 'logout',
        descricao: `${usuario.nome} fez logout`,
        usuario_id: usuario.identificadorUsuario,
        usuario_nome: usuario.nome,
      });
    }
    await supabase.auth.signOut();
    definirSessao(null);
    definirUsuario(null);
  };

  return (
    <ContextoAutenticacao.Provider value={{
      session,
      usuario,
      carregando,
      entrar,
      registrar,
      sair,
      ehAdministrador: usuario?.papel === 'admin',
      estaAutenticado: !!session && !!usuario && usuario.ativo,
    }}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}

export function usarAutenticacao() {
  const contexto = useContext(ContextoAutenticacao);
  if (!contexto) throw new Error('usarAutenticacao deve ser usado dentro de ProvedorAutenticacao');
  return contexto;
}
