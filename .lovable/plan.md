
# Redesign Completo: Capa e Mapa do PDF

## Problemas Atuais

1. **Capa (páginas 1-2)**: Imagem do Unsplash com textos de mapa/legendas aparecendo atrás do título - ficou confuso e feio
2. **Mapa (página 2)**: Tiles do OpenStreetMap ficaram com baixa qualidade e mostram informações irrelevantes

---

## Nova Abordagem

### 1. CAPA - Design Minimalista sem Imagem Externa

**Remover a dependência de imagens do Unsplash** e criar uma capa elegante 100% desenhada com jsPDF:

```
┌─────────────────────────────────────────────┐
│                                             │
│     ┌─────────────────────────────┐         │
│     │  🌍 Ilustração geométrica   │         │
│     │  (círculos/linhas em azul)  │         │
│     └─────────────────────────────┘         │
│                                             │
│        DOLCE VITA ROMANTICA:                │
│         ROMA E FLORENÇA                     │
│                                             │
│  "Descubra a magia da Itália em uma        │
│   jornada inesquecível..."                  │
│                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ 7 dias │ │R$8.000 │ │ 2 dest │          │
│  └────────┘ └────────┘ └────────┘          │
│                                             │
│              [QR CODE]                      │
│         Viaje com Sofia                     │
└─────────────────────────────────────────────┘
```

**Elementos decorativos desenhados:**
- Padrão geométrico sutil no topo (círculos concêntricos, linhas diagonais)
- Ícone de avião estilizado
- Gradiente suave de roxo escuro para azul

---

### 2. MAPA - Esquema Ilustrado (sem tiles externos)

**Substituir tiles OSM por um mapa esquemático desenhado diretamente:**

```
┌─────────────────────────────────────────────┐
│           MAPA DA VIAGEM                    │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  │    ① Roma ─────────────→ ② Florença   │  │
│  │       ○                      ○        │  │
│  │       │                      │        │  │
│  │    4 dias               3 dias        │  │
│  │                                       │  │
│  │    -------- Linha tracejada -------   │  │
│  │             conectando cidades        │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Legenda:                                   │
│  ○──○ Rota do roteiro                       │
│  ① ② Ordem das cidades                      │
└─────────────────────────────────────────────┘
```

