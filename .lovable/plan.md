

## Plano: Roteiros Completos com Pedidos Especiais e Dados Reais

### Problema Identificado

Após análise detalhada do fluxo Quiz → Chat → Itinerary, identifiquei **3 problemas principais**:

1. **Pedidos especiais não são priorizados corretamente** - Os campos `customRequests` (ex: "quero comer queijos") e `destinationDetails` (ex: "Toscana") existem no prompt, mas não têm a ênfase necessária para que a IA os respeite rigorosamente.

2. **Roteiro muito curto** - A IA está gerando roteiros com poucas atividades por dia (2-3 ao invés de 5-6), resultando em um PDF pequeno ao invés de 3+ páginas.

3. **Links reais não estão sendo exibidos** - O Google Places já está funcionando, mas o `googleMapsUrl` retornado não está sendo exibido no frontend.

---

### Arquivos a Modificar

#### 1. **`supabase/functions/generate-itinerary/index.ts`**
Melhorias no prompt da IA para:
- Dar **PRIORIDADE ABSOLUTA** aos pedidos especiais (`customRequests`)
- Exigir **mínimo de 5-6 atividades por dia** para roteiros completos
- Incluir atividades específicas mencionadas pelo usuário (ex: "degustação de queijos")
- Garantir que regiões específicas como "Toscana" sejam respeitadas
- Exigir que cada atividade tenha dicas detalhadas

#### 2. **`src/components/itinerary/ActivityCard.tsx`**
Adicionar exibição do link do Google Maps validado:
- Mostrar botão "Ver no Google Maps" quando `googleMapsUrl` estiver presente
- Mostrar badge de "Lugar Verificado" quando `validated: true`
- Exibir rating real do Google quando disponível

#### 3. **`netlify/functions/generate-itinerary.ts`**
Sincronizar as mesmas melhorias de prompt da versão Supabase.

---

### Detalhes Técnicos

#### Prompt Melhorado para Pedidos Especiais

```text
🔴🔴🔴 PEDIDOS ESPECIAIS - PRIORIDADE ABSOLUTA 🔴🔴🔴
O usuário escreveu estes desejos específicos que DEVEM aparecer no roteiro:
"${quizAnswers.customRequests}"

VOCÊ DEVE:
1. Incluir atividades que atendam EXATAMENTE a estes pedidos
2. Se o usuário quer "comer queijos", inclua restaurantes/fazendas de queijos
3. Se o usuário quer "vinhos na Toscana", inclua vinícolas na Toscana
4. NÃO ignore estes pedidos - eles são a razão principal do roteiro
```

#### Prompt Melhorado para Região Específica

```text
🟠 REGIÃO/CIDADES ESPECÍFICAS - ALTA PRIORIDADE 🟠
O usuário quer focar nesta região específica: "${quizAnswers.destinationDetails}"

VOCÊ DEVE:
1. Concentrar o roteiro NESTA região
2. Se for "Toscana", use cidades como Florença, Siena, Pisa, San Gimignano
3. NÃO substitua por outras regiões do país
```

#### Prompt Melhorado para Quantidade de Atividades

```text
📋 ESTRUTURA OBRIGATÓRIA DO ROTEIRO:
- Cada dia DEVE ter no MÍNIMO 5 atividades
- Estrutura: Café da manhã → Manhã (1-2 atrações) → Almoço → Tarde (1-2 atrações) → Jantar
- Cada atividade deve ter descrição de 2-3 frases
- Cada atividade deve ter uma dica prática útil
- Inclua coordenadas precisas para CADA atividade
```

#### Exibição de Links Reais no ActivityCard

```tsx
// Novo botão quando lugar foi validado pelo Google Places
{activity.googleMapsUrl && (
  <a 
    href={activity.googleMapsUrl} 
    target="_blank"
    className="flex items-center gap-1 text-xs text-blue-600"
  >
    <MapPin className="w-3 h-3" />
    Ver no Google Maps
  </a>
)}

// Badge de verificação
{activity.validated && (
  <span className="badge bg-green-100 text-green-700 text-xs">
    ✓ Verificado
  </span>
)}
```

---

### Fluxo de Dados Atualizado

```text
┌────────────────┐     ┌─────────────────┐     ┌───────────────────┐
│  Quiz          │     │  generate-      │     │  Google Places    │
│  customRequests│────▶│  itinerary      │────▶│  (valida lugares) │
│  destinationDetails  │  (prompt forte) │     │                   │
└────────────────┘     └─────────────────┘     └───────────────────┘
                              │                         │
                              ▼                         ▼
                       ┌─────────────────────────────────────┐
                       │  Itinerary com:                     │
                       │  - 5-6 atividades/dia               │
                       │  - Pedidos especiais incluídos      │
                       │  - Links reais do Google Maps       │
                       │  - Ratings verificados              │
                       └─────────────────────────────────────┘
```

---

### Validação do Resultado

Após implementação, um roteiro para Itália/Toscana com "quero comer queijos" deve:

| Antes | Depois |
|-------|--------|
| 2-3 atividades por dia | 5-6 atividades por dia |
| Sem menção a queijos | Degustação de queijos na Toscana |
| Região genérica (Roma) | Foco na Toscana |
| Links genéricos | Links do Google Maps verificados |
| Rating estimado | Rating real (4.7 de 1.234 avaliações) |
| PDF de 1 página | PDF de 3+ páginas |

---

### Impacto Esperado

1. **Roteiros 3x mais detalhados** - Mínimo 5 atividades por dia
2. **100% de respeito aos pedidos especiais** - Prompt enfatiza prioridade absoluta
3. **Links funcionais do Google Maps** - Navegação direta para cada lugar
4. **Badges de verificação** - Usuário sabe quais lugares foram validados
5. **PDF de 3+ páginas** - Conteúdo rico para impressão

---

### Riscos e Mitigação

| Risco | Mitigação |
|-------|-----------|
| IA ignorar pedidos mesmo com ênfase | Adicionar validação pós-geração para verificar presença de keywords |
| Muitas atividades = mais chamadas Google | Limitar validação a 5 atividades/dia (já implementado) |
| Tempo de geração aumentado | Mostrar progresso detalhado no UI (já existe) |

