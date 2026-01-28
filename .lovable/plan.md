
# Remover Links Inválidos do ActivityCard

## Objetivo

Remover os links que não estão funcionando corretamente no painel esquerdo do itinerário, mantendo apenas o mapa interativo do lado direito.

## O Que Será Removido

### 1. Ícone de Navegação no Título
- O pequeno ícone de bússola (Navigation) ao lado do título da atividade
- Localizado nas linhas 166-176 do `ActivityCard.tsx`

### 2. Botão "Ver no Google Maps"
- O botão grande azul com ícone de link externo
- Localizado nas linhas 212-223 do `ActivityCard.tsx`

### 3. Botões de Afiliados (Hotéis, Voos, Tours)
- Componente `AffiliateButtons` que mostra links para reservar hotel, buscar voos, etc.
- Localizado nas linhas 225-232 do `ActivityCard.tsx`

## O Que Será Mantido

- **Mapa interativo** no lado direito (funciona corretamente)
- **Localização textual** com ícone de MapPin (apenas informativo, sem link)
- **Todas as outras informações** da atividade (título, descrição, duração, custo, dicas)

---

## Mudanças Técnicas

### Arquivo: `src/components/itinerary/ActivityCard.tsx`

**1. Remover imports não utilizados:**
```tsx
// Remover: ExternalLink, Navigation
import { 
  MapPin, Clock, Utensils, Train, Building, Camera, 
  Sparkles, Lightbulb, Coins, Star, CheckCircle2
} from "lucide-react";

// Remover: import AffiliateButtons
// Remover: import { DayContext } from "@/lib/affiliateLinks";
```

**2. Simplificar interface (remover props não usadas):**
```tsx
interface ActivityCardProps {
  activity: Activity;
  index: number;
  // Remover: dayContext?: DayContext;
  // Remover: tripDates?: {...};
}
```

**3. Remover função `getGoogleMapsUrl`:**
- Linhas 79-98 serão removidas (função não mais necessária)

**4. Remover variável `googleMapsUrl`:**
- Linha 103 será removida

**5. Remover ícone Navigation do título:**
- Linhas 166-176 serão removidas

**6. Remover toda a seção "Action Buttons":**
- Linhas 210-233 serão removidas (botão Google Maps + AffiliateButtons)

---

## Resultado Visual

**Antes:**
```
┌─────────────────────────────────────┐
│ 🏛️ Atração                    ⭐ 4.8 │
├─────────────────────────────────────┤
│ 09:00  Coliseu de Roma         🧭   │ ← Remove ícone
│        Descrição da atividade...    │
│        📍 Via del Colosseo, Roma    │
│        ⏱️ 2h  💰 R$ 50              │
│        💡 Dica: Chegue cedo...      │
│                                     │
│  [🔗 Ver no Google Maps]            │ ← Remove botão
│  [🏨 Reservar Hotel]                │ ← Remove botões
│  [✈️ Buscar Voos]                   │ ← Remove botões
└─────────────────────────────────────┘
```

**Depois:**
```
┌─────────────────────────────────────┐
│ 🏛️ Atração                    ⭐ 4.8 │
├─────────────────────────────────────┤
│ 09:00  Coliseu de Roma              │
│        Descrição da atividade...    │
│        📍 Via del Colosseo, Roma    │
│        ⏱️ 2h  💰 R$ 50              │
│        💡 Dica: Chegue cedo...      │
└─────────────────────────────────────┘
```

---

## Arquivos Afetados

| Arquivo | Mudança |
|---------|---------|
| `src/components/itinerary/ActivityCard.tsx` | Remover links e simplificar componente |

## Impacto

- Cards de atividades ficam mais limpos e focados
- Usuários usam o mapa interativo do lado direito para navegação
- Menos confusão com links que não funcionam
- Menos código para manter
