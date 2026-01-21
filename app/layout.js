import './globals.css'
import { DarkModeProvider } from './context/DarkModeContext'
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://ashutoshjoshi1.github.io'),
  title: 'Ashutosh Joshi | Software Engineer',
  description: 'Software Engineer specializing in full-stack development, cloud architecture, and AI. Building the future with elegant code.',
  keywords: ['Software Engineer', 'Full Stack Developer', 'Python', 'React', 'Cloud Computing', 'AI', 'Machine Learning'],
  authors: [{ name: 'Ashutosh Joshi' }],
  openGraph: {
    title: 'Ashutosh Joshi | Software Engineer',
    description: 'Software Engineer specializing in full-stack development, cloud architecture, and AI.',
    type: 'website',
    images: ['/images/ashu.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ashutosh Joshi | Software Engineer',
    description: 'Software Engineer specializing in full-stack development, cloud architecture, and AI.',
  },
  icons: {
    icon: '/images/favicon.jpeg',
    apple: '/images/favicon.jpeg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.className} scroll-smooth`}>
      <head>
        <link rel="icon" href="/images/favicon.jpeg" type="image/jpeg" />
        <meta name="theme-color" content="#030712" />
      </head>
      <body className="antialiased">
        <DarkModeProvider>
          {children}
        </DarkModeProvider>
      </body>
    </html>
  )
}
