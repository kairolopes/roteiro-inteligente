import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, User } from 'lucide-react';
import { SignaturePreview } from '../whatsapp/SignaturePreview';

const DEPARTMENTS = [
  { value: 'suporte', label: 'Suporte' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'administracao', label: 'Administração' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'marketing', label: 'Marketing' },
];

export const SettingsTab = () => {
  const { adminProfile, updateAdminProfile, getSignature, DEPARTMENT_SIGNATURES } = useAdminAuth();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [department, setDepartment] = useState<string>('suporte');
  const [signatureType, setSignatureType] = useState<'department' | 'personal'>('department');
  const [customSignature, setCustomSignature] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (adminProfile) {
      setDisplayName(adminProfile.display_name || '');
      setDepartment(adminProfile.department);
      setSignatureType(adminProfile.signature_type);
      setCustomSignature(adminProfile.custom_signature || '');
    }
  }, [adminProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await updateAdminProfile({
        display_name: displayName || null,
        department: department as 'suporte' | 'vendas' | 'administracao' | 'financeiro' | 'marketing',
        signature_type: signatureType,
        custom_signature: customSignature || null,
      });

      if (error) throw error;

      toast({
        title: 'Configurações salvas!',
        description: 'Suas preferências foram atualizadas.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const previewSignature = () => {
    if (signatureType === 'personal') {
      if (customSignature) return customSignature;
      if (displayName) {
        const deptLabel = DEPARTMENTS.find(d => d.value === department)?.label || department;
        return `- ${displayName} (${deptLabel})`;
      }
      return '';
    }
    return DEPARTMENT_SIGNATURES[department] || '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
        <p className="text-muted-foreground">Configure seu perfil de atendente</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil
            </CardTitle>
            <CardDescription>
              Suas informações de atendente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de Exibição</Label>
              <Input
                id="displayName"
                placeholder="Seu nome"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Signature Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Assinatura WhatsApp</CardTitle>
            <CardDescription>
              Escolha como sua assinatura aparecerá nas mensagens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup 
              value={signatureType} 
              onValueChange={(v) => setSignatureType(v as 'department' | 'personal')}
            >
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="department" id="dept" />
                <div>
                  <Label htmlFor="dept" className="font-normal cursor-pointer">
                    Assinatura do Departamento
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Usar a assinatura padrão do departamento
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="personal" id="personal" />
                <div>
                  <Label htmlFor="personal" className="font-normal cursor-pointer">
                    Assinatura Pessoal
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Usar seu nome + departamento ou assinatura customizada
                  </p>
                </div>
              </div>
            </RadioGroup>

            {signatureType === 'personal' && (
              <div className="space-y-2">
                <Label htmlFor="customSig">Assinatura Customizada (opcional)</Label>
                <Input
                  id="customSig"
                  placeholder="- Seu Nome (Departamento)"
                  value={customSignature}
                  onChange={(e) => setCustomSignature(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para usar "- {displayName || 'Seu Nome'} ({DEPARTMENTS.find(d => d.value === department)?.label})"
                </p>
              </div>
            )}

            {/* Preview */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <SignaturePreview signature={previewSignature()} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
