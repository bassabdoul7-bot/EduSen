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
      steps: ['Verser HCl', 'Ajouter indicateur', 'Ajouter NaOH', 'Observer neutralisation'],
      classe: 'Terminale S',
      chapter: 'Reactions acido-basiques',
      materiel: [
        'Becher: recipient en verre pour contenir les solutions',
        'Burette: tube gradue pour verser NaOH goutte a goutte',
        'Solution HCl: acide chlorhydrique (corrosif)',
        'Solution NaOH: hydroxyde de sodium (base forte)',
        'Phenolphtaleine: indicateur colore (incolore/rose)'
      ],
      learned: [
        'Le point d equivalence: n(acide) = n(base)',
        'L indicateur colore change au pH de virage',
        'Calcul de concentration: C = n/V'
      ],
      formulas: ['pH = -log[H+]', 'C1.V1 = C2.V2', 'n = C x V'],
      realLife: [
        'Controle qualite en industrie alimentaire',
        'Analyse de l eau potable',
        'Tests medicaux (acidite du sang)'
      ],
      bacQuestions: [
        'Calculer la concentration d une solution acide',
        'Determiner le volume a l equivalence'
      ]
    },
    {
      id: 'combustion',
      name: 'Combustion du Magnesium',
      description: 'Reaction de combustion vive avec lumiere intense',
      difficulty: 'Moyen',
      level: 'lycee',
      duration: '8 min',
      steps: ['Allumer bec Bunsen', 'Approcher magnesium', 'Observer combustion', 'Noter MgO'],
      classe: 'Seconde',
      chapter: 'Transformations chimiques',
      materiel: [
        'Bec Bunsen: bruleur a gaz pour chauffer',
        'Pince metallique: tenir le magnesium en securite',
        'Ruban de magnesium (Mg): metal leger et reactif',
        'Briquet: allumer le bec Bunsen'
      ],
      learned: [
        'La combustion necessite un combustible (Mg) et du dioxygene (O2 de l air)',
        'Le dioxygene O2 represente 21% de l air que nous respirons',
        'Reaction exothermique: produit lumiere intense et chaleur',
        'Le magnesium brule avec une flamme blanche eclatante',
        'Produit final: oxyde de magnesium MgO (poudre blanche)'
      ],
      formulas: ['2Mg + O2 -> 2MgO'],
      realLife: [
        'Feux d artifice et fusees eclairantes',
        'Soudure industrielle',
        'Flashs photographiques anciens'
      ],
      bacQuestions: [
        'Ecrire et equilibrer l equation de combustion',
        'Identifier reactifs et produits'
      ]
    },
    {
      id: 'spectrophotometry',
      name: 'Spectrophotometrie UV-Vis',
      description: 'Mesure absorbance et loi de Beer-Lambert',
      difficulty: 'Avance',
      level: 'universite',
      duration: '20 min',
      steps: ['Inserer blanc', 'Calibrer', 'Inserer echantillon', 'Regler lambda', 'Mesurer A'],
      classe: 'Licence Chimie',
      chapter: 'Chimie analytique',
      materiel: [
        'Spectrophotometre: mesure l absorbance',
        'Cuvettes: contiennent les solutions (quartz ou plastique)',
        'Solution blanc: reference (solvant pur)',
        'Solution echantillon: substance a analyser'
      ],
      learned: [
        'Loi de Beer-Lambert: A = epsilon * l * c',
        'Absorbance proportionnelle a la concentration',
        'Chaque molecule a un spectre d absorption unique',
        'Lambda max = longueur d onde d absorption maximale'
      ],
      formulas: ['A = epsilon * l * c', 'A = log(I0/I)', 'T = I/I0 = 10^(-A)'],
      realLife: [
        'Analyse de sang en laboratoire medical',
        'Controle qualite en industrie pharmaceutique',
        'Detection de polluants dans l eau'
      ],
      bacQuestions: [
        'Calculer la concentration par Beer-Lambert',
        'Tracer une courbe d etalonnage'
      ]
    },
    {
      id: 'galvanic-cell',
      name: 'Pile Electrochimique',
      description: 'Pile Daniell - Oxydoreduction et potentiel',
      difficulty: 'Avance',
      level: 'universite',
      duration: '15 min',
      steps: ['Placer Zn', 'Placer Cu', 'Connecter pont salin', 'Brancher voltmetre', 'Mesurer E'],
      classe: 'Licence Chimie',
      chapter: 'Electrochimie',
      materiel: [
        'Electrode de zinc (Zn): anode, s oxyde',
        'Electrode de cuivre (Cu): cathode, se reduit',
        'Solution ZnSO4: electrolyte cote zinc',
        'Solution CuSO4: electrolyte cote cuivre (bleu)',
        'Pont salin (KNO3): permet le passage des ions',
        'Voltmetre: mesure la f.e.m. de la pile'
      ],
      learned: [
        'Oxydation a l anode: Zn -> Zn2+ + 2e-',
        'Reduction a la cathode: Cu2+ + 2e- -> Cu',
        'f.e.m. = E(cathode) - E(anode) = 1.10V',
        'Le pont salin assure la neutralite electrique'
      ],
      formulas: ['E = E(Cu) - E(Zn) = 0.34 - (-0.76) = 1.10V', 'Zn + Cu2+ -> Zn2+ + Cu'],
      realLife: [
        'Piles et batteries (telephone, voiture)',
        'Protection cathodique (bateaux, pipelines)',
        'Electroplaquage (bijoux, pieces auto)'
      ],
      bacQuestions: [
        'Identifier anode et cathode',
        'Calculer la f.e.m. d une pile'
      ]
    },
    {
      id: 'chromatography',
      name: 'Chromatographie CCM',
      description: 'Separation de pigments vegetaux',
      difficulty: 'Moyen',
      level: 'universite',
      duration: '25 min',
      steps: ['Preparer extrait', 'Deposer echantillon', 'Ajouter eluant', 'Migration', 'Calculer Rf'],
      classe: 'Licence Chimie',
      chapter: 'Chimie analytique - Separation',
      materiel: [
        'Plaque CCM: phase stationnaire (silice)',
        'Cuve a chromatographie: contient l eluant',
        'Eluant: phase mobile (solvant organique)',
        'Capillaire: pour deposer l echantillon',
        'Extrait vegetal: melange de pigments'
      ],
      learned: [
        'Separation basee sur l affinite avec les phases',
        'Rf = distance substance / distance front solvant',
        'Chaque compose a un Rf caracteristique',
        'Pigments: chlorophylles (vert), carotenes (orange), xanthophylles (jaune)'
      ],
      formulas: ['Rf = d(substance) / d(front)', '0 < Rf < 1'],
      realLife: [
        'Controle anti-dopage (sport)',
        'Analyse de drogues en criminalistique',
        'Controle qualite en agroalimentaire'
      ],
      bacQuestions: [
        'Calculer le Rf d un compose',
        'Identifier un compose par son Rf'
      ]
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
      steps: ['Placer pile', 'Connecter resistance', 'Connecter ampoule', 'Calculer I'],
      classe: 'Seconde',
      chapter: 'Electricite - Lois fondamentales',
      materiel: [
        'Pile 9V: generateur de tension continue',
        'Resistance 100 Ohms: limite le courant',
        'Ampoule: convertit electricite en lumiere',
        'Fils conducteurs: transportent le courant'
      ],
      learned: [
        'Loi d Ohm: U = R x I (tension = resistance x intensite)',
        'Le courant circule du + vers le - (sens conventionnel)',
        'En serie: le courant est le meme partout',
        'La resistance limite l intensite du courant'
      ],
      formulas: ['U = R x I', 'I = U / R', 'P = U x I'],
      realLife: [
        'Installation electrique de la maison',
        'Circuits des telephones et ordinateurs',
        'Eclairage automobile et domestique'
      ],
      bacQuestions: [
        'Calculer l intensite dans un circuit serie',
        'Determiner la resistance equivalente'
      ]
    },
    {
      id: 'parallel-circuit',
      name: 'Circuit en Parallele',
      description: 'Loi des noeuds et resistances en parallele',
      difficulty: 'Moyen',
      level: 'lycee',
      duration: '15 min',
      steps: ['Placer pile', 'Connecter R1', 'Connecter R2 en parallele', 'Connecter ampoules', 'Mesurer I total'],
      classe: 'Premiere S',
      chapter: 'Electricite - Circuits en derivation',
      materiel: [
        'Pile 9V: generateur de tension continue',
        'Resistance R1 (100 Ohms): premiere branche',
        'Resistance R2 (200 Ohms): deuxieme branche',
        'Deux ampoules: montees en parallele',
        'Amperemetre: mesure le courant total'
      ],
      learned: [
        'En parallele: la tension est la meme partout',
        'Loi des noeuds: I_total = I1 + I2',
        'Resistance equivalente: 1/Req = 1/R1 + 1/R2',
        'Si une branche casse, l autre fonctionne encore'
      ],
      formulas: ['1/Req = 1/R1 + 1/R2', 'I_total = I1 + I2', 'U = U1 = U2'],
      realLife: [
        'Prises electriques de la maison (toutes en parallele)',
        'Guirlandes LED modernes',
        'Circuits de securite automobile'
      ],
      bacQuestions: [
        'Calculer la resistance equivalente en parallele',
        'Appliquer la loi des noeuds'
      ]
    },
    {
      id: 'pendulum',
      name: 'Pendule Simple',
      description: 'Mesure periode T = 2pi*sqrt(L/g)',
      difficulty: 'Facile',
      level: 'lycee',
      duration: '12 min',
      steps: ['Attacher ficelle', 'Fixer masse', 'Lancer oscillation', 'Mesurer periode'],
      classe: 'Terminale S',
      chapter: 'Mecanique - Oscillations',
      materiel: [
        'Support avec potence: maintient le pendule',
        'Ficelle inextensible: relie la masse au support',
        'Masse spherique: objet oscillant (bille)',
        'Chronometre: mesure la periode T'
      ],
      learned: [
        'La periode T depend de la longueur L et de g',
        'T ne depend PAS de la masse (isochronisme)',
        'Formule: T = 2*pi*sqrt(L/g)',
        'Valable pour petites oscillations (< 10 degres)'
      ],
      formulas: ['T = 2*pi*sqrt(L/g)', 'g = 4*pi^2*L/T^2', 'f = 1/T'],
      realLife: [
        'Horloges a balancier (precision)',
        'Sismographes (detection tremblements)',
        'Mesure de la gravite locale'
      ],
      bacQuestions: [
        'Calculer la periode d un pendule',
        'Determiner g a partir des mesures'
      ]
    },
    {
      id: 'double-slit',
      name: 'Fentes de Young',
      description: 'Interference lumineuse',
      difficulty: 'Avance',
      level: 'universite',
      duration: '20 min',
      steps: ['Allumer laser', 'Aligner fentes', 'Placer ecran', 'Observer franges'],
      classe: 'Licence Physique',
      chapter: 'Optique ondulatoire',
      materiel: [
        'Laser He-Ne: source de lumiere coherente (rouge 632nm)',
        'Fentes de Young: deux fentes paralleles tres proches',
        'Ecran blanc: pour observer les franges',
        'Banc optique: support pour aligner les elements'
      ],
      learned: [
        'La lumiere a un comportement ondulatoire',
        'Interference constructive = franges brillantes',
        'Interference destructive = franges sombres',
        'L interfrange depend de lambda, D et a'
      ],
      formulas: ['i = lambda*D/a', 'delta = a*sin(theta)', 'I = 4*I0*cos^2(pi*a*x/(lambda*D))'],
      realLife: [
        'Holographie et imagerie 3D',
        'Interferometrie pour mesures de precision',
        'Detection d ondes gravitationnelles (LIGO)'
      ],
      bacQuestions: [
        'Calculer l interfrange',
        'Expliquer la difference constructive/destructive'
      ]
    },
    {
      id: 'rlc-circuit',
      name: 'Circuit RLC - Resonance',
      description: 'Resonance en circuit RLC serie',
      difficulty: 'Avance',
      level: 'universite',
      duration: '25 min',
      steps: ['Connecter R', 'Connecter L', 'Connecter C', 'Brancher GBF', 'Connecter oscillo', 'Trouver f0'],
      classe: 'Licence Physique',
      chapter: 'Electricite - Circuits AC',
      materiel: [
        'Resistance R: dissipe l energie (Ohms)',
        'Bobine L: inductance, stocke energie magnetique (Henry)',
        'Condensateur C: stocke energie electrique (Farad)',
        'GBF: generateur basse frequence (signal AC)',
        'Oscilloscope: visualise les signaux'
      ],
      learned: [
        'A la resonance, l impedance est minimale',
        'Frequence de resonance: f0 = 1/(2*pi*sqrt(LC))',
        'Le facteur de qualite Q mesure la selectivite',
        'Applications: radio, filtres, telecommunications'
      ],
      formulas: ['f0 = 1/(2*pi*sqrt(LC))', 'Z = sqrt(R^2 + (Lw - 1/Cw)^2)', 'Q = L*w0/R'],
      realLife: [
        'Tuner radio (selection de frequence)',
        'Filtres audio (basses, aigus)',
        'Circuits de telecommunications'
      ],
      bacQuestions: [
        'Calculer la frequence de resonance',
        'Tracer la courbe de resonance'
      ]
    },
    {
      id: 'photoelectric',
      name: 'Effet Photoelectrique',
      description: 'Emission electrons par lumiere',
      difficulty: 'Avance',
      level: 'universite',
      duration: '20 min',
      steps: ['Placer cathode', 'Connecter circuit', 'Allumer lumiere', 'Varier frequence', 'Mesurer courant', 'Trouver seuil'],
      classe: 'Licence Physique',
      chapter: 'Physique quantique',
      materiel: [
        'Cellule photoelectrique: cathode metallique dans le vide',
        'Source lumineuse variable: frequence ajustable',
        'Amperemetre: mesure le photocourant',
        'Voltmetre: mesure la tension d arret'
      ],
      learned: [
        'La lumiere est composee de photons (E = h*f)',
        'Effet seuil: frequence minimale pour ejecter electrons',
        'L energie cinetique depend de la frequence, pas de l intensite',
        'Preuve de la nature quantique de la lumiere (Einstein 1905)'
      ],
      formulas: ['E = h*f', 'Ec = h*f - W', 'f_seuil = W/h'],
      realLife: [
        'Panneaux solaires photovoltaiques',
        'Capteurs de lumiere (cameras)',
        'Portes automatiques (detecteurs)'
      ],
      bacQuestions: [
        'Calculer l energie d un photon',
        'Determiner le travail d extraction'
      ]
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
      steps: ['Preparer lame', 'Ajouter colorant', 'Placer lamelle', 'Observer x10', 'Observer x40'],
      classe: 'Seconde',
      chapter: 'La cellule - unite du vivant',
      materiel: [
        'Microscope optique: grossit jusqu a 400x',
        'Lame porte-objet: support en verre pour l echantillon',
        'Lamelle couvre-objet: protege l echantillon',
        'Bleu de methylene: colorant pour le noyau',
        'Oignon ou elodee: source de cellules vegetales'
      ],
      learned: [
        'La cellule est l unite de base du vivant',
        'Cellule vegetale: paroi, chloroplastes, vacuole',
        'Le noyau contient l information genetique'
      ],
      formulas: ['Grossissement = Oculaire x Objectif'],
      realLife: [
        'Diagnostic medical (analyse de sang)',
        'Recherche sur le cancer',
        'Controle qualite alimentaire'
      ],
      bacQuestions: [
        'Identifier les organites d une cellule',
        'Comparer cellule animale et vegetale'
      ]
    },
    {
      id: 'photosynthesis',
      name: 'Photosynthese',
      description: 'Mise en evidence de la photosynthese',
      difficulty: 'Moyen',
      level: 'lycee',
      duration: '20 min',
      steps: ['Preparer elodee', 'Placer sous lumiere', 'Observer bulles O2', 'Comparer obscurite'],
      classe: 'Seconde',
      chapter: 'Metabolisme cellulaire',
      materiel: [
        'Elodee (plante aquatique): produit O2 visible',
        'Becher avec eau: milieu aquatique',
        'Lampe: source de lumiere pour la reaction',
        'Entonnoir + tube: collecte les bulles d O2',
        'Boite noire: pour comparer avec obscurite'
      ],
      learned: [
        'La photosynthese produit O2 et glucose',
        'Elle necessite lumiere, CO2 et eau',
        'Les chloroplastes sont le siege de la reaction'
      ],
      formulas: ['6CO2 + 6H2O + lumiere -> C6H12O6 + 6O2'],
      realLife: [
        'Production agricole et rendement',
        'Cycle du carbone et climat',
        'Biocarburants et energie verte'
      ],
      bacQuestions: [
        'Expliquer le role de la lumiere',
        'Schema du mecanisme de photosynthese'
      ]
    },
    {
      id: 'gel-electrophoresis',
      name: 'Electrophorese sur Gel',
      description: 'Separation fragments ADN',
      difficulty: 'Avance',
      level: 'universite',
      duration: '30 min',
      steps: ['Preparer gel', 'Charger ADN', 'Alimenter', 'Migration', 'Colorer', 'Visualiser UV'],
      classe: 'Licence Biologie',
      chapter: 'Biologie moleculaire',
      materiel: [
        'Cuve a electrophorese: contient le gel et le tampon',
        'Gel d agarose: matrice de separation',
        'Tampon TBE/TAE: conduit le courant',
        'Micropipette: charge les echantillons',
        'Colorant (BET ou SYBR): revele l ADN',
        'Transilluminateur UV: visualise les bandes'
      ],
      learned: [
        'L ADN migre du - vers le + (charge negative)',
        'Les petits fragments migrent plus vite',
        'Marqueur de taille: permet d estimer la taille des fragments',
        'Applications: PCR, clonage, diagnostic genetique'
      ],
      formulas: ['Mobilite ~ 1/log(taille)', 'Distance = k * log(1/PM)'],
      realLife: [
        'Tests de paternite ADN',
        'Diagnostic de maladies genetiques',
        'Identification criminalistique'
      ],
      bacQuestions: [
        'Expliquer le principe de separation',
        'Interpreter un profil electrophoretique'
      ]
    },
    {
      id: 'microscopy',
      name: 'Microscopie Cellulaire',
      description: 'Observation cellules avec coloration',
      difficulty: 'Moyen',
      level: 'universite',
      duration: '20 min',
      steps: ['Preparer lame', 'Ajouter colorant', 'Placer lamelle', 'Positionner', 'Focus x10', 'Focus x40'],
      classe: 'Licence Biologie',
      chapter: 'Biologie cellulaire',
      materiel: [
        'Microscope optique: grossissement x10 a x1000',
        'Lame porte-objet: support en verre',
        'Lamelle couvre-objet: protege la preparation',
        'Colorants: Gram, bleu de methylene, eosine',
        'Huile a immersion: pour objectif x100'
      ],
      learned: [
        'Technique de coloration Gram: differencie bacteries',
        'Gram+ (violet): paroi epaisse peptidoglycane',
        'Gram- (rose): paroi fine, membrane externe',
        'Mise au point: toujours commencer par x10'
      ],
      formulas: ['Grossissement = Oculaire x Objectif', 'Resolution = 0.61*lambda/ON'],
      realLife: [
        'Diagnostic medical (infections)',
        'Controle qualite microbiologique',
        'Recherche en microbiologie'
      ],
      bacQuestions: [
        'Decrire la technique de coloration Gram',
        'Differencier bacteries Gram+ et Gram-'
      ]
    },
    {
      id: 'enzyme-kinetics',
      name: 'Cinetique Enzymatique',
      description: 'Courbe Michaelis-Menten et Km',
      difficulty: 'Avance',
      level: 'universite',
      duration: '35 min',
      steps: ['Preparer substrats', 'Ajouter enzyme', 'Demarrer reaction', 'Collecter donnees', 'Trouver Vmax', 'Calculer Km'],
      classe: 'Licence Biochimie',
      chapter: 'Enzymologie',
      materiel: [
        'Spectrophotometre: mesure l absorbance',
        'Cuvettes: contiennent les melanges reactionnels',
        'Substrat: molecule transformee par l enzyme',
        'Enzyme: catalyseur biologique',
        'Tampon: maintient le pH optimal',
        'Chronometre: mesure le temps de reaction'
      ],
      learned: [
        'Vmax = vitesse maximale (saturation enzyme)',
        'Km = affinite enzyme-substrat (faible Km = forte affinite)',
        'Equation de Michaelis-Menten: V = Vmax*[S]/(Km+[S])',
        'Linearisation de Lineweaver-Burk pour trouver Km et Vmax'
      ],
      formulas: ['V = Vmax*[S]/(Km+[S])', '1/V = Km/(Vmax*[S]) + 1/Vmax', 'kcat = Vmax/[E]'],
      realLife: [
        'Developpement de medicaments (inhibiteurs)',
        'Diagnostic medical (dosages enzymatiques)',
        'Industrie agroalimentaire (fromage, pain)'
      ],
      bacQuestions: [
        'Tracer la courbe de Michaelis-Menten',
        'Determiner Km et Vmax graphiquement'
      ]
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

























