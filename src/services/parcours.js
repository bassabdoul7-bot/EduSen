// Central parcours (path) system for KanGam
// Every user has a parcours that adapts the entire app

export const CATEGORIES = [
  { id: 'college', name: 'College', icon: '🏫' },
  { id: 'lycee', name: 'Lycee', icon: '📚' },
  { id: 'universite', name: 'Universite', icon: '🎓' },
  { id: 'concours', name: 'Concours', icon: '🏆' },
]

export const PARCOURS = {
  // ============ COLLEGE ============
  '6eme': { category: 'college', name: '6eme', icon: '📗', subjects: ['math', 'french', 'english', 'history', 'biology', 'physics'], level: 'college', description: '6eme - College' },
  '5eme': { category: 'college', name: '5eme', icon: '📗', subjects: ['math', 'french', 'english', 'history', 'biology', 'physics'], level: 'college', description: '5eme - College' },
  '4eme': { category: 'college', name: '4eme', icon: '📘', subjects: ['math', 'french', 'english', 'history', 'biology', 'physics', 'chemistry'], level: 'college', description: '4eme - College' },
  '3eme': { category: 'college', name: '3eme (BFEM)', icon: '📘', subjects: ['math', 'french', 'english', 'history', 'biology', 'physics', 'chemistry'], level: 'bfem', description: '3eme - Preparation BFEM' },

  // ============ LYCEE ============
  '2nde': { category: 'lycee', name: 'Seconde', icon: '📙', subjects: ['math', 'french', 'english', 'history', 'biology', 'physics', 'chemistry', 'philosophy'], level: 'lycee', description: 'Seconde - Lycee' },
  '1ere': { category: 'lycee', name: 'Premiere', icon: '📙', subjects: ['math', 'french', 'english', 'history', 'biology', 'physics', 'chemistry', 'philosophy'], level: 'lycee', description: 'Premiere - Lycee' },
  'TS1': { category: 'lycee', name: 'Terminale S1', icon: '🔬', subjects: ['math', 'physics', 'biology', 'chemistry', 'french', 'philosophy', 'english'], level: 'bac', description: 'Terminale S1 - Maths & Sciences de la Nature', concours: 'BAC-S1' },
  'TS2': { category: 'lycee', name: 'Terminale S2', icon: '⚛️', subjects: ['math', 'physics', 'chemistry', 'french', 'philosophy', 'english'], level: 'bac', description: 'Terminale S2 - Maths & Sciences Physiques', concours: 'BAC-S2' },
  'TS3': { category: 'lycee', name: 'Terminale S3', icon: '🔧', subjects: ['physics', 'chemistry', 'math', 'french', 'philosophy'], level: 'bac', description: 'Terminale S3 - Sciences Experimentales', concours: 'BAC-S3' },
  'TL1': { category: 'lycee', name: 'Terminale L1', icon: '📖', subjects: ['french', 'philosophy', 'history', 'english', 'math'], level: 'bac', description: 'Terminale L1 - Lettres & Sciences Humaines', concours: 'BAC-L1' },
  'TL2': { category: 'lycee', name: 'Terminale L2', icon: '🌍', subjects: ['french', 'philosophy', 'english', 'history', 'economics'], level: 'bac', description: 'Terminale L2 - Langues Vivantes', concours: 'BAC-L2' },
  'TG': { category: 'lycee', name: 'Terminale G', icon: '💼', subjects: ['economics', 'math', 'french', 'philosophy'], level: 'bac', description: 'Terminale G - Gestion & Comptabilite', concours: 'BAC-G' },

  // ============ UNIVERSITE ============
  'medecine': { category: 'universite', name: 'Medecine (FMPO)', icon: '⚕️', subjects: ['medicine', 'biology', 'chemistry', 'physics'], level: 'universite', description: 'Faculte de Medecine, Pharmacie et Odontologie - UCAD',
    topics: ['Anatomie', 'Physiologie', 'Biochimie', 'Pharmacologie', 'Pathologie', 'Histologie'] },
  'droit': { category: 'universite', name: 'Droit (FSJP)', icon: '⚖️', subjects: ['law', 'philosophy', 'history', 'economics'], level: 'universite', description: 'Faculte des Sciences Juridiques et Politiques',
    topics: ['Droit Civil', 'Droit Constitutionnel', 'Droit Penal', 'Droit Administratif', 'Relations Internationales'] },
  'economie': { category: 'universite', name: 'Economie (FASEG)', icon: '📊', subjects: ['economics', 'math', 'general'], level: 'universite', description: 'Faculte des Sciences Economiques et de Gestion',
    topics: ['Microeconomie', 'Macroeconomie', 'Comptabilite', 'Finance', 'Statistiques', 'Econometrie'] },
  'informatique': { category: 'universite', name: 'Informatique (ESP)', icon: '💻', subjects: ['programming', 'math', 'physics'], level: 'universite', description: 'Ecole Superieure Polytechnique - Informatique',
    topics: ['Algorithmes', 'Programmation', 'Base de donnees', 'Reseaux', 'Systemes', 'Intelligence Artificielle'] },
  'sciences': { category: 'universite', name: 'Sciences (FST)', icon: '🔬', subjects: ['math', 'physics', 'chemistry', 'biology'], level: 'universite', description: 'Faculte des Sciences et Techniques',
    topics: ['Analyse', 'Algebre', 'Mecanique quantique', 'Chimie organique', 'Genetique moleculaire'] },
  'lettres': { category: 'universite', name: 'Lettres (FLSH)', icon: '📝', subjects: ['french', 'philosophy', 'history', 'english'], level: 'universite', description: 'Faculte des Lettres et Sciences Humaines',
    topics: ['Litterature', 'Linguistique', 'Sociologie', 'Psychologie', 'Anthropologie'] },

  // ============ CONCOURS ============
  'ena': { category: 'concours', name: 'Concours ENA', icon: '🏛️', subjects: ['general', 'law', 'economics', 'philosophy'], level: 'concours', description: 'Ecole Nationale d\'Administration', concours: 'ENA',
    topics: ['Culture Generale', 'Droit Public', 'Economie Politique', 'Dissertation', 'Note de Synthese', 'Tests Psychotechniques'] },
  'douanes': { category: 'concours', name: 'Concours Douanes', icon: '🛃', subjects: ['general', 'math', 'french', 'law'], level: 'concours', description: 'Administration des Douanes', concours: 'DOUANES',
    topics: ['Culture Generale', 'Mathematiques', 'Francais', 'Droit', 'Economie'] },
  'police': { category: 'concours', name: 'Concours Police', icon: '👮', subjects: ['general', 'law', 'french', 'math'], level: 'concours', description: 'Police Nationale du Senegal', concours: 'POLICE',
    topics: ['Culture Generale', 'Droit', 'Francais', 'Sport', 'Tests Psychotechniques'] },
  'gendarmerie': { category: 'concours', name: 'Concours Gendarmerie', icon: '🎖️', subjects: ['general', 'law', 'french', 'math'], level: 'concours', description: 'Gendarmerie Nationale', concours: 'GENDARMERIE',
    topics: ['Culture Generale', 'Droit', 'Francais', 'Sport'] },
  'fastef': { category: 'concours', name: 'Concours FASTEF', icon: '👨‍🏫', subjects: ['general', 'french', 'philosophy'], level: 'concours', description: 'Formation des Enseignants', concours: 'FASTEF',
    topics: ['Pedagogie', 'Didactique', 'Culture Generale', 'Discipline principale'] },
  'cesti': { category: 'concours', name: 'Concours CESTI', icon: '📰', subjects: ['general', 'french', 'english'], level: 'concours', description: 'Ecole de Journalisme - UCAD', concours: 'CESTI',
    topics: ['Culture Generale', 'Francais', 'Anglais', 'Actualites', 'Dissertation'] },
}

