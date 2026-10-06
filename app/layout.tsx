import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { PROJECTS, CONTACT, EDUCATION } from "./lib/data";
import "./globals.css";

/* Hanken Grotesk (OFL) stands in for scale.com's commercial Aeonik Pro —
   same width and color at regular weight. With an Aeonik web licence,
   swap the file here and nothing else needs to change. */
const sansFont = localFont({
  src: "../public/fonts/HankenGrotesk-Variable.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});

const monoFont = localFont({
  src: [
    { path: "../public/fonts/DMMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/DMMono-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = "https://ashutoshjoshi1.github.io";
const DESCRIPTION =
  "Ashutosh Joshi is a software engineer for AI/ML systems at SciGlob (NASA). He architected a production LLM inference platform on vLLM (+87% throughput per GPU, −60% serving cost) and builds machine learning for 300+ NASA Pandora instruments. Based in Baltimore, MD.";
const SHORT_DESCRIPTION =
  "Software engineer, AI/ML systems. LLM inference on vLLM (+87% throughput per GPU, −60% serving cost), GPU orchestration in Go and Kubernetes, and production ML for NASA.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ashutosh Joshi — LLM Inference & AI/ML Systems Engineer",
  description: DESCRIPTION,
  keywords: [
    "Ashutosh Joshi",
    "AI/ML Systems Engineer",
    "LLM Inference Engineer",
    "Machine Learning Engineer",
    "Software Engineer",
    "vLLM",
    "SGLang",
    "TensorRT-LLM",
    "LLM serving",
    "GPU",
    "CUDA",
    "Kubernetes",
    "Go",
    "Quantization",
    "Speculative decoding",
    "NASA",
    "SciGlob",
    "Pandora spectrometer",
    "PyTorch",
    "RAG",
    "C++",
    "Python",
    "Baltimore MD",
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
    title: "Ashutosh Joshi — LLM Inference & AI/ML Systems",
    description: SHORT_DESCRIPTION,
    url: SITE_URL,
    siteName: "Ashutosh Joshi",
    locale: "en_US",
    type: "website",
    images: [
      { url: "/images/og-aj.png", width: 1200, height: 630, alt: "Ashutosh Joshi — LLM inference and AI/ML systems" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ashutosh Joshi — LLM Inference & AI/ML Systems",
    description: SHORT_DESCRIPTION,
    images: ["/images/og-aj.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
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
      jobTitle: "Software Engineer — AI/ML Systems",
      worksFor: {
        "@type": "Organization",
        name: "SciGlob Instruments & Services",
        description: "Scientific instrumentation supporting NASA's Pandora atmospheric network",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Baltimore",
        addressRegion: "MD",
        addressCountry: "US",
      },
      sameAs: [CONTACT.github, CONTACT.linkedin],
      knowsAbout: [
        "LLM Inference",
        "vLLM",
        "SGLang",
        "TensorRT-LLM",
        "GPU Systems",
        "CUDA",
        "Kubernetes",
        "Quantization",
        "Speculative Decoding",
        "Machine Learning",
        "Computer Vision",
        "Retrieval-Augmented Generation",
        "Python",
        "C++",
        "Go",
        "TypeScript",
      ],
      alumniOf: EDUCATION.map((degree) => ({ "@type": "CollegeOrUniversity", name: degree.school })),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Ashutosh Joshi",
      description: SHORT_DESCRIPTION,
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
      <body className={`${sansFont.variable} ${monoFont.variable} antialiased`}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </body>
    </html>
  );
}
