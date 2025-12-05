import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { arLabService, calculatePH, getIndicatorColor, calculateCurrent } from '../services/arLab'
import {
  Beaker, ChemicalBottle, Dropper, LabTable, BunsenBurner,
  Battery, Resistor, Bulb, CircuitBoard,
  PendulumSupport, PendulumMass, PendulumString
} from '../components/ar/LabEquipment'
import toast from 'react-hot-toast'
import { ArrowLeft, PlayCircle, Info, CheckCircle, Camera, X, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Label({ position, text, color = '#00853D', visible = true }) {
  if (!visible) return null
  return (
    <Html position={position} center distanceFactor={1.5}>
      <div className='flex items-center gap-1 pointer-events-none'>
        <div 
          className='px-2 py-1 rounded-lg text-white text-xs font-bold whitespace-nowrap shadow-lg'
          style={{ backgroundColor: color }}
        >
          {text}
        </div>
        <div 
          className='w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent'
          style={{ borderLeftColor: color }}
        />
      </div>
    </Html>
  )
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

function LabScene({ experiment, experimentState, showLabels }) {
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
          <Label position={[0, 0.25, 0]} text="🧪 Becher" color="#7c3aed" visible={showLabels} />
          
          <ChemicalBottle position={[-0.35, 0.025, 0.1]} label="HCl" color="#ff6b6b" />
          <Label position={[-0.35, 0.2, 0.1]} text="⚗️ HCl (Acide)" color="#ef4444" visible={showLabels} />
          
          <ChemicalBottle position={[0.35, 0.025, 0.1]} label="NaOH" color="#4dabf7" />
          <Label position={[0.35, 0.2, 0.1]} text="⚗️ NaOH (Base)" color="#3b82f6" visible={showLabels} />
          
          {experimentState.naohVolume > 0 && (
            <>
              <Dropper position={[0, 0.3, 0]} dropping={true} />
              <Label position={[0.15, 0.35, 0]} text="💧 Pipette" color="#8b5cf6" visible={showLabels} />
            </>
          )}
        </>
      )}

      {experiment.id === 'combustion' && (
        <>
          <BunsenBurner position={[0, 0.025, 0]} lit={experimentState.bunsenLit} />
          <Label position={[0, 0.25, 0]} text={experimentState.bunsenLit ? "🔥 Bec Bunsen (allume)" : "🔥 Bec Bunsen"} color="#f97316" visible={showLabels} />
          
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
          <Label position={[0.3, 0.25, 0]} text={experimentState.magnesiumBurning ? "✨ Mg (combustion!)" : "🪨 Ruban Magnesium"} color="#a855f7" visible={showLabels} />
          
          {experimentState.magnesiumBurning && (
            <pointLight position={[0.3, 0.15, 0]} color="#ffffff" intensity={3} distance={1} />
          )}
        </>
      )}

      {experiment.id === 'simple-circuit' && (
        <>
          <CircuitBoard position={[0, 0.01, 0]} />
          <Label position={[0, -0.05, 0.25]} text="🟩 Plaque circuit" color="#10b981" visible={showLabels} />
          
          <Battery position={[-0.3, 0.08, 0]} connected={experimentState.batteryConnected} />
          <Label position={[-0.3, 0.2, 0]} text={experimentState.batteryConnected ? "🔋 Pile 9V (connectee)" : "🔋 Pile 9V"} color="#1e40af" visible={showLabels} />
          
          <Resistor position={[0, 0.08, 0]} connected={experimentState.resistorConnected} />
          <Label position={[0, 0.18, 0]} text={experimentState.resistorConnected ? "⚡ Resistance 100Ω (active)" : "⚡ Resistance 100Ω"} color="#c2410c" visible={showLabels} />
          
          <Bulb position={[0.3, 0.1, 0]} lit={experimentState.bulbLit} />
          <Label position={[0.3, 0.22, 0]} text={experimentState.bulbLit ? "💡 Ampoule (allumee!)" : "💡 Ampoule"} color="#eab308" visible={showLabels} />
        </>
      )}

      {experiment.id === 'pendulum' && (
        <>
          <PendulumSupport position={[0, 0.025, 0]} />
          <Label position={[0.2, 0.45, 0]} text="🏗️ Support" color="#71717a" visible={showLabels} />
          
          <PendulumString
            start={[0, 0.425, 0]}
            end={[experimentState.pendulumSwinging ? 0.15 : 0, 0.025, 0]}
          />
          <Label position={[0.08, 0.25, 0]} text="🧵 Ficelle (L=1m)" color="#1f2937" visible={showLabels} />
          
          <PendulumMass
            position={[experimentState.pendulumSwinging ? 0.15 : 0, 0.025, 0]}
            swinging={experimentState.pendulumSwinging}
          />
          <Label position={[experimentState.pendulumSwinging ? 0.15 : 0, -0.05, 0]} text={experimentState.pendulumSwinging ? "⚖️ Masse (oscillation)" : "⚖️ Masse 100g"} color="#dc2626" visible={showLabels} />
        </>
      )}
    </group>
  )
}

