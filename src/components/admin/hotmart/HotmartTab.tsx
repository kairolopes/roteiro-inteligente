import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Package, Settings } from 'lucide-react';
import { PurchasesList } from './PurchasesList';
import { ProductsConfig } from './ProductsConfig';
import { HotmartSettings } from './HotmartSettings';

export const HotmartTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('purchases');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hotmart</h1>
        <p className="text-muted-foreground">
          Gerencie compras, produtos e configurações do Hotmart
        </p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="purchases" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Compras
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="mt-6">
          <PurchasesList />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <ProductsConfig />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <HotmartSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
