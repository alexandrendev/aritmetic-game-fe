# Aritmetic Game

Jogo de quiz aritmético multiplayer em tempo real desenvolvido para ambientes educacionais. Professores criam e hospedam sessões de jogo; alunos entram via código ou QR code, respondem questões cronometradas e competem em um placar ao vivo.

---

## Funcionalidades

- **Dashboard do host** — criação de sessões com nível de dificuldade, configuração de número de rodadas e tempo de resposta por questão
- **Entrada instantânea** — alunos entram via código de 6 caracteres ou escaneando o QR code gerado no lobby
- **Sincronização em tempo real** — lista de participantes, pontuações e eliminações atualizadas ao vivo via Pusher WebSockets
- **Seleção de avatar** — cada convidado escolhe um apelido e avatar antes de entrar no lobby
- **Vidas e eliminação** — respostas erradas custam vidas; jogadores são eliminados ao zerar
- **Pontuação por tempo** — respostas corretas mais rápidas rendem pontuações maiores
- **Pódio final** — top 3 exibidos com medalhas; placar completo com a classificação de todos os participantes

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Angular 21 (componentes standalone, signals) |
| Linguagem | TypeScript 5.9 |
| Estilização | Tailwind CSS 4 + estilos inline por componente |
| Tempo real | Pusher.js 8 (canais privados) |
| QR Code | qrcode 1.5 |
| Reatividade | RxJS 7.8 |
| Testes | Vitest 4 + jsdom |
| Build | Angular CLI 21 / @angular/build |
| Gerenciador de pacotes | npm 11 |

---

## Como rodar

### Pré-requisitos

- Node.js 18+
- npm 11+

### Instalação e execução

```bash
npm install
npm start
```

Acesse [http://localhost:4200](http://localhost:4200). As requisições à API são proxiadas para o backend via `proxy.conf.json`.

### Scripts disponíveis

```bash
npm run build   # bundle de produção
npm run watch   # rebuild automático ao alterar arquivos
npm test        # executa testes unitários com Vitest
```

---

## Configuração de ambiente

Dois arquivos em `src/environments/`:

| Chave | Dev | Prod |
|---|---|---|
| `appUrl` | `http://localhost:4200` | `https://seu-dominio.com` |
| `pusherKey` | `8c093a5fd88fb7eb8e41` | mesmo |
| `pusherCluster` | `sa1` | mesmo |
| `production` | `false` | `true` |

Para deploy, atualize `appUrl` em `environment.prod.ts` com o domínio de produção. O build do Angular troca o arquivo automaticamente.

---

## Estrutura do projeto

```
src/app/
├── core/
│   ├── auth/              # JWT, guards, interceptor
│   └── services/          # GameService, GameStateService, PusherService
└── features/
    ├── auth/              # Páginas de login e cadastro
    ├── dashboard/         # Dashboard do host
    ├── game-session/      # Fluxo completo do jogo
    │   ├── create-game    # Criação de sessão
    │   ├── join-game      # Entrada por código + deep link via QR code
    │   ├── lobby          # Lobby pré-jogo (visões de host e convidado)
    │   ├── game-board     # Interface in-game (painel do host + painel de resposta do convidado)
    │   └── guest-profile  # Seleção de apelido e avatar
    ├── avatar/            # Serviço de listagem de avatars
    ├── guest/             # Serviço de perfil de convidado
    └── home/              # Página inicial
```

---

## Backend e tempo real

O frontend se conecta a uma API REST em `https://qflow.dev.br` e a um canal privado Pusher `private-game-session-{id}`.

### Eventos principais (Pusher → frontend)

| Evento | Quando ocorre |
|---|---|
| `game.session.started` | Host inicia a sessão |
| `game.round.started` | Nova rodada começa |
| `game.question.generated` | Questão enviada a todos os jogadores |
| `game.participant.updated` | Pontuação ou vidas alteradas |
| `game.participant.eliminated` | Jogador eliminado |
| `game.round.finished` | Todos responderam ou o tempo esgotou |
| `game.session.finished` | Jogo encerrado, classificação final disponível |

---

## Rotas

| Caminho | Acesso | Descrição |
|---|---|---|
| `/` | Público | Página inicial |
| `/login` | Apenas não autenticados | Login |
| `/register` | Apenas não autenticados | Cadastro |
| `/dashboard` | Requer autenticação | Dashboard do host |
| `/create-game` | Requer autenticação | Criar sessão |
| `/join-game` | Requer autenticação | Entrada manual por código |
| `/join-game/:code` | Público | Deep link gerado pelo QR code |
| `/guest-profile` | Público | Configuração de apelido e avatar |
| `/lobby/:id` | Público | Lobby pré-jogo |
| `/game/:id` | Público | Tabuleiro do jogo |

---

## Contribuidores

| Nome | GitHub |
|---|---|
| Alexandre N. | [@alexandrendev](https://github.com/alexandrendev) |
| Felipe Fidelis | [@FelipeFidelisA](https://github.com/FelipeFidelisA) |
