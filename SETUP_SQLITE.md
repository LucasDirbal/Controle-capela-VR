# Configuração do Projeto para SQLite Local (Windows)

Este guia ajudará você a configurar o projeto **Sistema de Controle de Capela** para rodar localmente no Windows com SQLite.

## Pré-requisitos

- Node.js v22+ (você já tem instalado)
- pnpm (gerenciador de pacotes)
- Um editor de código (VS Code recomendado)

## Passo 1: Instalar pnpm

Se ainda não tem pnpm instalado globalmente:

```powershell
npm install -g pnpm
```

## Passo 2: Instalar Dependências

Na pasta do projeto, execute:

```powershell
pnpm install
```

## Passo 3: Criar Arquivo .env

Crie um arquivo `.env` na raiz do projeto (`C:\Users\Lucas\Desktop\sistema_capela\.env`) com o seguinte conteúdo:

```env
# Banco de dados SQLite
DATABASE_URL=sqlite.db

# Segurança - gere uma chave aleatória
JWT_SECRET=sua_chave_secreta_super_segura_12345678

# Configuração da aplicação
VITE_APP_TITLE=Capela Itinerante
VITE_APP_LOGO=/logo.svg

# OAuth (deixe em branco para desenvolvimento local)
VITE_APP_ID=
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=

# Informações do proprietário
OWNER_OPEN_ID=test-user
OWNER_NAME=Usuário Teste

# APIs internas (deixe em branco)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
VITE_FRONTEND_FORGE_API_KEY=

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

## Passo 4: Configurar Drizzle para SQLite

Você tem duas opções:

### Opção A: Usar o arquivo de configuração SQLite (recomendado)

Crie um arquivo `.env.local` com:

```env
DRIZZLE_CONFIG=drizzle.config.sqlite.ts
```

### Opção B: Editar o drizzle.config.ts

Abra `drizzle.config.ts` e altere para:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "sqlite.db",
  },
});
```

## Passo 5: Instalar Dependência SQLite

```powershell
pnpm add better-sqlite3
```

## Passo 6: Atualizar server/db.ts para SQLite

Abra `server/db.ts` e altere a importação de:

```typescript
import { drizzle } from "drizzle-orm/mysql2";
```

Para:

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
```

E altere a função `getDb()`:

```typescript
let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sqlite = new Database(process.env.DATABASE_URL);
      _db = drizzle(sqlite);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
```

## Passo 7: Executar Migrações

```powershell
pnpm db:push
```

Isso criará o arquivo `sqlite.db` com todas as tabelas.

## Passo 8: Executar o Projeto

### Para desenvolvimento (com hot reload):

```powershell
pnpm dev
```

### Para produção:

```powershell
pnpm build
pnpm start
```

## Solução de Problemas

### Erro: "NODE_ENV não é reconhecido"

**Solução 1:** Use Command Prompt em vez de PowerShell:
```cmd
set NODE_ENV=development && pnpm dev
```

**Solução 2:** Instale cross-env:
```powershell
pnpm add -D cross-env
```

Depois altere `package.json`:
```json
"dev": "cross-env NODE_ENV=development tsx watch server/_core/index.ts"
```

### Erro: "better-sqlite3 not found"

```powershell
pnpm add better-sqlite3
```

### Erro: "Database not available"

Verifique se o arquivo `.env` existe e tem `DATABASE_URL=sqlite.db`

### Erro ao fazer push das migrações

Certifique-se de que:
1. O arquivo `drizzle.config.ts` está configurado para SQLite
2. A pasta `drizzle/` existe
3. O arquivo `drizzle/schema.ts` está correto

## Acessar a Aplicação

Após executar `pnpm dev`, acesse:

```
http://localhost:3000
```

## Estrutura do Projeto

```
sistema_capela/
├── client/              # Frontend React
│   ├── src/
│   │   ├── pages/      # Páginas (Home, Members, Calendar, History)
│   │   ├── components/ # Componentes reutilizáveis
│   │   └── lib/        # Utilitários (tRPC client)
│   └── index.html
├── server/              # Backend Express + tRPC
│   ├── routers.ts      # APIs tRPC
│   ├── db.ts           # Funções de banco de dados
│   └── _core/          # Configuração interna
├── drizzle/            # Esquema e migrações
│   ├── schema.ts       # Definição das tabelas
│   └── migrations/     # Arquivos de migração
├── .env                # Variáveis de ambiente
└── package.json        # Dependências e scripts
```

## Próximos Passos

1. **Adicionar membros** - Use a interface para cadastrar os membros da sua capela
2. **Registrar localização** - Indique com quem a capela está atualmente
3. **Visualizar calendário** - Veja os próximos responsáveis
4. **Consultar histórico** - Acompanhe todas as passagens

## Suporte

Se encontrar problemas, verifique:
- Node.js está instalado: `node -v`
- pnpm está instalado: `pnpm -v`
- Arquivo `.env` existe e tem as variáveis corretas
- Pasta `node_modules` foi criada: `pnpm install`
- Banco de dados foi criado: `pnpm db:push`

---

**Desenvolvido com ❤️ usando React, Express, tRPC e SQLite**
