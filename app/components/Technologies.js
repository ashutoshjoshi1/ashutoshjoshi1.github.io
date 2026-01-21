'use client'

import { useDarkMode } from '../context/DarkModeContext'
import { 
  FaPython, 
  FaJs, 
  FaCloud, 
  FaChartBar, 
  FaDatabase, 
  FaDocker, 
  FaRobot, 
  FaGitAlt, 
  FaBolt, 
  FaMicrochip, 
  FaReact, 
  FaNodeJs, 
  FaLeaf,
  FaBrain,
  FaCode
} from 'react-icons/fa'
import { SiTypescript, SiKubernetes, SiTensorflow } from 'react-icons/si'

export default function Technologies() {
  const { isDarkMode } = useDarkMode()
  
  const categories = [
    {
      name: 'Languages',
      techs: [
        { name: 'Python', icon: FaPython },
        { name: 'JavaScript', icon: FaJs },
        { name: 'TypeScript', icon: SiTypescript },
        { name: 'C++', icon: FaBolt },
      ]
    },
    {
      name: 'Frontend',
      techs: [
        { name: 'React', icon: FaReact },
        { name: 'Node.js', icon: FaNodeJs },
        { name: 'Streamlit', icon: FaCode },
      ]
    },
    {
      name: 'Data & AI',
      techs: [
        { name: 'Data Science', icon: FaChartBar },
        { name: 'Gen AI', icon: FaBrain },
        { name: 'Agentic AI', icon: FaRobot },
        { name: 'TensorFlow', icon: SiTensorflow },
      ]
    },
    {
      name: 'Infrastructure',
      techs: [
        { name: 'Cloud', icon: FaCloud },
        { name: 'Docker', icon: FaDocker },
        { name: 'PostgreSQL', icon: FaDatabase },
        { name: 'MongoDB', icon: FaLeaf },
        { name: 'Git', icon: FaGitAlt },
      ]
    },
  ]

  return (
    <div className="space-y-8">
      {categories.map((category, catIndex) => (
        <div key={catIndex}>
          <h3 className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-green-400/60' : 'text-cyan-400/60'}`}>
            {category.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {category.techs.map((tech, index) => {
              const Icon = tech.icon
              return (
                <div
                  key={index}
                  className={`group relative glass rounded-xl p-4 border transition-all duration-300 hover:scale-105 cursor-default ${
                    isDarkMode 
                      ? 'border-green-500/10 hover:border-green-500/40 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]' 
                      : 'border-cyan-500/10 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                  }`}
                >
                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl ${
                    isDarkMode ? 'bg-green-500/10' : 'bg-cyan-500/10'
                  }`} />
                  
                  <div className="relative flex flex-col items-center text-center">
                    <div className={`w-12 h-12 mb-3 flex items-center justify-center rounded-lg ${
                      isDarkMode ? 'bg-green-500/10' : 'bg-cyan-500/10'
                    }`}>
                      <Icon className={`w-7 h-7 transition-all duration-300 group-hover:scale-110 ${
                        isDarkMode 
                          ? 'text-green-400 group-hover:text-green-300' 
                          : 'text-cyan-400 group-hover:text-cyan-300'
                      }`} />
                    </div>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                      {tech.name}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
