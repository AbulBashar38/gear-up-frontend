import type { Metadata } from "next";
import { Barlow_Condensed, Manrope, Space_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800", "900"],
  variable: "--font-barlow-condensed",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: {
    default: "GearUp — Own the weekend, not the gear",
    template: "%s | GearUp",
  },
  description:
    "Request sports and outdoor gear by the day. Providers confirm availability, then Stripe handles payment securely.",
  applicationName: "GearUp",
  icons: {
    icon: "/gearup-mark.svg",
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
      className={`${manrope.variable} ${barlowCondensed.variable} ${spaceMono.variable} h-full`}
    >
      <body className="min-h-full">
        {children}
        <Toaster
          theme="light"
          position="top-right"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
