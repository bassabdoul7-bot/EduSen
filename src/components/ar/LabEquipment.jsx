import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Cylinder, Box, Sphere } from "@react-three/drei"
import * as THREE from "three"

// ============ REALISTIC GLASS MATERIAL ============
const glassMaterial = {
  color: "#ffffff",
  transparent: true,
  opacity: 0.15,
  roughness: 0.05,
  metalness: 0.1,
  transmission: 0.98,
  thickness: 0.5,
  envMapIntensity: 1,
}

// ============ CHEMISTRY EQUIPMENT ============

export function Beaker({ position, color = "#88ccff", fillLevel = 0, size = "medium" }) {
  const scale = size === "small" ? 0.7 : size === "large" ? 1.3 : 1
  const radius = 0.08 * scale
  const height = 0.18 * scale
  
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[radius, radius * 0.85, height, 32, 1, true]} />
        <meshPhysicalMaterial {...glassMaterial} side={THREE.DoubleSide} />
      </mesh>
      
      <mesh position={[0, -height/2 + 0.002, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <circleGeometry args={[radius * 0.85, 32]} />
        <meshPhysicalMaterial {...glassMaterial} />
      </mesh>
      
      <mesh position={[0, height/2 - 0.003, 0]}>
        <torusGeometry args={[radius, 0.004, 8, 32]} />
        <meshPhysicalMaterial color="#e0e0e0" transparent opacity={0.4} />
      </mesh>
      
      <mesh position={[radius * 0.9, height/2 - 0.01, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.02, 0.015, 0.025]} />
        <meshPhysicalMaterial {...glassMaterial} />
      </mesh>
      
      {[0.25, 0.5, 0.75].map((h, i) => (
        <mesh key={i} position={[radius + 0.001, -height/2 + height * h, 0]}>
          <boxGeometry args={[0.002, 0.001, 0.015]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      ))}
      
      {fillLevel > 0 && (
        <mesh position={[0, -height/2 + (fillLevel * height)/2 + 0.005, 0]}>
          <cylinderGeometry args={[radius * 0.78, radius * 0.72, fillLevel * height, 32]} />
          <meshStandardMaterial color={color} transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  )
}

export function ErlenMeyerFlask({ position, color = "#88ccff", fillLevel = 0 }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.025, 0.08, 0.12, 32]} />
        <meshPhysicalMaterial {...glassMaterial} side={THREE.DoubleSide} />
      </mesh>
      
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 0.04, 16]} />
        <meshPhysicalMaterial {...glassMaterial} side={THREE.DoubleSide} />
      </mesh>
      
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[0.02, 0.003, 8, 16]} />
        <meshPhysicalMaterial color="#e0e0e0" transparent opacity={0.5} />
      </mesh>
      
      {fillLevel > 0 && (
        <mesh position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.03, 0.07, fillLevel * 0.1, 32]} />
          <meshStandardMaterial color={color} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  )
}

export function TestTube({ position, color = "#88ccff", fillLevel = 0, angle = 0 }) {
  return (
    <group position={position} rotation={[0, 0, angle]}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.1, 16, 1, true]} />
        <meshPhysicalMaterial {...glassMaterial} side={THREE.DoubleSide} />
      </mesh>
      
      <mesh position={[0, -0.01, 0]}>
        <sphereGeometry args={[0.012, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial {...glassMaterial} />
      </mesh>
      
      <mesh position={[0, 0.09, 0]}>
        <torusGeometry args={[0.013, 0.002, 8, 16]} />
        <meshPhysicalMaterial color="#e0e0e0" transparent opacity={0.5} />
      </mesh>
      
      {fillLevel > 0 && (
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.01, 0.01, fillLevel * 0.06, 16]} />
          <meshStandardMaterial color={color} transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  )
}

export function TestTubeRack({ position, tubes = 6 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.015, 0.06]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>
      
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.2, 0.01, 0.04]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>
      
      {[-0.09, 0.09].map((x, i) => (
        <mesh key={i} position={[x, 0.04, 0]}>
          <boxGeometry args={[0.01, 0.08, 0.04]} />
          <meshStandardMaterial color="#4a3728" roughness={0.9} />
        </mesh>
      ))}
      
      {Array.from({length: tubes}).map((_, i) => {
        const x = -0.075 + i * (0.15 / (tubes - 1))
        return (
          <mesh key={i} position={[x, 0.086, 0]}>
            <cylinderGeometry args={[0.013, 0.013, 0.01, 16]} />
            <meshStandardMaterial color="#2a1f18" />
          </mesh>
        )
      })}
    </group>
  )
}

