import { env } from '../config/env.js';
import { ApiError, createApiClient } from './http.js';
import { lerSessao, limparSessao } from './sessao.js';

export { ApiError } from './http.js';

export const apiPublica = createApiClient(env.apiBaseUrl);

export async function api(path, options = {}) {
  const sessao = lerSessao();
  const headers = new Headers(options.headers);

  if (sessao) {
    headers.set('Authorization', `Bearer ${sessao.token}`);
  }

  try {
    return await apiPublica(path, { ...options, headers });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && sessao) {
      limparSessao(sessao.token);
    }

    throw error;
  }
}