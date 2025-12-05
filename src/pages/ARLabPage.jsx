import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { arLabService, calculatePH, getIndicatorColor, calculateCurrent } from '../services/arLab'
import toast from 'react-hot-toast'
import { ArrowLeft, PlayCircle, Camera, X, List, ChevronDown, ChevronUp, Circle, CheckCircle, Hand, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'

// ============ SHARED COMPONENTS ============

function LabTable({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1.2, 0.05, 0.8]} />
      <meshStandardMaterial color="#8B4513" roughness={0.8} />
    </mesh>
  )
}

function StepsPanel({ steps, currentStep, isAR, expanded, onToggle }) {
  return (
    <div className={`absolute top-2 right-2 z-20 ${isAR ? 'max-w-[180px]' : 'max-w-[250px]'}`}>
      <div className={`rounded-xl shadow-lg overflow-hidden ${isAR ? 'bg-black/70 backdrop-blur-md' : 'bg-white'}`}>
        <button onClick={onToggle} className={`w-full px-3 py-2 flex items-center justify-between ${isAR ? 'text-white' : 'text-gray-800'}`}>
          <div className='flex items-center gap-2'>
            <List size={16} />
            <span className='font-bold text-sm'>Etapes ({currentStep + 1}/{steps.length})</span>
          </div>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expanded && (
          <div className={`px-3 pb-3 max-h-[200px] overflow-y-auto`}>
            {steps.map((step, index) => (
              <div key={index} className={`flex items-start gap-2 py-1.5 text-xs ${
                index < currentStep ? (isAR ? 'text-green-400' : 'text-green-600') :
                index === currentStep ? (isAR ? 'text-yellow-300 font-bold' : 'text-senegal-green font-bold') :
                'text-gray-400'
              }`}>
                <div className='flex-shrink-0 mt-0.5'>
                  {index < currentStep ? <CheckCircle size={12} /> : 
                   index === currentStep ? <div className='w-3 h-3 rounded-full border-2 border-current animate-pulse' /> : 
                   <Circle size={12} />}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============ CHEMISTRY: ACID-BASE ============

function AcidBaseExperiment({ experimentState, setExperimentState, currentStep, setCurrentStep, experiment }) {
  const [selectedTool, setSelectedTool] = useState(null)

  const handleSelectTool = (tool) => {
    setSelectedTool(tool === selectedTool ? null : tool)
    if (tool !== selectedTool) toast(`Selectionne: ${tool}`, { icon: '👆' })
  }

  const handlePourInBeaker = () => {
    if (selectedTool === 'hcl' && experimentState.hclVolume === 0) {
      setExperimentState(prev => ({ ...prev, hclVolume: 50, pH: 1 }))
      setCurrentStep(1)
      setSelectedTool(null)
      toast.success('HCl verse! 🧪')
    } else if (selectedTool === 'indicator' && experimentState.hclVolume > 0 && !experimentState.indicatorAdded) {
      setExperimentState(prev => ({ ...prev, indicatorAdded: true }))
      setCurrentStep(2)
      setSelectedTool(null)
      toast.success('Indicateur ajoute! 💧')
    } else if (selectedTool === 'naoh' && experimentState.indicatorAdded) {
      setExperimentState(prev => {
        const newNaOH = prev.naohVolume + 5
        const newPH = calculatePH(prev.hclVolume, newNaOH)
        const newColor = getIndicatorColor(newPH)
        if (Math.abs(newPH - 7) < 0.5) {
          setTimeout(() => {
            setCurrentStep(experiment.steps.length - 1)
            toast.success('🎉 Neutralisation reussie!')
          }, 500)
        }
        return { ...prev, naohVolume: newNaOH, pH: newPH, color: newColor }
      })
      toast.success('NaOH ajoute!')
    }
  }

  return (
    <group>
      {/* Beaker */}
      <group position={[0, 0.08, 0]} onClick={handlePourInBeaker}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.18, 32, 1, true]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.25} roughness={0.1} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.09, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.005, 32]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
        {experimentState.hclVolume > 0 && (
          <mesh position={[0, -0.04, 0]}>
            <cylinderGeometry args={[0.095, 0.095, 0.1, 32]} />
            <meshStandardMaterial color={experimentState.color} transparent opacity={0.8} />
          </mesh>
        )}
        {selectedTool && (
          <Html position={[0, 0.15, 0]} center>
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs animate-bounce">Deposer ici!</div>
          </Html>
        )}
      </group>

      {/* HCl Bottle */}
      <group position={[-0.4, 0.08, 0.2]} onClick={() => handleSelectTool('hcl')}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.14, 16]} />
          <meshStandardMaterial color="#ff6b6b" transparent opacity={0.7} emissive={selectedTool === 'hcl' ? "#ff0000" : "#000"} emissiveIntensity={selectedTool === 'hcl' ? 0.5 : 0} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <Html position={[0, 0.12, 0]} center>
          <div className={`px-2 py-1 rounded text-xs font-bold ${selectedTool === 'hcl' ? 'bg-green-500 text-white' : 'bg-red-100 text-red-800'}`}>
            {selectedTool === 'hcl' ? '✓ HCl' : '🧪 HCl'}
          </div>
        </Html>
      </group>

      {/* NaOH Bottle */}
      <group position={[0.4, 0.08, 0.2]} onClick={() => handleSelectTool('naoh')}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.14, 16]} />
          <meshStandardMaterial color="#4dabf7" transparent opacity={0.7} emissive={selectedTool === 'naoh' ? "#0066ff" : "#000"} emissiveIntensity={selectedTool === 'naoh' ? 0.5 : 0} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <Html position={[0, 0.12, 0]} center>
          <div className={`px-2 py-1 rounded text-xs font-bold ${selectedTool === 'naoh' ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-800'}`}>
            {selectedTool === 'naoh' ? '✓ NaOH' : '⚗️ NaOH'}
          </div>
        </Html>
      </group>

      {/* Indicator Bottle */}
      <group position={[0, 0.06, 0.35]} onClick={() => handleSelectTool('indicator')}>
        <mesh>
          <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} />
          <meshStandardMaterial color="#9b59b6" transparent opacity={0.7} emissive={selectedTool === 'indicator' ? "#9900ff" : "#000"} emissiveIntensity={selectedTool === 'indicator' ? 0.5 : 0} />
        </mesh>
        <Html position={[0, 0.08, 0]} center>
          <div className={`px-2 py-1 rounded text-xs font-bold ${selectedTool === 'indicator' ? 'bg-green-500 text-white' : 'bg-purple-100 text-purple-800'}`}>
            {selectedTool === 'indicator' ? '✓' : '💧 Indicateur'}
          </div>
        </Html>
      </group>
    </group>
  )
}

