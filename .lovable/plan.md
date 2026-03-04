

# Melhorar Mensagens de Transição Entre Páginas

## Problema
Quando o usuário navega para `/chat` ou `/itinerary` sem ter completado os passos anteriores (quiz, chat), vê erros genéricos ("Ops! Algo deu errado") em vez de mensagens orientadoras.

## Mudanças

### 1. `src/pages/Chat.tsx` — Sem quiz answers
Quando `sessionStorage` não tem `quizAnswers`, em vez de mostrar chat vazio, exibir uma tela amigável:
- Ícone de quiz/checklist
- Mensagem: "Você ainda não completou o quiz de preferências"
- Descrição: "Para a Sofia te ajudar, primeiro responda algumas perguntas rápidas sobre sua viagem."
- Botão: "Fazer o Quiz" → navega para `/quiz`

### 2. `src/pages/Itinerary.tsx` — Sem quiz answers
Linha 79-82: em vez de `setError("Nenhuma preferência encontrada...")`, mostrar tela dedicada com:
- Ícone informativo (não de erro)
- Mensagem: "Complete os passos anteriores para gerar seu roteiro"
- Dois botões: "Fazer o Quiz" e "Conversar com Sofia"
- Sem ícone de erro vermelho — usar ícone azul/primário informativo

### 3. `src/pages/Itinerary.tsx` — Sem chat summary (opcional)
Quando tem quiz mas não tem conversa, gerar normalmente (já funciona assim). Sem mudança.

### 4. Melhorar o error state geral do Itinerary
Linha 307-332: Diferenciar entre erro de API (manter como está) e falta de dados (mostrar mensagem orientadora com tom amigável em vez de destrutivo).

## Resultado
O usuário nunca verá "Ops! Algo deu errado" por navegar fora de ordem — verá instruções claras de qual passo completar.

