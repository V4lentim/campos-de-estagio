import { cadastros, rotuloRegistro } from '../../config/cadastros.js';

export default function CadastroForm({
  config,
  valores,
  onChange,
  referencias,
  editando,
  ocupado,
}) {
  function alterar(campo, valor) {
    const novos = { ...valores, [campo.nome]: valor };
    if (campo.nome === 'VinculoID' && config.endpoint === '/avaliacoes') {
      const vinculo = referencias.vinculos?.find(
        (item) => item.VinculoID === Number(valor),
      );
      if (vinculo) {
        novos.AlunoID = String(vinculo.AlunoID);
        novos.CampoID = String(vinculo.CampoID);
        novos.PreceptorID = String(vinculo.PreceptorID);
      }
    }
    if (campo.nome === 'ConsultorioID' && config.endpoint === '/vinculos') {
      const consultorio = referencias.consultorios?.find(
        (item) => item.ConsultorioID === Number(valor),
      );
      if (consultorio) novos.CampoID = String(consultorio.CampoID);
    }
    onChange(novos);
  }

  return (
    <div className="two-columns">
      {config.campos
        .filter((campo) => !editando || !campo.soCriacao)
        .map((campo) => {
          const valor = valores[campo.nome] ?? '';
          const atributos = {
            name: campo.nome,
            value: valor,
            onChange: (event) => alterar(campo, event.target.value),
            required: !campo.opcional,
            disabled: ocupado,
          };
          let controle;
          if (campo.tipo === 'relacao') {
            const lista = referencias[campo.recurso] ?? [];
            const id = cadastros[campo.recurso].id;
            controle = (
              <select {...atributos}>
                <option value="">Selecione</option>
                {valor && !lista.some((item) => String(item[id]) === valor) && (
                  <option value={valor}>
                    Registro #{valor} indisponível na listagem
                  </option>
                )}
                {lista.map((item) => (
                  <option key={item[id]} value={item[id]}>
                    {rotuloRegistro(campo.recurso, item)}
                  </option>
                ))}
              </select>
            );
          } else if (campo.tipo === 'select') {
            controle = (
              <select {...atributos}>
                <option value="">Selecione</option>
                {campo.opcoes.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            );
          } else if (campo.tipo === 'textarea') {
            controle = (
              <textarea {...atributos} rows={3} maxLength={campo.maxLength} />
            );
          } else {
            controle = (
              <input
                {...atributos}
                type={campo.tipo}
                min={campo.min}
                max={campo.max}
                step={campo.step}
                minLength={campo.minLength}
                maxLength={campo.maxLength}
                pattern={campo.pattern}
                placeholder={campo.placeholder}
                autoComplete={
                  campo.tipo === 'password' ? 'new-password' : undefined
                }
              />
            );
          }
          return (
            <label className="field" key={campo.nome}>
              <span>
                {campo.label}
                {campo.opcional ? ' (opcional)' : ''}
              </span>
              {controle}
            </label>
          );
        })}
    </div>
  );
}
