import { useState, useEffect, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html, Environment } from "@react-three/drei"
import { arLabService, calculatePH, getIndicatorColor, calculateCurrent, calculatePeriod } from "../services/arLab"
import toast from "react-hot-toast"
import { ArrowLeft, PlayCircle, Camera, X, List, ChevronDown, ChevronUp, Circle, CheckCircle, RotateCcw, MousePointer, Hand, GraduationCap, School } from "lucide-react"
import { useNavigate } from "react-router-dom"
import * as THREE from "three"

// ============ LAB ENVIRONMENT ============

function LabRoom() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#d4d4d4" roughness={0.3} />
      </mesh>
      
      {/* Floor tiles pattern */}
      {[-5,-4,-3,-2,-1,0,1,2,3,4,5].map(i => (
        <group key={`tile-${i}`}>
          <mesh rotation={[-Math.PI/2,0,0]} position={[i, -0.49, 0]}>
            <planeGeometry args={[0.03, 12]} />
            <meshBasicMaterial color="#bbb" />
          </mesh>
          <mesh rotation={[-Math.PI/2,0,0]} position={[0, -0.49, i]}>
            <planeGeometry args={[12, 0.03]} />
            <meshBasicMaterial color="#bbb" />
          </mesh>
        </group>
      ))}

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 1.75, -5]}>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color="#e8ece8" />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-6, 1.75, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color="#e0e4e0" />
      </mesh>

      {/* Right Wall */}
      <mesh position={[6, 1.75, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color="#e0e4e0" />
      </mesh>

      {/* Ceiling Lights */}
      <CeilingLight position={[-2, 3.9, -1]} />
      <CeilingLight position={[2, 3.9, -1]} />
      <CeilingLight position={[0, 3.9, 2]} />
    </group>
  )
}

function CeilingLight({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.2, 0.08, 0.4]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.8} />
      </mesh>
      <pointLight color="#fffef5" intensity={1.5} distance={8} position={[0, -0.2, 0]} castShadow />
    </group>
  )
}

function LabWindow({ position }) {
  return (
    <group position={position}>
      <mesh><boxGeometry args={[1.8, 1.5, 0.1]} /><meshStandardMaterial color="#5c4033" /></mesh>
      <mesh position={[0, 0, 0.03]}><planeGeometry args={[1.5, 1.2]} /><meshPhysicalMaterial color="#87ceeb" transparent opacity={0.4} roughness={0} /></mesh>
      <mesh position={[0, 0, 0.05]}><boxGeometry args={[0.05, 1.2, 0.02]} /><meshStandardMaterial color="#5c4033" /></mesh>
      <mesh position={[0, 0, 0.05]}><boxGeometry args={[1.5, 0.05, 0.02]} /><meshStandardMaterial color="#5c4033" /></mesh>
    </group>
  )
}

function LabCoat({ position, color = "#ffffff" }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.015, 0.015, 0.08, 8]} /><meshStandardMaterial color="#444" metalness={0.8} /></mesh>
      <mesh position={[0, 0.06, 0]}><boxGeometry args={[0.22, 0.015, 0.015]} /><meshStandardMaterial color="#222" /></mesh>
      <mesh position={[0, -0.18, 0.015]}><boxGeometry args={[0.28, 0.55, 0.06]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>
      <mesh position={[-0.17, -0.08, 0.015]} rotation={[0, 0, 0.25]}><boxGeometry args={[0.08, 0.32, 0.05]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>
      <mesh position={[0.17, -0.08, 0.015]} rotation={[0, 0, -0.25]}><boxGeometry args={[0.08, 0.32, 0.05]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>
    </group>
  )
}

function WallShelf({ position, children }) {
  return (
    <group position={position}>
      <mesh><boxGeometry args={[1.2, 0.04, 0.28]} /><meshStandardMaterial color="#8B4513" roughness={0.7} /></mesh>
      <mesh position={[-0.5, -0.1, 0.12]}><boxGeometry args={[0.03, 0.2, 0.03]} /><meshStandardMaterial color="#555" metalness={0.7} /></mesh>
      <mesh position={[0.5, -0.1, 0.12]}><boxGeometry args={[0.03, 0.2, 0.03]} /><meshStandardMaterial color="#555" metalness={0.7} /></mesh>
      {children}
    </group>
  )
}

function ShelfBeaker({ position, color = "#4dabf7", fill = 0.6 }) {
  return (
    <group position={position}>
      <mesh><cylinderGeometry args={[0.05, 0.04, 0.12, 16, 1, true]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.25} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, -0.03, 0]}><cylinderGeometry args={[0.04, 0.035, 0.1 * fill, 16]} /><meshStandardMaterial color={color} transparent opacity={0.7} /></mesh>
    </group>
  )
}

function ShelfFlask({ position, color = "#51cf66" }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]}><cylinderGeometry args={[0.018, 0.018, 0.05, 12]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.3} /></mesh>
      <mesh position={[0, -0.02, 0]}><sphereGeometry args={[0.045, 16, 16]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.25} /></mesh>
      <mesh position={[0, -0.02, 0]}><sphereGeometry args={[0.04, 16, 16]} /><meshStandardMaterial color={color} transparent opacity={0.6} /></mesh>
    </group>
  )
}

function TestTubeRack({ position }) {
  const colors = ["#ff6b6b", "#4dabf7", "#51cf66", "#ffd43b", "#cc5de8"]
  return (
    <group position={position}>
      <mesh><boxGeometry args={[0.22, 0.03, 0.06]} /><meshStandardMaterial color="#8B4513" /></mesh>
      {colors.map((c, i) => (
        <group key={i} position={[-0.08 + i * 0.04, 0.06, 0]}>
          <mesh><cylinderGeometry args={[0.01, 0.01, 0.12, 12]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.3} side={THREE.DoubleSide} /></mesh>
          <mesh position={[0, -0.025, 0]}><cylinderGeometry args={[0.008, 0.008, 0.06, 12]} /><meshStandardMaterial color={c} transparent opacity={0.8} /></mesh>
        </group>
      ))}
    </group>
  )
}

function StorageCabinet({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]}><boxGeometry args={[0.9, 1.2, 0.45]} /><meshStandardMaterial color="#d0d0d0" /></mesh>
      <mesh position={[-0.2, 0.6, 0.21]}><boxGeometry args={[0.4, 1.1, 0.03]} /><meshStandardMaterial color="#e5e5e5" /></mesh>
      <mesh position={[0.2, 0.6, 0.21]}><boxGeometry args={[0.4, 1.1, 0.03]} /><meshStandardMaterial color="#e5e5e5" /></mesh>
      <mesh position={[-0.03, 0.6, 0.23]}><boxGeometry args={[0.02, 0.12, 0.02]} /><meshStandardMaterial color="#666" metalness={0.8} /></mesh>
      <mesh position={[0.03, 0.6, 0.23]}><boxGeometry args={[0.02, 0.12, 0.02]} /><meshStandardMaterial color="#666" metalness={0.8} /></mesh>
      <Html position={[0, 1.05, 0.23]} center><div className="bg-yellow-500 text-black px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">⚠️ PRODUITS CHIMIQUES</div></Html>
    </group>
  )
}

function LabSink({ position }) {
  return (
    <group position={position}>
      <mesh><boxGeometry args={[0.7, 0.06, 0.55]} /><meshStandardMaterial color="#2a2a2a" roughness={0.2} /></mesh>
      <mesh position={[0, -0.1, 0]}><boxGeometry args={[0.5, 0.18, 0.4]} /><meshStandardMaterial color="#ddd" /></mesh>
      <mesh position={[0, -0.06, 0]}><boxGeometry args={[0.42, 0.12, 0.32]} /><meshStandardMaterial color="#f5f5f5" /></mesh>
      <mesh position={[0, 0.1, -0.2]}><cylinderGeometry args={[0.018, 0.018, 0.18, 12]} /><meshStandardMaterial color="#c0c0c0" metalness={0.9} /></mesh>
      <mesh position={[0, 0.15, -0.08]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.014, 0.014, 0.18, 12]} /><meshStandardMaterial color="#c0c0c0" metalness={0.9} /></mesh>
      <mesh position={[-0.12, 0.06, -0.2]}><cylinderGeometry args={[0.022, 0.022, 0.03, 12]} /><meshStandardMaterial color="#3b82f6" /></mesh>
      <mesh position={[0.12, 0.06, -0.2]}><cylinderGeometry args={[0.022, 0.022, 0.03, 12]} /><meshStandardMaterial color="#ef4444" /></mesh>
    </group>
  )
}

function WallPoster({ position, type = "periodic" }) {
  const content = {
    periodic: { title: "TABLEAU PERIODIQUE", color: "#1e40af", bg: "#dbeafe" },
    safety: { title: "⚠️ SECURITE LABO", color: "#dc2626", bg: "#fee2e2" },
    formula: { title: "📐 FORMULES", color: "#059669", bg: "#d1fae5" },
  }
  const c = content[type]
  return (
    <group position={position}>
      <mesh><boxGeometry args={[0.9, 0.7, 0.02]} /><meshStandardMaterial color="#fff" /></mesh>
      <mesh position={[0, 0, 0.011]}><planeGeometry args={[0.85, 0.65]} /><meshStandardMaterial color={c.bg} /></mesh>
      <Html position={[0, 0.2, 0.02]} center><div style={{color: c.color}} className="text-xs font-bold text-center">{c.title}</div></Html>
    </group>
  )
}

function EmergencyShower({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.035, 0.035, 2.4, 12]} /><meshStandardMaterial color="#fbbf24" /></mesh>
      <mesh position={[0, 2.3, 0.18]} rotation={[0.3, 0, 0]}><cylinderGeometry args={[0.12, 0.14, 0.06, 16]} /><meshStandardMaterial color="#fbbf24" /></mesh>
      <mesh position={[0, 1.4, 0.12]}><boxGeometry args={[0.18, 0.03, 0.03]} /><meshStandardMaterial color="#333" /></mesh>
      <Html position={[0, 1.7, 0.1]} center><div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">🚿 DOUCHE</div></Html>
    </group>
  )
}

function FireExtinguisher({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.07, 0.07, 0.5, 16]} /><meshStandardMaterial color="#dc2626" /></mesh>
      <mesh position={[0, 0.52, 0]}><cylinderGeometry args={[0.035, 0.045, 0.06, 12]} /><meshStandardMaterial color="#222" /></mesh>
      <mesh position={[0.06, 0.52, 0]} rotation={[0, 0, -0.5]}><cylinderGeometry args={[0.018, 0.018, 0.12, 8]} /><meshStandardMaterial color="#222" /></mesh>
    </group>
  )
}

function EyewashStation({ position }) {
  return (
    <group position={position}>
      <mesh><boxGeometry args={[0.35, 0.18, 0.22]} /><meshStandardMaterial color="#059669" /></mesh>
      <mesh position={[-0.08, 0.06, 0.06]}><sphereGeometry args={[0.035, 12, 12]} /><meshStandardMaterial color="#ddd" /></mesh>
      <mesh position={[0.08, 0.06, 0.06]}><sphereGeometry args={[0.035, 12, 12]} /><meshStandardMaterial color="#ddd" /></mesh>
      <Html position={[0, 0.14, 0.12]} center><div className="bg-green-700 text-white px-1 py-0.5 rounded text-xs font-bold">👁️ RINCE-OEIL</div></Html>
    </group>
  )
}

function LabStool({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]}><cylinderGeometry args={[0.17, 0.17, 0.06, 16]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.03, 0.03, 0.5, 12]} /><meshStandardMaterial color="#666" metalness={0.8} /></mesh>
      {[0, 1, 2, 3, 4].map(i => (
        <mesh key={i} position={[Math.cos(i * 1.26) * 0.14, 0.04, Math.sin(i * 1.26) * 0.14]} rotation={[0, i * 1.26, 0]}>
          <boxGeometry args={[0.18, 0.025, 0.035]} /><meshStandardMaterial color="#666" metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function SideLabBench({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh><boxGeometry args={[2.2, 0.06, 0.7]} /><meshStandardMaterial color="#2a2a2a" roughness={0.3} /></mesh>
      {[[-1, -0.28], [1, -0.28]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.28, z]}><boxGeometry args={[0.06, 0.55, 0.06]} /><meshStandardMaterial color="#444" metalness={0.6} /></mesh>
      ))}
      {[-0.7, -0.25, 0.2, 0.65].map((x, i) => (
        <group key={i} position={[x, -0.18, 0.32]}>
          <mesh><boxGeometry args={[0.4, 0.22, 0.025]} /><meshStandardMaterial color="#3a3a3a" /></mesh>
          <mesh position={[0, 0, 0.02]}><boxGeometry args={[0.1, 0.025, 0.02]} /><meshStandardMaterial color="#666" metalness={0.8} /></mesh>
        </group>
      ))}
    </group>
  )
}

