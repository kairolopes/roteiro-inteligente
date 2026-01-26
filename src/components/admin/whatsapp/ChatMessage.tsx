import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Check, CheckCheck, Clock, Image, FileText, Mic, Video } from 'lucide-react';

export interface Message {
  id: string;
  phone: string;
  sender_name: string | null;
  content: string;
  message_type: string;
  media_url: string | null;
  direction: 'inbound' | 'outbound';
  status: string;
  created_at: string;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isOutbound = message.direction === 'outbound';

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getMediaIcon = () => {
    switch (message.message_type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'audio':
        return <Mic className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const renderMediaPreview = () => {
    if (!message.media_url) return null;

    switch (message.message_type) {
      case 'image':
        return (
          <a
            href={message.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-2"
          >
            <img
              src={message.media_url}
              alt="Imagem"
              className="max-w-full rounded-lg max-h-64 object-cover"
            />
          </a>
        );
      case 'audio':
        return (
          <audio controls className="w-full mb-2">
            <source src={message.media_url} />
          </audio>
        );
      case 'video':
        return (
          <video controls className="max-w-full rounded-lg max-h-64 mb-2">
            <source src={message.media_url} />
          </video>
        );
      case 'document':
        return (
          <a
            href={message.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-background/50 rounded mb-2 hover:bg-background/80 transition-colors"
          >
            <FileText className="h-5 w-5" />
            <span className="text-sm underline">{message.content}</span>
          </a>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'flex mb-2',
        isOutbound ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2 shadow-sm',
          isOutbound
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md'
        )}
      >
        {/* Media preview */}
        {renderMediaPreview()}

        {/* Text content (unless it's just a media placeholder) */}
        {message.content &&
          !['[Imagem]', '[Áudio]', '[Vídeo]', '[Sticker]'].includes(
            message.content
          ) && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.message_type !== 'text' && (
                <span className="inline-flex items-center gap-1 mr-1 opacity-70">
                  {getMediaIcon()}
                </span>
              )}
              {message.content}
            </p>
          )}

        {/* Timestamp and status */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            isOutbound ? 'justify-end' : 'justify-start'
          )}
        >
          <span
            className={cn(
              'text-[10px]',
              isOutbound ? 'text-primary-foreground/70' : 'text-muted-foreground'
            )}
          >
            {format(new Date(message.created_at), 'HH:mm')}
          </span>
          {isOutbound && getStatusIcon()}
        </div>
      </div>
    </div>
  );
};
