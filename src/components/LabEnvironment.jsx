import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"

// Lab Room - Walls, Floor, Ceiling
export function LabRoom() {
  return (
    <group>
      {/* Floor - Tiled look */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.3} />
      </mesh>
      {/* Floor grid lines for tile effect */}
      {[-3, -2, -1, 0, 1, 2, 3].map(i => (
        <group key={i}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[i, -0.49, 0]}>
            <planeGeometry args={[0.02, 8]} />
            <meshBasicMaterial color="#ccc" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, i]}>
            <planeGeometry args={[8, 0.02]} />
            <meshBasicMaterial color="#ccc" />
          </mesh>
        </group>
      ))}

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 1.25, -3.5]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#f0f4f0" />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-4, 1.25, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#e8ece8" />
      </mesh>

      {/* Right Wall */}
      <mesh position={[4, 1.25, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#e8ece8" />
      </mesh>

      {/* Ceiling Lights */}
      <CeilingLight position={[-1.5, 2.9, -1]} />
      <CeilingLight position={[1.5, 2.9, -1]} />
      <CeilingLight position={[0, 2.9, 1]} />
    </group>
  )
}

function CeilingLight({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.8, 0.05, 0.3]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
      </mesh>
      <pointLight color="#fffaf0" intensity={0.8} distance={5} position={[0, -0.1, 0]} />
    </group>
  )
}

// Window with view
export function LabWindow({ position }) {
  return (
    <group position={position}>
      {/* Window frame */}
      <mesh>
        <boxGeometry args={[1.4, 1.2, 0.1]} />
        <meshStandardMaterial color="#5c4033" />
      </mesh>
      {/* Glass */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.2, 1]} />
        <meshPhysicalMaterial color="#87ceeb" transparent opacity={0.3} roughness={0} />
      </mesh>
      {/* Window cross */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.05, 1, 0.02]} />
        <meshStandardMaterial color="#5c4033" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[1.2, 0.05, 0.02]} />
        <meshStandardMaterial color="#5c4033" />
      </mesh>
      {/* Outside light */}
      <pointLight position={[0, 0, 0.5]} color="#fffacd" intensity={0.3} distance={3} />
    </group>
  )
}

