# Campos de Estágio — Frontend

Interface web do projeto acadêmico de gestão de campos de estágio da FAMINAS, integrada à API REST desenvolvida pelo grupo.

O frontend foi adaptado da base disponibilizada pelo professor. As telas utilizam dados da API, login com JWT, permissões por perfil e formulários para os cadastros e operações implementados.

Documentação atualizada em **25/11/2026**.

## Funcionalidades implementadas

- Login real com e-mail e senha e redirecionamento para a listagem de campos.
- Sessão em `sessionStorage`, envio automático de JWT e encerramento por logout ou expiração.
- Listagem, pesquisa, cadastro, edição, consulta de detalhes e exclusão dos cadastros, conforme as operações e permissões da API.
- Controle de acesso para os perfis ADMIN e CONSULTA, inclusive ao abrir uma URL diretamente.
- Alocação de alunos em consultórios, consulta da ocupação e apresentação das classificações IDEAL, ACEITAVEL e INACEITAVEL.
- Consulta e alteração das faixas de ocupação por especialidade e tipo de atendimento.
- Importação de lotes JSON com staging, consulta dos erros por linha e confirmação das linhas válidas.
- Gestão de preceptores e suas associações com campos.
- Avaliações de campo e preceptor, associadas a aluno e vínculo.
- Mensagens de erro da API, incluindo evidência de ocupação e respostas 413 e 429.

### Cadastros conectados

As 19 entidades iniciais estão configuradas em `src/config/cadastros.js`:

| Grupo                    | Entidades                                                                 |
| ------------------------ | ------------------------------------------------------------------------- |
| Estrutura                | Município, Campo, Consultório e Especialidade                             |
| Apoio e qualificação     | RegraMunicipio, Equipamento, CampoEspecialidade, CampoEquipamento e Score |
| Participantes            | Instituição, Preceptor, Aluno e Usuário                                   |
| Organização dos estágios | Período, Contrato, PreceptorCampo, Vínculo e HistoricoVinculo             |
| Avaliações               | Avaliação                                                                 |

Alocações, faixas e importações possuem páginas e serviços específicos. Campos e consultórios usam exclusão lógica na API, preservando os registros históricos.

O cadastro de Score gerencia registros; ele não representa um cálculo automático de qualificação. Painel de indicadores, mapa, distribuição e simulador da base original não fazem parte da navegação ativa. `/painel` redireciona para `/campos`.

## Tecnologias

| Tecnologia                | Uso                                            |
| ------------------------- | ---------------------------------------------- |
| React 19                  | Componentes, formulários e estado da interface |
| React Router 8            | Navegação, detalhes e proteção das páginas     |
| Vite 8                    | Desenvolvimento e geração do build             |
| JavaScript com módulos ES | Código do frontend                             |
| Fetch API                 | Comunicação HTTP com a API                     |
| CSS                       | Estilos, identidade visual e layout responsivo |
| ESLint e Prettier         | Verificação e formatação                       |
| node:test                 | Testes automatizados do transporte HTTP        |

As versões completas estão em `package.json` e `package-lock.json`.

## Configuração e execução

### Pré-requisitos

- Node.js 24 ou superior, conforme `package.json` e `.nvmrc`.
- npm.
- API acessível e credenciais válidas de uma conta ADMIN ou CONSULTA.

O navegador se comunica com a API; a API acessa o PostgreSQL. O frontend não precisa de conexão direta com o banco nem de Docker para funcionar. O grupo utiliza o PostgreSQL do Railway; o Docker é utilizado pelos testes isolados da API.

### Instalar e configurar

Dentro da pasta `campos-de-estagio`, execute:

```bash
npm ci
```

Copie `.env.example` para `.env`. No PowerShell:

```powershell
Copy-Item .env.example .env
```

No Git Bash, macOS ou Linux:

```bash
cp .env.example .env
```

Escolha o endereço da API no `.env`.

