import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAgencySettings } from "@/hooks/useAgencySettings";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Building2, Loader2, Sparkles } from "lucide-react";

const SKIP_KEY = "agency_onboarding_skipped";

export default function AgencyOnboardingModal() {
  const { user } = useAuth();
  const { settings, isLoading, saveSettings } = useAgencySettings();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    agency_name: "",
    agency_phone: "",
    primary_color: "#4f46e5",
  });

  useEffect(() => {
    if (!user || isLoading) return;
    const skipped = localStorage.getItem(SKIP_KEY) === "true";
    if (!settings?.agency_name && !skipped) {
      setOpen(true);
    }
  }, [user, isLoading, settings]);

  const handleSave = async () => {
    if (!form.agency_name.trim()) {
      toast({ title: "Informe o nome da agência", variant: "destructive" });
      return;
    }
    setSaving(true);
    const ok = await saveSettings(form);
    setSaving(false);
    if (ok) {
      toast({ title: "Bem-vindo! 🎉", description: "Sua agência está configurada." });
      setOpen(false);
    } else {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleSkip = () => {
    localStorage.setItem(SKIP_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleSkip()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-2">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            Configure sua agência <Sparkles className="w-4 h-4 text-primary" />
          </DialogTitle>
          <DialogDescription>
            Personalize os roteiros e PDFs com a sua marca. Leva 30 segundos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="onboarding-name">Nome da agência *</Label>
            <Input
              id="onboarding-name"
              placeholder="Sua Agência de Viagens"
              value={form.agency_name}
              onChange={(e) => setForm((f) => ({ ...f, agency_name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="onboarding-phone">WhatsApp da agência</Label>
            <Input
              id="onboarding-phone"
              placeholder="(11) 99999-9999"
              value={form.agency_phone}
              onChange={(e) => setForm((f) => ({ ...f, agency_phone: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="onboarding-color">Cor da marca</Label>
            <div className="flex items-center gap-2">
              <input
                id="onboarding-color"
                type="color"
                value={form.primary_color}
                onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))}
                className="w-12 h-10 rounded cursor-pointer border border-border"
              />
              <Input
                value={form.primary_color}
                onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="ghost" onClick={handleSkip} className="flex-1">
            Pular por agora
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 gradient-primary text-primary-foreground"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
