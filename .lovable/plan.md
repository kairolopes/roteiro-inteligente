

## Plano: Habilitar Google Places na Produção

### Situação Atual

A função `netlify/functions/generate-itinerary.ts` chama:
```
${SUPABASE_URL}/functions/v1/google-places
```

Como você usa um Supabase externo, essa Edge Function NÃO existe lá (ela só existe no Lovable Cloud).

---

### Opção 1: Criar Netlify Function para Google Places (RECOMENDADO)

Criar `netlify/functions/google-places.ts` e alterar o `generate-itinerary.ts` para chamar ela ao invés do Supabase.

**Vantagens:**
- Tudo fica no Netlify, sem depender de Edge Functions
- Você já tem `GOOGLE_PLACES_API_KEY` configurada no Netlify

**Arquivos a criar/modificar:**

1. **`netlify/functions/google-places.ts`** (NOVO)
   - Converter a lógica de `supabase/functions/google-places/index.ts` para Netlify
   - Usar Google Places API diretamente
   - Implementar cache no Supabase via SDK

2. **`netlify/functions/generate-itinerary.ts`** (MODIFICAR)
   - Alterar linha 24 de:
     ```typescript
     fetch(`${SUPABASE_URL}/functions/v1/google-places`, ...)
     ```
   - Para:
     ```typescript
     fetch(`/.netlify/functions/google-places`, ...)
     ```

---

### Opção 2: Deploy via Supabase CLI

Fazer deploy da Edge Function `google-places` no seu Supabase externo.

**Passos no terminal:**
```bash
# 1. Instalar CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Linkar projeto (use o Reference ID do seu projeto)
supabase link --project-ref SEU_PROJECT_ID

# 4. Configurar secret
supabase secrets set GOOGLE_PLACES_API_KEY=sua_chave_aqui

# 5. Deploy da função
supabase functions deploy google-places
```

**Desvantagem:** Requer uso do terminal e conhecimento de CLI.

---

### Recomendação

**Opção 1 é mais simples** - você não precisa mexer com CLI, tudo fica centralizado no Netlify.

Posso implementar a Opção 1 agora?

---

### Detalhes Técnicos da Opção 1

#### Nova `netlify/functions/google-places.ts`

A função vai:
1. Receber `query` e `city` no body
2. Verificar cache na tabela `places_cache` do Supabase
3. Se não encontrar, chamar Google Places API (Text Search)
4. Salvar no cache com expiração de 30 dias
5. Retornar dados do lugar (coordenadas, rating, foto, etc.)

#### Alteração em `generate-itinerary.ts`

```typescript
// Linha 24 - DE:
const response = await fetch(`${SUPABASE_URL}/functions/v1/google-places`, {

// PARA:
const response = await fetch(`/.netlify/functions/google-places`, {
```

---

### Pré-requisitos

No Netlify, você precisa ter configurado:
- `GOOGLE_PLACES_API_KEY` ✅ (você já tem)
- `VITE_SUPABASE_URL` ✅ (você já tem)
- `VITE_SUPABASE_PUBLISHABLE_KEY` ✅ (você já tem)
- `SUPABASE_SERVICE_ROLE_KEY` (para acessar cache) - **VERIFICAR SE TEM**

