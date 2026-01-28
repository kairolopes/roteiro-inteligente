

# Correção: Texto Estourando Margens no PDF

## Problemas Identificados

Analisando o PDF gerado, encontrei **5 problemas** de estouro:

| Local | Problema | Exemplo no PDF |
|-------|----------|----------------|
| Localização | Emoji + texto muito longo | `Ø=ÜÍ Hotel de Russie, Via del Babuino, 9...` |
| Dicas | Emoji + texto muito longo | `Ø=Ü¡ Para um toque extra de luxo...` |
| Descrição | Linhas continuam além da margem | Descrição cortando QR Code |
| Badge orçamento | Texto não truncado | `R$5.000 - R$8.000 (estimado por pessoa...)` |
| Título atividade | Títulos longos sem truncamento adequado | Varia |

---

## Soluções Propostas

### 1. Substituir Emojis por Texto (Linha 514, 534)

```tsx
// Antes:
drawTextEllipsis(pdf, `📍 ${activity.location}`, contentX, cardY + 25, contentWidth);
drawTextEllipsis(pdf, `💡 ${activity.tips}`, contentX + 2, tipY + 4.5, contentWidth - 35);

// Depois:
drawTextEllipsis(pdf, `Local: ${activity.location}`, contentX, cardY + 25, contentWidth);
drawTextEllipsis(pdf, `Dica: ${activity.tips}`, contentX + 2, tipY + 4.5, contentWidth - 35);
```

### 2. Criar Função de Truncamento Mais Robusta

O `drawTextEllipsis` atual não adiciona "..." quando corta. Vou melhorar:

```tsx
function drawTextEllipsis(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number
) {
  if (!text) return;
  
  // Normalize text: remove emojis and special unicode
  const cleanText = text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Convert accented chars to ASCII
      const map: Record<string, string> = {
        'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
        'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
        'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
        'ç': 'c', 'ñ': 'n',
        'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'Ä': 'A',
        'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
        'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
        'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O', 'Ö': 'O',
        'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
        'Ç': 'C', 'Ñ': 'N',
        '★': '*', '•': '-'
      };
      return map[char] || char;
    })
    .trim();
  
  if (!cleanText) return;
  
  // Check if text fits
  const textWidth = pdf.getTextWidth(cleanText);
  if (textWidth <= maxWidth) {
    pdf.text(cleanText, x, y);
    return;
  }
  
  // Truncate with ellipsis
  let truncated = cleanText;
  while (pdf.getTextWidth(truncated + '...') > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  pdf.text(truncated + '...', x, y);
}
```

### 3. Ajustar Largura de Conteúdo para Atividades

O problema é que `contentWidth = CONTENT_WIDTH - 70` não considera o QR code adequadamente:

```tsx
// Linha 477 - Ajustar para considerar QR code
const qrSize = 18;
const qrMargin = 8; // espaço entre conteúdo e QR
const contentWidth = CONTENT_WIDTH - 35 - qrSize - qrMargin; // ~60mm menos que antes
```

### 4. Truncar Texto dos Badges (Capa)

```tsx
// Linhas 235-240 - Usar drawTextEllipsis para badges
const badgeTextMaxWidth = badgeWidth - 10;
const badgeText = badge as string;
const truncatedBadge = pdf.splitTextToSize(badgeText, badgeTextMaxWidth)[0] || badgeText;
pdf.text(truncatedBadge, MARGIN + i * (badgeWidth + 5) + (badgeWidth - 5) / 2, badgeY + 6.5, { align: "center" });
```

### 5. Limitar Descrição a 2 Linhas Truncadas

```tsx
// Linhas 518-524 - Garantir truncamento nas linhas de descrição
if (activity.description) {
  pdf.setTextColor(COLORS.text);
  pdf.setFontSize(8);
  const descLines = pdf.splitTextToSize(activity.description, contentWidth);
  descLines.slice(0, 2).forEach((line: string, i: number) => {
    // Truncar cada linha individualmente
    const truncatedLine = line.length > 80 ? line.substring(0, 77) + '...' : line;
    pdf.text(truncatedLine, contentX, cardY + 32 + i * 4);
  });
}
```

---

## Resumo das Mudanças

| Arquivo | Linha(s) | Mudança |
|---------|----------|---------|
| `src/hooks/usePDFExport.ts` | 124-133 | Melhorar função `drawTextEllipsis` com normalização de texto e truncamento com "..." |
| `src/hooks/usePDFExport.ts` | 477 | Ajustar `contentWidth` para considerar QR code |
| `src/hooks/usePDFExport.ts` | 514 | Trocar `📍` por `Local:` |
| `src/hooks/usePDFExport.ts` | 534 | Trocar `💡` por `Dica:` |
| `src/hooks/usePDFExport.ts` | 235-240 | Truncar texto dos badges na capa |
| `src/hooks/usePDFExport.ts` | 518-524 | Garantir truncamento das linhas de descrição |

---

## Resultado Esperado

**Antes:**
```
Ø=ÜÍ Hotel de Russie, Via del Babuino, 9, 00187 Roma RM Chegue ao Aeroporto Fiumicino...
```

**Depois:**
```
Local: Hotel de Russie, Via del Babuino, 9, 00187...
```

**Antes (badges):**
```
┌─────────────────────────────────────┐
│ R$5.000 - R$8.000 (estimado por pessoa, excluindo passagens aéreas) │ ← ESTOURA
└─────────────────────────────────────┘
```

**Depois (badges):**
```
┌─────────────────────────────────────┐
│ R$5.000 - R$8.000 (esti...          │ ← TRUNCADO
└─────────────────────────────────────┘
```

