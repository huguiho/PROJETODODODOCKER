import type { Json } from '@/integrations/supabase/types';

export type ConfiguracaoLoja = {
  nome?: string;
  endereco?: string;
  telefone?: string;
  cnpj?: string;
};

export type ConfiguracaoPagamento = {
  ativo?: boolean;
  taxa?: number;
  taxas?: Record<string, number>;
};

function objetoJson(valor: Json | undefined): { [chave: string]: Json | undefined } | undefined {
  if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) return undefined;
  return valor;
}

export function lerConfiguracaoLoja(valor: Json | undefined): ConfiguracaoLoja | undefined {
  const loja = objetoJson(valor);
  if (!loja) return undefined;

  return {
    nome: typeof loja.nome === 'string' ? loja.nome : undefined,
    endereco: typeof loja.endereco === 'string' ? loja.endereco : undefined,
    telefone: typeof loja.telefone === 'string' ? loja.telefone : undefined,
    cnpj: typeof loja.cnpj === 'string' ? loja.cnpj : undefined,
  };
}

export function lerConfiguracaoPagamento(valor: Json | undefined): ConfiguracaoPagamento | undefined {
  const pagamento = objetoJson(valor);
  if (!pagamento) return undefined;

  const taxas = objetoJson(pagamento.taxas);
  return {
    ativo: typeof pagamento.ativo === 'boolean' ? pagamento.ativo : undefined,
    taxa: typeof pagamento.taxa === 'number' ? pagamento.taxa : undefined,
    taxas: taxas
      ? Object.fromEntries(
          Object.entries(taxas).filter((entrada): entrada is [string, number] => typeof entrada[1] === 'number'),
        )
      : undefined,
  };
}
