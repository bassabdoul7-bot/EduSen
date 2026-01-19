// ============ GUIDED EXPERIMENT SYSTEM ============
import { useState, useEffect } from 'react'

export function useGuidedExperiment(steps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [highlightedItem, setHighlightedItem] = useState(null)
  const [hasStarted, setHasStarted] = useState(false)
  
  const currentStepData = steps[currentStep]
  
  useEffect(() => {
    if (currentStepData && hasStarted) {
      setHighlightedItem(currentStepData.highlight)
    }
  }, [currentStep, currentStepData, hasStarted])
  
  const start = () => {
    setHasStarted(true)
    setCurrentStep(0)
    setIsComplete(false)
  }
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setIsComplete(true)
      setHighlightedItem(null)
    }
  }
  
  const reset = () => {
    setCurrentStep(0)
    setIsComplete(false)
    setHighlightedItem(null)
    setHasStarted(false)
  }
  
  return {
    currentStep: currentStepData,
    stepNumber: currentStep + 1,
    totalSteps: steps.length,
    highlightedItem,
    isComplete,
    hasStarted,
    start,
    nextStep,
    reset
  }
}

// Acid-Base Titration Steps
export const acidBaseSteps = [
  {
    id: 1,
    instruction: "Bienvenue dans l'expérience de titrage acide-base. Cliquez sur le bécher d'acide chlorhydrique pour commencer.",
    highlight: "hcl",
    action: "click-hcl"
  },
  {
    id: 2,
    instruction: "Excellent. Maintenant, cliquez sur l'indicateur pour ajouter l'acide.",
    highlight: "indicator",
    action: "click-indicator"
  },
  {
    id: 3,
    instruction: "Observez le changement de couleur de l'indicateur. Maintenant, cliquez sur la base, hydroxyde de sodium.",
    highlight: "naoh",
    action: "click-naoh"
  },
  {
    id: 4,
    instruction: "Excellent. Maintenant, versez la base dans le bécher avec l'indicateur.",
    highlight: "indicator",
    action: "pour-naoh"
  },
  {
    id: 5,
    instruction: "Parfait! La solution est maintenant neutre avec un pH de 7. Le titrage acide-base est terminé.",
    highlight: null,
    action: "complete"
  }
]