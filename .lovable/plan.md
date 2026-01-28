

# Correção: Links do Google Maps Apontando para Locais Genéricos

## Problema Identificado

O botão "Ver no Google Maps" abre uma localização genérica (no meio do Rio Arno) em vez do ponto turístico exato, mesmo quando os dados do Google Places foram validados corretamente.

### Causa Raiz

O sistema já busca e armazena URLs precisas do Google Maps via API (formato `https://maps.google.com/?cid=123456`), mas o código do `ActivityCard.tsx` **ignora essa URL** e constrói uma URL genérica baseada apenas em coordenadas.

**Dado no banco de dados:**
```text
Galleria degli Uffizi
├── google_maps_url: https://maps.google.com/?cid=14834496294842582221 ← URL PRECISA
├── location_lat: 43.7677856
└── location_lng: 11.2553108
```

**Comportamento atual (ERRADO):**
```typescript
// ActivityCard.tsx - ignora googleMapsUrl!
if (activity.coordinates) {
  const [lat, lng] = activity.coordinates;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  // Resultado: URL genérica que abre no meio do rio
}
```

**Resultado:** 
- URL com `?cid=` → Abre diretamente na página do estabelecimento (fotos, avaliações, horários)
- URL com `?query=lat,lng` → Abre um pin genérico nas coordenadas (pode ser impreciso)

---

## Solução

Alterar a função `getGoogleMapsUrl` no `ActivityCard.tsx` para **priorizar** a URL do Google Places quando disponível.

### Mudança no Arquivo

**Arquivo:** `src/components/itinerary/ActivityCard.tsx`

**Linhas 79-90** - Atualizar a função:

```typescript
// ANTES (ignora googleMapsUrl)
function getGoogleMapsUrl(activity: Activity): string | null {
  if (activity.coordinates && activity.coordinates.length === 2) {
    const [lat, lng] = activity.coordinates;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  if (activity.location) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`;
  }
  return null;
}

// DEPOIS (prioriza googleMapsUrl validada)
function getGoogleMapsUrl(activity: Activity): string | null {
  // Prioridade 1: URL direta do Google Places (mais precisa)
  if (activity.googleMapsUrl) {
    return activity.googleMapsUrl;
  }
  
  // Prioridade 2: Coordenadas validadas
  if (activity.coordinates && activity.coordinates.length === 2) {
    const [lat, lng] = activity.coordinates;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  
  // Prioridade 3: Busca por nome do local
  if (activity.location) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`;
  }
  
  return null;
}
```

---

## Comparação de URLs

| Tipo | Formato | Resultado |
|------|---------|-----------|
| `cid=` (Google Places) | `maps.google.com/?cid=14834496294842582221` | Abre página da Galleria degli Uffizi com fotos, avaliações, horários |
| `query=coords` (atual) | `maps.google.com/search/?api=1&query=43.77,11.25` | Abre pin genérico nas coordenadas |
| `query=nome` (fallback) | `maps.google.com/search/?api=1&query=Galleria%20Uffizi` | Faz busca pelo nome |

---

## Impacto

- **Atividades validadas** (com selo "Verificado") → Abrirão diretamente na página do estabelecimento no Google Maps
- **Atividades não validadas** → Continuarão usando coordenadas ou nome como fallback
- **QR Codes no PDF** → Também podem ser atualizados para usar a mesma lógica no `qrCodeService.ts`

---

## Arquivos Afetados

1. `src/components/itinerary/ActivityCard.tsx` - Função `getGoogleMapsUrl`
2. `src/services/qrCodeService.ts` - Função `getGoogleMapsUrl` (opcional, para consistência nos PDFs)

