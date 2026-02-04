'use client'

import { useDarkMode } from '../context/DarkModeContext'
import Image from 'next/image'
import { FaGithub, FaExternalLinkAlt, FaArrowRight } from 'react-icons/fa'

export default function Projects() {
  const { isDarkMode } = useDarkMode()
  
  const projects = [
    {
      name: 'Sciglob Portal',
      description: 'Enterprise portal orchestrating hardware–cloud communication for NASA\'s PANDORA project, so instruments and humans stay in sync.',
      image: '/images/sciglob.jpg',
      tags: ['Python', 'C++', 'Cloud', 'APIs'],
      link: 'https://github.com/ashutoshjoshi1/Sciglob-Polarizer',
      featured: true
    },
    {
      name: 'Anomaly Detection System',
      description: 'ML-powered app that spots weird behaviour in atmospheric data before humans (or plots) do.',
      image: '/images/sciglob.jpg',
      tags: ['Streamlit', 'ML', 'Python'],
      link: 'https://github.com/ashutoshjoshi1/deep-learning-anomaly'
    },
    {
      name: 'Pandora Data Alignment',
      description: 'Interactive dashboard for obsessively comparing "good" and "bad" Pandora scans with real-time visuals.',
      image: '/images/sciglob.jpg',
      tags: ['Streamlit', 'Data Viz', 'Python'],
      link: 'https://github.com/ashutoshjoshi1',
      demo: 'https://alignment.streamlit.app'
    },
    {
      name: 'Pose Estimation',
      description: 'Computer vision system that estimates human pose from video—because stick figures deserve neural nets too.',
      image: '/images/umbc.jpg',
      tags: ['TensorFlow', 'CV', 'Python'],
      link: 'https://github.com/ashutoshjoshi1/pose-tensorflow'
    },
    {
      name: 'Sarcasm Detection',
      description: 'NLP model that tries to understand when the internet is being sarcastic (which is… often).',
      image: '/images/tcs.jpg',
      tags: ['LSTM', 'NLP', 'Deep Learning'],
      link: 'https://github.com/ashutoshjoshi1/Twitter-Sarcasm-Analysis'
    },
    {
      name: 'Admission Predictor',
      description: 'Neural network that predicts grad-school admission odds while still letting you inspect the ingredients.',
      image: '/images/umbc.jpg',
      tags: ['Neural Networks', 'ML', 'Python'],
      link: 'https://github.com/ashutoshjoshi1/Graduate-Admission-Neural-Network-'
    }
  ]

  const featuredProject = projects.find(p => p.featured)
  const otherProjects = projects.filter(p => !p.featured)

  return (
    <div className="space-y-8">
      {/* Featured Project */}
      {featuredProject && (
        <div className={`relative group glass rounded-2xl overflow-hidden border transition-all duration-500 hover:scale-[1.01] ${
          isDarkMode 
            ? 'border-green-500/20 hover:border-green-500/50 hover:shadow-[0_0_60px_rgba(34,197,94,0.15)]' 
            : 'border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_0_60px_rgba(6,182,212,0.15)]'
        }`}>
          <div className="flex flex-col lg:flex-row">
            {/* Image */}
            <div className="relative lg:w-1/2 h-64 lg:h-auto overflow-hidden">
              <Image
                src={featuredProject.image}
                alt={featuredProject.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/80 to-transparent" />
              
              {/* Featured Badge */}
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${
                isDarkMode ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}>
                Featured Project
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-8 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {featuredProject.name}
              </h3>
              <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                {featuredProject.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {featuredProject.tags.map((tag, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                      isDarkMode 
                        ? 'border-green-500/30 text-green-400 bg-green-500/5' 
                        : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Links */}
              <div className="flex gap-4">
                <a
                  href={featuredProject.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30' 
                      : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30'
                  }`}
                >
                  <FaGithub className="text-lg" />
                  View Code
                  <FaArrowRight className="text-sm" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherProjects.map((project, index) => (
          <div
            key={index}
            className={`group relative glass rounded-xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] ${
              isDarkMode 
                ? 'border-green-500/10 hover:border-green-500/40 hover:shadow-[0_0_40px_rgba(34,197,94,0.1)]' 
                : 'border-cyan-500/10 hover:border-cyan-500/40 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)]'
            }`}
          >
            {/* Image */}
            <div className="relative h-40 overflow-hidden">
              <Image
                src={project.image}
                alt={project.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/50 to-transparent" />
              
              {/* Project Number */}
              <div className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-mono ${
                isDarkMode ? 'bg-green-500/10 text-green-400/50 border border-green-500/20' : 'bg-cyan-500/10 text-cyan-400/50 border border-cyan-500/20'
              }`}>
                {String(index + 2).padStart(2, '0')}
              </div>
            </div>
            
            {/* Content */}
            <div className="p-5 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white transition-colors">
                {project.name}
              </h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed flex-grow">
                {project.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      isDarkMode 
                        ? 'bg-green-500/10 text-green-400/70' 
                        : 'bg-cyan-500/10 text-cyan-400/70'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Links */}
              <div className={`flex items-center gap-4 pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-white/5'}`}>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-green-400' 
                      : 'text-gray-400 hover:text-cyan-400'
                  }`}
                >
                  <FaGithub />
                  Code
                </a>
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-green-400' 
                        : 'text-gray-400 hover:text-cyan-400'
                    }`}
                  >
                    <FaExternalLinkAlt className="text-xs" />
                    Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