function Whiteboard({ position }) {
  return (
    <group position={position}>
      <mesh><boxGeometry args={[2.5, 1.4, 0.06]} /><meshStandardMaterial color="#555" /></mesh>
      <mesh position={[0, 0, 0.032]}><planeGeometry args={[2.35, 1.25]} /><meshStandardMaterial color="#fff" roughness={0.1} /></mesh>
      <mesh position={[0, -0.78, 0.1]}><boxGeometry args={[1, 0.06, 0.1]} /><meshStandardMaterial color="#555" /></mesh>
      {[["#dc2626", -0.25], ["#2563eb", 0], ["#16a34a", 0.25]].map(([c, x], i) => (
        <mesh key={i} position={[x, -0.75, 0.12]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.018, 0.018, 0.14, 8]} /><meshStandardMaterial color={c} /></mesh>
      ))}
    </group>
  )
}

function MainLabBench({ children }) {
  return (
    <group position={[0, 0.45, 0]}>
      {/* Main tabletop - black lab surface */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.06, 1.1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      {/* Legs */}
      {[[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.45], [0.7, 0.45]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.28, z]}><boxGeometry args={[0.06, 0.55, 0.06]} /><meshStandardMaterial color="#444" metalness={0.6} /></mesh>
      ))}
      {/* Bottom shelf */}
      <mesh position={[0, -0.4, 0]}><boxGeometry args={[1.4, 0.025, 0.9]} /><meshStandardMaterial color="#555" /></mesh>
      {/* Tool shelf at back */}
      <mesh position={[0, 0.08, -0.45]}><boxGeometry args={[1.4, 0.03, 0.18]} /><meshStandardMaterial color="#333" /></mesh>
      {/* Experiment content */}
      <group position={[0, 0.05, 0.1]}>
        {children}
      </group>
    </group>
  )
}

function FullLabEnvironment({ children }) {
  return (
    <group>
      <LabRoom />
      
      {/* Windows */}
      <LabWindow position={[-5.95, 2, -1.5]} />
      <LabWindow position={[-5.95, 2, 1.5]} />
      
      {/* Lab coats */}
      <group position={[5.5, 2.2, -3]}>
        <LabCoat position={[-0.5, 0, 0]} />
        <LabCoat position={[0, 0, 0]} />
        <LabCoat position={[0.5, 0, 0]} color="#e0e8ff" />
      </group>
      
      {/* Wall shelves with equipment */}
      <WallShelf position={[-5.9, 2.2, 0.5]}>
        <ShelfBeaker position={[-0.4, 0.08, 0]} color="#ff6b6b" />
        <ShelfFlask position={[-0.15, 0.08, 0]} color="#4dabf7" />
        <ShelfBeaker position={[0.1, 0.08, 0]} color="#51cf66" />
        <ShelfFlask position={[0.35, 0.08, 0]} color="#ffd43b" />
      </WallShelf>
      <WallShelf position={[-5.9, 1.6, 0.5]}>
        <ShelfFlask position={[-0.4, 0.08, 0]} color="#cc5de8" />
        <ShelfBeaker position={[-0.15, 0.08, 0]} color="#20c997" />
        <ShelfFlask position={[0.1, 0.08, 0]} color="#ff922b" />
        <ShelfBeaker position={[0.35, 0.08, 0]} color="#845ef7" />
      </WallShelf>
      
      {/* Wall posters */}
      <WallPoster position={[-1.2, 2.2, -4.95]} type="periodic" />
      <WallPoster position={[0, 2.2, -4.95]} type="safety" />
      <WallPoster position={[1.2, 2.2, -4.95]} type="formula" />
      
      {/* Whiteboard */}
      <Whiteboard position={[0, 1.8, -4.9]} />
      
      {/* Storage cabinets */}
      <StorageCabinet position={[4, -0.5, -4]} />
      <StorageCabinet position={[2.8, -0.5, -4]} />
      
      {/* Side lab benches */}
      <SideLabBench position={[-3.5, 0.45, -3.5]} />
      <SideLabBench position={[3.5, 0.45, -3.5]} />
      
      {/* Sink area */}
      <group position={[-4.5, 0.45, 3]}>
        <LabSink position={[0, 0, 0]} />
        <EyewashStation position={[0.6, 0.12, 0]} />
      </group>
      
      {/* Safety equipment */}
      <EmergencyShower position={[5, -0.5, 3]} />
      <FireExtinguisher position={[5.5, -0.5, 1]} />
      
      {/* Test tube racks */}
      <TestTubeRack position={[-3.5, 0.5, -3.5]} />
      <TestTubeRack position={[3.5, 0.5, -3.5]} />
      
      {/* Lab stools */}
      <LabStool position={[-1, -0.5, 1.3]} />
      <LabStool position={[1, -0.5, 1.3]} />
      <LabStool position={[0, -0.5, 1.8]} />
      
      {/* Main work bench with experiment */}
      <MainLabBench>
        {children}
      </MainLabBench>
    </group>
  )
}

// ============ SHARED EXPERIMENT COMPONENTS ============

function TargetZone({ position, label, active, onClick }) {
  const ringRef = useRef()
  const [hovered, setHovered] = useState(false)
  useFrame((state) => { if (ringRef.current && active) ringRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.15) })
  if (!active) return null
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick?.() }} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.08, 0.12, 32]} /><meshBasicMaterial color={hovered ? "#16a34a" : "#22c55e"} transparent opacity={0.8} side={THREE.DoubleSide} /></mesh>
      <Html position={[0, 0.15, 0]} center><div className={`px-2 py-1 rounded text-xs font-bold shadow whitespace-nowrap ${hovered ? "bg-green-700" : "bg-green-600"} text-white animate-bounce`}>{label}</div></Html>
    </group>
  )
}

