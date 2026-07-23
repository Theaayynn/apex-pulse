import type { Metadata } from "next";
import "./globals.css";
import AuroraBackground from "@/components/AuroraBackground";
import CursorGlow from "@/components/CursorGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Apex Pulse — Premium software, built for scale",
    template: "%s | Apex Pulse",
  },
  description:
    "Apex Pulse designs and ships premium web products for teams that refuse to ship anything average.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Apex Pulse",
    description: "Premium software, built for scale.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex Pulse",
    description: "Premium software, built for scale.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuroraBackground />
        <CursorGlow />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
