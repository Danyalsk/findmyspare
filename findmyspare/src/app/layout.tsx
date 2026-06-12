import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ToastContainer } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    "India's trusted auto-parts marketplace. Verified suppliers, live quotes, direct contact.",
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
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Instrument Serif — loaded externally since next/font/google
            doesn't support italic-only fonts well */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <ToastContainer />
      </body>
    </html>
  );
}
