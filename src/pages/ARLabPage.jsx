import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { arLabService, calculatePH, getIndicatorColor, calculateCurrent } from '../services/arLab'
import toast from 'react-hot-toast'
import { ArrowLeft, PlayCircle, Camera, X, List, ChevronDown, ChevronUp, Circle, CheckCircle, RotateCcw, MousePointer, Hand } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'

// ============ TARGET ZONE ============

function TargetZone({ position, label, active, onClick }) {
  const ringRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (ringRef.current && active) {
      ringRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.15)
    }
  })
  
  if (!active) return null
  
  return (
    <group 
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick && onClick() }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.15, 32]} />
        <meshBasicMaterial color={hovered ? "#16a34a" : "#22c55e"} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1, 32]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <Html position={[0, 0.25, 0]} center>
        <div className={`px-3 py-2 rounded-lg text-sm font-bold shadow-lg whitespace-nowrap transition-all ${hovered ? 'bg-green-700 scale-110' : 'bg-green-600'} text-white animate-bounce`}>
          {label}
        </div>
      </Html>
    </group>
  )
}

// ============ CLICKABLE OBJECT ============

function ClickableObject({ children, position, selected, onClick, enabled, label }) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef()
  
  useFrame((state) => {
    if (groupRef.current && selected) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 8) * 0.02
    }
  })
  
  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => { e.stopPropagation(); enabled && onClick && onClick() }}
      onPointerOver={() => enabled && setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {children}
      
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <ringGeometry args={[0.12, 0.16, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {hovered && !selected && enabled && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <ringGeometry args={[0.1, 0.13, 32]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {enabled && !selected && (
        <Html position={[0, -0.12, 0]} center>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow cursor-pointer transition-all ${hovered ? 'bg-green-600 text-white scale-110' : 'bg-green-500 text-white'}`}>
            <MousePointer size={12} /> Cliquez
          </div>
        </Html>
      )}
      
      {selected && (
        <Html position={[0, -0.12, 0]} center>
          <div className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold shadow animate-pulse">
            ✓ Cliquez sur la cible verte!
          </div>
        </Html>
      )}
      
      {!enabled && (
        <Html position={[0, -0.1, 0]} center>
          <div className="bg-gray-400 text-white px-2 py-1 rounded-full text-xs">
            🔒
          </div>
        </Html>
      )}
    </group>
  )
}

// ============ WIRE ============

function Wire({ start, end, color = "#ff0000", glowing = false }) {
  const ref = useRef()
  
  useFrame((state) => {
    if (ref.current && glowing) {
      ref.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 6) * 0.3
    }
  })
  
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ])
  
  return (
    <mesh ref={ref}>
      <tubeGeometry args={[curve, 16, 0.012, 8, false]} />
      <meshStandardMaterial 
        color={color} 
        emissive={glowing ? color : "#000"} 
        emissiveIntensity={glowing ? 0.5 : 0}
      />
    </mesh>
  )
}

// ============ CIRCUIT EXPERIMENT ============

function CircuitExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { batteryConnected, resistorConnected, bulbLit } = state
  const currentFlowing = bulbLit

  const shelfY = 0.12
  const circuitY = 0.12

  const handlePlaceBattery = () => {
    if (selectedItem === 'battery') {
      setState(p => ({ ...p, batteryConnected: true }))
      setSelectedItem(null)
      setStep(1)
      toast.success('🔋 Pile connectee!')
    }
  }

  const handlePlaceResistor = () => {
    if (selectedItem === 'resistor') {
      setState(p => ({ ...p, resistorConnected: true }))
      setSelectedItem(null)
      setStep(2)
      toast.success('⚡ Resistance connectee!')
    }
  }

  const handlePlaceBulb = () => {
    if (selectedItem === 'bulb') {
      const i = calculateCurrent(9, 100)
      setState(p => ({ ...p, bulbLit: true, current: i }))
      setSelectedItem(null)
      setStep(experiment.steps.length - 1)
      toast.success(`💡 Circuit complet! I = ${i.toFixed(2)}A`)
    }
  }

  return (
    <group>
      {/* Circuit Board */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[1.2, 0.03, 0.6]} />
        <meshStandardMaterial color="#1a5c32" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.9, 0.005, 0.04]} />
        <meshStandardMaterial color="#b87333" metalness={0.9} />
      </mesh>

      {/* Shelf */}
      <mesh position={[0, 0.01, 0.45]}>
        <boxGeometry args={[1.2, 0.03, 0.35]} />
        <meshStandardMaterial color="#2d2d2d" />
      </mesh>
      <Html position={[0, 0.12, 0.6]} center>
        <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold">
          📦 Composants
        </div>
      </Html>

      {/* Targets */}
      <TargetZone position={[-0.35, 0.05, 0]} label="⬇️ Pile" active={selectedItem === 'battery'} onClick={handlePlaceBattery} />
      <TargetZone position={[0, 0.05, 0]} label="⬇️ Resistance" active={selectedItem === 'resistor'} onClick={handlePlaceResistor} />
      <TargetZone position={[0.35, 0.05, 0]} label="⬇️ Ampoule" active={selectedItem === 'bulb'} onClick={handlePlaceBulb} />

      {/* Battery */}
      {!batteryConnected ? (
        <ClickableObject
          position={[-0.35, shelfY, 0.45]}
          selected={selectedItem === 'battery'}
          enabled={true}
          onClick={() => setSelectedItem(selectedItem === 'battery' ? null : 'battery')}
        >
          <Battery />
        </ClickableObject>
      ) : (
        <group position={[-0.35, circuitY, 0]}><Battery connected /></group>
      )}

      {/* Resistor */}
      {!resistorConnected ? (
        <ClickableObject
          position={[0, shelfY, 0.45]}
          selected={selectedItem === 'resistor'}
          enabled={batteryConnected}
          onClick={() => setSelectedItem(selectedItem === 'resistor' ? null : 'resistor')}
        >
          <Resistor />
        </ClickableObject>
      ) : (
        <group position={[0, circuitY, 0]}><Resistor connected currentFlowing={currentFlowing} /></group>
      )}

      {/* Bulb */}
      {!bulbLit ? (
        <ClickableObject
          position={[0.35, shelfY + 0.02, 0.45]}
          selected={selectedItem === 'bulb'}
          enabled={resistorConnected}
          onClick={() => setSelectedItem(selectedItem === 'bulb' ? null : 'bulb')}
        >
          <Bulb />
        </ClickableObject>
      ) : (
        <group position={[0.35, circuitY + 0.02, 0]}><Bulb lit /></group>
      )}

      {/* Wires */}
      {batteryConnected && <Wire start={[-0.25, 0.12, 0]} end={[-0.1, 0.12, 0]} color={currentFlowing ? "#00ff00" : "#cc0000"} glowing={currentFlowing} />}
      {resistorConnected && <Wire start={[0.1, 0.12, 0]} end={[0.25, 0.14, 0]} color={currentFlowing ? "#00ff00" : "#0066cc"} glowing={currentFlowing} />}
      {bulbLit && (
        <>
          <Wire start={[0.35, 0.06, 0]} end={[0.35, 0.06, -0.22]} color="#00ff00" glowing />
          <Wire start={[0.35, 0.06, -0.22]} end={[-0.35, 0.06, -0.22]} color="#00ff00" glowing />
          <Wire start={[-0.35, 0.06, -0.22]} end={[-0.35, 0.12, 0]} color="#00ff00" glowing />
        </>
      )}
    </group>
  )
}

function Battery({ connected }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.1, 0.16, 0.06]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>
      <mesh position={[0.03, 0.09, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.025, 16]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <mesh position={[-0.03, 0.085, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.02, 16]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <Html position={[0, 0, 0.04]} center>
        <div className="bg-yellow-400 text-black px-1.5 text-xs font-bold rounded">9V</div>
      </Html>
      {connected && (
        <Html position={[0, 0.13, 0]} center>
          <div className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-bold">✓</div>
        </Html>
      )}
    </group>
  )
}

function Resistor({ connected, currentFlowing }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current && currentFlowing) {
      ref.current.material.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 5) * 0.2
    }
  })
  
  return (
    <group>
      <mesh ref={ref} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.14, 16]} />
        <meshStandardMaterial 
          color="#c2410c" 
          emissive={currentFlowing ? "#ff6600" : "#000"}
          emissiveIntensity={0}
        />
      </mesh>
      {[-0.045, -0.015, 0.015, 0.045].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.032, 0.032, 0.012, 16]} />
          <meshStandardMaterial color={['#8B4513', '#000', '#8B4513', '#FFD700'][i]} />
        </mesh>
      ))}
      {connected && (
        <Html position={[0, 0.08, 0]} center>
          <div className={`px-2 py-0.5 rounded text-xs font-bold ${currentFlowing ? 'bg-orange-500 text-white animate-pulse' : 'bg-green-500 text-white'}`}>
            {currentFlowing ? '⚡ 100Ω' : '✓ 100Ω'}
          </div>
        </Html>
      )}
    </group>
  )
}

function Bulb({ lit }) {
  const glowRef = useRef()
  useFrame((state) => {
    if (glowRef.current && lit) {
      glowRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.2
    }
  })
  
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.055, 32, 32]} />
        <meshPhysicalMaterial 
          color={lit ? "#ffffcc" : "#ffffff"} 
          transparent opacity={0.4}
          emissive={lit ? "#ffff00" : "#000"}
          emissiveIntensity={lit ? 2 : 0}
        />
      </mesh>
      {lit && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.09, 32, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.4} />
        </mesh>
      )}
      <mesh>
        <torusGeometry args={[0.025, 0.006, 8, 32]} />
        <meshStandardMaterial 
          color={lit ? "#ffff00" : "#555"} 
          emissive={lit ? "#ffff00" : "#000"}
          emissiveIntensity={lit ? 3 : 0}
        />
      </mesh>
      <mesh position={[0, -0.075, 0]}>
        <cylinderGeometry args={[0.035, 0.028, 0.05, 16]} />
        <meshStandardMaterial color="#888" metalness={0.9} />
      </mesh>
      {lit && <pointLight color="#ffff00" intensity={2.5} distance={1.5} />}
      {lit && (
        <Html position={[0, 0.15, 0]} center>
          <div className="bg-yellow-400 text-black px-3 py-1 rounded-lg text-sm font-bold animate-pulse shadow-lg">💡 ALLUMEE!</div>
        </Html>
      )}
    </group>
  )
}

// ============ ACID-BASE EXPERIMENT ============

function AcidBaseExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { hclVolume, indicatorAdded, pH, color, neutralized } = state

  const beakerPos = [0, 0.12, -0.05]
  const shelfY = 0.12

  const handlePourHCl = () => {
    if (selectedItem === 'hcl') {
      setState(p => ({ ...p, hclVolume: 50, pH: 1 }))
      setSelectedItem(null)
      setStep(1)
      toast.success('🧪 HCl verse! pH = 1 (tres acide)')
    }
  }

  const handlePourIndicator = () => {
    if (selectedItem === 'indicator') {
      setState(p => ({ ...p, indicatorAdded: true }))
      setSelectedItem(null)
      setStep(2)
      toast.success('💧 Indicateur ajoute! Solution rouge = acide')
    }
  }

  const handlePourNaOH = () => {
    if (selectedItem === 'naoh' && !neutralized) {
      setState(p => {
        const newNaOH = p.naohVolume + 8
        const newPH = calculatePH(p.hclVolume, newNaOH)
        const newColor = getIndicatorColor(newPH)
        const isNeutralized = newPH >= 6.5
        
        if (isNeutralized) {
          setTimeout(() => {
            setStep(experiment.steps.length - 1)
            toast.success('🎉 Neutralisation reussie! pH ≈ 7 (neutre)')
          }, 300)
        } else {
          toast.success(`NaOH ajoute! pH: ${newPH.toFixed(1)} - Continuez...`)
        }
        
        return { ...p, naohVolume: newNaOH, pH: newPH, color: newColor, neutralized: isNeutralized }
      })
      setSelectedItem(null)
    }
  }

  return (
    <group>
      {/* Work surface */}
      <mesh position={[0, 0.01, 0.05]}>
        <boxGeometry args={[1.2, 0.03, 0.65]} />
        <meshStandardMaterial color="#3d3d3d" />
      </mesh>

      {/* Shelf */}
      <mesh position={[0, 0.01, 0.48]}>
        <boxGeometry args={[1.2, 0.03, 0.3]} />
        <meshStandardMaterial color="#2d2d2d" />
      </mesh>
      <Html position={[0, 0.12, 0.6]} center>
        <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold">
          🧪 Reactifs
        </div>
      </Html>

      {/* Beaker */}
      <group position={beakerPos}>
        <mesh>
          <cylinderGeometry args={[0.14, 0.12, 0.26, 32, 1, true]} />
          <meshPhysicalMaterial color="#fff" transparent opacity={0.2} roughness={0.05} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.13, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.006, 32]} />
          <meshPhysicalMaterial color="#fff" transparent opacity={0.25} />
        </mesh>
        {hclVolume > 0 && (
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.12, 0.11, 0.2, 32]} />
            <meshStandardMaterial color={color} transparent opacity={0.85} />
          </mesh>
        )}
        <Html position={[0, 0.2, 0]} center>
          <div className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
            🧪 Becher {hclVolume > 0 && `| pH: ${pH.toFixed(1)}`}
            {neutralized && ' ✓'}
          </div>
        </Html>
      </group>

      {/* Target */}
      <TargetZone 
        position={[beakerPos[0], beakerPos[1] + 0.2, beakerPos[2]]} 
        label="⬇️ Verser ici" 
        active={(selectedItem === 'hcl' && hclVolume === 0) || 
                (selectedItem === 'indicator' && hclVolume > 0 && !indicatorAdded) || 
                (selectedItem === 'naoh' && indicatorAdded && !neutralized)} 
        onClick={() => {
          if (selectedItem === 'hcl') handlePourHCl()
          else if (selectedItem === 'indicator') handlePourIndicator()
          else if (selectedItem === 'naoh') handlePourNaOH()
        }}
      />

      {/* HCl */}
      <ClickableObject
        position={[-0.4, shelfY, 0.45]}
        selected={selectedItem === 'hcl'}
        enabled={hclVolume === 0}
        onClick={() => setSelectedItem(selectedItem === 'hcl' ? null : 'hcl')}
      >
        <Bottle color="#ff6b6b" label="HCl" sublabel={hclVolume > 0 ? "Utilise" : "Acide"} disabled={hclVolume > 0} />
      </ClickableObject>

      {/* Indicator */}
      <ClickableObject
        position={[0, shelfY - 0.02, 0.48]}
        selected={selectedItem === 'indicator'}
        enabled={hclVolume > 0 && !indicatorAdded}
        onClick={() => setSelectedItem(selectedItem === 'indicator' ? null : 'indicator')}
      >
        <Bottle color="#9b59b6" label="Ind." sublabel={indicatorAdded ? "Utilise" : "pH"} small disabled={indicatorAdded} />
      </ClickableObject>

      {/* NaOH */}
      <ClickableObject
        position={[0.4, shelfY, 0.45]}
        selected={selectedItem === 'naoh'}
        enabled={indicatorAdded && !neutralized}
        onClick={() => setSelectedItem(selectedItem === 'naoh' ? null : 'naoh')}
      >
        <Bottle color="#4dabf7" label="NaOH" sublabel={neutralized ? "Termine" : "Base"} disabled={neutralized} />
      </ClickableObject>

      {/* Completion message */}
      {neutralized && (
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-lg font-bold shadow-xl animate-bounce">
            ✅ Experience terminee! Neutralisation reussie!
          </div>
        </Html>
      )}
    </group>
  )
}

function Bottle({ color, label, sublabel, small, disabled }) {
  const s = small ? 0.7 : 1
  return (
    <group scale={[s, s, s]}>
      <mesh>
        <cylinderGeometry args={[0.055, 0.055, 0.16, 16]} />
        <meshStandardMaterial color={color} transparent opacity={disabled ? 0.35 : 0.85} />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.025, 16]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <Html position={[0, 0.16, 0]} center>
        <div className={`px-2 py-1 rounded text-center shadow ${disabled ? 'bg-gray-300 text-gray-500' : 'bg-white'}`}>
          <div className="font-bold text-sm">{label}</div>
          <div className="text-xs opacity-70">{sublabel}</div>
        </div>
      </Html>
    </group>
  )
}

// ============ COMBUSTION EXPERIMENT ============

function CombustionExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { bunsenLit, magnesiumBurning } = state

  const shelfY = 0.1

  const handleIgnite = () => {
    if (selectedItem === 'lighter') {
      setState(p => ({ ...p, bunsenLit: true }))
      setSelectedItem(null)
      setStep(1)
      toast.success('🔥 Bec Bunsen allume!')
    }
  }

  const handleBurnMg = () => {
    if (selectedItem === 'magnesium') {
      setState(p => ({ ...p, magnesiumBurning: true }))
      setSelectedItem(null)
      setStep(2)
      toast.success('✨ Magnesium en combustion!')
      setTimeout(() => {
        toast('⚠️ Ne regardez jamais directement!', { icon: '🕶️' })
        setStep(experiment.steps.length - 1)
      }, 2000)
    }
  }

  return (
    <group>
      {/* Work surface */}
      <mesh position={[0, 0.01, 0.05]}>
        <boxGeometry args={[1.2, 0.03, 0.55]} />
        <meshStandardMaterial color="#3d3d3d" />
      </mesh>

      {/* Shelf */}
      <mesh position={[0, 0.01, 0.42]}>
        <boxGeometry args={[1.2, 0.03, 0.25]} />
        <meshStandardMaterial color="#2d2d2d" />
      </mesh>
      <Html position={[0, 0.1, 0.55]} center>
        <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold">
          🔧 Outils
        </div>
      </Html>

      {/* Bunsen Burner */}
      <group position={[0, 0.02, 0]}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.04, 16]} />
          <meshStandardMaterial color="#333" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.22, 16]} />
          <meshStandardMaterial color="#444" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.27, 0]}>
          <cylinderGeometry args={[0.04, 0.035, 0.05, 16]} />
          <meshStandardMaterial color="#333" metalness={0.9} />
        </mesh>
        {bunsenLit && (
          <>
            <mesh position={[0, 0.35, 0]}>
              <coneGeometry args={[0.04, 0.15, 16]} />
              <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={2} transparent opacity={0.9} />
            </mesh>
            <mesh position={[0, 0.33, 0]}>
              <coneGeometry args={[0.025, 0.1, 16]} />
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1.5} transparent opacity={0.7} />
            </mesh>
            <pointLight position={[0, 0.35, 0]} color="#ff6600" intensity={2} distance={1} />
          </>
        )}
        <Html position={[0, 0.5, 0]} center>
          <div className={`px-3 py-1 rounded-lg text-sm font-bold shadow ${bunsenLit ? 'bg-orange-500 text-white' : 'bg-gray-300'}`}>
            🔥 Bec Bunsen {bunsenLit && '(Allume)'}
          </div>
        </Html>
      </group>

      {/* Targets */}
      <TargetZone position={[0, 0.3, 0]} label="🔥 Allumer" active={selectedItem === 'lighter'} onClick={handleIgnite} />
      {bunsenLit && <TargetZone position={[0, 0.4, 0]} label="✨ Bruler" active={selectedItem === 'magnesium'} onClick={handleBurnMg} />}

      {/* Lighter */}
      <ClickableObject
        position={[-0.38, shelfY, 0.42]}
        selected={selectedItem === 'lighter'}
        enabled={!bunsenLit}
        onClick={() => setSelectedItem(selectedItem === 'lighter' ? null : 'lighter')}
      >
        <Lighter disabled={bunsenLit} />
      </ClickableObject>

      {/* Magnesium */}
      {!magnesiumBurning ? (
        <ClickableObject
          position={[0.38, shelfY + 0.02, 0.42]}
          selected={selectedItem === 'magnesium'}
          enabled={bunsenLit}
          onClick={() => setSelectedItem(selectedItem === 'magnesium' ? null : 'magnesium')}
        >
          <Magnesium />
        </ClickableObject>
      ) : (
        <group position={[0, 0.4, 0]}><Magnesium burning /></group>
      )}

      {/* Completion */}
      {magnesiumBurning && (
        <Html position={[0, 0.65, 0]} center>
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-lg font-bold shadow-xl">
            ✅ Combustion du magnesium reussie!
          </div>
        </Html>
      )}
    </group>
  )
}

function Lighter({ disabled }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.035, 0.1, 0.022]} />
        <meshStandardMaterial color={disabled ? "#777" : "#e74c3c"} />
      </mesh>
      <mesh position={[0, 0.055, 0]}>
        <boxGeometry args={[0.02, 0.025, 0.018]} />
        <meshStandardMaterial color="#222" metalness={0.9} />
      </mesh>
      <Html position={[0, 0.12, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-bold shadow ${disabled ? 'bg-gray-300 text-gray-500' : 'bg-red-500 text-white'}`}>
          🔥 Briquet
        </div>
      </Html>
    </group>
  )
}

function Magnesium({ burning }) {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 5]}>
        <boxGeometry args={[0.2, 0.015, 0.008]} />
        <meshStandardMaterial 
          color={burning ? "#fff" : "#bbb"} 
          metalness={0.95}
          emissive={burning ? "#fff" : "#000"}
          emissiveIntensity={burning ? 5 : 0}
        />
      </mesh>
      {burning && (
        <>
          <pointLight color="#fff" intensity={8} distance={2.5} />
          <mesh>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#fff" transparent opacity={0.7} />
          </mesh>
          <Html position={[0, 0.2, 0]} center>
            <div className="bg-white text-black px-3 py-1 rounded-lg text-sm font-bold animate-pulse shadow-xl">
              ✨ COMBUSTION VIVE!
            </div>
          </Html>
        </>
      )}
    </group>
  )
}

// ============ SHARED ============

function LabTable({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1.5, 0.06, 1.2]} />
      <meshStandardMaterial color="#8B4513" roughness={0.8} />
    </mesh>
  )
}

