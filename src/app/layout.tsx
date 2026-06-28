import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kalakriti Academy — Learn Art & Craft Online",
  description:
    "Discover creative courses in painting, digital art, traditional crafts, photography, and more. Learn from expert instructors at Kalakriti Academy.",
  keywords: [
    "Kalakriti Academy",
    "online art courses",
    "digital art",
    "painting",
    "traditional art",
    "craft courses",
    "creative learning",
  ],
  authors: [{ name: "Kalakriti Academy" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Kalakriti Academy — Learn Art & Craft Online",
    description:
      "Discover creative courses in painting, digital art, traditional crafts, photography, and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}