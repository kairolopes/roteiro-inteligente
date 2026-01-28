

# Experiência Freemium: "Experimente Antes de Assinar"

## Conceito

Em vez de bloquear o usuário imediatamente, vamos deixá-lo **experimentar o valor do produto** antes de pedir login:

1. **Chat livre** - Usuários podem conversar com a Sofia sem login (limite de 3-5 mensagens)
2. **Roteiro parcial** - Geramos o roteiro COMPLETO, mas mostramos apenas **2 dias completos**
3. **Dias esfumaçados** - Os demais dias aparecem com **blur + overlay** pedindo login/assinatura
4. **Gatilho de conversão** - Quando tenta clicar em dia bloqueado, abre o modal de login

## Mudanças Necessárias

### 1. Permitir Chat Sem Login (Chat.tsx)

Atualmente o chat exige login após a mensagem inicial. Vamos permitir **3-5 mensagens gratuitas** antes de exigir login:

**Comportamento atual:**
- Mensagem inicial (automática): ✅ funciona sem login
- Segunda mensagem do usuário: ❌ pede login

**Novo comportamento:**
- Mensagens 1-3: ✅ funcionam sem login  
- Mensagem 4+: 💳 pede login/assinatura
- Mostrar contador: "2 de 3 mensagens gratuitas"

### 2. Permitir Geração de Roteiro Sem Login (Itinerary.tsx)

Atualmente exige login para gerar. Vamos gerar para todos, mas com restrição visual:

**Novo fluxo:**
1. Usuário completa quiz e chat → vai para /itinerary
2. Sistema gera roteiro COMPLETO (todos os dias)
3. Frontend mostra:
   - **Dias 1-2**: Totalmente visíveis e interativos
   - **Dias 3+**: Com efeito blur + overlay de CTA

### 3. Novo Componente: LockedDayOverlay

Criar um overlay atrativo para os dias bloqueados:

```
┌─────────────────────────────────────┐
│  Dia 3 - Roma (blur effect)         │
│                                     │
│     🔒 Desbloqueie seu roteiro     │
│         completo!                   │
│                                     │
│  ✓ Acesso a todos os 7 dias        │
│  ✓ Coordenadas e mapas precisos    │
│  ✓ Exportar para PDF               │
│                                     │
│  [🔓 Fazer Login Grátis]           │
│                                     │
│  ou                                 │
│                                     │
│  [⭐ Assinar Premium]              │
│                                     │
└─────────────────────────────────────┘
```

### 4. Modificar DayTimeline para Suportar Blur

Adicionar prop `isLocked` que aplica:
- `filter: blur(8px)` no conteúdo
- `pointer-events: none` para impedir cliques
- Overlay absoluto com CTA

### 5. Modificar DaySelector para Indicar Dias Bloqueados

Os botões de dias bloqueados mostram um 🔒 e ao clicar, abrem o modal de login em vez de expandir.

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Chat.tsx` | Permitir 3 mensagens sem login, mostrar contador |
| `src/pages/Itinerary.tsx` | Gerar roteiro para não logados, controlar quais dias estão bloqueados |
| `src/components/itinerary/DayTimeline.tsx` | Adicionar prop `isLocked` com blur e overlay |
| `src/components/itinerary/DaySelector.tsx` | Mostrar 🔒 em dias bloqueados |
| `src/hooks/useUserCredits.ts` | Adicionar lógica para usuários não logados |

---

## Lógica de Dias Liberados

```typescript
const getFreeDaysCount = (user, credits) => {
  // Não logado: 2 dias grátis
  if (!user) return 2;
  
  // Logado sem assinatura: 3 dias grátis
  if (!hasActiveSubscription(credits)) return 3;
  
  // Assinante: todos os dias
  return Infinity;
};
```

---

## Novo Componente: LockedDayOverlay

```tsx
interface LockedDayOverlayProps {
  dayNumber: number;
  totalDays: number;
  onLogin: () => void;
  onSubscribe: () => void;
}

const LockedDayOverlay = ({ dayNumber, totalDays, onLogin, onSubscribe }) => (
  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
    <div className="text-center p-6 max-w-sm">
      <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
      <h3 className="text-xl font-bold mb-2">
        Desbloqueie {totalDays - dayNumber + 1} dias restantes
      </h3>
      <p className="text-muted-foreground mb-4">
        Faça login ou assine para ver o roteiro completo
      </p>
      <div className="space-y-2">
        <Button onClick={onLogin} className="w-full">
          Fazer Login Grátis
        </Button>
        <Button onClick={onSubscribe} variant="outline" className="w-full">
          Ver Planos Premium
        </Button>
      </div>
    </div>
  </div>
);
```

---

## Fluxo Completo do Usuário

```
Quiz → Chat (3 msgs grátis) → Criar Roteiro
                                    ↓
                    ┌───────────────────────────┐
                    │  Roteiro: 7 dias na Itália │
                    ├───────────────────────────┤
                    │  ✅ Dia 1 - Roma (visível) │
                    │  ✅ Dia 2 - Roma (visível) │
                    │  🔒 Dia 3 - Florença (blur)│
                    │  🔒 Dia 4 - Florença (blur)│
                    │  🔒 Dia 5 - Veneza (blur)  │
                    │  🔒 Dia 6 - Veneza (blur)  │
                    │  🔒 Dia 7 - Veneza (blur)  │
                    └───────────────────────────┘
                              ↓
                    Clica em dia bloqueado
                              ↓
                    Modal: "Faça login ou assine"
                              ↓
                    Login/Signup ou Compra
                              ↓
                    🎉 Roteiro completo liberado!
```

---

## Benefícios dessa Abordagem

1. **Experiência completa antes do paywall** - Usuário vê o valor real do produto
2. **Menor fricção inicial** - Não precisa criar conta para testar
3. **Gatilho de FOMO** - "Você já tem 2 dias prontos, quer ver os outros 5?"
4. **Dados coletados antes** - Quiz e chat salvos, facilitam re-engajamento
5. **Conversão maior** - Usuário já investiu tempo, mais propenso a converter

---

## Resumo Técnico

| Item | Antes | Depois |
|------|-------|--------|
| Chat sem login | Apenas msg inicial | 3 mensagens |
| Gerar roteiro | Bloqueado | Gera para todos |
| Visualização | Tudo ou nada | 2 dias grátis + blur |
| Ação de bloqueio | Modal genérico | Overlay contextual |
| Conversão | Antes de ver valor | Depois de experimentar |

