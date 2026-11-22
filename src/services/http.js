export class ApiError extends Error {
  constructor(status, data) {
    const messages = [data?.error, data?.mensagem, data?.message];

    const message = messages.find(
      (value) => typeof value === 'string' && value.trim().length > 0,
    );

    super(message ?? `A requisição falhou (HTTP ${status}).`);

    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function createApiClient(baseUrl) {
  return async function request(path, { json, headers, ...options } = {}) {
    if (!baseUrl?.trim()) {
      throw new Error(
        'Configure VITE_API_BASE_URL antes de fazer requisições.',
      );
    }

    if (json !== undefined && options.body !== undefined) {
      throw new Error('Informe apenas json ou body na requisição.');
    }

    const url = `${baseUrl.trim().replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

    const requestHeaders = new Headers(headers);

    if (json !== undefined) {
      requestHeaders.set('Content-Type', 'application/json');
      options.body = JSON.stringify(json);
    }

    const response = await fetch(url, {
      ...options,
      headers: requestHeaders,
    });

    const text = await response.text();

    const contentType =
      response.headers.get('Content-Type')?.toLowerCase() ?? '';

    let data = text || null;

    if (text && contentType.includes('json')) {
      try {
        data = JSON.parse(text);
      } catch (error) {
        // Preserva o status HTTP quando um corpo de erro contém JSON inválido.
        if (response.ok) throw error;
      }
    }

    if (!response.ok) {
      throw new ApiError(response.status, data);
    }

    return data;
  };
}
