
# Plano: Restaurar Login e Chat IA no viagecomsofia.com

## Diagnóstico Confirmado

O código está correto e funcionando. O problema é **exclusivamente de configuração no painel do Netlify**. As variáveis de ambiente precisam ser configuradas lá porque:

- O arquivo `.env` local **não é enviado** para produção (está no `.gitignore` por segurança)
- Cada ambiente (Lovable, localhost, Netlify) precisa de suas próprias variáveis

---

## Configuração Necessária no Netlify

### Passo 1: Acessar Configurações de Ambiente

1. Acesse [app.netlify.com](https://app.netlify.com)
2. Selecione o site **viagecomsofia.com**
3. Vá em **Site configuration** (menu lateral)
4. Clique em **Environment variables**

### Passo 2: Adicionar as Variáveis

Adicione **EXATAMENTE** estas 4 variáveis:

| Nome da Variável | Valor |
|-----------------|-------|
| `VITE_SUPABASE_URL` | `https://rvmvoogyrafiogxdbisx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bXZvb2d5cmFmaW9neGRiaXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjQ4MjksImV4cCI6MjA4Mzk0MDgyOX0.3ZXQhOP7NJ4JfSr3AFuuIOJKN7SLd-tZ5XpeU6SWagY` |
| `VITE_SUPABASE_PROJECT_ID` | `rvmvoogyrafiogxdbisx` |
| `GOOGLE_GEMINI_API_KEY` | *(sua chave do Google AI Studio)* |

**Nota:** A chave `GOOGLE_GEMINI_API_KEY` você obteve anteriormente no [Google AI Studio](https://aistudio.google.com/app/apikey). Se não lembra, pode gerar uma nova.

### Passo 3: Fazer Redeploy

1. Vá em **Deploys** no menu do Netlify
2. Clique em **Trigger deploy** → **Clear cache and deploy site**
3. Aguarde ~2 minutos para o deploy completar

---

## O que Cada Variável Faz

| Variável | Função |
|----------|--------|
| `VITE_SUPABASE_URL` | URL do banco de dados - necessária para login/cadastro |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave de acesso ao banco - necessária para autenticação |
| `VITE_SUPABASE_PROJECT_ID` | ID do projeto - usada em algumas funções |
| `GOOGLE_GEMINI_API_KEY` | Chave da IA - necessária para a Sofia responder no chat |

---

## Resultado Esperado

Após o redeploy:
- Login e cadastro funcionarão
- Chat com a Sofia funcionará
- Geração de roteiros funcionará

---

## Detalhes Técnicos

O sistema foi projetado para ser independente usando variáveis de ambiente. A arquitetura:

```text
┌─────────────────────────────────────────────────────┐
│                  viagecomsofia.com                  │
│                    (Netlify)                        │
├─────────────────────────────────────────────────────┤
│  Frontend React                                     │
│  └── usa VITE_SUPABASE_* para autenticação         │
│                                                     │
│  Netlify Functions                                  │
│  └── chat-travel.ts                                │
│      └── usa GOOGLE_GEMINI_API_KEY para IA         │
├─────────────────────────────────────────────────────┤
│                        ↓                            │
│            Lovable Cloud (Supabase)                 │
│  └── Banco de dados PostgreSQL                     │
│  └── Autenticação de usuários                      │
└─────────────────────────────────────────────────────┘
```

O `.env` local existe apenas para desenvolvimento. Em produção, o Netlify precisa ter suas próprias variáveis configuradas no painel.
