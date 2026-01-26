import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface Conversation {
  phone: string;
  sender_name: string | null;
  sender_photo: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  direction: 'inbound' | 'outbound';
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedPhone: string | null;
  onSelectConversation: (phone: string) => void;
  isLoading?: boolean;
}

export const ConversationList = ({
  conversations,
  selectedPhone,
  onSelectConversation,
  isLoading = false,
}: ConversationListProps) => {
  const [search, setSearch] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = search.toLowerCase();
    return (
      conv.phone.includes(search) ||
      conv.sender_name?.toLowerCase().includes(searchLower)
    );
  });

  const formatPhone = (phone: string) => {
    // Format as +55 (11) 99999-9999
    if (phone.length === 13) {
      return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`;
    }
    return phone;
  };

  const getInitials = (name: string | null, phone: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    return phone.slice(-2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {search ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conv) => (
              <button
                key={conv.phone}
                onClick={() => onSelectConversation(conv.phone)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 text-left hover:bg-accent/50 transition-colors',
                  selectedPhone === conv.phone && 'bg-accent'
                )}
              >
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={conv.sender_photo || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(conv.sender_name, conv.phone)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm truncate">
                      {conv.sender_name || formatPhone(conv.phone)}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(conv.last_message_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.direction === 'outbound' && (
                        <span className="text-primary">Você: </span>
                      )}
                      {conv.last_message}
                    </p>
                    {conv.unread_count > 0 && (
                      <Badge
                        variant="default"
                        className="h-5 min-w-5 rounded-full text-xs shrink-0"
                      >
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