export function ChemicalBottle({ position, label = "HCl", color = "#ff6b6b", size = "medium" }) {
  const scale = size === "small" ? 0.7 : size === "large" ? 1.3 : 1
  
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.04, 0.035, 0.1, 16]} />
        <meshPhysicalMaterial 
          color={color} 
          transparent 
          opacity={0.75}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      
      <mesh position={[0, 0.105, 0]}>
        <cylinderGeometry args={[0.025, 0.04, 0.02, 16]} />
        <meshPhysicalMaterial color={color} transparent opacity={0.7} />
      </mesh>
      
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 0.03, 16]} />
        <meshPhysicalMaterial color={color} transparent opacity={0.7} />
      </mesh>
      
      <mesh position={[0, 0.155, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.02, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      
      <mesh position={[0, 0.05, 0.041]}>
        <planeGeometry args={[0.06, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      <mesh position={[0, 0.03, 0.042]}>
        <planeGeometry args={[0.055, 0.008]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
    </group>
  )
}

export function Dropper({ position, color = "#ff6b6b", dropping = false }) {
  const dropRef = useRef()
  
  useFrame((state) => {
    if (dropping && dropRef.current) {
      dropRef.current.position.y = -0.02 - Math.sin(state.clock.elapsedTime * 8) * 0.01
    }
  })
  
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.9} />
      </mesh>
      
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.006, 0.004, 0.06, 12]} />
        <meshPhysicalMaterial {...glassMaterial} />
      </mesh>
      
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.004, 0.003, 0.04, 12]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>
      
      {dropping && (
        <mesh ref={dropRef} position={[0, -0.02, 0]}>
          <sphereGeometry args={[0.004, 8, 8]} />
          <meshStandardMaterial color={color} transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  )
}

export function BunsenBurner({ position, lit = false }) {
  const flameRef = useRef()
  
  useFrame((state) => {
    if (lit && flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 15) * 0.15
      flameRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 12) * 0.1
    }
  })
  
  return (
    <group position={position}>
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.065, 0.07, 0.03, 32]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.85} roughness={0.15} />
      </mesh>
      
      <mesh position={[0.05, 0.02, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.03, 8]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
      
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.022, 0.025, 0.14, 16]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.75} roughness={0.25} />
      </mesh>
      
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.025, 16]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </mesh>
      
      <mesh position={[0, 0.175, 0]}>
        <cylinderGeometry args={[0.03, 0.022, 0.02, 16]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.85} roughness={0.15} />
      </mesh>
      
      {lit && (
        <group ref={flameRef} position={[0, 0.22, 0]}>
          <mesh position={[0, 0.04, 0]}>
            <coneGeometry args={[0.025, 0.1, 16]} />
            <meshStandardMaterial 
              color="#ff6600" 
              emissive="#ff4400" 
              emissiveIntensity={1.5}
              transparent 
              opacity={0.7} 
            />
          </mesh>
          
          <mesh position={[0, 0.02, 0]}>
            <coneGeometry args={[0.015, 0.06, 16]} />
            <meshStandardMaterial 
              color="#3b82f6" 
              emissive="#1d4ed8" 
              emissiveIntensity={2}
              transparent 
              opacity={0.8} 
            />
          </mesh>
          
          <mesh position={[0, 0.01, 0]}>
            <coneGeometry args={[0.008, 0.03, 12]} />
            <meshStandardMaterial 
              color="#00ffff" 
              emissive="#00ffff" 
              emissiveIntensity={3}
              transparent 
              opacity={0.9} 
            />
          </mesh>
          
          <pointLight color="#ff6600" intensity={2.5} distance={1.2} />
        </group>
      )}
    </group>
  )
}

export function LabTable({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.025, 0]}>
        <boxGeometry args={[1.2, 0.05, 0.7]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.1} />
      </mesh>
      
      {[[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.25, z]}>
          <boxGeometry args={[0.04, 0.5, 0.04]} />
          <meshStandardMaterial color="#666" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[1.0, 0.02, 0.5]} />
        <meshStandardMaterial color="#444" metalness={0.6} />
      </mesh>
    </group>
  )
}

// ============ PHYSICS EQUIPMENT ============

