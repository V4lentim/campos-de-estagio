import { api } from './api.js';
import { cadastros } from '../config/cadastros.js';

export async function carregarCadastro(recurso, signal) {
  const config = cadastros[recurso];
  const recursos = [
    ...new Set(
      config.campos
        .filter((campo) => campo.recurso)
        .map((campo) => campo.recurso),
    ),
  ];
  const [registros, ...listas] = await Promise.all([
    api(config.endpoint, { signal }),
    ...recursos.map((nome) => api(cadastros[nome].endpoint, { signal })),
  ]);
  return {
    registros,
    referencias: Object.fromEntries(
      recursos.map((nome, i) => [nome, listas[i]]),
    ),
  };
}

export function valoresFormulario(config, registro = {}) {
  return Object.fromEntries(
    config.campos.map((campo) => {
      const valor = registro[campo.resposta ?? campo.nome];
      return [
        campo.nome,
        campo.tipo === 'date' && valor
          ? valor.slice(0, 10)
          : String(valor ?? ''),
      ];
    }),
  );
}

export function corpoFormulario(recurso, valores, original = null) {
  const config = cadastros[recurso];
  const anteriores = valoresFormulario(config, original ?? {});
  const corpo = {};

  for (const campo of config.campos) {
    if (original && campo.soCriacao) continue;
    const valor = valores[campo.nome] ?? '';
    if (original && valor === anteriores[campo.nome]) continue;
    if (!valor && campo.opcional && !campo.anulavel && !original) continue;

    if (!valor && campo.anulavel) {
      corpo[campo.nome] = null;
    } else if (campo.tipo === 'number' || campo.tipo === 'relacao') {
      if (!valor || !Number.isFinite(Number(valor)))
        throw new Error(`${campo.label}: informe um número válido.`);
      corpo[campo.nome] = Number(valor);
    } else {
      corpo[campo.nome] = campo.tipo === 'password' ? valor : valor.trim();
    }
  }

  if (recurso === 'usuarios' && !original) {
    corpo.papel = corpo.perfil;
    delete corpo.perfil;
  }
  return corpo;
}

export function salvarCadastro(recurso, valores, original = null) {
  const config = cadastros[recurso];
  const json = corpoFormulario(recurso, valores, original);
  if (original && Object.keys(json).length === 0)
    throw new Error('Nenhum campo foi alterado.');
  return api(
    original ? `${config.endpoint}/${original[config.id]}` : config.endpoint,
    {
      method: original ? 'PATCH' : 'POST',
      json,
    },
  );
}

export function excluirCadastro(recurso, id) {
  return api(`${cadastros[recurso].endpoint}/${id}`, { method: 'DELETE' });
}
