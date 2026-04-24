import { ReactNode, useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Menu, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAgencySettings } from '@/hooks/useAgencySettings';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminLayout = ({ children, activeTab, onTabChange }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings } = useAgencySettings();
  const missingPhone = !settings?.agency_phone;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 border-r border-border bg-card">
        <AdminSidebar activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <AdminSidebar 
            activeTab={activeTab} 
            onTabChange={(tab) => {
              onTabChange(tab);
              setSidebarOpen(false);
            }} 
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
        </AdminHeader>

        {missingPhone && (
          <div className="bg-destructive/10 border-b border-destructive/30 px-4 py-2 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <span className="font-semibold text-destructive">WhatsApp não configurado.</span>{' '}
              <span className="text-foreground/80">
                Sem isso, seus clientes não conseguem solicitar cotação.
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => onTabChange('settings')}
            >
              Configurar
            </Button>
          </div>
        )}
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
