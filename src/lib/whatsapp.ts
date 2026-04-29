export function buildWhatsAppLink(phoneE164OrLocal: string, message: string): string {
  const digits = phoneE164OrLocal.replace(/\D/g, "");
  const normalized = digits.length === 10 ? `91${digits}` : digits;
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
    `Hi, I'm ${opts.buyerName} from FindMySpare. I saw your bid of ₹${opts.bidPrice} for ${opts.partName} (${opts.vehicle}). Could we discuss?`,
};
