import { contactConfig } from '@/config/contactConfig';

export function useWhatsApp() {
  const { whatsappNumber, whatsappMessage } = contactConfig;

  const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return { whatsAppHref };
}
