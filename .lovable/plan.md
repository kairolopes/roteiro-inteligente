
# Plano: Corrigir Geração de Roteiro na Produção

## Diagnóstico do Problema

O erro ocorre porque a função `generate-itinerary` tenta chamar a função `google-places` via HTTP, mas **Netlify Functions não podem chamar outras funções internamente de forma confiável**.

### Fluxo Atual (Com Problema)
```text
Frontend → generate-itinerary → (HTTP) → google-places → Google API
                                    ↑
                             FALHA AQUI
```

### Motivo da Falha
- `getInternalBaseUrl()` retorna a URL do site Netlify
- Chamadas HTTP internas entre funções frequentemente falham ou dão timeout
- A variável `process.env.URL` pode não estar disponível ou correta

---

## Solução Proposta

**Embutir a lógica do Google Places diretamente dentro do `generate-itinerary.ts`**, eliminando a necessidade de chamada HTTP interna.

### Fluxo Corrigido
```text
Frontend → generate-itinerary → Google API (direto)
                              → Supabase cache (direto)
```

---

## Arquivos a Modificar

### 1. `netlify/functions/generate-itinerary.ts`

Modificar a função `validatePlace()` para:
- Conectar diretamente ao Supabase (já tem acesso às credenciais)
- Chamar a Google Places API diretamente
- Salvar no cache diretamente

```typescript
// ANTES (linha 34-68):
async function validatePlace(title: string, city: string) {
  const baseUrl = getInternalBaseUrl();
  const response = await fetch(`${baseUrl}/.netlify/functions/google-places`, ...);
  // ...
}

// DEPOIS:
async function validatePlace(title: string, city: string) {
  // Lógica do google-places embutida diretamente
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  
  // 1. Verificar cache
  const { data: cached } = await supabase
    .from("places_cache")
    .select("*")
    .eq("search_query", normalizedQuery)
    .single();
  
  if (cached) return formatCachedData(cached);
  
  // 2. Chamar Google Places API diretamente
  const placesResponse = await fetch("https://places.googleapis.com/v1/places:searchText", {
    headers: { "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY, ... }
  });
  
  // 3. Salvar no cache e retornar
  // ...
}
```

### Benefícios da Solução
- Elimina chamada HTTP interna que estava falhando
- Reduz latência (menos hops de rede)
- Mais confiável e robusto
- Mesma lógica, apenas reorganizada

---

## Pré-requisitos (Já Configurados)

Verificar se você tem no Netlify estas variáveis:
- `GOOGLE_GEMINI_API_KEY` - Para gerar o roteiro
- `GOOGLE_PLACES_API_KEY` - Para validar lugares
- `VITE_SUPABASE_URL` - URL do seu Supabase externo
- `SUPABASE_SERVICE_ROLE_KEY` - Para acessar o cache

---

## Verificação Adicional

Preciso confirmar se a tabela `places_cache` existe no seu Supabase externo. Se não existir, vou criar um SQL para você executar lá.

---

## Resumo da Implementação

1. Copiar funções auxiliares do `google-places.ts` para `generate-itinerary.ts`:
   - `normalizeQuery()`
   - `resolvePhotoUrl()`

2. Reescrever `validatePlace()` para:
   - Criar cliente Supabase diretamente
   - Verificar cache na tabela `places_cache`
   - Chamar Google Places API se não encontrar
   - Salvar no cache

3. Adicionar import do `@supabase/supabase-js`

4. Manter `netlify/functions/google-places.ts` para uso direto pelo frontend se necessário

---

## Próximos Passos Após Aprovação

1. Implementar as mudanças no código
2. Você faz redeploy no Netlify
3. Testar geração de roteiro na produção
