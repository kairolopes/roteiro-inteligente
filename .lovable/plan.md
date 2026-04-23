

# Plano final: Time de agentes + canal BR de fechamento

Junta as duas conversas numa coisa só. Sem inventar feature impossível, sem abandonar a ideia dos agentes.

## O que fica do plano de agentes (viável)

4 agentes, não 5. Tirei a Clara (vídeo) porque ffmpeg não roda em edge function do Supabase.

| Agente | Função | Onde aparece | Tecnologia |
|---|---|---|---|
| **Sofia** | Orquestradora — decide quem chamar | Chat de ajuste do roteiro | Gemini 2.5 Flash + tool calling |
| **Pietra** | Curadora cultural — eventos reais nas datas (festival, exposição, show local) | Aba "Acontecendo na cidade" em cada dia | Gemini + Google Places (você já tem a key) |
| **Lia** | Local — reescreve descrições no tom de quem mora lá ("vai cedo, fila vira monstro 11h") | Substitui descrições genéricas das atividades | Gemini, prompt especializado |
| **Bruno** | Logística — calcula deslocamento real, reorganiza dia se houver gargalo | Botão "Bruno otimizar" no topo do dia | Gemini + Google Distance Matrix |

Cada agente tem avatar, cor e voz própria no chat de ajuste. Não é "uma IA" — é um time visível que a agência mostra pro cliente.

## O que fica do pivot BR (canal de fechamento)

Os agentes **não vendem** hotel/voo gringo no roteiro entregue ao cliente da agência. Em vez disso:

- Botão **"Falar com meu consultor"** em cada dia/atividade — abre WhatsApp da agência (`agency_settings.whatsapp_number`) com mensagem pré-pronta contextual:
  > "Oi! Vi o roteiro de Paris - Dia 3 (Louvre + jantar no Marais). Quero cotação de hotel e ingressos pra essas datas."
- Selo **"Cotação personalizada com [nome agência]"** no lugar de cards de afiliado gringo
- Cada clique grava em `quote_requests` → vira lead quente no admin
- Afiliados internacionais ficam **só** na landing pública `/`, `/passagens`, `/voos` — onde pegam visitante anônimo (renda pra você, dono da plataforma, não compete com agência)

## Painel "Bloomberg" no admin (do plano original)

Feed em tempo real (Supabase Realtime, você já tem):
- "João da Silva gerou roteiro Paris 7d — orçamento R$15k — clicou cotação Hotel"
- "Pietra encontrou festival em Lisboa nas datas do cliente Maria"
- "Bruno otimizou roteiro de Carlos: economia de 2h/dia"

Agência clica no item → abre conversa WhatsApp pré-escrita com link do roteiro.

## Ordem de execução (3 turnos, não 5)

**Turno 1 — Backend dos agentes**
- Tabela `agent_messages(itinerary_id, agent_name, role, content, created_at)`
- Tabela `quote_requests(id, user_id, agency_id, itinerary_id, day_number, type, message_sent, status, closed_value, created_at)` + RLS
- Edge function `agents/orchestrator` (Sofia decide qual chamar via tool calling)
- Edge functions `agents/pietra`, `agents/lia`, `agents/bruno` — cada uma com prompt especializado
- Reuso do `LOVABLE_API_KEY` e `GOOGLE_PLACES_API_KEY` que já existem

**Turno 2 — UI dos agentes no roteiro**
- Refatorar `ItineraryAdjustChat.tsx` pra mostrar mensagens com avatar/cor por agente
- Aba "Acontecendo aqui" no `DayTimeline` → chama Pietra
- Botão "Reorganizar dia" → chama Bruno
- Trocar `AffiliateButtons.tsx`: se `agencySettings.whatsapp_number` existe → botão "Falar com consultor" com mensagem contextual; senão → fallback afiliado
- Manter afiliado intacto em `Passagens.tsx`, `FlightDetails.tsx`, `landing/*`

**Turno 3 — Painel Bloomberg + métricas**
- Aba "Cotações" no admin com fila realtime de `quote_requests`
- Botão "marcar como fechado" com input de valor
- Card no `DashboardTab`: "Vendas fechadas via app: R$ X esse mês"
- Notificação no admin quando Pietra encontra evento relevante

## Detalhes técnicos

- Sofia chama agentes via `tools` do Gemini, não em paralelo (economiza token)
- Pietra usa Google Places `text_search` com query "events [cidade] [data]" + Gemini pra filtrar
- Bruno usa Distance Matrix pra calcular tempo real entre atividades; reordena se gap > 90min
- `agent_messages` persiste pra mostrar "replay" da decisão dos agentes no admin (argumento de venda: "vejam como a IA pensou no roteiro do seu cliente")
- WhatsApp link via `wa.me` no client (zero custo Z-API); Z-API fica só pro envio ativo do admin
- Sem connector novo, sem secret novo

## Pitch novo pra agência vender

Antes: *"app que faz roteiro com IA"*
Depois: *"4 agentes IA especializados criam o roteiro, sua agência fecha a venda no WhatsApp — você nunca mais perde lead frio"*

Cobra 3x mais, diferencia de qualquer concorrente nacional.

## Aprovação

1 aprovação só. Eu toco os 3 turnos em sequência. Se em qualquer ponto algo travar, eu paro e te aviso em 1 frase qual é o bloqueio — não invento solução mágica.

