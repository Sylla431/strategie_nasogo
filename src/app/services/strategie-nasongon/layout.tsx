import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stratégie Nasongon - VB Sniper Académie",
  description:
    "Stratégie Nasongon : 5 vidéos + coaching, garantie 48h, objectif 100$ par jour avec 20$ de capital sur VB Sniper Académie.",
  openGraph: {
    title: "Stratégie Nasongon - VB Sniper Académie",
    description:
      "Stratégie Nasongon : 5 vidéos + coaching, garantie 48h, objectif 100$ par jour avec 20$ de capital sur VB Sniper Académie.",
    images: ["/images/3.jpg"],
    url: "https://vbsniperacademie.com/services/strategie-nasongon",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stratégie Nasongon - VB Sniper Académie",
    description:
      "Stratégie Nasongon : 5 vidéos + coaching, garantie 48h, objectif 100$ par jour avec 20$ de capital sur VB Sniper Académie.",
    images: ["/images/3.jpg"],
  },
};

export default function StrategieNasongonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

