import { useEffect, useState } from 'react';
import { apiPublica } from '../services/api.js';
import {
  eventoSessao,
  lerSessao,
  limparSessao,
  salvarSessao,
} from '../services/sessao.js';
import { AuthContext } from './AuthContext.js';

export default function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(lerSessao);

  useEffect(() => {
    const atualizar = () => setSessao(lerSessao());

    window.addEventListener(eventoSessao, atualizar);
    window.addEventListener('focus', atualizar);

    return () => {
      window.removeEventListener(eventoSessao, atualizar);
      window.removeEventListener('focus', atualizar);
    };
  }, []);

  useEffect(() => {
    if (!sessao) return;

    const tempoRestante = Math.max(0, sessao.expiraEm - Date.now());

    const timer = window.setTimeout(
      () => limparSessao(sessao.token),
      Math.min(tempoRestante, 2147483647),
    );

    return () => window.clearTimeout(timer);
  }, [sessao]);

  async function login(email, senha) {
    const resposta = await apiPublica('/auth/login', {
      method: 'POST',
      json: {
        email: email.trim().toLowerCase(),
        senha,
      },
    });

    salvarSessao(resposta?.token);
  }

  function logout() {
    limparSessao();
  }

  return (
    <AuthContext.Provider value={{ sessao, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}