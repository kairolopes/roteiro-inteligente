

# Correção: Links do Google Maps Apontando para Locais Errados

## Problema Identificado

Quando você clica em "Ver no Google Maps" nos cards de atividades do roteiro, o link abre em uma localização errada (geralmente um lugar vazio ou incorreto).

**Causa raiz**: Existe uma inconsistência na ordem das coordenadas em um dos arquivos do código.

### Formato das Coordenadas no Sistema

O sistema armazena coordenadas no formato padrão geográfico:
- **Primeiro valor**: Latitude (ex: 41.89 para Roma)
- **Segundo valor**: Longitude (ex: 12.49 para Roma)

Exemplo do banco de dados:
- Coliseu: `lat: 41.8902102, lng: 12.4922309`

### O Bug

No arquivo `src/services/qrCodeService.ts` (linha 44), as coordenadas estão sendo interpretadas **ao contrário**:

```typescript
// INCORRETO - assume [lng, lat]
const [lng, lat] = coordinates;
return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
```

Isso inverte latitude e longitude, gerando URLs como:
- **Errado**: `query=12.49,41.89` (ponto no mar ou lugar vazio)
- **Correto**: `query=41.89,12.49` (Coliseu, Roma)

### Comparação com Arquivo Correto

O `ActivityCard.tsx` (linha 82) faz corretamente:
```typescript
// CORRETO - assume [lat, lng]
const [lat, lng] = activity.coordinates;
return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
```

---

## Solução

Corrigir o `qrCodeService.ts` para interpretar as coordenadas na ordem correta.

### Mudança

**Arquivo**: `src/services/qrCodeService.ts`

**Linha 44** - Inverter a ordem da desestruturação:

```typescript
// Antes (INCORRETO)
const [lng, lat] = coordinates;

// Depois (CORRETO)
const [lat, lng] = coordinates;
```

---

## Impacto

Esta correção afeta:

1. **QR Codes gerados para atividades** - Os QR codes no PDF agora apontarão para os locais corretos
2. **Função `generateItineraryQRCodes`** - Usada na exportação de PDF

O botão "Ver no Google Maps" nos cards já funciona corretamente pois usa a função local do `ActivityCard.tsx`.

---

## Resumo Técnico

| Arquivo | Função | Formato Esperado | Status |
|---------|--------|------------------|--------|
| `ActivityCard.tsx` | `getGoogleMapsUrl` | `[lat, lng]` | ✅ Correto |
| `qrCodeService.ts` | `getGoogleMapsUrl` | `[lng, lat]` ❌ | Precisa correção |
| `google-places/index.ts` | Retorno da API | `[lat, lng]` | ✅ Correto |
| `staticMapService.ts` | Renderização do mapa | `{lat, lng}` | ✅ Correto |

