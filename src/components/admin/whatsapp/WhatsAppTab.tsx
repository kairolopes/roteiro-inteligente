import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, FileText, Settings } from 'lucide-react';
import { ConversationList, Conversation } from './ConversationList';
import { ConversationView } from './ConversationView';
import { TemplateSelector } from './TemplateSelector';
import { Message } from './ChatMessage';
import { cn } from '@/lib/utils';

export const WhatsAppTab = () => {
  const { getSignature, adminProfile } = useAdminAuth();
  const { toast } = useToast();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<{
    sender_name: string | null;
    sender_photo: string | null;
  }>({ sender_name: null, sender_photo: null });

  // Fetch conversations (grouped by phone)
  const fetchConversations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by phone and get last message
      const grouped = new Map<string, Conversation>();
      
      (data || []).forEach((msg) => {
        const existing = grouped.get(msg.phone);
        if (!existing) {
          grouped.set(msg.phone, {
            phone: msg.phone,
            sender_name: msg.sender_name,
            sender_photo: msg.sender_photo,
            last_message: msg.content || '',
            last_message_at: msg.created_at,
            unread_count: 0,
            direction: msg.direction as 'inbound' | 'outbound',
          });
        } else {
          // Update sender info if available
          if (msg.sender_name && !existing.sender_name) {
            existing.sender_name = msg.sender_name;
          }
          if (msg.sender_photo && !existing.sender_photo) {
            existing.sender_photo = msg.sender_photo;
          }
        }
      });

      setConversations(Array.from(grouped.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (phone: string) => {
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('phone', phone)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages((data || []) as Message[]);

      // Get conversation info
      const conv = conversations.find((c) => c.phone === phone);
      if (conv) {
        setSelectedConversation({
          sender_name: conv.sender_name,
          sender_photo: conv.sender_photo,
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [conversations]);

  // Send message
  const handleSendMessage = async (content: string) => {
    if (!selectedPhone) return;

    const signature = getSignature();
    const fullMessage = signature ? `${content}\n\n${signature}` : content;

    try {
      const { error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          phone: selectedPhone,
          message: fullMessage,
          admin_user_id: adminProfile?.id,
        },
      });

      if (error) throw error;

      toast({
        title: 'Mensagem enviada!',
        description: 'A mensagem foi enviada com sucesso.',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar a mensagem.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Select conversation
  const handleSelectConversation = (phone: string) => {
    setSelectedPhone(phone);
    fetchMessages(phone);
  };

  // Go back to list (mobile)
  const handleBack = () => {
    setSelectedPhone(null);
    setMessages([]);
  };

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('whatsapp-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Update conversations list
          fetchConversations();
          
          // If viewing this conversation, add message
          if (selectedPhone === newMessage.phone) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_messages',
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          
          // Update message status in view
          if (selectedPhone === updatedMessage.phone) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedPhone, fetchConversations]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">WhatsApp</h2>
        <p className="text-muted-foreground">Gerencie conversas via Z-API</p>
      </div>

      <Tabs defaultValue="conversations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Conversas
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="mt-0">
          <Card className="h-[calc(100vh-280px)] min-h-[500px] overflow-hidden">
            <div className="grid lg:grid-cols-[350px_1fr] h-full">
              {/* Conversation List */}
              <div
                className={cn(
                  'border-r h-full',
                  selectedPhone && 'hidden lg:block'
                )}
              >
                <ConversationList
                  conversations={conversations}
                  selectedPhone={selectedPhone}
                  onSelectConversation={handleSelectConversation}
                  isLoading={isLoadingConversations}
                />
              </div>

              {/* Chat View */}
              <div
                className={cn(
                  'h-full',
                  !selectedPhone && 'hidden lg:flex lg:items-center lg:justify-center'
                )}
              >
                {selectedPhone ? (
                  <ConversationView
                    phone={selectedPhone}
                    senderName={selectedConversation.sender_name}
                    senderPhoto={selectedConversation.sender_photo}
                    messages={messages}
                    isLoading={isLoadingMessages}
                    onBack={handleBack}
                    onSendMessage={handleSendMessage}
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Selecione uma conversa para começar</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="p-6">
            <TemplateSelector
              onSelect={(name, content) => {
                toast({
                  title: `Template "${name}" selecionado`,
                  description: 'Vá para Conversas e selecione um contato para enviar.',
                });
              }}
              selectedTemplate={null}
              showAll
            />
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Configuração do Webhook</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">URL do Webhook</label>
                <code className="block mt-1 p-3 bg-muted rounded-lg text-sm break-all">
                  https://rvmvoogyrafiogxdbisx.supabase.co/functions/v1/zapi-webhook
                </code>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure esta URL no painel do Z-API para receber mensagens automaticamente.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
