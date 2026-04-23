import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  registerQuoteAndGetLink,
  QuoteContext,
  AgencyContactInfo,
} from "@/lib/agencyContact";

interface AgencyQuoteButtonProps {
  context: QuoteContext;
  agency: AgencyContactInfo;
  agencyUserId?: string | null;
  variant?: "primary" | "compact";
  label?: string;
}

const TYPE_LABEL: Record<QuoteContext["type"], string> = {
  hotel: "Cotar hospedagem",
  flight: "Cotar voo",
  tour: "Cotar passeio",
  activity: "Cotar atividade",
  full_package: "Cotar pacote completo",
  other: "Falar com consultor",
};

export default function AgencyQuoteButton({
  context,
  agency,
  agencyUserId,
  variant = "primary",
  label,
}: AgencyQuoteButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const { url } = await registerQuoteAndGetLink(context, agency, agencyUserId);
      if (!url) {
        toast({
          variant: "destructive",
          title: "Consultor indisponível",
          description: "A agência ainda não configurou um número de WhatsApp.",
        });
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
      toast({
        title: "Cotação enviada ao consultor 💬",
        description: "Continue a conversa no WhatsApp.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const text = label ?? TYPE_LABEL[context.type];

  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs lg:text-sm font-medium transition-colors",
          "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
          "disabled:opacity-50",
        )}
      >
        <MessageCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        <span>{text}</span>
        <ExternalLink className="w-3 h-3 opacity-50" />
      </button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "group w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl",
        "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
        "shadow-md hover:shadow-lg transition-all disabled:opacity-60",
      )}
    >
      <div className="flex items-center gap-3 text-left">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm leading-tight">{text}</div>
          <div className="text-[11px] text-white/80 truncate">
            {agency.agencyName ? `Cotação personalizada com ${agency.agencyName}` : "Cotação personalizada com sua agência"}
          </div>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 flex-shrink-0" />
    </motion.button>
  );
}