// Lab coat hanging on hook
export function LabCoat({ position, color = "#fff" }) {
  return (
    <group position={position}>
      {/* Hook */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
        <meshStandardMaterial color="#666" metalness={0.8} />
      </mesh>
      {/* Hanger */}
      <mesh position={[0, 0.08, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.25, 0.02, 0.02]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Coat body */}
      <mesh position={[0, -0.15, 0.02]}>
        <boxGeometry args={[0.3, 0.5, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Left sleeve */}
      <mesh position={[-0.18, -0.05, 0.02]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.1, 0.35, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Right sleeve */}
      <mesh position={[0.18, -0.05, 0.02]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.1, 0.35, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Collar */}
      <mesh position={[0, 0.05, 0.05]}>
        <boxGeometry args={[0.15, 0.08, 0.03]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  )
}

// Wall shelf with equipment
export function WallShelf({ position, items = [] }) {
  return (
    <group position={position}>
      {/* Shelf board */}
      <mesh>
        <boxGeometry args={[1, 0.03, 0.25]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
      {/* Brackets */}
      <mesh position={[-0.4, -0.08, 0.1]}>
        <boxGeometry args={[0.03, 0.15, 0.03]} />
        <meshStandardMaterial color="#444" metalness={0.7} />
      </mesh>
      <mesh position={[0.4, -0.08, 0.1]}>
        <boxGeometry args={[0.03, 0.15, 0.03]} />
        <meshStandardMaterial color="#444" metalness={0.7} />
      </mesh>
      {/* Items on shelf */}
      {items.map((item, i) => (
        <group key={i} position={[-0.35 + i * 0.25, 0.06, 0]}>
          {item}
        </group>
      ))}
    </group>
  )
}

// Beaker for shelf
export function ShelfBeaker({ color = "#aaddff", filled = 0.5 }) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.04, 0.035, 0.1, 16, 1, true]} />
        <meshPhysicalMaterial color="#fff" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      {filled > 0 && (
        <mesh position={[0, -0.05 + filled * 0.05, 0]}>
          <cylinderGeometry args={[0.035, 0.03, 0.08 * filled, 16]} />
          <meshStandardMaterial color={color} transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  )
}

// Flask for shelf
export function ShelfFlask({ color = "#90EE90" }) {
  return (
    <group>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.04, 12]} />
        <meshPhysicalMaterial color="#fff" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshPhysicalMaterial color="#fff" transparent opacity={0.25} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

// Test tube rack
export function TestTubeRack({ position }) {
  const colors = ["#ff6b6b", "#4dabf7", "#51cf66", "#ffd43b", "#cc5de8"]
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.03, 0.06]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {colors.map((c, i) => (
        <group key={i} position={[-0.08 + i * 0.04, 0.05, 0]}>
          <mesh>
            <cylinderGeometry args={[0.008, 0.008, 0.1, 12]} />
            <meshPhysicalMaterial color="#fff" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.007, 0.007, 0.05, 12]} />
            <meshStandardMaterial color={c} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Storage cabinet
export function StorageCabinet({ position }) {
  return (
    <group position={position}>
      {/* Cabinet body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 1, 0.4]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>
      {/* Doors */}
      <mesh position={[-0.18, 0.5, 0.19]}>
        <boxGeometry args={[0.35, 0.9, 0.03]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      <mesh position={[0.18, 0.5, 0.19]}>
        <boxGeometry args={[0.35, 0.9, 0.03]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      {/* Handles */}
      <mesh position={[-0.03, 0.5, 0.21]}>
        <boxGeometry args={[0.02, 0.1, 0.02]} />
        <meshStandardMaterial color="#666" metalness={0.8} />
      </mesh>
      <mesh position={[0.03, 0.5, 0.21]}>
        <boxGeometry args={[0.02, 0.1, 0.02]} />
        <meshStandardMaterial color="#666" metalness={0.8} />
      </mesh>
      {/* Label */}
      <Html position={[0, 0.85, 0.21]} center>
        <div className="bg-yellow-400 text-black px-2 py-0.5 rounded text-xs font-bold">
          ⚠️ PRODUITS CHIMIQUES
        </div>
      </Html>
    </group>
  )
}

// Sink
export function LabSink({ position }) {
  return (
    <group position={position}>
      {/* Counter */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.05, 0.5]} />
        <meshStandardMaterial color="#333" roughness={0.2} />
      </mesh>
      {/* Basin */}
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[0.4, 0.15, 0.35]} />
        <meshStandardMaterial color="#ddd" roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.35, 0.1, 0.3]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      {/* Faucet */}
      <mesh position={[0, 0.08, -0.15]}>
        <cylinderGeometry args={[0.015, 0.015, 0.15, 12]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.12, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.15, 12]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
      </mesh>
      {/* Handles */}
      <mesh position={[-0.1, 0.05, -0.15]}>
        <cylinderGeometry args={[0.02, 0.02, 0.03, 12]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0.1, 0.05, -0.15]}>
        <cylinderGeometry args={[0.02, 0.02, 0.03, 12]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    </group>
  )
}

// Wall poster/chart
export function WallPoster({ position, type = "periodic" }) {
  const content = {
    periodic: { title: "TABLEAU PERIODIQUE", color: "#1e40af", icon: "⚛️" },
    safety: { title: "SECURITE AU LABO", color: "#dc2626", icon: "⚠️" },
    formula: { title: "FORMULES", color: "#059669", icon: "📐" },
    biology: { title: "LA CELLULE", color: "#7c3aed", icon: "🧬" }
  }
  const c = content[type] || content.periodic
  
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[0.8, 0.6]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[0.75, 0.55]} />
        <meshStandardMaterial color={c.color} />
      </mesh>
      <Html position={[0, 0.15, 0.01]} center>
        <div className="text-white text-center">
          <div className="text-2xl mb-1">{c.icon}</div>
          <div className="text-xs font-bold">{c.title}</div>
        </div>
      </Html>
    </group>
  )
}

// Emergency shower
export function EmergencyShower({ position }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 2, 12]} />
        <meshStandardMaterial color="#ffcc00" />
      </mesh>
      {/* Shower head */}
      <mesh position={[0, 1.9, 0.15]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.05, 16]} />
        <meshStandardMaterial color="#ffcc00" />
      </mesh>
      {/* Pull handle */}
      <mesh position={[0, 1.2, 0.1]}>
        <boxGeometry args={[0.15, 0.03, 0.03]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Sign */}
      <Html position={[0, 1.5, 0.05]} center>
        <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
          🚿 DOUCHE
        </div>
      </Html>
    </group>
  )
}

// Fire extinguisher
export function FireExtinguisher({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.05, 12]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.05, 0.42, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  )
}

// Eyewash station
export function EyewashStation({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.2]} />
        <meshStandardMaterial color="#059669" />
      </mesh>
      <mesh position={[-0.08, 0.05, 0.05]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>
      <mesh position={[0.08, 0.05, 0.05]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>
      <Html position={[0, 0.12, 0.11]} center>
        <div className="bg-green-700 text-white px-1 py-0.5 rounded text-xs font-bold">
          👁️ RINCE-OEIL
        </div>
      </Html>
    </group>
  )
}

