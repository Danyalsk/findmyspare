/** Job card status → label + chip tone (Garage OS). */
export const JOB_STATUS: Record<string, { label: string; tone: "brand" | "green" | "amber" | "red" | "blue" | "grey" }> = {
  open: { label: "Checked in", tone: "grey" },
  estimate_sent: { label: "Awaiting approval", tone: "amber" },
  approved: { label: "Approved", tone: "blue" },
  in_progress: { label: "In progress", tone: "brand" },
  ready: { label: "Ready", tone: "green" },
  invoiced: { label: "Invoiced · unpaid", tone: "amber" },
  paid: { label: "Paid", tone: "green" },
  cancelled: { label: "Cancelled", tone: "grey" },
};
