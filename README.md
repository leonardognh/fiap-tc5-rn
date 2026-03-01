# FIAP Hackathon — Task Board (Mobile)

Aplicação mobile de gerenciamento de tarefas estilo Kanban, construída com **React Native**, **Expo 54** e **Firebase**. Roda em **Android**, **iOS** e **Web** a partir de uma única base de código.

---

## Stack Técnica

| Camada           | Tecnologia                                  |
| ---------------- | ------------------------------------------- |
| Framework        | React Native 0.81 + React 19                |
| Plataforma       | Expo SDK 54 (New Architecture habilitada)   |
| Navegação        | Expo Router 6 (file-based routing)          |
| State Management | Zustand 5                                   |
| Estilização      | NativeWind 4 (Tailwind CSS 3 para RN)       |
| UI Components    | GluestackUI v3 + Tailwind Variants          |
| Ícones           | Lucide React Native + Expo Vector Icons     |
| Backend          | Firebase 12 (Auth + Firestore)              |
| i18n             | i18next + react-i18next (`pt-BR` / `en-US`) |
| Animações        | React Native Reanimated 4 + Legend Motion   |
| Drag & Drop      | react-native-drax                           |
| Testes           | React Test Renderer                         |

---

## Arquitetura

### Estrutura de Pastas

```
├── app/                          → Rotas (Expo Router, file-based)
│   ├── _layout.tsx               → Root layout (providers, auth redirect, theme)
│   ├── index.tsx                 → Landing page
│   ├── (auth)/                   → Grupo de rotas públicas
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   └── (app)/                    → Grupo de rotas autenticadas
│       └── (tabs)/               → Tab navigation
│           ├── index.tsx          → Lista de boards
│           ├── settings.tsx       → Configurações do usuário
│           └── boards/[boardId].tsx → Visualização do board (Kanban)
├── src/                          → Código de domínio e lógica de negócio
│   ├── auth/
│   │   ├── presentation/screens/ → Telas de login, registro, recuperação de senha
│   │   └── store/                → Zustand store de autenticação
│   ├── boards/
│   │   ├── data/                 → Repositórios Firestore (boards, tags, users)
│   │   ├── presentation/
│   │   │   ├── screens/          → BoardsListScreen, BoardScreen
│   │   │   └── components/       → Modais de formulário, Pomodoro, multi-selects
│   │   ├── store/                → Zustand stores (boards list + board view)
│   │   ├── types/                → Tipagens do domínio (Board, Column, Item, Tag, etc)
│   │   └── utils/                → Normalização de texto
│   ├── settings/
│   │   ├── data/                 → Repositório Firestore de perfil e preferências
│   │   ├── presentation/screens/ → Tela de configurações
│   │   ├── store/                → Zustand store de settings
│   │   └── types/                → UserPreferences, UserProfile, ThemeMode, etc
│   ├── infrastructure/
│   │   └── firebase/             → Inicialização do Firebase (App, Auth, Firestore)
│   └── utils/
│       └── i18n/                 → Setup do i18next com recursos pt-BR e en-US
├── components/
│   ├── ui/                       → Design system (GluestackUI wrappers)
│   ├── modals/                   → ConfirmModal reutilizável
│   └── *.tsx                     → Componentes utilitários (Themed, ExternalLink, etc)
├── constants/                    → Paleta de cores
├── assets/                       → Fonts e imagens
├── patches/                      → Patches para gluestack-ui e react-native-web
└── scripts/
    └── firestore-migrate.mjs     → Script de migração de dados no Firestore
```

### Organização por Domínio

Cada domínio (`auth`, `boards`, `settings`) segue uma separação em camadas:

- **`types/`** — Modelos e tipagens do domínio (entidades puras, sem dependência de framework)
- **`data/`** — Repositórios que encapsulam toda a comunicação com o Firestore (watchers em tempo real, CRUD)
- **`store/`** — Zustand stores que orquestram estado, side-effects e chamadas aos repositórios
- **`presentation/`** — Screens e components React Native que consomem as stores

### Navegação

O roteamento é file-based via Expo Router, com dois grupos de rotas protegidos por um redirect no root layout:

