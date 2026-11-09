import { useEffect, useCallback } from 'react';

interface MapaAtalhos {
  [chave: string]: () => void;
}

export function usarAtalhosTeclado(atalhos: MapaAtalhos) {
  const tratarTecla = useCallback((e: KeyboardEvent) => {
    // Compõe a combinação pressionada, como ctrl+f2.
    const partes: string[] = [];
    if (e.ctrlKey || e.metaKey) partes.push('ctrl');
    if (e.altKey) partes.push('alt');
    if (e.shiftKey) partes.push('shift');
    partes.push(e.key.toLowerCase());
    const chave = partes.join('+');

    if (atalhos[chave]) {
      e.preventDefault();
      atalhos[chave]();
    }
  }, [atalhos]);

  useEffect(() => {
    window.addEventListener('keydown', tratarTecla);
    return () => window.removeEventListener('keydown', tratarTecla);
  }, [tratarTecla]);
}
