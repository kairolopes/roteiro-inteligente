

## Reformular o quiz de destinos com preenchimento inteligente e versátil

O usuário não está encontrando o campo de cidade. O problema atual: o `CityAutocomplete` foi adicionado dentro do `DestinationsStep`, mas só aparece **depois** de selecionar um país, escondido como "detalhes". Vou inverter a lógica: a cidade vira o campo principal e único, podendo ser preenchida livremente desde o início.

### Nova UX do passo "Destinos"

Um campo único, grande e visível no topo onde a pessoa pode digitar **qualquer coisa**:
- Uma cidade ("Paris")
- Um país ("Japão")
- Uma região ("Toscana")
- Múltiplos lugares ("Roma, Florença, Veneza")
- Ou até descrição livre ("praias do nordeste brasileiro")

O autocomplete sugere conforme digita (cidades + países + regiões), mas **nunca obriga** a escolher da lista — o que for digitado vale.

```text
┌─────────────────────────────────────────────┐
│  Para onde você quer ir? ✈️                 │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ 🔍 Digite cidade, país ou região...    │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  [chips das seleções com X para remover]    │
│                                              │
│  ✨ Populares: Paris  Tóquio  Roma  NY      │
│                                              │
│  💭 Ainda na dúvida? Conte como imagina    │
│  ┌────────────────────────────────────────┐ │
│  │ Ex: lugar tranquilo com praia e cult.. │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Mudanças técnicas

1. **`src/components/quiz/CityAutocomplete.tsx`** — generalizar:
   - Renomear conceitualmente para "DestinationAutocomplete" (mantém arquivo, só ajusta comportamento)
   - Aceitar **texto livre** sem precisar bater com a lista (já tem parcialmente, reforçar)
   - Indexar busca também por país inteiro (digitar "Japão" sugere Tóquio, Kyoto, Osaka)
   - Adicionar entradas só de país para quem quer um país inteiro sem cidade específica
   - Mostrar 6-8 sugestões "Populares" como chips clicáveis abaixo do input quando vazio
   - Visual mais destacado: input maior (h-14), ícone de busca, placeholder claro

2. **`src/components/quiz/steps/DestinationsStep.tsx`** — simplificar drasticamente:
   - **Remover** a grade de bandeiras de países como passo obrigatório
   - **Remover** o campo separado "destinationDetails"
   - Colocar o `CityAutocomplete` como elemento principal, no topo, grande
   - Manter apenas **um campo opcional** abaixo: "Conte como você imagina a viagem" (textarea curto) — alimenta `customRequests`
   - Sincronizar tanto `answers.destinations` (array) quanto `answers.destination` (string concatenada) para retrocompatibilidade com a IA

3. **`src/pages/Quiz.tsx`** — ajustar validação:
   - `canProceed()` para o passo 4 valida apenas que existe pelo menos uma entrada em `destinations` OU texto livre preenchido
   - Sem necessidade de selecionar país antes

4. **`src/types/quiz.ts`** — manter compatível:
   - `destinations: string[]` continua sendo a fonte de verdade
   - Pode conter cidades, países ou regiões misturadas

### Resultado para o usuário

- O campo de cidade fica **imediatamente visível** ao chegar no passo de destinos
- Funciona para qualquer nível: cidade, país, região ou descrição
- Aceita texto livre — não trava se não estiver na lista
- Busca inteligente: "japão" sugere Tóquio/Kyoto/Osaka; "praia" não bloqueia, deixa adicionar
- Menos cliques, fluxo mais natural