**Características:**
- Fundo limpo em azul claro (#f0f9ff)
- Cidades como círculos numerados com nomes
- Linhas tracejadas conectando cidades na ordem
- Posições baseadas em latitude/longitude relativas (sem precisão geográfica exata, apenas representação visual)
- Opcionalmente: pequeno outline simplificado do país (Itália = bota)

---

## Mudanças Técnicas

### Arquivo: `src/hooks/usePDFExport.ts`

#### A. Redesenhar `renderCoverPage` (linhas 219-333)

```typescript
function renderCoverPage(
  pdf: jsPDF,
  itinerary: ItineraryData,
  coverImage: string | null, // NÃO USAR MAIS
  webQR: string | null
) {
  // Fundo sólido gradiente simulado
  pdf.setFillColor("#1e1b4b");
  pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
  
  // Decoração geométrica no topo (círculos, linhas)
  drawCoverDecoration(pdf);
  
  // Título centralizado
  const titleY = PAGE_HEIGHT * 0.35;
  pdf.setTextColor(COLORS.white);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  // ... título e resumo
  
  // Badges de informação
  // ... badges redesenhados
  
  // QR code e branding
}

// Nova função auxiliar
function drawCoverDecoration(pdf: jsPDF) {
  // Círculos decorativos no topo
  pdf.setDrawColor("#4f46e5");
  pdf.setLineWidth(0.5);
  
  // Círculo grande central
  pdf.circle(PAGE_WIDTH / 2, 60, 40, "S");
  pdf.circle(PAGE_WIDTH / 2, 60, 30, "S");
  pdf.circle(PAGE_WIDTH / 2, 60, 20, "S");
  
  // Linhas diagonais decorativas
  pdf.setDrawColor("#6366f1");
  for (let i = 0; i < 5; i++) {
    pdf.line(0, 20 + i * 15, 50 + i * 20, 0);
    pdf.line(PAGE_WIDTH, 20 + i * 15, PAGE_WIDTH - 50 - i * 20, 0);
  }
  
  // Ícone de avião simplificado
  pdf.setFillColor("#818cf8");
  // Desenhar forma de avião com paths
}
```

#### B. Redesenhar `renderMapPage` (linhas 335-427)

```typescript
async function renderMapPage(
  pdf: jsPDF,
  itinerary: ItineraryData
): Promise<void> {
  pdf.addPage();
  
  // Header
  pdf.setFillColor(COLORS.primaryDark);
  pdf.rect(0, 0, PAGE_WIDTH, 40, "F");
  pdf.setTextColor(COLORS.white);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("Mapa da Viagem", PAGE_WIDTH / 2, 25, { align: "center" });
  
  // Desenhar mapa esquemático diretamente
  drawSchematicMap(pdf, itinerary);
  
  // Resumo dos dias abaixo
  // ...
}

function drawSchematicMap(pdf: jsPDF, itinerary: ItineraryData) {
  const mapY = 50;
  const mapHeight = 120;
  const mapWidth = CONTENT_WIDTH;
  
  // Container do mapa
  drawRoundedRect(pdf, MARGIN, mapY, mapWidth, mapHeight, 8, "#f0f9ff", "#e0e7ff");
  
  // Calcular posições das cidades baseado em coordenadas
  const cities = itinerary.days.filter((d, i, arr) => 
    i === 0 || d.city !== arr[i-1].city
  );
  
  if (cities.length === 0) return;
  
  // Normalizar coordenadas para o espaço do mapa
  const coords = cities.map(d => toCoordinate(d.coordinates));
  const minLat = Math.min(...coords.map(c => c.lat));
  const maxLat = Math.max(...coords.map(c => c.lat));
  const minLng = Math.min(...coords.map(c => c.lng));
  const maxLng = Math.max(...coords.map(c => c.lng));
  
  const padding = 25;
  const innerWidth = mapWidth - padding * 2;
  const innerHeight = mapHeight - padding * 2;
  
  // Converter coordenadas para posições no PDF
  const points = coords.map((c, i) => {
    const x = MARGIN + padding + ((c.lng - minLng) / (maxLng - minLng || 1)) * innerWidth;
    const y = mapY + padding + ((maxLat - c.lat) / (maxLat - minLat || 1)) * innerHeight;
    return { x, y, city: cities[i].city, days: countDaysInCity(itinerary, cities[i].city) };
  });
  
  // Desenhar linha de conexão (tracejada)
  pdf.setDrawColor("#3b82f6");
  pdf.setLineWidth(2);
  pdf.setLineDashPattern([4, 3], 0);
  
  for (let i = 0; i < points.length - 1; i++) {
    pdf.line(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
  }
  pdf.setLineDashPattern([], 0);
  
  // Desenhar marcadores de cidade
  points.forEach((p, i) => {
    // Sombra
    pdf.setFillColor("#1e40af");
    pdf.circle(p.x + 1, p.y + 1, 10, "F");
    
    // Círculo principal
    pdf.setFillColor("#3b82f6");
    pdf.circle(p.x, p.y, 10, "F");
    
    // Círculo interno branco
    pdf.setFillColor("#ffffff");
    pdf.circle(p.x, p.y, 7, "F");
    
    // Número
    pdf.setTextColor("#3b82f6");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(String(i + 1), p.x, p.y + 3, { align: "center" });
    
    // Nome da cidade abaixo
    pdf.setTextColor("#1f2937");
    pdf.setFontSize(9);
    pdf.text(p.city, p.x, p.y + 18, { align: "center" });
    
    // Dias na cidade (pequeno)
    pdf.setTextColor("#6b7280");
    pdf.setFontSize(7);
    pdf.text(`${p.days} dias`, p.x, p.y + 24, { align: "center" });
  });
  
  // Legenda
  const legendY = mapY + mapHeight - 12;
  pdf.setFillColor("#ffffff");
  pdf.roundedRect(MARGIN + 5, legendY - 5, 60, 12, 2, 2, "F");
  
  pdf.setDrawColor("#3b82f6");
  pdf.setLineWidth(1.5);
  pdf.setLineDashPattern([3, 2], 0);
  pdf.line(MARGIN + 10, legendY, MARGIN + 25, legendY);
  pdf.setLineDashPattern([], 0);
  
  pdf.setTextColor("#64748b");
  pdf.setFontSize(7);
  pdf.text("Rota do roteiro", MARGIN + 28, legendY + 2);
}

function countDaysInCity(itinerary: ItineraryData, city: string): number {
  return itinerary.days.filter(d => d.city === city).length;
}
```

### Arquivo: `src/services/pdfImageService.ts`

Remover ou simplificar a busca de imagem de capa, já que não será mais usada.

---

## Resumo das Mudanças

| Componente | Antes | Depois |
|------------|-------|--------|
| **Capa** | Imagem Unsplash com sobreposição problemática | Design geométrico minimalista 100% desenhado |
| **Mapa** | Tiles OSM com baixa qualidade | Mapa esquemático vetorial limpo |
| **Dependências** | `fetch-travel-images`, `osm-tile-proxy` | Nenhuma (tudo desenhado localmente) |
| **Performance** | Lento (fetch de imagens) | Rápido (geração local) |

---

## Resultado Visual Esperado

**Capa:**
- Fundo roxo escuro sólido (#1e1b4b)
- Decoração geométrica sutil no topo (círculos, linhas)
- Título grande e legível
- Badges informativos limpos
- QR code centralizado

**Mapa:**
- Fundo azul claro limpo
- Cidades representadas como círculos numerados
- Linha tracejada conectando as cidades na ordem
- Nome da cidade e quantidade de dias abaixo de cada marcador
- Legenda explicativa

Isso elimina completamente os problemas de imagens externas interferindo no layout!
