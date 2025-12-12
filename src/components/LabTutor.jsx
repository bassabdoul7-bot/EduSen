import { useState } from 'react'
import { Bot, Lightbulb, ChevronRight, HelpCircle, AlertTriangle, CheckCircle, Ruler, ShoppingCart } from 'lucide-react'

const experimentHints = {
  "acid-base": {
    intro: "Titration acide-base: Neutraliser exactement 25mL de HCl 0.1M avec NaOH 0.1M. Objectif: Atteindre pH = 7",
    equipment: {
      items: [
        { name: "Erlenmeyer 250mL", where: "Pharmacie locale, VWR, Sigma-Aldrich", price: "3000-5000 FCFA", alternative: "Bouteille en verre propre" },
        { name: "Burette graduée 50mL", where: "Fournisseurs scientifiques (VWR, Fisher)", price: "15000-25000 FCFA", alternative: "Seringue graduée 50mL" },
        { name: "HCl 0.1M (500mL)", where: "Pharmacie, boutiques chimie Dakar", price: "2000-4000 FCFA", safety: "⚠️ CORROSIF - gants obligatoires" },
        { name: "NaOH 0.1M (500mL)", where: "Pharmacie, marchés chimie", price: "2500-4500 FCFA", safety: "⚠️ TRÈS CORROSIF - lunettes + gants" },
        { name: "Phénolphtaléine", where: "Pharmacie", price: "1500-3000 FCFA", alternative: "Jus de chou rouge (naturel)" }
      ],
      totalCost: "≈ 25,000-40,000 FCFA pour tout le matériel",
      suppliers: "Sénégal: Pharmacies Dakar, marchés Sandaga. En ligne: VWR.com, Sigma-Aldrich, Amazon Sciences"
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
    equipment: {
      items: [
        { name: "Bécher 250mL", where: "Pharmacie, VWR", price: "2500-4000 FCFA", alternative: "Verre à pied propre" },
        { name: "AgNO₃ 0.2M (100mL)", where: "Fournisseurs chimie spécialisés", price: "8000-15000 FCFA", safety: "⚠️ Tache peau noir - gants!" },
        { name: "NaCl 0.2M (100mL)", where: "Préparer soi-même: 1.17g sel/100mL eau", price: "200 FCFA", safety: "✅ Sans danger" },
        { name: "Papier filtre", where: "Pharmacie, boutiques sciences", price: "500-1000 FCFA/paquet", alternative: "Café filtre" },
        { name: "Entonnoir", where: "Pharmacie", price: "1500-3000 FCFA", alternative: "Bouteille plastique coupée" }
      ],
      totalCost: "≈ 15,000-25,000 FCFA",
      suppliers: "AgNO₃ cher - commander groupé avec école. NaCl: sel de cuisine purifié"
    },
    steps: [
      { 
        hint: "Versez 50mL de AgNO₃ 0.2M dans le bécher", 
        measurement: "50mL exactement",
        why: "POURQUOI 50mL et 0.2M? Calcul: 50mL × 0.2M = 10 millimoles Ag⁺. Cette quantité forme ≈1.43g AgCl (masse visible, manipulable). Moins = précipité trop petit. Plus = gaspillage d'argent (AgNO₃ coûte cher!)",
        science: "AgNO₃ → Ag⁺ + NO₃⁻ en solution" 
      },
      { 
        hint: "Ajoutez 50mL NaCl 0.2M", 
        measurement: "50mL pour ratio 1:1",
        why: "POURQUOI même volume (50mL) et même concentration (0.2M)? Ratio stœchiométrique 1:1 pour Ag⁺ + Cl⁻. Donc mêmes nombres de moles = réaction complète, pas de réactif gaspillé. Économie + précision!",
        science: "Ag⁺ + Cl⁻ → AgCl(s). Produit de solubilité Ks = 1.8×10⁻¹⁰, donc précipité instantané" 
      },
      { 
        hint: "Observez précipité blanc", 
        measurement: "Masse théorique: 1.43g",
        why: "POURQUOI 1.43g? Calcul: 10 millimoles AgCl × 143.5g/mol = 1.435g. C'est la masse théorique. En réalité rendement ≈ 95% → 1.36g (un peu reste en solution). Normal!",
        science: "AgCl est insoluble (blanc laiteux). Produit de solubilité très faible." 
      },
      { 
        hint: "Filtrez pour récupérer AgCl solide", 
        measurement: "Rendement attendu: 95% (≈1.36g)",
        why: "POURQUOI filtrer? Séparer solide (AgCl) du liquide (Na⁺, NO₃⁻ dissous). Le papier filtre retient particules >10 microns. Vous obtenez AgCl pur, lavé, pesable. Peut être recyclé (AgNO₃ coûte cher)!",
        science: "Filtration = méthode mécanique séparation. Laver 2-3 fois à l'eau distillée enlève impuretés" 
      }
    ]
  },
  "simple-circuit": {
    intro: "Circuit série: Pile + Résistance + Ampoule. Loi d'Ohm: U = R × I",
    equipment: {
      items: [
        { name: "Pile 9V", where: "Boutique, supermarché, quincaillerie", price: "500-1500 FCFA", alternative: "3 piles 1.5V AA en série" },
        { name: "Résistance 100Ω 1/4W", where: "Marché Sandaga électronique, boutiques radio", price: "25-50 FCFA/unité", alternative: "Fil résistif (fer à souder)" },
        { name: "Ampoule 6V 0.5W", where: "Quincaillerie, boutiques électronique", price: "200-500 FCFA", alternative: "LED + résistance 330Ω" },
        { name: "Fils connexion", where: "Boutique électronique, marché", price: "500-1000 FCFA/rouleau", alternative: "Câbles téléphone recyclés" },
        { name: "Multimètre", where: "Marché Sandaga, boutiques électronique", price: "3000-8000 FCFA", note: "Mesurer tension/courant" }
      ],
      totalCost: "≈ 5,000-12,000 FCFA pour tout",
      suppliers: "Sénégal: Marché Sandaga (électronique), quincailleries. En ligne: AliExpress, Jumia"
    },
    steps: [
      { 
        hint: "Connectez la pile 9V au circuit", 
        measurement: "Tension: U = 9V",
        why: "POURQUOI 9V? Tension suffisante pour allumer ampoule (besoin minimum 3-6V) sans brûler. Pile 9V = standard, disponible partout, sûr (courant faible). Batterie 12V automobile = dangereux (courant très fort)!",
        science: "La pile fournit différence de potentiel qui 'pousse' électrons. 9V = 9 Joules d'énergie par Coulomb de charge." 
      },
      { 
        hint: "Ajoutez résistance 100Ω", 
        measurement: "R = 100Ω (bandes: marron-noir-marron)",
        why: "POURQUOI 100Ω? Protège circuit! Calcul: I = U/R = 9V/100Ω = 90mA. Sans résistance, ampoule recevrait I = 9V/10Ω = 900mA → GRILLE en 2 secondes! 100Ω = compromis sécurité/luminosité.",
        science: "Loi d'Ohm: U = R × I. La résistance limite courant. Puissance dissipée: P = R×I² = 0.81W → résistance chauffe (normal)" 
      },
      { 
        hint: "Connectez l'ampoule - circuit fermé", 
        measurement: "Puissance ampoule: P = U×I ≈ 0.81W",
        why: "POURQUOI ampoule s'allume? Circuit fermé → courant circule (90mA) → filament tungstène chauffe à 2500°C → émet lumière. Rendement ≈ 5% en lumière, 95% en chaleur (ampoule chaude = normal!). LED = 80% lumière (plus efficace).",
        science: "Ampoule = résistance ~10Ω. Effet Joule: énergie électrique → chaleur + lumière. Filament tungstène résiste à 2500°C." 
      }
    ]
  }
}

export function LabTutor({ experimentId, currentStep }) {
  const [expanded, setExpanded] = useState(true)
  const [showScience, setShowScience] = useState(false)
  const [showWhy, setShowWhy] = useState(false)
  const [showEquipment, setShowEquipment] = useState(false)
  
  const hints = experimentHints[experimentId]
  
  if (!hints) return null
  
  const stepData = hints.steps[Math.min(currentStep, hints.steps.length - 1)]
  const progress = ((currentStep + 1) / hints.steps.length) * 100
  
  return (
    <div className="fixed left-4 top-20 w-[420px] z-50 max-h-[calc(100vh-100px)] overflow-y-auto">
      <div 
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 py-3 rounded-t-xl flex items-center gap-3 cursor-pointer shadow-2xl sticky top-0"
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
          {/* Equipment Section */}
          {hints.equipment && (
            <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
              <button
                onClick={() => setShowEquipment(!showEquipment)}
                className="flex items-center gap-2 text-xs text-purple-600 hover:text-purple-800 font-bold w-full"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="flex-1 text-left">🛒 MATÉRIEL NÉCESSAIRE - Où acheter?</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${showEquipment ? 'rotate-90' : ''}`} />
              </button>
              
              {showEquipment && (
                <div className="mt-3 p-3 bg-white rounded-lg border-2 border-purple-300 shadow-sm">
                  {hints.equipment.items.map((item, i) => (
                    <div key={i} className="mb-3 pb-3 border-b last:border-0">
                      <div className="font-bold text-sm text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        <div>📍 <span className="font-semibold">Où:</span> {item.where}</div>
                        <div>💰 <span className="font-semibold">Prix:</span> {item.price}</div>
                        {item.alternative && <div>🔄 <span className="font-semibold">Alternative:</span> {item.alternative}</div>}
                        {item.safety && <div className="mt-1 text-red-600 font-bold">{item.safety}</div>}
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t-2 border-purple-200">
                    <div className="text-sm font-bold text-purple-700">💵 Coût total: {hints.equipment.totalCost}</div>
                    <div className="text-xs text-gray-600 mt-1">📦 Fournisseurs: {hints.equipment.suppliers}</div>
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
                  INSTRUCTION ÉTAPE {currentStep + 1}/{hints.steps.length}
                </div>
                <p className="text-sm font-bold text-gray-900 leading-relaxed mb-2">
                  {stepData.hint}
                </p>
                {stepData.action && (
                  <div className="mt-2 p-2 bg-white rounded-lg border-2 border-orange-300 shadow-sm">
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
                <span className="text-xs font-bold text-green-700">MESURES EXACTES</span>
              </div>
              <div className="p-3 bg-white rounded-lg border-2 border-green-300 shadow-sm">
                <p className="text-sm font-mono font-bold text-green-900">{stepData.measurement}</p>
              </div>
            </div>
          )}
          
          {/* WHY Section - NEW! */}
          {stepData.why && (
            <div className="px-4 py-3 bg-amber-50 border-b-2 border-amber-200">
              <button
                onClick={() => setShowWhy(!showWhy)}
                className="flex items-center gap-2 text-xs text-amber-700 hover:text-amber-900 font-bold w-full"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="flex-1 text-left">💡 POURQUOI ces mesures? (IMPORTANT!)</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${showWhy ? 'rotate-90' : ''}`} />
              </button>
              
              {showWhy && (
                <div className="mt-3 p-3 bg-white rounded-lg border-2 border-amber-400 shadow-sm">
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">{stepData.why}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Science Explanation */}
          {stepData.science && (
            <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-200">
              <button
                onClick={() => setShowScience(!showScience)}
                className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 font-bold w-full"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="flex-1 text-left">📚 Comprendre la SCIENCE</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${showScience ? 'rotate-90' : ''}`} />
              </button>
              
              {showScience && (
                <div className="mt-3 p-3 bg-white rounded-lg border-2 border-indigo-300 shadow-sm">
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
              Étape {currentStep + 1} sur {hints.steps.length}
              {currentStep === hints.steps.length - 1 && <span className="ml-2 text-green-600 font-bold">🎉 Dernière étape!</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}