export function Evidencia({ evidencia }) {
  if (!evidencia) return null;
  return (
    <p>
      Alunos: {evidencia.alunosNoConsultorio} · Ideal: {evidencia.ideal} ·
      Máximo aceitável: {evidencia.maximoAceitavel}
    </p>
  );
}

export default function Feedback({ erro, mensagem }) {
  if (!erro && !mensagem) return null;
  const texto =
    erro instanceof TypeError
      ? 'Não foi possível comunicar com a API. Confira a conexão e tente novamente.'
      : erro?.message;
  return (
    <div
      className={`notice${erro ? ' notice--warning' : ''}`}
      role={erro ? 'alert' : 'status'}
    >
      <p>{texto ?? mensagem}</p>
      <Evidencia evidencia={erro?.evidencia ?? erro?.data?.evidencia} />
    </div>
  );
}