export function Battery({ position, voltage = "9V", connected = false }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.05, 0.095, 0.027]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.6} />
      </mesh>
      
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.052, 0.01, 0.029]} />
        <meshStandardMaterial color="#333" metalness={0.7} />
      </mesh>
      
      <mesh position={[0.012, 0.058, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.015, 8]} />
        <meshStandardMaterial color="#dc2626" metalness={0.9} />
      </mesh>
      
      <mesh position={[-0.012, 0.058, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.012, 6]} />
        <meshStandardMaterial color="#333" metalness={0.9} />
      </mesh>
      
      <mesh position={[0, 0, 0.014]}>
        <planeGeometry args={[0.04, 0.07]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      
      {connected && (
        <pointLight position={[0, 0.06, 0]} color="#22c55e" intensity={0.3} distance={0.2} />
      )}
    </group>
  )
}

export function Resistor({ position, resistance = "100", connected = false }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.07, 12]} />
        <meshStandardMaterial color="#e8d4b8" roughness={0.9} />
      </mesh>
      
      {[-0.02, -0.008, 0.004, 0.02].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.019, 0.019, 0.006, 12]} />
          <meshStandardMaterial color={i === 0 ? "#8B4513" : i === 1 ? "#000" : i === 2 ? "#8B4513" : "#ffd700"} />
        </mesh>
      ))}
      
      {[-0.05, 0.05].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.002, 0.002, 0.03, 6]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

export function Bulb({ position, lit = false, wattage = "small" }) {
  const glowRef = useRef()
  
  useFrame((state) => {
    if (lit && glowRef.current) {
      glowRef.current.material.emissiveIntensity = 1.5 + Math.sin(state.clock.elapsedTime * 10) * 0.2
    }
  })
  
  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.032, 24, 24]} />
        <meshPhysicalMaterial 
          color={lit ? "#fffdf0" : "#f5f5f5"}
          emissive={lit ? "#ffcc00" : "#000000"}
          emissiveIntensity={lit ? 1.5 : 0}
          transparent
          opacity={lit ? 0.9 : 0.3}
          roughness={0.1}
        />
      </mesh>
      
      <mesh>
        <torusGeometry args={[0.012, 0.001, 6, 12]} />
        <meshStandardMaterial 
          color={lit ? "#ff9900" : "#666"}
          emissive={lit ? "#ff6600" : "#000"}
          emissiveIntensity={lit ? 3 : 0}
        />
      </mesh>
      <mesh rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.012, 0.001, 6, 12]} />
        <meshStandardMaterial 
          color={lit ? "#ff9900" : "#666"}
          emissive={lit ? "#ff6600" : "#000"}
          emissiveIntensity={lit ? 3 : 0}
        />
      </mesh>
      
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.018, 0.022, 0.025, 16]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.85} roughness={0.2} />
      </mesh>
      
      <mesh position={[0, -0.055, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.01, 8]} />
        <meshStandardMaterial color="#333" metalness={0.9} />
      </mesh>
      
      {lit && <pointLight color="#ffdd88" intensity={2} distance={0.8} />}
    </group>
  )
}

export function CircuitBoard({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.9, 0.015, 0.45]} />
        <meshStandardMaterial color="#0d6b38" roughness={0.7} />
      </mesh>
      
      {[[-0.3, 0], [0, 0], [0.3, 0]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.008, z]}>
          <boxGeometry args={[0.15, 0.002, 0.01]} />
          <meshStandardMaterial color="#cd7f32" metalness={0.9} />
        </mesh>
      ))}
      
      {[[-0.4, -0.2], [0.4, -0.2], [-0.4, 0.2], [0.4, 0.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.008, z]}>
          <cylinderGeometry args={[0.015, 0.015, 0.005, 16]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function PendulumSupport({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.12, 0.13, 0.03, 32]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </mesh>
      
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.5, 16]} />
        <meshStandardMaterial color="#555" metalness={0.85} roughness={0.15} />
      </mesh>
      
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[0.04, 0.03, 0.03]} />
        <meshStandardMaterial color="#444" metalness={0.8} />
      </mesh>
      
      <mesh position={[0.1, 0.52, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.18, 12]} />
        <meshStandardMaterial color="#555" metalness={0.85} />
      </mesh>
      
      <mesh position={[0.18, 0.5, 0]}>
        <torusGeometry args={[0.01, 0.003, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#666" metalness={0.9} />
      </mesh>
    </group>
  )
}

export function PendulumMass({ position, swinging = false }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.035, 24, 24]} />
        <meshStandardMaterial 
          color="#444" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      
      <mesh position={[0, 0.04, 0]}>
        <torusGeometry args={[0.008, 0.002, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#666" metalness={0.9} />
      </mesh>
    </group>
  )
}

