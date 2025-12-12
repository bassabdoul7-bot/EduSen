import { useState } from 'react'
import { Bot, Lightbulb } from 'lucide-react'

const hints = {
  "acid-base": ["Versez HCl", "Ajoutez indicateur", "Versez NaOH", "Neutralise!"],
  "precipitation": ["Versez AgNO3", "Ajoutez NaCl", "Precipite forme!", "Filtrez"],
  "simple-circuit": ["Connectez pile", "Ajoutez resistance", "Ampoule brille!"]
}

export function LabTutor({ experimentId, currentStep }) {
  const steps = hints[experimentId]
  if (!steps) return null
  
  return (
    <div className="fixed left-4 top-20 w-80 z-50 bg-white rounded-xl shadow-2xl border-2 border-blue-200 p-4">
      <div className="flex items-center gap-2 mb-3 text-blue-600">
        <Bot className="w-5 h-5" />
        <span className="font-bold">Ziz Tuteur</span>
      </div>
      <div className="flex items-start gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0" />
        <p className="text-sm text-gray-800 font-medium">{steps[currentStep] || steps[steps.length - 1]}</p>
      </div>
      <div className="mt-3 text-xs text-gray-500">Etape {currentStep + 1}/{steps.length}</div>
    </div>
  )
}