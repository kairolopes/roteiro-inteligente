

## Plano: Ativar Google Places API para Validação de Lugares em Tempo Real

### Objetivo
Criar uma edge function `google-places` que valida e enriquece os lugares gerados pela IA com dados reais do Google Places, incluindo coordenadas precisas, avaliações, fotos e links do Google Maps.

### Arquitetura da Solução

```text
┌─────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
│  generate-itinerary │ ──── │   google-places      │ ──── │  Google Places API   │
│  (gera roteiro IA)  │      │   (valida lugares)   │      │  (dados reais)       │
└─────────────────────┘      └──────────────────────┘      └──────────────────────┘
                                       │
                                       ▼
                             ┌──────────────────────┐
                             │   places_cache       │
                             │   (banco de dados)   │
                             └──────────────────────┘
```

### Fluxo de Dados

1. IA gera roteiro com lugares estimados
2. Para cada atividade, chamar Google Places Text Search
3. Verificar cache primeiro (evitar chamadas duplicadas)
4. Atualizar atividade com dados reais:
   - Coordenadas precisas (latitude, longitude)
   - Avaliação (rating) e total de avaliações
   - URL do Google Maps
   - Referência de foto para imagens
5. Salvar no cache (30 dias de validade)

---

### Arquivos a Criar/Modificar

#### 1. **Criar Edge Function `google-places`** (NOVO)
**Arquivo**: `supabase/functions/google-places/index.ts`

Funcionalidades:
- Endpoint POST que recebe nome do lugar e cidade
- Busca no cache primeiro (tabela `places_cache`)
- Se não encontrar, consulta Google Places Text Search API (New)
- Retorna dados enriquecidos: coordenadas, rating, googleMapsUrl, photoReference
- Salva resultado no cache

Campos solicitados à API (para otimizar custos):
- `places.id` - ID do lugar
- `places.displayName` - Nome do lugar
- `places.formattedAddress` - Endereço
- `places.location` - Coordenadas precisas
- `places.rating` - Avaliação
- `places.userRatingCount` - Total de avaliações
- `places.googleMapsUri` - Link do Google Maps
- `places.photos` - Referências de fotos

#### 2. **Modificar `generate-itinerary`** (Supabase + Netlify)
**Arquivos**: 
- `supabase/functions/generate-itinerary/index.ts`
- `netlify/functions/generate-itinerary.ts`

Adicionar etapa de enriquecimento após geração do roteiro:
- Para cada atividade do roteiro, chamar `google-places`
- Atualizar coordenadas, rating, googleMapsUrl, photoReference
- Enviar evento de progresso durante validação

#### 3. **Atualizar `supabase/config.toml`**
Já existe a configuração `[functions.google-places]`. A função precisa ser criada.

---

### Detalhes Técnicos

#### Estrutura da Edge Function `google-places`

```typescript
// Exemplo de request
POST /functions/v1/google-places
{
  "query": "Coliseu Roma",
  "city": "Roma, Itália"
}

// Exemplo de response
{
  "placeId": "ChIJrRMgU7ZhLxMRxAOFkC7I8Sg",
  "name": "Colosseum",
  "address": "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
  "coordinates": [41.8902, 12.4922],
  "rating": 4.7,
  "userRatingsTotal": 423156,
  "googleMapsUrl": "https://maps.google.com/?cid=...",
  "photoReference": "AWU5eFi...",
  "cached": false
}
```

#### Chamada à Google Places API (New)

```typescript
const response = await fetch(
  "https://places.googleapis.com/v1/places:searchText",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.photos"
    },
    body: JSON.stringify({
      textQuery: `${query} ${city}`
    })
  }
);
```

#### Lógica de Cache

1. Normalizar query (lowercase, remover acentos)
2. Verificar se existe no `places_cache` com `expires_at > now()`
3. Se existir, retornar do cache
4. Se não existir, chamar API e salvar no cache

#### Etapa de Enriquecimento no `generate-itinerary`

```typescript
// Após gerar roteiro com IA
const enrichedDays = await Promise.all(
  itinerary.days.map(async (day) => {
    const enrichedActivities = await Promise.all(
      day.activities.map(async (activity) => {
        // Buscar dados reais do Google Places
        const placeData = await validatePlace(
          activity.title,
          day.city
        );
        
        if (placeData) {
          return {
            ...activity,
            coordinates: placeData.coordinates,
            rating: placeData.rating,
            googleMapsUrl: placeData.googleMapsUrl,
            placeId: placeData.placeId,
            photoReference: placeData.photoReference
          };
        }
        return activity;
      })
    );
    return { ...day, activities: enrichedActivities };
  })
);
```

---

### Custos e Otimização

| SKU | Preço por 1000 requests | Campos |
|-----|------------------------|--------|
| Text Search Pro | $0.032 | displayName, formattedAddress, location, photos |
| Text Search Enterprise | $0.04 | + rating, userRatingCount |

**Estratégias de otimização de custos**:
1. Cache de 30 dias evita chamadas duplicadas
2. Processar apenas categorias "attraction" e "restaurant" (não transportes)
3. Limitar a 5 atividades por dia para validação
4. Fallback para dados da IA se API falhar

---

### Eventos de Progresso (Streaming)

Novos eventos durante geração:
- `{ type: "progress", step: "validating_places", message: "Validando lugares reais..." }`
- `{ type: "progress", step: "place_validated", message: "Coliseu validado ✓" }`
- `{ type: "progress", step: "validation_complete", message: "X lugares validados" }`

---

### Impacto Esperado

Após implementação:
- Coordenadas 100% precisas (do Google, não da IA)
- Avaliações reais dos usuários do Google
- Links funcionais do Google Maps para navegação
- Referências de fotos para imagens reais dos lugares
- Cache reduz custos em ~70% após primeiras buscas

### Riscos e Mitigação

| Risco | Mitigação |
|-------|-----------|
| Custo elevado da API | Cache de 30 dias + limitar validações |
| Lugar não encontrado | Manter dados da IA como fallback |
| Rate limiting | Implementar retry com backoff exponencial |
| Latência aumentada | Processar em paralelo + evento de progresso |

