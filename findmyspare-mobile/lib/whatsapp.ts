import { Linking } from "react-native";

/** Normalise an Indian phone number to a wa.me-friendly E.164 (no '+'). */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91")) return digits;
  return digits;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}

export const waTemplates = {
  productEnquiry: (productName: string) =>
    `Hi! I'm interested in "${productName}" listed on FindMySpare. Is it available?`,
  bidFollowUp: (partName: string, price: string) =>
    `Hi! I saw your quote of ₹${price} for "${partName}" on FindMySpare. I'd like to discuss.`,
  inquiryFollowUp: (partName: string) =>
    `Hi! Regarding my FindMySpare request for "${partName}" — can you help?`,
};

/** Open WhatsApp with a prefilled message; falls back to the web link. */
export async function openWhatsApp(phone: string, message: string): Promise<boolean> {
  const url = buildWhatsAppLink(phone, message);
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