// ============ CHEMISTRY: COMBUSTION ============

function CombustionExperiment({ experimentState, setExperimentState, currentStep, setCurrentStep, experiment }) {
  const [selectedTool, setSelectedTool] = useState(null)

  const handleIgnite = () => {
    if (selectedTool === 'lighter' && !experimentState.bunsenLit) {
      setExperimentState(prev => ({ ...prev, bunsenLit: true }))
      setCurrentStep(1)
      setSelectedTool(null)
      toast.success('🔥 Bec Bunsen allume!')
    }
  }

  const handleBurnMagnesium = () => {
    if (experimentState.bunsenLit && !experimentState.magnesiumBurning) {
      setExperimentState(prev => ({ ...prev, magnesiumBurning: true }))
      setCurrentStep(2)
      toast.success('✨ Magnesium en combustion!')
      setTimeout(() => {
        toast('⚠️ Ne regardez jamais directement!', { icon: '🕶️' })
        setCurrentStep(experiment.steps.length - 1)
      }, 2000)
    }
  }

  return (
    <group>
      {/* Bunsen Burner */}
      <group position={[0, 0.02, 0]} onClick={handleIgnite}>
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
          <meshStandardMaterial color="#444" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.16, 16]} />
          <meshStandardMaterial color="#666" metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.19, 0]}>
          <cylinderGeometry args={[0.03, 0.025, 0.04, 16]} />
          <meshStandardMaterial color="#555" metalness={0.8} />
        </mesh>
        {experimentState.bunsenLit && (
          <>
            <mesh position={[0, 0.24, 0]}>
              <coneGeometry args={[0.025, 0.08, 16]} />
              <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={2} transparent opacity={0.9} />
            </mesh>
            <pointLight position={[0, 0.24, 0]} color="#ff6600" intensity={1} distance={0.5} />
          </>
        )}
        {selectedTool === 'lighter' && !experimentState.bunsenLit && (
          <Html position={[0, 0.3, 0]} center>
            <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs animate-pulse">Allumer!</div>
          </Html>
        )}
      </group>

      {/* Lighter */}
      <group position={[-0.3, 0.06, 0.2]} onClick={() => setSelectedTool(selectedTool === 'lighter' ? null : 'lighter')}>
        <mesh>
          <boxGeometry args={[0.025, 0.07, 0.015]} />
          <meshStandardMaterial color="#e74c3c" emissive={selectedTool === 'lighter' ? "#ff0000" : "#000"} emissiveIntensity={selectedTool === 'lighter' ? 0.5 : 0} />
        </mesh>
        <Html position={[0, 0.06, 0]} center>
          <div className={`px-2 py-1 rounded text-xs font-bold ${selectedTool === 'lighter' ? 'bg-green-500 text-white' : 'bg-red-100 text-red-800'}`}>
            🔥 Briquet
          </div>
        </Html>
      </group>

      {/* Magnesium ribbon */}
      <group position={[0.3, 0.1, 0]} onClick={handleBurnMagnesium}>
        <mesh rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[0.15, 0.012, 0.006]} />
          <meshStandardMaterial 
            color={experimentState.magnesiumBurning ? "#ffffff" : "#cccccc"} 
            metalness={0.9} 
            emissive={experimentState.magnesiumBurning ? "#ffffff" : "#000"} 
            emissiveIntensity={experimentState.magnesiumBurning ? 3 : 0} 
          />
        </mesh>
        {experimentState.magnesiumBurning && (
          <pointLight position={[0, 0, 0]} color="#ffffff" intensity={5} distance={1} />
        )}
        {experimentState.bunsenLit && !experimentState.magnesiumBurning && (
          <Html position={[0, 0.06, 0]} center>
            <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs animate-bounce">Approcher du feu!</div>
          </Html>
        )}
      </group>
    </group>
  )
}

