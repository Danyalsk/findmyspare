import type { MetadataRoute } from "next";

const HOST = process.env.NEXT_PUBLIC_APP_URL || "https://findmyspare.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Public marketing + browse routes are indexable; everything behind
        // auth is not, since the actual content is user-scoped and personal.
        allow: ["/", "/product", "/search"],
        disallow: [
          "/admin",
          "/admin/*",
          "/buyer",
          "/buyer/*",
          "/supplier",
          "/supplier/*",
          "/messages",
          "/messages/*",
          "/profile",
          "/api/*",
          "/auth/*",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
        ],
      },
    ],
    host: HOST,
    sitemap: `${HOST}/sitemap.xml`,
  };
}
