import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Devanagari, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ToastContainer } from "@/components/ui/Toast";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

// Hindi fallback so Devanagari renders at matching weight (brand/GUIDELINES.md).
const deva = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["500", "700"],
  variable: "--font-deva",
  display: "swap",
});


const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FindMySpare",
    template: `%s | FindMySpare`,
  },
  description:
    "Find the right spare part for your car or bike from verified sellers. Compare quotes, get it delivered, and keep a verified service record.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://findmyspare.com"
  ),
  openGraph: {
    title: "FindMySpare · Auto parts marketplace",
    description:
      "India's trusted auto-parts marketplace. Verified suppliers, live quotes, direct contact.",
    url: "https://findmyspare.com",
    siteName: "FindMySpare",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FindMySpare · Auto parts marketplace",
    description:
      "India's trusted auto-parts marketplace. Verified suppliers, live quotes, direct contact.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      data-density="comfortable"
      className={`${jakarta.variable} ${deva.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#E5461B" />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <ToastContainer />
      </body>
    </html>
  );
}
