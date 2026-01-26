
# Plano: Independência Total do Lovable

## Situação Atual

O projeto já possui toda a estrutura para funcionar de forma 100% independente:
- **Netlify Functions** prontas em `netlify/functions/` (chat-travel.ts, generate-itinerary.ts)
- **Arquivo de migração** completo: `migration_completa.sql`
- **Guia de deploy** detalhado: `DEPLOY_GUIDE.md`

**Problema**: Minha última alteração apontou o código para o Lovable Cloud ao invés das Netlify Functions, criando dependência.

---

## O Que Vou Fazer

### 1. Reverter o código para usar Netlify Functions

Vou alterar `src/pages/Chat.tsx` e `src/pages/Itinerary.tsx` para usar as Netlify Functions quando em produção (viagecomsofia.com):

```text
Produção (viagecomsofia.com) → Netlify Functions
Desenvolvimento (Lovable, localhost) → Supabase Edge Functions
```

### 2. Garantir que todas as URLs estão corretas

O código detectará automaticamente o ambiente:
- Se hostname contém `viagecomsofia` ou `netlify.app` → usa `/.netlify/functions/`
- Senão → usa Supabase Edge Functions para testes

---

## O Que Você Precisa Fazer no Netlify

Após eu reverter o código, você precisa configurar as variáveis de ambiente no Netlify:

### Passo 1: Acessar o Painel Netlify
1. Vá em [app.netlify.com](https://app.netlify.com)
2. Clique no site **viagecomsofia**
3. No menu lateral, clique em **Site configuration**
4. Clique em **Environment variables**

### Passo 2: Adicionar as Variáveis
Clique em "Add a variable" para cada uma:

| Variável | Valor | Para que serve |
|----------|-------|----------------|
| `VITE_SUPABASE_URL` | `https://rvmvoogyrafiogxdbisx.supabase.co` | Conectar ao banco de dados |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (chave completa) | Autenticação |
| `GOOGLE_GEMINI_API_KEY` | Sua chave do Google AI Studio | Fazer a Sofia funcionar |

### Passo 3: Obter a GOOGLE_GEMINI_API_KEY (se não tiver)
1. Acesse [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada

### Passo 4: Fazer Redeploy
1. No Netlify, vá em **Deploys**
2. Clique em **Trigger deploy** → **Clear cache and deploy site**

---

## Arquitetura Final (100% Independente)

```text
┌─────────────────────────────────────────────────────┐
│              www.viagecomsofia.com                  │
│                    (Netlify)                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend React (hospedado no Netlify)              │
│  ├── Login/Cadastro → Supabase Auth                │
│  ├── Chat Sofia → Netlify Function (chat-travel)   │
│  └── Roteiros → Netlify Function (generate-itin)   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Netlify Functions (suas APIs)                      │
│  ├── chat-travel.ts → Google Gemini API            │
│  ├── generate-itinerary.ts → Google Gemini API     │
│  └── create-payment.ts → Mercado Pago API          │
│                                                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│           Supabase (Seu Banco de Dados)             │
│  ├── Autenticação de usuários                       │
│  ├── Tabelas: profiles, user_credits, etc.          │
│  └── Storage: avatares                              │
└─────────────────────────────────────────────────────┘
```

---

## Migração Futura para Supabase Próprio

Quando quiser **total independência** (seu próprio Supabase):

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o arquivo `migration_completa.sql` no SQL Editor
3. Configure autenticação (Email, Google OAuth)
4. Atualize as variáveis no Netlify com as novas credenciais
5. Faça redeploy

O arquivo `DEPLOY_GUIDE.md` tem todas as instruções detalhadas.

---

## Resultado Final

Depois de aprovar este plano:
1. Vou reverter o código para usar Netlify Functions em produção
2. Você configura as 3 variáveis no Netlify
3. Faz redeploy
4. O site funciona **100% independente do Lovable**

Se o Lovable desaparecer amanhã, seu site continua funcionando normalmente.
