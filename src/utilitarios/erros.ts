export function mensagemErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : String(erro);
}
