'use client'

import { useDarkMode } from '../context/DarkModeContext'
import Image from 'next/image'
import { FaExternalLinkAlt } from 'react-icons/fa'

const experiences = [
  {
    company: 'Sciglob Instruments & Services',
    subtitle: 'NASA GSFC',
    position: 'Software Engineer',
    location: 'Columbia, Maryland',
    period: 'Nov 2024 - Present',
    description: 'Designing data acquisition, processing, and storage pipelines for the PANDORA atmospheric research project—turning raw sensor noise into something scientists (and dashboards) can actually use.',
    logo: '/images/sciglob.jpg',
    link: 'https://sciglob.com',
    highlights: ['Python', 'Cloud', 'APIs']
  },
  {
    company: '407 Associates',
    position: 'Data Analyst & Developer',
    location: 'Laurel, Maryland',
    period: 'Apr 2024 - Nov 2024',
    description: 'Built internal web tools so spreadsheets could finally retire, layering in analytics that made "gut feeling" decisions measurable.',
    logo: '/images/407.jpg',
    link: 'https://407associates.com',
    highlights: ['React', 'Analytics', 'Web Dev']
  },
  {
    company: 'University of Maryland Baltimore County',
    position: 'Graduate Student Assistant',
    location: 'Baltimore, Maryland',
    period: 'Jan 2023 - Dec 2023',
    description: 'Helped students debug everything from off-by-one errors to existential dread, while building web apps that kept grading and assignments sane.',
    logo: '/images/umbc.jpg',
    link: 'https://umbc.edu',
    highlights: ['Teaching', 'Web Apps', 'Python']
  },
  {
    company: 'Tata Consultancy Services',
    position: 'Systems Engineer',
    location: 'Bangalore, India',
    period: 'Jun 2020 - Aug 2022',
    description: 'Engineered large-scale data pipelines for Albertsons Co., making sure inventory, orders, and reality all mostly agreed with each other.',
    logo: '/images/tcs.jpg',
    link: 'https://tcs.com',
    highlights: ['ETL', 'SQL', 'Python']
  }
]

export default function WorkExperience() {
  const { isDarkMode } = useDarkMode()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        {/* Timeline line */}
        <div className={`absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b ${isDarkMode ? 'from-green-500 via-green-500/50 to-transparent' : 'from-cyan-500 via-cyan-500/50 to-transparent'}`} />
        
        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <div 
              key={index} 
              className={`relative flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Timeline dot */}
              <div className={`absolute left-0 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 z-10 ${
                isDarkMode 
                  ? 'border-green-500 bg-[#030712]' 
                  : 'border-cyan-500 bg-[#030712]'
              }`}>
                <div className={`absolute inset-1 rounded-full ${isDarkMode ? 'bg-green-500' : 'bg-cyan-500'} animate-pulse`} />
              </div>
              
              {/* Content */}
              <div className={`flex-1 ml-8 md:ml-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                <div className={`glass rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] hover-lift ${
                  isDarkMode 
                    ? 'border-green-500/20 hover:border-green-500/40 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]' 
                    : 'border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]'
                }`}>
                  {/* Header */}
                  <div className={`flex items-start gap-4 mb-4 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border ${
                      isDarkMode ? 'border-green-500/30' : 'border-cyan-500/30'
                    }`}>
                      <Image
                        src={exp.logo}
                        alt={`${exp.company} logo`}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                      <h3 className="text-xl font-bold text-white mb-1">{exp.position}</h3>
                      <a 
                        href={exp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 font-medium transition-colors ${
                          isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-cyan-400 hover:text-cyan-300'
                        }`}
                      >
                        {exp.company}
                        {exp.subtitle && <span className="text-gray-500"> • {exp.subtitle}</span>}
                        <FaExternalLinkAlt className="text-xs ml-1" />
                      </a>
                    </div>
                  </div>
                  
                  {/* Meta */}
                  <div className={`flex items-center gap-4 text-sm text-gray-500 mb-4 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                    <span>{exp.location}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isDarkMode 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-cyan-500/10 text-cyan-400'
                    }`}>
                      {exp.period}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-400 mb-4 leading-relaxed">
                    {exp.description}
                  </p>
                  
                  {/* Highlights */}
                  <div className={`flex flex-wrap gap-2 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                    {exp.highlights.map((highlight, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                          isDarkMode 
                            ? 'border-green-500/30 text-green-400/80 bg-green-500/5' 
                            : 'border-cyan-500/30 text-cyan-400/80 bg-cyan-500/5'
                        }`}
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Empty space for alternating layout */}
              <div className="hidden md:block flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
