import { MessageCircle } from "lucide-react";
import { useAgencySettings } from "@/hooks/useAgencySettings";

interface WhatsAppButtonProps {
  message?: string;
  fallbackPhone?: string;
}

const DEFAULT_PHONE = "5511999999999";
const DEFAULT_MESSAGE = "Olá! Tenho interesse em saber mais sobre a Viaje com Sofia.";

export default function WhatsAppButton({
  message = DEFAULT_MESSAGE,
  fallbackPhone = DEFAULT_PHONE,
}: WhatsAppButtonProps) {
  const { settings } = useAgencySettings();

  const phone = (settings?.agency_phone || fallbackPhone).replace(/\D/g, "");
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
