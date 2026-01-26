import { useState } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DashboardTab } from '@/components/admin/dashboard/DashboardTab';
import { CustomersTab } from '@/components/admin/customers/CustomersTab';
import { WhatsAppTab } from '@/components/admin/whatsapp/WhatsAppTab';
import { LeadsTab } from '@/components/admin/leads/LeadsTab';
import { IntegrationsTab } from '@/components/admin/integrations/IntegrationsTab';
import { SettingsTab } from '@/components/admin/settings/SettingsTab';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'customers':
        return <CustomersTab />;
      case 'whatsapp':
        return <WhatsAppTab />;
      case 'leads':
        return <LeadsTab />;
      case 'integrations':
        return <IntegrationsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <AdminGuard>
      <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTab()}
      </AdminLayout>
    </AdminGuard>
  );
};

export default Admin;
