import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/componentes/interface/button';
import { Input } from '@/componentes/interface/input';
import { Label } from '@/componentes/interface/label';
import { useAutenticacao } from '@/contextos/ContextoAutenticacao';
import { toast } from 'sonner';
import logo from "../assets/favicon.ico"

const Cadastro = () => {
  const [nome, definirNome] = useState('');
  const [email, definirEmail] = useState('');
  const [senha, definirSenha] = useState('');
  const [carregando, definirCarregando] = useState(false);
  const [emailEnviado, definirEmailEnviado] = useState(false);
  const { registrar } = useAutenticacao();
  const navegar = useNavigate();

  const realizarCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    definirCarregando(true);
    const resultado = await registrar(nome, email, senha);
    definirCarregando(false);
    if (resultado.sucesso) {
      definirEmailEnviado(true);
      toast.success('Conta criada! Verifique seu email para confirmar.');
    } else {
      toast.error(resultado.erro || 'Erro ao criar conta');
    }
  };

  if (emailEnviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md animate-fade-in text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Verifique seu Email</h1>
          <p className="text-muted-foreground mb-6">
            Enviamos um link de confirmação para <span className="text-foreground font-medium">{email}</span>.
            Clique no link para ativar sua conta.
          </p>
          <div className="glass-card p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Não recebeu o email? Verifique a pasta de spam ou tente novamente.
            </p>
            <Button onClick={() => definirEmailEnviado(false)} variant="outline" className="w-full border-border text-foreground">
              Tentar com outro email
            </Button>
            <Link to="/" className="block">
              <Button variant="ghost" className="w-full text-gold hover:text-gold-light">
                Voltar ao Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img src={logo} alt="Logo do Sistema" className="w-56 object-contain" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Adega<span className="gold-text">PDV</span></h1>
          <p className="text-muted-foreground mt-2">Crie sua conta</p>
        </div>
        <div className="glass-card p-8">
          <form onSubmit={realizarCadastro} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-foreground">Nome</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="nome" value={nome} onChange={e => definirNome(e.target.value)} placeholder="Seu nome" className="pl-10 bg-secondary border-border" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={e => definirEmail(e.target.value)} placeholder="seu@email.com" className="pl-10 bg-secondary border-border" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-foreground">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="senha" type="password" value={senha} onChange={e => definirSenha(e.target.value)} placeholder="Mínimo 6 caracteres" className="pl-10 bg-secondary border-border" required />
              </div>
            </div>
            <Button type="submit" disabled={carregando} className="w-full wine-gradient hover:opacity-90 text-primary-foreground font-semibold h-11 active:scale-[0.97]">
              {carregando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Criar Conta
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Já tem conta?{' '}
              <Link to="/" className="text-gold hover:text-gold-light transition-colors font-medium">Fazer login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