Para executar a API localmente:

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api
```

Nesse caso, inicie também a API com `npm run dev` na pasta do backend. O banco utilizado será aquele configurado no backend, podendo continuar no Railway.

Para utilizar a API publicada:

```dotenv
VITE_API_BASE_URL=https://campos-estagio-db-production.up.railway.app/api
```

A base inclui `/api`; os serviços acrescentam caminhos como `/campos` e `/auth/login`. Reinicie o Vite após alterar o `.env`. As variáveis `VITE_*` são públicas no navegador: utilize-as para endereços e configurações públicas. Credenciais do banco e `JWT_SECRET` pertencem apenas à API.

### Iniciar

```bash
npm run dev -- --port 5173 --strictPort
```

Acesse [http://localhost:5173](http://localhost:5173) e entre com uma conta cadastrada no ambiente escolhido. As credenciais de seed são configuradas no backend; não existe seleção de perfil que substitua o login.

Na API, `CORS_ORIGINS` deve permitir a origem utilizada pelo navegador, por exemplo `http://localhost:5173`. Ao usar `127.0.0.1` ou outra porta, inclua essa origem também. A configuração permite `Content-Type` e `Authorization` e responde ao preflight antes da autenticação.

## Login, sessão e permissões

O login envia `POST /api/auth/login` com `{ email, senha }`. Após receber `{ token }`, o frontend salva a sessão e envia `Authorization: Bearer TOKEN` nas chamadas protegidas.

O frontend lê o perfil e a expiração do JWT para controlar a interface. A API verifica a assinatura, a validade do token e a autorização de cada operação. A sessão é preservada ao atualizar a página na mesma aba e removida ao sair ou expirar. Uma resposta 401 em uma chamada autenticada encerra a sessão; uma resposta 403 apresenta a falta de permissão.

| Perfil   | Uso na interface                                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| ADMIN    | Cadastros, alterações, exclusões, alocações, faixas, importação e extras                                                              |
| CONSULTA | Consulta de campos, consultórios, alunos, alocações, ocupação e faixas, além das listagens autorizadas de municípios e especialidades |

As permissões efetivas estão nos routers da API e no Swagger. Cadastro e edição de dados exigem ADMIN. As avaliações são registradas administrativamente; não existe perfil ALUNO com login próprio nesta versão.

## Fluxos principais

### Cadastros

As páginas carregam os registros e as opções dos relacionamentos pela API. Os serviços convertem os valores dos formulários para os nomes e tipos esperados pelo contrato. A API aplica as validações e verifica os relacionamentos na Business.

Entre as regras utilizadas estão matrícula no formato `DD-DDDDD`, datas de calendário no formato `AAAA-MM-DD` e senha de cadastro com pelo menos 8 caracteres e no máximo 72 bytes UTF-8.

### Alocações e faixas

ADMIN pode alocar e remover alunos. A API calcula a ocupação usando as faixas persistidas. A interface exibe alertas de ocupação ACEITAVEL e a evidência do bloqueio INACEITAVEL, com quantidade de alunos, ideal e máximo aceitável.

ADMIN pode alterar os limites das faixas. CONSULTA pode acompanhar as listagens e a ocupação, conforme as permissões da API.

### Importação

Na página de importação, utilize um objeto JSON com a lista `linhas`. O formulário contém um exemplo dos campos esperados. Municípios e especialidades usados nas linhas precisam estar cadastrados.

1. Envie o lote para criar o staging.
2. Consulte o resumo e os erros de cada linha.
3. Revise as linhas válidas.
4. Confirme a importação para criar os registros definitivos.

O conteúdo é enviado como JSON; a tela atual não é um importador de arquivos CSV ou planilhas. A API controla a confirmação transacional e impede reconfirmação indevida.

## Erros e limites da API

O contrato de erro é:

```json
{
  "erro": {
    "codigo": "DADOS_INVALIDOS",
    "mensagem": "Mensagem descritiva do erro"
  }
}
```

O cliente HTTP produz `ApiError`, com `status`, `codigo`, `message`, o corpo original em `data` e os campos opcionais `detalhes` e `evidencia`. O componente `Feedback` apresenta a mensagem e a evidência de ocupação. A leitura dos formatos anteriores foi preservada para a transição de publicação.

| Resposta | Significado                                                  |
| -------- | ------------------------------------------------------------ |
| 400      | Dados inválidos, JSON malformado ou regra de negócio violada |
| 401      | Credenciais ou sessão inválidas                              |
| 403      | Perfil sem permissão                                         |
| 404      | Rota, registro ou relacionamento inexistente                 |
| 409      | Duplicidade ou conflito                                      |
| 413      | Corpo JSON acima do limite permitido                         |
| 429      | Limite de requisições de login excedido                      |
| 500      | Falha interna inesperada                                     |

Os limites padrão são 10 KB para login, 100 KB para cadastros e 1 MB para importação. O login permite 5 requisições por IP em 15 minutos, contando também as bem-sucedidas. A seguinte recebe 429 com `Retry-After`. Esses valores do limitador são configuráveis na API; usuários da mesma rede podem compartilhar a cota por IP público.

