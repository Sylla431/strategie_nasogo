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
    "Apprenez 2 stratégies clés en 7 jours pour maîtriser le trading sur indices. Offre limitée à 19 700 FCFA avec garantie satisfait ou remboursé.",
  openGraph: {
    title:
      "Stratégie Nasongon - VB Sniper",
    description:
      "Apprenez 2 stratégies clés en 7 jours pour maîtriser le trading sur indices synthétiques, avec accès immédiat et garantie 48h.",
    images: [
      "#",
    ],
    url: "/",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Stratégie Nasongon - VB Sniper",
    description:
      "Apprenez 2 stratégies clés en 7 jours pour maîtriser le trading sur indices synthétiques.",
    images: [
      "https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_2ogbw3q722u8/idayBXggm6IdU0nYoAVh0wV8xk3KoSD88BRRbfWz.png",
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
