import { describe, expect, test } from "bun:test";
import { normalizeRegNo, formatRegNo, computeInvoice, invoiceHash, verifyCode } from "../src/lib/garage";

describe("registration numbers", () => {
  test("normalises spacing/case and rejects junk", () => {
    expect(normalizeRegNo("mh 12 ab 3456")).toBe("MH12AB3456");
    expect(normalizeRegNo("DL-3C-AQ-1234")).toBe("DL3CAQ1234");
    expect(normalizeRegNo("22 BH 1234 AA")).toBe("22BH1234AA");
    expect(normalizeRegNo("hello")).toBeNull();
    expect(normalizeRegNo("")).toBeNull();
  });
  test("formats for display", () => {
    expect(formatRegNo("MH12AB3456")).toBe("MH 12 AB 3456");
  });
});

describe("GST invoice maths", () => {
  test("splits CGST/SGST and totals per line", () => {
    const r = computeInvoice([
      { kind: "part", name: "Brake pads", quantity: 1, unitPrice: "1180", gstRate: 28 },
      { kind: "labour", name: "Brake service", quantity: 1, unitPrice: "450", gstRate: 18 },
      { kind: "part", name: "Oil filter", quantity: 2, unitPrice: "245.50", gstRate: 18 },
    ]);
    expect(r.lines[0]).toMatchObject({ taxable: "1180.00", tax: "330.40", total: "1510.40" });
    expect(r.lines[1]).toMatchObject({ hsnSac: "9987", tax: "81.00" });
    expect(r.lines[2]).toMatchObject({ taxable: "491.00", tax: "88.38" });
    expect(r.taxable).toBe("2121.00");
    expect(Number(r.cgst) + Number(r.sgst)).toBeCloseTo(330.4 + 81 + 88.38, 2);
    expect(r.total).toBe((2121 + 499.78).toFixed(2));
  });
});

describe("invoice hash", () => {
  const base = {
    number: "SAW-2026-0001", issuedAt: "2026-10-15T10:00:00.000Z",
    seller: { name: "Sharma Auto Works", gstin: "27ABCDE1234F1Z5" }, customer: { name: "Arjun" },
    vehicle: { regNo: "MH 12 AB 3456", label: "Maruti Suzuki Swift" },
    lines: [{ name: "Brake pads", total: "1510.40" }], taxable: "1180.00", cgst: "165.20", sgst: "165.20", total: "1510.40",
  };
  test("is stable regardless of key order", () => {
    const shuffled = { total: base.total, sgst: base.sgst, cgst: base.cgst, taxable: base.taxable, lines: base.lines, vehicle: base.vehicle, customer: base.customer, seller: { gstin: base.seller.gstin, name: base.seller.name }, issuedAt: base.issuedAt, number: base.number };
    expect(invoiceHash(shuffled)).toBe(invoiceHash(base));
  });
  test("changes when any amount is altered", () => {
    expect(invoiceHash({ ...base, total: "1510.41" })).not.toBe(invoiceHash(base));
  });
  test("verify codes look like FMS-XXXX-XXXX without ambiguous letters", () => {
    for (let i = 0; i < 50; i++) expect(verifyCode()).toMatch(/^FMS-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
  });
});