// ============ PHYSICS: CIRCUIT ============

function AnimatedWire({ start, end, color, glowing }) {
  const ref = useRef()
  
  useFrame((state) => {
    if (ref.current && glowing) {
      ref.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 8) * 0.3
    }
  })
  
  const midPoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2]
  const length = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2) + Math.pow(end[2] - start[2], 2))
  const angle = Math.atan2(end[0] - start[0], end[2] - start[2])
  
  return (
    <mesh ref={ref} position={midPoint} rotation={[0, angle, Math.PI / 2]}>
      <cylinderGeometry args={[0.008, 0.008, length, 8]} />
      <meshStandardMaterial color={color} emissive={glowing ? color : "#000"} emissiveIntensity={glowing ? 0.5 : 0} />
    </mesh>
  )
}

function CurrentParticles({ start, end, active }) {
  const ref = useRef()
  
  useFrame((state) => {
    if (ref.current && active) {
      const t = (state.clock.elapsedTime * 2) % 1
      ref.current.position.x = start[0] + (end[0] - start[0]) * t
      ref.current.position.y = start[1] + (end[1] - start[1]) * t
      ref.current.position.z = start[2] + (end[2] - start[2]) * t
    }
  })
  
  if (!active) return null
  
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.012, 8, 8]} />
      <meshBasicMaterial color="#ffff00" />
    </mesh>
  )
}

