import { usePlan } from '../hooks/usePlan'
import { Link } from 'react-router-dom'
import { Lock, Crown } from 'lucide-react'

export function FeatureGate({ feature, children, fallback }) {
  const plan = usePlan()

  const hasAccess = {
    ai_tutor: plan.canAccessAITutor,
    virtual_lab: plan.canAccessLab,
    scholarships: plan.canAccessScholarships,
    exam_prep: plan.canAccessExamPrep,
    teacher_dashboard: plan.canAccessTeacherDashboard,
  }[feature]

  if (hasAccess) return children
  if (fallback) return fallback
  return <UpgradePrompt feature={feature} />
}

function UpgradePrompt({ feature }) {
  const featureNames = {
    ai_tutor: 'Tuteur IA',
    virtual_lab: 'Labo Virtuel',
    scholarships: 'Portail Bourses',
    exam_prep: 'Concours & Corriges',
    teacher_dashboard: 'Tableau de Bord',
  }

  const featureDesc = {
    ai_tutor: 'Posez des questions illimitees a l\'IA, generez des quiz, resolvez des exercices par photo',
    virtual_lab: 'Acces complet aux experiences de laboratoire virtuel',
    scholarships: 'Decouvrez des bourses et suivez vos candidatures',
    exam_prep: 'Accedez aux corriges et predictions IA des concours',
    teacher_dashboard: 'Gerez vos classes et suivez la progression de vos eleves',
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-2xl bg-senegal-yellow/10 border border-senegal-yellow/20 flex items-center justify-center mx-auto mb-5">
          <Lock size={32} className="text-senegal-yellow" />
        </div>
        <h3 className="text-xl font-black text-white mb-2">
          {featureNames[feature] || 'Fonctionnalite Premium'}
        </h3>
        <p className="text-xs text-white/40 mb-6 leading-relaxed">
          {featureDesc[feature] || 'Cette fonctionnalite est reservee aux abonnes KanGam Premium'}
        </p>
        <Link to="/premium"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-senegal-green via-senegal-yellow to-senegal-red text-white font-black text-sm shadow-lg hover:shadow-xl transition-all">
          <Crown size={18} /> Passer a Premium
        </Link>
        <p className="text-[10px] text-white/20 mt-4">A partir de 1,000 FCFA/mois</p>
      </div>
    </div>
  )
}

export default FeatureGate
