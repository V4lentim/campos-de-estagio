import { api } from './api.js';

export async function carregarAlocacoes(signal) {
  const [alocacoes, alunos, consultorios, campos] = await Promise.all([
    api('/alocacoes', { signal }),
    api('/alunos', { signal }),
    api('/consultorios', { signal }),
    api('/campos', { signal }),
  ]);
  return { alocacoes, alunos, consultorios, campos };
}

export function criarAlocacao(alunoId, consultorioId) {
  return api('/alocacoes', {
    method: 'POST',
    json: { alunoId: Number(alunoId), consultorioId: Number(consultorioId) },
  });
}

export function removerAlocacao(id) {
  return api(`/alocacoes/${id}`, { method: 'DELETE' });
}

export function consultarOcupacao(id) {
  return api(`/consultorios/${id}/ocupacao`);
}

export async function carregarFaixas(signal) {
  const [faixas, especialidades] = await Promise.all([
    api('/faixas', { signal }),
    api('/especialidades', { signal }),
  ]);
  return { faixas, especialidades };
}

export function atualizarFaixa(id, ideal, maximoAceitavel) {
  return api(`/faixas/${id}`, {
    method: 'PATCH',
    json: { ideal: Number(ideal), maximoAceitavel: Number(maximoAceitavel) },
  });
}

export function interpretarLote(texto) {
  let corpo;
  try {
    corpo = JSON.parse(texto);
  } catch {
    throw new Error('O conteúdo do lote precisa ser um JSON válido.');
  }
  if (
    !corpo ||
    typeof corpo !== 'object' ||
    Array.isArray(corpo) ||
    !Array.isArray(corpo.linhas) ||
    corpo.linhas.length === 0
  ) {
    throw new Error('Informe um objeto com a lista linhas preenchida.');
  }
  return { linhas: corpo.linhas };
}

export function enviarLote(texto) {
  return api('/importacoes', { method: 'POST', json: interpretarLote(texto) });
}

export function consultarImportacao(id) {
  if (!/^[1-9]\d*$/.test(String(id)) || Number(id) > 2147483647)
    throw new Error('Informe um ID de importação válido.');
  return api(`/importacoes/${id}`);
}

export function confirmarImportacao(id) {
  return api(`/importacoes/${id}/confirmar`, { method: 'POST' });
}
