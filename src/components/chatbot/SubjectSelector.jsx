import { Calculator, Atom, Microscope, Leaf, Brain, BookOpen, Globe, Languages, Code, TrendingUp, Tractor, Stethoscope } from 'lucide-react'

export default function SubjectSelector({ onSelectSubject }) {
  const subjects = [
    { id: 'math', name: 'Mathématiques', icon: Calculator, color: 'from-blue-500 to-blue-600' },
    { id: 'physics', name: 'Physique', icon: Atom, color: 'from-purple-500 to-purple-600' },
    { id: 'chemistry', name: 'Chimie', icon: Microscope, color: 'from-green-500 to-green-600' },
    { id: 'svt', name: 'SVT', icon: Leaf, color: 'from-emerald-500 to-emerald-600' },
    { id: 'philosophy', name: 'Philosophie', icon: Brain, color: 'from-indigo-500 to-indigo-600' },
    { id: 'french', name: 'Français', icon: BookOpen, color: 'from-red-500 to-red-600' },
    { id: 'english', name: 'Anglais', icon: Languages, color: 'from-yellow-500 to-yellow-600' },
    { id: 'history', name: 'Histoire-Géo', icon: Globe, color: 'from-orange-500 to-orange-600' },
    { id: 'programming', name: 'Programmation', icon: Code, color: 'from-cyan-500 to-cyan-600' },
    { id: 'accounting', name: 'Comptabilité', icon: TrendingUp, color: 'from-pink-500 to-pink-600' },
    { id: 'agriculture', name: 'Agriculture', icon: Tractor, color: 'from-lime-500 to-lime-600' },
    { id: 'medicine', name: 'Médecine', icon: Stethoscope, color: 'from-rose-500 to-rose-600' },
  ]

  return (
    <div className='max-w-5xl mx-auto'>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold mb-2'>Choisissez une matière</h2>
        <p className='text-gray-600'>Sélectionnez la matière pour laquelle vous avez besoin d aide</p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSelectSubject(subject.id)}
            className='card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center'
          >
            <div className={'w-16 h-16 mx-auto mb-4 bg-gradient-to-br ' + subject.color + ' rounded-lg flex items-center justify-center'}>
              <subject.icon className='text-white' size={32} />
            </div>
            <h3 className='font-semibold'>{subject.name}</h3>
          </button>
        ))}
      </div>
    </div>
  )
}