function StepsPanel({ steps, currentStep, expanded, onToggle }) {
  return (
    <div className="absolute top-2 right-2 z-20 max-w-[240px]">
      <div className="rounded-xl shadow-lg overflow-hidden bg-white/95 backdrop-blur">
        <button onClick={onToggle} className="w-full px-3 py-2 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <List size={16} />
            <span className="font-bold text-sm">Etapes ({currentStep + 1}/{steps.length})</span>
          </div>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expanded && (
          <div className="px-3 pb-3 pt-1 max-h-[200px] overflow-y-auto">
            {steps.map((step, i) => (
              <div key={i} className={`flex items-start gap-2 py-1.5 text-xs ${
                i < currentStep ? 'text-green-600' : i === currentStep ? 'text-orange-500 font-bold' : 'text-gray-400'
              }`}>
                {i < currentStep ? <CheckCircle size={14} /> : 
                 i === currentStep ? <Circle size={14} className="animate-pulse" /> : 
                 <Circle size={14} />}
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============ MAIN PAGE ============

export default function ARLabPage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState(null)
  const [experiment, setExperiment] = useState(null)

  if (!subject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="btn-secondary"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-3xl font-bold">Laboratoire 3D</h1>
            <p className="text-gray-600">Experiences interactives</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div onClick={() => setSubject('chemistry')} className="card p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="text-6xl mb-4 text-center">🧪</div>
            <h2 className="text-2xl font-bold text-center mb-2">Chimie</h2>
            <p className="text-center text-gray-600">Reactions acide-base, combustion</p>
          </div>
          <div onClick={() => setSubject('physics')} className="card p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="text-6xl mb-4 text-center">⚡</div>
            <h2 className="text-2xl font-bold text-center mb-2">Physique</h2>
            <p className="text-center text-gray-600">Circuits electriques</p>
          </div>
        </div>
      </div>
    )
  }

  if (!experiment) {
    const experiments = arLabService.getAllExperiments(subject)
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setSubject(null)} className="btn-secondary"><ArrowLeft size={20} /></button>
          <h1 className="text-3xl font-bold">{subject === 'chemistry' ? '🧪 Chimie' : '⚡ Physique'}</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiments.map((exp) => (
            <div key={exp.id} onClick={() => setExperiment(exp)} className="card p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all">
              <h3 className="text-xl font-bold mb-2">{exp.name}</h3>
              <p className="text-gray-600 mb-4">{exp.description}</p>
              <button className="btn-primary w-full"><PlayCircle size={18} className="inline mr-2" />Commencer</button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return <ExperimentView experiment={experiment} onBack={() => setExperiment(null)} />
}

function ExperimentView({ experiment, onBack }) {
  const [step, setStep] = useState(0)
  const [arMode, setArMode] = useState(false)
  const [stepsOpen, setStepsOpen] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [state, setState] = useState({
    hclVolume: 0, naohVolume: 0, indicatorAdded: false, pH: 1, color: '#ff6b6b', neutralized: false,
    bunsenLit: false, magnesiumBurning: false,
    batteryConnected: false, resistorConnected: false, bulbLit: false, current: 0
  })

  const reset = () => {
    setState({
      hclVolume: 0, naohVolume: 0, indicatorAdded: false, pH: 1, color: '#ff6b6b', neutralized: false,
      bunsenLit: false, magnesiumBurning: false,
      batteryConnected: false, resistorConnected: false, bulbLit: false, current: 0
    })
    setStep(0)
    setSelectedItem(null)
    toast.success('🔄 Reinitialise!')
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setArMode(true)
      toast.success('📷 Mode AR!')
    } catch { toast.error('Camera indisponible') }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setArMode(false)
  }

  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), [])

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => { stopCamera(); onBack() }} className="btn-secondary"><ArrowLeft size={20} /></button>
        <div className="flex-1 mx-3">
          <h2 className="text-lg font-bold">{experiment.name}</h2>
          <div className="text-sm text-gray-500">
            Etape {step + 1}/{experiment.steps.length}
            {experiment.id === 'acid-base' && state.hclVolume > 0 && <span className="ml-2 font-bold text-purple-600">pH: {state.pH.toFixed(1)}</span>}
            {experiment.id === 'simple-circuit' && state.current > 0 && <span className="ml-2 font-bold text-yellow-600">I: {state.current.toFixed(2)}A</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="btn-secondary p-2"><RotateCcw size={18} /></button>
          <button onClick={() => arMode ? stopCamera() : startCamera()} className={`p-2 rounded-lg ${arMode ? 'bg-red-500 text-white' : 'bg-gray-100'}`}>
            {arMode ? <X size={18} /> : <Camera size={18} />}
          </button>
        </div>
      </div>

      <div className="bg-blue-100 border border-blue-300 rounded-lg p-2 mb-2 text-sm flex items-center gap-2">
        <Hand size={18} className="text-blue-600" />
        <span><strong>1.</strong> Cliquez objet <strong>2.</strong> Cliquez cible verte</span>
      </div>

      {selectedItem && (
        <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-2 mb-2 text-sm flex items-center justify-between">
          <span className="font-bold">✓ {selectedItem.toUpperCase()} - Cliquez sur la cible verte!</span>
          <button onClick={() => setSelectedItem(null)} className="text-yellow-700 hover:text-yellow-900 font-bold">✕</button>
        </div>
      )}

      <div className="flex-1 relative rounded-xl overflow-hidden shadow-xl">
        {arMode && <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />}
        <div className={`absolute inset-0 ${arMode ? '' : 'bg-gradient-to-b from-sky-300 via-sky-100 to-white'}`}>
          <Canvas camera={{ position: [0, 1.4, 2.2], fov: 38 }} gl={{ alpha: arMode }}>
            <ambientLight intensity={0.9} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} />
            <LabTable position={[0, -0.03, 0.15]} />
            
            {experiment.id === 'acid-base' && <AcidBaseExperiment state={state} setState={setState} setStep={setStep} experiment={experiment} selectedItem={selectedItem} setSelectedItem={setSelectedItem} />}
            {experiment.id === 'combustion' && <CombustionExperiment state={state} setState={setState} setStep={setStep} experiment={experiment} selectedItem={selectedItem} setSelectedItem={setSelectedItem} />}
            {experiment.id === 'simple-circuit' && <CircuitExperiment state={state} setState={setState} setStep={setStep} experiment={experiment} selectedItem={selectedItem} setSelectedItem={setSelectedItem} />}
            
            <OrbitControls enablePan={false} minDistance={1} maxDistance={4} maxPolarAngle={Math.PI / 2.1} />
          </Canvas>
        </div>
        
        {arMode && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />AR
          </div>
        )}
        
        <StepsPanel steps={experiment.steps} currentStep={step} expanded={stepsOpen} onToggle={() => setStepsOpen(!stepsOpen)} />
      </div>
    </div>
  )
}