// Get parcours by ID
export const getParcours = (id) => PARCOURS[id] || null

// Get all parcours for a category
export const getParcoursForCategory = (categoryId) => {
  return Object.entries(PARCOURS)
    .filter(([_, p]) => p.category === categoryId)
    .map(([id, p]) => ({ id, ...p }))
}

// Get subjects for a parcours
export const getSubjectsForParcours = (parcoursId) => {
  const p = PARCOURS[parcoursId]
  return p ? p.subjects : ['math', 'french', 'general']
}

// Get quiz battle level for a parcours
export const getBattleLevel = (parcoursId) => {
  const p = PARCOURS[parcoursId]
  if (!p) return 'bac'
  return p.level
}

// Get AI system prompt addition for a parcours
export const getParcoursPrompt = (parcoursId) => {
  const p = PARCOURS[parcoursId]
  if (!p) return ''

  let prompt = `\n\nPARCOURS DE L'ETUDIANT: ${p.description}\nNiveau: ${p.level.toUpperCase()}`

  if (p.topics) {
    prompt += `\nMatieres specifiques: ${p.topics.join(', ')}`
  }

  if (p.level === 'universite') {
    prompt += `\nIMPORTANT: L'etudiant est a l'universite. Reponds avec un niveau UNIVERSITAIRE avance, pas un niveau lycee. Utilise le vocabulaire technique et les concepts approfondis.`
  }

  if (p.level === 'concours') {
    prompt += `\nIMPORTANT: L'etudiant prepare un CONCOURS. Les reponses doivent etre au niveau du concours, avec rigueur et precision. Inclure des methodes de dissertation, note de synthese, et culture generale approfondie.`
  }

  if (p.level === 'college') {
    prompt += `\nIMPORTANT: L'etudiant est au college. Explique de maniere simple et accessible. Pas de concepts avances.`
  }

  return prompt
}
