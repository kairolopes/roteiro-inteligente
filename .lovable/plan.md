

# Plano de fechamento: o que falta pra virar produto vendável

## 1. Ativar Lia e Bruno no UI (não só no chat)

**`DayTimeline.tsx`** ganha 2 botões discretos no header do dia:
- **"Reorganizar dia (Bruno)"** — chama `agent-bruno` com as atividades do dia, recebe nova ordem + minutos economizados, atualiza o roteiro via `onItineraryUpdated`. Toast: "Bruno reorganizou: economia de Xmin".
- **"Tom local (Lia)"** — chama `agent-lia` com as descrições, substitui in-place. Toast: "Lia reescreveu N descrições".

Sem botão = agente morto. Hoje Lia está morta.

## 2. Persistir decisões dos agentes (replay no admin)

Toda chamada de Sofia/Pietra/Lia/Bruno grava em `agent_messages` (tabela já existe, está vazia):
- `itinerary_id`, `agent_name`, `role` ('user'|'assistant'|'tool'), `content`, `created_at`

Modificar as 4 edge functions pra fazer o insert no fim. Adicionar parâmetro opcional `itineraryId` no body de cada uma.

**No admin**, dentro da aba "Cotações", quando clica num lead com `itinerary_id`, abre painel lateral mostrando: timeline das mensagens dos agentes daquele roteiro. Argumento de venda concreto: "vejam como nossa IA pensou no roteiro do seu cliente".

## 3. Notificação realtime quando Pietra acha evento

Pietra, ao retornar sugestões com `relevance_score >= 0.8` (ou flag `is_event: true`), grava também em `agent_messages` com flag `notify_admin = true`. Subscribe realtime no admin (já tem padrão no `QuotesTab`) dispara toast: "🎭 Pietra: festival em Lisboa nas datas do cliente Maria".

## 4. Eliminar fallback gringo em contexto B2B

`AffiliateButtons.tsx`: se o roteiro tem `agency_id` (cliente da agência), e a agência **não** configurou WhatsApp → mostra **um único botão "Solicitar contato"** que abre form simples (nome+telefone) e grava em `quote_requests` mesmo sem WhatsApp. Nada de Hotellook caindo no colo do cliente da agência.

Afiliado gringo continua intacto em rotas públicas (`/`, `/passagens`, `/voos`, `/flight/:id`).

## 5. Onboarding forçado da agência

`AgencyOnboardingModal.tsx` hoje é opcional. Mudar:
- Quando admin da agência logar e `agency_phone` estiver vazio → modal **não fechável** com 1 campo: "WhatsApp da sua agência (com DDD)".
- Sem isso, a agência não tem produto. Forçar o preenchimento.

Adicionar banner no admin: "⚠️ Sem WhatsApp configurado, seus clientes não conseguem solicitar cotação."

## 6. Auditoria do PDF white-label

`usePDFExport.ts` + `pdfImageService.ts`: garantir que o PDF gerado para clientes da agência **nunca** renderiza:
- Botões/links de Hotellook, Aviasales, GetYourGuide, TripAdvisor
- Marca "Sofia" ou "Lovable" — só logo + dados da agência

Se o roteiro foi gerado em contexto B2B (`agency_id` presente), substituir todos os blocos de afiliado por bloco "Para reservar, fale com [nome agência] no WhatsApp [número]".

## Arquivos que mudam

- `src/components/itinerary/DayTimeline.tsx` — botões Bruno/Lia
- `src/components/itinerary/ItineraryAdjustChat.tsx` — passar `itineraryId` nas chamadas
- `supabase/functions/agent-{sofia,pietra,lia,bruno}/index.ts` — gravar em `agent_messages`
- `src/components/admin/quotes/QuotesTab.tsx` — painel lateral com replay
- `src/components/admin/quotes/AgentReplayPanel.tsx` (novo)
- `src/components/itinerary/AffiliateButtons.tsx` — eliminar fallback gringo em B2B
- `src/components/itinerary/AgencyContactRequestModal.tsx` (novo) — form sem WhatsApp
- `src/components/agency/AgencyOnboardingModal.tsx` — forçar preenchimento
- `src/components/admin/AdminLayout.tsx` — banner de aviso
- `src/hooks/usePDFExport.ts` + `src/services/pdfImageService.ts` — modo B2B sem afiliado

## Detalhes técnicos

- Realtime de `agent_messages` precisa `ALTER PUBLICATION supabase_realtime ADD TABLE agent_messages` (migration nova)
- Coluna `notify_admin BOOLEAN DEFAULT false` em `agent_messages`
- `agency_id` precisa ser propagado pra `saved_itineraries` no momento da geração (verificar se já está)
- PDF: detectar contexto B2B via prop `isAgencyExport` ou lendo `agency_id` do itinerary

## Execução

1 turno só. Sem ondas. Se travar, paro e te aviso em 1 frase.

