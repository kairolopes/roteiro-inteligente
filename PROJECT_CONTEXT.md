# Viaje com Sofia — Contexto único do projeto

Este documento é a fonte de verdade que eu (Lovable) uso para não me perder entre sessões.
Atualize aqui sempre que uma decisão importante mudar.

## 1. O que é o produto
- SaaS B2B para agências de viagem (white-label).
- Cliente final responde um quiz → Sofia (IA) gera roteiro → exporta PDF com a marca da agência.
- Monetização: assinatura via Mercado Pago + Hotmart; freemium (visitante 2 dias / logado 3 dias).

## 2. Fluxo principal (não pode quebrar)
1. `/` Landing → CTA leva ao `/quiz`.
2. `/quiz` 7 etapas + resumo → salva `quizAnswers` em `sessionStorage` → vai para `/itinerary`.
3. `/itinerary` chama edge function `generate-itinerary` (streaming SSE) → renderiza dias + mapa + chat de ajuste.
4. Bloqueio freemium por dia via `LockedDayOverlay` + `PaywallModal`.
5. `/pricing` checkout Mercado Pago.
6. `/admin` painel (clientes, WhatsApp, Hotmart, leads, integrações).

## 3. Decisões já tomadas (não voltar atrás)
- IA SEMPRE via Lovable AI Gateway (`google/gemini-2.5-flash`), nunca OpenAI direto.
- Geração de roteiro e chat NÃO passam por Netlify (timeout 10s) — vão direto na Supabase Edge.
- Após o quiz, o usuário vai DIRETO para o roteiro. Não existe mais chat conversacional intermediário.
- Cidade é digitável no DestinationsStep (autocomplete + texto livre).
- PDF é white-label (logo, contato e cores da agência via `useAgencySettings`).
- Roles ficam em `user_roles` + função `has_role()` (nunca em `profiles`).

## 4. Pontos frágeis conhecidos (a corrigir nos lotes)
- Estado de fluxo depende de `sessionStorage` espalhado (`quizAnswers`, `chatSummary`, `generatedItinerary`).
- Há duas implementações de chat: `supabase/functions/chat-travel` e `netlify/functions/chat-travel.ts` (a do Netlify usa OpenAI e está obsoleta).
- `apiRouting.ts` tem anon key hardcoded → deveria usar `import.meta.env`.
- `Chat.tsx` ainda existe como rota mesmo sendo legado — confunde o fluxo.
- `useEffect` de geração de roteiro depende de `generateItineraryWithStreaming` que muda a cada render → risco de loop.

## 5. Integrações
- Pagamento: Mercado Pago (`MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`) + Hotmart (`HOTMART_HOTTOK`).
- WhatsApp: Z-API (`ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN`).
- Imagens: Unsplash + Google Places.
- Voos: Travelpayouts.
- IA: Lovable AI Gateway (`LOVABLE_API_KEY`).

## 6. Backlog priorizado (reta final)

### LOTE 1 — Estabilidade (crítico)
- [ ] Remover `netlify/functions/chat-travel.ts` (legado, usa OpenAI).
- [ ] Mover anon key do `apiRouting.ts` para env var.
- [ ] Corrigir loop potencial no `useEffect` do `Itinerary.tsx`.
- [ ] Esconder rota `/chat` ou redirecionar para `/itinerary`.
- [ ] Centralizar leitura de `sessionStorage` em um helper único (`src/lib/sessionState.ts`).
- [ ] Tratar caso de `quizAnswers` corrompido sem quebrar a página.

### LOTE 2 — UX e conversão ✅
- [x] Loading do roteiro com etapas reais (já tinha, mantido).
- [x] Paywall contextual (mostra X de Y dias bloqueados).
- [x] Persistir roteiro no banco para usuário logado (auto-save em `saved_itineraries`).
- [x] `sessionState` aplicado em Quiz, Itinerary, MyItineraries.
- [x] Onboarding da agência no 1º login (`AgencyOnboardingModal`).
- [x] Rota `/chat` removida (página deletada, redirect mantido).

### LOTE 3 — Acabamento ✅
- [x] Componente `<SEO>` por rota (Index, Vendas, Quiz, Pricing, Itinerary).
- [x] `robots.txt` e `sitemap.xml` publicados.
- [x] Dashboard admin com gráfico 7 dias (roteiros vs leads).
- [x] Botão flutuante de WhatsApp em `/`, `/vendas`, `/pricing`.
- [x] Tela visual de pós-pagamento em `/pricing?status=success`.
- [x] `index.html` com SEO base, lang pt-BR, theme-color, canonical.

## 7. Como pedir mudanças (para o usuário)
Em vez de pedidos soltos, prefira:
- "Executar Lote X" → eu faço tudo do lote.
- "Adicionar item ao backlog: ..." → eu coloco aqui e priorizo.
- "Mudar regra de produto: ..." → eu atualizo a seção 3.