## Comandos e testes

| Comando                | Uso                                          |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Inicia o frontend em desenvolvimento         |
| `npm run build`        | Gera os arquivos estáticos em `dist/`        |
| `npm run preview`      | Disponibiliza o build para conferência local |
| `npm run lint`         | Verifica JavaScript, JSX e hooks             |
| `npm run format:check` | Confere a formatação                         |
| `npm run format`       | Formata os arquivos do projeto               |
| `npm test`             | Executa os testes do cliente HTTP            |
| `npm run check`        | Executa lint, formatação, testes e build     |

Na verificação de **24/11/2026**, os **17 testes do frontend passaram**, assim como lint, formatação e build. A suíte verifica o transporte HTTP e a leitura de erros, incluindo o novo contrato e respostas 413 e 429. Ela usa um servidor HTTP temporário e não acessa o PostgreSQL do Railway nem substitui um teste manual das telas com a API.

Os resultados registrados são da versão verificada naquela data. Esta atualização de documentação não representa uma nova execução dos testes.

### Conferência manual da integração

1. Confira `VITE_API_BASE_URL` e a disponibilidade de `/api/health` na API escolhida.
2. Entre como ADMIN e verifique a listagem de campos.
3. Cadastre um registro fictício identificável, edite-o e confira a persistência após atualizar a página.
4. Confira alocações, ocupação, faixas e as mensagens de validação.
5. Envie um lote de importação de teste, revise o staging e confirme apenas o que pretende gravar.
6. Confira preceptores por campo e avaliações.
7. Entre como CONSULTA e confira as consultas permitidas e o bloqueio das alterações.
8. Faça logout e tente abrir uma página protegida diretamente.

Na aba Network do navegador, confira a URL de destino, o JWT e os status retornados. Quando a base aponta para a API publicada, as escritas atingem o ambiente publicado. Mesmo uma API local pode utilizar o banco compartilhado: combine os dados de teste e sua limpeza com o grupo.

## Organização do código

```text
src/
  assets/       imagens e fontes
  components/   elementos de interface, formulários e feedback
  config/       endereço da API e configuração dos cadastros
  constants/    rotas e navegação
  contexts/     autenticação e sessão
  hooks/        acesso à sessão e carregamento de dados
  layouts/      estrutura e menu da aplicação
  pages/        telas de cadastros e operações
  services/     HTTP, JWT nas chamadas e adaptação dos contratos
  styles/       estilos e identidade visual
  App.jsx       registro e proteção das rotas
  main.jsx      entrada da aplicação
tests/          testes do cliente HTTP
docs/           documentação de integração e referência da base
prototipo/      referência visual original
```

Os arquivos de referência da base podem descrever o estágio inicial do projeto. Este README apresenta o funcionamento integrado atual; os contratos e permissões são definidos pela API.

## Build e hospedagem

Defina `VITE_API_BASE_URL` antes de executar `npm run build`. O valor é incorporado aos arquivos gerados; alterar uma variável no servidor após o build não modifica o frontend já compilado.

Para conferir o build na origem local permitida pelo CORS:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 5173 --strictPort
```

Publique `dist/` em uma hospedagem estática com fallback das rotas da interface para `index.html`. Isso permite abrir diretamente endereços como `/campos`. A origem pública do frontend precisa constar no CORS da API. O frontend não deve transformar respostas de `/api/*` em HTML.

A aplicação usa caminhos a partir da raiz do domínio. Publicação em subpastas exige ajustar a base do Vite, o roteador e o fallback. A publicação do frontend e a da API são processos separados.

## Trabalho em equipe e referências

Mantenha `package-lock.json` versionado, utilize `npm ci` e execute `npm run check` antes de integrar alterações. No Windows, encerre o Vite antes de reinstalar dependências para evitar arquivos nativos em uso.

- [API do grupo e contratos](https://github.com/faminas-ads/api-2026-2-b-trabalho-campos-estagio-equinos-suinos-equipe-98)
- [Swagger da API publicada](https://campos-estagio-db-production.up.railway.app/docs)
- [Guia de integração](docs/integracao-api.md)
- [Arquitetura de referência da base](docs/arquitetura.md)
- [Referência de requisitos](docs/requisitos.md)

Os logos e materiais institucionais foram mantidos como referência da disciplina. Esta adaptação não atribui uma nova licença a esses materiais.
