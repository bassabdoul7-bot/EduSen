import { useState } from 'react'
import { Bot, Lightbulb, ChevronRight, HelpCircle, AlertTriangle, CheckCircle, Ruler, ShoppingCart, Briefcase, TrendingUp, Globe } from 'lucide-react'

const experimentHints = {
  "acid-base": {
    intro: "Titration acide-base: Neutraliser exactement 25mL de HCl 0.1M avec NaOH 0.1M. Objectif: Atteindre pH = 7",
    realWorld: {
      careers: [
        { title: "Chimiste Analyste", salary: "400,000-800,000 FCFA/mois", description: "Industries Chimiques Sénégal (ICS), SOCOCIM - Contrôle qualité produits" },
        { title: "Pharmacien", salary: "600,000-1,200,000 FCFA/mois", description: "Pharmacies, hôpitaux - Préparation médicaments, contrôle pH" },
        { title: "Ingénieur Agronome", salary: "450,000-900,000 FCFA/mois", description: "ISRA, CSS - Analyse pH sols pour agriculture" }
      ],
      industries: [
        { name: "Pharmaceutique", companies: "SEDIMA, VALDAFRIQUE", use: "Fabrication médicaments - pH sanguin (7.35-7.45) = VIE/MORT" },
        { name: "Agriculture", companies: "CSS, SODEFITEX", use: "pH sol optimal: Arachide (6.0-6.5), Riz (5.5-6.5). Mauvais pH = récolte ratée!" },
        { name: "Traitement Eau", companies: "SDE, SONES", use: "Eau potable pH 6.5-8.5. Hors norme = maladies, corrosion tuyaux" },
        { name: "Cosmétique", companies: "Unilever Sénégal", use: "Savons, crèmes - pH peau = 5.5. Produit pH 10 = brûlures!" }
      ],
      impact: "🌍 IMPACT: Chaque jour, 1000+ analyses pH au Sénégal sauvent des vies (hôpitaux), protègent cultures (agriculture), purifient eau (SDE). Maîtriser titration = emploi GARANTI!",
      realExample: "💡 CAS RÉEL SÉNÉGAL: En 2019, mauvais pH engrais → 30% pertes récolte arachide Kaolack. Ingénieurs ICS ont titré, corrigé pH → récolte sauvée, 500M FCFA économisés!"
    },
    equipment: {
      items: [
        { name: "Erlenmeyer 250mL", where: "Pharmacie locale, VWR, Sigma-Aldrich", price: "3000-5000 FCFA", alternative: "Bouteille en verre propre" },
        { name: "Burette graduée 50mL", where: "Fournisseurs scientifiques (VWR, Fisher)", price: "15000-25000 FCFA", alternative: "Seringue graduée 50mL" },
        { name: "HCl 0.1M (500mL)", where: "Pharmacie, boutiques chimie Dakar", price: "2000-4000 FCFA", safety: "⚠️ CORROSIF - gants obligatoires" },
        { name: "NaOH 0.1M (500mL)", where: "Pharmacie, marchés chimie", price: "2500-4500 FCFA", safety: "⚠️ TRÈS CORROSIF - lunettes + gants" },
        { name: "Phénolphtaléine", where: "Pharmacie", price: "1500-3000 FCFA", alternative: "Jus de chou rouge (naturel)" }
      ],
      totalCost: "≈ 25,000-40,000 FCFA pour tout le matériel",
      suppliers: "Sénégal: Pharmacies Dakar, marchés Sandaga. En ligne: VWR.com, Sigma-Aldrich"
    },
    steps: [
      { 
        hint: "Versez EXACTEMENT 25.0mL d'acide chlorhydrique (HCl) dans l'erlenmeyer", 
        action: "Cliquez sur la bouteille rouge HCl",
        measurement: "Volume: 25.0mL ±0.5mL",
        why: "POURQUOI 25mL? Volume standard en titration - facile à calculer (0.025L × 0.1M = 0.0025 moles H⁺). Assez grand pour minimiser l'erreur (2% avec pipette), assez petit pour économiser réactifs coûteux.",
        science: "HCl est un acide fort: HCl → H⁺ + Cl⁻. Concentration 0.1M signifie 0.1 mole/litre. pH initial ≈ 1"
      },
      { 
        hint: "Ajoutez EXACTEMENT 3 gouttes d'indicateur phénolphtaléine", 
        action: "Cliquez sur la bouteille violette",
        measurement: "3 gouttes (≈ 0.15mL total)",
        why: "POURQUOI 3 gouttes? Chaque goutte ≈ 0.05mL. 3 gouttes suffisent pour colorer 25mL sans fausser le pH. Plus de gouttes = gaspillage + couleur trop foncée difficile à observer. Moins = virage invisible.",
        science: "Phénolphtaléine: incolore si pH<8.2, rose si pH>10. Zone de virage parfaite pour acide fort + base forte."
      },
      { 
        hint: "Versez NaOH 0.1M goutte à goutte jusqu'au virage rose PALE", 
        action: "Cliquez sur la bouteille bleue NaOH - LENTEMENT!",
        measurement: "Volume équivalence théorique: 25.0mL (accepté: 24.5-25.5mL)",
        why: "POURQUOI goutte à goutte? Près de l'équivalence, UNE SEULE goutte (0.05mL) peut faire passer pH de 4 à 10! Si vous versez vite, vous dépassez l'équivalence et faussez résultats. Patience = précision!",
        science: "Neutralisation: H⁺ + OH⁻ → H₂O. À l'équivalence: n(H⁺) = n(OH⁻), donc V₁C₁ = V₂C₂ → 25×0.1 = V₂×0.1 → V₂ = 25mL"
      },
      { 
        hint: "STOP! Observez le rose PALE persistant (>10 secondes)", 
        action: "Notez le volume exact versé sur la burette",
        measurement: "Volume lu: ___ mL (précision: 0.1mL)",
        why: "POURQUOI rose PALE et pas foncé? Rose PALE = pH ≈ 8.5 (proche de 7). Rose FONCÉ = pH > 11 (trop de base, équivalence dépassée). La précision ±0.1mL sur 25mL = erreur <0.5% - excellent!",
        science: "Point d'équivalence atteint! pH ≈ 7. Calcul: Si V = 25.3mL, erreur = +0.3mL = +1.2%. Acceptable en laboratoire lycée."
      }
    ]
  },
  "precipitation": {
    intro: "Formation de chlorure d'argent (AgCl). Réaction: Ag⁺ + Cl⁻ → AgCl(s) précipité blanc",
    realWorld: {
      careers: [
        { title: "Ingénieur Mines", salary: "800,000-1,500,000 FCFA/mois", description: "Sabodala Gold, Grande Côte Operations - Extraction or par précipitation" },
        { title: "Technicien Labo Médical", salary: "300,000-600,000 FCFA/mois", description: "Hôpitaux, cliniques - Tests sanguins (précipitation anticorps)" },
        { title: "Chimiste Environnement", salary: "450,000-850,000 FCFA/mois", description: "Direction Environnement - Traiter eaux polluées par métaux lourds" }
      ],
      industries: [
        { name: "Mines d'Or", companies: "Sabodala, Mako", use: "Extraction or: Au³⁺ + 3Cl⁻ → AuCl₃ (précipitation). Technique qui génère 300 milliards FCFA/an!" },
        { name: "Traitement Eaux Usées", companies: "ONAS", use: "Éliminer métaux lourds (Pb²⁺, Hg²⁺) par précipitation = eau potable" },
        { name: "Photographie", companies: "Studios photo Dakar", use: "Films argentiques utilisent AgBr (précipitation argent)" },
        { name: "Médecine", companies: "Hôpitaux", use: "Tests diagnostic: précipitation = détecter maladies (diabète, insuffisance rénale)" }
      ],
      impact: "💰 MINES = 10% PIB SÉNÉGAL! Précipitation extrait or, phosphates (ICS produit 1M tonnes/an). Sans cette technique = PAS de mines, PAS d'emplois!",
      realExample: "🏆 Sabodala Gold: Précipitation or récupère 95% métal. 1 tonne minerai → 5g or pur → 2M FCFA. Technique précipitation = richesse du Sénégal!"
    },
    equipment: {
      items: [
        { name: "Bécher 250mL", where: "Pharmacie, VWR", price: "2500-4000 FCFA", alternative: "Verre à pied propre" },
        { name: "AgNO₃ 0.2M (100mL)", where: "Fournisseurs chimie spécialisés", price: "8000-15000 FCFA", safety: "⚠️ Tache peau noir - gants!" },
        { name: "NaCl 0.2M (100mL)", where: "Préparer soi-même: 1.17g sel/100mL eau", price: "200 FCFA", safety: "✅ Sans danger" },
        { name: "Papier filtre", where: "Pharmacie, boutiques sciences", price: "500-1000 FCFA/paquet", alternative: "Café filtre" },
        { name: "Entonnoir", where: "Pharmacie", price: "1500-3000 FCFA", alternative: "Bouteille plastique coupée" }
      ],
      totalCost: "≈ 15,000-25,000 FCFA",
      suppliers: "AgNO₃ cher - commander groupé avec école"
    },
    steps: [
      { hint: "Versez 50mL AgNO₃ 0.2M", measurement: "50mL", why: "50mL × 0.2M = 10 millimoles Ag⁺ → 1.43g AgCl visible", science: "AgNO₃ → Ag⁺ + NO₃⁻" },
      { hint: "Ajoutez 50mL NaCl 0.2M", measurement: "50mL ratio 1:1", why: "Même moles Ag⁺ et Cl⁻ = réaction complète", science: "Ag⁺ + Cl⁻ → AgCl(s)" },
      { hint: "Observez précipité blanc", measurement: "≈1.43g théorique", why: "10 mmol × 143.5g/mol = 1.435g", science: "AgCl insoluble, blanc laiteux" },
      { hint: "Filtrez AgCl", measurement: "Rendement 95%", why: "Séparer solide du liquide. AgCl pur récupérable", science: "Filtration mécanique" }
    ]
  },
  "simple-circuit": {
    intro: "Circuit série: Pile + Résistance + Ampoule. Loi d'Ohm: U = R × I",
    realWorld: {
      careers: [
        { title: "Électricien Bâtiment", salary: "350,000-700,000 FCFA/mois", description: "SENELEC, entreprises construction - Installer circuits électriques" },
        { title: "Technicien Télécom", salary: "400,000-800,000 FCFA/mois", description: "Orange, Free, Expresso - Réseaux téléphoniques, antennes" },
        { title: "Ingénieur Électronique", salary: "600,000-1,200,000 FCFA/mois", description: "Samsung, Huawei - Conception circuits smartphones, ordinateurs" }
      ],
      industries: [
        { name: "Distribution Électricité", companies: "SENELEC", use: "Circuits alimentent 3M Sénégalais. Loi d'Ohm = base TOUT réseau électrique!" },
        { name: "Télécommunications", companies: "Orange, Free", use: "Antennes 4G, fibre optique - circuits électroniques partout. Sans électronique = PAS de téléphone!" },
        { name: "Automobile", companies: "Garages, ateliers", use: "Circuits électriques voiture: batterie, démarreur, phares. 1 voiture = 100+ circuits!" },
        { name: "Énergies Renouvelables", companies: "SENELEC solaire, Senergy", use: "Panneaux solaires → circuits → batteries. Avenir énergétique Sénégal!" }
      ],
      impact: "⚡ 95% appareils quotidiens = circuits électriques! Téléphone, frigo, télé, lampe. Pas de circuits = retour âge pierre!",
      realExample: "🌞 PROJET SENEGAL: 200,000 foyers équipés panneaux solaires (2024). Chaque installation = circuits série/parallèle. Techniciens formés = 5000 emplois créés!"
    },
    equipment: {
      items: [
        { name: "Pile 9V", where: "Boutique, supermarché", price: "500-1500 FCFA", alternative: "3 piles AA en série" },
        { name: "Résistance 100Ω", where: "Marché Sandaga électronique", price: "25-50 FCFA", alternative: "Fil fer résistif" },
        { name: "Ampoule 6V 0.5W", where: "Quincaillerie", price: "200-500 FCFA", alternative: "LED + résistance 330Ω" },
        { name: "Fils connexion", where: "Marché électronique", price: "500-1000 FCFA/rouleau", alternative: "Câbles téléphone" },
        { name: "Multimètre", where: "Sandaga", price: "3000-8000 FCFA", note: "Mesurer V, I, R" }
      ],
      totalCost: "≈ 5,000-12,000 FCFA",
      suppliers: "Marché Sandaga = paradis électronique Dakar!"
    },
    steps: [
      { hint: "Connectez pile 9V", measurement: "U = 9V", why: "9V = suffisant allumer ampoule, sûr (courant faible)", science: "Pile = source tension" },
      { hint: "Ajoutez résistance 100Ω", measurement: "R = 100Ω", why: "Protège circuit! I = 9V/100Ω = 90mA. Sans R → ampoule GRILLE!", science: "Loi d'Ohm: U = RI" },
      { hint: "Connectez ampoule", measurement: "P ≈ 0.81W", why: "Circuit fermé → courant circule → lumière! Rendement 5%", science: "Effet Joule: électricité → chaleur + lumière" }
    ]
  }
}

