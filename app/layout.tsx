import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const displayFont = localFont({
  src: [
    { path: "../public/fonts/InstrumentSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/InstrumentSerif-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
});

const sansFont = localFont({
  src: "../public/fonts/SpaceGrotesk-Variable.woff2",
  variable: "--font-sans",
  weight: "300 700",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ashutoshjoshi1.github.io"),
  title: "Ashutosh Joshi — Signal from Noise",
  description:
    "Software engineer building the data backbone of NASA's Pandora atmospheric network — and AI systems, agents, and products after dark.",
  keywords:
    "Ashutosh Joshi, Software Engineer, AI Engineer, NASA, Pandora, C++, Python, React, Next.js, LLM, RAG, Multi-Agent, Portfolio",
  authors: [{ name: "Ashutosh Joshi" }],
  creator: "Ashutosh Joshi",
  publisher: "Ashutosh Joshi",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Ashutosh Joshi — Signal from Noise",
    description:
      "Software engineer for NASA's Pandora atmospheric network. AI systems, agents, and products after dark.",
    url: "https://ashutoshjoshi1.github.io",
    siteName: "Ashutosh Joshi Portfolio",
    locale: "en_US",
    type: "website",
    images: [
      { url: "/images/og-aj.png", width: 1200, height: 630, alt: "Ashutosh Joshi portfolio preview" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ashutosh Joshi — Signal from Noise",
    description:
      "Software engineer for NASA's Pandora atmospheric network. AI systems, agents, and products after dark.",
    images: ["/images/og-aj.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0a08",
  initialScale: 1,
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overscroll-y-none">
      <body className={`${displayFont.variable} ${sansFont.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
