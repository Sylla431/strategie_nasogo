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
  title: "Stratégie Nasongon - VB Sniper",
  description:
    "Stratégie Nasongon : 5 vidéos + coaching, garantie 48h, objectif 100$ par jour avec 20$ de capital sur VB Sniper Académie.",
  metadataBase: new URL("https://vbsniperacademie.com"),
  openGraph: {
    title:
      "Stratégie Nasongon - VB Sniper",
    description:
      "Stratégie Nasongon : 5 vidéos + coaching, garantie 48h, objectif 100$ par jour avec 20$ de capital sur VB Sniper Académie.",
    images: [
      "/images/instr2.jpg",
    ],
    url: "https://vbsniperacademie.com",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Stratégie Nasongon - VB Sniper",
    description:
      "Stratégie Nasongon : 5 vidéos + coaching, garantie 48h, objectif 100$ par jour avec 20$ de capital sur VB Sniper Académie.",
    images: [
      "/images/instr2.jpg",
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
