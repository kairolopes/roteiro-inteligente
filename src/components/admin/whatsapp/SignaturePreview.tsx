import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Badge } from '@/components/ui/badge';

interface SignaturePreviewProps {
  signature?: string;
}

const DEPARTMENT_LABELS: Record<string, string> = {
  suporte: 'Suporte',
  vendas: 'Vendas',
  administracao: 'Administração',
  financeiro: 'Financeiro',
  marketing: 'Marketing',
};

export const SignaturePreview = ({ signature }: SignaturePreviewProps) => {
  const { adminProfile } = useAdminAuth();

  if (!signature) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          Configure sua assinatura nas configurações para que ela apareça nas mensagens.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Sua assinatura:</p>
        {adminProfile?.department && (
          <Badge variant="outline" className="text-xs">
            {DEPARTMENT_LABELS[adminProfile.department]}
          </Badge>
        )}
      </div>
      <p className="text-sm font-medium text-foreground mt-1">{signature}</p>
    </div>
  );
};
