

# Plano: corrigir paywall repetitivo nos dias bloqueados

## Diagnóstico

`LockedDayOverlay` renderiza um card completo (título + 3 benefícios + 2 botões) **sobre cada dia bloqueado**. Em roteiros longos isso vira uma parede de cards idênticos. O usuário tem razão: visualmente parece spam.

## Solução proposta (1 turno, sem migration)

**Mostrar o card cheio só no PRIMEIRO dia bloqueado. Nos demais, mostrar uma versão mínima (1 linha + ícone de cadeado) que continua funcional mas não polui.**

### Mudanças

1. **`LockedDayOverlay.tsx`**
   - Novo prop `variant: 'full' | 'compact'` (default `full`).
   - `compact`: card pequeno centralizado, só com cadeado + texto "Dia X bloqueado — clique para desbloquear" + 1 botão único que dispara `onSubscribe` (ou `onLogin` se deslogado).
   - `full`: comportamento atual.

2. **`DayTimeline.tsx`** (ou onde decide `isLocked`)
   - Receber novo prop `isFirstLocked: boolean`.
   - Passar `variant={isFirstLocked ? 'full' : 'compact'}` para `LockedDayOverlay`.

3. **`Itinerary.tsx`** (parent que mapeia dias)
   - Calcular o índice do primeiro dia bloqueado: `firstLockedIdx = days.findIndex((_, i) => i >= freeDaysCount)`.
   - Passar `isFirstLocked={idx === firstLockedIdx}` para cada `DayTimeline`.

### Resultado

- 1º dia bloqueado: card completo com pitch de venda (igual hoje).
- Dias 4, 5, 6, 7…: barra discreta com cadeado e CTA único. Limpo.

## Arquivos

- `src/components/itinerary/LockedDayOverlay.tsx`
- `src/components/itinerary/DayTimeline.tsx`
- `src/pages/Itinerary.tsx`

Sem backend, sem migration, sem secret. 1 turno.