export function LabTutor({ experimentId, currentStep }) {
  const [expanded, setExpanded] = useState(true)
  const [showScience, setShowScience] = useState(false)
  const [showWhy, setShowWhy] = useState(false)
  const [showEquipment, setShowEquipment] = useState(false)
  const [showRealWorld, setShowRealWorld] = useState(false)
  
  const hints = experimentHints[experimentId]
  
  if (!hints) return null
  
  const stepData = hints.steps[Math.min(currentStep, hints.steps.length - 1)]
  const progress = ((currentStep + 1) / hints.steps.length) * 100
  
  return (
    <div className="fixed left-4 top-20 w-[440px] z-50 max-h-[calc(100vh-100px)] overflow-y-auto">
      <div 
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 py-3 rounded-t-xl flex items-center gap-3 cursor-pointer shadow-2xl sticky top-0 z-10"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
          <Bot className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-lg">Ziz - Tuteur Expert</div>
          <div className="text-xs text-blue-100">Assistant Laboratoire IA</div>
        </div>
        <ChevronRight className={`w-5 h-5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>
      
      {expanded && (
        <div className="bg-white rounded-b-xl shadow-2xl border-2 border-blue-100">
          {/* REAL WORLD SECTION - NEW! */}
          {hints.realWorld && (
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
              <button
                onClick={() => setShowRealWorld(!showRealWorld)}
                className="flex items-center gap-2 text-xs text-emerald-700 hover:text-emerald-900 font-bold w-full"
              >
                <Briefcase className="w-4 h-4" />
                <span className="flex-1 text-left">💼 CARRIÈRES & IMPACT RÉEL (IMPORTANT!)</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${showRealWorld ? 'rotate-90' : ''}`} />
              </button>
              
              {showRealWorld && (
                <div className="mt-3 p-3 bg-white rounded-lg border-2 border-emerald-400 shadow-sm">
                  {/* Careers */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-700">CARRIÈRES POSSIBLES:</span>
                    </div>
                    {hints.realWorld.careers.map((career, i) => (
                      <div key={i} className="mb-2 p-2 bg-emerald-50 rounded">
                        <div className="font-bold text-sm text-gray-800">{career.title}</div>
                        <div className="text-xs text-emerald-700 font-bold">💰 {career.salary}</div>
                        <div className="text-xs text-gray-600">{career.description}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Industries */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold text-blue-700">INDUSTRIES QUI UTILISENT:</span>
                    </div>
                    {hints.realWorld.industries.map((ind, i) => (
                      <div key={i} className="mb-2 p-2 bg-blue-50 rounded">
                        <div className="font-bold text-sm text-gray-800">{ind.name}</div>
                        <div className="text-xs text-blue-700">🏢 {ind.companies}</div>
                        <div className="text-xs text-gray-600 mt-1">{ind.use}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Impact */}
                  <div className="mb-3 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border-2 border-yellow-400">
                    <div className="text-xs font-bold text-orange-800">{hints.realWorld.impact}</div>
                  </div>
                  
                  {/* Real Example */}
                  <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-400">
                    <div className="text-xs font-bold text-green-800">{hints.realWorld.realExample}</div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Equipment */}
          {hints.equipment && (
            <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
              <button
                onClick={() => setShowEquipment(!showEquipment)}
                className="flex items-center gap-2 text-xs text-purple-600 hover:text-purple-800 font-bold w-full"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="flex-1 text-left">🛒 MATÉRIEL - Où acheter?</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${showEquipment ? 'rotate-90' : ''}`} />
              </button>
              
              {showEquipment && (
                <div className="mt-3 p-3 bg-white rounded-lg border-2 border-purple-300 shadow-sm max-h-60 overflow-y-auto">
                  {hints.equipment.items.map((item, i) => (
                    <div key={i} className="mb-3 pb-3 border-b last:border-0">
                      <div className="font-bold text-sm text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        <div>📍 {item.where}</div>
                        <div>💰 {item.price}</div>
                        {item.alternative && <div>🔄 {item.alternative}</div>}
                        {item.safety && <div className="mt-1 text-red-600 font-bold">{item.safety}</div>}
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t-2">
                    <div className="text-sm font-bold text-purple-700">💵 Total: {hints.equipment.totalCost}</div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Intro */}
          {currentStep === 0 && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                <p className="text-sm text-blue-900 font-medium leading-relaxed">{hints.intro}</p>
              </div>
            </div>
          )}
          
          {/* Main Instruction */}
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-b-2 border-orange-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-orange-600 uppercase mb-1">
                  ÉTAPE {currentStep + 1}/{hints.steps.length}
                </div>
                <p className="text-sm font-bold text-gray-900 leading-relaxed">
                  {stepData.hint}
                </p>
                {stepData.action && (
                  <div className="mt-2 p-2 bg-white rounded-lg border-2 border-orange-300">
                    <div className="text-xs font-semibold text-orange-700">🎯 ACTION:</div>
                    <p className="text-xs text-gray-700 font-medium">{stepData.action}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Measurements */}
          {stepData.measurement && (
            <div className="px-4 py-3 bg-green-50 border-b-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-4 h-4 text-green-600" />
                <span className="text-xs font-bold text-green-700">MESURES</span>
              </div>
              <div className="p-3 bg-white rounded-lg border-2 border-green-300">
                <p className="text-sm font-mono font-bold text-green-900">{stepData.measurement}</p>
              </div>
            </div>
          )}
          
          {/* WHY */}
          {stepData.why && (
            <div className="px-4 py-3 bg-amber-50 border-b-2 border-amber-200">
              <button
                onClick={() => setShowWhy(!showWhy)}
                className="flex items-center gap-2 text-xs text-amber-700 hover:text-amber-900 font-bold w-full"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="flex-1 text-left">💡 POURQUOI?</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${showWhy ? 'rotate-90' : ''}`} />
              </button>
              
              {showWhy && (
                <div className="mt-3 p-3 bg-white rounded-lg border-2 border-amber-400">
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">{stepData.why}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Science */}
          {stepData.science && (
            <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-200">
              <button
                onClick={() => setShowScience(!showScience)}
                className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 font-bold w-full"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="flex-1 text-left">📚 SCIENCE</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${showScience ? 'rotate-90' : ''}`} />
              </button>
              
              {showScience && (
                <div className="mt-3 p-3 bg-white rounded-lg border-2 border-indigo-300">
                  <p className="text-xs text-indigo-900 leading-relaxed">{stepData.science}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Progress */}
          <div className="px-4 py-3 bg-gray-50 rounded-b-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-600">Progression</span>
              <span className="text-xs font-bold text-indigo-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Étape {currentStep + 1}/{hints.steps.length}
              {currentStep === hints.steps.length - 1 && <span className="ml-2 text-green-600 font-bold">🎉 Terminé!</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}