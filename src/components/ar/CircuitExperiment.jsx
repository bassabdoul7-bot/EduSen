import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// Animated wire that shows current flow
function Wire({ start, end, connected, currentFlowing }) {
  const ref = useRef()
  const [dashOffset, setDashOffset] = useState(0)
  
  useFrame((state, delta) => {
    if (currentFlowing) {
      setDashOffset(prev => prev - delta * 2)
    }
  })
  
  if (!connected) return null
  
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)]
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
  
  return (
    <group>
      {/* Base wire */}
      <line geometry={lineGeometry}>
        <lineBasicMaterial color={currentFlowing ? "#00ff00" : "#666666"} linewidth={3} />
      </line>
      
      {/* Glow effect when current flows */}
      {currentFlowing && (
        <line geometry={lineGeometry}>
          <lineBasicMaterial color="#00ff00" linewidth={6} transparent opacity={0.3} />
        </line>
      )}
    </group>
  )
}

// Animated current particles
function CurrentParticle({ start, end, active }) {
  const ref = useRef()
  const [progress, setProgress] = useState(0)
  
  useFrame((state, delta) => {
    if (active) {
      setProgress(prev => (prev + delta * 2) % 1)
    }
  })
  
  if (!active) return null
  
  const x = start[0] + (end[0] - start[0]) * progress
  const y = start[1] + (end[1] - start[1]) * progress
  const z = start[2] + (end[2] - start[2]) * progress
  
  return (
    <mesh ref={ref} position={[x, y, z]}>
      <sphereGeometry args={[0.008, 8, 8]} />
      <meshBasicMaterial color="#ffff00" />
    </mesh>
  )
}

export function InteractiveBattery({ position, connected, onConnect }) {
  const [hovered, setHovered] = useState(false)
  
  return (
    <group 
      position={position}
      onClick={onConnect}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Battery body */}
      <mesh>
        <boxGeometry args={[0.08, 0.12, 0.04]} />
        <meshStandardMaterial 
          color="#1e40af" 
          metalness={0.3} 
          roughness={0.7}
          emissive={hovered && !connected ? "#1e40af" : connected ? "#00ff00" : "#000000"}
          emissiveIntensity={hovered || connected ? 0.3 : 0}
        />
      </mesh>
      
      {/* Positive terminal */}
      <mesh position={[0.025, 0.07, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.02, 16]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <Html position={[0.025, 0.09, 0]} center>
        <div className="text-red-500 font-bold text-xs">+</div>
      </Html>
      
      {/* Negative terminal */}
      <mesh position={[-0.025, 0.065, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.015, 16]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <Html position={[-0.025, 0.085, 0]} center>
        <div className="text-gray-800 font-bold text-xs">-</div>
      </Html>
      
      {/* Label */}
      <Html position={[0, 0, 0.025]} center>
        <div className="bg-yellow-400 text-black px-1 text-xs font-bold rounded">9V</div>
      </Html>
      
      {/* Selection ring */}
      {hovered && !connected && (
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.07, 0]}>
          <ringGeometry args={[0.06, 0.07, 32]} />
          <meshBasicMaterial color="#00ff00" side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* Status indicator */}
      <Html position={[0, 0.12, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-bold ${connected ? 'bg-green-500 text-white' : hovered ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-200'}`}>
          {connected ? '✓ Connectee' : hovered ? 'Cliquez!' : '🔋 Pile'}
        </div>
      </Html>
    </group>
  )
}

export function InteractiveResistor({ position, connected, canConnect, onConnect, currentFlowing }) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef()
  
  // Glow animation when current flows
  useFrame((state) => {
    if (meshRef.current && currentFlowing) {
      meshRef.current.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 5) * 0.2
    }
  })
  
  return (
    <group 
      position={position}
      onClick={() => canConnect && onConnect()}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Resistor body */}
      <mesh ref={meshRef} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
        <meshStandardMaterial 
          color="#c2410c" 
          roughness={0.8}
          emissive={currentFlowing ? "#ff6600" : canConnect && hovered ? "#c2410c" : "#000000"}
          emissiveIntensity={currentFlowing ? 0.5 : canConnect && hovered ? 0.3 : 0}
        />
      </mesh>
      
      {/* Color bands */}
      {[-0.03, -0.01, 0.01, 0.03].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, 0.008, 16]} />
          <meshStandardMaterial color={['#78350f', '#000000', '#78350f', '#d4af37'][i]} />
        </mesh>
      ))}
      
      {/* Wire leads */}
      <mesh position={[-0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.04, 8]} />
        <meshStandardMaterial color={connected ? "#00ff00" : "#d4d4d4"} metalness={0.9} />
      </mesh>
      <mesh position={[0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.04, 8]} />
        <meshStandardMaterial color={connected ? "#00ff00" : "#d4d4d4"} metalness={0.9} />
      </mesh>
      
      {/* Selection indicator */}
      {canConnect && (
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.04, 0]}>
          <ringGeometry args={[0.08, 0.1, 32]} />
          <meshBasicMaterial color="#00ff00" side={THREE.DoubleSide} transparent opacity={hovered ? 1 : 0.5} />
        </mesh>
      )}
      
      {/* Label */}
      <Html position={[0, 0.06, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-bold ${
          connected ? 'bg-green-500 text-white' : 
          canConnect ? (hovered ? 'bg-orange-500 text-white animate-bounce' : 'bg-orange-400 text-white') : 
          'bg-gray-200'
        }`}>
          {connected ? '✓ 100Ω' : canConnect ? (hovered ? 'Connecter!' : '⚡ Resistance') : '⚡ 100Ω'}
        </div>
      </Html>
    </group>
  )
}

export function InteractiveBulb({ position, lit, canConnect, onConnect }) {
  const [hovered, setHovered] = useState(false)
  const glowRef = useRef()
  
  // Pulsing glow when lit
  useFrame((state) => {
    if (glowRef.current && lit) {
      glowRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2
    }
  })
  
  return (
    <group 
      position={position}
      onClick={() => canConnect && onConnect()}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Glass bulb */}
      <mesh>
        <sphereGeometry args={[0.04, 32, 32]} />
        <meshPhysicalMaterial
          color={lit ? "#ffffaa" : "#ffffff"}
          transparent
          opacity={0.4}
          transmission={0.8}
          roughness={0.1}
          emissive={lit ? "#ffff00" : "#000000"}
          emissiveIntensity={lit ? 1 : 0}
        />
      </mesh>
      
      {/* Glow effect */}
      {lit && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.06, 32, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.3} />
        </mesh>
      )}
      
      {/* Filament */}
      <mesh>
        <torusGeometry args={[0.015, 0.003, 8, 32]} />
        <meshStandardMaterial
          color={lit ? "#ffff00" : "#666666"}
          emissive={lit ? "#ffff00" : "#000000"}
          emissiveIntensity={lit ? 3 : 0}
        />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, -0.055, 0]}>
        <cylinderGeometry args={[0.025, 0.02, 0.035, 16]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Screw threads */}
      {[-0.045, -0.055, -0.065].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.022, 0.002, 8, 32]} />
          <meshStandardMaterial color="#777" metalness={0.9} />
        </mesh>
      ))}
      
      {/* Point light when lit */}
      {lit && (
        <pointLight position={[0, 0, 0]} color="#ffff00" intensity={2} distance={1} />
      )}
      
      {/* Selection indicator */}
      {canConnect && (
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.09, 0]}>
          <ringGeometry args={[0.05, 0.06, 32]} />
          <meshBasicMaterial color="#ffff00" side={THREE.DoubleSide} transparent opacity={hovered ? 1 : 0.5} />
        </mesh>
      )}
      
      {/* Label */}
      <Html position={[0, 0.08, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-bold ${
          lit ? 'bg-yellow-400 text-black animate-pulse' : 
          canConnect ? (hovered ? 'bg-yellow-500 text-black animate-bounce' : 'bg-yellow-300 text-black') : 
          'bg-gray-200'
        }`}>
          {lit ? '💡 ALLUMEE!' : canConnect ? (hovered ? 'Allumer!' : '💡 Ampoule') : '💡 Ampoule'}
        </div>
      </Html>
    </group>
  )
}

