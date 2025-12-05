import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import '@google/model-viewer'
import { arLabService, calculatePH, getIndicatorColor, calculateCurrent } from '../services/arLab'
import {
  Beaker, ChemicalBottle, Dropper, LabTable, BunsenBurner,
  Battery, Resistor, Bulb, CircuitBoard,
  PendulumSupport, PendulumMass, PendulumString
} from '../components/ar/LabEquipment'
import toast from 'react-hot-toast'
import { ArrowLeft, PlayCircle, Info, CheckCircle, View, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Free 3D models for AR preview
const AR_MODELS = {
  'acid-base': {
    glb: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    ios: 'https://modelviewer.dev/shared-assets/models/Astronaut.usdz',
    name: 'Chemistry Lab'
  },
  'combustion': {
    glb: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb', 
    ios: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.usdz',
    name: 'Bunsen Burner'
  },
  'simple-circuit': {
    glb: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
    ios: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.usdz',
    name: 'Electric Circuit'
  },
  'pendulum': {
    glb: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    ios: 'https://modelviewer.dev/shared-assets/models/Astronaut.usdz',
    name: 'Pendulum'
  }
}

export default function ARLabPage() {
  const navigate = useNavigate()
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedExperiment, setSelectedExperiment] = useState(null)

  if (!selectedSubject) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4 mb-6'>
          <button onClick={() => navigate(-1)} className='btn-secondary'>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className='text-3xl font-bold'>Laboratoire 3D</h1>
            <p className='text-gray-600'>Experiences scientifiques interactives</p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div
            onClick={() => setSelectedSubject('chemistry')}
            className='card p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-purple-50 to-pink-50'
          >
            <div className='text-6xl mb-4 text-center'>🧪</div>
            <h2 className='text-2xl font-bold text-center mb-2'>Chimie</h2>
            <p className='text-center text-gray-600'>
              Reactions, melanges, pH, combustion
            </p>
            <div className='mt-4 text-center text-sm text-gray-500'>
              {arLabService.getAllExperiments('chemistry').length} experiences
            </div>
          </div>

          <div
            onClick={() => setSelectedSubject('physics')}
            className='card p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-blue-50 to-cyan-50'
          >
            <div className='text-6xl mb-4 text-center'>⚡</div>
            <h2 className='text-2xl font-bold text-center mb-2'>Physique</h2>
            <p className='text-center text-gray-600'>
              Circuits, electricite, mecanique
            </p>
            <div className='mt-4 text-center text-sm text-gray-500'>
              {arLabService.getAllExperiments('physics').length} experiences
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedExperiment) {
    const experiments = arLabService.getAllExperiments(selectedSubject)

    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4 mb-6'>
          <button onClick={() => setSelectedSubject(null)} className='btn-secondary'>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className='text-3xl font-bold'>
              {selectedSubject === 'chemistry' ? '🧪 Chimie' : '⚡ Physique'}
            </h1>
            <p className='text-gray-600'>Choisissez une experience</p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {experiments.map((exp) => (
            <div
              key={exp.id}
              onClick={() => setSelectedExperiment(exp)}
              className='card p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105'
            >
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-xl font-bold'>{exp.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  exp.difficulty === 'Facile' ? 'bg-green-100 text-green-800' :
                  exp.difficulty === 'Moyen' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {exp.difficulty}
                </span>
              </div>

              <p className='text-gray-600 mb-4'>{exp.description}</p>

              <div className='flex items-center justify-between text-sm text-gray-500'>
                <span>⏱️ {exp.duration}</span>
                <span>📋 {exp.steps.length} etapes</span>
              </div>

              <button className='btn-primary w-full mt-4'>
                <PlayCircle size={18} className='inline mr-2' />
                Commencer
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <ARExperimentView
      experiment={selectedExperiment}
      onBack={() => setSelectedExperiment(null)}
    />
  )
}

function LabScene({ experiment, experimentState }) {
  return (
    <group>
      <LabTable position={[0, -0.05, 0]} />

      {experiment.id === 'acid-base' && (
        <>
          <Beaker
            position={[0, 0.025, 0]}
            fillLevel={experimentState.hclVolume > 0 ? 0.08 : 0}
            color={experimentState.color}
          />
          <ChemicalBottle position={[-0.35, 0.025, 0.1]} label="HCl" color="#ff6b6b" />
          <ChemicalBottle position={[0.35, 0.025, 0.1]} label="NaOH" color="#4dabf7" />
          {experimentState.naohVolume > 0 && (
            <Dropper position={[0, 0.3, 0]} dropping={true} />
          )}
        </>
      )}

      {experiment.id === 'combustion' && (
        <>
          <BunsenBurner position={[0, 0.025, 0]} lit={experimentState.bunsenLit} />
          <mesh position={[0.3, 0.15, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.15, 0.01, 0.005]} />
            <meshStandardMaterial
              color={experimentState.magnesiumBurning ? "#ffffff" : "#cccccc"}
              metalness={0.9}
              roughness={0.1}
              emissive={experimentState.magnesiumBurning ? "#ffffff" : "#000000"}
              emissiveIntensity={experimentState.magnesiumBurning ? 2 : 0}
            />
          </mesh>
          {experimentState.magnesiumBurning && (
            <pointLight position={[0.3, 0.15, 0]} color="#ffffff" intensity={3} distance={1} />
          )}
        </>
      )}

      {experiment.id === 'simple-circuit' && (
        <>
          <CircuitBoard position={[0, 0.01, 0]} />
          <Battery position={[-0.3, 0.08, 0]} connected={experimentState.batteryConnected} />
          <Resistor position={[0, 0.08, 0]} connected={experimentState.resistorConnected} />
          <Bulb position={[0.3, 0.1, 0]} lit={experimentState.bulbLit} />
        </>
      )}

      {experiment.id === 'pendulum' && (
        <>
          <PendulumSupport position={[0, 0.025, 0]} />
          <PendulumString
            start={[0, 0.425, 0]}
            end={[experimentState.pendulumSwinging ? 0.15 : 0, 0.025, 0]}
          />
          <PendulumMass
            position={[experimentState.pendulumSwinging ? 0.15 : 0, 0.025, 0]}
            swinging={experimentState.pendulumSwinging}
          />
        </>
      )}
    </group>
  )
}

function ARExperimentView({ experiment, onBack }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showARPreview, setShowARPreview] = useState(false)
  const [experimentState, setExperimentState] = useState({
    hclVolume: 0,
    naohVolume: 0,
    indicatorAdded: false,
    pH: 1,
    color: '#ff6b6b',
    bunsenLit: false,
    magnesiumBurning: false,
    batteryConnected: false,
    resistorConnected: false,
    bulbLit: false,
    current: 0,
    pendulumSwinging: false,
    pendulumAngle: 0
  })
  const [showInstructions, setShowInstructions] = useState(true)

  const arModel = AR_MODELS[experiment.id]

  const handleAddHCl = () => {
    setExperimentState(prev => ({ ...prev, hclVolume: 50, pH: 1 }))
    setCurrentStep(1)
    toast.success('HCl ajoute! 🧪')
  }

  const handleAddIndicator = () => {
    setExperimentState(prev => ({ ...prev, indicatorAdded: true }))
    setCurrentStep(2)
    toast.success('Indicateur ajoute! 💧')
  }

  const handleAddNaOH = () => {
    setExperimentState(prev => {
      const newNaOH = prev.naohVolume + 2
      const newPH = calculatePH(prev.hclVolume, newNaOH)
      const newColor = getIndicatorColor(newPH)
      return { ...prev, naohVolume: newNaOH, pH: newPH, color: newColor }
    })

    const newPH = calculatePH(experimentState.hclVolume, experimentState.naohVolume + 2)
    if (Math.abs(newPH - 7) < 0.5) {
      setCurrentStep(4)
      toast.success('🎉 Neutralisation reussie! pH ≈ 7')
      setTimeout(() => {
        setCurrentStep(experiment.steps.length - 1)
        toast.success('✅ Experience terminee!')
      }, 1500)
    }
  }

  const handleLightBunsen = () => {
    setExperimentState(prev => ({ ...prev, bunsenLit: true }))
    setCurrentStep(1)
    toast.success('🔥 Bec Bunsen allume!')
  }

  const handleApproachMagnesium = () => {
    setExperimentState(prev => ({ ...prev, magnesiumBurning: true }))
    setCurrentStep(2)
    toast.success('✨ Magnesium en combustion!')
    setTimeout(() => {
      toast('⚠️ Ne regardez jamais directement!', { icon: '🕶️' })
      setCurrentStep(3)
    }, 1000)
    setTimeout(() => {
      setCurrentStep(experiment.steps.length - 1)
      toast.success('✅ Combustion terminee!')
    }, 3000)
  }

  const handleConnectBattery = () => {
    setExperimentState(prev => ({ ...prev, batteryConnected: true }))
    setCurrentStep(1)
    toast.success('🔋 Pile connectee!')
  }

  const handleConnectResistor = () => {
    setExperimentState(prev => ({ ...prev, resistorConnected: true }))
    setCurrentStep(2)
    toast.success('⚡ Resistance ajoutee!')
  }

  const handleConnectBulb = () => {
    const current = calculateCurrent(9, 100)
    setExperimentState(prev => ({ ...prev, bulbLit: true, current }))
    setCurrentStep(3)
    toast.success(`💡 Ampoule allumee! I = ${current.toFixed(2)}A`)
    setTimeout(() => {
      setCurrentStep(experiment.steps.length - 1)
      toast.success('✅ Circuit complet!')
    }, 1500)
  }

  const handleAttachString = () => {
    setCurrentStep(1)
    toast.success('🎯 Ficelle attachee!')
  }

  const handleSwingPendulum = () => {
    setExperimentState(prev => ({ ...prev, pendulumSwinging: true }))
    setCurrentStep(3)
    toast.success('⏱️ Pendule en mouvement!')
    setTimeout(() => {
      setCurrentStep(4)
      toast.success('📊 Periode: T ≈ 2.0s')
    }, 2000)
    setTimeout(() => {
      setCurrentStep(experiment.steps.length - 1)
      toast.success('✅ T = 2π√(L/g)')
    }, 3500)
  }

  return (
    <div className='flex flex-col h-[calc(100vh-10rem)]'>
      <div className='flex items-center justify-between mb-4'>
        <button onClick={onBack} className='btn-secondary'>
          <ArrowLeft size={20} />
        </button>
        <div className='flex-1 mx-4'>
          <h2 className='text-xl font-bold'>{experiment.name}</h2>
          <div className='flex items-center gap-4 mt-1 text-sm text-gray-600'>
            <span>Etape {currentStep + 1}/{experiment.steps.length}</span>
            {experiment.id === 'acid-base' && (
              <span className='font-semibold'>pH: {experimentState.pH.toFixed(1)}</span>
            )}
            {experiment.id === 'simple-circuit' && experimentState.current > 0 && (
              <span className='font-semibold'>I: {experimentState.current.toFixed(2)}A</span>
            )}
          </div>
        </div>
        <div className='flex gap-2'>
          <button 
            onClick={() => setShowARPreview(true)}
            className='btn-primary flex items-center gap-2'
          >
            <View size={18} />
            <span className='hidden sm:inline'>Voir en AR</span>
          </button>
          <button onClick={() => setShowInstructions(!showInstructions)} className='btn-secondary'>
            <Info size={20} />
          </button>
        </div>
      </div>

      {showInstructions && (
        <div className='card p-4 mb-4 bg-blue-50 border-blue-200'>
          <div className='flex items-start gap-3'>
            <CheckCircle size={20} className='text-blue-600 mt-1 flex-shrink-0' />
            <div>
              <h3 className='font-bold text-blue-900'>Etape {currentStep + 1}</h3>
              <p className='text-blue-800'>{experiment.steps[currentStep]}</p>
            </div>
          </div>
        </div>
      )}

      <div className='flex-1 relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg overflow-hidden'>
        <Canvas camera={{ position: [0, 0.5, 1.5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <LabScene experiment={experiment} experimentState={experimentState} />
          <OrbitControls enablePan={false} maxDistance={3} minDistance={0.5} />
        </Canvas>
      </div>

      <div className='grid grid-cols-3 gap-3 mt-4'>
        {experiment.id === 'acid-base' && (
          <>
            <button onClick={handleAddHCl} disabled={currentStep > 0} className={`btn-secondary py-3 ${currentStep > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              🧪 Ajouter HCl
            </button>
            <button onClick={handleAddIndicator} disabled={currentStep < 1 || currentStep > 1} className={`btn-secondary py-3 ${(currentStep < 1 || currentStep > 1) ? 'opacity-50 cursor-not-allowed' : ''}`}>
              💧 Indicateur
            </button>
            <button onClick={handleAddNaOH} disabled={currentStep < 2} className={`btn-primary py-3 ${currentStep < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              ➕ Goutte NaOH
            </button>
          </>
        )}

        {experiment.id === 'combustion' && (
          <>
            <button onClick={handleLightBunsen} disabled={currentStep > 0} className={`btn-secondary py-3 ${currentStep > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              🔥 Allumer Bunsen
            </button>
            <button onClick={handleApproachMagnesium} disabled={currentStep < 1} className={`btn-primary py-3 ${currentStep < 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              ✨ Approcher Mg
            </button>
            <button disabled className='btn-secondary py-3 opacity-50'>👁️ Observer</button>
          </>
        )}

        {experiment.id === 'simple-circuit' && (
          <>
            <button onClick={handleConnectBattery} disabled={currentStep > 0} className={`btn-secondary py-3 ${currentStep > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              🔋 Placer Pile
            </button>
            <button onClick={handleConnectResistor} disabled={currentStep < 1} className={`btn-secondary py-3 ${currentStep < 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              ⚡ Resistance
            </button>
            <button onClick={handleConnectBulb} disabled={currentStep < 2} className={`btn-primary py-3 ${currentStep < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              💡 Ampoule
            </button>
          </>
        )}

        {experiment.id === 'pendulum' && (
          <>
            <button onClick={handleAttachString} disabled={currentStep > 0} className={`btn-secondary py-3 ${currentStep > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              🎯 Attacher
            </button>
            <button disabled={currentStep < 1} className={`btn-secondary py-3 ${currentStep < 1 ? 'opacity-50' : ''}`}>
              📏 Mesurer
            </button>
            <button onClick={handleSwingPendulum} disabled={currentStep < 1} className={`btn-primary py-3 ${currentStep < 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              🎪 Lancer
            </button>
          </>
        )}
      </div>

      {/* AR Preview Modal */}
      {showARPreview && (
        <div className='fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl w-full max-w-lg overflow-hidden'>
            <div className='flex items-center justify-between p-4 border-b'>
              <h3 className='text-lg font-bold'>AR Preview - {arModel.name}</h3>
              <button onClick={() => setShowARPreview(false)} className='p-2 hover:bg-gray-100 rounded-full'>
                <X size={20} />
              </button>
            </div>
            <div className='h-96'>
              <model-viewer
                src={arModel.glb}
                ios-src={arModel.ios}
                alt={arModel.name}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                auto-rotate
                style={{ width: '100%', height: '100%' }}
              >
                <button slot="ar-button" className='absolute bottom-4 left-1/2 -translate-x-1/2 bg-senegal-green text-white px-6 py-3 rounded-full font-bold shadow-lg'>
                  📱 Voir en AR
                </button>
              </model-viewer>
            </div>
            <div className='p-4 bg-gray-50 text-sm text-gray-600'>
              <p>📱 <strong>iPhone:</strong> Appuyez sur "Voir en AR" pour ouvrir en realite augmentee</p>
              <p>🤖 <strong>Android:</strong> Fonctionne aussi avec Scene Viewer</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
