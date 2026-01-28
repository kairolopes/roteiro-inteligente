
# Correção: PDF com Erros de Layout e Mapa Errado

## Problemas Identificados

### 1. Mapa mostrando região errada (Eritréia ao invés de Itália)
**Causa raiz**: A função `toCoordinate` está invertendo latitude e longitude!

```typescript
// ATUAL (ERRADO):
function toCoordinate(tuple: [number, number]): Coordinate {
  return { lng: tuple[0], lat: tuple[1] };  // Trata [lat, lng] como [lng, lat]
}
```

O formato de coordenadas no sistema é `[lat, lng]` (ex: `[41.9028, 12.4964]` = Roma), mas o código assume `[lng, lat]`. Isso faz:
- Roma (41.9°N, 12.5°E) → ser interpretado como (12.5°N, 41.9°E) = Eritréia/Etiópia!

### 2. Imagem de capa com texto sobreposto
A imagem do Unsplash às vezes contém elementos visuais (texto de mapa, legendas) que aparecem atrás do título do roteiro.

### 3. Orçamento ultrapassando margem na página final
O valor de `totalBudget` como "R$5.000 - R$8.000 (estimado por pessoa...)" é muito longo e não está sendo truncado na página de resumo.

---

## Mudanças Técnicas

### Arquivo: `src/hooks/usePDFExport.ts`

**Correção 1 - Inverter coordenadas (linhas 71-74):**
```typescript
// ANTES (errado):
function toCoordinate(tuple: [number, number]): Coordinate {
  return { lng: tuple[0], lat: tuple[1] };
}

// DEPOIS (correto):
function toCoordinate(tuple: [number, number]): Coordinate {
  return { lat: tuple[0], lng: tuple[1] };  // [lat, lng] é o formato do sistema
}
```

**Correção 2 - Adicionar overlay mais forte na imagem de capa (linhas 222-231):**
```typescript
// Cover image
if (coverImage) {
  try {
    pdf.addImage(coverImage, "JPEG", 0, 0, PAGE_WIDTH, PAGE_HEIGHT * 0.6);
    // Overlay mais forte para esconder texto da imagem
    pdf.setFillColor(30, 27, 75);
    pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT * 0.6, "F"); // Cobre TODA a imagem
    // Definir opacidade via GState (jsPDF 2.x)
    // Alternativa: usar imagem menor ou sem texto
  } catch (e) {
    console.error("Failed to add cover image:", e);
  }
}
```

**Alternativa mais elegante para capa**: Não usar imagem de fundo na área do texto, apenas no topo.

**Correção 3 - Truncar orçamento na página final (linhas 641-664):**
```typescript
const stats = [
  { label: "Duracao", value: normalizeTextForPDF(itinerary.duration) || "-" },
  { label: "Orcamento", value: truncateBudget(itinerary.totalBudget) },
  { label: "Destinos", value: itinerary.destinations?.length?.toString() || "0" },
  { label: "Atividades", value: itinerary.days.reduce((a, d) => a + d.activities.length, 0).toString() },
];

// Nova função auxiliar:
function truncateBudget(budget: string): string {
  if (!budget) return "-";
  const normalized = normalizeTextForPDF(budget);
  // Extrair apenas o valor principal (ex: "R$5.000 - R$8.000")
  const match = normalized.match(/R\$[\d\.,]+ - R\$[\d\.,]+|R\$[\d\.,]+/);
  return match ? match[0] : normalized.slice(0, 25) + (normalized.length > 25 ? '...' : '');
}
```

Além disso, usar `drawTextEllipsis` para o valor:
```typescript
// Em vez de pdf.text direto, usar truncamento:
const maxValueWidth = cardWidth - 15;
drawTextEllipsis(pdf, stat.value, x + 10, cardY + 20, maxValueWidth);
```

---

## Resumo das Mudanças

| Problema | Arquivo | Linha(s) | Solução |
|----------|---------|----------|---------|
| Mapa errado (Eritréia) | `usePDFExport.ts` | 72-74 | Inverter `lat`/`lng` na função `toCoordinate` |
| Imagem sobre texto | `usePDFExport.ts` | 222-231 | Usar overlay sólido ou reduzir área da imagem |
| Orçamento cortado | `usePDFExport.ts` | 641-664 | Truncar `totalBudget` e usar `drawTextEllipsis` |

---

## Fluxo Visual

```text
Antes:
┌─────────────────────────────────────┐
│ toCoordinate([41.9, 12.5])          │
│   → { lng: 41.9, lat: 12.5 }        │
│   → Mapa mostra: 12.5°N, 41.9°E     │
│   → ERITRÉIA!                       │
└─────────────────────────────────────┘

Depois:
┌─────────────────────────────────────┐
│ toCoordinate([41.9, 12.5])          │
│   → { lat: 41.9, lng: 12.5 }        │
│   → Mapa mostra: 41.9°N, 12.5°E     │
│   → ROMA, ITÁLIA ✓                  │
└─────────────────────────────────────┘
```

---

## Impacto

- Mapa do PDF mostrará corretamente Roma e Florença (Itália)
- Capa terá texto legível sem interferência da imagem
- Orçamento na página de resumo não ultrapassará a margem
- Todos os textos longos serão truncados adequadamente
