import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

import { LenisProvider } from "@/components/providers/LenisProvider";
import { SoundProvider } from "@/components/providers/SoundProvider";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ToasterProvider } from "@/components/ui/toaster";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://saffronflame.ae"),
  title: {
    default: "Saffron Flame — Asian Fusion & Steakhouse · Dubai Marina",
    template: "%s · Saffron Flame",
  },
  description:
    "A luxury dining experience in Dubai Marina. Wood-fire steakhouse meets refined Asian fusion. Reserve your table.",
  keywords: [
    "Dubai Marina restaurant",
    "luxury steakhouse Dubai",
    "Asian fusion Dubai",
    "fine dining Dubai",
    "Saffron Flame",
  ],
  openGraph: {
    type: "website",
    title: "Saffron Flame · Where Fire Meets Flavor",
    description: "Cinematic luxury dining in Dubai Marina — wood fire, imported steaks, refined Asian fusion.",
    url: "https://saffronflame.ae",
    siteName: "Saffron Flame",
    locale: "en_AE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saffron Flame · Dubai Marina",
    description: "Where Fire Meets Flavor — luxury Asian fusion & steakhouse.",
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0908",
  width: "device-width",
  initialScale: 1,
};

// JSON-LD schema for a restaurant — boosts AEO/GEO surfaces.
const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Saffron Flame",
  image: "https://saffronflame.ae/og.jpg",
  description:
    "Premium Asian Fusion & Steakhouse with wood-fire cooking, imported steaks, and a refined cocktail program in Dubai Marina.",
  servesCuisine: ["Asian Fusion", "Steakhouse", "Japanese", "Pan-Asian"],
  priceRange: "$$$$",
  acceptsReservations: "True",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Marina Walk, Tower 7",
    addressLocality: "Dubai Marina",
    addressRegion: "Dubai",
    addressCountry: "AE",
  },
  geo: { "@type": "GeoCoordinates", latitude: 25.0805, longitude: 55.1403 },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "18:00",
      closes: "00:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Friday", "Saturday", "Sunday"],
      opens: "17:00",
      closes: "01:30",
    },
  ],
  url: "https://saffronflame.ae",
  telephone: "+971-4-000-0000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
      </head>
      <body>
        <LoadingScreen />
        <CustomCursor />
        <SoundProvider>
          <LenisProvider>
            <ToasterProvider>{children}</ToasterProvider>
          </LenisProvider>
        </SoundProvider>
      </body>
    </html>
  );
}