function ClickableObject({ children, position, selected, onClick, enabled }) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef()
  useFrame((state) => { if (groupRef.current && selected) groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 8) * 0.01 })
  return (
    <group ref={groupRef} position={position} onClick={(e) => { e.stopPropagation(); enabled && onClick?.() }} onPointerOver={() => enabled && setHovered(true)} onPointerOut={() => setHovered(false)}>
      {children}
      {selected && <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.02,0]}><ringGeometry args={[0.07,0.1,32]} /><meshBasicMaterial color="#fbbf24" transparent opacity={0.9} side={THREE.DoubleSide} /></mesh>}
      {enabled && !selected && <Html position={[0,-0.06,0]} center><div className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${hovered ? "bg-green-600" : "bg-green-500"} text-white`}><MousePointer size={10} /></div></Html>}
      {selected && <Html position={[0,-0.06,0]} center><div className="bg-yellow-500 text-black px-1.5 py-0.5 rounded-full text-xs font-bold animate-pulse">Cible!</div></Html>}
      {!enabled && <Html position={[0,-0.05,0]} center><div className="bg-gray-400 text-white px-1 py-0.5 rounded text-xs">🔒</div></Html>}
    </group>
  )
}

function Wire({ start, end, color = "#f00", glowing = false }) {
  const ref = useRef()
  useFrame((s) => { if (ref.current && glowing) ref.current.material.emissiveIntensity = 0.5 + Math.sin(s.clock.elapsedTime * 6) * 0.3 })
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(...start), new THREE.Vector3(...end)])
  return <mesh ref={ref}><tubeGeometry args={[curve, 16, 0.008, 8, false]} /><meshStandardMaterial color={color} emissive={glowing ? color : "#000"} emissiveIntensity={glowing ? 0.5 : 0} /></mesh>
}

function StepsPanel({ steps, currentStep, expanded, onToggle, isComplete, experiment }) {
  return (
    <div className="absolute top-2 right-2 z-50 max-w-[200px] pointer-events-auto">
      <div className="rounded-xl shadow-lg overflow-hidden bg-white/95">
        <button onClick={onToggle} className="w-full px-2 py-1.5 flex items-center justify-between bg-gray-50">
          <span className="font-bold text-xs flex items-center gap-1"><List size={14} /> {currentStep+1}/{steps.length}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expanded && <div className="px-2 pb-2 pt-1 max-h-[160px] overflow-y-auto">{steps.map((step, i) => (
          <div key={i} className={`flex items-start gap-1 py-0.5 text-xs ${i < currentStep ? "text-green-600" : i === currentStep ? "text-orange-500 font-bold" : "text-gray-400"}`}>
            {i < currentStep ? <CheckCircle size={11} /> : <Circle size={11} className={i === currentStep ? "animate-pulse" : ""} />}
            <span>{step}</span>
          </div>
        ))}</div>}
        {isComplete && experiment && (
          <div className="p-2 bg-green-50 border-t text-xs space-y-2">
            <div className="font-bold text-green-700">✅ Termine!</div>
            {experiment.materiel && <div><span className="font-semibold">🔧 Materiel:</span><ul className="ml-2">{experiment.materiel.map((m,i) => <li key={i} className="text-gray-500">{m}</li>)}</ul></div>}{experiment.learned && <div><span className="font-semibold">🎯 Appris:</span><ul className="ml-2">{experiment.learned.map((l,i) => <li key={i} className="text-gray-600">{l}</li>)}</ul></div>}
            {experiment.formulas && <div><span className="font-semibold">📐 Formules:</span>{experiment.formulas.map((f,i) => <div key={i} className="text-blue-600 font-mono ml-2">{f}</div>)}</div>}
            {experiment.realLife && <div><span className="font-semibold">🌍 Vie reelle:</span><ul className="ml-2">{experiment.realLife.map((r,i) => <li key={i} className="text-gray-600">{r}</li>)}</ul></div>}
          </div>
        )}
      </div>
    </div>
  )
}

function CompletionBanner({ text, experiment }) { 
  return (
    <Html position={[0.4, 0.35, 0.3]} center>
      <div className="bg-white rounded-lg shadow-xl text-left w-56 overflow-hidden">
        <div className="bg-green-500 text-white px-3 py-2">
          <div className="font-bold text-sm">{text}</div>
        </div>
        {experiment && experiment.learned && (
          <div className="p-2 text-xs space-y-1 max-h-40 overflow-y-auto">
            <div className="font-bold text-green-700">🎯 Appris:</div>
            {experiment.learned.map((l,i) => <div key={i} className="text-gray-600">• {l}</div>)}
            {experiment.formulas && <div className="font-bold text-blue-700 mt-1">📐 Formules:</div>}
            {experiment.formulas && experiment.formulas.map((f,i) => <div key={i} className="text-blue-600 font-mono">{f}</div>)}
            {experiment.realLife && <div className="font-bold text-yellow-700 mt-1">🌍 Vie reelle:</div>}
            {experiment.realLife && experiment.realLife.map((r,i) => <div key={i} className="text-gray-600">• {r}</div>)}
          </div>
        )}
      </div>
    </Html>
  )
}

// ============ EXPERIMENTS ============

function AcidBaseExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary }) {
  const { hclVolume, indicatorAdded, pH, color, neutralized } = state
  const handlePour = (type) => {
    if (type === "hcl" && selectedItem === "hcl") { setState(p => ({ ...p, hclVolume: 50, pH: 1 })); setSelectedItem(null); setStep(1); toast.success("🧪 HCl!") }
    else if (type === "indicator" && selectedItem === "indicator") { setState(p => ({ ...p, indicatorAdded: true })); setSelectedItem(null); setStep(2); toast.success("💧 Indicateur!") }
    else if (type === "naoh" && selectedItem === "naoh" && !neutralized) {
      setState(p => { const nV = p.naohVolume + 8, nPH = calculatePH(p.hclVolume, nV), nC = getIndicatorColor(nPH), done = nPH >= 6.5
        if (done) setTimeout(() => { setStep(experiment.steps.length - 1); toast.success("🎉 Neutralise!") }, 300)
        return { ...p, naohVolume: nV, pH: nPH, color: nC, neutralized: done }
      }); setSelectedItem(null)
    }
  }
  return (
    <group>
      {/* Beaker */}
      <group position={[0, 0.08, -0.15]}>
        <mesh><cylinderGeometry args={[0.1, 0.08, 0.18, 32, 1, true]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.2} side={THREE.DoubleSide} /></mesh>
        {hclVolume > 0 && <mesh position={[0, -0.02, 0]}><cylinderGeometry args={[0.08, 0.07, 0.12, 32]} /><meshStandardMaterial color={color} transparent opacity={0.85} /></mesh>}
        <Html position={[0, 0.14, 0]} center><div className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-bold">pH: {pH.toFixed(1)}</div></Html>
      </group>

      <TargetZone position={[0, 0.22, -0.15]} label="⬇️ Verser" active={["hcl","indicator","naoh"].includes(selectedItem) && ((selectedItem==="hcl"&&!hclVolume)||(selectedItem==="indicator"&&hclVolume&&!indicatorAdded)||(selectedItem==="naoh"&&indicatorAdded&&!neutralized))} onClick={() => handlePour(selectedItem)} />

      {/* Bottles on shelf */}
      <ClickableObject position={[-0.4, 0.1, 0.3]} selected={selectedItem === "hcl"} enabled={!hclVolume} onClick={() => setSelectedItem(selectedItem === "hcl" ? null : "hcl")}>
        <group><mesh><cylinderGeometry args={[0.04, 0.04, 0.12, 16]} /><meshStandardMaterial color="#ff6b6b" /></mesh><mesh position={[0, 0.07, 0]}><cylinderGeometry args={[0.025, 0.025, 0.02, 16]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.12, 0]} center><div className="bg-white px-2 py-1 rounded text-xs font-bold shadow">HCl (Acide)</div></Html></group>
      </ClickableObject>
      <ClickableObject position={[0, 0.08, 0.3]} selected={selectedItem === "indicator"} enabled={hclVolume > 0 && !indicatorAdded} onClick={() => setSelectedItem(selectedItem === "indicator" ? null : "indicator")}>
        <group><mesh><cylinderGeometry args={[0.028, 0.028, 0.08, 16]} /><meshStandardMaterial color="#9b59b6" /></mesh><mesh position={[0, 0.05, 0]}><cylinderGeometry args={[0.018, 0.018, 0.015, 16]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.1, 0]} center><div className="bg-purple-100 px-2 py-1 rounded text-xs font-bold shadow">Indicateur</div></Html></group>
      </ClickableObject>
      <ClickableObject position={[0.4, 0.1, 0.3]} selected={selectedItem === "naoh"} enabled={indicatorAdded && !neutralized} onClick={() => setSelectedItem(selectedItem === "naoh" ? null : "naoh")}>
        <group><mesh><cylinderGeometry args={[0.04, 0.04, 0.12, 16]} /><meshStandardMaterial color="#4dabf7" /></mesh><mesh position={[0, 0.07, 0]}><cylinderGeometry args={[0.025, 0.025, 0.02, 16]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.12, 0]} center><div className="bg-blue-100 px-2 py-1 rounded text-xs font-bold shadow">NaOH (Base)</div></Html></group>
      </ClickableObject>

      
    </group>
  )
}

function CombustionExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary }) {
  const { bunsenLit, magnesiumBurning } = state
  const handleAction = (a) => {
    if (a === "lighter" && selectedItem === "lighter") { setState(p => ({ ...p, bunsenLit: true })); setSelectedItem(null); setStep(1); toast.success("🔥 Allume!") }
    else if (a === "magnesium" && selectedItem === "magnesium" && bunsenLit) { setState(p => ({ ...p, magnesiumBurning: true })); setSelectedItem(null); setStep(3); toast.success("✨ Combustion!"); setTimeout(() => setStep(experiment.steps.length - 1), 2000) }
  }
  return (
    <group>
      {/* Bunsen burner */}
      <group position={[0, 0, -0.1]}>
        <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.08, 0.08, 0.04, 16]} /><meshStandardMaterial color="#333" metalness={0.9} /></mesh>
        <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.03, 0.03, 0.22, 16]} /><meshStandardMaterial color="#444" metalness={0.8} /></mesh>
        <mesh position={[0, 0.28, 0]}><cylinderGeometry args={[0.038, 0.032, 0.05, 16]} /><meshStandardMaterial color="#333" metalness={0.9} /></mesh>
        <Html position={[0, -0.02, 0.1]} center><div className="bg-gray-800 text-white px-2 py-1 rounded text-xs">Bec Bunsen</div></Html>
        {bunsenLit && <>
          <mesh position={[0, 0.38, 0]}><coneGeometry args={[0.04, 0.15, 16]} /><meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={2} transparent opacity={0.9} /></mesh>
          <mesh position={[0, 0.35, 0]}><coneGeometry args={[0.022, 0.1, 16]} /><meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1.5} transparent opacity={0.7} /></mesh>
          <pointLight position={[0, 0.35, 0]} color="#ff6600" intensity={2} distance={1.5} />
        </>}
      </group>
      {magnesiumBurning && <group position={[0, 0.5, -0.1]}><mesh><sphereGeometry args={[0.06, 16, 16]} /><meshBasicMaterial color="#fff" /></mesh><pointLight color="#fff" intensity={8} distance={3} /><Html position={[0.12, 0, 0]} center><div className="bg-white text-gray-800 px-2 py-1 rounded text-xs shadow">MgO (oxyde)</div></Html></group>}
      {magnesiumBurning && <group position={[0, 0.5, -0.1]}><mesh><sphereGeometry args={[0.06, 16, 16]} /><meshBasicMaterial color="#fff" /></mesh><pointLight color="#fff" intensity={8} distance={3} /></group>}

      <TargetZone position={[0, 0.32, -0.1]} label="🔥 Allumer" active={selectedItem === "lighter"} onClick={() => handleAction("lighter")} />
      <TargetZone position={[0, 0.45, -0.1]} label="✨ Bruler" active={selectedItem === "magnesium" && bunsenLit} onClick={() => handleAction("magnesium")} />

      <ClickableObject position={[-0.4, 0.08, 0.3]} selected={selectedItem === "lighter"} enabled={!bunsenLit} onClick={() => setSelectedItem(selectedItem === "lighter" ? null : "lighter")}>
        <group><mesh><boxGeometry args={[0.03, 0.08, 0.018]} /><meshStandardMaterial color="#e74c3c" /></mesh><Html position={[0, 0.07, 0]} center><div className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">🔥</div></Html></group>
      </ClickableObject>
      <ClickableObject position={[0.4, 0.08, 0.3]} selected={selectedItem === "magnesium"} enabled={bunsenLit && !magnesiumBurning} onClick={() => setSelectedItem(selectedItem === "magnesium" ? null : "magnesium")}>
        <group><mesh rotation={[0, 0, 0.3]}><boxGeometry args={[0.15, 0.012, 0.006]} /><meshStandardMaterial color="#ccc" metalness={0.95} /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-gray-200 px-2 py-1 rounded text-xs font-bold">Ruban Mg</div></Html></group>
      </ClickableObject>

      
    </group>
  )
}

function CircuitExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary }) {
  const { batteryConnected, resistorConnected, bulbLit } = state
  const handlePlace = (item) => {
    if (item === "battery" && selectedItem === "battery") { setState(p => ({ ...p, batteryConnected: true })); setSelectedItem(null); setStep(1); toast.success("🔋 Pile!") }
    else if (item === "resistor" && selectedItem === "resistor") { setState(p => ({ ...p, resistorConnected: true })); setSelectedItem(null); setStep(2); toast.success("⚡ Resistance!") }
    else if (item === "bulb" && selectedItem === "bulb") { setState(p => ({ ...p, bulbLit: true, current: 0.09 })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("💡 I=0.09A") }
  }
  return (
    <group>
      {/* Circuit board */}
      <mesh position={[0, 0.02, -0.05]}><boxGeometry args={[0.9, 0.02, 0.4]} /><meshStandardMaterial color="#1a5c32" /></mesh>

      <TargetZone position={[-0.28, 0.06, -0.05]} label="🔋" active={selectedItem === "battery"} onClick={() => handlePlace("battery")} />
      <TargetZone position={[0, 0.06, -0.05]} label="⚡" active={selectedItem === "resistor"} onClick={() => handlePlace("resistor")} />
      <TargetZone position={[0.28, 0.06, -0.05]} label="💡" active={selectedItem === "bulb"} onClick={() => handlePlace("bulb")} />

      {batteryConnected && <group position={[-0.28, 0.1, -0.05]}><mesh><boxGeometry args={[0.07, 0.12, 0.045]} /><meshStandardMaterial color="#1e40af" /></mesh><mesh position={[0.028, 0.07, 0]}><cylinderGeometry args={[0.012, 0.012, 0.02, 16]} /><meshStandardMaterial color="#dc2626" /></mesh></group>}
      {resistorConnected && <group position={[0, 0.1, -0.05]}><mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.025, 0.025, 0.12, 16]} /><meshStandardMaterial color="#c2410c" emissive={bulbLit?"#f60":"#000"} emissiveIntensity={bulbLit?0.4:0} /></mesh></group>}
      {bulbLit && <group position={[0.28, 0.13, -0.05]}><mesh><sphereGeometry args={[0.04, 32, 32]} /><meshPhysicalMaterial color="#ffc" emissive="#ff0" emissiveIntensity={2} /></mesh><pointLight color="#ff0" intensity={2} distance={1.5} /></group>}

      {!batteryConnected && <ClickableObject position={[-0.35, 0.1, 0.3]} selected={selectedItem === "battery"} enabled={true} onClick={() => setSelectedItem(selectedItem === "battery" ? null : "battery")}><group><mesh><boxGeometry args={[0.06, 0.1, 0.04]} /><meshStandardMaterial color="#1e40af" /></mesh><Html position={[0, 0.08, 0]} center><div className="bg-yellow-400 px-2 py-1 text-xs font-bold rounded">Pile 9V</div></Html></group></ClickableObject>}
      {!resistorConnected && <ClickableObject position={[0, 0.1, 0.3]} selected={selectedItem === "resistor"} enabled={batteryConnected} onClick={() => setSelectedItem(selectedItem === "resistor" ? null : "resistor")}><group><mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.02, 0.02, 0.1, 16]} /><meshStandardMaterial color="#c2410c" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-orange-200 px-2 py-1 text-xs font-bold rounded">Resistance 100Ω</div></Html></group></ClickableObject>}
      {!bulbLit && <ClickableObject position={[0.35, 0.12, 0.3]} selected={selectedItem === "bulb"} enabled={resistorConnected} onClick={() => setSelectedItem(selectedItem === "bulb" ? null : "bulb")}><group><mesh><sphereGeometry args={[0.035, 32, 32]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.4} /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-yellow-100 px-2 py-1 text-xs font-bold rounded">Ampoule</div></Html></group></ClickableObject>}

      {batteryConnected && resistorConnected && <Wire start={[-0.2, 0.1, -0.05]} end={[-0.08, 0.1, -0.05]} color={bulbLit?"#0f0":"#c00"} glowing={bulbLit} />}
      {resistorConnected && bulbLit && <Wire start={[0.08, 0.1, -0.05]} end={[0.2, 0.13, -0.05]} color="#0f0" glowing={true} />}

      
    </group>
  )
}

function PendulumExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary }) {
  const { stringAttached, massAttached, swinging, period } = state
  const pendulumRef = useRef()
  useFrame((s) => { if (swinging && pendulumRef.current) pendulumRef.current.rotation.z = Math.sin(s.clock.elapsedTime * Math.PI) * 0.4 })
  const handleAction = (a) => {
    if (a === "string" && selectedItem === "string") { setState(p => ({ ...p, stringAttached: true })); setSelectedItem(null); setStep(1); toast.success("🧵 Ficelle!") }
    else if (a === "mass" && selectedItem === "mass") { setState(p => ({ ...p, massAttached: true })); setSelectedItem(null); setStep(2); toast.success("⚖️ Masse!") }
    else if (a === "swing" && selectedItem === "swing") { const T = calculatePeriod(1); setState(p => ({ ...p, swinging: true, period: T })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success(`⏱️ T=${T.toFixed(2)}s`) }
  }
  return (
    <group>
      {/* Stand */}
      <group position={[0, 0, -0.15]}>
        <mesh position={[0, 0.015, 0]}><boxGeometry args={[0.25, 0.03, 0.15]} /><meshStandardMaterial color="#444" metalness={0.8} /></mesh>
        <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.015, 0.015, 0.55, 16]} /><meshStandardMaterial color="#555" metalness={0.9} /></mesh>
        <mesh position={[0.1, 0.55, 0]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.01, 0.01, 0.2, 16]} /><meshStandardMaterial color="#555" metalness={0.9} /></mesh>
        {stringAttached && <group ref={pendulumRef} position={[0.18, 0.55, 0]}>
          <mesh position={[0, -0.18, 0]}><cylinderGeometry args={[0.003, 0.003, 0.35, 8]} /><meshStandardMaterial color="#8B4513" /></mesh>
          {massAttached && <mesh position={[0, -0.38, 0]}><sphereGeometry args={[0.045, 32, 32]} /><meshStandardMaterial color="#dc2626" metalness={0.7} /></mesh>}
        </group>}
      </group>

      <TargetZone position={[0.18, 0.55, -0.15]} label="🧵" active={selectedItem === "string"} onClick={() => handleAction("string")} />
      <TargetZone position={[0.18, 0.2, -0.15]} label="⚖️" active={selectedItem === "mass" && stringAttached} onClick={() => handleAction("mass")} />
      <TargetZone position={[0.35, 0.2, -0.15]} label="👆 Lancer" active={selectedItem === "swing" && massAttached} onClick={() => handleAction("swing")} />

      <ClickableObject position={[-0.4, 0.08, 0.3]} selected={selectedItem === "string"} enabled={!stringAttached} onClick={() => setSelectedItem(selectedItem === "string" ? null : "string")}><group><mesh rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.035, 0.012, 8, 32]} /><meshStandardMaterial color="#8B4513" /></mesh><Html position={[0, 0.07, 0]} center><div className="bg-white px-1.5 py-0.5 rounded text-xs font-bold shadow">L=1m</div></Html></group></ClickableObject>
      <ClickableObject position={[0, 0.08, 0.3]} selected={selectedItem === "mass"} enabled={stringAttached && !massAttached} onClick={() => setSelectedItem(selectedItem === "mass" ? null : "mass")}><group><mesh><sphereGeometry args={[0.035, 32, 32]} /><meshStandardMaterial color="#dc2626" metalness={0.7} /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-white px-1.5 py-0.5 rounded text-xs font-bold shadow">100g</div></Html></group></ClickableObject>
      <ClickableObject position={[0.4, 0.08, 0.3]} selected={selectedItem === "swing"} enabled={massAttached && !swinging} onClick={() => setSelectedItem(selectedItem === "swing" ? null : "swing")}><group><mesh><boxGeometry args={[0.05, 0.06, 0.018]} /><meshStandardMaterial color="#f59e0b" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-yellow-400 px-1.5 py-0.5 rounded text-xs font-bold">👆</div></Html></group></ClickableObject>

      {swinging && <Html position={[0.45, 0.4, 0]} center><div className="bg-blue-900 text-white p-2 rounded text-xs"><div className="font-bold">T = 2π√(L/g)</div><div className="text-lg text-yellow-300">T ≈ 2.01s</div></div></Html>}
      
    </group>
  )
}

// BIOLOGY EXPERIMENTS

function CellObservationExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary }) {
  const { slideReady, stainAdded, coverslipOn, focusedLow, focusedHigh } = state
  const handleAction = (a) => {
    if (a === "slide" && selectedItem === "slide") { setState(p => ({ ...p, slideReady: true })); setSelectedItem(null); setStep(1); toast.success("🔬 Lame prete!") }
    else if (a === "stain" && selectedItem === "stain") { setState(p => ({ ...p, stainAdded: true })); setSelectedItem(null); setStep(2); toast.success("🎨 Colorant!") }
    else if (a === "coverslip" && selectedItem === "coverslip") { setState(p => ({ ...p, coverslipOn: true })); setSelectedItem(null); setStep(3); toast.success("📋 Lamelle!") }
    else if (a === "focus10" && selectedItem === "focus10") { setState(p => ({ ...p, focusedLow: true })); setSelectedItem(null); setStep(4); toast.success("🔍 x10!") }
    else if (a === "focus40" && selectedItem === "focus40") { setState(p => ({ ...p, focusedHigh: true })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("🔬 x40!") }
  }
  return (
    <group>
      {/* Microscope */}
      <group position={[0.15, 0, -0.1]}>
        <mesh position={[0, 0.03, 0]}><boxGeometry args={[0.22, 0.05, 0.18]} /><meshStandardMaterial color="#222" /></mesh>
        <mesh position={[-0.08, 0.2, 0]}><boxGeometry args={[0.05, 0.35, 0.05]} /><meshStandardMaterial color="#333" /></mesh>
        <mesh position={[0.02, 0.38, 0]} rotation={[0.4, 0, 0]}><cylinderGeometry args={[0.035, 0.045, 0.14, 16]} /><meshStandardMaterial color="#222" /></mesh>
        <mesh position={[0, 0.1, 0]}><boxGeometry args={[0.16, 0.015, 0.14]} /><meshStandardMaterial color="#444" /></mesh>
        <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.025, 0.02, 0.06, 16]} /><meshStandardMaterial color="#333" /></mesh>
        {coverslipOn && <mesh position={[0, 0.11, 0]}><boxGeometry args={[0.07, 0.003, 0.025]} /><meshPhysicalMaterial color="#aaddff" transparent opacity={0.5} /></mesh>}
      </group>
      
      {/* Microscope view */}
      {focusedLow && <Html position={[0.17, 0.5, 0]} center>
        <div className="bg-white rounded-full w-16 h-16 border-4 border-gray-800 flex items-center justify-center overflow-hidden">
          {focusedHigh ? (
            <div className="relative w-full h-full bg-blue-50">
              <div className="absolute w-6 h-8 bg-purple-200 rounded-full top-1 left-1 border border-purple-400"></div>
              <div className="absolute w-2 h-2 bg-purple-700 rounded-full top-4 left-3"></div>
              <div className="absolute w-5 h-7 bg-purple-200 rounded-full top-6 left-8 border border-purple-400"></div>
              <div className="absolute w-2 h-2 bg-purple-700 rounded-full top-9 left-10"></div>
            </div>
          ) : <div className="text-purple-400 text-2xl">●●●</div>}
        </div>
      </Html>}

      <TargetZone position={[-0.25, 0.08, 0]} label="🔬 Lame" active={selectedItem === "slide"} onClick={() => handleAction("slide")} />
      <TargetZone position={[-0.25, 0.15, 0]} label="🎨 Colorant" active={selectedItem === "stain" && slideReady} onClick={() => handleAction("stain")} />
      <TargetZone position={[-0.25, 0.22, 0]} label="📋 Lamelle" active={selectedItem === "coverslip" && stainAdded} onClick={() => handleAction("coverslip")} />
      <TargetZone position={[0.15, 0.18, 0]} label="🔍 x10" active={selectedItem === "focus10" && coverslipOn} onClick={() => handleAction("focus10")} />
      <TargetZone position={[0.15, 0.25, 0]} label="🔬 x40" active={selectedItem === "focus40" && focusedLow} onClick={() => handleAction("focus40")} />

      <ClickableObject position={[-0.45, 0.06, 0.3]} selected={selectedItem === "slide"} enabled={!slideReady} onClick={() => setSelectedItem("slide")}><group><mesh><boxGeometry args={[0.07, 0.003, 0.025]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.4} /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-white px-1 py-0.5 rounded text-xs font-bold shadow">Lame</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.2, 0.06, 0.3]} selected={selectedItem === "stain"} enabled={slideReady && !stainAdded} onClick={() => setSelectedItem("stain")}><group><mesh><cylinderGeometry args={[0.018, 0.018, 0.06, 16]} /><meshStandardMaterial color="#3b82f6" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-bold">Bleu</div></Html></group></ClickableObject>
      <ClickableObject position={[0.05, 0.06, 0.3]} selected={selectedItem === "coverslip"} enabled={stainAdded && !coverslipOn} onClick={() => setSelectedItem("coverslip")}><group><mesh><boxGeometry args={[0.03, 0.002, 0.03]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.3} /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-200 px-1 py-0.5 rounded text-xs font-bold">Lamelle</div></Html></group></ClickableObject>
      <ClickableObject position={[0.3, 0.06, 0.3]} selected={selectedItem === "focus10"} enabled={coverslipOn && !focusedLow} onClick={() => setSelectedItem("focus10")}><group><mesh><cylinderGeometry args={[0.022, 0.022, 0.025, 16]} /><meshStandardMaterial color="#666" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-600 text-white px-1 py-0.5 rounded text-xs font-bold">x10</div></Html></group></ClickableObject>
      <ClickableObject position={[0.5, 0.06, 0.3]} selected={selectedItem === "focus40"} enabled={focusedLow && !focusedHigh} onClick={() => setSelectedItem("focus40")}><group><mesh><cylinderGeometry args={[0.018, 0.018, 0.035, 16]} /><meshStandardMaterial color="#444" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-800 text-white px-1 py-0.5 rounded text-xs font-bold">x40</div></Html></group></ClickableObject>

      {focusedHigh && <Html position={[-0.4, 0.3, 0]} center><div className="bg-purple-900 text-white p-2 rounded text-xs"><div className="font-bold">Cellule vegetale</div><div>• Noyau</div><div>• Cytoplasme</div><div>• Membrane</div></div></Html>}
      
    </group>
  )
}

function PhotosynthesisExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary }) {
  const { plantReady, lightOn, bubblesVisible, darkCompared } = state
  const bubbleRef = useRef()
  useFrame((s) => { if (bubbleRef.current && bubblesVisible) bubbleRef.current.position.y = 0.15 + Math.sin(s.clock.elapsedTime * 3) * 0.02 })
  
  const handleAction = (a) => {
    if (a === "plant" && selectedItem === "plant") { setState(p => ({ ...p, plantReady: true })); setSelectedItem(null); setStep(1); toast.success("🌿 Elodee prete!") }
    else if (a === "light" && selectedItem === "light") { setState(p => ({ ...p, lightOn: true })); setSelectedItem(null); setStep(2); toast.success("💡 Lumiere!"); setTimeout(() => { setState(p => ({ ...p, bubblesVisible: true })); toast.success("🫧 Bulles O2!") }, 2000) }
    else if (a === "compare" && selectedItem === "compare") { setState(p => ({ ...p, darkCompared: true })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("📊 Compare!") }
  }
  return (
    <group>
      {/* Beaker with water and plant */}
      <group position={[0, 0.08, -0.1]}>
        <mesh><cylinderGeometry args={[0.1, 0.08, 0.18, 32, 1, true]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.2} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, -0.02, 0]}><cylinderGeometry args={[0.08, 0.07, 0.12, 32]} /><meshStandardMaterial color="#a8d8ea" transparent opacity={0.6} /></mesh>
        {plantReady && <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.008, 0.008, 0.14, 8]} /><meshStandardMaterial color="#228B22" /></mesh>}
        {plantReady && <mesh position={[0.02, 0.03, 0]}><sphereGeometry args={[0.025, 8, 8]} /><meshStandardMaterial color="#32CD32" /></mesh>}
        {plantReady && <mesh position={[-0.02, 0.01, 0]}><sphereGeometry args={[0.02, 8, 8]} /><meshStandardMaterial color="#228B22" /></mesh>}
        {bubblesVisible && <group ref={bubbleRef}><mesh><sphereGeometry args={[0.008, 8, 8]} /><meshStandardMaterial color="#fff" transparent opacity={0.7} /></mesh><mesh position={[0.02, 0.02, 0]}><sphereGeometry args={[0.005, 8, 8]} /><meshStandardMaterial color="#fff" transparent opacity={0.7} /></mesh><mesh position={[-0.015, 0.03, 0]}><sphereGeometry args={[0.006, 8, 8]} /><meshStandardMaterial color="#fff" transparent opacity={0.7} /></mesh></group>}
      </group>
      
      {/* Lamp */}
      {lightOn && <group position={[-0.35, 0.2, -0.1]}><mesh><sphereGeometry args={[0.05, 16, 16]} /><meshStandardMaterial color="#fff" emissive="#ffd700" emissiveIntensity={2} /></mesh><pointLight color="#ffd700" intensity={2} distance={1} /></group>}

      <TargetZone position={[0, 0.12, -0.1]} label="🌿 Plante" active={selectedItem === "plant"} onClick={() => handleAction("plant")} />
      <TargetZone position={[-0.35, 0.2, -0.1]} label="💡 Lumiere" active={selectedItem === "light" && plantReady} onClick={() => handleAction("light")} />
      <TargetZone position={[0.35, 0.15, -0.1]} label="📊 Comparer" active={selectedItem === "compare" && bubblesVisible} onClick={() => handleAction("compare")} />

      <ClickableObject position={[-0.4, 0.08, 0.3]} selected={selectedItem === "plant"} enabled={!plantReady} onClick={() => setSelectedItem("plant")}><group><mesh><cylinderGeometry args={[0.006, 0.006, 0.1, 8]} /><meshStandardMaterial color="#228B22" /></mesh><mesh position={[0, 0.04, 0]}><sphereGeometry args={[0.02, 8, 8]} /><meshStandardMaterial color="#32CD32" /></mesh><Html position={[0, 0.08, 0]} center><div className="bg-green-500 text-white px-1 py-0.5 rounded text-xs font-bold">Elodee</div></Html></group></ClickableObject>
      <ClickableObject position={[0, 0.08, 0.3]} selected={selectedItem === "light"} enabled={plantReady && !lightOn} onClick={() => setSelectedItem("light")}><group><mesh><sphereGeometry args={[0.03, 16, 16]} /><meshStandardMaterial color="#ffd700" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-yellow-400 px-1 py-0.5 rounded text-xs font-bold">Lampe</div></Html></group></ClickableObject>
      <ClickableObject position={[0.4, 0.08, 0.3]} selected={selectedItem === "compare"} enabled={bubblesVisible && !darkCompared} onClick={() => setSelectedItem("compare")}><group><mesh><boxGeometry args={[0.05, 0.04, 0.03]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-gray-700 text-white px-1 py-0.5 rounded text-xs font-bold">Obscur</div></Html></group></ClickableObject>

      {darkCompared && <Html position={[0.4, 0.3, 0]} center><div className="bg-green-900 text-white p-2 rounded text-xs"><div className="font-bold">Photosynthese</div><div>Lumiere → O2 ✓</div><div>Obscurite → Pas O2</div><div className="text-yellow-300">6CO2 + 6H2O → C6H12O6 + 6O2</div></div></Html>}
      
    </group>
  )
}

function GelElectrophoresisExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary }) {
  const { gelReady, dnaLoaded, powerOn, migrating, stained, uvOn } = state
  const [migrationProgress, setMigrationProgress] = useState(0)
  
  useEffect(() => {
    if (migrating && migrationProgress < 100) {
      const timer = setTimeout(() => setMigrationProgress(p => Math.min(100, p + 5)), 200)
      return () => clearTimeout(timer)
    }
    if (migrationProgress >= 100 && !stained) {
      setState(p => ({ ...p, migrating: false }))
      toast.success("⚡ Migration complete!")
      setStep(4)
    }
  }, [migrating, migrationProgress])

  const handleAction = (a) => {
    if (a === "gel" && selectedItem === "gel") { setState(p => ({ ...p, gelReady: true })); setSelectedItem(null); setStep(1); toast.success("🧪 Gel pret!") }
    else if (a === "dna" && selectedItem === "dna") { setState(p => ({ ...p, dnaLoaded: true })); setSelectedItem(null); setStep(2); toast.success("🧬 ADN charge!") }
    else if (a === "power" && selectedItem === "power") { setState(p => ({ ...p, powerOn: true, migrating: true })); setSelectedItem(null); setStep(3); toast.success("⚡ Migration!") }
    else if (a === "stain" && selectedItem === "stain") { setState(p => ({ ...p, stained: true })); setSelectedItem(null); setStep(5); toast.success("🎨 Colore!") }
    else if (a === "uv" && selectedItem === "uv") { setState(p => ({ ...p, uvOn: true })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("🔦 UV!") }
  }

  return (
    <group>
      {/* Electrophoresis chamber */}
      <group position={[0, 0.06, -0.1]}>
        <mesh><boxGeometry args={[0.35, 0.08, 0.2]} /><meshStandardMaterial color="#333" /></mesh>
        <mesh position={[0, 0.045, 0]}><boxGeometry args={[0.32, 0.01, 0.17]} /><meshPhysicalMaterial color="#a8d8ea" transparent opacity={0.5} /></mesh>
        {gelReady && <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.25, 0.015, 0.12]} /><meshStandardMaterial color="#f0f0f0" transparent opacity={0.8} /></mesh>}
        {dnaLoaded && <group position={[-0.08, 0.06, 0]}>
          {[0, 0.04, 0.08, 0.12].map((x, i) => <mesh key={i} position={[x, 0, 0]}><boxGeometry args={[0.015, 0.005, 0.02]} /><meshStandardMaterial color="#3b82f6" /></mesh>)}
        </group>}
        {migrating && <group position={[-0.08, 0.058, 0]}>
          {[0, 0.04, 0.08, 0.12].map((x, i) => <mesh key={i} position={[x, -migrationProgress * 0.0008, 0]}><boxGeometry args={[0.015, 0.004, 0.015]} /><meshStandardMaterial color="#3b82f6" /></mesh>)}
        </group>}
        {stained && !uvOn && <group position={[-0.08, 0.058, 0]}>
          {[0, 0.04, 0.08, 0.12].map((x, i) => {
            const bands = i === 0 ? [0.02, 0.04, 0.06] : i === 1 ? [0.03, 0.05] : i === 2 ? [0.02, 0.05, 0.07] : [0.04]
            return bands.map((y, j) => <mesh key={`${i}-${j}`} position={[x, -y, 0]}><boxGeometry args={[0.012, 0.004, 0.015]} /><meshStandardMaterial color="#4a5568" /></mesh>)
          })}
        </group>}
        {uvOn && <group position={[-0.08, 0.058, 0]}>
          {[0, 0.04, 0.08, 0.12].map((x, i) => {
            const bands = i === 0 ? [0.02, 0.04, 0.06] : i === 1 ? [0.03, 0.05] : i === 2 ? [0.02, 0.05, 0.07] : [0.04]
            return bands.map((y, j) => <mesh key={`${i}-${j}`} position={[x, -y, 0]}><boxGeometry args={[0.012, 0.004, 0.015]} /><meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={1.5} /></mesh>)
          })}
        </group>}
        {powerOn && <Html position={[0.2, 0.06, 0]} center><div className="bg-red-500 text-white px-1 rounded text-xs animate-pulse">⚡ {migrationProgress}%</div></Html>}
      </group>

      {/* Power supply */}
      <group position={[0.35, 0.05, -0.1]}>
        <mesh><boxGeometry args={[0.12, 0.08, 0.1]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
        <Html position={[0, 0.02, 0.06]} center><div className={`text-xs px-1 rounded ${powerOn ? 'bg-green-500' : 'bg-gray-600'} text-white`}>{powerOn ? '120V' : 'OFF'}</div></Html>
      </group>

      <TargetZone position={[0, 0.1, -0.1]} label="🧪 Gel" active={selectedItem === "gel"} onClick={() => handleAction("gel")} />
      <TargetZone position={[-0.08, 0.12, -0.1]} label="🧬 ADN" active={selectedItem === "dna" && gelReady} onClick={() => handleAction("dna")} />
      <TargetZone position={[0.35, 0.1, -0.1]} label="⚡ Power" active={selectedItem === "power" && dnaLoaded} onClick={() => handleAction("power")} />
      <TargetZone position={[0.15, 0.12, -0.1]} label="🎨 Colorer" active={selectedItem === "stain" && !migrating && migrationProgress >= 100} onClick={() => handleAction("stain")} />
      <TargetZone position={[-0.2, 0.15, -0.1]} label="🔦 UV" active={selectedItem === "uv" && stained} onClick={() => handleAction("uv")} />

      <ClickableObject position={[-0.45, 0.06, 0.3]} selected={selectedItem === "gel"} enabled={!gelReady} onClick={() => setSelectedItem("gel")}><group><mesh><boxGeometry args={[0.06, 0.04, 0.04]} /><meshStandardMaterial color="#f0f0f0" transparent opacity={0.7} /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-200 px-1 py-0.5 rounded text-xs font-bold">Gel</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.25, 0.06, 0.3]} selected={selectedItem === "dna"} enabled={gelReady && !dnaLoaded} onClick={() => setSelectedItem("dna")}><group><mesh><cylinderGeometry args={[0.012, 0.012, 0.05, 16]} /><meshStandardMaterial color="#3b82f6" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-bold">ADN</div></Html></group></ClickableObject>
      <ClickableObject position={[0, 0.06, 0.3]} selected={selectedItem === "power"} enabled={dnaLoaded && !powerOn} onClick={() => setSelectedItem("power")}><group><mesh><boxGeometry args={[0.04, 0.03, 0.03]} /><meshStandardMaterial color="#ef4444" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-red-500 text-white px-1 py-0.5 rounded text-xs font-bold">ON</div></Html></group></ClickableObject>
      <ClickableObject position={[0.25, 0.06, 0.3]} selected={selectedItem === "stain"} enabled={!migrating && migrationProgress >= 100 && !stained} onClick={() => setSelectedItem("stain")}><group><mesh><cylinderGeometry args={[0.015, 0.015, 0.05, 16]} /><meshStandardMaterial color="#8b5cf6" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-purple-500 text-white px-1 py-0.5 rounded text-xs font-bold">EtBr</div></Html></group></ClickableObject>
      <ClickableObject position={[0.45, 0.06, 0.3]} selected={selectedItem === "uv"} enabled={stained && !uvOn} onClick={() => setSelectedItem("uv")}><group><mesh><cylinderGeometry args={[0.02, 0.025, 0.08, 16]} /><meshStandardMaterial color="#1e1b4b" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-indigo-900 text-white px-1 py-0.5 rounded text-xs font-bold">UV</div></Html></group></ClickableObject>

      {uvOn && <Html position={[0, 0.35, 0]} center><div className="bg-indigo-900 text-white p-2 rounded text-xs"><div className="font-bold text-orange-400">🧬 Resultat</div><div>Piste 1: 3 bandes</div><div>Piste 2: 2 bandes</div><div>Piste 3: 3 bandes</div><div>Piste 4: 1 bande</div></div></Html>}
      
    </group>
  )
}

function MicroscopyExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary }) {
  const { slidePrep, stainApplied, coverOn, positioned, focus10, focus40 } = state
  
  const handleAction = (a) => {
    if (a === "slide" && selectedItem === "slide") { setState(p => ({ ...p, slidePrep: true })); setSelectedItem(null); setStep(1); toast.success("🔬 Lame preparee!") }
    else if (a === "stain" && selectedItem === "stain") { setState(p => ({ ...p, stainApplied: true })); setSelectedItem(null); setStep(2); toast.success("🎨 Coloration Gram!") }
    else if (a === "cover" && selectedItem === "cover") { setState(p => ({ ...p, coverOn: true })); setSelectedItem(null); setStep(3); toast.success("📋 Lamelle placee!") }
    else if (a === "position" && selectedItem === "position") { setState(p => ({ ...p, positioned: true })); setSelectedItem(null); setStep(4); toast.success("🎯 Positionne!") }
    else if (a === "x10" && selectedItem === "x10") { setState(p => ({ ...p, focus10: true })); setSelectedItem(null); setStep(5); toast.success("🔍 Focus x10!") }
    else if (a === "x40" && selectedItem === "x40") { setState(p => ({ ...p, focus40: true })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("🔬 Focus x40!") }
  }

  return (
    <group>
      {/* Advanced Microscope */}
      <group position={[0.15, 0, -0.1]}>
        <mesh position={[0, 0.04, 0]}><boxGeometry args={[0.28, 0.06, 0.22]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
        <mesh position={[-0.1, 0.25, 0]}><boxGeometry args={[0.06, 0.4, 0.06]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
        <mesh position={[0.02, 0.45, 0]} rotation={[0.5, 0, 0]}><cylinderGeometry args={[0.04, 0.05, 0.16, 16]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
        <mesh position={[0.02, 0.12, 0]}><boxGeometry args={[0.2, 0.02, 0.18]} /><meshStandardMaterial color="#3a3a3a" /></mesh>
        {/* Objective turret */}
        <group position={[0.02, 0.18, 0]}>
          <mesh><cylinderGeometry args={[0.04, 0.04, 0.03, 16]} /><meshStandardMaterial color="#333" /></mesh>
          <mesh position={[0, -0.04, 0]}><cylinderGeometry args={[0.015, 0.012, 0.05, 16]} /><meshStandardMaterial color="#444" /></mesh>
        </group>
        {/* Light source */}
        <mesh position={[0.02, 0.01, 0]}><cylinderGeometry args={[0.03, 0.03, 0.02, 16]} /><meshStandardMaterial color="#fff" emissive={positioned ? "#ffffcc" : "#000"} emissiveIntensity={0.5} /></mesh>
        {coverOn && positioned && <mesh position={[0.02, 0.13, 0]}><boxGeometry args={[0.075, 0.003, 0.026]} /><meshPhysicalMaterial color="#aaddff" transparent opacity={0.5} /></mesh>}
      </group>

      {/* Microscope view */}
      {focus10 && <Html position={[0.17, 0.55, 0]} center>
        <div className="bg-white rounded-full w-20 h-20 border-4 border-gray-800 flex items-center justify-center overflow-hidden">
          {focus40 ? (
            <div className="relative w-full h-full bg-purple-50">
              <div className="absolute w-3 h-5 bg-purple-600 rounded-full top-2 left-2"></div>
              <div className="absolute w-4 h-3 bg-pink-400 rounded-full top-8 left-6"></div>
              <div className="absolute w-3 h-4 bg-purple-600 rounded-full top-4 left-12"></div>
              <div className="absolute w-2 h-4 bg-pink-400 rounded-full top-10 left-3"></div>
              <div className="absolute w-3 h-2 bg-purple-600 rounded-full top-12 left-10"></div>
            </div>
          ) : <div className="text-purple-300 text-3xl">•••</div>}
        </div>
      </Html>}

      <TargetZone position={[-0.2, 0.1, 0]} label="🔬 Lame" active={selectedItem === "slide"} onClick={() => handleAction("slide")} />
      <TargetZone position={[-0.2, 0.17, 0]} label="🎨 Gram" active={selectedItem === "stain" && slidePrep} onClick={() => handleAction("stain")} />
      <TargetZone position={[-0.2, 0.24, 0]} label="📋 Lamelle" active={selectedItem === "cover" && stainApplied} onClick={() => handleAction("cover")} />
      <TargetZone position={[0.17, 0.15, 0]} label="🎯 Placer" active={selectedItem === "position" && coverOn} onClick={() => handleAction("position")} />
      <TargetZone position={[0.17, 0.22, 0]} label="🔍 x10" active={selectedItem === "x10" && positioned} onClick={() => handleAction("x10")} />
      <TargetZone position={[0.17, 0.29, 0]} label="🔬 x40" active={selectedItem === "x40" && focus10} onClick={() => handleAction("x40")} />

      <ClickableObject position={[-0.45, 0.06, 0.3]} selected={selectedItem === "slide"} enabled={!slidePrep} onClick={() => setSelectedItem("slide")}><group><mesh><boxGeometry args={[0.075, 0.004, 0.026]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.4} /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-white px-1 py-0.5 rounded text-xs font-bold shadow">Lame</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.25, 0.06, 0.3]} selected={selectedItem === "stain"} enabled={slidePrep && !stainApplied} onClick={() => setSelectedItem("stain")}><group><mesh><cylinderGeometry args={[0.015, 0.015, 0.05, 16]} /><meshStandardMaterial color="#8b5cf6" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-purple-500 text-white px-1 py-0.5 rounded text-xs font-bold">Gram</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.05, 0.06, 0.3]} selected={selectedItem === "cover"} enabled={stainApplied && !coverOn} onClick={() => setSelectedItem("cover")}><group><mesh><boxGeometry args={[0.025, 0.002, 0.025]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.3} /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-200 px-1 py-0.5 rounded text-xs font-bold">Lamelle</div></Html></group></ClickableObject>
      <ClickableObject position={[0.15, 0.06, 0.3]} selected={selectedItem === "position"} enabled={coverOn && !positioned} onClick={() => setSelectedItem("position")}><group><mesh><boxGeometry args={[0.04, 0.02, 0.04]} /><meshStandardMaterial color="#22c55e" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-green-500 text-white px-1 py-0.5 rounded text-xs font-bold">Placer</div></Html></group></ClickableObject>
      <ClickableObject position={[0.35, 0.06, 0.3]} selected={selectedItem === "x10"} enabled={positioned && !focus10} onClick={() => setSelectedItem("x10")}><group><mesh><cylinderGeometry args={[0.02, 0.02, 0.03, 16]} /><meshStandardMaterial color="#666" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-600 text-white px-1 py-0.5 rounded text-xs font-bold">x10</div></Html></group></ClickableObject>
      <ClickableObject position={[0.5, 0.06, 0.3]} selected={selectedItem === "x40"} enabled={focus10 && !focus40} onClick={() => setSelectedItem("x40")}><group><mesh><cylinderGeometry args={[0.015, 0.015, 0.04, 16]} /><meshStandardMaterial color="#444" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-800 text-white px-1 py-0.5 rounded text-xs font-bold">x40</div></Html></group></ClickableObject>

      {focus40 && <Html position={[-0.35, 0.35, 0]} center><div className="bg-purple-900 text-white p-2 rounded text-xs"><div className="font-bold">Coloration Gram</div><div className="text-purple-300">Violet = Gram+</div><div className="text-pink-300">Rose = Gram-</div></div></Html>}
      
    </group>
  )
}

function DoubleSlitExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { laserOn, slitsAligned, screenPlaced, fringesVisible } = state
  
  const handleAction = (a) => {
    if (a === "laser" && selectedItem === "laser") { 
      setState(p => ({ ...p, laserOn: true })); setSelectedItem(null); setStep(1); toast.success("Laser allume!") 
    }
    else if (a === "slits" && selectedItem === "slits") { 
      setState(p => ({ ...p, slitsAligned: true })); setSelectedItem(null); setStep(2); toast.success("Fentes alignees!") 
    }
    else if (a === "screen" && selectedItem === "screen") { 
      setState(p => ({ ...p, screenPlaced: true })); setSelectedItem(null); setStep(3); toast.success("Ecran place!") 
    }
    else if (a === "observe" && screenPlaced) { 
      setState(p => ({ ...p, fringesVisible: true })); setStep(experiment.steps.length - 1); toast.success("Franges visibles!") 
    }
  }

  return (
    <group>
      <group position={[-0.4, 0.1, 0]}>
        <mesh><boxGeometry args={[0.12, 0.06, 0.06]} /><meshStandardMaterial color="#333" /></mesh>
        {laserOn && <mesh position={[0.3, 0, 0]}><boxGeometry args={[0.5, 0.008, 0.008]} /><meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} /></mesh>}
      </group>
      
      {slitsAligned && <group position={[0, 0.1, 0]}>
        <mesh><boxGeometry args={[0.02, 0.15, 0.08]} /><meshStandardMaterial color="#222" /></mesh>
      </group>}
      
      {screenPlaced && <group position={[0.4, 0.1, 0]}>
        <mesh><boxGeometry args={[0.02, 0.2, 0.15]} /><meshStandardMaterial color="#fff" /></mesh>
        {fringesVisible && <Html position={[0.02, 0, 0]} center>
          <div className="flex space-x-1">
            {[...Array(7)].map((_, i) => <div key={i} className={`w-1 h-12 ${i % 2 === 0 ? 'bg-red-500' : 'bg-red-900'}`} style={{opacity: 1 - Math.abs(i-3)*0.2}}></div>)}
          </div>
        </Html>}
      </group>}

      <TargetZone position={[-0.4, 0.15, 0]} label="Laser" active={selectedItem === "laser"} onClick={() => handleAction("laser")} />
      <TargetZone position={[0, 0.2, 0]} label="Fentes" active={selectedItem === "slits" && laserOn} onClick={() => handleAction("slits")} />
      <TargetZone position={[0.4, 0.2, 0]} label="Ecran" active={selectedItem === "screen" && slitsAligned} onClick={() => handleAction("screen")} />
      <TargetZone position={[0.4, 0.3, 0]} label="Observer" active={screenPlaced && !fringesVisible} onClick={() => handleAction("observe")} />

      <ClickableObject position={[-0.4, 0.05, 0.3]} selected={selectedItem === "laser"} enabled={!laserOn} onClick={() => setSelectedItem("laser")}>
        <group><mesh><boxGeometry args={[0.08, 0.04, 0.04]} /><meshStandardMaterial color="#aa0000" /></mesh>
        <Html position={[0, 0.04, 0]} center><div className="bg-red-600 text-white px-1 rounded text-xs">Laser</div></Html></group>
      </ClickableObject>
      <ClickableObject position={[-0.15, 0.05, 0.3]} selected={selectedItem === "slits"} enabled={laserOn && !slitsAligned} onClick={() => setSelectedItem("slits")}>
        <group><mesh><boxGeometry args={[0.02, 0.08, 0.04]} /><meshStandardMaterial color="#333" /></mesh>
        <Html position={[0, 0.06, 0]} center><div className="bg-gray-700 text-white px-1 rounded text-xs">Fentes</div></Html></group>
      </ClickableObject>
      <ClickableObject position={[0.15, 0.05, 0.3]} selected={selectedItem === "screen"} enabled={slitsAligned && !screenPlaced} onClick={() => setSelectedItem("screen")}>
        <group><mesh><boxGeometry args={[0.02, 0.1, 0.08]} /><meshStandardMaterial color="#eee" /></mesh>
        <Html position={[0, 0.07, 0]} center><div className="bg-gray-200 px-1 rounded text-xs">Ecran</div></Html></group>
      </ClickableObject>

      {fringesVisible && <Html position={[0, 0.4, 0]} center><div className="bg-purple-900 text-white p-2 rounded text-xs">
        <div className="font-bold">Interference</div><div>i = lambda * D / a</div></div></Html>}
      
    </group>
  )
}

function RLCCircuitExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { rConnected, lConnected, cConnected, gbfConnected, oscilloConnected, resonanceFound } = state
  const [frequency, setFrequency] = useState(500)
  
  const handleAction = (a) => {
    if (a === "R" && selectedItem === "R") { setState(p => ({ ...p, rConnected: true })); setSelectedItem(null); setStep(1); toast.success("R connecte!") }
    else if (a === "L" && selectedItem === "L") { setState(p => ({ ...p, lConnected: true })); setSelectedItem(null); setStep(2); toast.success("L connecte!") }
    else if (a === "C" && selectedItem === "C") { setState(p => ({ ...p, cConnected: true })); setSelectedItem(null); setStep(3); toast.success("C connecte!") }
    else if (a === "gbf" && selectedItem === "gbf") { setState(p => ({ ...p, gbfConnected: true })); setSelectedItem(null); setStep(4); toast.success("GBF connecte!") }
    else if (a === "oscillo" && selectedItem === "oscillo") { setState(p => ({ ...p, oscilloConnected: true })); setSelectedItem(null); setStep(5); toast.success("Oscillo connecte!") }
    else if (a === "resonance" && frequency > 950 && frequency < 1050) { setState(p => ({ ...p, resonanceFound: true })); setStep(experiment.steps.length - 1); toast.success("Resonance a f0!") }
  }

  return (
    <group>
      <group position={[-0.3, 0.08, -0.1]}>
        <mesh><boxGeometry args={[0.2, 0.12, 0.15]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
        <Html position={[0, 0.03, 0.08]} center><div className="bg-black text-green-400 px-2 py-1 font-mono text-xs">{frequency} Hz</div></Html>
      </group>
      
      <group position={[0.3, 0.08, -0.1]}>
        <mesh><boxGeometry args={[0.22, 0.15, 0.12]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
        {oscilloConnected && <Html position={[0, 0.02, 0.07]} center>
          <div className="bg-black w-16 h-10 flex items-center justify-center">
            <svg width="50" height="30"><path d={`M0,15 Q12,${resonanceFound ? 0 : 10} 25,15 T50,15`} fill="none" stroke="#00ff00" strokeWidth="2"/></svg>
          </div>
        </Html>}
      </group>

      <group position={[0, 0.06, 0]}>
        {rConnected && <mesh position={[-0.12, 0, 0]}><boxGeometry args={[0.06, 0.025, 0.025]} /><meshStandardMaterial color="#8B4513" /></mesh>}
        {lConnected && <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 0.06, 16]} rotation={[0, 0, Math.PI/2]} /><meshStandardMaterial color="#cd7f32" /></mesh>}
        {cConnected && <mesh position={[0.12, 0, 0]}><cylinderGeometry args={[0.025, 0.025, 0.015, 16]} /><meshStandardMaterial color="#4169e1" /></mesh>}
      </group>

      {oscilloConnected && <Html position={[0, 0.25, 0.2]} center>
        <input type="range" min="100" max="2000" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} className="w-32" />
      </Html>}

      <TargetZone position={[-0.12, 0.12, 0]} label="R" active={selectedItem === "R"} onClick={() => handleAction("R")} />
      <TargetZone position={[0, 0.12, 0]} label="L" active={selectedItem === "L" && rConnected} onClick={() => handleAction("L")} />
      <TargetZone position={[0.12, 0.12, 0]} label="C" active={selectedItem === "C" && lConnected} onClick={() => handleAction("C")} />
      <TargetZone position={[-0.3, 0.18, -0.1]} label="GBF" active={selectedItem === "gbf" && cConnected} onClick={() => handleAction("gbf")} />
      <TargetZone position={[0.3, 0.2, -0.1]} label="Oscillo" active={selectedItem === "oscillo" && gbfConnected} onClick={() => handleAction("oscillo")} />
      {oscilloConnected && <TargetZone position={[0, 0.35, 0]} label="f0?" active={!resonanceFound} onClick={() => handleAction("resonance")} />}

      <ClickableObject position={[-0.4, 0.05, 0.3]} selected={selectedItem === "R"} enabled={!rConnected} onClick={() => setSelectedItem("R")}><group><mesh><boxGeometry args={[0.05, 0.02, 0.02]} /><meshStandardMaterial color="#8B4513" /></mesh><Html position={[0, 0.03, 0]} center><div className="bg-orange-800 text-white px-1 rounded text-xs">R</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.2, 0.05, 0.3]} selected={selectedItem === "L"} enabled={rConnected && !lConnected} onClick={() => setSelectedItem("L")}><group><mesh><cylinderGeometry args={[0.015, 0.015, 0.04, 16]} rotation={[0, 0, Math.PI/2]} /><meshStandardMaterial color="#cd7f32" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-yellow-700 text-white px-1 rounded text-xs">L</div></Html></group></ClickableObject>
      <ClickableObject position={[0, 0.05, 0.3]} selected={selectedItem === "C"} enabled={lConnected && !cConnected} onClick={() => setSelectedItem("C")}><group><mesh><cylinderGeometry args={[0.02, 0.02, 0.015, 16]} /><meshStandardMaterial color="#4169e1" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-blue-600 text-white px-1 rounded text-xs">C</div></Html></group></ClickableObject>
      <ClickableObject position={[0.2, 0.05, 0.3]} selected={selectedItem === "gbf"} enabled={cConnected && !gbfConnected} onClick={() => setSelectedItem("gbf")}><group><mesh><boxGeometry args={[0.06, 0.04, 0.04]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-700 text-white px-1 rounded text-xs">GBF</div></Html></group></ClickableObject>
      <ClickableObject position={[0.4, 0.05, 0.3]} selected={selectedItem === "oscillo"} enabled={gbfConnected && !oscilloConnected} onClick={() => setSelectedItem("oscillo")}><group><mesh><boxGeometry args={[0.07, 0.05, 0.04]} /><meshStandardMaterial color="#2a2a2a" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-gray-800 text-white px-1 rounded text-xs">Oscillo</div></Html></group></ClickableObject>

      {resonanceFound && <Html position={[0, 0.45, 0]} center><div className="bg-blue-900 text-white p-2 rounded text-xs"><div className="font-bold">Resonance!</div><div>f0 = 1/(2pi*sqrt(LC))</div><div>f0 = 1000 Hz</div></div></Html>}
      
    </group>
  )
}

function PhotoelectricExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { cathodePlaced, circuitConnected, lightOn, frequencyVarying, currentMeasured, thresholdFound } = state
  const [freq, setFreq] = useState(300)
  const [current, setCurrent] = useState(0)
  const threshold = 500
  
  useEffect(() => {
    if (lightOn && frequencyVarying) {
      setCurrent(freq > threshold ? Math.floor((freq - threshold) * 0.1) : 0)
    }
  }, [freq, lightOn, frequencyVarying])

  const handleAction = (a) => {
    if (a === "cathode" && selectedItem === "cathode") { setState(p => ({ ...p, cathodePlaced: true })); setSelectedItem(null); setStep(1); toast.success("Cathode placee!") }
    else if (a === "circuit" && selectedItem === "circuit") { setState(p => ({ ...p, circuitConnected: true })); setSelectedItem(null); setStep(2); toast.success("Circuit connecte!") }
    else if (a === "light" && selectedItem === "light") { setState(p => ({ ...p, lightOn: true })); setSelectedItem(null); setStep(3); toast.success("Lumiere allumee!") }
    else if (a === "vary" && lightOn) { setState(p => ({ ...p, frequencyVarying: true })); setStep(4); toast.success("Variez la frequence!") }
    else if (a === "measure" && frequencyVarying) { setState(p => ({ ...p, currentMeasured: true })); setStep(5); toast.success("Courant mesure!") }
    else if (a === "threshold" && current === 0 && freq < threshold + 50 && freq > threshold - 50) { setState(p => ({ ...p, thresholdFound: true })); setStep(experiment.steps.length - 1); toast.success("Seuil trouve!") }
  }

  return (
    <group>
      <group position={[0, 0.08, -0.1]}>
        <mesh><cylinderGeometry args={[0.1, 0.1, 0.15, 32, 1, true]} /><meshPhysicalMaterial color="#aaa" transparent opacity={0.3} side={THREE.DoubleSide} /></mesh>
        {cathodePlaced && <mesh position={[-0.05, 0, 0]}><boxGeometry args={[0.04, 0.08, 0.08]} /><meshStandardMaterial color="#666" metalness={0.8} /></mesh>}
        {lightOn && <pointLight position={[-0.2, 0.1, 0]} color={freq > 600 ? "#8800ff" : freq > 500 ? "#0044ff" : "#00ff00"} intensity={1} distance={0.5} />}
      </group>

      {circuitConnected && <group position={[0.3, 0.06, -0.1]}>
        <mesh><boxGeometry args={[0.1, 0.06, 0.06]} /><meshStandardMaterial color="#222" /></mesh>
        <Html position={[0, 0.02, 0.04]} center><div className="bg-black text-green-400 font-mono text-xs px-1">{current} uA</div></Html>
      </group>}

      {frequencyVarying && <Html position={[0, 0.3, 0.2]} center>
        <div className="bg-white p-2 rounded shadow">
          <div className="text-xs mb-1">f: {freq} THz</div>
          <input type="range" min="200" max="800" value={freq} onChange={(e) => setFreq(Number(e.target.value))} className="w-24" />
        </div>
      </Html>}

      <TargetZone position={[-0.05, 0.15, -0.1]} label="Cathode" active={selectedItem === "cathode"} onClick={() => handleAction("cathode")} />
      <TargetZone position={[0.3, 0.12, -0.1]} label="Circuit" active={selectedItem === "circuit" && cathodePlaced} onClick={() => handleAction("circuit")} />
      <TargetZone position={[-0.25, 0.15, -0.1]} label="Lumiere" active={selectedItem === "light" && circuitConnected} onClick={() => handleAction("light")} />
      {lightOn && <TargetZone position={[0, 0.22, 0]} label="Varier f" active={!frequencyVarying} onClick={() => handleAction("vary")} />}
      {frequencyVarying && <TargetZone position={[0.3, 0.18, -0.1]} label="Mesurer I" active={!currentMeasured} onClick={() => handleAction("measure")} />}
      {currentMeasured && current === 0 && <TargetZone position={[0, 0.4, 0]} label="Seuil?" active={!thresholdFound} onClick={() => handleAction("threshold")} />}

      <ClickableObject position={[-0.4, 0.05, 0.3]} selected={selectedItem === "cathode"} enabled={!cathodePlaced} onClick={() => setSelectedItem("cathode")}><group><mesh><boxGeometry args={[0.03, 0.05, 0.05]} /><meshStandardMaterial color="#888" metalness={0.8} /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-gray-500 text-white px-1 rounded text-xs">Zn</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.15, 0.05, 0.3]} selected={selectedItem === "circuit"} enabled={cathodePlaced && !circuitConnected} onClick={() => setSelectedItem("circuit")}><group><mesh><boxGeometry args={[0.05, 0.03, 0.03]} /><meshStandardMaterial color="#222" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-800 text-white px-1 rounded text-xs">Ampere</div></Html></group></ClickableObject>
      <ClickableObject position={[0.1, 0.05, 0.3]} selected={selectedItem === "light"} enabled={circuitConnected && !lightOn} onClick={() => setSelectedItem("light")}><group><mesh><sphereGeometry args={[0.025, 16, 16]} /><meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-yellow-400 px-1 rounded text-xs">UV</div></Html></group></ClickableObject>

      {thresholdFound && <Html position={[0, 0.5, 0]} center><div className="bg-indigo-900 text-white p-2 rounded text-xs"><div className="font-bold">Effet photoelectrique</div><div>f0 = {threshold} THz</div><div>E = h*f - W</div></div></Html>}
      
    </group>
  )
}

function GalvanicCellExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { znPlaced, cuPlaced, saltBridgeConnected, voltmeterConnected, emfMeasured } = state

  const handleAction = (a) => {
    if (a === "zn" && selectedItem === "zn") { setState(p => ({ ...p, znPlaced: true })); setSelectedItem(null); setStep(1); toast.success("Zn place!") }
    else if (a === "cu" && selectedItem === "cu") { setState(p => ({ ...p, cuPlaced: true })); setSelectedItem(null); setStep(2); toast.success("Cu place!") }
    else if (a === "bridge" && selectedItem === "bridge") { setState(p => ({ ...p, saltBridgeConnected: true })); setSelectedItem(null); setStep(3); toast.success("Pont salin!") }
    else if (a === "voltmeter" && selectedItem === "voltmeter") { setState(p => ({ ...p, voltmeterConnected: true })); setSelectedItem(null); setStep(4); toast.success("Voltmetre connecte!") }
    else if (a === "measure" && voltmeterConnected) { setState(p => ({ ...p, emfMeasured: true })); setStep(experiment.steps.length - 1); toast.success("E = 1.10 V!") }
  }

  return (
    <group>
      <group position={[-0.15, 0.05, -0.1]}>
        <mesh><cylinderGeometry args={[0.06, 0.06, 0.1, 32]} /><meshPhysicalMaterial color="#add8e6" transparent opacity={0.5} /></mesh>
        {znPlaced && <mesh position={[0, 0, 0]}><boxGeometry args={[0.03, 0.12, 0.01]} /><meshStandardMaterial color="#a0a0a0" metalness={0.9} /></mesh>}
        <Html position={[0, -0.08, 0]} center><div className="text-xs bg-blue-100 px-1 rounded">ZnSO4</div></Html>
      </group>

      <group position={[0.15, 0.05, -0.1]}>
        <mesh><cylinderGeometry args={[0.06, 0.06, 0.1, 32]} /><meshPhysicalMaterial color="#87CEEB" transparent opacity={0.5} /></mesh>
        {cuPlaced && <mesh position={[0, 0, 0]}><boxGeometry args={[0.03, 0.12, 0.01]} /><meshStandardMaterial color="#b87333" metalness={0.9} /></mesh>}
        <Html position={[0, -0.08, 0]} center><div className="text-xs bg-blue-100 px-1 rounded">CuSO4</div></Html>
      </group>

      {saltBridgeConnected && <mesh position={[0, 0.08, -0.1]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.015, 0.015, 0.25, 16]} /><meshStandardMaterial color="#f5f5dc" /></mesh>}

      {voltmeterConnected && <group position={[0, 0.2, -0.1]}>
        <mesh><boxGeometry args={[0.1, 0.06, 0.04]} /><meshStandardMaterial color="#222" /></mesh>
        <Html position={[0, 0, 0.03]} center><div className="bg-black text-green-400 font-mono text-xs">{emfMeasured ? '1.10' : '0.00'} V</div></Html>
      </group>}

      <TargetZone position={[-0.15, 0.12, -0.1]} label="Zn" active={selectedItem === "zn"} onClick={() => handleAction("zn")} />
      <TargetZone position={[0.15, 0.12, -0.1]} label="Cu" active={selectedItem === "cu" && znPlaced} onClick={() => handleAction("cu")} />
      <TargetZone position={[0, 0.15, -0.1]} label="Pont" active={selectedItem === "bridge" && cuPlaced} onClick={() => handleAction("bridge")} />
      <TargetZone position={[0, 0.22, -0.1]} label="Voltmetre" active={selectedItem === "voltmeter" && saltBridgeConnected} onClick={() => handleAction("voltmeter")} />
      {voltmeterConnected && <TargetZone position={[0, 0.28, -0.1]} label="Mesurer E" active={!emfMeasured} onClick={() => handleAction("measure")} />}

      <ClickableObject position={[-0.4, 0.05, 0.3]} selected={selectedItem === "zn"} enabled={!znPlaced} onClick={() => setSelectedItem("zn")}><group><mesh><boxGeometry args={[0.025, 0.06, 0.008]} /><meshStandardMaterial color="#a0a0a0" metalness={0.9} /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-gray-400 px-1 rounded text-xs">Zn</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.2, 0.05, 0.3]} selected={selectedItem === "cu"} enabled={znPlaced && !cuPlaced} onClick={() => setSelectedItem("cu")}><group><mesh><boxGeometry args={[0.025, 0.06, 0.008]} /><meshStandardMaterial color="#b87333" metalness={0.9} /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-orange-600 text-white px-1 rounded text-xs">Cu</div></Html></group></ClickableObject>
      <ClickableObject position={[0, 0.05, 0.3]} selected={selectedItem === "bridge"} enabled={cuPlaced && !saltBridgeConnected} onClick={() => setSelectedItem("bridge")}><group><mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.01, 0.01, 0.08, 16]} /><meshStandardMaterial color="#f5f5dc" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-yellow-100 px-1 rounded text-xs">KNO3</div></Html></group></ClickableObject>
      <ClickableObject position={[0.2, 0.05, 0.3]} selected={selectedItem === "voltmeter"} enabled={saltBridgeConnected && !voltmeterConnected} onClick={() => setSelectedItem("voltmeter")}><group><mesh><boxGeometry args={[0.05, 0.03, 0.02]} /><meshStandardMaterial color="#222" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-800 text-white px-1 rounded text-xs">V</div></Html></group></ClickableObject>

      {emfMeasured && <Html position={[0, 0.4, 0]} center><div className="bg-orange-900 text-white p-2 rounded text-xs"><div className="font-bold">Pile Daniell</div><div>E = E(Cu) - E(Zn)</div><div>E = 0.34 - (-0.76) = 1.10 V</div></div></Html>}
      
    </group>
  )
}

function ChromatographyExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { extractReady, sampleDeposited, eluantAdded, migrating, rfCalculated } = state
  const [migrationProgress, setMigrationProgress] = useState(0)

  useEffect(() => {
    if (migrating && migrationProgress < 100) {
      const timer = setTimeout(() => setMigrationProgress(p => p + 5), 200)
      return () => clearTimeout(timer)
    }
    if (migrationProgress >= 100 && migrating) {
      setState(p => ({ ...p, migrating: false }))
      toast.success("Migration terminee!")
      setStep(4)
    }
  }, [migrating, migrationProgress])

  const handleAction = (a) => {
    if (a === "extract" && selectedItem === "extract") { setState(p => ({ ...p, extractReady: true })); setSelectedItem(null); setStep(1); toast.success("Extrait pret!") }
    else if (a === "deposit" && selectedItem === "deposit") { setState(p => ({ ...p, sampleDeposited: true })); setSelectedItem(null); setStep(2); toast.success("Echantillon depose!") }
    else if (a === "eluant" && selectedItem === "eluant") { setState(p => ({ ...p, eluantAdded: true, migrating: true })); setSelectedItem(null); setStep(3); toast.success("Migration!") }
    else if (a === "calculate" && !migrating && migrationProgress >= 100) { setState(p => ({ ...p, rfCalculated: true })); setStep(experiment.steps.length - 1); toast.success("Rf calcule!") }
  }

  return (
    <group>
      <group position={[0, 0.08, -0.1]}>
        <mesh><cylinderGeometry args={[0.08, 0.08, 0.18, 32, 1, true]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.3} side={THREE.DoubleSide} /></mesh>
        {eluantAdded && <mesh position={[0, -0.07, 0]}><cylinderGeometry args={[0.075, 0.075, 0.03, 32]} /><meshStandardMaterial color="#a8d8ea" transparent opacity={0.6} /></mesh>}
        
        <mesh position={[0, 0, 0.02]}><boxGeometry args={[0.06, 0.15, 0.003]} /><meshStandardMaterial color="#f5f5f5" /></mesh>
        
        {sampleDeposited && <mesh position={[0, -0.05, 0.025]}><sphereGeometry args={[0.008, 16, 16]} /><meshStandardMaterial color="#228B22" /></mesh>}
        
        {migrating && migrationProgress > 0 && <group position={[0, -0.05 + migrationProgress * 0.001, 0.025]}>
          <mesh position={[-0.012, 0, 0]}><sphereGeometry args={[0.006, 8, 8]} /><meshStandardMaterial color="#ffff00" /></mesh>
          <mesh position={[0, migrationProgress * 0.0005, 0]}><sphereGeometry args={[0.006, 8, 8]} /><meshStandardMaterial color="#228B22" /></mesh>
          <mesh position={[0.012, migrationProgress * 0.0008, 0]}><sphereGeometry args={[0.005, 8, 8]} /><meshStandardMaterial color="#ff6600" /></mesh>
        </group>}
      </group>

      {migrating && <Html position={[0.15, 0.1, 0]} center><div className="bg-blue-500 text-white px-2 py-1 rounded text-xs animate-pulse">{migrationProgress}%</div></Html>}

      <TargetZone position={[-0.2, 0.1, 0]} label="Extrait" active={selectedItem === "extract"} onClick={() => handleAction("extract")} />
      <TargetZone position={[0, 0.05, 0]} label="Deposer" active={selectedItem === "deposit" && extractReady} onClick={() => handleAction("deposit")} />
      <TargetZone position={[0, 0.18, 0]} label="Eluant" active={selectedItem === "eluant" && sampleDeposited} onClick={() => handleAction("eluant")} />
      {!migrating && migrationProgress >= 100 && <TargetZone position={[0.2, 0.15, 0]} label="Calculer Rf" active={!rfCalculated} onClick={() => handleAction("calculate")} />}

      <ClickableObject position={[-0.4, 0.05, 0.3]} selected={selectedItem === "extract"} enabled={!extractReady} onClick={() => setSelectedItem("extract")}><group><mesh><cylinderGeometry args={[0.015, 0.015, 0.05, 16]} /><meshStandardMaterial color="#228B22" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-green-600 text-white px-1 rounded text-xs">Extrait</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.15, 0.05, 0.3]} selected={selectedItem === "deposit"} enabled={extractReady && !sampleDeposited} onClick={() => setSelectedItem("deposit")}><group><mesh><cylinderGeometry args={[0.008, 0.003, 0.04, 16]} /><meshStandardMaterial color="#666" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-600 text-white px-1 rounded text-xs">Pipette</div></Html></group></ClickableObject>
      <ClickableObject position={[0.1, 0.05, 0.3]} selected={selectedItem === "eluant"} enabled={sampleDeposited && !eluantAdded} onClick={() => setSelectedItem("eluant")}><group><mesh><cylinderGeometry args={[0.02, 0.02, 0.06, 16]} /><meshStandardMaterial color="#a8d8ea" transparent opacity={0.7} /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-blue-300 px-1 rounded text-xs">Eluant</div></Html></group></ClickableObject>

      {rfCalculated && <Html position={[0, 0.35, 0]} center><div className="bg-green-900 text-white p-2 rounded text-xs"><div className="font-bold">Resultats CCM</div><div>Jaune: Rf = 0.85</div><div>Vert: Rf = 0.65</div><div>Orange: Rf = 0.45</div></div></Html>}
      
    </group>
  )
}

// Placeholder for other experiments - they'll show "en construction" message
function PlaceholderExperiment({ name }) {
  return (
    <group>
      <Html position={[0, 0.3, 0]} center>
        <div className="bg-yellow-500 text-black px-4 py-3 rounded-lg text-center">
          <div className="text-2xl mb-2">🚧</div>
          <div className="font-bold">{name}</div>
          <div className="text-sm">En construction...</div>
        </div>
      </Html>
    </group>
  )
}

// ============ SUMMARY MODAL ============
function ExperimentSummaryModal({ experiment, onClose, onRetry }) {
  if (!experiment) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
          <h2 className="text-xl font-bold">Experience Terminee!</h2>
          <p className="text-green-100">{experiment.name}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{experiment.classe || experiment.level}</span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">{experiment.chapter || 'Sciences'}</span>
          </div>
          {experiment.learned && <div><h3 className="font-bold mb-2">Ce que tu as appris</h3><ul className="space-y-1">{experiment.learned.map((item, i) => <li key={i} className="text-gray-600 text-sm">{item}</li>)}</ul></div>}
          {experiment.formulas && <div><h3 className="font-bold mb-2">Formules</h3><div className="bg-gray-50 p-3 rounded">{experiment.formulas.map((f, i) => <code key={i} className="block text-blue-600">{f}</code>)}</div></div>}
          {experiment.realLife && <div><h3 className="font-bold mb-2">Vie reelle</h3><ul>{experiment.realLife.map((item, i) => <li key={i} className="text-gray-600 text-sm">{item}</li>)}</ul></div>}
          {experiment.bacQuestions && <div><h3 className="font-bold mb-2">Questions BAC</h3><ul>{experiment.bacQuestions.map((q, i) => <li key={i} className="text-gray-600 text-sm italic">{q}</li>)}</ul></div>}
        </div>
        <div className="p-4 bg-gray-50 rounded-b-2xl flex justify-between">
          <button onClick={onRetry} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Refaire</button>
          <button onClick={onClose} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Terminer</button>
        </div>
      </div>
      {showSummary && (
        <ExperimentSummaryModal 
          experiment={experiment}
          onClose={() => { setShowSummary(false); setExperiment(null) }}
          onRetry={() => { setShowSummary(false); setStep(0); setExperimentState({}) }}
        />
      )}
    </div>
  )
}

// ============ MAIN PAGE ============

export default function ARLabPage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState(null)
  const [level, setLevel] = useState(null)
  const [experiment, setExperiment] = useState(null)

  if (!subject) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6"><button onClick={() => navigate(-1)} className="btn-secondary"><ArrowLeft size={20} /></button><div><h1 className="text-2xl font-bold">Laboratoire 3D</h1><p className="text-gray-600 text-sm">Experiences interactives en environnement realiste</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{id:"chemistry",icon:"🧪",name:"Chimie",color:"from-purple-50 to-pink-50"},{id:"physics",icon:"⚡",name:"Physique",color:"from-blue-50 to-cyan-50"},{id:"biology",icon:"🧬",name:"Biologie",color:"from-green-50 to-emerald-50"}].map(s => <div key={s.id} onClick={() => setSubject(s.id)} className={`card p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br ${s.color}`}><div className="text-4xl mb-3 text-center">{s.icon}</div><h2 className="text-xl font-bold text-center">{s.name}</h2></div>)}
      </div>
    </div>
  )

  if (!level) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6"><button onClick={() => setSubject(null)} className="btn-secondary"><ArrowLeft size={20} /></button><h1 className="text-xl font-bold">{subject === "chemistry" ? "🧪 Chimie" : subject === "physics" ? "⚡ Physique" : "🧬 Biologie"}</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div onClick={() => setLevel("lycee")} className="card p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-50"><School size={40} className="mx-auto mb-3 text-green-600" /><h2 className="text-xl font-bold text-center mb-1">Lycee</h2><p className="text-center text-gray-500 text-sm">{arLabService.getExperimentsByLevel(subject, "lycee").length} experiences</p></div>
        <div onClick={() => setLevel("universite")} className="card p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-purple-50 to-indigo-50"><GraduationCap size={40} className="mx-auto mb-3 text-purple-600" /><h2 className="text-xl font-bold text-center mb-1">Universite</h2><p className="text-center text-gray-500 text-sm">{arLabService.getExperimentsByLevel(subject, "universite").length} experiences</p></div>
      </div>
    </div>
  )

  if (!experiment) {
    const experiments = arLabService.getExperimentsByLevel(subject, level)
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4"><button onClick={() => setLevel(null)} className="btn-secondary"><ArrowLeft size={20} /></button><h1 className="text-lg font-bold">{level === "lycee" ? "📚 Lycee" : "🎓 Universite"}</h1></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {experiments.map(exp => <div key={exp.id} onClick={() => setExperiment(exp)} className="card p-4 cursor-pointer hover:shadow-lg hover:scale-102 transition-all"><div className="flex justify-between items-start mb-2"><h3 className="font-bold text-sm">{exp.name}</h3><span className={`px-1.5 py-0.5 rounded text-xs ${exp.difficulty === "Facile" ? "bg-green-100 text-green-700" : exp.difficulty === "Moyen" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{exp.difficulty}</span></div><p className="text-gray-600 text-xs mb-2">{exp.description}</p><button className="btn-primary w-full text-sm py-1.5"><PlayCircle size={14} className="inline mr-1" />Commencer</button></div>)}
        </div>
      </div>
    )
  }

  return <ExperimentView experiment={experiment} onBack={() => setExperiment(null)} />
}

