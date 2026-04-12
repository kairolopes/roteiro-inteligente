import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAgencySettings } from "@/hooks/useAgencySettings";
import { Upload, Save, Building2, Loader2 } from "lucide-react";

export default function AgencySettingsForm() {
  const { settings, isLoading, saveSettings, uploadLogo } = useAgencySettings();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    agency_name: "",
    agency_phone: "",
    agency_email: "",
    agency_website: "",
    primary_color: "#4f46e5",
    secondary_color: "#1e1b4b",
  });
  const [initialized, setInitialized] = useState(false);

  // Initialize form when settings load
  if (settings && !initialized) {
    setForm({
      agency_name: settings.agency_name || "",
      agency_phone: settings.agency_phone || "",
      agency_email: settings.agency_email || "",
      agency_website: settings.agency_website || "",
      primary_color: settings.primary_color || "#4f46e5",
      secondary_color: settings.secondary_color || "#1e1b4b",
    });
    setInitialized(true);
  }

  const handleSave = async () => {
    setIsSaving(true);
    const success = await saveSettings(form);
    setIsSaving(false);
    toast({
      title: success ? "Configurações salvas! ✅" : "Erro ao salvar",
      description: success ? "Sua marca será aplicada nos PDFs." : "Tente novamente.",
      variant: success ? "default" : "destructive",
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 2MB.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const url = await uploadLogo(file);
    setIsSaving(false);
    if (url) {
      toast({ title: "Logo enviado! ✅" });
    } else {
      toast({ title: "Erro ao enviar logo", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Building2 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold">Configurações da Agência</h3>
      </div>

      {/* Logo */}
      <div className="space-y-2">
        <Label>Logo da Agência</Label>
        <div className="flex items-center gap-4">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Logo" className="h-16 w-auto rounded-lg border border-border" />
          ) : (
            <div className="h-16 w-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isSaving}>
            {settings?.logo_url ? "Trocar Logo" : "Enviar Logo"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">PNG ou JPG, máximo 2MB. Será exibido no cabeçalho dos PDFs.</p>
      </div>

      {/* Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome da Agência</Label>
          <Input value={form.agency_name} onChange={(e) => setForm(f => ({ ...f, agency_name: e.target.value }))} placeholder="Sua Agência de Viagens" />
        </div>
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input value={form.agency_phone} onChange={(e) => setForm(f => ({ ...f, agency_phone: e.target.value }))} placeholder="(11) 99999-9999" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={form.agency_email} onChange={(e) => setForm(f => ({ ...f, agency_email: e.target.value }))} placeholder="contato@agencia.com" />
        </div>
        <div className="space-y-2">
          <Label>Website</Label>
          <Input value={form.agency_website} onChange={(e) => setForm(f => ({ ...f, agency_website: e.target.value }))} placeholder="www.agencia.com" />
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cor Primária</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={form.primary_color} onChange={(e) => setForm(f => ({ ...f, primary_color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer" />
            <Input value={form.primary_color} onChange={(e) => setForm(f => ({ ...f, primary_color: e.target.value }))} className="flex-1" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Cor Secundária</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={form.secondary_color} onChange={(e) => setForm(f => ({ ...f, secondary_color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer" />
            <Input value={form.secondary_color} onChange={(e) => setForm(f => ({ ...f, secondary_color: e.target.value }))} className="flex-1" />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full gradient-primary text-primary-foreground">
        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Salvar Configurações
      </Button>
    </div>
  );
}