function CircuitExperiment({ experimentState, setExperimentState, currentStep, setCurrentStep, experiment }) {
  const { batteryConnected, resistorConnected, bulbLit, current } = experimentState
  const currentFlowing = bulbLit

  const handleConnectBattery = () => {
    if (!batteryConnected) {
      setExperimentState(prev => ({ ...prev, batteryConnected: true }))
      setCurrentStep(1)
      toast.success('🔋 Pile connectee!')
    }
  }

  const handleConnectResistor = () => {
    if (batteryConnected && !resistorConnected) {
      setExperimentState(prev => ({ ...prev, resistorConnected: true }))
      setCurrentStep(2)
      toast.success('⚡ Resistance connectee!')
    }
  }

  const handleConnectBulb = () => {
    if (resistorConnected && !bulbLit) {
      const newCurrent = calculateCurrent(9, 100)
      setExperimentState(prev => ({ ...prev, bulbLit: true, current: newCurrent }))
      setCurrentStep(experiment.steps.length - 1)
      toast.success(`💡 Circuit complet! I = ${newCurrent.toFixed(2)}A`)
    }
  }

  return (
    <group>
      {/* Circuit board */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[1, 0.02, 0.6]} />
        <meshStandardMaterial color="#1a472a" roughness={0.8} />
      </mesh>
      
      {/* Copper traces */}
      <mesh position={[0, 0.025, 0]}>
        <boxGeometry args={[0.8, 0.003, 0.03]} />
        <meshStandardMaterial color="#b87333" metalness={0.8} />
      </mesh>

      {/* BATTERY */}
      <group position={[-0.35, 0.1, 0]} onClick={handleConnectBattery}>
        <mesh>
          <boxGeometry args={[0.1, 0.15, 0.05]} />
          <meshStandardMaterial 
            color="#1e40af" 
            emissive={!batteryConnected ? "#1e40af" : "#00ff00"} 
            emissiveIntensity={batteryConnected ? 0.3 : 0.1} 
          />
        </mesh>
        <mesh position={[0.03, 0.085, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.02, 16]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[-0.03, 0.08, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.015, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <Html position={[0, 0, 0.03]} center>
          <div className="bg-yellow-400 text-black px-1 text-xs font-bold rounded">9V</div>
        </Html>
        <Html position={[0, 0.12, 0]} center>
          <div className={`px-2 py-1 rounded text-xs font-bold ${batteryConnected ? 'bg-green-500 text-white' : 'bg-blue-500 text-white animate-pulse'}`}>
            {batteryConnected ? '✓ Connectee' : 'Cliquez!'}
          </div>
        </Html>
        {batteryConnected && (
          <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[0.07, 0.08, 32]} />
            <meshBasicMaterial color="#00ff00" side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>

      {/* RESISTOR */}
      <group position={[0, 0.08, 0]} onClick={handleConnectResistor}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.12, 16]} />
          <meshStandardMaterial 
            color="#c2410c" 
            emissive={currentFlowing ? "#ff6600" : batteryConnected && !resistorConnected ? "#c2410c" : "#000"} 
            emissiveIntensity={currentFlowing ? 0.5 : batteryConnected && !resistorConnected ? 0.3 : 0} 
          />
        </mesh>
        {/* Color bands */}
        {[-0.04, -0.015, 0.015, 0.04].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.027, 0.027, 0.01, 16]} />
            <meshStandardMaterial color={['brown', 'black', 'brown', 'gold'][i]} />
          </mesh>
        ))}
        {/* Wire leads */}
        <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 0.04, 8]} />
          <meshStandardMaterial color={resistorConnected ? "#00ff00" : "#888"} />
        </mesh>
        <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 0.04, 8]} />
          <meshStandardMaterial color={resistorConnected ? "#00ff00" : "#888"} />
        </mesh>
        <Html position={[0, 0.06, 0]} center>
          <div className={`px-2 py-1 rounded text-xs font-bold ${
            resistorConnected ? 'bg-green-500 text-white' : 
            batteryConnected ? 'bg-orange-500 text-white animate-bounce' : 'bg-gray-300'
          }`}>
            {resistorConnected ? '✓ 100Ω' : batteryConnected ? 'Connecter!' : '⚡ 100Ω'}
          </div>
        </Html>
      </group>

      {/* BULB */}
      <group position={[0.35, 0.1, 0]} onClick={handleConnectBulb}>
        <mesh>
          <sphereGeometry args={[0.05, 32, 32]} />
          <meshPhysicalMaterial 
            color={bulbLit ? "#ffffaa" : "#ffffff"} 
            transparent 
            opacity={0.4} 
            emissive={bulbLit ? "#ffff00" : "#000"} 
            emissiveIntensity={bulbLit ? 2 : 0} 
          />
        </mesh>
        <mesh>
          <torusGeometry args={[0.02, 0.004, 8, 32]} />
          <meshStandardMaterial color={bulbLit ? "#ffff00" : "#666"} emissive={bulbLit ? "#ffff00" : "#000"} emissiveIntensity={bulbLit ? 3 : 0} />
        </mesh>
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.03, 0.025, 0.04, 16]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.8} />
        </mesh>
        {bulbLit && <pointLight position={[0, 0, 0]} color="#ffff00" intensity={2} distance={1} />}
        <Html position={[0, 0.1, 0]} center>
          <div className={`px-2 py-1 rounded text-xs font-bold ${
            bulbLit ? 'bg-yellow-400 text-black animate-pulse' : 
            resistorConnected ? 'bg-yellow-500 text-black animate-bounce' : 'bg-gray-300'
          }`}>
            {bulbLit ? '💡 ALLUMEE!' : resistorConnected ? 'Allumer!' : '💡 Ampoule'}
          </div>
        </Html>
      </group>

      {/* WIRES */}
      {batteryConnected && <AnimatedWire start={[-0.25, 0.1, 0]} end={[-0.1, 0.08, 0]} color={currentFlowing ? "#00ff00" : "#ff0000"} glowing={currentFlowing} />}
      {resistorConnected && <AnimatedWire start={[0.1, 0.08, 0]} end={[0.25, 0.1, 0]} color={currentFlowing ? "#00ff00" : "#0066ff"} glowing={currentFlowing} />}
      {bulbLit && (
        <>
          <AnimatedWire start={[0.35, 0.04, 0]} end={[0.35, 0.04, 0.2]} color="#00ff00" glowing={true} />
          <AnimatedWire start={[0.35, 0.04, 0.2]} end={[-0.35, 0.04, 0.2]} color="#00ff00" glowing={true} />
          <AnimatedWire start={[-0.35, 0.04, 0.2]} end={[-0.35, 0.1, 0]} color="#00ff00" glowing={true} />
        </>
      )}
      
      {/* Current particles */}
      {currentFlowing && (
        <>
          <CurrentParticles start={[-0.25, 0.1, 0]} end={[-0.1, 0.08, 0]} active={true} />
          <CurrentParticles start={[0.1, 0.08, 0]} end={[0.25, 0.1, 0]} active={true} />
        </>
      )}
    </group>
  )
}

