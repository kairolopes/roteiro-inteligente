
## Plano: Melhorias no Quiz - Orçamento, Datas e Ritmo

### Problema 1: Orçamento sem explicação do que está incluso

**Situação atual:**
- Descrições mostram apenas valores (ex: "R$ 400 - R$ 750/dia por pessoa")
- Usuário não sabe o que está incluído no valor

**Solução:**
Adicionar descrições mais detalhadas em cada opção de orçamento:

| Opção | Nova descrição |
|-------|----------------|
| Econômico | "Até R$ 400/dia: Hostel, transporte público, refeições simples" |
| Moderado | "R$ 400 - R$ 750/dia: Hotel 3★, transporte misto, restaurantes locais" |
| Confortável | "R$ 750 - R$ 1.500/dia: Hotel 4★, táxi/aluguel, experiências premium" |
| Luxo | "Acima de R$ 1.500/dia: Hotel 5★, transfers privados, fine dining" |
| Flexível | "Depende das oportunidades e ofertas encontradas" |

Adicionar também uma nota explicativa abaixo do título: "Inclui hospedagem, alimentação, transporte local e passeios. Não inclui passagem aérea."

---

### Problema 2: "Ainda não sei" deve ser "Personalizado" com data ida e volta

**Situação atual:**
- Opção "Ainda não sei" com descrição "Me ajude a decidir"
- Apenas uma data (startDate) é solicitada

**Solução:**
1. Renomear opção para **"Personalizado"** com descrição **"Escolho datas específicas de ida e volta"**
2. Adicionar campo `endDate` ao tipo `QuizAnswers`
3. Quando selecionado "Personalizado" (id: `custom`), mostrar dois calendários:
   - Data de ida (startDate)
   - Data de volta (endDate)

**Alterações no tipo:**
```typescript
// Adicionar ao QuizAnswers
endDate: Date | null;
```

---

### Problema 3: Calendário muda de tamanho ao trocar de mês

**Situação atual:**
- O calendário já tem largura fixa (252px no month)
- Mas pode haver variação na altura entre meses

**Solução:**
Forçar altura mínima fixa no container do calendário para evitar mudanças:
- Adicionar `min-h-[300px]` no container do calendário
- Garantir que `table` e `row` tenham alturas consistentes
- Sempre mostrar 6 semanas (42 dias) para altura constante usando `fixedWeeks` prop

---

### Problema 4: Ritmo ideal com texto truncado ("...")

**Situação atual:**
- `QuizOption` usa `line-clamp-2` que corta o texto
- Não há tooltip para mostrar texto completo

**Solução:**
1. Remover o `line-clamp-2` do componente `QuizOption`
2. Deixar o texto completo visível sempre
3. Alternativamente, usar descrições mais curtas que caibam no espaço

As descrições de ritmo são curtas o suficiente para caber:
- "Poucos lugares, mais tempo em cada um" (37 caracteres)
- "Equilíbrio entre passeios e descanso" (37 caracteres)
- "Ver o máximo possível, dias cheios" (34 caracteres)

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/types/quiz.ts` | Adicionar `endDate: Date \| null` |
| `src/components/quiz/steps/BudgetStep.tsx` | Atualizar descrições do orçamento com detalhes do que inclui |
| `src/components/quiz/steps/DatesStep.tsx` | Renomear "Ainda não sei" para "Personalizado", adicionar seletor de data de volta quando custom selecionado |
| `src/components/ui/calendar.tsx` | Adicionar `fixedWeeks` para altura constante, min-height no container |
| `src/components/quiz/QuizOption.tsx` | Remover `line-clamp-2` para mostrar texto completo |

---

### Detalhes Técnicos

**1. BudgetStep.tsx - Novas descrições:**
```typescript
const budgets = [
  { id: "economic", emoji: "💰", title: "Econômico", 
    description: "Até R$ 400/dia: Hostel, transporte público, refeições simples" },
  { id: "moderate", emoji: "💰💰", title: "Moderado", 
    description: "R$ 400 - R$ 750/dia: Hotel 3★, transporte misto, restaurantes locais" },
  { id: "comfortable", emoji: "💰💰💰", title: "Confortável", 
    description: "R$ 750 - R$ 1.500/dia: Hotel 4★, táxi/aluguel, experiências premium" },
  { id: "luxury", emoji: "💎", title: "Luxo", 
    description: "Acima de R$ 1.500/dia: Hotel 5★, transfers privados, fine dining" },
  { id: "flexible", emoji: "🤷", title: "Flexível", 
    description: "Depende das oportunidades e ofertas" },
];
```

**2. DatesStep.tsx - Personalizado com duas datas:**
```typescript
const durations = [
  // ... outras opções
  { id: "custom", emoji: "✨", title: "Personalizado", 
    description: "Escolho datas específicas de ida e volta" },
];

// Mostrar dois calendários quando duration === "custom"
{answers.duration === "custom" && (
  <>
    <DatePicker label="Data de ida" value={startDate} />
    <DatePicker label="Data de volta" value={endDate} />
  </>
)}
```

**3. Calendar.tsx - Altura fixa:**
```typescript
<DayPicker
  fixedWeeks // Sempre mostra 6 semanas
  className={cn("p-3 min-h-[320px]", className)}
  // ...
/>
```

**4. QuizOption.tsx - Texto completo:**
```typescript
// Remover line-clamp-2
<p className="text-sm text-muted-foreground mt-1">
  {description}
</p>
```
