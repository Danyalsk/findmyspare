"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Car,
  Zap,
  Wrench,
  Gauge,
  Shield,
  Thermometer,
  CircleDot,
  Disc3,
  Pipette,
  Cog,
  Wind,
  Lightbulb,
  ChevronDown,
  ArrowRight,
  Check,
  ShieldCheck,
  Truck,
  BadgeCheck,
  HelpCircle,
  FileText,
  Home,
  PlusCircle,
  Package,
  User,
  LifeBuoy,
  Activity,
  GitMerge,
  Droplet,
  Settings,
  X,
} from "lucide-react";

/* ── animation variants ─────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/* ── vehicle data (Make → Model → Years) ────────────── */

const vehicleData: Record<string, Record<string, string[]>> = {
  "Maruti Suzuki": {
    "Swift":       ["2024", "2023", "2022", "2021", "2020", "2019"],
    "Baleno":      ["2024", "2023", "2022", "2021", "2020"],
    "Alto":        ["2024", "2023", "2022", "2021", "2020", "2019"],
    "WagonR":      ["2024", "2023", "2022", "2021", "2020"],
    "Brezza":      ["2024", "2023", "2022", "2021"],
    "Dzire":       ["2024", "2023", "2022", "2021", "2020"],
    "Ertiga":      ["2024", "2023", "2022", "2021"],
  },
  "Hyundai": {
    "Creta":       ["2024", "2023", "2022", "2021", "2020"],
    "Venue":       ["2024", "2023", "2022", "2021", "2020"],
    "i20":         ["2024", "2023", "2022", "2021", "2020"],
    "Verna":       ["2024", "2023", "2022", "2021"],
    "Tucson":      ["2024", "2023", "2022"],
    "Grand i10":   ["2024", "2023", "2022", "2021", "2020"],
  },
  "Tata Motors": {
    "Nexon":       ["2024", "2023", "2022", "2021", "2020"],
    "Punch":       ["2024", "2023", "2022"],
    "Harrier":     ["2024", "2023", "2022", "2021"],
    "Safari":      ["2024", "2023", "2022", "2021"],
    "Altroz":      ["2024", "2023", "2022", "2021"],
    "Tiago":       ["2024", "2023", "2022", "2021", "2020"],
  },
  "Mahindra": {
    "Thar":        ["2024", "2023", "2022", "2021", "2020"],
    "XUV700":      ["2024", "2023", "2022"],
    "Scorpio-N":   ["2024", "2023", "2022"],
    "XUV300":      ["2024", "2023", "2022", "2021"],
    "Bolero":      ["2024", "2023", "2022", "2021", "2020"],
  },
  "Toyota": {
    "Innova Crysta": ["2024", "2023", "2022", "2021", "2020"],
    "Fortuner":      ["2024", "2023", "2022", "2021"],
    "Glanza":        ["2024", "2023", "2022"],
    "Urban Cruiser":  ["2024", "2023", "2022"],
  },
  "Honda": {
    "City":        ["2024", "2023", "2022", "2021", "2020"],
    "Amaze":       ["2024", "2023", "2022", "2021"],
    "Elevate":     ["2024", "2023"],
    "WR-V":        ["2023", "2022", "2021", "2020"],
  },
  "Kia": {
    "Seltos":      ["2024", "2023", "2022", "2021", "2020"],
    "Sonet":       ["2024", "2023", "2022", "2021"],
    "Carens":      ["2024", "2023", "2022"],
    "EV6":         ["2024", "2023"],
  },
  "Volkswagen": {
    "Taigun":      ["2024", "2023", "2022"],
    "Virtus":      ["2024", "2023", "2022"],
    "Polo":        ["2023", "2022", "2021", "2020"],
  },
};

const makes = Object.keys(vehicleData);

/* ── brand logos (top manufacturers) ────────────────── */