// Lab stool
export function LabStool({ position }) {
  return (
    <group position={position}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.4, 12]} />
        <meshStandardMaterial color="#666" metalness={0.8} />
      </mesh>
      {/* Base */}
      {[0, 1, 2, 3, 4].map(i => (
        <mesh key={i} position={[Math.cos(i * 1.26) * 0.12, 0.03, Math.sin(i * 1.26) * 0.12]} rotation={[0, i * 1.26, 0]}>
          <boxGeometry args={[0.15, 0.02, 0.03]} />
          <meshStandardMaterial color="#666" metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// Main lab bench (the work table)
export function MainLabBench({ position, children }) {
  return (
    <group position={position}>
      {/* Tabletop */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 0.05, 1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      {/* Legs */}
      {[[-0.65, -0.4], [0.65, -0.4], [-0.65, 0.4], [0.65, 0.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.25, z]}>
          <boxGeometry args={[0.05, 0.5, 0.05]} />
          <meshStandardMaterial color="#444" metalness={0.6} />
        </mesh>
      ))}
      {/* Shelf underneath */}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[1.3, 0.02, 0.8]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      {/* Experiment content */}
      {children}
    </group>
  )
}

// Side lab bench
export function SideLabBench({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.05, 0.6]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} />
      </mesh>
      {[[-0.9, -0.25], [0.9, -0.25]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.25, z]}>
          <boxGeometry args={[0.05, 0.5, 0.05]} />
          <meshStandardMaterial color="#444" metalness={0.6} />
        </mesh>
      ))}
      {/* Drawers */}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <group key={i} position={[x, -0.15, 0.28]}>
          <mesh>
            <boxGeometry args={[0.35, 0.18, 0.02]} />
            <meshStandardMaterial color="#3a3a3a" />
          </mesh>
          <mesh position={[0, 0, 0.015]}>
            <boxGeometry args={[0.08, 0.02, 0.02]} />
            <meshStandardMaterial color="#666" metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Whiteboard
export function Whiteboard({ position }) {
  return (
    <group position={position}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[2, 1.2, 0.05]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      {/* Board */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.9, 1.1]} />
        <meshStandardMaterial color="#fff" roughness={0.1} />
      </mesh>
      {/* Marker tray */}
      <mesh position={[0, -0.65, 0.08]}>
        <boxGeometry args={[0.8, 0.05, 0.08]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      {/* Markers */}
      {[["#dc2626", -0.2], ["#2563eb", 0], ["#16a34a", 0.2]].map(([c, x], i) => (
        <mesh key={i} position={[x, -0.62, 0.1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}
    </group>
  )
}

// Complete lab environment
export function FullLabEnvironment({ children }) {
  return (
    <group>
      <LabRoom />
      
      {/* Windows on left wall */}
      <LabWindow position={[-3.95, 1.5, -1]} />
      <LabWindow position={[-3.95, 1.5, 1]} />
      
      {/* Lab coats near door */}
      <group position={[3.5, 1.8, -2]}>
        <LabCoat position={[-0.4, 0, 0]} />
        <LabCoat position={[0, 0, 0]} />
        <LabCoat position={[0.4, 0, 0]} color="#e8f0ff" />
      </group>
      
      {/* Wall shelves with equipment */}
      <WallShelf 
        position={[-3.9, 1.8, 0]} 
        items={[
          <ShelfBeaker color="#ff6b6b" filled={0.7} />,
          <ShelfFlask color="#4dabf7" />,
          <ShelfBeaker color="#51cf66" filled={0.4} />,
          <ShelfFlask color="#ffd43b" />
        ]} 
      />
      <WallShelf 
        position={[-3.9, 1.3, 0]} 
        items={[
          <ShelfFlask color="#cc5de8" />,
          <ShelfBeaker color="#20c997" filled={0.6} />,
          <ShelfFlask color="#ff922b" />,
          <ShelfBeaker color="#845ef7" filled={0.3} />
        ]} 
      />
      
      {/* Wall posters */}
      <WallPoster position={[0, 1.8, -3.45]} type="periodic" />
      <WallPoster position={[-1.5, 1.8, -3.45]} type="safety" />
      <WallPoster position={[1.5, 1.8, -3.45]} type="formula" />
      <WallPoster position={[3.9, 1.8, 0]} type="biology" />
      
      {/* Whiteboard */}
      <Whiteboard position={[0, 1.5, -3.4]} />
      
      {/* Storage cabinets */}
      <StorageCabinet position={[3, -0.5, -3]} />
      <StorageCabinet position={[2, -0.5, -3]} />
      
      {/* Side lab benches */}
      <SideLabBench position={[-2.5, 0.5, -2.5]} />
      <SideLabBench position={[2.5, 0.5, -2.5]} />
      
      {/* Sink area */}
      <group position={[-3.5, 0.5, 2]}>
        <LabSink position={[0, 0, 0]} />
        <EyewashStation position={[0.5, 0.1, 0]} />
      </group>
      
      {/* Safety equipment */}
      <EmergencyShower position={[3.5, -0.5, 2]} />
      <FireExtinguisher position={[3.7, -0.5, 0]} />
      
      {/* Test tube rack on side bench */}
      <TestTubeRack position={[-2.5, 0.55, -2.5]} />
      <TestTubeRack position={[2.5, 0.55, -2.5]} />
      
      {/* Lab stools */}
      <LabStool position={[-0.8, -0.5, 0.8]} />
      <LabStool position={[0.8, -0.5, 0.8]} />
      <LabStool position={[0, -0.5, 1.2]} />
      
      {/* Main experiment area - children go here */}
      <MainLabBench position={[0, 0.5, 0]}>
        {children}
      </MainLabBench>
    </group>
  )
}

export default FullLabEnvironment
