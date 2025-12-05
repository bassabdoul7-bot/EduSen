// Chemistry experiment data and logic
export const chemistryExperiments = {
  acidBase: {
    id: 'acid-base',
    name: 'Réaction Acide-Base',
    difficulty: 'Facile',
    duration: '10 min',
    description: 'Neutralisation d\'un acide par une base',
    materials: [
      { id: 'beaker', name: 'Bécher 100ml', position: [0, 0, 0] },
      { id: 'hcl', name: 'HCl (Acide)', volume: 50, concentration: 0.1 },
      { id: 'naoh', name: 'NaOH (Base)', volume: 0, concentration: 0.1 },
      { id: 'indicator', name: 'Phénolphtaléine', added: false }
    ],
    steps: [
      'Placer le bécher sur la surface',
      'Ajouter 50ml de HCl',
      'Ajouter 2 gouttes de phénolphtaléine',
      'Ajouter NaOH goutte à goutte',
      'Observer le changement de couleur',
      'Arrêter à la neutralisation (rose pâle)'
    ],
    safetyWarnings: [
      'Les acides et bases sont corrosifs',
      'Porter des lunettes de protection',
      'Travailler dans un endroit bien ventilé'
    ]
  },
  combustion: {
    id: 'combustion',
    name: 'Combustion du Magnésium',
    difficulty: 'Moyen',
    duration: '8 min',
    description: 'Observer une réaction exothermique',
    materials: [
      { id: 'bunsen', name: 'Bec Bunsen', position: [0, 0, 0] },
      { id: 'magnesium', name: 'Ruban de Magnésium', length: 5 },
      { id: 'tongs', name: 'Pinces', holding: null }
    ],
    steps: [
      'Allumer le bec Bunsen',
      'Tenir le magnésium avec les pinces',
      'Approcher de la flamme',
      'Observer la lumière intense',
      'Attention: Ne pas regarder directement!'
    ],
    safetyWarnings: [
      'Porter des lunettes de protection teintées',
      'Ne jamais regarder directement la flamme de magnésium',
      'Tenir à distance avec les pinces'
    ]
  }
}

export const physicsExperiments = {
  circuit: {
    id: 'simple-circuit',
    name: 'Circuit Électrique Simple',
    difficulty: 'Facile',
    duration: '15 min',
    description: 'Construire un circuit avec pile, résistance et ampoule',
    materials: [
      { id: 'battery', name: 'Pile 9V', voltage: 9, connected: false },
      { id: 'resistor', name: 'Résistance 100Ω', resistance: 100, connected: false },
      { id: 'bulb', name: 'Ampoule', lit: false },
      { id: 'wires', name: 'Fils de connexion', count: 0 }
    ],
    steps: [
      'Placer la pile sur le circuit',
      'Connecter le fil rouge au pôle positif',
      'Ajouter la résistance',
      'Connecter l\'ampoule',
      'Observer l\'ampoule s\'allumer'
    ],
    safetyWarnings: [
      'Vérifier la polarité de la pile',
      'Ne pas court-circuiter la pile'
    ]
  },
  pendulum: {
    id: 'pendulum',
    name: 'Mouvement du Pendule',
    difficulty: 'Facile',
    duration: '12 min',
    description: 'Étudier le mouvement périodique d\'un pendule simple',
    materials: [
      { id: 'string', name: 'Ficelle', length: 1, attached: false },
      { id: 'mass', name: 'Masse 100g', weight: 100, swinging: false },
      { id: 'support', name: 'Support', position: [0, 0.3, 0] }
    ],
    steps: [
      'Attacher la ficelle au support',
      'Fixer la masse à la ficelle',
      'Mesurer la longueur (1 mètre)',
      'Lancer le pendule (angle 20°)',
      'Observer le mouvement périodique',
      'Calculer la période T = 2π√(L/g)'
    ],
    safetyWarnings: [
      'S\'assurer que le support est stable',
      'Ne pas lancer avec un angle trop grand'
    ]
  }
}

export const universityExperiments = {
  acidBaseTitration: {
    id: 'acid-base-titration',
    name: 'Titrage Acide-Base Avancé',
    level: 'Université',
    difficulty: 'Avancé',
    duration: '45 min',
    description: 'Détermination de la concentration d\'un acide par titrage avec analyse de courbe pH',
    assignment: {
      objectives: [
        'Déterminer la concentration exacte d\'une solution d\'acide chlorhydrique (HCl) inconnue',
        'Tracer la courbe de titrage pH = f(V_NaOH)',
        'Identifier le point d\'équivalence graphiquement et par calcul'
      ],
      theory: 'Le titrage acide-base permet de déterminer la concentration par neutralisation. HCl + NaOH → NaCl + H₂O',
      materials: [
        { name: 'Burette 50mL', precision: '±0.05mL' },
        { name: 'pH-mètre', precision: '±0.01' }
      ],
      safety: ['Porter lunettes et gants', 'HCl/NaOH corrosifs'],
      preLabQuestions: ['Différence point équivalence vs virage?', 'Pourquoi phénolphtaléine?']
    },
    steps: [
      'Calibrer pH-mètre',
      'Prélever 25mL HCl',
      'Remplir burette NaOH',
      'Mesurer pH initial',
      'Ajouter NaOH goutte à goutte',
      'Noter volume équivalence',
      'Tracer courbe',
      'Calculer concentration',
      'Rédiger rapport'
    ],
    calculations: [
      { name: 'Concentration', formula: 'C = (C_NaOH × V_eq) / V_HCl', units: 'M' }
    ],
    reportSections: ['Abstract', 'Introduction', 'Résultats', 'Discussion'],
    gradingCriteria: {
      technique: { points: 20 },
      data: { points: 20 },
      calculations: { points: 25 },
      report: { points: 10 },
      total: 100
    }
  }
}

export const calculatePH = (hclVolume, naohVolume) => {
  const hclMoles = hclVolume * 0.1 / 1000
  const naohMoles = naohVolume * 0.1 / 1000
  const excessMoles = hclMoles - naohMoles
  
  if (Math.abs(excessMoles) < 0.0001) return 7
  if (excessMoles > 0) {
    const concentration = excessMoles / ((hclVolume + naohVolume) / 1000)
    return -Math.log10(concentration)
  } else {
    const concentration = -excessMoles / ((hclVolume + naohVolume) / 1000)
    return 14 + Math.log10(concentration)
  }
}

export const getIndicatorColor = (pH) => {
  if (pH < 8.2) return '#ff6b6b'
  if (pH > 10) return '#ff69b4'
  return '#ffb3d9'
}

export const calculateCurrent = (voltage, resistance) => {
  return voltage / resistance
}

export const calculatePendulumPeriod = (length) => {
  const g = 9.81
  return 2 * Math.PI * Math.sqrt(length / g)
}

export const arLabService = {
  getExperiment: (subject, experimentId) => {
    if (subject === 'chemistry') return chemistryExperiments[experimentId]
    if (subject === 'physics') return physicsExperiments[experimentId]
    if (subject === 'university') return universityExperiments[experimentId]
    return null
  },
  
  getAllExperiments: (subject) => {
    if (subject === 'chemistry') return Object.values(chemistryExperiments)
    if (subject === 'physics') return Object.values(physicsExperiments)
    if (subject === 'university') return Object.values(universityExperiments)
    return []
  }
}
