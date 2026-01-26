import { 
  LayoutDashboard, 
  Users, 
  MessageCircle, 
  UserPlus, 
  Plug, 
  Settings,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'leads', label: 'Leads', icon: UserPlus },
  { id: 'integrations', label: 'Integrações', icon: Plug },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Sofia Admin</h2>
            <p className="text-xs text-muted-foreground">Painel de Gestão</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">
            CRM v1.0
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            © 2024 Viage com Sofia
          </p>
        </div>
      </div>
    </div>
  );
};
