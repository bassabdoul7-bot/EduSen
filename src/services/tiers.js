// ============ TIER SYSTEM ============
// src/services/tiers.js

export const PLANS = {
  FREE: 'free',
  STUDENT: 'student',      // Full access - B2C
  SCHOOL: 'school',        // Lab only - B2B
  TEACHER: 'teacher',      // School admin
}

export const FEATURES = {
  AI_TUTOR: 'ai_tutor',
  VIRTUAL_LAB: 'virtual_lab',
  SCHOLARSHIPS: 'scholarships',
  EXAM_PREP: 'exam_prep',
  TEACHER_DASHBOARD: 'teacher_dashboard',
  STUDENT_PROGRESS: 'student_progress',
}

// What each plan can access
export const PLAN_FEATURES = {
  [PLANS.FREE]: [
    FEATURES.VIRTUAL_LAB,  // Limited experiments
  ],
  [PLANS.STUDENT]: [
    FEATURES.AI_TUTOR,
    FEATURES.VIRTUAL_LAB,
    FEATURES.SCHOLARSHIPS,
    FEATURES.EXAM_PREP,
  ],
  [PLANS.SCHOOL]: [
    FEATURES.VIRTUAL_LAB,
    FEATURES.STUDENT_PROGRESS,
  ],
  [PLANS.TEACHER]: [
    FEATURES.VIRTUAL_LAB,
    FEATURES.TEACHER_DASHBOARD,
    FEATURES.STUDENT_PROGRESS,
  ],
}

// Check if user can access a feature
export const canAccess = (userPlan, feature) => {
  const features = PLAN_FEATURES[userPlan] || PLAN_FEATURES[PLANS.FREE]
  return features.includes(feature)
}

// Get plan display info
export const PLAN_INFO = {
  [PLANS.FREE]: {
    name: 'Gratuit',
    price: 0,
    period: '',
    description: 'Essayez le laboratoire virtuel',
    features: ['3 experiences gratuites', 'Acces limite'],
  },
  [PLANS.STUDENT]: {
    name: 'Etudiant',
    price: 5000,
    period: '/mois',
    description: 'Acces complet pour reussir',
    features: [
      'Laboratoire virtuel complet',
      'Tuteur IA 24/7',
      'Portail bourses',
      'Preparation BFEM & Bac',
      'Support prioritaire',
    ],
  },
  [PLANS.SCHOOL]: {
    name: 'Ecole',
    price: 150000,
    period: '/an par classe',
    description: 'Pour votre etablissement',
    features: [
      'Laboratoire virtuel complet',
      'Tableau de bord professeur',
      'Suivi des eleves',
      'Rapports de progression',
      'Support dedie',
    ],
  },
  [PLANS.TEACHER]: {
    name: 'Professeur',
    price: 0,
    period: '',
    description: 'Inclus avec abonnement ecole',
    features: [
      'Gestion de classe',
      'Suivi des eleves',
      'Rapports detailles',
    ],
  },
}