function ExperimentView({ experiment, onBack }) {
  const [step, setStep] = useState(0)
  const [arMode, setArMode] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [stepsOpen, setStepsOpen] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const initialState = {
    hclVolume: 0, naohVolume: 0, indicatorAdded: false, pH: 1, color: "#ff6b6b", neutralized: false,
    bunsenLit: false, magnesiumBurning: false,
    batteryConnected: false, resistorConnected: false, bulbLit: false, current: 0,
    stringAttached: false, massAttached: false, swinging: false, period: 0,
    slideReady: false, stainAdded: false, coverslipOn: false, focusedLow: false, focusedHigh: false,
    plantReady: false, lightOn: false, bubblesVisible: false, darkCompared: false,
  }
  const [state, setState] = useState(initialState)

  const reset = () => { setState(initialState); setStep(0); setSelectedItem(null); toast.success("🔄 Reset!") }

  const startCamera = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); streamRef.current = stream; if (videoRef.current) videoRef.current.srcObject = stream; setArMode(true) } catch { toast.error("Camera indisponible") } }
  const stopCamera = () => { streamRef.current?.getTracks().forEach(t => t.stop()); setArMode(false) }
  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), [])

  const renderExperiment = () => {
    const props = { state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary }
    switch(experiment.id) {
      case "acid-base": return <AcidBaseExperiment {...props} />
      case "combustion": return <CombustionExperiment {...props} />
      case "simple-circuit": return <CircuitExperiment {...props} />
      case "pendulum": return <PendulumExperiment {...props} />
      case "cell-observation": return <CellObservationExperiment {...props} />
      case "photosynthesis": return <PhotosynthesisExperiment {...props} />
      case "gel-electrophoresis": return <GelElectrophoresisExperiment {...props} />
      case "microscopy": return <MicroscopyExperiment {...props} />
      case "enzyme-kinetics": return <EnzymeKineticsExperiment {...props} />
      case "double-slit": return <DoubleSlitExperiment {...props} />
      case "rlc-circuit": return <RLCCircuitExperiment {...props} />
      case "photoelectric": return <PhotoelectricExperiment {...props} />
      case "spectrophotometry": return <SpectrophotometryExperiment {...props} />
      case "galvanic-cell": return <GalvanicCellExperiment {...props} />
      case "chromatography": return <ChromatographyExperiment {...props} />
      default: return <PlaceholderExperiment name={experiment.name} />
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => { stopCamera(); onBack() }} className="btn-secondary p-2"><ArrowLeft size={18} /></button>
        <div className="flex-1 mx-2"><h2 className="text-sm font-bold leading-tight">{experiment.name}</h2><div className="text-xs text-gray-500">{step + 1}/{experiment.steps.length}</div></div>
        <div className="flex gap-1"><button onClick={reset} className="btn-secondary p-2"><RotateCcw size={16} /></button><button onClick={() => arMode ? stopCamera() : startCamera()} className={`p-2 rounded-lg ${arMode ? "bg-red-500 text-white" : "bg-gray-100"}`}>{arMode ? <X size={16} /> : <Camera size={16} />}</button></div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2 text-xs flex items-center gap-2"><Hand size={16} className="text-blue-600" /><span><b>1.</b> Cliquez objet <b>2.</b> Cliquez cible verte</span></div>
      {selectedItem && <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-2 mb-2 text-xs flex items-center justify-between"><span className="font-bold">✓ Selectionne → Cliquez cible!</span><button onClick={() => setSelectedItem(null)} className="font-bold text-yellow-700">✕</button></div>}
      
      <div className="flex-1 relative rounded-xl overflow-hidden shadow-xl">
        {arMode && <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />}
        <div className={`absolute inset-0 ${arMode ? "" : ""}`}>
          <Canvas 
            camera={{ position: [0, 2, 4], fov: 50 }} 
            gl={{ alpha: arMode }}
            shadows
          >
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 8, 5]} intensity={0.6} castShadow />
            
            {arMode ? (
              // Simple table for AR mode
              <group>
                <mesh position={[0, 0, 0]} receiveShadow>
                  <boxGeometry args={[1.4, 0.04, 1.1]} />
                  <meshStandardMaterial color="#5c4033" />
                </mesh>
                <group position={[0, 0.05, 0.1]}>
                  {renderExperiment()}
                </group>
              </group>
            ) : (
              // Full lab environment
              <FullLabEnvironment>
                {renderExperiment()}
              </FullLabEnvironment>
            )}
            
            <OrbitControls 
              enablePan={true} 
              minDistance={1.5} 
              maxDistance={8} 
              maxPolarAngle={Math.PI / 2.1}
              target={[0, 0.5, 0]}
            />
          </Canvas>
        </div>
        {arMode && <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />AR</div>}
        <StepsPanel steps={experiment.steps} currentStep={step} expanded={stepsOpen} onToggle={() => setStepsOpen(!stepsOpen)} isComplete={step >= experiment.steps.length - 1} experiment={experiment} />
      </div>
    </div>
  )
}
































































