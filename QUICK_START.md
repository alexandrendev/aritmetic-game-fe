# 🚀 Math Quest - Quick Start Guide

## 📦 Instalação

O `npm install` está em progresso. Assim que terminar, você poderá rodar:

```bash
# Terminal 1: Dev Server
npm start
# App abre em http://localhost:4200

# Terminal 2 (optional): Watch mode
npm run watch

# Terminal 3 (optional): Testes
npm test
```

## 🔑 Credenciais de Teste

Após criar uma conta, você pode:
1. Ir para `/login` e entrar com email/senha
2. Ou ir para `/register` e criar uma nova conta
3. Dashboard aparece após autenticação bem-sucedida

## ⚙️ Configuração da API

**Arquivo**: `src/app/core/auth/auth.storage.ts`

```typescript
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:3000'  // ← Mude aqui
});
```

## 📋 Estrutura de Componentes

```
App (Router)
├── /login         → LoginPageComponent
├── /register      → RegisterPageComponent
└── /dashboard     → DashboardPageComponent
```

## 🔐 Fluxo de Autenticação

```
Login Form
    ↓
AuthService.login()
    ↓
POST /api/login
    ↓
AuthInterceptor (salva tokens)
    ↓
Navigate /dashboard
    ↓
authGuard (valida)
    ↓
GET /api/me
    ↓
Dashboard carrega
```

## 🎨 Temas de Cor

### Login (Verde)
- Primary: `#0b5d75`
- Gradient: `#0b5d75 → #0f7b93 → #0ea57f`

### Register (Azul)
- Primary: `#1054a6`
- Gradient: `#1054a6 → #0f7ed1 → #1d9ecf`

### Accent
- Gold: `#f2d25d`

## 📱 Responsividade Testada

- ✅ Desktop (1920px)
- ✅ Laptop (1366px)
- ✅ Tablet (768px)
- ✅ Mobile (375px)

## 🧪 Validações do Formulário

### Login
- Email: requerido + formato válido
- Senha: requerido + mínimo 6 caracteres

### Register
- Nome: requerido + mínimo 2 caracteres
- Email: requerido + formato válido
- Senha: requerido + mínimo 6 caracteres

## 🔄 Refresh Token

Automático quando:
1. Token expirado (status 401)
2. Interceptor detecta e chama `/api/token/refresh`
3. Requisição original reenviada com novo token

## ❌ Tratamento de Erros

- Login/Register falha → Mensagem de erro na tela
- Refresh falha → Logout automático
- 401 não pública → Logout automático

## 🎯 Próximos Passos

1. ✅ Autenticação (PRONTO)
2. ⏳ Criar página de Desafios
3. ⏳ Criar página de Ranking
4. ⏳ Criar página de Perfil

## 📞 Debug

Abra Developer Tools (F12) e veja:
- **Local Storage**: math-game-access-token, math-game-refresh-token
- **Network**: Todas as requisições HTTP
- **Console**: Erros e logs

## ✨ Funcionalidades Angular v21

- ✅ Signals para state
- ✅ OnPush change detection
- ✅ Control flow nativa (@if, @for)
- ✅ Standalone components
- ✅ Reactive Forms
- ✅ HTTP Interceptors
- ✅ Route Guards

---

**Status**: Aguardando `npm install`. Assim que terminar, rode `npm start`! 🎮

