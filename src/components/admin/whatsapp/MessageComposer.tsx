import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2, X, User } from 'lucide-react';
import { SignaturePreview } from './SignaturePreview';

interface MessageComposerProps {
  initialMessage?: string;
  templateName?: string | null;
  onClearTemplate?: () => void;
}

export const MessageComposer = ({ 
  initialMessage = '', 
  templateName,
  onClearTemplate 
}: MessageComposerProps) => {
  const { getSignature, adminProfile } = useAdminAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(initialMessage);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  const signature = getSignature();

  const formatPhone = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 13 digits (country code + area code + number)
    return digits.slice(0, 13);
  };

  const handleSend = async () => {
    if (!phone || !message.trim()) {
      toast({
        title: 'Preencha todos os campos',
        description: 'Telefone e mensagem são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const fullMessage = signature 
        ? `${message.trim()}\n\n${signature}`
        : message.trim();

      const { error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          phone: phone,
          message: fullMessage,
          admin_user_id: adminProfile?.user_id,
        },
      });

      if (error) throw error;

      toast({
        title: 'Mensagem enviada!',
        description: `Mensagem enviada para ${phone}`,
      });

      setMessage('');
      setPhone('');
      onClearTemplate?.();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro ao enviar',
        description: 'Verifique a configuração do Z-API.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Nova Mensagem</CardTitle>
          {templateName && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Template: {templateName}
              <button onClick={onClearTemplate}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phone Input */}
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone (com DDI)</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              placeholder="5511999999999"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Exemplo: 5511999999999 (Brasil + DDD + número)
          </p>
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <Label htmlFor="message">Mensagem</Label>
          <Textarea
            id="message"
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        {/* Signature Preview */}
        <SignaturePreview signature={signature} />

        {/* Preview */}
        {message && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
            <p className="text-sm whitespace-pre-wrap">
              {message}
              {signature && (
                <>
                  <br /><br />
                  <span className="text-muted-foreground">{signature}</span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Send Button */}
        <Button 
          onClick={handleSend} 
          disabled={isSending || !phone || !message.trim()}
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Enviar Mensagem
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
