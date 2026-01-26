# Guia de Deploy - Viage Com Sofia (100% Independente do Lovable)

Este guia explica como fazer deploy da plataforma usando **Netlify + Supabase**, completamente independente do Lovable.

---

## Arquitetura Final

```
┌─────────────────────────────────────────────────────┐
│              www.viagecomsofia.com                  │
│                    (Netlify)                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend React (hospedado no Netlify)              │
│  ├── Login/Cadastro → Supabase Auth                 │
│  ├── Chat Sofia → Netlify Function (chat-travel)   │
│  ├── Roteiros → Netlify Function (generate-itin)   │
│  └── Voos → Netlify Function (flight-prices)       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Netlify Functions (suas APIs)                      │
│  ├── chat-travel.ts → Google Gemini API            │
│  ├── generate-itinerary.ts → Google Gemini API     │
│  ├── flight-prices.ts → Travelpayouts API          │
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

## Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Conta no [Netlify](https://netlify.com)
- Repositório clonado localmente

---

## Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Escolha um nome para o projeto (ex: `viage-com-sofia`)
4. Escolha uma região próxima (ex: `South America (São Paulo)`)
5. Defina uma senha forte para o banco de dados
6. Clique em "Create new project"
7. **ANOTE** as seguintes informações da página "Project Settings > API":
   - `Project URL` (ex: https://xxxxx.supabase.co)
   - `anon public` key (começa com `eyJ...`)

---

## Passo 2: Executar Migração do Banco de Dados

1. No Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `migration_completa.sql`
4. Cole no editor SQL
5. Clique em "Run" (ou Ctrl+Enter)
6. Verifique se todas as tabelas foram criadas em **Table Editor**

---

## Passo 3: Configurar Autenticação no Supabase

### Email (Obrigatório)

1. Vá em **Authentication > Providers**
2. Clique em **Email**
3. Certifique-se de que está **habilitado**
4. Em "Email Settings", habilite **"Confirm email"** = OFF (auto-confirm)
5. Salve

### Google OAuth (Opcional)

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services > Credentials**
4. Clique em **Create Credentials > OAuth client ID**
5. Tipo: **Web application**
6. Adicione em "Authorized redirect URIs":
   ```
   https://SEU_PROJECT_ID.supabase.co/auth/v1/callback
   ```
7. Copie o **Client ID** e **Client Secret**
8. No Supabase, vá em **Authentication > Providers > Google**
9. Cole o Client ID e Client Secret
10. Salve

---

## Passo 4: Deploy no Netlify

### 4.1 Conectar Repositório

1. Acesse [app.netlify.com](https://app.netlify.com)
2. Clique em "Add new site" > "Import an existing project"
3. Conecte seu repositório GitHub
4. Selecione o repositório

### 4.2 Configurar Build

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

### 4.3 Adicionar Variáveis de Ambiente

Vá em **Site configuration > Environment variables** e adicione:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | URL do seu projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGci...` | Chave anon/public do Supabase |
| `GOOGLE_GEMINI_API_KEY` | `AIza...` | Chave do Google AI Studio |
| `TRAVELPAYOUTS_API_TOKEN` | `xxx...` | Token da API Travelpayouts |
| `MP_ACCESS_TOKEN` | `APP_USR-...` | Token do Mercado Pago |

### 4.4 Onde obter as chaves

- **Google Gemini**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Travelpayouts**: [Travelpayouts](https://www.travelpayouts.com/) - Crie conta e obtenha token
- **Mercado Pago**: [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel/app)

### 4.5 Deploy

Clique em "Deploy site" e aguarde.

---

## Passo 5: Configurar Domínio Personalizado

### 5.1 No Netlify

1. Vá em **Domain management > Domains**
2. Clique em "Add a domain"
3. Digite: `viagecomsofia.com`
4. Siga as instruções para configurar DNS

### 5.2 Na Hostinger (ou seu provedor DNS)

Configure os registros DNS conforme instruções do Netlify.

---

## Passo 6: Configurar Webhooks

### Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel/app)
2. Vá em **Webhooks > Configurar notificações**
3. URL de notificação:
   ```
   https://viagecomsofia.com/.netlify/functions/mp-webhook
   ```
4. Selecione eventos: `payment`

### Hotmart (se usar)

Configure o webhook para:
```
https://SEU_PROJECT_ID.supabase.co/functions/v1/hotmart-webhook
```

---

## Verificação Final

Após completar todos os passos, verifique:

- [ ] Site acessível em viagecomsofia.com
- [ ] Login/cadastro funcionando
- [ ] Chat com IA funcionando
- [ ] Geração de roteiros funcionando
- [ ] Busca de voos funcionando
- [ ] Pagamentos funcionando

---

## Solução de Problemas

### Chat/Roteiros não funcionando

1. Verifique se `GOOGLE_GEMINI_API_KEY` está configurada no Netlify
2. Verifique os logs em: Netlify > Functions > chat-travel ou generate-itinerary

### Voos não carregando

1. Verifique se `TRAVELPAYOUTS_API_TOKEN` está configurada
2. Verifique os logs da função `flight-prices`

### Erro de CORS

As Netlify Functions já incluem headers CORS. Se persistir, verifique se o domínio está correto.

### Pagamentos não processando

1. Verifique `MP_ACCESS_TOKEN` no Netlify
2. Verifique se o webhook está configurado corretamente no Mercado Pago

---

## Comandos Úteis

```bash
# Testar localmente
npm run dev

# Build de produção
npm run build

# Deploy manual no Netlify (se precisar)
netlify deploy --prod
```

---

## Custos Estimados

| Serviço | Plano | Custo Mensal |
|---------|-------|--------------|
| Supabase | Free | $0 |
| Netlify | Free | $0 |
| Domínio | Hostinger | ~R$ 40/ano |
| **Total** | | **~$0/mês** |

Para escalar:
- Supabase Pro: $25/mês
- Netlify Pro: $19/mês

---

## Suporte

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Netlify](https://docs.netlify.com)
- [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
