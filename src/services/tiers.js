export const PLANS = {
  FREE: 'free',
  STUDENT: 'student',
  SCHOOL: 'school',
  TEACHER: 'teacher',
}

export const FEATURES = {
  AI_TUTOR: 'ai_tutor',
  VIRTUAL_LAB: 'virtual_lab',
  SCHOLARSHIPS: 'scholarships',
  EXAM_PREP: 'exam_prep',
  TEACHER_DASHBOARD: 'teacher_dashboard',
  STUDENT_PROGRESS: 'student_progress',
  STUDY_GROUPS: 'study_groups',
}

// Free: basic chat (10/day), browse concours (no corriges), forum, groups (limited)
// Student: everything unlimited
export const PLAN_FEATURES = {
  [PLANS.FREE]: [
    FEATURES.STUDY_GROUPS,
  ],
  [PLANS.STUDENT]: [
    FEATURES.AI_TUTOR,
    FEATURES.VIRTUAL_LAB,
    FEATURES.SCHOLARSHIPS,
    FEATURES.EXAM_PREP,
    FEATURES.STUDY_GROUPS,
  ],
  [PLANS.SCHOOL]: [
    FEATURES.VIRTUAL_LAB,
    FEATURES.STUDENT_PROGRESS,
    FEATURES.STUDY_GROUPS,
  ],
  [PLANS.TEACHER]: [
    FEATURES.VIRTUAL_LAB,
    FEATURES.TEACHER_DASHBOARD,
    FEATURES.STUDENT_PROGRESS,
    FEATURES.STUDY_GROUPS,
  ],
}

export const canAccess = (userPlan, feature) => {
  const features = PLAN_FEATURES[userPlan] || PLAN_FEATURES[PLANS.FREE]
  return features.includes(feature)
}

export const PLAN_INFO = {
  [PLANS.FREE]: {
    name: 'Gratuit',
    price: 0,
    period: '',
    description: 'Decouvrir KanGam',
    features: ['10 messages IA/jour', 'Concours (epreuves seulement)', 'Forum', 'Groupes d\'etude'],
  },
  [PLANS.STUDENT]: {
    name: 'Etudiant Premium',
    price: 1000,
    period: '/mois',
    description: 'Acces complet',
    features: [
      'IA illimitee (tuteur, quiz, resoudre)',
      'Concours + corriges + predictions',
      'Portail bourses complet',
      'Groupes d\'etude + live video',
      'Upload photo/PDF',
      'Voix IA',
      'Export PDF',
    ],
  },
  [PLANS.SCHOOL]: {
    name: 'Ecole',
    price: 150000,
    period: '/an',
    description: 'Pour etablissements',
    features: [
      'Tout Premium',
      'Dashboard enseignant',
      'Suivi des eleves',
      'Rapports',
    ],
  },
  [PLANS.TEACHER]: {
    name: 'Professeur',
    price: 0,
    period: '',
    description: 'Inclus avec ecole',
    features: ['Gestion de classe', 'Suivi eleves'],
  },
}