const brands = [
  { name: "Maruti Suzuki", short: "MS", logo: "https://cdn.simpleicons.org/suzuki" },
  { name: "Hyundai",       short: "HY", logo: "https://cdn.simpleicons.org/hyundai" },
  { name: "Tata Motors",   short: "TM", logo: "https://cdn.simpleicons.org/tata" },
  { name: "Mahindra",      short: "MH", logo: "https://cdn.simpleicons.org/mahindra" },
  { name: "Toyota",        short: "TY", logo: "https://cdn.simpleicons.org/toyota" },
  { name: "Honda",         short: "HN", logo: "https://cdn.simpleicons.org/honda" },
  { name: "Kia",           short: "KI", logo: "https://cdn.simpleicons.org/kia" },
  { name: "Volkswagen",    short: "VW", logo: "https://cdn.simpleicons.org/volkswagen" },
  { name: "Ford",          short: "FD", logo: "https://cdn.simpleicons.org/ford" },
  { name: "BMW",           short: "BM", logo: "https://cdn.simpleicons.org/bmw" },
  { name: "Mercedes-Benz", short: "MB", logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg" },
  { name: "Audi",          short: "AU", logo: "https://cdn.simpleicons.org/audi" },
];

/* ── category data (with gradients & descriptions) ──── */

const categories = [
  { icon: Settings,     label: "Engine",       desc: "Pistons & timing kits",    color: "bg-[#ffe6dd]",  count: "1,240+ Parts" },
  { icon: Disc3,        label: "Brakes",       desc: "Pads, rotors & calipers",  color: "bg-[#ffd9eb]",    count: "840+ Parts" },
  { icon: Activity,     label: "Suspension",   desc: "Shocks & struts",          color: "bg-[#ead9ff]",count: "620+ Parts" },
  { icon: Zap,          label: "Electrical",   desc: "Batteries & alternators",  color: "bg-[#ffeacc]",count: "1,100+ Parts" },
  { icon: GitMerge,     label: "Transmission", desc: "Clutches & gearboxes",     color: "bg-[#e5f1ff]",   count: "450+ Parts" },
  { icon: Car,          label: "Body Panels",  desc: "Doors & fenders",          color: "bg-[#d9fbea]",  count: "2,300+ Parts" },
  { icon: Thermometer,  label: "Cooling",      desc: "Radiators & pumps",        color: "bg-[#dff5ff]",     count: "580+ Parts" },
  { icon: Droplet,      label: "Fuel System",  desc: "Pumps & injectors",        color: "bg-[#ffe2e5]",      count: "920+ Parts" },
  { icon: Wind,         label: "Exhaust",      desc: "Mufflers & converters",    color: "bg-[#f1f5f9]",   count: "310+ Parts" },
  { icon: Lightbulb,    label: "Lighting",     desc: "Headlights & relays",      color: "bg-[#fef3c7]",  count: "1,450+ Parts" },
  { icon: Shield,       label: "Bumpers",      desc: "Covers & guards",          color: "bg-[#fae8ff]",count: "890+ Parts" },
  { icon: LifeBuoy,     label: "Steering",     desc: "Racks & tie rods",         color: "bg-[#ccfbf1]",  count: "530+ Parts" },
];

/* ── product data ───────────────────────────────────── */

const products = [
  {
    brand: "BOSCH",
    name: "Spark Plug Set — Iridium Double Platinum",
    price: "₹1,840",
    fitment: "Maruti Swift 2019–2024",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCu0tPN3fcVmmXXR8OU7FgLd9MEUyIxTrRTALZE7xh2K41bBL3iSLv_8EjMmaizLLVtXly9r8oydo2kRkI8mQlKT8FhItPTiu3efksmQAMSmbV-wfjc03_f19aZzVa-iaW6Mq8-v1UNTPgYhs82uPJdE1p9mqSyugZ7Awx4w1Kbmi2DeRQ8N9Ue5m7f2YhnZB7Rz1rafJJwJL5DE1viJFMej2-e0xHCU6g9KJYQoDyn6Cnh_j28G2PwzJsHdTag17nXvWa931h3J_FN",
  },
  {
    brand: "BREMBO",
    name: "Front Disc Brake Pad Set — Ceramic",
    price: "₹3,120",
    fitment: "Hyundai Creta 2020–2024",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgkk5ELEeGjnpleoMMODWpr6T2HDzAokfSXUib5769eVeUH1UpjbXdKAGcRLNx0_A71TfJA49wL2OwUx6amQ8Mpsu3_tvnqspOAqrVGVvQ-cDYFbJbw-eL9U26Sr_m2LJRQ6XhJQD3-bBKCaLeJbh4uGx8xioBcfl3qQn4S62hNeAGVqYfyTfigV8NbBKdi40IH8f5Aon9g-1nPbfGSlRCs0Q55jGh7BOy9h-gbqQKhb91Df3AoYgHvvcTBQ8kz-stzCXBOCRc-Cw1",
  },
  {
    brand: "DENSO",
    name: "Radiator Assembly — Aluminium Core",
    price: "₹7,900",
    fitment: "Toyota Innova 2021–2024",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkixhiXqbi13Lodfd27tsfPJvc3uJUZRN8M3xKLFpj_MQco18qn8StFkWrU2OV13QNvnc-jXXXkh-tV7Ey2E-30fxB9h6MgrUptacIVXpZBGfASu65nlb2Bs-rEi4Yz--MJ9CZYIZ0lJT74naIljXV8gdTpTq2jkY1fzdRgcMfNu3XVr_2cSMGSYNZSu_1LZBeaX-LLPGHZFJ_4bGeDUJ_YZsNenqQnE701sgzwWidtL-gjERykvvDNPJhJEPhAxt28YFIuqu5cUSu",
  },
  {
    brand: "VALEO",
    name: "Complete Headlamp Assembly — LED",
    price: "₹12,450",
    fitment: "Tata Nexon 2022–2024",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnEB8xQBK0jEallezEcHFFgWNVCUaIrW0jGPa6tBHPaazsFIiiZ2ewlE4ZKQ9nY-__oRzP22uVNRCV61YWzQWLINJKddtFULdOXiqs8lqiteRZg02aiiXyspcOSKusg7CEi2dCoDqxJs9QdGYq-yjCkRfTpUtXfbLSI11zjPJE7Wrb8cThCcHsn-DSL0vioPqC4lPzp0Mdbq1NI22XNt__OfV3Sw7fkU6-OLJf3HLFNLzBT21StU19oZ8FZgFJwvTTvk_zOguGze_u",
  },
];

/* ── reusable dropdown component ────────────────────── */

function SelectDropdown({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex-1 min-w-0">
      <label className="block text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-stone-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between bg-white border border-stone-200 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3.5
            text-xs sm:text-sm font-semibold text-stone-800 text-left
            focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400
            transition-all cursor-pointer shadow-sm shadow-stone-900/5
            disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-stone-50
          `}
        >
          <span className="truncate">{value || `Select ${label}`}</span>
          <ChevronDown className={`w-4 h-4 text-stone-400 pointer-events-none transition-transform duration-200 ${isOpen ? "rotate-180 text-amber-500" : ""}`} />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 w-full mt-2 bg-white border border-stone-100 rounded-xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] max-h-60 overflow-y-auto overflow-x-hidden"
              >
                {options.length === 0 ? (
                  <div className="px-4 py-3 text-sm font-medium text-stone-400 text-center">No options available</div>
                ) : (
                  <div className="py-1.5">
                    {options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          onChange(opt);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm sm:text-base font-medium transition-colors ${
                          value === opt ? "bg-amber-50 text-amber-700" : "text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── floating accent ────────────────────────────────── */

function FloatingAccent({
  className,
  size,
  delay = 0,
  duration = 6,
}: {
  className?: string;
  size: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{ width: size, height: size, filter: "blur(40px)" }}
      animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/* ── page component ─────────────────────────────────── */

export default function HomePage() {
  // — split locator state
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [partInput, setPartInput] = useState("");
  const [condition, setCondition] = useState<"any" | "new" | "used">("any");
  const [searchQuery, setSearchQuery] = useState("");

  // — vehicle selector state
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // — conversational locator state (mobile)
  const [searchFilter, setSearchFilter] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const models = useMemo(
    () => (selectedMake ? Object.keys(vehicleData[selectedMake] || {}) : []),
    [selectedMake]
  );
  const years = useMemo(
    () =>
      selectedMake && selectedModel
        ? vehicleData[selectedMake]?.[selectedModel] || []
        : [],
    [selectedMake, selectedModel]
  );

  // — derived: which field is active on mobile
  const activeField: "make" | "model" | "year" | "parts" = !selectedMake
    ? "make"
    : !selectedModel
    ? "model"
    : !selectedYear
    ? "year"
    : "parts";

  // — filtered lists for type-to-filter
  const filteredMakes = useMemo(
    () => makes.filter(m => m.toLowerCase().includes(searchFilter.toLowerCase())),
    [searchFilter]
  );
  const filteredModels = useMemo(
    () => models.filter(m => m.toLowerCase().includes(searchFilter.toLowerCase())),
    [models, searchFilter]
  );

  const canSearch = selectedMake && selectedModel && selectedYear;

  // — year carousel state (mobile)
  const allYears = useMemo(() => Array.from({ length: 27 }, (_, i) => String(2026 - i)), []);
  const yearScrollRef = useRef<HTMLDivElement>(null);
  const [centeredYear, setCenteredYear] = useState("2024");

  const handleYearScroll = useCallback(() => {
    const el = yearScrollRef.current;
    if (!el) return;
    const containerCenter = el.scrollLeft + el.offsetWidth / 2;
    let closest = allYears[0];
    let minDist = Infinity;
    el.querySelectorAll<HTMLElement>('[data-year]').forEach((child) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(containerCenter - childCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = child.dataset.year || allYears[0];
      }
    });
    setCenteredYear((prev) => {
      if (prev !== closest) {
        // Trigger a subtle haptic "tick" feeling on supported devices
        if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(5);
        }
        return closest;
      }
      return prev;
    });
  }, [allYears]);

  useEffect(() => {
    if (activeField !== "year") return;
    const el = yearScrollRef.current;
    if (!el) return;
    // Center on 2024 on mount
    const target = el.querySelector<HTMLElement>('[data-year="2024"]');
    if (target) {
      el.scrollLeft = target.offsetLeft - el.offsetWidth / 2 + target.offsetWidth / 2;
    }
    handleYearScroll();
  }, [activeField, handleYearScroll]);

  // — year-based car color (premium, muted industrial tones)
  const yearColorObj = useMemo(() => {
    const y = parseInt(centeredYear) || 2024;
    // Smooth transition, but with muted saturation and deep lightness
    const hue = (210 + (2026 - y) * 15) % 360; 
    return {
      stroke: `hsl(${hue}, 45%, 45%)`,
      fill: `hsla(${hue}, 45%, 45%, 0.05)`,
      shadow: `hsla(${hue}, 45%, 45%, 0.2)`
    };
  }, [centeredYear]);

  return (
    <div className="bg-[#fafaf9] text-stone-900 antialiased overflow-x-hidden selection:bg-amber-200">
      <main className="min-h-screen pb-32">
        {/* ─── Hero Section ─────────────────────────── */}
        <section className="relative py-16 px-4 sm:py-24 md:py-32 sm:px-6 overflow-hidden bg-dot-pattern">
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-white via-white/80 to-transparent z-0 pointer-events-none" />
          <FloatingAccent className="bg-amber-400/15 -top-10 -left-10" size="clamp(180px,35vw,350px)" delay={0} duration={10} />
          <FloatingAccent className="bg-orange-300/10 top-32 right-[-5%]" size="clamp(120px,25vw,250px)" delay={2} duration={12} />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm mb-5 sm:mb-6 text-[10px] sm:text-xs font-bold tracking-widest uppercase text-stone-500"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Find My Spare
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-5xl md:text-6xl font-black text-stone-900 tracking-tight mb-4 sm:mb-6 leading-[1.15]"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              Find the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500">
                exact spare part
              </span>{" "}
              <br className="hidden sm:block" />
              for your vehicle.
            </motion.h1>

            <motion.p
              className="text-stone-500 max-w-xl mx-auto mb-8 sm:mb-10 text-sm sm:text-base md:text-lg font-medium"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              Select your vehicle or search by part number. Guaranteed fitment,
              verified quality, delivered fast.
            </motion.p>

            {/* ─── Mobile: Conversational Locator ────────────── */}
            <div className="block md:hidden">
              <motion.div
                className="relative max-w-lg mx-auto z-20"
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
              >
                <div className="bg-gradient-to-br from-white via-white to-amber-50/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_12px_48px_-8px_rgba(120,80,0,0.12),0_4px_16px_-4px_rgba(0,0,0,0.06)] border border-stone-200/60 overflow-hidden flex flex-col relative p-5">
                  
                  {/* Progress Bar */}
                  <div className="flex items-center gap-1 mb-5">
                    {["make", "model", "year", "parts"].map((step, i) => (
                      <div
                        key={step}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                          step === activeField
                            ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                            : (step === "make" && selectedMake) ||
                              (step === "model" && selectedModel) ||
                              (step === "year" && selectedYear) ||
                              (step === "parts" && selectedParts.length > 0)
                            ? "bg-amber-300"
                            : "bg-stone-100"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Locked Selection Chips */}
                  <AnimatePresence>
                    {(selectedMake || selectedModel || selectedYear) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap items-center gap-2 mb-4"
                      >
                        {selectedMake && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            onClick={() => {
                              setSelectedMake(""); setSelectedModel(""); setSelectedYear("");
                              setSearchFilter(""); setShowDropdown(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-sm hover:bg-amber-100 transition-colors"
                          >
                            <Car className="w-3 h-3" />
                            {selectedMake}
                            <X className="w-3 h-3 text-amber-500" />
                          </motion.button>
                        )}
                        {selectedModel && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            onClick={() => {
                              setSelectedModel(""); setSelectedYear("");
                              setSearchFilter(""); setShowDropdown(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold shadow-sm hover:bg-blue-100 transition-colors"
                          >
                            {selectedModel}
                            <X className="w-3 h-3 text-blue-500" />
                          </motion.button>
                        )}
                        {selectedYear && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            onClick={() => {
                              setSelectedYear("");
                              setSearchFilter(""); setShowDropdown(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm hover:bg-emerald-100 transition-colors"
                          >
                            {selectedYear}
                            <X className="w-3 h-3 text-emerald-500" />
                          </motion.button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Active Field Content */}
                  <AnimatePresence mode="wait">
                    {/* ── Make / Model: Searchable dropdown ── */}
                    {(activeField === "make" || activeField === "model") && (
                      <motion.div
                        key={activeField}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      >
                        {/* Step label */}
                        <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                          {activeField === "make" ? "Step 1 — Select Make" : `Step 2 — ${selectedMake} Model`}
                        </p>

                        {/* Search input */}
                        <div className="relative mb-2">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input
                            type="text"
                            value={searchFilter}
                            onChange={(e) => { setSearchFilter(e.target.value); setShowDropdown(true); }}
                            onFocus={() => setShowDropdown(true)}
                            placeholder={activeField === "make" ? "What do you drive?" : `Search ${selectedMake} models...`}
                            className="w-full bg-white border border-stone-200 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-semibold text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all shadow-sm"
                          />
                        </div>

                        {/* Dropdown list */}
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="max-h-[240px] overflow-y-auto rounded-2xl border border-stone-200/80 bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]"
                        >
                          {(activeField === "make" ? filteredMakes : filteredModels).length === 0 ? (
                            <div className="px-4 py-6 text-center text-sm text-stone-400 font-medium">No results found</div>
                          ) : (
                            (activeField === "make" ? filteredMakes : filteredModels).map((item) => (
                              <button
                                key={item}
                                onClick={() => {
                                  if (activeField === "make") {
                                    setSelectedMake(item);
                                    setSelectedModel("");
                                    setSelectedYear("");
                                  } else {
                                    setSelectedModel(item);
                                    setSelectedYear("");
                                  }
                                  setSearchFilter("");
                                  setShowDropdown(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-800 active:bg-amber-100 transition-colors border-b border-stone-50 last:border-b-0"
                              >
                                <span>{item}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
                              </button>
                            ))
                          )}
                        </motion.div>
                      </motion.div>
                    )}

                    {/* ── Year: Horizontal scroll-snap carousel ── */}
                    {activeField === "year" && (
                      <motion.div
                        key="year"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-3">
                          Step 3 — Scroll & Pick Year
                        </p>

                        <div className="relative" style={{ touchAction: 'pan-x' }}>
                          {/* Fade edges */}
                          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10" />
                          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10" />

                          {/* Center indicator — cute car outline & glow */}
                          <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[90px] z-[5] flex items-center justify-center">
                            <svg 
                              viewBox="0 0 90 60" 
                              className="w-[90px] h-[60px] overflow-visible" 
                              style={{ 
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                filter: `drop-shadow(0 4px 10px ${yearColorObj.shadow})`
                              }}
                            >
                              {/* Car body outline */}
                              <path
                                d="M 20 44 L 24 44 A 6 6 0 0 0 36 44 L 54 44 A 6 6 0 0 0 66 44 L 70 44 Q 78 44 78 36 L 78 24 Q 78 16 70 16 L 64 16 L 58 6 Q 56 2 52 2 L 38 2 Q 34 2 32 6 L 26 16 L 20 16 Q 12 16 12 24 L 12 36 Q 12 44 20 44 Z"
                                fill={yearColorObj.fill}
                                stroke={yearColorObj.stroke}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ transition: 'all 0.4s ease' }}
                              />
                              {/* Wheels */}
                              <circle cx="30" cy="44" r="4.5" fill="#ffffff" stroke={yearColorObj.stroke} strokeWidth="2.5" style={{ transition: 'all 0.4s ease' }} />
                              <circle cx="60" cy="44" r="4.5" fill="#ffffff" stroke={yearColorObj.stroke} strokeWidth="2.5" style={{ transition: 'all 0.4s ease' }} />
                            </svg>
                          </div>

                          <div
                            ref={yearScrollRef}
                            onScroll={handleYearScroll}
                            className="flex gap-2 overflow-x-auto py-5 hide-scrollbar"
                            style={{
                              scrollSnapType: 'x mandatory',
                              WebkitOverflowScrolling: 'touch',
                              scrollbarWidth: 'none',
                              msOverflowStyle: 'none',
                              overscrollBehavior: 'contain',
                            }}
                          >
                            {/* Spacer so first item (2026) can reach center */}
                            <div className="flex-shrink-0" style={{ width: 'calc(50% - 32px)' }} />
                            {allYears.map((year) => {
                              const isCentered = year === centeredYear;
                              return (
                                <button
                                  key={year}
                                  data-year={year}
                                  onClick={() => setSelectedYear(year)}
                                  className={`flex-shrink-0 w-[64px] h-[52px] flex items-center justify-center pb-2 rounded-xl text-center transition-all duration-300 ${
                                    isCentered
                                      ? 'text-base font-bold scale-100 tracking-tight'
                                      : 'text-sm font-medium text-stone-400 scale-90 opacity-40'
                                  }`}
                                  style={{
                                    scrollSnapAlign: 'center',
                                    color: isCentered ? yearColorObj.stroke : undefined
                                  }}
                                >
                                  {year}
                                </button>
                              );
                            })}
                            {/* Spacer so last item (2000) can reach center */}
                            <div className="flex-shrink-0" style={{ width: 'calc(50% - 32px)' }} />
                          </div>
                        </div>

                        <p className="text-center text-xs text-stone-400 mt-2 font-medium">
                          ← Scroll to pick • Tap to confirm
                        </p>
                      </motion.div>
                    )}

                    {/* ── Parts: Tag input + Condition + CTA ── */}
                    {activeField === "parts" && (
                      <motion.div
                        key="parts"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                          Step 4 — What Part Do You Need?
                        </p>

                        {/* Part Tags */}
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <AnimatePresence>
                              {selectedParts.map((part) => (
                                <motion.span
                                  key={part}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-sm"
                                >
                                  {part}
                                  <button
                                    onClick={() => setSelectedParts(p => p.filter(x => x !== part))}
                                    className="p-0.5 hover:bg-amber-200/50 rounded-full transition-colors text-amber-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </motion.span>
                              ))}
                            </AnimatePresence>
                          </div>
                          <input
                            type="text"
                            value={partInput}
                            onChange={(e) => setPartInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && partInput.trim()) {
                                e.preventDefault();
                                if (!selectedParts.includes(partInput.trim())) {
                                  setSelectedParts([...selectedParts, partInput.trim()]);
                                }
                                setPartInput("");
                              }
                            }}
                            placeholder={selectedParts.length === 0 ? "e.g. Brake Pads, AC Compressor..." : "+ Add another part"}
                            className="w-full bg-stone-50/50 border-b-2 border-dashed border-stone-200 px-1 py-2.5 text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 transition-colors bg-transparent"
                          />
                        </div>

                        {/* Popular Tags */}
                        <div className="mb-4 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Popular:</span>
                          {["Brake Pads", "Oil Filter", "Clutch Plate", "Headlight"].map(tag => (
                            <button
                              key={tag}
                              onClick={() => {
                                if (!selectedParts.includes(tag)) setSelectedParts(p => [...p, tag]);
                              }}
                              className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-[11px] font-semibold text-stone-600 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 transition-all shadow-sm"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>

                        {/* Condition */}
                        <div className="mb-4">
                          <label className="block text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-2">
                            Condition
                          </label>
                          <div className="flex gap-2">
                            {[
                              { id: "any", label: "Any" },
                              { id: "new", label: "New" },
                              { id: "used", label: "Used" }
                            ].map(opt => (
                              <label key={opt.id} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border cursor-pointer transition-all ${condition === opt.id ? "bg-amber-50 border-amber-300 text-amber-900 shadow-sm" : "bg-white border-stone-200 text-stone-500"}`}>
                                <input type="radio" name="mob-condition" value={opt.id} checked={condition === opt.id} onChange={() => setCondition(opt.id as any)} className="hidden" />
                                <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${condition === opt.id ? "border-amber-500" : "border-stone-300"}`}>
                                  {condition === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                                </div>
                                <span className="text-xs font-bold">{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* CTA */}
                        <motion.button
                          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg ${
                            canSearch || selectedParts.length > 0
                              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-900 shadow-amber-500/25 relative overflow-hidden group border border-amber-400/50"
                              : "bg-stone-200 text-stone-400 cursor-not-allowed border border-transparent"
                          }`}
                          whileTap={canSearch || selectedParts.length > 0 ? { scale: 0.97 } : {}}
                          disabled={(!canSearch && selectedParts.length === 0)}
                        >
                          {(canSearch || selectedParts.length > 0) && (
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent mix-blend-overlay pointer-events-none" />
                          )}
                          <Search className="w-5 h-5 z-10" />
                          <span className="z-10">Find My Part</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </motion.div>
            </div>

            {/* ─── Desktop: Smart Locator (Split Panel) ─────── */}
            <motion.div
              className="relative max-w-4xl mx-auto z-20 hidden md:block"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_60px_-12px_rgba(0,0,0,0.08)] border border-white/50 overflow-hidden flex flex-col relative">
                
                {/* 1. Global Search Bar (Top) */}
                <div className="p-6 border-b border-stone-200/50 bg-stone-50/50">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search parts, vehicles, or part numbers..."
                      className="w-full bg-white border border-stone-200 rounded-2xl pl-12 pr-12 py-4 text-base font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all shadow-sm"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
                      <kbd className="px-2 py-1 text-[10px] font-bold text-stone-500 bg-stone-100 border border-stone-200 rounded-md">⌘/</kbd>
                    </div>
                  </div>
                </div>

                {/* 2. Split Panel (Middle) */}
                <div className="grid grid-cols-2">
                  
                  {/* Left: Vehicle */}
                  <div className="p-8 border-r border-stone-100 bg-gradient-to-br from-white/60 to-transparent">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                        <Car className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-bold tracking-widest uppercase text-stone-500">Your Vehicle</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <SelectDropdown
                        label="Make"
                        value={selectedMake}
                        options={makes}
                        onChange={(v) => {
                          setSelectedMake(v);
                          setSelectedModel("");
                          setSelectedYear("");
                        }}
                      />
                      <SelectDropdown
                        label="Model"
                        value={selectedModel}
                        options={models}
                        onChange={(v) => {
                          setSelectedModel(v);
                          setSelectedYear("");
                        }}
                        disabled={!selectedMake}
                      />
                      <SelectDropdown
                        label="Year"
                        value={selectedYear}
                        options={years}
                        onChange={setSelectedYear}
                        disabled={!selectedModel}
                      />
                    </div>
                  </div>

                  {/* Right: Parts & Condition */}
                  <div className="p-8 bg-gradient-to-bl from-white/60 to-transparent flex flex-col">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-bold tracking-widest uppercase text-stone-500">What You Need</h3>
                    </div>

                    <div className="flex-1 space-y-6">
                      {/* Part Tags Input */}
                      <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <AnimatePresence>
                            {selectedParts.map((part) => (
                              <motion.span
                                key={part}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold shadow-sm"
                              >
                                {part}
                                <button
                                  onClick={() => setSelectedParts(p => p.filter(x => x !== part))}
                                  className="p-0.5 hover:bg-amber-200/50 rounded-full transition-colors text-amber-600 focus:outline-none"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </motion.span>
                            ))}
                          </AnimatePresence>
                        </div>
                        <input
                          type="text"
                          value={partInput}
                          onChange={(e) => setPartInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && partInput.trim()) {
                              e.preventDefault();
                              if (!selectedParts.includes(partInput.trim())) {
                                setSelectedParts([...selectedParts, partInput.trim()]);
                              }
                              setPartInput("");
                            }
                          }}
                          placeholder={selectedParts.length === 0 ? "e.g. Brake Pads, AC Compressor..." : "+ Add another part (press Enter)"}
                          className="w-full bg-stone-50/50 border-b-2 border-dashed border-stone-200 px-1 py-2 text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 transition-colors bg-transparent"
                        />
                      </div>

                      {/* Condition Radio */}
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-3">
                          Condition Required
                        </label>
                        <div className="flex gap-4">
                          {[
                            { id: "any", label: "Any" },
                            { id: "new", label: "New" },
                            { id: "used", label: "Used" }
                          ].map(opt => (
                            <label key={opt.id} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border cursor-pointer transition-all ${condition === opt.id ? "bg-amber-50 border-amber-300 text-amber-900 shadow-sm" : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50"}`}>
                              <input 
                                type="radio" 
                                name="condition" 
                                value={opt.id} 
                                checked={condition === opt.id}
                                onChange={() => setCondition(opt.id as any)}
                                className="hidden"
                              />
                              <div className={`w-3.5 h-3.5 rounded-full border flex flex-shrink-0 items-center justify-center ${condition === opt.id ? "border-amber-500" : "border-stone-300"}`}>
                                {condition === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                              </div>
                              <span className="text-sm font-bold">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Bottom CTA & Quick Links */}
                <div className="p-6 bg-stone-50/80 border-t border-stone-100/80 mt-auto">
                  
                  {/* Popular Tags */}
                  <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1.5">Popular:</span>
                    {["Brake Pads", "Oil Filter", "Clutch Plate", "Headlight"].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => {
                          if (!selectedParts.includes(tag)) setSelectedParts(p => [...p, tag]);
                        }}
                        className="px-3 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-semibold text-stone-600 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 hover:shadow-sm transition-all shadow-sm shadow-stone-900/5"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Find My Part CTA */}
                  <motion.button
                    className={`w-full flex items-center justify-center gap-2 py-5 rounded-xl font-black text-lg tracking-wide transition-all shadow-lg ${
                      canSearch || selectedParts.length > 0
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-900 shadow-amber-500/25 hover:shadow-amber-500/40 relative overflow-hidden group border border-amber-400/50"
                        : "bg-stone-200 text-stone-400 cursor-not-allowed border border-transparent"
                    }`}
                    whileHover={canSearch || selectedParts.length > 0 ? { scale: 1.005 } : {}}
                    whileTap={canSearch || selectedParts.length > 0 ? { scale: 0.99 } : {}}
                    disabled={(!canSearch && selectedParts.length === 0)}
                  >
                    {(canSearch || selectedParts.length > 0) && (
                      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent mix-blend-overlay pointer-events-none" />
                    )}
                    <Search className="w-5 h-5 z-10" />
                    <span className="z-10">Find My Part</span>
                  </motion.button>
                  
                </div>

              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Trust / How it Works Banner ──────────── */}
        <motion.section
          className="max-w-5xl mx-auto px-4 sm:px-6 -mt-2 mb-16 sm:mb-24 relative z-10"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          custom={0}
        >
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {[
              { icon: BadgeCheck, title: "Verified Fitment",  desc: "100% compatibility guaranteed" },
              { icon: ShieldCheck, title: "Authentic Parts",   desc: "OEM & trusted aftermarket" },
              { icon: Truck,       title: "Fast Delivery",     desc: "Shipped within 24 hours" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex flex-col items-center text-center bg-white border border-stone-100 rounded-xl sm:rounded-2xl py-5 sm:py-8 px-3 sm:px-6 shadow-sm"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" strokeWidth={2} />
                  </div>
                  <h3 className="text-[11px] sm:text-sm font-bold text-stone-900 mb-0.5 sm:mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-stone-500 font-medium hidden sm:block">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ─── Browse by Top Brands (Expandable Pills) ── */}
        <motion.section
          className="max-w-5xl mx-auto px-4 sm:px-6 mb-16 sm:mb-24"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6" variants={staggerItem}>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">
              Shop by Brand
            </h2>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-8 sm:gap-x-12 gap-y-10 sm:gap-y-14 w-full max-w-4xl mx-auto px-4 mt-8">
            {brands.map((brand) => (
              <motion.div key={brand.name} variants={staggerItem} className="flex justify-center">
                <button className="flex items-center justify-center rounded-full bg-white border border-stone-100 shadow-sm p-2 sm:p-3 transition-transform duration-300 ease-out hover:scale-110 hover:shadow-lg hover:z-10 hover:border-amber-200 relative group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-stone-50/80 flex items-center justify-center overflow-hidden mix-blend-multiply group-hover:bg-amber-50 transition-colors">
                    <img 
                      src={brand.logo}
                      alt={brand.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.querySelector('span')!.style.display = 'block';
                      }}
                    />
                    <span className="text-sm font-black text-stone-600 hidden">
                      {brand.short}
                    </span>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─── Browse by Category (Kinetic Gradient Cards) ── */}
        <motion.section
          className="max-w-5xl mx-auto px-4 sm:px-6 mb-16 sm:mb-24"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6" variants={staggerItem}>
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">
              Vehicle Systems
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {categories.slice(0, 4).map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.label}>
                  <Link
                    href="/browse"
                    className="group relative rounded-[1.5rem] overflow-hidden flex flex-col p-4 sm:p-6 min-h-[180px] sm:min-h-[210px] bg-white border border-stone-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1.5"
                  >
                    {/* Top Accent Border */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${cat.color}`} />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Icon Container with subtle tint */}
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${cat.color} bg-opacity-20 text-stone-800 mb-auto shadow-sm group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.5} />
                      </div>

                      {/* Label */}
                      <h3 className="mt-5 font-black text-stone-900 text-lg sm:text-xl leading-snug">
                        {cat.label}
                      </h3>

                      {/* Description */}
                      <p className="mt-1 text-xs sm:text-[13px] text-stone-500 font-medium leading-relaxed">
                        {cat.desc}
                      </p>

                      {/* Count Badge */}
                      <div className="mt-3.5 inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-stone-50 border border-stone-100 text-[10px] sm:text-xs font-bold text-stone-500 shadow-inner group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:border-amber-100 transition-colors">
                        {cat.count}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ─── Popular Parts with Fitment ───────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16 sm:mb-24">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            custom={0}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="w-6 sm:w-8 h-[2px] bg-amber-500 rounded-full" />
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-stone-900">
                Popular Parts
              </h2>
            </div>
            <Link
              href="/browse"
              className="group flex w-fit items-center gap-2 text-xs sm:text-sm font-bold text-stone-500 hover:text-stone-900 transition-colors"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {products.map((product) => (
              <motion.div
                key={product.name}
                className="group cursor-pointer bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-stone-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                variants={staggerItem}
              >
                <div className="aspect-square bg-stone-50 rounded-lg sm:rounded-xl mb-3 sm:mb-4 overflow-hidden relative">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={product.img}
                    alt={product.name}
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <p className="text-[9px] sm:text-[10px] font-extrabold text-amber-600 uppercase tracking-widest">
                    {product.brand}
                  </p>
                  <h3 className="text-[11px] sm:text-sm font-bold text-stone-800 leading-snug line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Fitment Tag — the killer feature */}
                  <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1 w-fit">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" strokeWidth={3} />
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 truncate max-w-[120px] sm:max-w-none">
                      {product.fitment}
                    </span>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <p className="text-base sm:text-lg font-black text-stone-900">
                      {product.price}
                    </p>
                    <div className="w-7 h-7 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center group-hover:bg-amber-100 group-hover:border-amber-200 transition-colors">
                      <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ─── CTA Section ──────────────────────────── */}
        <motion.section
          className="max-w-4xl mx-auto mx-4 sm:mx-auto sm:px-0 text-center py-14 sm:py-20 bg-white rounded-2xl sm:rounded-3xl mb-8 sm:mb-16 border border-stone-100 shadow-lg relative overflow-hidden w-[calc(100%-2rem)] sm:w-full"
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-orange-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 px-6">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-stone-50 border border-stone-100 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6"
            >
              <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500" strokeWidth={2} />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-3 sm:mb-4 text-stone-900 leading-tight">
              Can't find your part?
            </h2>
            <p className="text-stone-500 mb-6 sm:mb-8 text-sm sm:text-base font-medium max-w-md mx-auto">
              Submit a request and our sourcing team will locate it from our
              network of verified suppliers nationwide.
            </p>
            <motion.button
              className="group relative overflow-hidden bg-stone-900 text-white px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl font-bold text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 mx-auto transition-transform"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="relative z-10">Submit Part Request</span>
              <div className="absolute inset-0 bg-stone-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </motion.button>
          </div>
        </motion.section>
      </main>

      {/* ─── Bottom Nav (Mobile) ────────────────────── */}
      <motion.nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200/50 bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex justify-between items-end pb-5 pt-2.5 px-6"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.8, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <button className="flex flex-col items-center gap-1 w-12 text-amber-600">
          <Home className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-bold text-[9px] tracking-wider uppercase">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 w-12 text-stone-400">
          <Search className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-bold text-[9px] tracking-wider uppercase">Search</span>
        </button>
        <button className="flex flex-col items-center -mt-7 relative z-10 outline-none">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 shadow-[0_4px_16px_rgba(245,158,11,0.45)] flex items-center justify-center text-white border-4 border-[#fafaf9] active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6" strokeWidth={2.5} />
          </div>
        </button>
        <button className="flex flex-col items-center gap-1 w-12 text-stone-400">
          <Package className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-bold text-[9px] tracking-wider uppercase">Orders</span>
        </button>
        <button className="flex flex-col items-center gap-1 w-12 text-stone-400">
          <User className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-bold text-[9px] tracking-wider uppercase">Profile</span>
        </button>
      </motion.nav>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
