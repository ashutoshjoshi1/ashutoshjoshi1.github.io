import type { Metadata, Viewport } from "next";
import localFont from 'next/font/local';
import "./globals.css";

const soriaFont = localFont({
  src: "../public/soria-font.ttf",
  variable: "--font-soria",
});

const vercettiFont = localFont({
  src: "../public/Vercetti-Regular.woff",
  variable: "--font-vercetti",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ashutoshjoshi1.github.io"),
  title: "Ashutosh Joshi | Software Engineer",
  description: "Software engineer building full-stack, cloud, and AI systems with immersive 3D web experiences.",
  keywords: "Ashutosh Joshi, Software Engineer, Full Stack Developer, React, Next.js, Three.js, Python, Cloud, AI, Portfolio",
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
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Ashutosh Joshi | Software Engineer",
    description: "Full-stack, cloud, and AI engineer with a 3D portfolio experience.",
    url: "https://ashutoshjoshi1.github.io",
    siteName: "Ashutosh Joshi Portfolio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/og-aj.png",
        width: 1200,
        height: 630,
        alt: "Ashutosh Joshi portfolio preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ashutosh Joshi | Software Engineer",
    description: "Full-stack, cloud, and AI engineer with a 3D portfolio experience.",
    images: ["/images/og-aj.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#050510",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overscroll-y-none">
      <body
        className={`${soriaFont.variable} ${vercettiFont.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
