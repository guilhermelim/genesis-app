# Genesis App

Aplicação web para gerenciar atividades, membros e enquetes de grupos de vida.
A página pública permite que os participantes escolham suas atividades sem
precisar criar uma conta. A área administrativa é protegida por autenticação e
permite gerenciar membros, atividades e enquetes.

## Requisitos

- Node.js e npm
- MongoDB acessível pela aplicação
- Docker e Docker Compose para executar os testes de integração

## Instalação

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env.local` na raiz do projeto:

```env
DATABASE_URL=mongodb://localhost:27017/genesis?authSource=admin
BASE_URL=http://localhost:3000
BETTER_AUTH_SECRET="cole-a-chave-gerada-aqui"
```

### Chave do Better Auth

`BETTER_AUTH_SECRET` é usada para criptografia, hashing e sessões. Gere uma
chave aleatória com pelo menos 32 caracteres:

```bash
openssl rand -base64 32
```

O comando `npx @better-auth/cli@latest secret` está depreciado e não deve ser
utilizado.

Para fazer rotação sem invalidar as sessões atuais, use
`BETTER_AUTH_SECRETS` com chaves versionadas:

```env
BETTER_AUTH_SECRETS="2:nova-chave,1:chave-anterior"
```

Não compartilhe nem versione arquivos `.env` com credenciais.

## Executar a aplicação

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em <http://localhost:3000>.

## Área administrativa

Acesse <http://localhost:3000/admin>. Usuários públicos não precisam de conta;
somente administradores acessam essa área.

O gerenciamento de administradores é feito pelo terminal:

```bash
npm run admin
```

O menu permite:

- criar administradores;
- editar nome, e-mail e senha;
- redefinir senha;
- excluir administradores com confirmação;
- voltar ao menu principal.

As opções de editar, redefinir e excluir aparecem somente quando já existe uma
conta cadastrada. Os valores padrão são:

- e-mail: `admin@email.com`;
- nome: `Admin`;
- senha: `12345678`.

Também existem comandos diretos:

```bash
npm run admin:create
npm run admin:reset
```

A senha é solicitada de forma interativa e não deve ser informada como
argumento da linha de comando.

## Comandos

| Comando                    | Descrição                                       |
| -------------------------- | ----------------------------------------------- |
| `npm run dev`              | Inicia o servidor de desenvolvimento            |
| `npm run build`            | Cria o build de produção                        |
| `npm run start`            | Inicia a aplicação em produção                  |
| `npm run admin`            | Abre o gerenciador de administradores           |
| `npm run admin:create`     | Cria um administrador                           |
| `npm run admin:reset`      | Redefine a senha de um administrador            |
| `npm test`                 | Executa os testes unitários e de integração     |
| `npm run test:quality`     | Executa typecheck e cobertura completa          |
| `npm run test:staged`      | Executa testes relacionados aos arquivos staged |
| `npm run test:hooks`       | Testa os cenários do pre-commit                 |
| `npm run test:coverage`    | Executa os testes com cobertura                 |
| `npm run lint`             | Verifica nomes, formatação e regras de lint     |
| `npm run terminal:quality` | Renderiza o quality gate visual do terminal     |

## Git hooks

O projeto usa Husky para validar alterações automaticamente:

- `pre-commit`: exibe a identidade visual do projeto, formata e executa ESLint
  apenas nos arquivos staged, atualiza o índice, verifica nomes de caminhos
  staged, executa o typecheck e executa apenas os testes relacionados aos
  arquivos staged que são testáveis.
- `pre-push`: executa lint completo, typecheck e a suíte completa com cobertura
  obrigatória de 100%.

`npm run test:staged` ignora declarações, DTOs, tipos e interfaces, que não
representam unidades testáveis isoladas. O `pre-push` executa o quality gate
completo e mantém os thresholds globais de cobertura em 100%.

`npm run test:hooks` valida ausência de staged files, staging parcial,
restauração de arquivos untracked, nomes com espaços, commits contendo apenas
exclusões e falhas nas etapas de formatação, lint, path check e testes staged.
O `pre-push` executa o quality gate completo de forma intencional: isso protege
branches que contenham commits criados sem o hook ou alterações feitas durante
um rebase.

A parte visual possui timeout e fallback estático; falhas da animação não
bloqueiam o quality gate.

Os hooks são instalados automaticamente pelo script `prepare` após `npm install`.
Para executar um comando sem os hooks em uma situação excepcional, use o fluxo
do Git com `HUSKY=0` conscientemente.

## Variáveis de ambiente

| Variável              | Obrigatória | Descrição                                                     |
| --------------------- | ----------- | ------------------------------------------------------------- |
| `DATABASE_URL`        | Sim         | URI de conexão com o MongoDB                                  |
| `BASE_URL`            | Não         | URL base; na Vercel usa o domínio de produção automaticamente |
| `BETTER_AUTH_SECRET`  | Sim         | Chave para sessões, criptografia e hashing                    |
| `BETTER_AUTH_SECRETS` | Não         | Chaves versionadas para rotação não destrutiva                |