- **`(auth)`** — Rotas públicas (login, registro, recuperação de senha). Stack navigation sem header.
- **`(app)/(tabs)`** — Rotas autenticadas com tab navigation (Boards, Settings). Inclui rota dinâmica `boards/[boardId]` para visualização individual do Kanban.

O redirect de autenticação ocorre no `_layout.tsx` raiz, observando o estado do `useAuthStore` via `onAuthStateChanged` do Firebase.

### State Management

Cada domínio possui sua própria Zustand store com padrão de **real-time subscription**:

- **`useAuthStore`** — Gerencia sessão via `onAuthStateChanged`, login, registro, logout e recuperação de senha.
- **`useBoardsStore`** — Assina a coleção de boards do usuário em tempo real (`onSnapshot`), com filtragem e ordenação client-side.
- **`useBoardViewStore`** — Assina board, colunas e itens de um board específico. Gerencia CRUD de colunas/itens, drag & drop, reordenação e configuração de Pomodoro.
- **`useSettingsStore`** — Assina perfil e preferências do usuário, com optimistic updates nas preferências.

### Firebase

O client Firebase (`src/infrastructure/firebase/firebase.client.ts`) lida com:

- Inicialização condicional (evita duplicação no hot reload)
- Auth persistence via `AsyncStorage` em mobile e `getAuth` na web
- Conexão automática com emuladores quando `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=1`
- Detecção de host do emulador (Android AVD usa `10.0.2.2`, demais usam `127.0.0.1`)

### Internacionalização

O i18next é configurado com recursos inline (`pt-BR` como idioma padrão, `en-US` como fallback). O idioma ativo é sincronizado com a preferência salva no Firestore via `useSettingsStore`.

### Acessibilidade e Personalização

A aplicação suporta um conjunto amplo de preferências do usuário persistidas no Firestore:

- Tema (claro, escuro, sistema)
- Alto contraste
- Escala de fonte e espaçamento
- Modo foco (reduz estímulos visuais e funcionalidades)
- Alertas cognitivos (Pomodoro, transições suaves, limite de tempo por tarefa)
- Animações (habilitadas/desabilitadas)

---

## Pré-requisitos

- **Node.js** >= 18
- **npm**
- **Expo CLI** (vem junto com o pacote `expo`)
- **Firebase CLI** (para emuladores locais)
- Para mobile: **Expo Go** no dispositivo ou emulador Android/iOS configurado

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id

# Para usar emuladores locais
EXPO_PUBLIC_USE_FIREBASE_EMULATOR=1
EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1
```

---

## Instalação

```bash
npm install
```

O `postinstall` executa `patch-package` automaticamente para aplicar os patches em `@gluestack-ui/core` e `react-native-web`.

---

## Desenvolvimento

### Iniciar o Expo Dev Server

```bash
npm start
```

A partir do terminal interativo do Expo, pressione:

- `a` para abrir no Android
- `i` para abrir no iOS
- `w` para abrir na Web

Ou diretamente:

```bash
npm run android
npm run ios
npm run web
```

### Emuladores Firebase (Auth + Firestore)

Em outro terminal:

```bash
npm run firebase
```

Inicia os emuladores de Auth (porta 9099) e Firestore (porta 8080), com UI de administração na porta 4000. Os dados são persistidos em `.firebase-data/`.

---

## Build

### Web (output estático)

A configuração do Expo gera output estático para web via Metro bundler:

```bash
npx expo export --platform web
```

### Mobile (EAS Build)

```bash
npx eas build --platform android
npx eas build --platform ios
```

---

## Testes

```bash
npx jest
```

---

## Scripts Utilitários

| Script                               | Descrição                                       |
| ------------------------------------ | ----------------------------------------------- |
| `npm start`                          | Inicia o Expo Dev Server                        |
| `npm run android`                    | Abre no Android                                 |
| `npm run ios`                        | Abre no iOS                                     |
| `npm run web`                        | Abre na Web                                     |
| `npm run firebase`                   | Inicia emuladores Firebase (Auth + Firestore)   |
| `node scripts/firestore-migrate.mjs` | Migração de dados no Firestore (emulador local) |

---

## Portas do Ambiente Local

| Serviço            | Porta |
| ------------------ | ----- |
| Expo Dev Server    | 8081  |
| Firebase UI        | 4000  |
| Firestore Emulator | 8080  |
| Auth Emulator      | 9099  |
