import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { PROJECTS, CONTACT } from "./lib/data";
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

const SITE_URL = "https://ashutoshjoshi1.github.io";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ashutosh Joshi — AI/ML Engineer | Signal from Noise",
  description:
    "Ashutosh Joshi is an AI/ML systems engineer building the data backbone of NASA's Pandora atmospheric network — plus LLM agents, RAG platforms and neural systems. His portfolio trains a neural network live in your browser. Based in Columbia, MD.",
  keywords: [
    "Ashutosh Joshi",
    "AI/ML Engineer",
    "Machine Learning Engineer",
    "AI Engineer",
    "Software Engineer",
    "NASA",
    "Pandora spectrometer",
    "SciGlob",
    "Machine Learning",
    "Neural Networks",
    "LLM",
    "LLM Agents",
    "RAG",
    "Multi-Agent Systems",
    "MLOps",
    "PyTorch",
    "C++",
    "Python",
    "TypeScript",
    "React",
    "Next.js",
    "FastAPI",
    "Portfolio",
    "Columbia MD",
  ],
  alternates: { canonical: "/" },
  category: "technology",
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
      "AI/ML systems engineer for NASA's Pandora atmospheric network. LLM agents, RAG platforms, neural systems — one trains live on this page.",
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
      "AI/ML systems engineer for NASA's Pandora atmospheric network. LLM agents, RAG platforms, neural systems — one trains live on this page.",
    images: ["/images/og-aj.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#06070b",
  initialScale: 1,
  width: "device-width",
};

/* structured data: Person + WebSite + the project catalog, for rich results */
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Ashutosh Joshi",
      url: SITE_URL,
      email: `mailto:${CONTACT.email}`,
      jobTitle: "AI/ML Software Engineer",
      worksFor: {
        "@type": "Organization",
        name: "SciGlob Instruments & Services",
        description: "Scientific instrumentation supporting NASA's Pandora atmospheric network",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Columbia",
        addressRegion: "MD",
        addressCountry: "US",
      },
      sameAs: [CONTACT.github, CONTACT.linkedin],
      knowsAbout: [
        "Software Engineering",
        "Artificial Intelligence",
        "Machine Learning",
        "Neural Networks",
        "LLM Systems",
        "Multi-Agent Systems",
        "Retrieval-Augmented Generation",
        "MLOps",
        "C++",
        "Python",
        "TypeScript",
        "Distributed Systems",
        "Atmospheric Instrumentation",
      ],
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "University of Maryland, Baltimore County",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Ashutosh Joshi — Signal from Noise",
      description:
        "Portfolio of Ashutosh Joshi: software engineer for NASA's Pandora atmospheric network and builder of AI systems, agents and products.",
      author: { "@id": `${SITE_URL}/#person` },
      inLanguage: "en-US",
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#projects`,
      name: "Selected Work",
      itemListElement: PROJECTS.map((project, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SoftwareSourceCode",
          name: project.name,
          description: project.description,
          codeRepository: project.link,
          programmingLanguage: project.stack[0],
          author: { "@id": `${SITE_URL}/#person` },
          dateCreated: project.year,
        },
      })),
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </body>
    </html>
  );
}
