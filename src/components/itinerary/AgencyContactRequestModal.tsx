import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";
import { QuoteContext } from "@/lib/agencyContact";

interface AgencyContactRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: QuoteContext;
  agencyId?: string | null;
  agencyName?: string | null;
}

/**
 * Modal usado quando a agência não configurou WhatsApp:
 * cliente preenche nome+telefone e a cotação cai no painel "Cotações" mesmo assim.
 */
export default function AgencyContactRequestModal({
  open, onOpenChange, context, agencyId, agencyName,
}: AgencyContactRequestModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Preencha nome e telefone");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const message = [
        `Solicitação direta sem WhatsApp da agência.`,
        context.itineraryTitle ? `Roteiro: ${context.itineraryTitle}` : "",
        context.destination ? `Destino: ${context.destination}` : "",
        context.dayNumber ? `Dia: ${context.dayNumber}` : "",
        notes ? `Observações: ${notes}` : "",
      ].filter(Boolean).join("\n");

      const { error } = await (supabase as any).from("quote_requests").insert({
        user_id: user?.id ?? null,
        agency_id: agencyId ?? null,
        itinerary_id: context.itineraryId ?? null,
        itinerary_title: context.itineraryTitle ?? null,
        day_number: context.dayNumber ?? null,
        destination: context.destination ?? context.city ?? null,
        type: context.type,
        message_sent: message,
        contact_name: name.trim(),
        contact_phone: phone.trim(),
        status: "new",
      });

      if (error) throw error;
      toast.success("✅ Solicitação enviada", { description: `${agencyName || "A agência"} entrará em contato.` });
      onOpenChange(false);
      setName(""); setPhone(""); setNotes("");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar solicitação");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle>Solicitar contato</DialogTitle>
          <DialogDescription>
            Deixe seus dados e {agencyName || "a agência"} entrará em contato com você.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="ac-name">Seu nome *</Label>
            <Input id="ac-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como podemos te chamar" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ac-phone">Telefone / WhatsApp *</Label>
            <Input id="ac-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ac-notes">Observações (opcional)</Label>
            <Textarea id="ac-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Datas flexíveis, número de pessoas, etc." rows={3} />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving} className="flex-1">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
