import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface HotmartProduct {
  id: string;
  hotmart_product_id: string;
  product_ucode: string | null;
  name: string;
  credits_to_add: number | null;
  subscription_type: string | null;
  subscription_days: number | null;
  welcome_message: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductFormData {
  hotmart_product_id: string;
  product_ucode: string;
  name: string;
  credits_to_add: number;
  subscription_type: string;
  subscription_days: number;
  welcome_message: string;
  is_active: boolean;
}

const defaultFormData: ProductFormData = {
  hotmart_product_id: '',
  product_ucode: '',
  name: '',
  credits_to_add: 0,
  subscription_type: '',
  subscription_days: 0,
  welcome_message: 'Olá {nome}! 🎉\n\nSeja muito bem-vindo(a)! Sua compra de {produto} foi confirmada.\n\nAgora você tem acesso a todos os recursos. Aproveite!',
  is_active: true,
};

export const ProductsConfig = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<HotmartProduct | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);

  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['hotmart-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hotmart_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as HotmartProduct[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const payload = {
        hotmart_product_id: data.hotmart_product_id,
        product_ucode: data.product_ucode || null,
        name: data.name,
        credits_to_add: data.credits_to_add || 0,
        subscription_type: data.subscription_type || null,
        subscription_days: data.subscription_days || null,
        welcome_message: data.welcome_message || null,
        is_active: data.is_active,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('hotmart_products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hotmart_products')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotmart-products'] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData(defaultFormData);
      toast.success(editingProduct ? 'Produto atualizado!' : 'Produto cadastrado!');
    },
    onError: (error) => {
      toast.error('Erro ao salvar produto: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hotmart_products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotmart-products'] });
      toast.success('Produto removido!');
    },
    onError: (error) => {
      toast.error('Erro ao remover produto: ' + error.message);
    },
  });

  const handleEdit = (product: HotmartProduct) => {
    setEditingProduct(product);
    setFormData({
      hotmart_product_id: product.hotmart_product_id,
      product_ucode: product.product_ucode || '',
      name: product.name,
      credits_to_add: product.credits_to_add || 0,
      subscription_type: product.subscription_type || '',
      subscription_days: product.subscription_days || 0,
      welcome_message: product.welcome_message || '',
      is_active: product.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hotmart_product_id || !formData.name) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Configuração de Produtos</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingProduct(null);
              setFormData(defaultFormData);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hotmart_product_id">ID do Produto *</Label>
                    <Input
                      id="hotmart_product_id"
                      value={formData.hotmart_product_id}
                      onChange={(e) => setFormData({ ...formData, hotmart_product_id: e.target.value })}
                      placeholder="Ex: 12345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product_ucode">Ucode</Label>
                    <Input
                      id="product_ucode"
                      value={formData.product_ucode}
                      onChange={(e) => setFormData({ ...formData, product_ucode: e.target.value })}
                      placeholder="Ex: abc123"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Plano Premium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credits_to_add">Créditos a Adicionar</Label>
                    <Input
                      id="credits_to_add"
                      type="number"
                      min="0"
                      value={formData.credits_to_add}
                      onChange={(e) => setFormData({ ...formData, credits_to_add: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subscription_type">Tipo de Assinatura</Label>
                    <Select
                      value={formData.subscription_type}
                      onValueChange={(value) => setFormData({ ...formData, subscription_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="annual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscription_days">Dias de Assinatura</Label>
                  <Input
                    id="subscription_days"
                    type="number"
                    min="0"
                    value={formData.subscription_days}
                    onChange={(e) => setFormData({ ...formData, subscription_days: parseInt(e.target.value) || 0 })}
                    placeholder="Ex: 30 para mensal, 365 para anual"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome_message">Mensagem de Boas-vindas (WhatsApp)</Label>
                  <Textarea
                    id="welcome_message"
                    value={formData.welcome_message}
                    onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                    placeholder="Use {nome} e {produto} como variáveis"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Variáveis: {'{nome}'} = primeiro nome, {'{produto}'} = nome do produto
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Ativo</Label>
                  </div>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando...
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum produto configurado. Clique em "Novo Produto" para começar.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>ID Hotmart</TableHead>
                  <TableHead>Créditos</TableHead>
                  <TableHead>Assinatura</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {product.hotmart_product_id}
                    </TableCell>
                    <TableCell>{product.credits_to_add || 0}</TableCell>
                    <TableCell>
                      {product.subscription_type ? (
                        <span>
                          {product.subscription_type === 'monthly' ? 'Mensal' : 'Anual'}
                          {product.subscription_days && ` (${product.subscription_days} dias)`}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Remover este produto?')) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
