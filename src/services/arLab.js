// AR Lab Service - High School + University Experiments

const experiments = {
  chemistry: [
    {
      id: 'acid-base',
      name: 'Titrage Acide-Base',
      description: 'Neutralisation HCl + NaOH avec indicateur pH',
      difficulty: 'Facile',
      level: 'lycee',
      duration: '10 min',
      steps: ['Verser HCl', 'Ajouter indicateur', 'Ajouter NaOH', 'Observer neutralisation']
    },
    {
      id: 'combustion',
      name: 'Combustion du Magnesium',
      description: 'Reaction de combustion vive avec lumiere intense',
      difficulty: 'Moyen',
      level: 'lycee',
      duration: '8 min',
      steps: ['Allumer bec Bunsen', 'Approcher magnesium', 'Observer combustion', 'Noter MgO']
    },
    {
      id: 'spectrophotometry',
      name: 'Spectrophotometrie UV-Vis',
      description: 'Mesure absorbance et loi de Beer-Lambert',
      difficulty: 'Avance',
      level: 'universite',
      duration: '20 min',
      steps: ['Inserer blanc', 'Calibrer', 'Inserer echantillon', 'Regler lambda', 'Mesurer A']
    },
    {
      id: 'galvanic-cell',
      name: 'Pile Electrochimique',
      description: 'Pile Daniell - Oxydoreduction et potentiel',
      difficulty: 'Avance',
      level: 'universite',
      duration: '15 min',
      steps: ['Placer Zn', 'Placer Cu', 'Connecter pont salin', 'Brancher voltmetre', 'Mesurer E']
    },
    {
      id: 'chromatography',
      name: 'Chromatographie CCM',
      description: 'Separation de pigments vegetaux',
      difficulty: 'Moyen',
      level: 'universite',
      duration: '25 min',
      steps: ['Preparer extrait', 'Deposer echantillon', 'Ajouter eluant', 'Migration', 'Calculer Rf']
    }
  ],
  physics: [
    {
      id: 'simple-circuit',
      name: 'Circuit Electrique Simple',
      description: 'Loi Ohm: U = RI',
      difficulty: 'Facile',
      level: 'lycee',
      duration: '10 min',
      steps: ['Placer pile', 'Connecter resistance', 'Connecter ampoule', 'Calculer I']
    },
    {
      id: 'pendulum',
      name: 'Pendule Simple',
      description: 'Mesure periode T = 2pi*sqrt(L/g)',
      difficulty: 'Facile',
      level: 'lycee',
      duration: '12 min',
      steps: ['Attacher ficelle', 'Fixer masse', 'Lancer oscillation', 'Mesurer periode']
    },
    {
      id: 'double-slit',
      name: 'Fentes de Young',
      description: 'Interference lumineuse',
      difficulty: 'Avance',
      level: 'universite',
      duration: '20 min',
      steps: ['Allumer laser', 'Aligner fentes', 'Placer ecran', 'Observer franges']
    },
    {
      id: 'rlc-circuit',
      name: 'Circuit RLC - Resonance',
      description: 'Resonance en circuit RLC serie',
      difficulty: 'Avance',
      level: 'universite',
      duration: '25 min',
      steps: ['Connecter R', 'Connecter L', 'Connecter C', 'Brancher GBF', 'Connecter oscillo', 'Trouver f0']
    },
    {
      id: 'photoelectric',
      name: 'Effet Photoelectrique',
      description: 'Emission electrons par lumiere',
      difficulty: 'Avance',
      level: 'universite',
      duration: '20 min',
      steps: ['Placer cathode', 'Connecter circuit', 'Allumer lumiere', 'Varier frequence', 'Mesurer courant', 'Trouver seuil']
    }
  ],
  biology: [
    {
      id: 'cell-observation',
      name: 'Observation Cellulaire',
      description: 'Observer des cellules vegetales au microscope',
      difficulty: 'Facile',
      level: 'lycee',
      duration: '15 min',
      steps: ['Preparer lame', 'Ajouter colorant', 'Placer lamelle', 'Observer x10', 'Observer x40']
    },
    {
      id: 'photosynthesis',
      name: 'Photosynthese',
      description: 'Mise en evidence de la photosynthese',
      difficulty: 'Moyen',
      level: 'lycee',
      duration: '20 min',
      steps: ['Preparer elodee', 'Placer sous lumiere', 'Observer bulles O2', 'Comparer obscurite']
    },
    {
      id: 'gel-electrophoresis',
      name: 'Electrophorese sur Gel',
      description: 'Separation fragments ADN',
      difficulty: 'Avance',
      level: 'universite',
      duration: '30 min',
      steps: ['Preparer gel', 'Charger ADN', 'Alimenter', 'Migration', 'Colorer', 'Visualiser UV']
    },
    {
      id: 'microscopy',
      name: 'Microscopie Cellulaire',
      description: 'Observation cellules avec coloration',
      difficulty: 'Moyen',
      level: 'universite',
      duration: '20 min',
      steps: ['Preparer lame', 'Ajouter colorant', 'Placer lamelle', 'Positionner', 'Focus x10', 'Focus x40']
    },
    {
      id: 'enzyme-kinetics',
      name: 'Cinetique Enzymatique',
      description: 'Courbe Michaelis-Menten et Km',
      difficulty: 'Avance',
      level: 'universite',
      duration: '35 min',
      steps: ['Preparer substrats', 'Ajouter enzyme', 'Demarrer reaction', 'Collecter donnees', 'Trouver Vmax', 'Calculer Km']
    }
  ]
}

export const arLabService = {
  getAllExperiments: (subject) => experiments[subject] || [],
  getExperimentsByLevel: (subject, level) => (experiments[subject] || []).filter(exp => exp.level === level),
  getExperiment: (subject, id) => (experiments[subject] || []).find(exp => exp.id === id),
  getAllSubjects: () => ['chemistry', 'physics', 'biology']
}

export const calculateCurrent = (voltage, resistance) => voltage / resistance
export const calculatePeriod = (length, g = 9.81) => 2 * Math.PI * Math.sqrt(length / g)
export const calculatePH = (acidVolume, baseVolume) => {
  const ratio = baseVolume / acidVolume
  if (ratio < 0.9) return 1 + ratio * 3
  if (ratio < 1.1) return 4 + ratio * 3
  return Math.min(14, 7 + (ratio - 1) * 5)
}
export const getIndicatorColor = (pH) => {
  if (pH < 3) return '#ff4444'
  if (pH < 5) return '#ff8844'
  if (pH < 6.5) return '#ffaa44'
  if (pH < 7.5) return '#ffcccc'
  if (pH < 9) return '#ff88aa'
  return '#ff44aa'
}

