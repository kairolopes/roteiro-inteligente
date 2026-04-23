## Plano para eu tocar a finalização do app sem te cansar com contexto repetido

Vou mudar a forma de trabalhar neste projeto: em vez de esperar pedidos soltos e ir reagindo, eu assumo uma reta final estruturada para fechar o produto em blocos.

### Objetivo
Reduzir ao mínimo sua necessidade de pensar em detalhes, corrigir direção no meio do caminho ou reexplicar contexto.

### O que vou fazer

1. **Criar uma base única de contexto do projeto**
   - Consolidar as regras do produto, fluxos principais, limitações e decisões já tomadas.
   - Registrar o que já existe e o que ainda está incompleto para eu não “me perder” entre quiz, chat, roteiro, pagamento e admin.
   - Usar isso como referência fixa nas próximas entregas.

2. **Fazer uma auditoria completa do produto**
   Vou revisar os fluxos principais de ponta a ponta:
   - Landing page e entrada no funil
   - Quiz
   - Chat com a Sofia
   - Geração de roteiro
   - Bloqueios freemium/paywall
   - Login/perfil
   - Painel admin
   - Pagamentos e integrações principais

3. **Montar um backlog enxuto de finalização**
   Vou transformar a auditoria em uma lista objetiva com 3 grupos:
   - **Crítico para funcionar**
   - **Importante para vender bem**
   - **Melhoria opcional**

   Cada item terá:
   - problema
   - impacto
   - correção proposta
   - prioridade

4. **Executar em lotes fechados, não em ajustes soltos**
   Em vez de mudanças pequenas uma por vez, vou trabalhar por blocos:
   - **Lote 1: estabilidade e bugs visíveis**
   - **Lote 2: UX e conversão**
   - **Lote 3: acabamento e consistência final**

5. **Reduzir dependência de memória frágil do chat**
   Vou priorizar correções que deixam o sistema mais previsível:
   - menos duplicação de lógica entre front e backend
   - menos dependência de estado temporário espalhado
   - regras mais centralizadas para quiz/chat/roteiro
   - pontos críticos documentados dentro do projeto

6. **Te mostrar progresso do jeito mais simples possível**
   Em cada etapa, você recebe só:
   - o que foi fechado
   - o que ainda falta
   - o que precisa da sua decisão, se realmente precisar

### Primeira entrega que eu faria após sua aprovação

#### Fase 1 — Diagnóstico e plano de fechamento
Vou te devolver uma auditoria objetiva com:
- top problemas atuais do app
- inconsistências de fluxo
- itens que fazem parecer “inacabado”
- ordem ideal de implementação para terminar rápido

#### Fase 2 — Execução do pacote mais importante
Começo pelos pontos de maior impacto no seu app atual, com foco em:
- fluxo quiz → chat → roteiro
- estabilidade das chamadas de IA
- consistência dos estados salvos
- redução de bugs de navegação e recuperação de sessão

#### Fase 3 — Fechamento comercial
Depois disso, entro no que mais ajuda a vender e operar:
- landing/vendas
- paywall e pricing
- painel admin
- integrações essenciais

## Sinais que já identifiquei e que entram nessa auditoria
- Há lógica importante espalhada entre páginas e funções, o que aumenta perda de contexto e manutenção.
- O fluxo principal depende bastante de `sessionStorage`, o que pode deixar a experiência frágil.
- Existem duplicações e diferenças entre implementações de chat/itinerário em mais de um lugar.
- Há pontos de configuração sensíveis hoje embutidos no código e que merecem centralização.

## Resultado esperado
Ao final, você deixa de precisar “inventar o próximo passo”.
Eu passo a conduzir a finalização com base numa lista clara, priorizada e contínua.

## Detalhes técnicos
- Revisar e consolidar os fluxos em `Quiz`, `Chat`, `Itinerary`, `Admin` e helpers de roteamento.
- Mapear dependências entre armazenamento em sessão, auth, créditos e geração de roteiro.
- Eliminar duplicações críticas entre funções e chamadas do frontend.
- Criar documentação curta de produto/arquitetura dentro do projeto para manter consistência nas próximas entregas.
- Implementar correções em batches, com validação por fluxo e não por arquivo isolado.