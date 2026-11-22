import { useEffect, useState } from 'react';

export function useApiData(carregar) {
  const [versao, setVersao] = useState(0);
  const [estado, setEstado] = useState({
    dados: null,
    erro: null,
    carregando: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve()
      .then(() => carregar(controller.signal))
      .then(
        (dados) => {
          if (!controller.signal.aborted)
            setEstado({ dados, erro: null, carregando: false });
        },
        (erro) => {
          if (!controller.signal.aborted)
            setEstado({ dados: null, erro, carregando: false });
        },
      );
    return () => controller.abort();
  }, [carregar, versao]);

  function recarregar() {
    setEstado({ dados: null, erro: null, carregando: true });
    setVersao((atual) => atual + 1);
  }

  return { ...estado, recarregar };
}
