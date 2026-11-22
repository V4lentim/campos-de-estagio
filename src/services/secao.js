const chaveSessao = 'campos-estagio:token';
export const eventoSessao = 'campos-estagio:sessao';

function interpretarToken(token) {
  if (typeof token !== 'string' || token.split('.').length !== 3) {
    throw new Error('Token inválido');
  }

  const parte = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(
    atob(parte.padEnd(Math.ceil(parte.length / 4) * 4, '=')),
  );
  const usuarioId = Number(payload.sub);

  if (
    payload.iss !== 'campos-estagio' ||
    typeof payload.sub !== 'string' ||
    !/^[1-9]\d*$/.test(payload.sub) ||
    !Number.isSafeInteger(usuarioId) ||
    usuarioId > 2147483647 ||
    !['ADMIN', 'CONSULTA'].includes(payload.papel) ||
    !Number.isSafeInteger(payload.exp) ||
    payload.exp * 1000 <= Date.now()
  ) {
    throw new Error('Token inválido ou expirado');
  }

  return {
    token,
    usuarioId,
    papel: payload.papel,
    expiraEm: payload.exp * 1000,
  };
}

export function lerSessao() {
  try {
    return interpretarToken(sessionStorage.getItem(chaveSessao));
  } catch {
    return null;
  }
}

export function salvarSessao(token) {
  const sessao = interpretarToken(token);

  sessionStorage.setItem(chaveSessao, token);
  window.dispatchEvent(new Event(eventoSessao));

  return sessao;
}

export function limparSessao(tokenEsperado) {
  if (tokenEsperado && sessionStorage.getItem(chaveSessao) !== tokenEsperado) {
    return;
  }

  sessionStorage.removeItem(chaveSessao);
  window.dispatchEvent(new Event(eventoSessao));
}