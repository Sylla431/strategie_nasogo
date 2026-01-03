import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-primary",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VB Sniper Académie - Formations et Coaching Trading",
  description:
    "VB Sniper Académie : Formations et coaching en trading depuis 2022. Accompagnement personnalisé pour traders particuliers avec stratégies éprouvées et résultats garantis.",
  metadataBase: new URL("https://vbsniperacademie.com"),
  openGraph: {
    title:
      "VB Sniper Académie - Formations et Coaching Trading",
    description:
      "VB Sniper Académie : Formations et coaching en trading depuis 2022. Accompagnement personnalisé pour traders particuliers avec stratégies éprouvées et résultats garantis.",
    images: [
      "/images/Instructeur.jpg",
    ],
    url: "https://vbsniperacademie.com",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "VB Sniper Académie - Formations et Coaching Trading",
    description:
      "VB Sniper Académie : Formations et coaching en trading depuis 2022. Accompagnement personnalisé pour traders particuliers avec stratégies éprouvées et résultats garantis.",
    images: [
      "/images/Instructeur.jpg",
    ],
  },
  icons: {
    icon: "/logo/logo.png",
    shortcut: "/logo/logo.png",
    apple: "/logo/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${poppins.variable} antialiased bg-base`}>
        {children}
      </body>
    </html>
  );
}
