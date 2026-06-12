import { Chip } from "@/components/ui/Chip";

export interface StockBadgeProps {
  status: string;
  stockQuantity: number;
  lowStockThreshold: number;
}

/**
 * Single source of truth for how an inventory item's stock state is shown.
 * gray=draft/paused, red=out, amber=low, green=in stock.
 */
export function StockBadge({ status, stockQuantity, lowStockThreshold }: StockBadgeProps) {
  if (status === "draft") return <Chip variant="default">Draft</Chip>;
  if (status === "paused") return <Chip variant="default">Paused</Chip>;
  if (stockQuantity <= 0) return <Chip variant="danger" dot>Out of stock</Chip>;
  if (stockQuantity <= lowStockThreshold)
    return <Chip variant="warn" dot>{`Low · ${stockQuantity}`}</Chip>;
  return <Chip variant="ok" dot>{`${stockQuantity} in stock`}</Chip>;
}
