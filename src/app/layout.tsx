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
  title: "Kalakriti Academy — Learn Art, Trading, Marketing & Digital Skills Online",
  description:
    "India's #1 online learning platform for art, craft, stock market trading, digital marketing, freelancing, and productivity tools. 25,000+ students, 100+ courses.",
  keywords: [
    "Kalakriti Academy",
    "online courses India",
    "stock market trading",
    "digital marketing course",
    "make money online",
    "freelancing course",
    "art courses",
    "painting",
    "digital art",
    "options trading",
    "Canva design",
    "Excel course",
    "Notion course",
    "YouTube growth",
    "SEO course",
  ],
  authors: [{ name: "Kalakriti Academy" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Kalakriti Academy — Learn Art, Trading, Marketing & Digital Skills Online",
    description:
      "India's #1 online learning platform. Master art, trading, marketing, and digital skills from expert instructors.",
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