export function CircuitBoard({ position }) {
  return (
    <group position={position}>
      {/* Main board */}
      <mesh>
        <boxGeometry args={[0.9, 0.015, 0.5]} />
        <meshStandardMaterial color="#1a472a" roughness={0.8} />
      </mesh>
      
      {/* Copper traces pattern */}
      {[[-0.3, 0.008, 0], [0, 0.008, 0], [0.3, 0.008, 0]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.15, 0.002, 0.02]} />
          <meshStandardMaterial color="#b87333" metalness={0.8} />
        </mesh>
      ))}
      
      {/* Connection points */}
      {[[-0.3, 0.01, 0.1], [-0.3, 0.01, -0.1], [0, 0.01, 0.1], [0, 0.01, -0.1], [0.3, 0.01, 0.1], [0.3, 0.01, -0.1]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.015, 0.015, 0.005, 16]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function CircuitWires({ batteryConnected, resistorConnected, bulbLit }) {
  const currentFlowing = bulbLit
  
  return (
    <group>
      {/* Wire from battery to resistor */}
      {batteryConnected && (
        <group>
          <mesh position={[-0.15, 0.08, 0]}>
            <boxGeometry args={[0.2, 0.008, 0.008]} />
            <meshStandardMaterial 
              color={currentFlowing ? "#00ff00" : "#ff0000"} 
              emissive={currentFlowing ? "#00ff00" : "#000000"}
              emissiveIntensity={currentFlowing ? 0.5 : 0}
            />
          </mesh>
          {currentFlowing && (
            <CurrentParticle start={[-0.25, 0.08, 0]} end={[-0.05, 0.08, 0]} active={currentFlowing} />
          )}
        </group>
      )}
      
      {/* Wire from resistor to bulb */}
      {resistorConnected && (
        <group>
          <mesh position={[0.15, 0.08, 0]}>
            <boxGeometry args={[0.2, 0.008, 0.008]} />
            <meshStandardMaterial 
              color={currentFlowing ? "#00ff00" : "#0000ff"} 
              emissive={currentFlowing ? "#00ff00" : "#000000"}
              emissiveIntensity={currentFlowing ? 0.5 : 0}
            />
          </mesh>
          {currentFlowing && (
            <CurrentParticle start={[0.05, 0.08, 0]} end={[0.25, 0.08, 0]} active={currentFlowing} />
          )}
        </group>
      )}
      
      {/* Return wire (when circuit complete) */}
      {bulbLit && (
        <group>
          <mesh position={[0, 0.02, 0.15]}>
            <boxGeometry args={[0.7, 0.008, 0.008]} />
            <meshStandardMaterial 
              color="#00ff00" 
              emissive="#00ff00"
              emissiveIntensity={0.5}
            />
          </mesh>
          <CurrentParticle start={[0.35, 0.02, 0.15]} end={[-0.35, 0.02, 0.15]} active={true} />
        </group>
      )}
    </group>
  )
}
