# Guia de Deploy - Viage Com Sofia

Este guia explica como migrar completamente a plataforma Viage Com Sofia para sua própria infraestrutura.

---

## Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Conta na [Vercel](https://vercel.com) ou [Netlify](https://netlify.com)
- [Node.js](https://nodejs.org) 18+ instalado
- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado
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
   - `Project Reference ID` (o xxxxx da URL)

---

## Passo 2: Executar Migração do Banco de Dados

1. No Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `migration_completa.sql`
4. Cole no editor SQL
5. Clique em "Run" (ou Ctrl+Enter)
6. Verifique se todas as tabelas foram criadas em **Table Editor**

---

## Passo 3: Configurar Autenticação

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

## Passo 4: Instalar Supabase CLI e Fazer Login

```bash
# Instalar CLI (se ainda não instalou)
npm install -g supabase

# Fazer login
supabase login
```

---

## Passo 5: Linkar ao Projeto Supabase

```bash
# Na raiz do projeto
supabase link --project-ref SEU_PROJECT_REFERENCE_ID
```

---

## Passo 6: Configurar Secrets

Execute os comandos abaixo substituindo pelos seus valores:

```bash
# Chave do Google Gemini (obrigatório)
supabase secrets set GOOGLE_GEMINI_API_KEY=sua_chave_aqui

# Mercado Pago Access Token (obrigatório para pagamentos)
supabase secrets set MP_ACCESS_TOKEN=seu_access_token_aqui

# Mercado Pago Public Key (obrigatório para pagamentos)
supabase secrets set MP_PUBLIC_KEY=sua_public_key_aqui

# Opcional: APIs de lugares
supabase secrets set FOURSQUARE_API_KEY=sua_chave_aqui
supabase secrets set GOOGLE_PLACES_API_KEY=sua_chave_aqui
```

### Onde obter as chaves:

- **Google Gemini**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Mercado Pago**: [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel/app)
- **Foursquare**: [Foursquare Developers](https://foursquare.com/developers)
- **Google Places**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

---

## Passo 7: Deploy das Edge Functions

```bash
# Deploy de todas as funções
supabase functions deploy chat-travel
supabase functions deploy generate-itinerary
supabase functions deploy create-payment
supabase functions deploy mp-webhook
```

---

## Passo 8: Atualizar Configuração do Frontend

### 8.1 Criar arquivo `.env.production`

Na raiz do projeto, crie o arquivo `.env.production`:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_anon_key_aqui
VITE_SUPABASE_PROJECT_ID=SEU_PROJECT_ID
```

### 8.2 Atualizar `src/integrations/supabase/client.ts`

Substitua o conteúdo pelo seguinte:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

---

## Passo 9: Build do Projeto

```bash
# Instalar dependências
npm install

# Build de produção
npm run build
```

O build será gerado na pasta `dist/`.

---

## Passo 10: Deploy na Vercel

### 10.1 Conectar Repositório

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New... > Project"
3. Importe seu repositório do GitHub
4. Selecione o repositório `viage-com-sofia`

### 10.2 Configurar Build

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 10.3 Adicionar Variáveis de Ambiente

Adicione as seguintes variáveis:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | https://SEU_PROJECT_ID.supabase.co |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | sua_anon_key_aqui |
| `VITE_SUPABASE_PROJECT_ID` | SEU_PROJECT_ID |

### 10.4 Deploy

Clique em "Deploy" e aguarde.

---

## Passo 11: Configurar Domínio Personalizado

### 11.1 Na Vercel

1. Vá em **Settings > Domains**
2. Adicione seu domínio: `viagecomsofia.com`
3. Adicione também: `www.viagecomsofia.com`
4. Anote os registros DNS fornecidos

### 11.2 Na Hostinger (ou seu provedor DNS)

Configure os seguintes registros:

| Tipo | Nome | Valor |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

### 11.3 Aguardar Propagação

A propagação DNS pode levar até 48 horas.

---

## Passo 12: Atualizar Webhooks do Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel/app)
2. Selecione sua aplicação
3. Vá em **Webhooks > Configurar notificações**
4. Configure a URL de notificação:
   ```
   https://SEU_PROJECT_ID.supabase.co/functions/v1/mp-webhook
   ```
5. Selecione os eventos: `payment`
6. Salve

---

## Verificação Final

Após completar todos os passos, verifique:

- [ ] Site acessível em viagecomsofia.com
- [ ] Login/cadastro funcionando
- [ ] Chat com IA funcionando
- [ ] Geração de roteiros funcionando
- [ ] Pagamentos Mercado Pago funcionando
- [ ] Google OAuth funcionando (se configurado)

---

## Solução de Problemas

### Erro de CORS

Verifique se as Edge Functions têm os headers CORS corretos.

### Erro de autenticação

Verifique se as variáveis de ambiente estão corretas no Vercel.

### Pagamentos não processando

1. Verifique se o webhook está configurado corretamente no Mercado Pago
2. Verifique os logs da função `mp-webhook`:
   ```bash
   supabase functions logs mp-webhook
   ```

### Chat/Roteiros não funcionando

1. Verifique se a chave GOOGLE_GEMINI_API_KEY está configurada
2. Verifique os logs:
   ```bash
   supabase functions logs chat-travel
   supabase functions logs generate-itinerary
   ```

---

## Custos Estimados

| Serviço | Plano | Custo Mensal |
|---------|-------|--------------|
| Supabase | Free | $0 |
| Vercel | Hobby | $0 |
| Domínio | Hostinger | ~R$ 40/ano |
| **Total** | | **~$0/mês** |

Para mais recursos, considere:
- Supabase Pro: $25/mês
- Vercel Pro: $20/mês

---

## Suporte

Em caso de dúvidas:
- Documentação Supabase: https://supabase.com/docs
- Documentação Vercel: https://vercel.com/docs
- Mercado Pago: https://www.mercadopago.com.br/developers
