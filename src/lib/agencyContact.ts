// Helpers para gerar links WhatsApp e registrar cotações da agência (canal BR).
import { supabase } from "@/integrations/supabase/client";

export type QuoteType = "hotel" | "flight" | "tour" | "activity" | "full_package" | "other";

export interface QuoteContext {
  itineraryId?: string;
  itineraryTitle?: string;
  dayNumber?: number;
  destination?: string;
  city?: string;
  country?: string;
  date?: string;
  activityTitle?: string;
  type: QuoteType;
}

export interface AgencyContactInfo {
  agencyName?: string | null;
  agencyPhone?: string | null;
}

const TYPE_LABEL: Record<QuoteType, string> = {
  hotel: "hospedagem",
  flight: "voo",
  tour: "passeio",
  activity: "atividade",
  full_package: "pacote completo",
  other: "cotação",
};

export function buildQuoteMessage(ctx: QuoteContext, agencyName?: string | null): string {
  const greeting = agencyName ? `Oi ${agencyName}!` : "Oi!";
  const destination = ctx.destination || ctx.city || "este destino";
  const day = ctx.dayNumber ? ` (Dia ${ctx.dayNumber})` : "";
  const titleLine = ctx.itineraryTitle ? `Roteiro: *${ctx.itineraryTitle}*\n` : "";
  const activityLine = ctx.activityTitle ? `Atividade: *${ctx.activityTitle}*\n` : "";
  const dateLine = ctx.date ? `Data: ${ctx.date}\n` : "";

  return [
    `${greeting} Vi um roteiro pra ${destination}${day} e quero uma cotação de ${TYPE_LABEL[ctx.type]}.`,
    "",
    `${titleLine}${activityLine}${dateLine}`.trim(),
    "Pode me passar valores e disponibilidade?",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Sanitiza telefone para o formato wa.me (apenas dígitos). */
export function sanitizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/** Registra cotação no banco e devolve o link wa.me pronto para abrir. */
export async function registerQuoteAndGetLink(
  ctx: QuoteContext,
  agency: AgencyContactInfo,
  agencyId?: string | null,
): Promise<{ url: string | null; recorded: boolean }> {
  const phone = sanitizePhone(agency.agencyPhone);
  if (!phone) return { url: null, recorded: false };

  const message = buildQuoteMessage(ctx, agency.agencyName);
  const url = buildWhatsAppUrl(phone, message);

  // Pega usuário (pode estar deslogado — RLS permite insert público)
  const { data: { user } } = await supabase.auth.getUser();

  try {
    await (supabase as any).from("quote_requests").insert({
      user_id: user?.id ?? null,
      agency_id: agencyId ?? null,
      itinerary_id: ctx.itineraryId ?? null,
      itinerary_title: ctx.itineraryTitle ?? null,
      day_number: ctx.dayNumber ?? null,
      destination: ctx.destination ?? ctx.city ?? null,
      type: ctx.type,
      message_sent: message,
      status: "new",
    });
    return { url, recorded: true };
  } catch (err) {
    console.error("Failed to record quote_request:", err);
    return { url, recorded: false };
  }
}
