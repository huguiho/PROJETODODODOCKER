import { describe, it, expect } from 'vitest';
import { calcularEstoquesDisponiveis } from '@/servicos/estoqueCompartilhado';

describe('Estoque compartilhado', () => {
  const unidade = { id: 'lata', estoque: 120, produto_unitario_id: null, unidades_por_pacote: 1 };
  const pacote = { id: 'pacote', estoque: 999, produto_unitario_id: 'lata', unidades_por_pacote: 12 };

  it('calcula dez pacotes a partir de 120 latas sem duplicar o estoque', () => {
    expect(calcularEstoquesDisponiveis([unidade, pacote])[1].estoque).toBe(10);
  });
  it('recalcula nove pacotes após a venda de doze latas', () => {
    expect(calcularEstoquesDisponiveis([{ ...unidade, estoque: 108 }, pacote])[1].estoque).toBe(9);
  });
  it('não oferece pacote incompleto e não altera os dados recebidos', () => {
    expect(calcularEstoquesDisponiveis([{ ...unidade, estoque: 11 }, pacote])[1].estoque).toBe(0);
    expect(pacote.estoque).toBe(999);
  });
  it('retorna zero se a unidade não estiver disponível', () => {
    expect(calcularEstoquesDisponiveis([pacote])[0].estoque).toBe(0);
  });
});