function ARExperimentView({ experiment, onBack }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [arMode, setArMode] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setArMode(true)
      toast.success('📷 Mode AR active!')
    } catch (err) {
      console.error('Camera error:', err)
      toast.error('Camera non disponible')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setArMode(false)
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

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
        <button onClick={() => { stopCamera(); onBack(); }} className='btn-secondary'>
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
            onClick={() => setShowLabels(!showLabels)}
            className={`p-2 rounded-lg ${showLabels ? 'bg-senegal-green text-white' : 'bg-gray-100'}`}
            title="Afficher/Masquer les legendes"
          >
            <Tag size={20} />
          </button>
          <button 
            onClick={() => arMode ? stopCamera() : startCamera()}
            className={`p-2 rounded-lg flex items-center gap-2 ${arMode ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
          >
            {arMode ? <X size={20} /> : <Camera size={20} />}
          </button>
          <button onClick={() => setShowInstructions(!showInstructions)} className='btn-secondary'>
            <Info size={20} />
          </button>
        </div>
      </div>

      {showInstructions && (
        <div className={`card p-4 mb-4 ${arMode ? 'bg-black/50 border-white/20 text-white' : 'bg-blue-50 border-blue-200'}`}>
          <div className='flex items-start gap-3'>
            <CheckCircle size={20} className={`mt-1 flex-shrink-0 ${arMode ? 'text-green-400' : 'text-blue-600'}`} />
            <div>
              <h3 className={`font-bold ${arMode ? 'text-white' : 'text-blue-900'}`}>Etape {currentStep + 1}</h3>
              <p className={arMode ? 'text-gray-200' : 'text-blue-800'}>{experiment.steps[currentStep]}</p>
            </div>
          </div>
        </div>
      )}

      <div className='flex-1 relative rounded-lg overflow-hidden'>
        {arMode && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className='absolute inset-0 w-full h-full object-cover'
          />
        )}
        
        <div className={`absolute inset-0 ${!arMode ? 'bg-gradient-to-b from-gray-50 to-gray-100' : ''}`}>
          <Canvas 
            camera={{ position: [0, 0.5, 1.5], fov: 50 }}
            gl={{ alpha: arMode }}
            style={{ background: arMode ? 'transparent' : undefined }}
          >
            <ambientLight intensity={arMode ? 0.8 : 0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <LabScene experiment={experiment} experimentState={experimentState} showLabels={showLabels} />
            <OrbitControls enablePan={false} maxDistance={3} minDistance={0.5} />
          </Canvas>
        </div>

        {arMode && (
          <div className='absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1'>
            <span className='w-2 h-2 bg-white rounded-full animate-pulse'></span>
            AR LIVE
          </div>
        )}
        
        {showLabels && !arMode && (
          <div className='absolute bottom-2 left-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs text-gray-600'>
            🏷️ Legendes actives - Cliquez sur l icone Tag pour masquer
          </div>
        )}
      </div>

      <div className={`grid grid-cols-3 gap-3 mt-4 ${arMode ? 'bg-black/30 -mx-4 px-4 py-3 -mb-4 rounded-t-xl' : ''}`}>
        {experiment.id === 'acid-base' && (
          <>
            <button onClick={handleAddHCl} disabled={currentStep > 0} className={`btn-secondary py-3 ${currentStep > 0 ? 'opacity-50 cursor-not-allowed' : ''} ${arMode ? 'bg-white/90' : ''}`}>
              🧪 Ajouter HCl
            </button>
            <button onClick={handleAddIndicator} disabled={currentStep < 1 || currentStep > 1} className={`btn-secondary py-3 ${(currentStep < 1 || currentStep > 1) ? 'opacity-50 cursor-not-allowed' : ''} ${arMode ? 'bg-white/90' : ''}`}>
              💧 Indicateur
            </button>
            <button onClick={handleAddNaOH} disabled={currentStep < 2} className={`btn-primary py-3 ${currentStep < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              ➕ Goutte NaOH
            </button>
          </>
        )}

        {experiment.id === 'combustion' && (
          <>
            <button onClick={handleLightBunsen} disabled={currentStep > 0} className={`btn-secondary py-3 ${currentStep > 0 ? 'opacity-50 cursor-not-allowed' : ''} ${arMode ? 'bg-white/90' : ''}`}>
              🔥 Allumer Bunsen
            </button>
            <button onClick={handleApproachMagnesium} disabled={currentStep < 1} className={`btn-primary py-3 ${currentStep < 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              ✨ Approcher Mg
            </button>
            <button disabled className={`btn-secondary py-3 opacity-50 ${arMode ? 'bg-white/90' : ''}`}>👁️ Observer</button>
          </>
        )}

        {experiment.id === 'simple-circuit' && (
          <>
            <button onClick={handleConnectBattery} disabled={currentStep > 0} className={`btn-secondary py-3 ${currentStep > 0 ? 'opacity-50 cursor-not-allowed' : ''} ${arMode ? 'bg-white/90' : ''}`}>
              🔋 Placer Pile
            </button>
            <button onClick={handleConnectResistor} disabled={currentStep < 1} className={`btn-secondary py-3 ${currentStep < 1 ? 'opacity-50 cursor-not-allowed' : ''} ${arMode ? 'bg-white/90' : ''}`}>
              ⚡ Resistance
            </button>
            <button onClick={handleConnectBulb} disabled={currentStep < 2} className={`btn-primary py-3 ${currentStep < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              💡 Ampoule
            </button>
          </>
        )}

        {experiment.id === 'pendulum' && (
          <>
            <button onClick={handleAttachString} disabled={currentStep > 0} className={`btn-secondary py-3 ${currentStep > 0 ? 'opacity-50 cursor-not-allowed' : ''} ${arMode ? 'bg-white/90' : ''}`}>
              🎯 Attacher
            </button>
            <button disabled={currentStep < 1} className={`btn-secondary py-3 ${currentStep < 1 ? 'opacity-50' : ''} ${arMode ? 'bg-white/90' : ''}`}>
              📏 Mesurer
            </button>
            <button onClick={handleSwingPendulum} disabled={currentStep < 1} className={`btn-primary py-3 ${currentStep < 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              🎪 Lancer
            </button>
          </>
        )}
      </div>
    </div>
  )
}
