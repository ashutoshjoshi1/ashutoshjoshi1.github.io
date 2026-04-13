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
  },
  twitter: {
    card: "summary_large_image",
    title: "Ashutosh Joshi | Software Engineer",
    description: "Full-stack, cloud, and AI engineer with a 3D portfolio experience.",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
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
