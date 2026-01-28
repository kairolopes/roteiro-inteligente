
# Correção: Admin Vê Paywall na Página de Itinerário

## Diagnóstico

O problema ocorre porque:

1. O hook `useUserCredits` faz uma query assíncrona ao banco para verificar se o usuário é admin
2. Durante esse carregamento, `isAdmin` é `false` por padrão
3. A página `Itinerary.tsx` calcula `freeDaysCount` baseado em `isAdmin`, mas como ainda está `false` no momento da renderização inicial, os dias aparecem bloqueados
4. Quando o usuário clica em um dia "bloqueado", o paywall é exibido antes de o estado de admin carregar

## Solução

Aguardar o carregamento completo do hook antes de determinar se dias estão bloqueados.

---

## Mudanças Técnicas

### Arquivo: `src/pages/Itinerary.tsx`

**1. Importar `isLoading` do hook (linha 35):**
```tsx
const { 
  canGenerateItinerary, 
  consumeItineraryCredit, 
  refetch: refetchCredits, 
  hasActiveSubscription, 
  isAdmin,
  isLoading: creditsLoading  // ← Adicionar
} = useUserCredits();
```

**2. Atualizar cálculo de `freeDaysCount` (linhas 49-56):**
```tsx
const freeDaysCount = useMemo(() => {
  // Still loading credits - show all days temporarily (prevents flash of locked)
  if (creditsLoading) return Infinity;
  
  // Admin or subscriber: unlimited
  if (isAdmin || hasActiveSubscription) return Infinity;
  // Logged in without subscription: 3 days
  if (user) return FREE_DAYS_LOGGED_IN;
  // Guest: 2 days
  return FREE_DAYS_GUEST;
}, [user, hasActiveSubscription, isAdmin, creditsLoading]);
```

**3. Prevenir paywall durante loading (linhas 63-67):**
```tsx
// Only check credits for logged-in users - but skip if still loading
if (user && !skipCreditCheck && !creditsLoading && !canGenerateItinerary) {
  setShowPaywall(true);
  setIsLoading(false);
  return;
}
```

**4. Prevenir paywall no regenerar (linhas 225-228):**
```tsx
const handleRegenerate = () => {
  if (!creditsLoading && !canGenerateItinerary) {
    setShowPaywall(true);
    return;
  }
  // ...rest
};
```

---

## Fluxo Corrigido

```text
Antes (problema):
┌─────────────────────────────────────────────────────────┐
│ 1. Admin abre /itinerary                                │
│ 2. isAdmin = false (ainda carregando)                   │
│ 3. freeDaysCount = 3 (como usuário logado comum)       │
│ 4. Dias 4+ aparecem bloqueados                         │
│ 5. Admin clica no dia 4 → Paywall exibido!             │
│ 6. isAdmin = true (carregou tarde demais)              │
└─────────────────────────────────────────────────────────┘

Depois (corrigido):
┌─────────────────────────────────────────────────────────┐
│ 1. Admin abre /itinerary                                │
│ 2. creditsLoading = true                                │
│ 3. freeDaysCount = Infinity (mostra tudo durante load) │
│ 4. Todos os dias visíveis                               │
│ 5. isAdmin = true (carrega)                             │
│ 6. freeDaysCount recalcula = Infinity (admin confirmado)│
│ 7. Nenhum paywall exibido                               │
└─────────────────────────────────────────────────────────┘
```

---

## Arquivos Afetados

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Itinerary.tsx` | Importar `isLoading`, aguardar carregamento antes de bloquear dias ou exibir paywall |

## Impacto

- Admin nunca verá paywall ou dias bloqueados
- Durante o breve carregamento, todos os dias ficam visíveis (experiência melhor que mostrar bloqueado e depois desbloquear)
- Usuários normais continuam com comportamento correto após loading