// ============ MAIN PAGE ============

export default function ARLabPage() {
  const navigate = useNavigate()
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedExperiment, setSelectedExperiment] = useState(null)

  if (!selectedSubject) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4 mb-6'>
          <button onClick={() => navigate(-1)} className='btn-secondary'><ArrowLeft size={20} /></button>
          <div>
            <h1 className='text-3xl font-bold'>Laboratoire 3D</h1>
            <p className='text-gray-600'>Experiences scientifiques interactives</p>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div onClick={() => setSelectedSubject('chemistry')} className='card p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-purple-50 to-pink-50'>
            <div className='text-6xl mb-4 text-center'>🧪</div>
            <h2 className='text-2xl font-bold text-center mb-2'>Chimie</h2>
            <p className='text-center text-gray-600'>Reactions, melanges, pH, combustion</p>
          </div>
          <div onClick={() => setSelectedSubject('physics')} className='card p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-blue-50 to-cyan-50'>
            <div className='text-6xl mb-4 text-center'>⚡</div>
            <h2 className='text-2xl font-bold text-center mb-2'>Physique</h2>
            <p className='text-center text-gray-600'>Circuits, electricite</p>
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
          <button onClick={() => setSelectedSubject(null)} className='btn-secondary'><ArrowLeft size={20} /></button>
          <h1 className='text-3xl font-bold'>{selectedSubject === 'chemistry' ? '🧪 Chimie' : '⚡ Physique'}</h1>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {experiments.map((exp) => (
            <div key={exp.id} onClick={() => setSelectedExperiment(exp)} className='card p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105'>
              <h3 className='text-xl font-bold mb-2'>{exp.name}</h3>
              <p className='text-gray-600 mb-4'>{exp.description}</p>
              <button className='btn-primary w-full'><PlayCircle size={18} className='inline mr-2' />Commencer</button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return <ExperimentView experiment={selectedExperiment} onBack={() => setSelectedExperiment(null)} />
}

function ExperimentView({ experiment, onBack }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [arMode, setArMode] = useState(false)
  const [stepsExpanded, setStepsExpanded] = useState(true)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [experimentState, setExperimentState] = useState({
    hclVolume: 0, naohVolume: 0, indicatorAdded: false, pH: 1, color: '#ff6b6b',
    bunsenLit: false, magnesiumBurning: false,
    batteryConnected: false, resistorConnected: false, bulbLit: false, current: 0
  })

  const resetExperiment = () => {
    setExperimentState({
      hclVolume: 0, naohVolume: 0, indicatorAdded: false, pH: 1, color: '#ff6b6b',
      bunsenLit: false, magnesiumBurning: false,
      batteryConnected: false, resistorConnected: false, bulbLit: false, current: 0
    })
    setCurrentStep(0)
    toast.success('Experience reinitialise!')
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setArMode(true)
      toast.success('📷 Mode AR active!')
    } catch { toast.error('Camera non disponible') }
  }

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
    setArMode(false)
  }

  useEffect(() => () => { if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop()) }, [])

  return (
    <div className='flex flex-col h-[calc(100vh-10rem)]'>
      <div className='flex items-center justify-between mb-3'>
        <button onClick={() => { stopCamera(); onBack(); }} className='btn-secondary'><ArrowLeft size={20} /></button>
        <div className='flex-1 mx-4'>
          <h2 className='text-lg font-bold'>{experiment.name}</h2>
          <div className='text-sm text-gray-600'>
            Etape {currentStep + 1}/{experiment.steps.length}
            {experiment.id === 'acid-base' && <span className='ml-2 font-semibold'>pH: {experimentState.pH.toFixed(1)}</span>}
            {experiment.id === 'simple-circuit' && experimentState.current > 0 && <span className='ml-2 font-semibold'>I: {experimentState.current.toFixed(2)}A</span>}
          </div>
        </div>
        <div className='flex gap-2'>
          <button onClick={resetExperiment} className='btn-secondary p-2' title="Recommencer"><RotateCcw size={20} /></button>
          <button onClick={() => arMode ? stopCamera() : startCamera()} className={`p-2 rounded-lg ${arMode ? 'bg-red-500 text-white' : 'bg-gray-100'}`}>
            {arMode ? <X size={20} /> : <Camera size={20} />}
          </button>
        </div>
      </div>

      <div className='card p-2 mb-3 bg-blue-50 border-blue-200'>
        <p className='text-sm flex items-center gap-2'><Hand size={16} /><strong>Touchez</strong> les objets pour interagir</p>
      </div>

      <div className='flex-1 relative rounded-xl overflow-hidden shadow-lg'>
        {arMode && <video ref={videoRef} autoPlay playsInline muted className='absolute inset-0 w-full h-full object-cover' />}
        <div className={`absolute inset-0 ${arMode ? '' : 'bg-gradient-to-b from-sky-200 via-sky-100 to-white'}`}>
          <Canvas camera={{ position: [0, 0.8, 1.2], fov: 45 }} gl={{ alpha: arMode }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1} />
            <LabTable position={[0, -0.02, 0]} />
            
            {experiment.id === 'acid-base' && (
              <AcidBaseExperiment experimentState={experimentState} setExperimentState={setExperimentState} currentStep={currentStep} setCurrentStep={setCurrentStep} experiment={experiment} />
            )}
            {experiment.id === 'combustion' && (
              <CombustionExperiment experimentState={experimentState} setExperimentState={setExperimentState} currentStep={currentStep} setCurrentStep={setCurrentStep} experiment={experiment} />
            )}
            {experiment.id === 'simple-circuit' && (
              <CircuitExperiment experimentState={experimentState} setExperimentState={setExperimentState} currentStep={currentStep} setCurrentStep={setCurrentStep} experiment={experiment} />
            )}
            
            <OrbitControls enablePan={false} maxDistance={2.5} minDistance={0.5} maxPolarAngle={Math.PI / 2.2} />
          </Canvas>
        </div>
        
        {arMode && (
          <div className='absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1'>
            <span className='w-2 h-2 bg-white rounded-full animate-pulse'></span>AR
          </div>
        )}
        
        <StepsPanel steps={experiment.steps} currentStep={currentStep} isAR={arMode} expanded={stepsExpanded} onToggle={() => setStepsExpanded(!stepsExpanded)} />
      </div>
    </div>
  )
}
