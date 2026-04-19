/* ═══════════════════════════════════════════════════════
   FindMySpare — Icon System
   Ported from FMS Design Prototype screens.js
   28 SVG icons as React components
   ═══════════════════════════════════════════════════════ */

import React from "react";

export interface IconProps {
  className?: string;
  size?: number;
}

const defaultProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SearchIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function HomeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}

export function OrdersIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="M3 7h18l-1.5 12a2 2 0 0 1-2 1.8h-11A2 2 0 0 1 4.5 19zM8 7V5a4 4 0 0 1 8 0v2" />
    </svg>
  );
}

export function ChatIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.2-4.2A8 8 0 1 1 21 12Z" />
    </svg>
  );
}

export function UserIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function ScanIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3M4 12h16" />
    </svg>
  );
}

export function PlusIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function BackIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

export function MoreIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

export function FilterIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

export function ShieldIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function LockIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function TruckIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="M2 7h11v9H2zM13 10h5l3 3v3h-8z" />
      <circle cx="6.5" cy="18" r="1.8" />
      <circle cx="17.5" cy="18" r="1.8" />
    </svg>
  );
}

export function CheckIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

export function SparkIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
    </svg>
  );
}

export function MicIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

export function CameraIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function StarIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" stroke="none">
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17l-5.5 3.2 1-6.2L3 9.6l6.2-.9z" />
    </svg>
  );
}

export function BoltIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </svg>
  );
}

export function PinIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function BellIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function ArrowRightIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowUpIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

export function ClockIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

export function WalletIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M3 10h18M16 14h2" />
    </svg>
  );
}

export function PackageIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9" />
    </svg>
  );
}

export function TrendIcon({ className, size = 24 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...defaultProps}>
      <path d="m3 17 6-6 4 4 8-8M15 7h6v6" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   Dynamic Icon lookup
   ═══════════════════════════════════════════════════════ */

export const iconMap = {
  search: SearchIcon,
  home: HomeIcon,
  orders: OrdersIcon,
  chat: ChatIcon,
  user: UserIcon,
  scan: ScanIcon,
  plus: PlusIcon,
  back: BackIcon,
  more: MoreIcon,
  filter: FilterIcon,
  shield: ShieldIcon,
  lock: LockIcon,
  truck: TruckIcon,
  check: CheckIcon,
  spark: SparkIcon,
  mic: MicIcon,
  camera: CameraIcon,
  star: StarIcon,
  bolt: BoltIcon,
  pin: PinIcon,
  bell: BellIcon,
  arrowRight: ArrowRightIcon,
  arrowUp: ArrowUpIcon,
  clock: ClockIcon,
  wallet: WalletIcon,
  package: PackageIcon,
  trend: TrendIcon,
} as const;

export type IconName = keyof typeof iconMap;

/**
 * Dynamic icon component — pass a name to render the corresponding icon.
 * e.g. <Icon name="search" size={20} />
 */
export function Icon({ name, ...props }: IconProps & { name: IconName }) {
  const Component = iconMap[name];
  return <Component {...props} />;
}
