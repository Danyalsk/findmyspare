import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story · FindMySpare",
  description:
    "Discover how FindMySpare is transforming India's auto-parts aftermarket. Verified suppliers, live quotes, direct contact — built for every mechanic and car owner in India.",
  openGraph: {
    title: "Our Story · FindMySpare",
    description:
      "Discover how FindMySpare is transforming India's auto-parts aftermarket.",
    url: "https://findmyspare.com/story",
    siteName: "FindMySpare",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Story · FindMySpare",
    description:
      "Discover how FindMySpare is transforming India's auto-parts aftermarket.",
  },
};

export default function StoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
