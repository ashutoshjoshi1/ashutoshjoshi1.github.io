'use client'

import { useState, useEffect } from 'react'
import Switch from 'react-switch'
import Image from 'next/image'
import WorkExperience from './components/WorkExperience'
import Technologies from './components/Technologies'
import Projects from './components/Projects'
import Footer from './components/Footer'
import AboutMeAnimation from './components/AboutMeAnimation'
import PremiumPortraitReveal from './components/PremiumPortraitReveal'
import { useDarkMode } from './context/DarkModeContext'
import { TypeAnimation } from 'react-type-animation'

export default function Home() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [isHRMode, setIsHRMode] = useState(!isDarkMode)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setIsHRMode(!isDarkMode)
  }, [isDarkMode])

  const handleModeChange = (checked) => {
    setIsHRMode(checked)
    if (checked !== !isDarkMode) {
      toggleDarkMode()
    }
  }

  if (!mounted) return null

  return (
    <main className="relative min-h-screen bg-[#030712] overflow-hidden">
      {/* Animated Background */}
      <AboutMeAnimation />
      
      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 grid-pattern pointer-events-none z-0" />
      
      {/* Gradient Orbs */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 dark:bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10">
        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="glass-strong rounded-2xl px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse-glow ${isDarkMode ? 'bg-green-500' : 'bg-cyan-500'}`} />
                <span className="font-bold text-white text-lg tracking-tight">AJ</span>
              </div>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-8">
                {['About', 'Experience', 'Skills', 'Projects', 'Contact'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className={`text-sm font-medium text-gray-400 hover:text-white transition-colors relative group`}
                  >
                    {item}
                    <span className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${isDarkMode ? 'bg-green-500' : 'bg-cyan-500'}`} />
                  </a>
                ))}
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium transition-colors ${!isHRMode ? 'text-cyan-400 dark:text-green-400' : 'text-gray-500'}`}>
                  DEV
                </span>
                <Switch
                  onChange={handleModeChange}
                  checked={isHRMode}
                  onColor={isDarkMode ? "#22c55e" : "#06b6d4"}
                  offColor={isDarkMode ? "#22c55e" : "#06b6d4"}
                  height={20}
                  width={40}
                  uncheckedIcon={false}
                  checkedIcon={false}
                  handleDiameter={16}
                  className="react-switch"
                />
                <span className={`text-xs font-medium transition-colors ${isHRMode ? 'text-cyan-400 dark:text-green-400' : 'text-gray-500'}`}>
                  HR
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="min-h-[92vh] md:min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            {/* Status Badge */}
            <a
              href="https://calendly.com/ashutxsh-jxshi/new-meeting"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-green-500' : 'bg-cyan-500'}`} />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Available for opportunities</span>
              <svg className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-green-400' : 'text-cyan-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Interactive Portrait */}
            <div className="mb-10 flex justify-center">
              <PremiumPortraitReveal
                // Front/top portrait (replace this path if needed)
                warriorSrc="/images/warrior.jpg"
                // Back/reveal portrait (replace this path if needed)
                revealSrc="/images/ashu_warrior.jpg"
                warriorAlt="Warrior portrait"
                revealAlt="Ashutosh portrait revealed on hover"
                isDarkMode={isDarkMode}
                imagePosition="50% 50%"
              />
            </div>

            {/* Main Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
              <span className="text-white">Hi, I&apos;m </span>
              <span className="gradient-text">Ashutosh</span>
            </h1>

            {/* Animated Subtitle */}
            <div className={`text-2xl sm:text-3xl md:text-4xl font-light mb-8 h-12 ${isDarkMode ? 'text-green-400' : 'text-cyan-400'}`}>
              <TypeAnimation
                sequence={[
                  'Software Engineer who reads docs first',
                  2000,
                  'Full-stack problem solver',
                  2000,
                  'Cloud & data wrangler',
                  2000,
                  'AI enthusiast (not building Skynet)',
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                cursor={true}
              />
            </div>

            {/* Description */}
            <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-6 leading-relaxed">
              I like building systems that are fast, understandable, and just a little over-engineered in the right places.
              I work across the stack, from APIs and data pipelines to interfaces and AI models.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#contact"
                className={`group relative px-8 py-4 rounded-xl font-medium text-white overflow-hidden transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-[0_0_40px_rgba(34,197,94,0.4)]' 
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)]'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get in Touch
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </a>
              <a
                href="/resume.pdf"
                target="_blank"
                className="group px-8 py-4 rounded-xl font-medium text-white glass border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  View Resume
                  <svg className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
              </a>
              <a
                href="https://github.com/ashutoshjoshi1"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 rounded-xl font-medium text-white glass border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  GitHub Profile
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.8-.26.8-.58v-2.24c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.31 1.23a11.5 11.5 0 0 1 6.02 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.23v3.3c0 .32.2.7.81.58C20.57 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="pt-20 md:pt-24 pb-28 md:pb-32 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Image */}
              <div className="relative group">
                <div className={`absolute inset-0 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity ${isDarkMode ? 'bg-green-500/30' : 'bg-cyan-500/30'}`} />
                <div className="relative border-gradient rounded-3xl p-1">
                  <div className="glass rounded-3xl p-2">
                    <Image
                      src="/images/ashu.jpeg"
                      alt="Ashutosh Joshi"
                      width={350}
                      height={350}
                      className="rounded-2xl object-cover w-72 h-72 md:w-80 md:h-80"
                      priority
                    />
                  </div>
                </div>
                {/* Floating Elements */}
                <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-2xl glass flex items-center justify-center animate-float ${isDarkMode ? 'shadow-green-500/20' : 'shadow-cyan-500/20'} shadow-lg`}>
                  <span className="text-3xl">🚀</span>
                </div>
                <div className={`absolute -bottom-4 -left-4 w-16 h-16 rounded-xl glass flex items-center justify-center animate-float`} style={{ animationDelay: '1s' }}>
                  <span className="text-2xl">💻</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-cyan-400'}`}>About Me</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Turning Ideas Into
                  <span className="gradient-text"> Digital Reality</span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  I&apos;m a curious engineer who enjoys turning vague ideas and messy datasets into well-behaved systems.
                  I care a lot about naming things, deleting code, and leaving projects in a state future teammates will thank us for.
                </p>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  During the day I work with the folks at <span className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-cyan-400'}`}>NASA GSFC</span>,
                  building data pipelines for the PANDORA project—helping scientists understand the atmosphere while I quietly nerd out about clean abstractions.
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { value: '4+', label: 'Years Experience' },
                    { value: '15+', label: 'Technologies' },
                    { value: '10+', label: 'Projects' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center lg:text-left">
                      <div className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-green-400' : 'text-cyan-400'}`}>
                        {stat.value}
                      </div>
                      <div className="text-gray-500 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-cyan-400'}`}>Career Path</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Work <span className="gradient-text">Experience</span>
              </h2>
            </div>
            <WorkExperience />
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-cyan-400'}`}>Tech Stack</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Tools & <span className="gradient-text">Technologies</span>
              </h2>
            </div>
            <Technologies />
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-cyan-400'}`}>Portfolio</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Featured <span className="gradient-text">Projects</span>
              </h2>
            </div>
            <Projects />
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-cyan-400'}`}>Get in Touch</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Let&apos;s Build Something
              <span className="gradient-text"> Amazing</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
              I&apos;m always interested in hearing about new projects and opportunities. 
              Whether you have a question or just want to say hi, feel free to reach out!
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:ashutxsh.jxshi@gmail.com"
                className={`group flex items-center gap-3 px-6 py-4 rounded-xl glass border transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'border-green-500/30 hover:border-green-500/60 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]' 
                    : 'border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                }`}
              >
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-cyan-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-white font-medium">Email Me</span>
              </a>
              <a
                href="tel:+15513446092"
                className={`group flex items-center gap-3 px-6 py-4 rounded-xl glass border transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'border-green-500/30 hover:border-green-500/60 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]' 
                    : 'border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                }`}
              >
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-cyan-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-white font-medium">Call Me</span>
              </a>
              <a
                href="https://www.linkedin.com/in/ashutosh--joshi/"
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-3 px-6 py-4 rounded-xl glass border transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'border-green-500/30 hover:border-green-500/60 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]' 
                    : 'border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                }`}
              >
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-cyan-400'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-white font-medium">LinkedIn</span>
              </a>
              <a
                href="https://github.com/ashutoshjoshi1"
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-3 px-6 py-4 rounded-xl glass border transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'border-green-500/30 hover:border-green-500/60 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]' 
                    : 'border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                }`}
              >
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-cyan-400'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-white font-medium">GitHub</span>
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  )
}
