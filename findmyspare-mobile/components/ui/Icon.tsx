import React from "react";
import type { IconProps, IconWeight } from "phosphor-react-native";
import {
  House, MagnifyingGlass, Plus, PlusCircle, CaretLeft, CaretRight, CaretDown,
  X, XCircle, ChatCircle, ChatsCircle, Bell, BellSlash, User, UserCircle, UsersThree,
  Package, Wrench, MapPin, Engine, Disc, CarProfile, Lightning, GearSix, Car,
  Snowflake, Drop, Cloud, Lightbulb, NavigationArrow, Tag, Star, ShieldCheck, Shield,
  ChartBar, Gauge, Trash, Camera, UploadSimple, Paperclip, FileText, Hourglass,
  WarningCircle, CheckCircle, Sparkle, WhatsappLogo, SlidersHorizontal, Broadcast,
  ArrowUp, ArrowRight, GridFour, Question, Envelope, Lock, PencilSimple, Play, Pause,
  Clock, ArrowsClockwise, ShoppingCart, Storefront,
} from "phosphor-react-native";
import { C } from "@/lib/theme";

type Cmp = React.ComponentType<IconProps>;

// Semantic name → Phosphor component. Names kept Ionicons-ish so the swap is 1:1.
const MAP: Record<string, Cmp> = {
  add: Plus, "add-circle": PlusCircle, "add-circle-outline": PlusCircle,
  "alert-circle": WarningCircle, "alert-circle-outline": WarningCircle,
  "arrow-up": ArrowUp, "arrow-forward": ArrowRight,
  "camera-outline": Camera, camera: Camera,
  chatbubble: ChatCircle, "chatbubble-outline": ChatCircle, "chatbubbles-outline": ChatsCircle,
  "checkmark-circle": CheckCircle, "checkmark-circle-outline": CheckCircle,
  "chevron-back": CaretLeft, "chevron-down": CaretDown, "chevron-forward": CaretRight,
  close: X, "close-circle-outline": XCircle,
  "cloud-upload-outline": UploadSimple, "construct-outline": Wrench,
  "create-outline": PencilSimple,
  cube: Package, "cube-outline": Package,
  "disc-outline": Disc, "document-attach-outline": Paperclip, "document-text-outline": FileText,
  "flash-outline": Lightning, "grid-outline": GridFour, "help-circle-outline": Question,
  home: House, "hourglass-outline": Hourglass,
  location: MapPin, "location-outline": MapPin, "lock-closed-outline": Lock,
  "logo-whatsapp": WhatsappLogo, "mail-outline": Envelope,
  "navigate-outline": NavigationArrow,
  notifications: Bell, "notifications-outline": Bell, "notifications-off-outline": BellSlash,
  "options-outline": SlidersHorizontal,
  "pause-outline": Pause, people: UsersThree, "people-outline": UsersThree,
  person: User, "person-outline": User, "person-circle-outline": UserCircle,
  "play-outline": Play, "pricetag-outline": Tag, pricetag: Tag,
  "radio-outline": Broadcast, search: MagnifyingGlass,
  "shield-checkmark": ShieldCheck, "shield-checkmark-outline": ShieldCheck, "shield-outline": Shield,
  "snow-outline": Snowflake, sparkles: Sparkle, "sparkles-outline": Sparkle,
  speedometer: Gauge, "star-outline": Star, "stats-chart": ChartBar,
  "storefront-outline": Storefront, "sync-outline": ArrowsClockwise,
  "time-outline": Clock, "trash-outline": Trash, "water-outline": Drop,
  "cloud-outline": Cloud, "bulb-outline": Lightbulb, "cog-outline": Engine,
  "settings-outline": GearSix, "car-outline": Car, "car-sport-outline": CarProfile,
  "cart-outline": ShoppingCart,
};

export type IconName = keyof typeof MAP | string;

export interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
  weight?: IconWeight;
}

/** App icon — Phosphor, duotone by default for that premium two-tone feel. */
export function Icon({ name, size = 22, color = C.ink, weight = "duotone" }: AppIconProps) {
  const Cmp = MAP[name] || Tag;
  return <Cmp size={size} color={color} weight={weight} />;
}
