export const SUPPORT_WHATSAPP_E164 = "+40750257337";
export const SUPPORT_WHATSAPP_NUMBER = "40750257337";
export const SUPPORT_WHATSAPP_URL = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}`;

export function buildSupportWhatsAppUrl(message: string) {
  const url = new URL(SUPPORT_WHATSAPP_URL);
  const trimmed = message.trim();
  if (trimmed) {
    url.searchParams.set("text", trimmed);
  }
  return url.toString();
}
