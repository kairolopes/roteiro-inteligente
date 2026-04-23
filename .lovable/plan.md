## Sprint de Fechamento — Lotes 2 e 3 executados de ponta a ponta

Aprove uma vez. Eu executo tudo em sequência, sem novas perguntas. No final, o app está pronto pra vender.

---

### Lote 2 — UX e conversão

1. **Migrar todo `sessionStorage` solto para `sessionState`**
   - Substituir leituras/escritas em `Itinerary.tsx`, `Quiz.tsx`, `Chat.tsx`, `MyItineraries.tsx` pelo helper único.
   - Tratar JSON corrompido sem quebrar tela (fallback para quiz).

2. **Tela de loading do roteiro com etapas reais**
   - `ItineraryLoadingScreen` mostra progresso por etapa (analisando preferências → consultando lugares → montando dias → finalizando), com tempo estimado e barra.
   - Liga aos eventos SSE que `generate-itinerary` já emite.

3. **Paywall contextual**
   - `PaywallModal` mostra exatamente o que desbloqueia (X dias a mais, PDF, regenerar) e o preço do plano mais barato vindo de `/pricing`.
   - CTA direto pro plano recomendado.

4. **Persistir roteiro no banco para usuário logado**
   - Ao gerar/ajustar roteiro, salvar em `itineraries` automaticamente se logado.
   - `MyItineraries.tsx` já lista — garantir que aparece sem precisar clicar "Salvar".

5. **Onboarding da agência no 1º login**
   - Modal único pedindo nome da agência, logo, cor primária e WhatsApp.
   - Pula se já preenchido. Salva via `useAgencySettings`.

6. **Remover rota `/chat` legada de vez**
   - Apagar `src/pages/Chat.tsx` e `supabase/functions/chat-travel` (não é mais usado pelo fluxo principal).
   - Manter `adjust-itinerary` que é o chat real do produto.

---

### Lote 3 — Acabamento e prontidão pra vender

7. **SEO por rota**
   - Componente `<SEO>` com title, description, canonical e Open Graph para `/`, `/vendas`, `/quiz`, `/pricing`, `/passagens`.
   - `public/robots.txt` e `sitemap.xml` gerados.

8. **Dashboard admin com métricas reais**
   - `DashboardTab` puxa do banco: roteiros gerados (7/30 dias), assinaturas ativas, leads novos, conversão quiz→roteiro.
   - 4 cards + 1 gráfico de linha (recharts já instalado).

9. **Botão flutuante de WhatsApp**
   - Em `/`, `/vendas`, `/pricing`. Número vem de `agencySettings` ou fallback.

10. **Tela de pós-pagamento**
    - `/pricing?status=success` mostra confirmação visual + CTA "Criar meu primeiro roteiro" em vez de só toast.

11. **Polimento da landing e vendas**
    - Revisar tipografia (consistência H1/H2/body), espaçamentos e CTAs.
    - Garantir que mobile (407px que você está vendo agora) renderiza sem overflow.

12. **Limpeza final**
    - Apagar arquivos mortos: `src/pages/Chat.tsx`, `netlify/functions/chat-travel.ts` (já feito), `migration_completa.sql` se obsoleto.
    - Rodar `tsc --noEmit` e corrigir erros que aparecerem.

---

### Como vou trabalhar

- Executo Lote 2 inteiro, depois Lote 3 inteiro, sem pausas.
- Atualizo `PROJECT_CONTEXT.md` ao final marcando o que foi feito.
- Se eu encontrar um bug bloqueante no caminho, conserto na hora e sigo.
- Não pergunto nada no meio. No final eu te entrego um resumo do que mudou e o que testar.

### O que você faz depois

- Abre o preview, testa o fluxo: landing → quiz → roteiro → paywall → checkout.
- Se algo estiver errado, me fala em 1 mensagem só ("isso, isso e isso") que eu corrijo em lote.

---

**Detalhes técnicos (pode pular se não for técnico):**
- Migração de estado usa o helper `sessionState` já criado no Lote 1.
- Persistência de roteiro: insert em `itineraries` com `user_id` no evento `complete` do SSE.
- SEO: componente leve com `react-helmet-async` (instalo se não tiver) ou tags via `useEffect` no document.
- Dashboard: `supabase.rpc` ou queries diretas com RLS já existente.
- Onboarding: estado vem de `useAgencySettings` — se `agency_name` vazio, abre modal.