export function PendulumString({ start, end }) {
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) +
    Math.pow(end[1] - start[1], 2) +
    Math.pow(end[2] - start[2], 2)
  )
  
  const angle = Math.atan2(end[0] - start[0], start[1] - end[1])
  
  return (
    <mesh 
      position={[(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2]}
      rotation={[0, 0, angle]}
    >
      <cylinderGeometry args={[0.001, 0.001, length, 6]} />
      <meshStandardMaterial color="#8B4513" roughness={1} />
    </mesh>
  )
}

// ============ BIOLOGY EQUIPMENT ============

export function Microscope({ position, powered = false }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.18, 0.04, 0.14]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} />
      </mesh>
      
      <mesh position={[-0.06, 0.15, 0]}>
        <boxGeometry args={[0.04, 0.25, 0.04]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} />
      </mesh>
      
      <mesh position={[0.02, 0.1, 0]}>
        <boxGeometry args={[0.1, 0.01, 0.1]} />
        <meshStandardMaterial color="#333" metalness={0.7} />
      </mesh>
      
      {[-0.03, 0.03].map((z, i) => (
        <mesh key={i} position={[0.05, 0.11, z]}>
          <boxGeometry args={[0.02, 0.005, 0.01]} />
          <meshStandardMaterial color="#666" metalness={0.9} />
        </mesh>
      ))}
      
      <mesh position={[0.02, 0.16, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.02, 16]} />
        <meshStandardMaterial color="#333" metalness={0.7} />
      </mesh>
      
      {[[0, 0.04, 0], [0.02, 0.04, 0.02], [-0.02, 0.04, 0.02]].map(([x, y, z], i) => (
        <mesh key={i} position={[0.02 + x, 0.12, z]}>
          <cylinderGeometry args={[0.008, 0.006, 0.04, 12]} />
          <meshStandardMaterial color={i === 0 ? "#ffd700" : i === 1 ? "#22c55e" : "#3b82f6"} metalness={0.8} />
        </mesh>
      ))}
      
      <mesh position={[-0.02, 0.32, 0]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} />
      </mesh>
      
      <mesh position={[-0.04, 0.38, -0.03]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.02, 0.04, 16]} />
        <meshStandardMaterial color="#333" metalness={0.7} />
      </mesh>
      
      <mesh position={[0.02, 0.05, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 16]} />
        <meshStandardMaterial 
          color={powered ? "#fffde7" : "#333"} 
          emissive={powered ? "#fff" : "#000"}
          emissiveIntensity={powered ? 0.5 : 0}
        />
      </mesh>
      
      {powered && <pointLight position={[0.02, 0.08, 0]} color="#fffde7" intensity={0.5} distance={0.3} />}
    </group>
  )
}

export function PetriDish({ position, contents = null, color = "#f5f5f5" }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.045, 0.045, 0.01, 32]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
      
      <mesh position={[0, 0.003, 0]}>
        <cylinderGeometry args={[0.042, 0.042, 0.006, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.048, 0.048, 0.008, 32]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

// ============ GENERAL LAB EQUIPMENT ============

export function LabSink({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.4, 0.15, 0.3]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} />
      </mesh>
      
      <mesh position={[0, 0.12, -0.1]}>
        <cylinderGeometry args={[0.015, 0.015, 0.15, 12]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.05} />
      </mesh>
      
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI/3, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.1, 12]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.95} />
      </mesh>
      
      {[-0.08, 0.08].map((x, i) => (
        <mesh key={i} position={[x, 0.1, -0.12]}>
          <cylinderGeometry args={[0.015, 0.015, 0.03, 8]} />
          <meshStandardMaterial color={i === 0 ? "#3b82f6" : "#ef4444"} />
        </mesh>
      ))}
    </group>
  )
}

export function SafetyShower({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2.4, 12]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
      </mesh>
      
      <mesh position={[0.15, 2.3, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.08, 0.06, 0.05, 16]} />
        <meshStandardMaterial color="#888" metalness={0.8} />
      </mesh>
      
      <mesh position={[0.15, 1.8, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.6, 6]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      
      <mesh position={[0.15, 1.5, 0]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
    </group>
  )
}

export function FireExtinguisher({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.35, 16]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} />
      </mesh>
      
      <mesh position={[0, 0.39, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.03, 16]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.08, 0.02, 0.03]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      <mesh position={[0.05, 0.38, 0]} rotation={[0, 0, -Math.PI/4]}>
        <cylinderGeometry args={[0.01, 0.015, 0.08, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      <mesh position={[0, 0.3, 0.061]}>
        <circleGeometry args={[0.02, 16]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
    </group>
  )
}
