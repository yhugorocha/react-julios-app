# Frontend Expense Control

Aplicação React para consumir o backend de controle de despesas em modelo single-tenant (isolamento por usuário autenticado, sem `tenant_id`).

## Stack

- React + Vite + TypeScript
- React Router
- Axios
- React Hook Form + Zod
- Zustand (estado global de autenticação)

## Pré-requisitos

- Node.js 18+
- npm 9+

## Configuração

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

No Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

2. Ajuste `VITE_API_URL` no `.env`:

```env
VITE_API_URL=http://localhost:8080
```

## Execução

```bash
npm install
npm run dev
```

Acesse: `http://localhost:5173`

## Rotas da aplicação

- Públicas:
  - `/signup`
  - `/login`
- Protegidas:
  - `/categories`
  - `/transactions`
  - `/users` (apenas `ADMIN`)

## Funcionalidades implementadas

- Cadastro e login com validação de formulário via Zod.
- JWT persistido no estado global e localStorage.
- Header `Authorization: Bearer <token>` automático nas chamadas protegidas.
- Guardas de rota por autenticação e por role.
- CRUD mínimo:
  - Usuários: criar/listar (somente ADMIN)
  - Categorias: criar/listar
  - Transações: criar/listar
- Tratamento global de erros da API com mensagens amigáveis.
- Layout responsivo para desktop e mobile.

## Estrutura de pastas

```text
src/
  components/      # layout, guards e alertas globais
  pages/           # telas principais
  schemas/         # validações Zod
  services/        # camada HTTP e serviços por recurso
  store/           # estado global (auth e feedback)
  types/           # DTOs e tipos da API
  utils/           # utilitários (erros)
```
