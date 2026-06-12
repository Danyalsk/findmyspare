import React from "react";

/* ═══════════════════════════════════════════════════════
   Category icons — original line-style SVGs.
   1.6px stroke, 24×24 viewBox, rounded caps. Match
   Lucide-style minimalism. Used to replace emoji icons
   in category grids.
   ═══════════════════════════════════════════════════════ */

type IconProps = {
  size?: number;
  className?: string;
};

const base = (children: React.ReactNode, { size = 24, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    {children}
  </svg>
);

export const EngineIcon = (p: IconProps) =>
  base(
    <>
      <path d="M5 12h14" />
      <path d="M9 8v8" />
      <path d="M15 8v8" />
      <rect x="3" y="9" width="2" height="6" />
      <rect x="19" y="9" width="2" height="6" />
      <path d="M12 4v3" />
      <path d="M9 4h6" />
    </>,
    p
  );

export const BrakeIcon = (p: IconProps) =>
  base(
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v3" />
      <path d="M12 17v3" />
      <path d="M4 12h3" />
      <path d="M17 12h3" />
    </>,
    p
  );

export const HeadlightIcon = (p: IconProps) =>
  base(
    <>
      <path d="M4 8c0-1.7 1.3-3 3-3h7l5 4v4l-5 4H7c-1.7 0-3-1.3-3-3V8Z" />
      <circle cx="13" cy="11" r="2" />
      <path d="M19 9h2" />
      <path d="M19 13h2" />
    </>,
    p
  );

export const BodyIcon = (p: IconProps) =>
  base(
    <>
      <path d="M3 13l2-4a3 3 0 0 1 3-2h8a3 3 0 0 1 3 2l2 4" />
      <path d="M3 13v3a1 1 0 0 0 1 1h1" />
      <path d="M21 13v3a1 1 0 0 1-1 1h-1" />
      <circle cx="7" cy="17" r="1.6" />
      <circle cx="17" cy="17" r="1.6" />
      <path d="M9 13h6" />
    </>,
    p
  );

export const SuspensionIcon = (p: IconProps) =>
  base(
    <>
      <path d="M12 3v3" />
      <path d="M9 6h6" />
      <path d="M10 8l4 2" />
      <path d="M14 8l-4 2" />
      <path d="M10 10l4 2" />
      <path d="M14 10l-4 2" />
      <path d="M10 12l4 2" />
      <path d="M14 12l-4 2" />
      <path d="M9 16h6" />
      <path d="M12 16v3" />
    </>,
    p
  );

export const TransmissionIcon = (p: IconProps) =>
  base(
    <>
      <circle cx="7" cy="7" r="3" />
      <circle cx="17" cy="17" r="3" />
      <circle cx="17" cy="7" r="3" />
      <path d="M7 10v4" />
      <path d="M17 10v4" />
      <path d="M10 17H7" />
    </>,
    p
  );

export const ElectricalIcon = (p: IconProps) =>
  base(
    <>
      <rect x="4" y="7" width="16" height="10" rx="1.5" />
      <path d="M8 7V5" />
      <path d="M16 7V5" />
      <path d="M9 12h2" />
      <path d="M10 11v2" />
      <path d="M13 12h2" />
    </>,
    p
  );

export const FilterIcon = (p: IconProps) =>
  base(
    <>
      <path d="M5 5h14l-5 8v5l-4 2v-7L5 5Z" />
    </>,
    p
  );

export const TyreIcon = (p: IconProps) =>
  base(
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="M6 6l2.5 2.5" />
      <path d="M15.5 15.5L18 18" />
      <path d="M6 18l2.5-2.5" />
      <path d="M15.5 8.5L18 6" />
    </>,
    p
  );

export const AcIcon = (p: IconProps) =>
  base(
    <>
      <path d="M12 3v18" />
      <path d="M3 12h18" />
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
      <circle cx="12" cy="12" r="1.5" />
    </>,
    p
  );

export const WiperIcon = (p: IconProps) =>
  base(
    <>
      <path d="M5 19l9-13" />
      <path d="M4 19c2-3 4-5 6-6" />
      <circle cx="5" cy="19" r="1" />
    </>,
    p
  );

export const InteriorIcon = (p: IconProps) =>
  base(
    <>
      <path d="M8 4h6a3 3 0 0 1 3 3v8" />
      <path d="M8 4v15" />
      <path d="M8 19h9" />
      <path d="M17 15h-5" />
      <path d="M12 11h5" />
    </>,
    p
  );
