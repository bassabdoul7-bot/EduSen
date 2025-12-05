import { Cylinder, Box, Sphere } from '@react-three/drei'

// CHEMISTRY COMPONENTS

export function Beaker({ position, color = '#88ccff', fillLevel = 0 }) {
  return (
    <group position={position}>
      <Cylinder args={[0.08, 0.08, 0.15, 32]} position={[0, 0.075, 0]}>
        <meshPhysicalMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.2} 
          roughness={0.1}
          transmission={0.95}
        />
      </Cylinder>
      
      {fillLevel > 0 && (
        <Cylinder args={[0.075, 0.075, fillLevel, 32]} position={[0, fillLevel / 2 + 0.005, 0]}>
          <meshStandardMaterial color={color} transparent opacity={0.9} />
        </Cylinder>
      )}
      
      <Cylinder args={[0.081, 0.081, 0.002, 32]} position={[0, 0.05, 0]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      <Cylinder args={[0.081, 0.081, 0.002, 32]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
    </group>
  )
}

export function ChemicalBottle({ position, label, color = '#ff6b6b' }) {
  return (
    <group position={position}>
      <Cylinder args={[0.04, 0.04, 0.12, 16]} position={[0, 0.06, 0]}>
        <meshStandardMaterial color={color} transparent opacity={0.7} />
      </Cylinder>
      
      <Cylinder args={[0.03, 0.03, 0.02, 16]} position={[0, 0.13, 0]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      
      <Box args={[0.07, 0.04, 0.001]} position={[0, 0.06, 0.041]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
    </group>
  )
}

export function Dropper({ position, dropping = false }) {
  return (
    <group position={position}>
      <Sphere args={[0.02, 16, 16]} position={[0, 0.08, 0]}>
        <meshStandardMaterial color="#ff6b6b" />
      </Sphere>
      
      <Cylinder args={[0.005, 0.005, 0.08, 8]} position={[0, 0.04, 0]}>
        <meshPhysicalMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.4}
          transmission={0.9}
        />
      </Cylinder>
      
      {dropping && (
        <Sphere args={[0.003, 8, 8]} position={[0, -0.02, 0]}>
          <meshStandardMaterial color="#88ccff" transparent opacity={0.8} />
        </Sphere>
      )}
    </group>
  )
}

export function BunsenBurner({ position, lit = false }) {
  return (
    <group position={position}>
      <Cylinder args={[0.06, 0.06, 0.02, 16]} position={[0, 0.01, 0]}>
        <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      <Cylinder args={[0.015, 0.015, 0.12, 16]} position={[0, 0.08, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
      </Cylinder>
      
      <Cylinder args={[0.025, 0.02, 0.03, 16]} position={[0, 0.155, 0]}>
        <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      {lit && (
        <>
          <Sphere args={[0.02, 16, 16]} position={[0, 0.19, 0]}>
            <meshStandardMaterial 
              color="#ff6600" 
              emissive="#ff6600"
              emissiveIntensity={2}
              transparent
              opacity={0.8}
            />
          </Sphere>
          <pointLight position={[0, 0.19, 0]} color="#ff6600" intensity={1} distance={0.5} />
        </>
      )}
    </group>
  )
}

export function LabTable({ position }) {
  return (
    <Box args={[1, 0.05, 0.6]} position={position}>
      <meshStandardMaterial color="#8B4513" roughness={0.8} />
    </Box>
  )
}

// PHYSICS COMPONENTS

export function Battery({ position, connected = false }) {
  return (
    <group position={position}>
      <Box args={[0.08, 0.12, 0.04]}>
        <meshStandardMaterial color="#1e40af" metalness={0.3} roughness={0.7} />
      </Box>
      
      <Cylinder args={[0.01, 0.01, 0.02, 16]} position={[0.025, 0.07, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#dc2626" />
      </Cylinder>
      
      <Cylinder args={[0.008, 0.008, 0.015, 16]} position={[-0.025, 0.065, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#1f2937" />
      </Cylinder>
      
      <Box args={[0.06, 0.03, 0.001]} position={[0, 0, 0.021]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
    </group>
  )
}

export function Resistor({ position, connected = false }) {
  return (
    <group position={position}>
      <Cylinder args={[0.015, 0.015, 0.08, 16]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#c2410c" roughness={0.8} />
      </Cylinder>
      
      <Cylinder args={[0.016, 0.016, 0.008, 16]} position={[-0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#78350f" />
      </Cylinder>
      <Cylinder args={[0.016, 0.016, 0.008, 16]} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#000000" />
      </Cylinder>
      <Cylinder args={[0.016, 0.016, 0.008, 16]} position={[0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#78350f" />
      </Cylinder>
      
      <Cylinder args={[0.003, 0.003, 0.03, 8]} position={[-0.055, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#d4d4d4" metalness={0.9} roughness={0.1} />
      </Cylinder>
      <Cylinder args={[0.003, 0.003, 0.03, 8]} position={[0.055, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#d4d4d4" metalness={0.9} roughness={0.1} />
      </Cylinder>
    </group>
  )
}

export function Bulb({ position, lit = false }) {
  return (
    <group position={position}>
      <Sphere args={[0.035, 16, 16]}>
        <meshPhysicalMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.3}
          transmission={0.9}
          roughness={0.1}
        />
      </Sphere>
      
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.015, 0.002, 8, 16]} />
        <meshStandardMaterial 
          color={lit ? "#ffff00" : "#666666"}
          emissive={lit ? "#ffff00" : "#000000"}
          emissiveIntensity={lit ? 2 : 0}
        />
      </mesh>
      
      <Cylinder args={[0.025, 0.02, 0.03, 16]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.3} />
      </Cylinder>
      
      {lit && (
        <pointLight position={[0, 0, 0]} color="#ffff00" intensity={1.5} distance={0.5} />
      )}
    </group>
  )
}

export function CircuitBoard({ position }) {
  return (
    <Box args={[0.8, 0.02, 0.4]} position={position}>
      <meshStandardMaterial color="#10b981" roughness={0.7} />
    </Box>
  )
}

export function PendulumSupport({ position }) {
  return (
    <group position={position}>
      <Cylinder args={[0.015, 0.015, 0.4, 16]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#71717a" metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      <Cylinder args={[0.1, 0.1, 0.02, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#3f3f46" metalness={0.7} roughness={0.3} />
      </Cylinder>
      
      <Box args={[0.3, 0.015, 0.015]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#71717a" metalness={0.8} roughness={0.2} />
      </Box>
    </group>
  )
}

export function PendulumMass({ position, swinging = false }) {
  return (
    <Sphere args={[0.04, 16, 16]} position={position}>
      <meshStandardMaterial color="#dc2626" metalness={0.3} roughness={0.7} />
    </Sphere>
  )
}

export function PendulumString({ start, end }) {
  const midY = (start[1] + end[1]) / 2
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + 
    Math.pow(end[1] - start[1], 2) + 
    Math.pow(end[2] - start[2], 2)
  )
  
  return (
    <Cylinder 
      args={[0.002, 0.002, length, 8]} 
      position={[
        (start[0] + end[0]) / 2,
        midY,
        (start[2] + end[2]) / 2
      ]}
      rotation={[
        0,
        0,
        Math.atan2(end[0] - start[0], end[1] - start[1])
      ]}
    >
      <meshStandardMaterial color="#1f2937" />
    </Cylinder>
  )
}