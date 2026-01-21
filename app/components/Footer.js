'use client'

import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { useDarkMode } from '../context/DarkModeContext'

export default function Footer() {
  const { isDarkMode } = useDarkMode()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative py-12 px-4 border-t border-white/5">
      {/* Background gradient */}
      <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-t from-green-500/5 to-transparent' : 'bg-gradient-to-t from-cyan-500/5 to-transparent'}`} />
      
      <div className="relative max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-green-500' : 'bg-cyan-500'}`} />
              <span className="font-bold text-white text-lg tracking-tight">Ashutosh Joshi</span>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} All rights reserved
            </p>
          </div>
          
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/ashutoshjoshi1"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-xl glass border flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'border-green-500/20 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] text-gray-400 hover:text-green-400' 
                  : 'border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] text-gray-400 hover:text-cyan-400'
              }`}
              aria-label="GitHub"
            >
              <FaGithub className="text-lg" />
            </a>
            <a
              href="https://www.linkedin.com/in/ashutosh--joshi/"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-xl glass border flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'border-green-500/20 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] text-gray-400 hover:text-green-400' 
                  : 'border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] text-gray-400 hover:text-cyan-400'
              }`}
              aria-label="LinkedIn"
            >
              <FaLinkedin className="text-lg" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
