import { ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AdminHeaderProps {
  children?: ReactNode;
}

const DEPARTMENT_LABELS: Record<string, string> = {
  suporte: 'Suporte',
  vendas: 'Vendas',
  administracao: 'Administração',
  financeiro: 'Financeiro',
  marketing: 'Marketing',
};

export const AdminHeader = ({ children }: AdminHeaderProps) => {
  const { adminProfile } = useAdminAuth();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = adminProfile?.display_name || user?.email?.split('@')[0] || 'Admin';
  const department = adminProfile?.department 
    ? DEPARTMENT_LABELS[adminProfile.department] 
    : 'Administrador';

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {children}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">CRM</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-semibold text-foreground">Painel Admin</h1>
            <p className="text-xs text-muted-foreground">Viage com Sofia</p>
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{department}</p>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/')}>
            <User className="mr-2 h-4 w-4" />
            Voltar ao Site
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
