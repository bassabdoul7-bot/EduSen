// ============ FEATURE GATE COMPONENT ============
import { usePlan } from '../hooks/usePlan'
import { Link } from 'react-router-dom'

export function FeatureGate({ feature, children, fallback }) {
  const plan = usePlan()
  
  const hasAccess = {
    ai_tutor: plan.canAccessAITutor,
    virtual_lab: plan.canAccessLab,
    scholarships: plan.canAccessScholarships,
    exam_prep: plan.canAccessExamPrep,
    teacher_dashboard: plan.canAccessTeacherDashboard,
  }[feature]
  
  if (hasAccess) {
    return children
  }
  
  if (fallback) {
    return fallback
  }
  
  return <UpgradePrompt feature={feature} />
}

function UpgradePrompt({ feature }) {
  const featureNames = {
    ai_tutor: 'Tuteur IA',
    scholarships: 'Portail Bourses',
    exam_prep: 'Preparation Examens',
    teacher_dashboard: 'Tableau de Bord',
  }
  
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-dashed border-purple-200 m-4">
      <div className="text-5xl mb-4">🔒</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {featureNames[feature] || 'Cette fonctionnalite'} 
      </h3>
      <p className="text-gray-600 mb-6 text-center">
        Passez a EduSen Etudiant pour debloquer toutes les fonctionnalites
      </p>
      <Link 
        to="/pricing" 
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105"
      >
        Voir les offres →
      </Link>
    </div>
  )
}

export default FeatureGate
