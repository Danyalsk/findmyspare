// Build a click-to-WhatsApp link. Returns null if the phone is invalid so
// callers can show a fallback ("phone unavailable") instead of opening a
// broken wa.me URL that 404s.
export function buildWhatsAppLink(
  phoneE164OrLocal: string | null | undefined,
  message: string
): string | null {
  if (!phoneE164OrLocal) return null;
  const digits = phoneE164OrLocal.replace(/\D/g, "");
  let normalized = digits;
  if (normalized.length === 10 && /^[6-9]/.test(normalized)) {
    normalized = `91${normalized}`;
  }
  if (normalized.length === 11 && normalized.startsWith("0")) {
    normalized = `91${normalized.slice(1)}`;
  }
  // Indian E.164 → 12 digits (91 + 10). Accept other lengths if 8–15 (general E.164).
  if (normalized.length < 8 || normalized.length > 15) return null;
  if (normalized.startsWith("91") && !/^91[6-9]\d{9}$/.test(normalized)) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export const waTemplates = {
  productEnquiry: (opts: {
    buyerName: string;
    productName: string;
    partNumber?: string | null;
    vehicle?: string | null;
  }) => {
    const partBit = opts.partNumber ? ` (Part #${opts.partNumber})` : "";
    const vehBit = opts.vehicle ? ` for ${opts.vehicle}` : "";
    return `Hi, I'm ${opts.buyerName} from FindMySpare. I'm interested in "${opts.productName}"${partBit}${vehBit}. Is it available?`;
  },

  bidFollowUp: (opts: {
    buyerName: string;
    partName: string;
    vehicle: string;
    bidPrice: string;
  }) =>
    `Hi, I'm ${opts.buyerName} from FindMySpare. I saw your quote of ₹${opts.bidPrice} for ${opts.partName} (${opts.vehicle}). Could we discuss?`,

  inquiryToSupplier: (opts: {
    buyerName: string;
    partName: string;
    vehicle: string;
  }) =>
    `Hi, I'm ${opts.buyerName} from FindMySpare. I'm looking for ${opts.partName} (${opts.vehicle}). Are you able to supply this?`,
};
