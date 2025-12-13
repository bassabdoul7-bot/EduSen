import { useState, useEffect, useRef } from "react"
import { usePlan } from "../hooks/usePlan"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html, Environment, Line } from "@react-three/drei"
import { arLabService, calculatePH, getIndicatorColor, calculateCurrent, calculatePeriod } from "../services/arLab"
import toast from "react-hot-toast"
import { ArrowLeft, PlayCircle, Camera, X, List, ChevronDown, ChevronUp, Circle, CheckCircle, RotateCcw, MousePointer, Hand, GraduationCap, School } from "lucide-react"
import { useNavigate } from "react-router-dom"
import * as THREE from "three"
import { LabMascot } from "../components/LabMascot"
import { LabTutor } from "../components/LabTutor"
import { experimentRegistry } from '../components/ar/experimentRegistry'


// ============ LAB ENVIRONMENT ============

function LabRoom() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#8B7355" roughness={0.6} />
      </mesh>
      
      {/* Floor tiles pattern */}
      {[-5,-4,-3,-2,-1,0,1,2,3,4,5].map(i => (
        <group key={`tile-${i}`}>
          <mesh rotation={[-Math.PI/2,0,0]} position={[i, -0.49, 0]}>
            <planeGeometry args={[0.03, 12]} />
            <meshBasicMaterial color="#6B5344" />
          </mesh>
          <mesh rotation={[-Math.PI/2,0,0]} position={[0, -0.49, i]}>
            <planeGeometry args={[12, 0.03]} />
            <meshBasicMaterial color="#6B5344" />
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
      <Html position={[0, 1.05, 0.23]} center><div className="bg-yellow-500 text-black px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">?? PRODUITS CHIMIQUES</div></Html>
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
    safety: { title: "?? SECURITE LABO", color: "#dc2626", bg: "#fee2e2" },
    formula: { title: "?? FORMULES", color: "#059669", bg: "#d1fae5" },
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
      <Html position={[0, 1.7, 0.1]} center><div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">?? DOUCHE</div></Html>
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
      <Html position={[0, 0.14, 0.12]} center><div className="bg-green-700 text-white px-1 py-0.5 rounded text-xs font-bold">??? RINCE-OEIL</div></Html>
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
        <mesh key={i} position={[x, -0.28, z]}><boxGeometry args={[0.06, 0.55, 0.06]} /><meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} /></mesh>
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
        <meshStandardMaterial color="#e0e0e0" roughness={0.15} metalness={0.3} />
      </mesh>
      {/* Legs */}
      {[[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.45], [0.7, 0.45]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.28, z]}><boxGeometry args={[0.06, 0.55, 0.06]} /><meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} /></mesh>
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
      {!enabled && <Html position={[0,-0.05,0]} center><div className="bg-gray-400 text-white px-1 py-0.5 rounded text-xs">??</div></Html>}
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
            <div className="font-bold text-green-700">? Termine!</div>
            {experiment.materiel && <div><span className="font-semibold">?? Materiel:</span><ul className="ml-2">{experiment.materiel.map((m,i) => <li key={i} className="text-gray-500">{m}</li>)}</ul></div>}{experiment.learned && <div><span className="font-semibold">?? Appris:</span><ul className="ml-2">{experiment.learned.map((l,i) => <li key={i} className="text-gray-600">{l}</li>)}</ul></div>}
            {experiment.formulas && <div><span className="font-semibold">?? Formules:</span>{experiment.formulas.map((f,i) => <div key={i} className="text-blue-600 font-mono ml-2">{f}</div>)}</div>}
            {experiment.realLife && <div><span className="font-semibold">?? Vie reelle:</span><ul className="ml-2">{experiment.realLife.map((r,i) => <li key={i} className="text-gray-600">{r}</li>)}</ul></div>}
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
            <div className="font-bold text-green-700">?? Appris:</div>
            {experiment.learned.map((l,i) => <div key={i} className="text-gray-600">  {l}</div>)}
            {experiment.formulas && <div className="font-bold text-blue-700 mt-1">?? Formules:</div>}
            {experiment.formulas && experiment.formulas.map((f,i) => <div key={i} className="text-blue-600 font-mono">{f}</div>)}
            {experiment.realLife && <div className="font-bold text-yellow-700 mt-1">?? Vie reelle:</div>}
            {experiment.realLife && experiment.realLife.map((r,i) => <div key={i} className="text-gray-600">  {r}</div>)}
          </div>
        )}
      </div>
    </Html>
  )
}

// ============ EXPERIMENTS ============

function AcidBaseExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary, triggerMascotAction, grabbedItem }) {
  const { hclVolume, indicatorAdded, pH, color, neutralized } = state
  const handlePour = (type) => {
    if (type === "hcl" && selectedItem === "hcl") {
      triggerMascotAction([-0.4, 0.1, 0.3], [0, 0.15, -0.15], "#ff6b6b", "Je prends l'acide!", () => {
        setState(p => ({ ...p, hclVolume: 50, pH: 1 })); setSelectedItem(null); setStep(1); toast.success("HCl verse!")
      })
    }
    else if (type === "indicator" && selectedItem === "indicator") {
      triggerMascotAction([0, 0.08, 0.3], [0, 0.15, -0.15], "#9b59b6", "J'ajoute l'indicateur!", () => {
        setState(p => ({ ...p, indicatorAdded: true })); setSelectedItem(null); setStep(2); toast.success("Indicateur ajoute!")
      })
    }
    else if (type === "naoh" && selectedItem === "naoh" && !neutralized) {
      triggerMascotAction([0.4, 0.1, 0.3], [0, 0.15, -0.15], "#4dabf7", "Je neutralise!", () => {
        setState(p => { const nV = p.naohVolume + 8, nPH = calculatePH(p.hclVolume, nV), nC = getIndicatorColor(nPH), done = nPH >= 6.5
          if (done) setTimeout(() => { setStep(experiment.steps.length - 1); toast.success("Neutralise!") }, 300)
          return { ...p, naohVolume: nV, pH: nPH, color: nC, neutralized: done }
        }); setSelectedItem(null)
      })
    }
  }
  return (
    <group>
     {/* ERLENMEYER FLASK */}
      <group position={[0, 0.08, -0.15]}>
        <mesh><cylinderGeometry args={[0.035, 0.13, 0.18, 32, 1, true]} /><meshStandardMaterial color="#88ccff" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, -0.09, 0]} rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[0.13, 32]} /><meshStandardMaterial color="#88ccff" transparent opacity={0.45} /></mesh>
        <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.032, 0.035, 0.06, 24, 1, true]} /><meshStandardMaterial color="#88ccff" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.15, 0]}><torusGeometry args={[0.032, 0.007, 12, 24]} /><meshStandardMaterial color="#ffffff" /></mesh>
        <mesh position={[0, -0.085, 0]}><torusGeometry args={[0.13, 0.006, 12, 32]} /><meshStandardMaterial color="#aaddff" /></mesh>
        {hclVolume > 0 && <mesh position={[0, -0.04, 0]}><cylinderGeometry args={[0.055, 0.11, 0.1, 32]} /><meshStandardMaterial color={color} transparent opacity={0.9} /></mesh>}
        {hclVolume > 0 && <mesh position={[0, 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[0.055, 32]} /><meshStandardMaterial color={color} /></mesh>}
        <Html position={[0, 0.25, 0]} center><div className="bg-purple-600 text-white px-3 py-2 rounded-xl text-sm font-bold shadow-xl border-2 border-purple-300">pH: {pH.toFixed(1)}</div></Html>
      </group>
      <TargetZone position={[0, 0.22, -0.15]} label="?? Verser" active={["hcl","indicator","naoh"].includes(selectedItem) && ((selectedItem==="hcl"&&!hclVolume)||(selectedItem==="indicator"&&hclVolume&&!indicatorAdded)||(selectedItem==="naoh"&&indicatorAdded&&!neutralized))} onClick={() => handlePour(selectedItem)} />

      {/* Fire extinguisher */}
      <group position={[-0.7, -0.3, 0.2]}>
        <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.04, 0.04, 0.28, 16]} /><meshStandardMaterial color="#cc0000" roughness={0.4} /></mesh>
        <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.025, 0.04, 0.025, 16]} /><meshStandardMaterial color="#cc0000" /></mesh>
        <mesh position={[0, 0.32, 0]}><boxGeometry args={[0.05, 0.015, 0.02]} /><meshStandardMaterial color="#111" /></mesh>
      </group>
      {/* Wash bottle */}
      <group position={[0.55, 0.1, -0.2]}>
        <mesh position={[0, 0.04, 0]}><cylinderGeometry args={[0.03, 0.025, 0.1, 16]} /><meshPhysicalMaterial color="#ffffff" transparent opacity={0.35} /></mesh>
        <mesh position={[0, 0.03, 0]}><cylinderGeometry args={[0.024, 0.02, 0.07, 16]} /><meshStandardMaterial color="#4fc3f7" transparent opacity={0.6} /></mesh>
        <mesh position={[0, 0.095, 0]}><cylinderGeometry args={[0.015, 0.02, 0.02, 12]} /><meshStandardMaterial color="#f44336" /></mesh>
        <mesh position={[0.015, 0.13, 0]} rotation={[0.6, 0, 0.3]}><cylinderGeometry args={[0.004, 0.003, 0.08, 8]} /><meshStandardMaterial color="#f44336" /></mesh>
      </group>
      {/* Test tube rack */}
      <group position={[-0.25, 0.06, -0.25]}>
        <mesh><boxGeometry args={[0.12, 0.01, 0.04]} /><meshStandardMaterial color="#4a3728" roughness={0.9} /></mesh>
        <mesh position={[0, 0.04, 0]}><boxGeometry args={[0.12, 0.008, 0.025]} /><meshStandardMaterial color="#4a3728" /></mesh>
        <mesh position={[-0.05, 0.02, 0]}><boxGeometry args={[0.008, 0.04, 0.025]} /><meshStandardMaterial color="#4a3728" /></mesh>
        <mesh position={[0.05, 0.02, 0]}><boxGeometry args={[0.008, 0.04, 0.025]} /><meshStandardMaterial color="#4a3728" /></mesh>
        <group position={[-0.03, 0.06, 0]}><mesh><cylinderGeometry args={[0.008, 0.008, 0.07, 12]} /><meshPhysicalMaterial color="#ffffff" transparent opacity={0.25} /></mesh><mesh position={[0, -0.02, 0]}><cylinderGeometry args={[0.006, 0.006, 0.025, 12]} /><meshStandardMaterial color="#81c784" transparent opacity={0.8} /></mesh></group>
        <group position={[0, 0.06, 0]}><mesh><cylinderGeometry args={[0.008, 0.008, 0.07, 12]} /><meshPhysicalMaterial color="#ffffff" transparent opacity={0.25} /></mesh><mesh position={[0, -0.02, 0]}><cylinderGeometry args={[0.006, 0.006, 0.025, 12]} /><meshStandardMaterial color="#64b5f6" transparent opacity={0.8} /></mesh></group>
        <group position={[0.03, 0.06, 0]}><mesh><cylinderGeometry args={[0.008, 0.008, 0.07, 12]} /><meshPhysicalMaterial color="#ffffff" transparent opacity={0.25} /></mesh><mesh position={[0, -0.02, 0]}><cylinderGeometry args={[0.006, 0.006, 0.025, 12]} /><meshStandardMaterial color="#ffb74d" transparent opacity={0.8} /></mesh></group>
      </group>
      {/* Bunsen Burner */}
      <group position={[0.25, 0.05, -0.25]}>
        <mesh position={[0, 0.01, 0]}><cylinderGeometry args={[0.045, 0.05, 0.02, 24]} /><meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.15} /></mesh>
        <mesh position={[0, 0.07, 0]}><cylinderGeometry args={[0.016, 0.018, 0.1, 16]} /><meshStandardMaterial color="#2a2a2a" metalness={0.75} roughness={0.25} /></mesh>
        <mesh position={[0, 0.125, 0]}><cylinderGeometry args={[0.022, 0.016, 0.015, 16]} /><meshStandardMaterial color="#1a1a1a" metalness={0.85} /></mesh>
      </group>
      {/* Wooden shelf for bottles */}
      <group position={[0, 0.02, 0.3]}>
        <mesh position={[0, 0, 0]}><boxGeometry args={[0.95, 0.015, 0.12]} /><meshStandardMaterial color="#8B4513" roughness={0.85} /></mesh>
        <mesh position={[0, -0.005, 0.055]}><boxGeometry args={[0.95, 0.025, 0.01]} /><meshStandardMaterial color="#6d3710" roughness={0.9} /></mesh>
        <mesh position={[-0.4, -0.025, -0.03]}><boxGeometry args={[0.015, 0.05, 0.08]} /><meshStandardMaterial color="#444" metalness={0.8} /></mesh>
        <mesh position={[0.4, -0.025, -0.03]}><boxGeometry args={[0.015, 0.05, 0.08]} /><meshStandardMaterial color="#444" metalness={0.8} /></mesh>
      </group>
      {/* Bottles on shelf */}
      {grabbedItem !== "hcl" && <ClickableObject position={[-0.4, 0.1, 0.3]} selected={selectedItem === "hcl"} enabled={!hclVolume} onClick={() => setSelectedItem(selectedItem === "hcl" ? null : "hcl")}>
        <group><mesh position={[0, 0.03, 0]}><cylinderGeometry args={[0.042, 0.035, 0.08, 16]} /><meshPhysicalMaterial color="#ff6b6b" transparent opacity={0.3} roughness={0.1} /></mesh><mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.036, 0.03, 0.06, 16]} /><meshStandardMaterial color="#ff4444" transparent opacity={0.9} /></mesh><mesh position={[0, 0.075, 0]}><cylinderGeometry args={[0.028, 0.042, 0.02, 16]} /><meshPhysicalMaterial color="#ff6b6b" transparent opacity={0.75} /></mesh><mesh position={[0, 0.095, 0]}><cylinderGeometry args={[0.022, 0.028, 0.025, 16]} /><meshPhysicalMaterial color="#ff6b6b" transparent opacity={0.7} /></mesh><mesh position={[0, 0.115, 0]}><cylinderGeometry args={[0.024, 0.024, 0.02, 16]} /><meshStandardMaterial color="#1a1a1a" roughness={0.8} /></mesh><Html position={[0, 0.16, 0]} center><div className="bg-white px-2 py-1 rounded text-xs font-bold shadow border-2 border-red-500">HCl (Acide)</div></Html></group>
      </ClickableObject>}
      {grabbedItem !== "indicator" && <ClickableObject position={[0, 0.08, 0.3]} selected={selectedItem === "indicator"} enabled={hclVolume > 0 && !indicatorAdded} onClick={() => setSelectedItem(selectedItem === "indicator" ? null : "indicator")}>
        <group><mesh position={[0, 0.025, 0]}><cylinderGeometry args={[0.032, 0.026, 0.065, 16]} /><meshPhysicalMaterial color="#9b59b6" transparent opacity={0.3} roughness={0.1} /></mesh><mesh position={[0, 0.015, 0]}><cylinderGeometry args={[0.027, 0.022, 0.045, 16]} /><meshStandardMaterial color="#8e44ad" transparent opacity={0.95} /></mesh><mesh position={[0, 0.062, 0]}><cylinderGeometry args={[0.02, 0.032, 0.015, 16]} /><meshPhysicalMaterial color="#9b59b6" transparent opacity={0.8} /></mesh><mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.015, 0.02, 0.025, 16]} /><meshPhysicalMaterial color="#9b59b6" transparent opacity={0.75} /></mesh><mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.017, 0.017, 0.018, 16]} /><meshStandardMaterial color="#2d2d2d" roughness={0.9} /></mesh><Html position={[0, 0.14, 0]} center><div className="bg-purple-100 px-2 py-1 rounded text-xs font-bold shadow border-2 border-purple-500">Indicateur</div></Html></group>
      </ClickableObject>}
      {grabbedItem !== "naoh" && <ClickableObject position={[0.4, 0.1, 0.3]} selected={selectedItem === "naoh"} enabled={indicatorAdded && !neutralized} onClick={() => setSelectedItem(selectedItem === "naoh" ? null : "naoh")}>
        <group><mesh position={[0, 0.03, 0]}><cylinderGeometry args={[0.042, 0.035, 0.08, 16]} /><meshPhysicalMaterial color="#4dabf7" transparent opacity={0.3} roughness={0.1} /></mesh><mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.036, 0.03, 0.06, 16]} /><meshStandardMaterial color="#2196f3" transparent opacity={0.9} /></mesh><mesh position={[0, 0.075, 0]}><cylinderGeometry args={[0.028, 0.042, 0.02, 16]} /><meshPhysicalMaterial color="#4dabf7" transparent opacity={0.75} /></mesh><mesh position={[0, 0.095, 0]}><cylinderGeometry args={[0.022, 0.028, 0.025, 16]} /><meshPhysicalMaterial color="#4dabf7" transparent opacity={0.7} /></mesh><mesh position={[0, 0.115, 0]}><cylinderGeometry args={[0.024, 0.024, 0.02, 16]} /><meshStandardMaterial color="#1a1a1a" roughness={0.8} /></mesh><Html position={[0, 0.16, 0]} center><div className="bg-blue-100 px-2 py-1 rounded text-xs font-bold shadow border-2 border-blue-500">NaOH (Base)</div></Html></group>
      </ClickableObject>}

      
    </group>
  )
}

function PrecipitationExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, triggerMascotAction }) {
  const { agno3Added, naclAdded, precipitateFormed, filtered } = state
  const [precipitateAmount, setPrecipitateAmount] = useState(0)
  
  useEffect(() => {
    if (naclAdded && precipitateAmount < 10) {
      const interval = setInterval(() => setPrecipitateAmount(p => Math.min(p + 1, 10)), 200)
      return () => clearInterval(interval)
    }
  }, [naclAdded, precipitateAmount])
  
  const handleAction = (action) => {
    if (action === "agno3" && selectedItem === "agno3") {
      triggerMascotAction([-0.35, 0.1, 0.25], [0, 0.15, 0], "#e0e0e0", "Je verse AgNO3!", () => {
        setState(p => ({ ...p, agno3Added: true })); setSelectedItem(null); setStep(1); toast.success("?? AgNO3 verse!")
      })
    }
    else if (action === "nacl" && selectedItem === "nacl" && agno3Added) {
      triggerMascotAction([0.35, 0.1, 0.25], [0, 0.15, 0], "#ffffff", "J'ajoute NaCl!", () => {
        setState(p => ({ ...p, naclAdded: true, precipitateFormed: true })); setSelectedItem(null); setStep(2); toast.success("? Precipite blanc forme!")
      })
    }
    else if (action === "filter" && precipitateAmount >= 10) {
      triggerMascotAction([0, 0.1, 0], [0.3, 0.15, 0], "#ffffff", "Je filtre!", () => {
        setState(p => ({ ...p, filtered: true })); setStep(3); toast.success("?? AgCl filtre!")
      })
    }
    else if (action === "identify" && filtered) { setStep(experiment.steps.length - 1); toast.success("? AgCl identifie - Test Cl- positif!") }
  }
  
  return (
    <group>
      {/* Wooden Experiment Platform */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.9, 0.02, 0.6]} />
        <meshStandardMaterial color="#8B5A2B" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.005, 0]}>
        <boxGeometry args={[0.92, 0.01, 0.62]} />
        <meshStandardMaterial color="#6B4423" roughness={0.8} />
      </mesh>
      
      {/* Lab Stand with Clamp */}
      <group position={[-0.25, 0, -0.3]}>
        <mesh position={[0, 0.01, 0]}><boxGeometry args={[0.15, 0.02, 0.12]} /><meshStandardMaterial color="#333" metalness={0.8} /></mesh>
        <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.008, 0.008, 0.3, 12]} /><meshStandardMaterial color="#666" metalness={0.9} /></mesh>
        <mesh position={[0.06, 0.22, 0]}><boxGeometry args={[0.12, 0.015, 0.015]} /><meshStandardMaterial color="#666" metalness={0.9} /></mesh>
      </group>
      
      {/* Stirring Rod */}
      <mesh position={[0.2, 0.04, -0.2]} rotation={[0, 0.3, Math.PI/2]}><cylinderGeometry args={[0.005, 0.005, 0.18, 8]} /><meshStandardMaterial color="#ddd" transparent opacity={0.6} /></mesh>
      
      {/* Petri Dish */}
      <group position={[0.28, 0.02, -0.25]}>
        <mesh><cylinderGeometry args={[0.05, 0.05, 0.015, 24]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.3} /></mesh>
      </group>
      
      {/* Wash Bottle */}
      <group position={[-0.32, 0.06, 0.05]}>
        <mesh><cylinderGeometry args={[0.025, 0.03, 0.1, 16]} /><meshStandardMaterial color="#fff" transparent opacity={0.5} /></mesh>
        <mesh position={[0.02, 0.06, 0]} rotation={[0, 0, -0.4]}><cylinderGeometry args={[0.006, 0.004, 0.06, 8]} /><meshStandardMaterial color="#fff" transparent opacity={0.5} /></mesh>
      </group>
      
      {/* Safety Goggles */}
      <group position={[0.35, 0.02, 0.15]} rotation={[0, -0.5, 0]}>
        <mesh><torusGeometry args={[0.025, 0.008, 8, 16]} /><meshStandardMaterial color="#222" /></mesh>
        <mesh position={[0.05, 0, 0]}><torusGeometry args={[0.025, 0.008, 8, 16]} /><meshStandardMaterial color="#222" /></mesh>
        <mesh position={[0.025, 0, 0]}><boxGeometry args={[0.02, 0.015, 0.008]} /><meshStandardMaterial color="#222" /></mesh>
      </group>
      
      {/* Notebook */}
      <group position={[-0.38, 0.015, 0.25]} rotation={[0, 0.2, 0]}>
        <mesh><boxGeometry args={[0.12, 0.01, 0.16]} /><meshStandardMaterial color="#f5f5f0" /></mesh>
        <mesh position={[0, 0.006, 0]}><boxGeometry args={[0.1, 0.002, 0.14]} /><meshStandardMaterial color="#e8e8e0" /></mesh>
      </group>
      
      {/* Erlenmeyer Flask */}
      <group position={[0, 0.08, 0]}>
        <mesh><cylinderGeometry args={[0.03, 0.1, 0.15, 32, 1, true]} /><meshStandardMaterial color="#88ccff" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, -0.075, 0]} rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[0.1, 32]} /><meshStandardMaterial color="#88ccff" transparent opacity={0.45} /></mesh>
        <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.028, 0.03, 0.05, 24, 1, true]} /><meshStandardMaterial color="#88ccff" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.125, 0]}><torusGeometry args={[0.028, 0.005, 12, 24]} /><meshStandardMaterial color="#ffffff" /></mesh>
        <mesh position={[0, -0.07, 0]}><torusGeometry args={[0.1, 0.004, 12, 32]} /><meshStandardMaterial color="#aaddff" /></mesh>
        {agno3Added && <mesh position={[0, -0.03, 0]}><cylinderGeometry args={[0.045, 0.085, 0.08, 32]} /><meshStandardMaterial color={naclAdded ? "#f8f8f8" : "#e8e8e8"} transparent opacity={0.85} /></mesh>}
        {naclAdded && precipitateAmount > 0 && <mesh position={[0, -0.06, 0]}><cylinderGeometry args={[0.05 + precipitateAmount * 0.002, 0.08, precipitateAmount * 0.004, 32]} /><meshStandardMaterial color="#ffffff" /></mesh>}
        <Html position={[0, -0.12, 0.12]} center><div className="bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">Erlenmeyer</div></Html>
      </group>

      {/* Glass Filter Funnel with Stand */}
      {precipitateAmount >= 10 && <group position={[0.3, 0.12, 0]}>
        <mesh><coneGeometry args={[0.07, 0.12, 32, 1, true]} /><meshStandardMaterial color="#88ccff" transparent opacity={0.4} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[0.015, 0.015, 0.04, 16]} /><meshStandardMaterial color="#88ccff" transparent opacity={0.5} /></mesh>
        <mesh position={[0, 0.065, 0]}><torusGeometry args={[0.07, 0.004, 12, 24]} /><meshStandardMaterial color="#aaddff" /></mesh>
        <mesh position={[0, -0.08, 0]}><cylinderGeometry args={[0.008, 0.008, 0.06, 12]} /><meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} /></mesh>
        <mesh position={[0, -0.11, 0]}><boxGeometry args={[0.12, 0.005, 0.08]} /><meshStandardMaterial color="#444444" metalness={0.6} roughness={0.3} /></mesh>
        {filtered && <mesh position={[0, 0, 0]}><coneGeometry args={[0.05, 0.06, 32]} /><meshStandardMaterial color="#ffffff" /></mesh>}
        <Html position={[0, 0.1, 0]} center><div className="bg-gray-700 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">Entonnoir</div></Html>
      </group>}

      {/* Target zones */}
      <TargetZone position={[0, 0.2, 0]} label="?? AgNO3" active={selectedItem === "agno3"} onClick={() => handleAction("agno3")} />
      {agno3Added && <TargetZone position={[0, 0.22, 0.05]} label="?? NaCl" active={selectedItem === "nacl"} onClick={() => handleAction("nacl")} />}
      {precipitateAmount >= 10 && !filtered && <TargetZone position={[0.3, 0.2, 0]} label="?? Filtrer" active={true} onClick={() => handleAction("filter")} />}
      {filtered && <TargetZone position={[0.3, 0.25, 0]} label="? Identifier" active={true} onClick={() => handleAction("identify")} />}

      {/* Reagent Bottles */}
      {!agno3Added && <ClickableObject position={[-0.35, 0.08, 0.25]} selected={selectedItem === "agno3"} enabled={true} onClick={() => setSelectedItem(selectedItem === "agno3" ? null : "agno3")}>
        <group>
          <mesh><cylinderGeometry args={[0.028, 0.032, 0.09, 16]} /><meshStandardMaterial color="#aaddff" transparent opacity={0.6} /></mesh>
          <mesh position={[0, -0.04, 0]}><cylinderGeometry args={[0.03, 0.03, 0.01, 16]} /><meshStandardMaterial color="#88bbee" transparent opacity={0.5} /></mesh>
          <mesh position={[0, 0.055, 0]}><cylinderGeometry args={[0.015, 0.02, 0.02, 12]} /><meshStandardMaterial color="#aaddff" transparent opacity={0.6} /></mesh>
          <mesh position={[0, 0.07, 0]}><cylinderGeometry args={[0.018, 0.018, 0.015, 12]} /><meshStandardMaterial color="#333333" /></mesh>
          <mesh position={[0, -0.01, 0]}><cylinderGeometry args={[0.024, 0.026, 0.05, 16]} /><meshStandardMaterial color="#e0e0e0" transparent opacity={0.9} /></mesh>
          <Html position={[0, 0.1, 0]} center><div className="bg-gray-700 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg border border-gray-500">AgNO3</div></Html>
        </group>
      </ClickableObject>}
      {!naclAdded && agno3Added && <ClickableObject position={[0.35, 0.08, 0.25]} selected={selectedItem === "nacl"} enabled={true} onClick={() => setSelectedItem(selectedItem === "nacl" ? null : "nacl")}>
        <group>
          <mesh><cylinderGeometry args={[0.028, 0.032, 0.09, 16]} /><meshStandardMaterial color="#aaddff" transparent opacity={0.6} /></mesh>
          <mesh position={[0, -0.04, 0]}><cylinderGeometry args={[0.03, 0.03, 0.01, 16]} /><meshStandardMaterial color="#88bbee" transparent opacity={0.5} /></mesh>
          <mesh position={[0, 0.055, 0]}><cylinderGeometry args={[0.015, 0.02, 0.02, 12]} /><meshStandardMaterial color="#aaddff" transparent opacity={0.6} /></mesh>
          <mesh position={[0, 0.07, 0]}><cylinderGeometry args={[0.018, 0.018, 0.015, 12]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <mesh position={[0, -0.01, 0]}><cylinderGeometry args={[0.024, 0.026, 0.05, 16]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.95} /></mesh>
          <Html position={[0, 0.1, 0]} center><div className="bg-white text-gray-800 px-2 py-1 rounded-lg text-xs font-bold shadow-lg border border-gray-300">NaCl</div></Html>
        </group>
      </ClickableObject>}

      {/* Formula */}
      {naclAdded && <Html position={[-0.3, 0.3, 0]} center><div className="bg-purple-900 text-white p-2 rounded text-xs"><div className="font-bold">Precipitation</div><div className="text-yellow-300">Ag+ + Cl- ? AgCl(s)</div><div className="text-white mt-1">Precipite blanc</div></div></Html>}
    </group>
  )
}
function ElectrolysisExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, triggerMascotAction, grabbedItem }) {
  const { tankFilled, elecElectrodesOn, elecPowerOn, bubblingH2, bubblingO2 } = state
  const [h2Volume, setH2Volume] = useState(0)
  const [o2Volume, setO2Volume] = useState(0)
  
  useEffect(() => {
    if (elecPowerOn && h2Volume < 20) {
      const interval = setInterval(() => {
        setH2Volume(p => Math.min(p + 2, 20))
        setO2Volume(p => Math.min(p + 1, 10))
      }, 500)
      return () => clearInterval(interval)
    }
  }, [elecPowerOn, h2Volume])
  
  const handleAction = (action) => {
    if (action === "fill" && selectedItem === "water") { triggerMascotAction([-0.35, 0.1, 0.25], [0, 0.15, 0], "#3b82f6", "Je remplis!", () => { setState(p => ({ ...p, tankFilled: true })); setSelectedItem(null); setStep(1); toast.success("?? Cuve remplie!") }, "water") }
    else if (action === "electrodes" && selectedItem === "electrodes" && tankFilled) { triggerMascotAction([0.35, 0.08, 0.25], [0, 0.18, 0], "#333", "Electrodes!", () => { setState(p => ({ ...p, elecElectrodesOn: true })); setSelectedItem(null); setStep(2); toast.success("? Electrodes placees!") }, "electrodes") }
    else if (action === "power" && elecElectrodesOn && !elecPowerOn) { triggerMascotAction([0.32, 0.1, 0], [0.32, 0.12, 0], "#22c55e", "J allume!", () => { setState(p => ({ ...p, elecPowerOn: true, bubblingH2: true, bubblingO2: true })); setStep(3); toast.success("?? Electrolyse en cours!") }) }
    else if (action === "identify" && h2Volume >= 20) { setStep(experiment.steps.length - 1); toast.success("H2 = 2x O2 - Verifie!") }
  }
  
  return (
    <group>
      {/* Tank */}
      <mesh position={[0, 0.1, 0]}><boxGeometry args={[0.4, 0.2, 0.2]} /><meshPhysicalMaterial color="#60a5fa" transparent opacity={tankFilled ? 0.4 : 0.1} /></mesh>
      <Html position={[0, -0.02, 0.12]} center><div className="bg-blue-800 text-white px-2 py-1 rounded text-xs">Cuve electrolyse</div></Html>
      
      {/* Electrodes */}
      {elecElectrodesOn && <>
        <mesh position={[-0.1, 0.15, 0]}><cylinderGeometry args={[0.015, 0.015, 0.15, 16]} /><meshStandardMaterial color="#333" /></mesh>
        <mesh position={[0.1, 0.15, 0]}><cylinderGeometry args={[0.015, 0.015, 0.15, 16]} /><meshStandardMaterial color="#333" /></mesh>
        <Html position={[-0.1, 0.26, 0]} center><div className="bg-red-500 text-white px-1 rounded text-xs">-</div></Html>
        <Html position={[0.1, 0.26, 0]} center><div className="bg-blue-500 text-white px-1 rounded text-xs">+</div></Html>
      </>}
      
      {/* Gas collection tubes */}
      {elecElectrodesOn && <>
        <mesh position={[-0.1, 0.28, 0]}><cylinderGeometry args={[0.03, 0.03, 0.12, 16]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.3} /></mesh>
        <mesh position={[0.1, 0.28, 0]}><cylinderGeometry args={[0.03, 0.03, 0.12, 16]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.3} /></mesh>
        {elecPowerOn && <>
          <mesh position={[-0.1, 0.22 + h2Volume * 0.005, 0]}><cylinderGeometry args={[0.025, 0.025, h2Volume * 0.005, 16]} /><meshStandardMaterial color="#e5e5e5" transparent opacity={0.7} /></mesh>
          <mesh position={[0.1, 0.22 + o2Volume * 0.005, 0]}><cylinderGeometry args={[0.025, 0.025, o2Volume * 0.005, 16]} /><meshStandardMaterial color="#bfdbfe" transparent opacity={0.7} /></mesh>
        </>}
        <Html position={[-0.1, 0.38, 0]} center><div className="bg-gray-200 px-2 py-1 rounded text-xs font-bold">H2 {h2Volume}mL</div></Html>
        <Html position={[0.1, 0.38, 0]} center><div className="bg-blue-200 px-2 py-1 rounded text-xs font-bold">O2 {o2Volume}mL</div></Html>
      </>}
      
      {elecElectrodesOn && <group position={[0.3, 0.1, 0]}>
        <mesh><boxGeometry args={[0.1, 0.08, 0.06]} /><meshStandardMaterial color={elecPowerOn ? "#22c55e" : "#666"} /></mesh>
        <Html position={[0, 0.06, 0]} center><div className={`px-2 py-1 rounded text-xs font-bold ${elecPowerOn ? "bg-green-500 text-white" : "bg-gray-300"}`}>12V DC</div></Html>
      </group>}
      {/* Target zones */}
      <TargetZone position={[0, 0.15, 0.12]} label="?? Remplir" active={selectedItem === "water"} onClick={() => handleAction("fill")} />
      {tankFilled && <TargetZone position={[0, 0.2, 0]} label="? Electrodes" active={selectedItem === "electrodes"} onClick={() => handleAction("electrodes")} />}
      {elecElectrodesOn && !elecPowerOn && <TargetZone position={[0.3, 0.15, 0]} label="?? Allumer" active={true} onClick={() => handleAction("power")} />}
      {h2Volume >= 20 && <TargetZone position={[0, 0.4, 0]} label="? Identifier" active={true} onClick={() => handleAction("identify")} />}

      {/* Clickable items */}
      {!tankFilled && grabbedItem !== "water" && <ClickableObject position={[-0.35, 0.1, 0.25]} selected={selectedItem === "water"} enabled={true} onClick={() => setSelectedItem(selectedItem === "water" ? null : "water")}><group><mesh><cylinderGeometry args={[0.025, 0.07, 0.12, 32, 1, true]} /><meshPhysicalMaterial color="#88ccff" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh><mesh position={[0, -0.06, 0]} rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[0.07, 32]} /><meshStandardMaterial color="#88ccff" transparent opacity={0.4} /></mesh><mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.022, 0.025, 0.04, 16]} /><meshPhysicalMaterial color="#88ccff" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh><mesh position={[0, 0.1, 0]}><torusGeometry args={[0.022, 0.004, 8, 16]} /><meshStandardMaterial color="#ffffff" /></mesh><mesh position={[0, -0.02, 0]}><cylinderGeometry args={[0.035, 0.06, 0.06, 32]} /><meshStandardMaterial color="#3b82f6" transparent opacity={0.7} /></mesh><Html position={[0, 0.14, 0]} center><div className="bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">H2O + Na2SO4</div></Html></group></ClickableObject>}
      {!elecElectrodesOn && tankFilled && grabbedItem !== "electrodes" && <ClickableObject position={[0.35, 0.08, 0.25]} selected={selectedItem === "electrodes"} enabled={true} onClick={() => setSelectedItem(selectedItem === "electrodes" ? null : "electrodes")}><group><mesh position={[-0.015, 0, 0]}><cylinderGeometry args={[0.012, 0.012, 0.12, 12]} /><meshStandardMaterial color="#1a1a1a" /></mesh><mesh position={[0.015, 0, 0]}><cylinderGeometry args={[0.012, 0.012, 0.12, 12]} /><meshStandardMaterial color="#1a1a1a" /></mesh><mesh position={[-0.015, 0.065, 0]}><sphereGeometry args={[0.015, 12, 12]} /><meshStandardMaterial color="#dc2626" /></mesh><mesh position={[0.015, 0.065, 0]}><sphereGeometry args={[0.015, 12, 12]} /><meshStandardMaterial color="#2563eb" /></mesh><Html position={[0, 0.1, 0]} center><div className="bg-gray-700 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">Electrodes C</div></Html></group></ClickableObject>}

      {/* Formula display */}
      {elecPowerOn && <Html position={[-0.35, 0.3, 0]} center><div className="bg-blue-900 text-white p-2 rounded text-xs"><div className="font-bold">Electrolyse</div><div className="text-yellow-300">2H2O ? 2H2 + O2</div><div className="text-green-300 mt-1">V(H2) = 2   V(O2)</div></div></Html>}
    </group>
  )
}

function OpticsLensExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, triggerMascotAction, grabbedItem }) {
  const { lensPlaced, candleLit, screenPlaced, imageFocused, divergentTested } = state
  const [screenPos, setScreenPos] = useState(0.4)
  const [imageSharp, setImageSharp] = useState(false)
  const [lensType, setLensType] = useState('convergente')

  const handleAction = (action) => {
    if (action === "lens" && selectedItem === "lens") { triggerMascotAction([-0.4, 0.08, 0.25], [0, 0.1, 0], "#87ceeb", "Lentille!", () => { setState(p => ({ ...p, lensPlaced: true })); setSelectedItem(null); setStep(1); toast.success("?? Lentille placee!") }, "lens") }
    else if (action === "candle" && lensPlaced && !candleLit) { triggerMascotAction([-0.35, 0.1, 0], [-0.35, 0.1, 0], "#ff9500", "Allume!", () => { setState(p => ({ ...p, candleLit: true })); setStep(2); toast.success("??? Bougie allumee!") }, null) }
    else if (action === "screen" && selectedItem === "screen" && candleLit) { triggerMascotAction([0.4, 0.08, 0.25], [screenPos, 0.1, 0], "#fff", "Ecran!", () => { setState(p => ({ ...p, screenPlaced: true })); setSelectedItem(null); setStep(3); toast.success("?? Ecran place!") }, "screen") }
    else if (action === "focus" && screenPlaced && !imageFocused) { setScreenPos(0.25); setImageSharp(true); setState(p => ({ ...p, imageFocused: true })); setStep(2); toast.success("Image REELLE nette!") }
    else if (action === "divergent" && imageFocused && !divergentTested) { setLensType("divergente"); setImageSharp(false); setState(p => ({ ...p, divergentTested: true })); setStep(4); toast.success("Lentille divergente - Image VIRTUELLE!") }
  }

  return (
    <group>
      {/* Optical bench - wooden base with metal rail */}
      <mesh position={[0, 0.01, 0]}><boxGeometry args={[1.1, 0.02, 0.15]} /><meshStandardMaterial color="#5c4033" roughness={0.8} /></mesh>
      <mesh position={[0, 0.025, 0]}><boxGeometry args={[1.0, 0.008, 0.03]} /><meshStandardMaterial color="#888" metalness={0.9} /></mesh>
      {/* Ruler markings */}
      {[-0.4, -0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.022, 0.05]}><boxGeometry args={[0.002, 0.003, 0.02]} /><meshStandardMaterial color="#333" /></mesh>
      ))}

      {/* Candle holder with candle */}
      <group position={[-0.35, 0.03, 0]}>
        {/* Holder base */}
        <mesh><cylinderGeometry args={[0.03, 0.035, 0.02, 16]} /><meshStandardMaterial color="#333" metalness={0.7} /></mesh>
        {/* Candle */}
        <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[0.012, 0.014, 0.08, 16]} /><meshStandardMaterial color="#f5f5dc" /></mesh>
        {/* Wick */}
        <mesh position={[0, 0.105, 0]}><cylinderGeometry args={[0.002, 0.002, 0.015, 8]} /><meshStandardMaterial color="#333" /></mesh>
        {candleLit && <>
          <mesh position={[0, 0.12, 0]}><coneGeometry args={[0.012, 0.035, 16]} /><meshBasicMaterial color="#ff9500" /></mesh>
          <mesh position={[0, 0.11, 0]}><coneGeometry args={[0.006, 0.02, 16]} /><meshBasicMaterial color="#ffff00" /></mesh>
          <pointLight position={[0, 0.12, 0]} color="#ff9500" intensity={1.5} distance={0.8} />
        </>}
        <Html position={[0, -0.03, 0]} center><div className="bg-yellow-100 px-1 py-0.5 rounded text-xs font-bold">Objet A</div></Html>
      </group>

      {/* Lens holder - always on bench */}
      <group position={[0, 0.03, 0]}>
        <mesh><boxGeometry args={[0.02, 0.04, 0.08]} /><meshStandardMaterial color="#333" metalness={0.6} /></mesh>
        <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.015, 0.12, 0.01]} /><meshStandardMaterial color="#444" /></mesh>
        {/* Lens when placed */}
        {lensPlaced && <group position={[0, 0.08, 0]}>
          <mesh rotation={[0, Math.PI/2, 0]}><cylinderGeometry args={[0.05, 0.05, 0.008, 32]} /><meshPhysicalMaterial color="#87ceeb" transparent opacity={0.4} transmission={0.8} thickness={0.5} /></mesh>
          {/* Lens edge */}
          <mesh rotation={[0, Math.PI/2, 0]}><torusGeometry args={[0.05, 0.003, 8, 32]} /><meshStandardMaterial color="#666" metalness={0.8} /></mesh>
        </group>}
        <Html position={[0, 0.15, 0]} center><div className="bg-blue-200 px-1 py-0.5 rounded text-xs font-bold">{lensPlaced ? (lensType === 'convergente' ? "f'=+10cm" : "f'=-10cm") : "Lentille?"}</div></Html>
        <Html position={[0, -0.03, 0]} center><div className="bg-gray-500 text-white px-1 rounded text-xs">O</div></Html>
      </group>

      {/* Screen holder - always on bench */}
      <group position={[screenPos, 0.03, 0]}>
        <mesh><boxGeometry args={[0.02, 0.04, 0.08]} /><meshStandardMaterial color="#333" metalness={0.6} /></mesh>
        <mesh position={[0, 0.06, 0]}><boxGeometry args={[0.01, 0.1, 0.01]} /><meshStandardMaterial color="#444" /></mesh>
        {/* Screen when placed */}
        {screenPlaced && <group position={[0, 0.08, 0]}>
          <mesh><boxGeometry args={[0.005, 0.1, 0.08]} /><meshStandardMaterial color="#fff" /></mesh>
          {candleLit && <mesh position={[-0.004, 0, 0]} rotation={[0, -Math.PI/2, 0]}><planeGeometry args={[0.06, imageSharp ? 0.05 : 0.08]} /><meshBasicMaterial color={imageSharp ? "#ff6600" : "#ffaa77"} transparent opacity={imageSharp ? 1 : 0.3} /></mesh>}
        </group>}
        <Html position={[0, -0.03, 0]} center><div className="bg-gray-200 px-1 py-0.5 rounded text-xs font-bold">{screenPlaced ? "Ecran A'" : "Ecran?"}</div></Html>
      </group>

      {/* Light rays when focused */}
      {imageFocused && lensType === 'convergente' && <>
        <Line points={[[-0.35, 0.12, 0], [0, 0.12, 0], [screenPos, 0.06, 0]]} color="#ff0000" lineWidth={2} />
        <Line points={[[-0.35, 0.12, 0], [0, 0.08, 0], [screenPos, 0.06, 0]]} color="#ff0000" lineWidth={2} />
      </>}

      {/* Target zones */}
      <TargetZone position={[0, 0.18, 0]} label="??" active={selectedItem === "lens"} onClick={() => handleAction("lens")} />
      {lensPlaced && !candleLit && <TargetZone position={[-0.35, 0.18, 0]} label="???" active={true} onClick={() => handleAction("candle")} />}
      {candleLit && <TargetZone position={[screenPos, 0.18, 0]} label="??" active={selectedItem === "screen"} onClick={() => handleAction("screen")} />}
      {screenPlaced && !imageFocused && <TargetZone position={[screenPos, 0.22, 0]} label="??" active={true} onClick={() => handleAction("focus")} />}
      {imageFocused && !divergentTested && <TargetZone position={[0, 0.25, 0]} label="??" active={true} onClick={() => handleAction("divergent")} />}

      {/* Clickable items on front */}
      {!lensPlaced && grabbedItem !== "lens" && <ClickableObject position={[-0.4, 0.06, 0.2]} selected={selectedItem === "lens"} enabled={true} onClick={() => setSelectedItem(selectedItem === "lens" ? null : "lens")}>
        <group>
          <mesh rotation={[0, Math.PI/2, 0]}><cylinderGeometry args={[0.035, 0.035, 0.006, 32]} /><meshPhysicalMaterial color="#87ceeb" transparent opacity={0.5} /></mesh>
          <mesh rotation={[0, Math.PI/2, 0]}><torusGeometry args={[0.035, 0.002, 8, 32]} /><meshStandardMaterial color="#666" metalness={0.8} /></mesh>
          <Html position={[0, 0.05, 0]} center><div className="bg-blue-100 px-2 py-1 rounded text-xs font-bold">Lentille</div></Html>
        </group>
      </ClickableObject>}
      {!screenPlaced && candleLit && grabbedItem !== "screen" && <ClickableObject position={[0.4, 0.06, 0.2]} selected={selectedItem === "screen"} enabled={true} onClick={() => setSelectedItem(selectedItem === "screen" ? null : "screen")}>
        <group>
          <mesh><boxGeometry args={[0.004, 0.05, 0.04]} /><meshStandardMaterial color="#fff" /></mesh>
          <Html position={[0, 0.04, 0]} center><div className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">Ecran</div></Html>
        </group>
      </ClickableObject>}

      {/* Lab accessories */}
      <group position={[0.45, 0.03, 0.18]}>
        <mesh><boxGeometry args={[0.06, 0.04, 0.04]} /><meshStandardMaterial color="#222" /></mesh>
        <Html position={[0, 0.04, 0]} center><div className="bg-gray-700 text-white px-1 py-0.5 rounded text-xs">Laser</div></Html>
      </group>

      {/* Formula */}
      {imageFocused && <Html position={[-0.4, 0.28, 0]} center><div className="bg-blue-900 text-white p-2 rounded text-xs"><div className="font-bold">Relation conjugaison</div><div className="text-yellow-300">1/OA' - 1/OA = 1/f'</div><div className="text-green-300 mt-1">OA=-35cm, f'=10cm</div><div className="text-green-300">OA'=+14cm</div>{lensType === 'divergente' && <div className="text-red-300 mt-1">Image virtuelle!</div>}</div></Html>}
    </group>
  )
}

function FreeFallExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, triggerMascotAction, grabbedItem }) {
  const { ballPlaced, released, measured } = state
  const [ballY, setBallY] = useState(0.5)
  const [time, setTime] = useState(0)
  const [falling, setFalling] = useState(false)

  useEffect(() => {
    if (falling && ballY > 0.05) {
      const interval = setInterval(() => {
        setBallY(p => Math.max(p - 0.05, 0.05))
        setTime(p => p + 0.032)
      }, 32)
      return () => clearInterval(interval)
    } else if (falling && ballY <= 0.05) {
      setFalling(false)
      setState(p => ({ ...p, measured: true }))
      setStep(3)
      toast.success(`?? t = ${time.toFixed(2)}s, g   9.8 m/s `)
    }
  }, [falling, ballY])

  const handleAction = (action) => {
    if (action === "place" && selectedItem === "ball") { triggerMascotAction([-0.35, 0.08, 0.3], [0.15, 0.5, -0.1], "#3b82f6", "La bille!", () => { setState(p => ({ ...p, ballPlaced: true })); setSelectedItem(null); setStep(1); toast.success("?? Bille placee!") }, "ball") }
    else if (action === "release" && ballPlaced && !released) { triggerMascotAction([0.15, 0.55, -0.1], [0.15, 0.55, -0.1], "#ef4444", "Je lache!", () => { setState(p => ({ ...p, released: true })); setFalling(true); setStep(2); toast.success("?? Chute libre!") }, null) }
    else if (action === "calculate" && measured) { setStep(experiment.steps.length - 1); toast.success("g = 2h/t    9.81 m/s ") }
  }

  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, 0.005, 0]}><boxGeometry args={[0.8, 0.01, 0.5]} /><meshStandardMaterial color="#5c4033" roughness={0.8} /></mesh>
      
      {/* Main stand - metal pole */}
      <mesh position={[0, 0.32, -0.12]}><cylinderGeometry args={[0.012, 0.015, 0.62, 16]} /><meshStandardMaterial color="#666" metalness={0.9} /></mesh>
      {/* Stand base */}
      <mesh position={[0, 0.01, -0.12]}><cylinderGeometry args={[0.08, 0.1, 0.02, 32]} /><meshStandardMaterial color="#333" metalness={0.7} /></mesh>
      
      {/* Horizontal arm */}
      <mesh position={[0.08, 0.58, -0.12]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.008, 0.008, 0.16, 16]} /><meshStandardMaterial color="#666" metalness={0.9} /></mesh>
      
      {/* Electromagnet */}
      <group position={[0.15, 0.58, -0.12]}>
        <mesh><cylinderGeometry args={[0.025, 0.025, 0.035, 16]} /><meshStandardMaterial color={ballPlaced && !released ? "#ef4444" : "#555"} emissive={ballPlaced && !released ? "#ef4444" : "#000"} emissiveIntensity={ballPlaced && !released ? 0.3 : 0} /></mesh>
        <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.008, 0.008, 0.01, 8]} /><meshStandardMaterial color="#333" /></mesh>
        {/* Wire coils */}
        <mesh><torusGeometry args={[0.028, 0.003, 8, 24]} /><meshStandardMaterial color="#b87333" metalness={0.9} /></mesh>
      </group>
      
      {/* Ball */}
      {ballPlaced && <mesh position={[0.15, ballY, -0.12]}>
        <sphereGeometry args={[0.022, 32, 32]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.85} roughness={0.15} />
      </mesh>}
      
      {/* Height ruler */}
      <group position={[-0.08, 0.28, -0.12]}>
        <mesh><boxGeometry args={[0.025, 0.5, 0.008]} /><meshStandardMaterial color="#f5f5dc" /></mesh>
        {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((h, i) => (
          <mesh key={i} position={[0.015, h - 0.25, 0]}><boxGeometry args={[0.01, 0.002, 0.008]} /><meshStandardMaterial color="#333" /></mesh>
        ))}
      </group>
      <Html position={[-0.15, 0.3, -0.1]} center><div className="bg-yellow-400 px-1 py-0.5 rounded text-xs font-bold">h=50cm</div></Html>
      
      {/* Ground sensor pad */}
      <group position={[0.15, 0.015, -0.12]}>
        <mesh><boxGeometry args={[0.1, 0.015, 0.1]} /><meshStandardMaterial color="#22c55e" /></mesh>
        <mesh position={[0, 0.01, 0]}><boxGeometry args={[0.06, 0.005, 0.06]} /><meshStandardMaterial color="#166534" /></mesh>
      </group>
      
      {/* Digital timer */}
      <group position={[-0.28, 0.15, 0.1]}>
        <mesh><boxGeometry args={[0.1, 0.06, 0.03]} /><meshStandardMaterial color="#222" /></mesh>
        <mesh position={[0, 0, 0.016]}><boxGeometry args={[0.08, 0.04, 0.002]} /><meshStandardMaterial color={released ? "#001100" : "#111"} /></mesh>
        {released && <Html position={[0, 0, 0.02]} center><div className="text-green-400 font-mono text-sm font-bold">{time.toFixed(3)}s</div></Html>}
      </group>

      {/* Target zones */}
      <TargetZone position={[0.15, 0.55, -0.05]} label="??" active={selectedItem === "ball"} onClick={() => handleAction("place")} />
      {ballPlaced && !released && <TargetZone position={[0.15, 0.6, 0]} label="??" active={true} onClick={() => handleAction("release")} />}
      {measured && <TargetZone position={[0, 0.25, 0.1]} label="??" active={true} onClick={() => handleAction("calculate")} />}

      {/* Clickable ball */}
      {!ballPlaced && grabbedItem !== "ball" && <ClickableObject position={[-0.35, 0.06, 0.25]} selected={selectedItem === "ball"} enabled={true} onClick={() => setSelectedItem(selectedItem === "ball" ? null : "ball")}>
        <group>
          <mesh><sphereGeometry args={[0.025, 32, 32]} /><meshStandardMaterial color="#3b82f6" metalness={0.85} roughness={0.15} /></mesh>
          <Html position={[0, 0.045, 0]} center><div className="bg-blue-100 px-2 py-1 rounded text-xs font-bold">Bille</div></Html>
        </group>
      </ClickableObject>}

      {/* Stopwatch accessory */}
      <group position={[0.35, 0.04, 0.2]}>
        <mesh><cylinderGeometry args={[0.025, 0.025, 0.01, 16]} /><meshStandardMaterial color="#333" /></mesh>
        <mesh position={[0, 0.006, 0]}><circleGeometry args={[0.02, 32]} /><meshStandardMaterial color="#fff" /></mesh>
        <mesh position={[0, 0.015, 0]}><cylinderGeometry args={[0.004, 0.004, 0.012, 8]} /><meshStandardMaterial color="#666" /></mesh>
      </group>

      {/* Formula */}
      {measured && <Html position={[-0.28, 0.3, 0.1]} center><div className="bg-blue-900 text-white p-2 rounded text-xs"><div className="font-bold">Chute Libre</div><div className="text-yellow-300">h =  gt </div><div className="text-green-300">g = 2h/t </div><div className="text-white mt-1">g   9.81 m/s </div></div></Html>}
    </group>
  )
}
function BloodCirculationExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { heartViewed, pulmonaryTracked, systemicTracked, organsIdentified } = state
  const [bloodFlow, setBloodFlow] = useState(false)
  
  useEffect(() => {
    if (heartViewed) setBloodFlow(true)
  }, [heartViewed])
  
  const handleAction = (action) => {
    if (action === "heart") { setState(p => ({ ...p, heartViewed: true })); setStep(1); toast.success("?? Coeur observe!") }
    else if (action === "pulmonary" && heartViewed) { setState(p => ({ ...p, pulmonaryTracked: true })); setStep(2); toast.success("?? Circulation pulmonaire!") }
    else if (action === "systemic" && pulmonaryTracked) { setState(p => ({ ...p, systemicTracked: true })); setStep(3); toast.success("?? Circulation systemique!") }
    else if (action === "organs" && systemicTracked) { setState(p => ({ ...p, organsIdentified: true })); setStep(experiment.steps.length - 1); toast.success("? Double circulation comprise!") }
  }
  
  return (
    <group>
      {/* Heart */}
      <group position={[0, 0.2, 0]}>
        <mesh><sphereGeometry args={[0.1, 32, 32]} /><meshStandardMaterial color="#dc2626" /></mesh>
        <mesh position={[-0.06, 0.02, 0.05]}><sphereGeometry args={[0.04, 16, 16]} /><meshStandardMaterial color="#991b1b" /></mesh>
        <mesh position={[0.06, 0.02, 0.05]}><sphereGeometry args={[0.04, 16, 16]} /><meshStandardMaterial color="#7f1d1d" /></mesh>
        <Html position={[0, -0.15, 0]} center><div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">?? Coeur</div></Html>
      </group>
      
      {/* Lungs */}
      <group position={[0, 0.2, -0.2]}>
        <mesh position={[-0.15, 0, 0]}><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color="#fca5a5" /></mesh>
        <mesh position={[0.15, 0, 0]}><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color="#fca5a5" /></mesh>
        <Html position={[0, 0.12, 0]} center><div className="bg-pink-200 px-2 py-1 rounded text-xs font-bold">?? Poumons</div></Html>
      </group>
      
      {/* Body organs */}
      <group position={[0, -0.1, 0]}>
        <mesh><boxGeometry args={[0.3, 0.15, 0.1]} /><meshStandardMaterial color="#fbbf24" /></mesh>
        <Html position={[0, -0.1, 0]} center><div className="bg-yellow-400 px-2 py-1 rounded text-xs font-bold">Organes</div></Html>
      </group>
      
      {/* Blood vessels */}
      {bloodFlow && <>
        {/* Pulmonary circulation - blue to lungs, red back */}
        {pulmonaryTracked && <>
          <Line points={[[0.05, 0.25, 0], [0.1, 0.25, -0.1], [0.15, 0.2, -0.2]]} color="#3b82f6" lineWidth={3} />
          <Line points={[[-0.15, 0.2, -0.2], [-0.1, 0.25, -0.1], [-0.05, 0.25, 0]]} color="#ef4444" lineWidth={3} />
        </>}
        {/* Systemic circulation - red to body, blue back */}
        {systemicTracked && <>
          <Line points={[[0, 0.1, 0], [0, 0, 0], [0.1, -0.05, 0]]} color="#ef4444" lineWidth={3} />
          <Line points={[[-0.1, -0.05, 0], [0, 0, 0], [0, 0.1, 0]]} color="#3b82f6" lineWidth={3} />
        </>}
      </>}

      {/* Target zones */}
      <TargetZone position={[0, 0.2, 0.12]} label="?? Coeur" active={!heartViewed} onClick={() => handleAction("heart")} />
      {heartViewed && !pulmonaryTracked && <TargetZone position={[0, 0.2, -0.1]} label="?? Pulmonaire" active={true} onClick={() => handleAction("pulmonary")} />}
      {pulmonaryTracked && !systemicTracked && <TargetZone position={[0, 0.05, 0]} label="?? Systemique" active={true} onClick={() => handleAction("systemic")} />}
      {systemicTracked && !organsIdentified && <TargetZone position={[0, -0.1, 0.1]} label="? Comprendre" active={true} onClick={() => handleAction("organs")} />}

      {/* Info display */}
      {heartViewed && <Html position={[0.35, 0.3, 0]} center><div className="bg-red-900 text-white p-2 rounded text-xs">
        <div className="font-bold mb-1">Double Circulation</div>
        {pulmonaryTracked && <div className="text-blue-300">?? Pulmonaire: Coeur?Poumons</div>}
        {systemicTracked && <div className="text-red-300">?? Systemique: Coeur?Organes</div>}
        {organsIdentified && <div className="text-yellow-300 mt-1">DC = 5 L/min</div>}
      </div></Html>}
    </group>
  )
}

function GerminationExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { seedsPlaced, watered, germLightOn, radicleVisible, comparison } = state
  const [growthStage, setGrowthStage] = useState(0)
  
  useEffect(() => {
    if (germLightOn && growthStage < 3) {
      const interval = setInterval(() => setGrowthStage(p => Math.min(p + 1, 3)), 1500)
      return () => clearInterval(interval)
    }
  }, [germLightOn, growthStage])
  
  const handleAction = (action) => {
    if (action === "seeds" && selectedItem === "seeds") { setState(p => ({ ...p, seedsPlaced: true })); setSelectedItem(null); setStep(1); toast.success("?? Graines placees!") }
    else if (action === "water" && seedsPlaced && !watered) { setState(p => ({ ...p, watered: true })); setStep(2); toast.success("?? Arrosage OK!") }
    else if (action === "light" && watered && !germLightOn) { setState(p => ({ ...p, germLightOn: true })); setStep(3); toast.success("?? Lumiere allumee!") }
    else if (action === "observe" && growthStage >= 2 && !radicleVisible) { setState(p => ({ ...p, radicleVisible: true })); setStep(4); toast.success("?? Radicule visible!") }
    else if (action === "compare" && radicleVisible) { setState(p => ({ ...p, comparison: true })); setStep(experiment.steps.length - 1); toast.success("? Conditions de germination verifiees!") }
  }
  
  return (
    <group>
      {/* Petri dish with cotton */}
      <group position={[0, 0.05, 0]}>
        <mesh><cylinderGeometry args={[0.12, 0.12, 0.03, 32]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.3} /></mesh>
        <mesh position={[0, 0.01, 0]}><cylinderGeometry args={[0.11, 0.11, 0.02, 32]} /><meshStandardMaterial color={watered ? "#e0e7ff" : "#f5f5f5"} /></mesh>
        <Html position={[0, -0.03, 0.14]} center><div className="bg-gray-600 text-white px-2 py-1 rounded text-xs">Boite de Petri</div></Html>
      </group>
      
      {/* Seeds */}
      {seedsPlaced && <>
        <mesh position={[-0.04, 0.07, -0.02]}><sphereGeometry args={[0.02, 16, 16]} /><meshStandardMaterial color="#8B4513" /></mesh>
        <mesh position={[0.03, 0.07, 0.02]}><sphereGeometry args={[0.02, 16, 16]} /><meshStandardMaterial color="#8B4513" /></mesh>
        <mesh position={[0, 0.07, -0.04]}><sphereGeometry args={[0.02, 16, 16]} /><meshStandardMaterial color="#8B4513" /></mesh>
      </>}
      
      {/* Growing seedlings */}
      {growthStage >= 1 && <>
        <mesh position={[-0.04, 0.08, -0.02]}><cylinderGeometry args={[0.003, 0.003, 0.02 * growthStage, 8]} /><meshStandardMaterial color="#f5f5f5" /></mesh>
      </>}
      {growthStage >= 2 && <>
        <mesh position={[0.03, 0.08 + growthStage * 0.01, 0.02]}><cylinderGeometry args={[0.004, 0.003, 0.03 * growthStage, 8]} /><meshStandardMaterial color="#22c55e" /></mesh>
        <mesh position={[0.03, 0.1 + growthStage * 0.02, 0.02]}><sphereGeometry args={[0.015, 8, 8]} /><meshStandardMaterial color="#16a34a" /></mesh>
      </>}
      {growthStage >= 3 && <>
        <mesh position={[0, 0.09, -0.04]}><cylinderGeometry args={[0.004, 0.003, 0.04, 8]} /><meshStandardMaterial color="#22c55e" /></mesh>
        <mesh position={[0, 0.12, -0.04]}><sphereGeometry args={[0.012, 8, 8]} /><meshStandardMaterial color="#16a34a" /></mesh>
      </>}
      
      {/* Light source */}
      {germLightOn && <group position={[0, 0.4, 0]}>
        <mesh><sphereGeometry args={[0.05, 16, 16]} /><meshBasicMaterial color="#fbbf24" /></mesh>
        <pointLight color="#fbbf24" intensity={2} distance={1} />
        <Html position={[0, 0.08, 0]} center><div className="bg-yellow-400 px-2 py-1 rounded text-xs font-bold">?? Lumiere</div></Html>
      </group>}
      
      {/* Dark comparison box */}
      <group position={[0.35, 0.08, 0]}>
        <mesh><boxGeometry args={[0.12, 0.1, 0.12]} /><meshStandardMaterial color="#333" /></mesh>
        <Html position={[0, -0.08, 0]} center><div className="bg-gray-800 text-white px-2 py-1 rounded text-xs">Temoin obscurite</div></Html>
      </group>

      {/* Target zones */}
      <TargetZone position={[0, 0.1, 0]} label="?? Graines" active={selectedItem === "seeds"} onClick={() => handleAction("seeds")} />
      {seedsPlaced && !watered && <TargetZone position={[0, 0.12, 0.1]} label="?? Arroser" active={true} onClick={() => handleAction("water")} />}
      {watered && !germLightOn && <TargetZone position={[0, 0.3, 0]} label="?? Lumiere" active={true} onClick={() => handleAction("light")} />}
      {growthStage >= 2 && !radicleVisible && <TargetZone position={[0, 0.15, 0]} label="?? Observer" active={true} onClick={() => handleAction("observe")} />}
      {radicleVisible && !comparison && <TargetZone position={[0.35, 0.15, 0]} label="?? Comparer" active={true} onClick={() => handleAction("compare")} />}

      {/* Clickable items */}
      {!seedsPlaced && <ClickableObject position={[-0.35, 0.08, 0.3]} selected={selectedItem === "seeds"} enabled={true} onClick={() => setSelectedItem(selectedItem === "seeds" ? null : "seeds")}><group><mesh><sphereGeometry args={[0.025, 16, 16]} /><meshStandardMaterial color="#8B4513" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-amber-100 px-2 py-1 rounded text-xs font-bold">Haricot</div></Html></group></ClickableObject>}

      {/* Results */}
      {comparison && <Html position={[-0.3, 0.3, 0]} center><div className="bg-green-800 text-white p-2 rounded text-xs"><div className="font-bold mb-1">Germination</div><div className="text-green-300">? Eau: necessaire</div><div className="text-green-300">? O2: necessaire</div><div className="text-yellow-300">?? Lumiere: pas obligatoire</div><div className="text-blue-300">Taux: 100%</div></div></Html>}
    </group>
  )
}

function CombustionExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary, triggerMascotAction, grabbedItem }) {
  const { bunsenLit, magnesiumBurning } = state
  const handleAction = (a) => {
    if (a === "lighter" && selectedItem === "lighter") { triggerMascotAction([-0.35, 0.08, 0.28], [0, 0.32, -0.1], "#e74c3c", "J allume!", () => { setState(p => ({ ...p, bunsenLit: true })); setSelectedItem(null); setStep(1); toast.success("?? Allume!") }, "lighter") }
    else if (a === "magnesium" && selectedItem === "magnesium" && bunsenLit) { triggerMascotAction([0.35, 0.08, 0.28], [0, 0.45, -0.1], "#ccc", "Je brule!", () => { setState(p => ({ ...p, magnesiumBurning: true })); setSelectedItem(null); setStep(3); toast.success("? Combustion!"); setTimeout(() => setStep(experiment.steps.length - 1), 2000) }, "magnesium") }
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

      <TargetZone position={[0, 0.32, -0.1]} label="?? Allumer" active={selectedItem === "lighter"} onClick={() => handleAction("lighter")} />
      <TargetZone position={[0, 0.45, -0.1]} label="? Bruler" active={selectedItem === "magnesium" && bunsenLit} onClick={() => handleAction("magnesium")} />

      {grabbedItem !== "lighter" && <ClickableObject position={[-0.4, 0.08, 0.3]} selected={selectedItem === "lighter"} enabled={!bunsenLit} onClick={() => setSelectedItem(selectedItem === "lighter" ? null : "lighter")}>
        <group><mesh><boxGeometry args={[0.03, 0.08, 0.018]} /><meshStandardMaterial color="#e74c3c" /></mesh><Html position={[0, 0.07, 0]} center><div className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">??</div></Html></group>
      </ClickableObject>}
      {grabbedItem !== "magnesium" && <ClickableObject position={[0.4, 0.08, 0.3]} selected={selectedItem === "magnesium"} enabled={bunsenLit && !magnesiumBurning} onClick={() => setSelectedItem(selectedItem === "magnesium" ? null : "magnesium")}>
        <group><mesh rotation={[0, 0, 0.3]}><boxGeometry args={[0.15, 0.012, 0.006]} /><meshStandardMaterial color="#ccc" metalness={0.95} /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-gray-200 px-2 py-1 rounded text-xs font-bold">Ruban Mg</div></Html></group>
      </ClickableObject>}

      
    </group>
  )
}

function CircuitExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary, triggerMascotAction, grabbedItem }) {
  const { batteryConnected, resistorConnected, bulbLit } = state
  const handlePlace = (item) => {
    if (item === "battery" && selectedItem === "battery") { triggerMascotAction([-0.35, 0.1, 0.3], [-0.28, 0.08, -0.05], "#1e40af", "La pile!", () => { setState(p => ({ ...p, batteryConnected: true })); setSelectedItem(null); setStep(1); toast.success("?? Pile!") }, "battery") }
    else if (item === "resistor" && selectedItem === "resistor") { triggerMascotAction([0, 0.1, 0.3], [0, 0.06, -0.05], "#c2410c", "Resistance!", () => { setState(p => ({ ...p, resistorConnected: true })); setSelectedItem(null); setStep(2); toast.success("? Resistance!") }, "resistor") }
    else if (item === "bulb" && selectedItem === "bulb") { triggerMascotAction([0.35, 0.12, 0.3], [0.28, 0.1, -0.05], "#ffc", "Ampoule!", () => { setState(p => ({ ...p, bulbLit: true, current: 0.09 })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("?? I=0.09A") }, "bulb") }
  }
  return (
    <group>
      {/* Circuit board - green PCB */}
      <mesh position={[0, 0.015, -0.05]}><boxGeometry args={[0.9, 0.02, 0.4]} /><meshStandardMaterial color="#1a5c32" /></mesh>
      <mesh position={[-0.15, 0.026, -0.05]}><boxGeometry args={[0.3, 0.002, 0.01]} /><meshStandardMaterial color="#c9a227" metalness={0.8} /></mesh>
      <mesh position={[0.15, 0.026, -0.05]}><boxGeometry args={[0.3, 0.002, 0.01]} /><meshStandardMaterial color="#c9a227" metalness={0.8} /></mesh>

      <TargetZone position={[-0.28, 0.06, -0.05]} label="??" active={selectedItem === "battery"} onClick={() => handlePlace("battery")} />
      <TargetZone position={[0, 0.06, -0.05]} label="?" active={selectedItem === "resistor"} onClick={() => handlePlace("resistor")} />
      <TargetZone position={[0.28, 0.06, -0.05]} label="??" active={selectedItem === "bulb"} onClick={() => handlePlace("bulb")} />

      {batteryConnected && <group position={[-0.28, 0.08, -0.05]}><mesh><boxGeometry args={[0.05, 0.09, 0.025]} /><meshStandardMaterial color="#1e40af" /></mesh><mesh position={[0, 0.045, 0]}><boxGeometry args={[0.04, 0.01, 0.02]} /><meshStandardMaterial color="#333" /></mesh><mesh position={[-0.01, 0.05, 0]}><cylinderGeometry args={[0.004, 0.004, 0.015, 8]} /><meshStandardMaterial color="#dc2626" /></mesh><mesh position={[0.01, 0.05, 0]}><cylinderGeometry args={[0.004, 0.004, 0.015, 8]} /><meshStandardMaterial color="#333" /></mesh></group>}
      {resistorConnected && <group position={[0, 0.06, -0.05]} rotation={[0, 0, Math.PI/2]}><mesh><cylinderGeometry args={[0.018, 0.018, 0.08, 16]} /><meshStandardMaterial color="#d4a574" /></mesh><mesh position={[0, 0.015, 0]}><cylinderGeometry args={[0.019, 0.019, 0.008, 16]} /><meshStandardMaterial color="#8B4513" /></mesh><mesh position={[0, 0, 0]}><cylinderGeometry args={[0.019, 0.019, 0.008, 16]} /><meshStandardMaterial color="#000" /></mesh><mesh position={[0, -0.015, 0]}><cylinderGeometry args={[0.019, 0.019, 0.008, 16]} /><meshStandardMaterial color="#8B4513" /></mesh></group>}
      {bulbLit && <group position={[0.28, 0.1, -0.05]}><mesh><sphereGeometry args={[0.035, 32, 32]} /><meshPhysicalMaterial color="#ffc" emissive="#ff0" emissiveIntensity={2} transparent opacity={0.9} /></mesh><mesh position={[0, -0.04, 0]}><cylinderGeometry args={[0.015, 0.02, 0.025, 16]} /><meshStandardMaterial color="#333" /></mesh><pointLight color="#ff0" intensity={2} distance={1.5} /></group>}

      {!batteryConnected && grabbedItem !== "battery" && <ClickableObject position={[-0.35, 0.1, 0.3]} selected={selectedItem === "battery"} enabled={true} onClick={() => setSelectedItem(selectedItem === "battery" ? null : "battery")}><group><mesh><boxGeometry args={[0.05, 0.09, 0.025]} /><meshStandardMaterial color="#1e40af" /></mesh><mesh position={[0, 0.045, 0]}><boxGeometry args={[0.04, 0.01, 0.02]} /><meshStandardMaterial color="#333" /></mesh><mesh position={[-0.01, 0.05, 0]}><cylinderGeometry args={[0.004, 0.004, 0.015, 8]} /><meshStandardMaterial color="#dc2626" /></mesh><mesh position={[0.01, 0.05, 0]}><cylinderGeometry args={[0.004, 0.004, 0.015, 8]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.08, 0]} center><div className="bg-yellow-400 px-2 py-1 text-xs font-bold rounded">Pile 9V</div></Html></group></ClickableObject>}
      {!resistorConnected && grabbedItem !== "resistor" && <ClickableObject position={[0, 0.1, 0.3]} selected={selectedItem === "resistor"} enabled={batteryConnected} onClick={() => setSelectedItem(selectedItem === "resistor" ? null : "resistor")}><group rotation={[0, 0, Math.PI/2]}><mesh><cylinderGeometry args={[0.018, 0.018, 0.08, 16]} /><meshStandardMaterial color="#d4a574" /></mesh><mesh position={[0, 0.015, 0]}><cylinderGeometry args={[0.019, 0.019, 0.008, 16]} /><meshStandardMaterial color="#8B4513" /></mesh><mesh position={[0, 0, 0]}><cylinderGeometry args={[0.019, 0.019, 0.008, 16]} /><meshStandardMaterial color="#000" /></mesh><mesh position={[0, -0.015, 0]}><cylinderGeometry args={[0.019, 0.019, 0.008, 16]} /><meshStandardMaterial color="#8B4513" /></mesh><Html position={[0.06, 0, 0]} center><div className="bg-orange-200 px-2 py-1 text-xs font-bold rounded">100O</div></Html></group></ClickableObject>}
      {!bulbLit && grabbedItem !== "bulb" && <ClickableObject position={[0.35, 0.12, 0.3]} selected={selectedItem === "bulb"} enabled={resistorConnected} onClick={() => setSelectedItem(selectedItem === "bulb" ? null : "bulb")}><group><mesh><sphereGeometry args={[0.035, 32, 32]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.4} /></mesh><mesh position={[0, -0.04, 0]}><cylinderGeometry args={[0.015, 0.02, 0.025, 16]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-yellow-100 px-2 py-1 text-xs font-bold rounded">Ampoule</div></Html></group></ClickableObject>}

      {batteryConnected && resistorConnected && <Wire start={[-0.2, 0.08, -0.05]} end={[-0.06, 0.06, -0.05]} color={bulbLit?"#0f0":"#c00"} glowing={bulbLit} />}
      {resistorConnected && bulbLit && <Wire start={[0.06, 0.06, -0.05]} end={[0.2, 0.1, -0.05]} color="#0f0" glowing={true} />}
    </group>
  )
}

function ParallelCircuitExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary, triggerMascotAction, grabbedItem }) {
  const { batteryPlaced, r1Connected, l1Connected, r2Connected, l2Connected } = state
  const bulb1Lit = r1Connected && l1Connected && batteryPlaced
  const bulb2Lit = r2Connected && l2Connected && batteryPlaced
  const handlePlace = (item) => {
    if (item === "battery" && selectedItem === "battery") { triggerMascotAction([-0.35, 0.08, 0.32], [-0.38, 0.06, 0], "#1e40af", "La pile!", () => { setState(p => ({ ...p, batteryPlaced: true })); setSelectedItem(null); setStep(1); toast.success("?? Pile connectee!") }, "battery") }
    else if (item === "r1" && selectedItem === "r1") { triggerMascotAction([-0.05, 0.08, 0.32], [-0.05, 0.045, -0.12], "#c2410c", "R1!", () => { setState(p => ({ ...p, r1Connected: true })); setSelectedItem(null); setStep(2); toast.success("? R1 = 100O") }, "r1") }
    else if (item === "l1" && selectedItem === "l1") { triggerMascotAction([0.1, 0.08, 0.32], [0.18, 0.055, -0.12], "#ffc", "L1!", () => { setState(p => ({ ...p, l1Connected: true })); setSelectedItem(null); setStep(3); toast.success("?? L1 allumee!") }, "l1") }
    else if (item === "r2" && selectedItem === "r2") { triggerMascotAction([0.25, 0.08, 0.32], [-0.05, 0.045, 0.12], "#7c3aed", "R2!", () => { setState(p => ({ ...p, r2Connected: true })); setSelectedItem(null); setStep(4); toast.success("? R2 = 200O") }, "r2") }
    else if (item === "l2" && selectedItem === "l2") { triggerMascotAction([0.4, 0.08, 0.32], [0.18, 0.055, 0.12], "#ffc", "L2!", () => { setState(p => ({ ...p, l2Connected: true })); setSelectedItem(null); setStep(5); toast.success("?? L2 allumee!"); setTimeout(() => setStep(experiment.steps.length - 1), 1500) }, "l2") }
  }
  const iTotal = bulb2Lit ? 0.135 : (bulb1Lit ? 0.09 : 0)
  return (
    <group>
      {/* Wooden base */}
      <mesh position={[0, 0.01, 0]}><boxGeometry args={[0.9, 0.02, 0.5]} /><meshStandardMaterial color="#8B7355" roughness={0.8} /></mesh>
      
      {/* Main horizontal rails - copper strips */}
      <mesh position={[0, 0.025, -0.18]}><boxGeometry args={[0.7, 0.004, 0.02]} /><meshStandardMaterial color="#b87333" metalness={0.9} /></mesh>
      <mesh position={[0, 0.025, 0.18]}><boxGeometry args={[0.7, 0.004, 0.02]} /><meshStandardMaterial color="#b87333" metalness={0.9} /></mesh>
      {/* Vertical connections */}
      <mesh position={[-0.32, 0.025, 0]}><boxGeometry args={[0.02, 0.004, 0.34]} /><meshStandardMaterial color="#b87333" metalness={0.9} /></mesh>
      <mesh position={[0.32, 0.025, 0]}><boxGeometry args={[0.02, 0.004, 0.34]} /><meshStandardMaterial color="#b87333" metalness={0.9} /></mesh>

      {/* Battery holder */}
      <mesh position={[-0.38, 0.04, -0.1]}><boxGeometry args={[0.015, 0.04, 0.02]} /><meshStandardMaterial color="#333" /></mesh>
      <mesh position={[-0.38, 0.04, 0.1]}><boxGeometry args={[0.015, 0.04, 0.02]} /><meshStandardMaterial color="#333" /></mesh>

      {/* Battery target and placed */}
      <TargetZone position={[-0.38, 0.08, 0]} label="??" active={selectedItem === "battery"} onClick={() => handlePlace("battery")} />
      {batteryPlaced && <group position={[-0.38, 0.06, 0]} rotation={[Math.PI/2, 0, 0]}>
        <mesh><boxGeometry args={[0.045, 0.18, 0.022]} /><meshStandardMaterial color="#1e40af" /></mesh>
        <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.005, 0.005, 0.015, 8]} /><meshStandardMaterial color="#dc2626" /></mesh>
        <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.005, 0.005, 0.015, 8]} /><meshStandardMaterial color="#333" /></mesh>
      </group>}

      {/* R1 socket */}
      <group position={[-0.05, 0.028, -0.12]}>
        <mesh><boxGeometry args={[0.1, 0.006, 0.025]} /><meshStandardMaterial color="#444" /></mesh>
      </group>
      <TargetZone position={[-0.05, 0.06, -0.12]} label="R1" active={selectedItem === "r1" && batteryPlaced} onClick={() => handlePlace("r1")} />
      {r1Connected && <group position={[-0.05, 0.042, -0.12]}>
        <mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.014, 0.014, 0.07, 16]} /><meshStandardMaterial color="#d4a574" /></mesh>
        <mesh rotation={[0, 0, Math.PI/2]} position={[0.012, 0, 0]}><cylinderGeometry args={[0.015, 0.015, 0.006, 16]} /><meshStandardMaterial color="#8B4513" /></mesh>
        <mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.015, 0.015, 0.006, 16]} /><meshStandardMaterial color="#000" /></mesh>
        <mesh rotation={[0, 0, Math.PI/2]} position={[-0.012, 0, 0]}><cylinderGeometry args={[0.015, 0.015, 0.006, 16]} /><meshStandardMaterial color="#8B4513" /></mesh>
      </group>}

      {/* L1 socket */}
      <group position={[0.18, 0.028, -0.12]}>
        <mesh><cylinderGeometry args={[0.02, 0.02, 0.006, 16]} /><meshStandardMaterial color="#444" /></mesh>
      </group>
      <TargetZone position={[0.18, 0.06, -0.12]} label="L1" active={selectedItem === "l1" && r1Connected} onClick={() => handlePlace("l1")} />
      {l1Connected && <group position={[0.18, 0.05, -0.12]}>
        <mesh><sphereGeometry args={[0.025, 32, 32]} /><meshPhysicalMaterial color={bulb1Lit?"#ffc":"#eee"} emissive={bulb1Lit?"#ff0":"#000"} emissiveIntensity={bulb1Lit?2:0} transparent opacity={0.9} /></mesh>
        <mesh position={[0, -0.03, 0]}><cylinderGeometry args={[0.01, 0.012, 0.015, 16]} /><meshStandardMaterial color="#333" /></mesh>
        {bulb1Lit && <pointLight color="#ff0" intensity={1.5} distance={1} />}
      </group>}

      {/* R2 socket */}
      <group position={[-0.05, 0.028, 0.12]}>
        <mesh><boxGeometry args={[0.1, 0.006, 0.025]} /><meshStandardMaterial color="#444" /></mesh>
      </group>
      <TargetZone position={[-0.05, 0.06, 0.12]} label="R2" active={selectedItem === "r2" && l1Connected} onClick={() => handlePlace("r2")} />
      {r2Connected && <group position={[-0.05, 0.042, 0.12]}>
        <mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.014, 0.014, 0.07, 16]} /><meshStandardMaterial color="#d4a574" /></mesh>
        <mesh rotation={[0, 0, Math.PI/2]} position={[0.012, 0, 0]}><cylinderGeometry args={[0.015, 0.015, 0.006, 16]} /><meshStandardMaterial color="#7c3aed" /></mesh>
        <mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.015, 0.015, 0.006, 16]} /><meshStandardMaterial color="#000" /></mesh>
        <mesh rotation={[0, 0, Math.PI/2]} position={[-0.012, 0, 0]}><cylinderGeometry args={[0.015, 0.015, 0.006, 16]} /><meshStandardMaterial color="#7c3aed" /></mesh>
      </group>}

      {/* L2 socket */}
      <group position={[0.18, 0.028, 0.12]}>
        <mesh><cylinderGeometry args={[0.02, 0.02, 0.006, 16]} /><meshStandardMaterial color="#444" /></mesh>
      </group>
      <TargetZone position={[0.18, 0.06, 0.12]} label="L2" active={selectedItem === "l2" && r2Connected} onClick={() => handlePlace("l2")} />
      {l2Connected && <group position={[0.18, 0.05, 0.12]}>
        <mesh><sphereGeometry args={[0.025, 32, 32]} /><meshPhysicalMaterial color={bulb2Lit?"#ffc":"#eee"} emissive={bulb2Lit?"#ff0":"#000"} emissiveIntensity={bulb2Lit?1.5:0} transparent opacity={0.9} /></mesh>
        <mesh position={[0, -0.03, 0]}><cylinderGeometry args={[0.01, 0.012, 0.015, 16]} /><meshStandardMaterial color="#333" /></mesh>
        {bulb2Lit && <pointLight color="#ff0" intensity={1} distance={0.8} />}
      </group>}

      {/* Wires - color based on circuit state */}
      <Wire start={[-0.32, 0.025, -0.12]} end={[-0.09, 0.03, -0.12]} color={bulb1Lit?"#0f0":"#666"} glowing={bulb1Lit} />
      <Wire start={[-0.01, 0.03, -0.12]} end={[0.16, 0.035, -0.12]} color={bulb1Lit?"#0f0":"#666"} glowing={bulb1Lit} />
      <Wire start={[0.20, 0.035, -0.12]} end={[0.32, 0.025, -0.12]} color={bulb1Lit?"#0f0":"#666"} glowing={bulb1Lit} />
      
      <Wire start={[-0.32, 0.025, 0.12]} end={[-0.09, 0.03, 0.12]} color={bulb2Lit?"#0f0":"#666"} glowing={bulb2Lit} />
      <Wire start={[-0.01, 0.03, 0.12]} end={[0.16, 0.035, 0.12]} color={bulb2Lit?"#0f0":"#666"} glowing={bulb2Lit} />
      <Wire start={[0.20, 0.035, 0.12]} end={[0.32, 0.025, 0.12]} color={bulb2Lit?"#0f0":"#666"} glowing={bulb2Lit} />

      {/* Clickable components */}
      {!batteryPlaced && grabbedItem !== "battery" && <ClickableObject position={[-0.35, 0.08, 0.32]} selected={selectedItem === "battery"} enabled={true} onClick={() => setSelectedItem(selectedItem === "battery" ? null : "battery")}><group rotation={[Math.PI/2, 0, 0]}><mesh><boxGeometry args={[0.04, 0.14, 0.02]} /><meshStandardMaterial color="#1e40af" /></mesh><mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.004, 0.004, 0.012, 8]} /><meshStandardMaterial color="#dc2626" /></mesh><mesh position={[0, -0.08, 0]}><cylinderGeometry args={[0.004, 0.004, 0.012, 8]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0.035, 0, 0]} center><div className="bg-yellow-400 px-1.5 py-0.5 text-xs font-bold rounded">9V</div></Html></group></ClickableObject>}
      
      {!r1Connected && grabbedItem !== "r1" && <ClickableObject position={[-0.05, 0.08, 0.32]} selected={selectedItem === "r1"} enabled={batteryPlaced} onClick={() => setSelectedItem(selectedItem === "r1" ? null : "r1")}><group rotation={[0, 0, Math.PI/2]}><mesh><cylinderGeometry args={[0.012, 0.012, 0.06, 16]} /><meshStandardMaterial color="#d4a574" /></mesh><mesh position={[0, 0.01, 0]}><cylinderGeometry args={[0.013, 0.013, 0.005, 16]} /><meshStandardMaterial color="#8B4513" /></mesh><mesh><cylinderGeometry args={[0.013, 0.013, 0.005, 16]} /><meshStandardMaterial color="#000" /></mesh><mesh position={[0, -0.01, 0]}><cylinderGeometry args={[0.013, 0.013, 0.005, 16]} /><meshStandardMaterial color="#8B4513" /></mesh><Html position={[0.04, 0, 0]} center><div className="bg-orange-200 px-1.5 py-0.5 text-xs font-bold rounded">R1</div></Html></group></ClickableObject>}
      
      {!l1Connected && grabbedItem !== "l1" && <ClickableObject position={[0.1, 0.08, 0.32]} selected={selectedItem === "l1"} enabled={r1Connected} onClick={() => setSelectedItem(selectedItem === "l1" ? null : "l1")}><group><mesh><sphereGeometry args={[0.02, 32, 32]} /><meshPhysicalMaterial color="#eee" transparent opacity={0.8} /></mesh><mesh position={[0, -0.025, 0]}><cylinderGeometry args={[0.008, 0.01, 0.012, 16]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-yellow-100 px-1.5 py-0.5 text-xs font-bold rounded">L1</div></Html></group></ClickableObject>}
      
      {!r2Connected && grabbedItem !== "r2" && <ClickableObject position={[0.25, 0.08, 0.32]} selected={selectedItem === "r2"} enabled={l1Connected} onClick={() => setSelectedItem(selectedItem === "r2" ? null : "r2")}><group rotation={[0, 0, Math.PI/2]}><mesh><cylinderGeometry args={[0.012, 0.012, 0.06, 16]} /><meshStandardMaterial color="#d4a574" /></mesh><mesh position={[0, 0.01, 0]}><cylinderGeometry args={[0.013, 0.013, 0.005, 16]} /><meshStandardMaterial color="#7c3aed" /></mesh><mesh><cylinderGeometry args={[0.013, 0.013, 0.005, 16]} /><meshStandardMaterial color="#000" /></mesh><mesh position={[0, -0.01, 0]}><cylinderGeometry args={[0.013, 0.013, 0.005, 16]} /><meshStandardMaterial color="#7c3aed" /></mesh><Html position={[0.04, 0, 0]} center><div className="bg-purple-200 px-1.5 py-0.5 text-xs font-bold rounded">R2</div></Html></group></ClickableObject>}
      
      {!l2Connected && grabbedItem !== "l2" && <ClickableObject position={[0.4, 0.08, 0.32]} selected={selectedItem === "l2"} enabled={r2Connected} onClick={() => setSelectedItem(selectedItem === "l2" ? null : "l2")}><group><mesh><sphereGeometry args={[0.02, 32, 32]} /><meshPhysicalMaterial color="#eee" transparent opacity={0.8} /></mesh><mesh position={[0, -0.025, 0]}><cylinderGeometry args={[0.008, 0.01, 0.012, 16]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-yellow-100 px-1.5 py-0.5 text-xs font-bold rounded">L2</div></Html></group></ClickableObject>}

      {/* Multimeter */}
      <group position={[-0.38, 0.04, 0.28]}>
        <mesh><boxGeometry args={[0.055, 0.07, 0.022]} /><meshStandardMaterial color="#222" /></mesh>
        <mesh position={[0, 0.01, 0.012]}><boxGeometry args={[0.035, 0.02, 0.002]} /><meshStandardMaterial color={batteryPlaced?"#00ff00":"#333"} emissive={batteryPlaced?"#00ff00":"#000"} emissiveIntensity={0.5} /></mesh>
      </group>

      {/* Current display */}
      {bulb1Lit && <Html position={[0.38, 0.16, -0.05]} center><div className="bg-blue-900 text-white p-2 rounded text-xs"><div className="font-bold">Loi des noeuds</div><div className="text-yellow-300">I = I1 + I2</div><div className="text-lg text-green-300">I = {iTotal.toFixed(3)}A</div>{bulb2Lit && <div className="text-xs mt-1">Req = 66.7O</div>}</div></Html>}
    </group>
  )
}
function PendulumExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary, triggerMascotAction, grabbedItem }) {
  const { stringAttached, massAttached, swinging, period } = state
  const pendulumRef = useRef()
  useFrame((s) => { if (swinging && pendulumRef.current) pendulumRef.current.rotation.z = Math.sin(s.clock.elapsedTime * Math.PI) * 0.4 })
  const handleAction = (a) => {
    if (a === "string" && selectedItem === "string") { triggerMascotAction([-0.4, 0.08, 0.3], [0.18, 0.55, -0.15], "#8B4513", "La ficelle!", () => { setState(p => ({ ...p, stringAttached: true })); setSelectedItem(null); setStep(1); toast.success("?? Ficelle!") }, "string") }
    else if (a === "mass" && selectedItem === "mass") { triggerMascotAction([0, 0.08, 0.3], [0.18, 0.2, -0.15], "#dc2626", "La masse!", () => { setState(p => ({ ...p, massAttached: true })); setSelectedItem(null); setStep(2); toast.success("?? Masse!") }, "mass") }
    else if (a === "swing" && selectedItem === "swing") { const T = 2.01; setState(p => ({ ...p, swinging: true, period: T })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success(`?? T=${T.toFixed(2)}s`) }
  }
  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, 0.005, 0]}><boxGeometry args={[0.7, 0.01, 0.5]} /><meshStandardMaterial color="#5c4033" roughness={0.8} /></mesh>
      
      {/* Stand */}
      <group position={[0, 0, -0.15]}>
        {/* Heavy base */}
        <mesh position={[0, 0.02, 0]}><boxGeometry args={[0.22, 0.03, 0.12]} /><meshStandardMaterial color="#333" metalness={0.8} /></mesh>
        {/* Vertical pole */}
        <mesh position={[0, 0.32, 0]}><cylinderGeometry args={[0.012, 0.015, 0.58, 16]} /><meshStandardMaterial color="#555" metalness={0.9} /></mesh>
        {/* Horizontal arm */}
        <mesh position={[0.1, 0.58, 0]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.008, 0.008, 0.2, 16]} /><meshStandardMaterial color="#555" metalness={0.9} /></mesh>
        {/* Pivot point */}
        <mesh position={[0.18, 0.58, 0]}><sphereGeometry args={[0.012, 16, 16]} /><meshStandardMaterial color="#666" metalness={0.9} /></mesh>
        
        {/* Pendulum */}
        {stringAttached && <group ref={pendulumRef} position={[0.18, 0.58, 0]}>
          {/* String */}
          <mesh position={[0, -0.18, 0]}><cylinderGeometry args={[0.002, 0.002, 0.35, 8]} /><meshStandardMaterial color="#d4a574" /></mesh>
          {/* Mass bob */}
          {massAttached && <group position={[0, -0.38, 0]}>
            <mesh><sphereGeometry args={[0.04, 32, 32]} /><meshStandardMaterial color="#dc2626" metalness={0.75} roughness={0.2} /></mesh>
            {/* Hook */}
            <mesh position={[0, 0.045, 0]}><cylinderGeometry args={[0.005, 0.005, 0.015, 8]} /><meshStandardMaterial color="#888" metalness={0.9} /></mesh>
          </group>}
        </group>}
      </group>
      
      {/* Length marker */}
      <group position={[-0.1, 0.4, -0.15]}>
        <mesh><boxGeometry args={[0.02, 0.35, 0.005]} /><meshStandardMaterial color="#f5f5dc" /></mesh>
        {[0, 0.1, 0.2, 0.3].map((h, i) => (
          <mesh key={i} position={[0.012, h - 0.15, 0]}><boxGeometry args={[0.008, 0.002, 0.005]} /><meshStandardMaterial color="#333" /></mesh>
        ))}
      </group>
      <Html position={[-0.15, 0.4, -0.12]} center><div className="bg-yellow-100 px-1 py-0.5 rounded text-xs font-bold">L=1m</div></Html>

      {/* Target zones */}
      <TargetZone position={[0.18, 0.58, -0.1]} label="??" active={selectedItem === "string"} onClick={() => handleAction("string")} />
      <TargetZone position={[0.18, 0.2, -0.1]} label="??" active={selectedItem === "mass" && stringAttached} onClick={() => handleAction("mass")} />
      {massAttached && !swinging && <TargetZone position={[0.35, 0.25, -0.1]} label="??" active={selectedItem === "swing"} onClick={() => handleAction("swing")} />}

      {/* Clickable items */}
      {!stringAttached && grabbedItem !== "string" && <ClickableObject position={[-0.35, 0.06, 0.25]} selected={selectedItem === "string"} enabled={true} onClick={() => setSelectedItem(selectedItem === "string" ? null : "string")}>
        <group>
          <mesh rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.03, 0.008, 8, 32]} /><meshStandardMaterial color="#d4a574" /></mesh>
          <Html position={[0, 0.055, 0]} center><div className="bg-white px-2 py-1 rounded text-xs font-bold shadow">Ficelle</div></Html>
        </group>
      </ClickableObject>}
      
      {!massAttached && stringAttached && grabbedItem !== "mass" && <ClickableObject position={[0, 0.06, 0.25]} selected={selectedItem === "mass"} enabled={true} onClick={() => setSelectedItem(selectedItem === "mass" ? null : "mass")}>
        <group>
          <mesh><sphereGeometry args={[0.03, 32, 32]} /><meshStandardMaterial color="#dc2626" metalness={0.75} /></mesh>
          <Html position={[0, 0.05, 0]} center><div className="bg-red-100 px-2 py-1 rounded text-xs font-bold shadow">100g</div></Html>
        </group>
      </ClickableObject>}
      
      {massAttached && !swinging && grabbedItem !== "swing" && <ClickableObject position={[0.35, 0.06, 0.25]} selected={selectedItem === "swing"} enabled={true} onClick={() => setSelectedItem(selectedItem === "swing" ? null : "swing")}>
        <group>
          <mesh><boxGeometry args={[0.045, 0.05, 0.015]} /><meshStandardMaterial color="#f59e0b" /></mesh>
          <Html position={[0, 0.045, 0]} center><div className="bg-yellow-400 px-2 py-1 rounded text-xs font-bold">Lancer</div></Html>
        </group>
      </ClickableObject>}

      {/* Stopwatch */}
      <group position={[0.38, 0.04, 0.18]}>
        <mesh><cylinderGeometry args={[0.022, 0.022, 0.008, 16]} /><meshStandardMaterial color="#333" /></mesh>
        <mesh position={[0, 0.005, 0]}><circleGeometry args={[0.018, 32]} /><meshStandardMaterial color="#fff" /></mesh>
        <mesh position={[0, 0.012, 0]}><cylinderGeometry args={[0.003, 0.003, 0.01, 8]} /><meshStandardMaterial color="#666" /></mesh>
      </group>

      {/* Formula display */}
      {swinging && <Html position={[0.4, 0.35, 0]} center><div className="bg-blue-900 text-white p-2 rounded text-xs"><div className="font-bold">Pendule Simple</div><div className="text-yellow-300">T = 2pv(L/g)</div><div className="text-green-300 mt-1">L = 1m, g = 9.81</div><div className="text-lg text-white">T   2.01s</div></div></Html>}
    </group>
  )
}
// BIOLOGY EXPERIMENTS

function CellObservationExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary }) {
  const { slideReady, stainAdded, coverslipOn, focusedLow, focusedHigh } = state
  const handleAction = (a) => {
    if (a === "slide" && selectedItem === "slide") { setState(p => ({ ...p, slideReady: true })); setSelectedItem(null); setStep(1); toast.success("?? Lame prete!") }
    else if (a === "stain" && selectedItem === "stain") { setState(p => ({ ...p, stainAdded: true })); setSelectedItem(null); setStep(2); toast.success("?? Colorant!") }
    else if (a === "coverslip" && selectedItem === "coverslip") { setState(p => ({ ...p, coverslipOn: true })); setSelectedItem(null); setStep(3); toast.success("?? Lamelle!") }
    else if (a === "focus10" && selectedItem === "focus10") { setState(p => ({ ...p, focusedLow: true })); setSelectedItem(null); setStep(4); toast.success("?? x10!") }
    else if (a === "focus40" && selectedItem === "focus40") { setState(p => ({ ...p, focusedHigh: true })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("?? x40!") }
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
          ) : <div className="text-purple-400 text-2xl">???</div>}
        </div>
      </Html>}

      <TargetZone position={[-0.25, 0.08, 0]} label="?? Lame" active={selectedItem === "slide"} onClick={() => handleAction("slide")} />
      <TargetZone position={[-0.25, 0.15, 0]} label="?? Colorant" active={selectedItem === "stain" && slideReady} onClick={() => handleAction("stain")} />
      <TargetZone position={[-0.25, 0.22, 0]} label="?? Lamelle" active={selectedItem === "coverslip" && stainAdded} onClick={() => handleAction("coverslip")} />
      <TargetZone position={[0.15, 0.18, 0]} label="?? x10" active={selectedItem === "focus10" && coverslipOn} onClick={() => handleAction("focus10")} />
      <TargetZone position={[0.15, 0.25, 0]} label="?? x40" active={selectedItem === "focus40" && focusedLow} onClick={() => handleAction("focus40")} />

      <ClickableObject position={[-0.45, 0.06, 0.3]} selected={selectedItem === "slide"} enabled={!slideReady} onClick={() => setSelectedItem("slide")}><group><mesh><boxGeometry args={[0.07, 0.003, 0.025]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.4} /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-white px-1 py-0.5 rounded text-xs font-bold shadow">Lame</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.2, 0.06, 0.3]} selected={selectedItem === "stain"} enabled={slideReady && !stainAdded} onClick={() => setSelectedItem("stain")}><group><mesh><cylinderGeometry args={[0.018, 0.018, 0.06, 16]} /><meshStandardMaterial color="#3b82f6" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-bold">Bleu</div></Html></group></ClickableObject>
      <ClickableObject position={[0.05, 0.06, 0.3]} selected={selectedItem === "coverslip"} enabled={stainAdded && !coverslipOn} onClick={() => setSelectedItem("coverslip")}><group><mesh><boxGeometry args={[0.03, 0.002, 0.03]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.3} /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-200 px-1 py-0.5 rounded text-xs font-bold">Lamelle</div></Html></group></ClickableObject>
      <ClickableObject position={[0.3, 0.06, 0.3]} selected={selectedItem === "focus10"} enabled={coverslipOn && !focusedLow} onClick={() => setSelectedItem("focus10")}><group><mesh><cylinderGeometry args={[0.022, 0.022, 0.025, 16]} /><meshStandardMaterial color="#666" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-600 text-white px-1 py-0.5 rounded text-xs font-bold">x10</div></Html></group></ClickableObject>
      <ClickableObject position={[0.5, 0.06, 0.3]} selected={selectedItem === "focus40"} enabled={focusedLow && !focusedHigh} onClick={() => setSelectedItem("focus40")}><group><mesh><cylinderGeometry args={[0.018, 0.018, 0.035, 16]} /><meshStandardMaterial color="#444" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-800 text-white px-1 py-0.5 rounded text-xs font-bold">x40</div></Html></group></ClickableObject>

      {focusedHigh && <Html position={[-0.4, 0.3, 0]} center><div className="bg-purple-900 text-white p-2 rounded text-xs"><div className="font-bold">Cellule vegetale</div><div>  Noyau</div><div>  Cytoplasme</div><div>  Membrane</div></div></Html>}
      
    </group>
  )
}

function PhotosynthesisExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary }) {
  const { plantReady, lightOn, bubblesVisible, darkCompared } = state
  const bubbleRef = useRef()
  useFrame((s) => { if (bubbleRef.current && bubblesVisible) bubbleRef.current.position.y = 0.15 + Math.sin(s.clock.elapsedTime * 3) * 0.02 })
  
  const handleAction = (a) => {
    if (a === "plant" && selectedItem === "plant") { setState(p => ({ ...p, plantReady: true })); setSelectedItem(null); setStep(1); toast.success("?? Elodee prete!") }
    else if (a === "light" && selectedItem === "light") { setState(p => ({ ...p, lightOn: true })); setSelectedItem(null); setStep(2); toast.success("?? Lumiere!"); setTimeout(() => { setState(p => ({ ...p, bubblesVisible: true })); toast.success("?? Bulles O2!") }, 2000) }
    else if (a === "compare" && selectedItem === "compare") { setState(p => ({ ...p, darkCompared: true })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("?? Compare!") }
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

      <TargetZone position={[0, 0.12, -0.1]} label="?? Plante" active={selectedItem === "plant"} onClick={() => handleAction("plant")} />
      <TargetZone position={[-0.35, 0.2, -0.1]} label="?? Lumiere" active={selectedItem === "light" && plantReady} onClick={() => handleAction("light")} />
      <TargetZone position={[0.35, 0.15, -0.1]} label="?? Comparer" active={selectedItem === "compare" && bubblesVisible} onClick={() => handleAction("compare")} />

      <ClickableObject position={[-0.4, 0.08, 0.3]} selected={selectedItem === "plant"} enabled={!plantReady} onClick={() => setSelectedItem("plant")}><group><mesh><cylinderGeometry args={[0.006, 0.006, 0.1, 8]} /><meshStandardMaterial color="#228B22" /></mesh><mesh position={[0, 0.04, 0]}><sphereGeometry args={[0.02, 8, 8]} /><meshStandardMaterial color="#32CD32" /></mesh><Html position={[0, 0.08, 0]} center><div className="bg-green-500 text-white px-1 py-0.5 rounded text-xs font-bold">Elodee</div></Html></group></ClickableObject>
      <ClickableObject position={[0, 0.08, 0.3]} selected={selectedItem === "light"} enabled={plantReady && !lightOn} onClick={() => setSelectedItem("light")}><group><mesh><sphereGeometry args={[0.03, 16, 16]} /><meshStandardMaterial color="#ffd700" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-yellow-400 px-1 py-0.5 rounded text-xs font-bold">Lampe</div></Html></group></ClickableObject>
      <ClickableObject position={[0.4, 0.08, 0.3]} selected={selectedItem === "compare"} enabled={bubblesVisible && !darkCompared} onClick={() => setSelectedItem("compare")}><group><mesh><boxGeometry args={[0.05, 0.04, 0.03]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-gray-700 text-white px-1 py-0.5 rounded text-xs font-bold">Obscur</div></Html></group></ClickableObject>

      {darkCompared && <Html position={[0.4, 0.3, 0]} center><div className="bg-green-900 text-white p-2 rounded text-xs"><div className="font-bold">Photosynthese</div><div>Lumiere ? O2 ?</div><div>Obscurite ? Pas O2</div><div className="text-yellow-300">6CO2 + 6H2O ? C6H12O6 + 6O2</div></div></Html>}
      
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
      toast.success("? Migration complete!")
      setStep(4)
    }
  }, [migrating, migrationProgress])

  const handleAction = (a) => {
    if (a === "gel" && selectedItem === "gel") { setState(p => ({ ...p, gelReady: true })); setSelectedItem(null); setStep(1); toast.success("?? Gel pret!") }
    else if (a === "dna" && selectedItem === "dna") { setState(p => ({ ...p, dnaLoaded: true })); setSelectedItem(null); setStep(2); toast.success("?? ADN charge!") }
    else if (a === "power" && selectedItem === "power") { setState(p => ({ ...p, powerOn: true, migrating: true })); setSelectedItem(null); setStep(3); toast.success("? Migration!") }
    else if (a === "stain" && selectedItem === "stain") { setState(p => ({ ...p, stained: true })); setSelectedItem(null); setStep(5); toast.success("?? Colore!") }
    else if (a === "uv" && selectedItem === "uv") { setState(p => ({ ...p, uvOn: true })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("?? UV!") }
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
        {powerOn && <Html position={[0.2, 0.06, 0]} center><div className="bg-red-500 text-white px-1 rounded text-xs animate-pulse">? {migrationProgress}%</div></Html>}
      </group>

      {/* Power supply */}
      <group position={[0.35, 0.05, -0.1]}>
        <mesh><boxGeometry args={[0.12, 0.08, 0.1]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
        <Html position={[0, 0.02, 0.06]} center><div className={`text-xs px-1 rounded ${powerOn ? 'bg-green-500' : 'bg-gray-600'} text-white`}>{powerOn ? '120V' : 'OFF'}</div></Html>
      </group>

      <TargetZone position={[0, 0.1, -0.1]} label="?? Gel" active={selectedItem === "gel"} onClick={() => handleAction("gel")} />
      <TargetZone position={[-0.08, 0.12, -0.1]} label="?? ADN" active={selectedItem === "dna" && gelReady} onClick={() => handleAction("dna")} />
      <TargetZone position={[0.35, 0.1, -0.1]} label="? Power" active={selectedItem === "power" && dnaLoaded} onClick={() => handleAction("power")} />
      <TargetZone position={[0.15, 0.12, -0.1]} label="?? Colorer" active={selectedItem === "stain" && !migrating && migrationProgress >= 100} onClick={() => handleAction("stain")} />
      <TargetZone position={[-0.2, 0.15, -0.1]} label="?? UV" active={selectedItem === "uv" && stained} onClick={() => handleAction("uv")} />

      <ClickableObject position={[-0.45, 0.06, 0.3]} selected={selectedItem === "gel"} enabled={!gelReady} onClick={() => setSelectedItem("gel")}><group><mesh><boxGeometry args={[0.06, 0.04, 0.04]} /><meshStandardMaterial color="#f0f0f0" transparent opacity={0.7} /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-200 px-1 py-0.5 rounded text-xs font-bold">Gel</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.25, 0.06, 0.3]} selected={selectedItem === "dna"} enabled={gelReady && !dnaLoaded} onClick={() => setSelectedItem("dna")}><group><mesh><cylinderGeometry args={[0.012, 0.012, 0.05, 16]} /><meshStandardMaterial color="#3b82f6" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-bold">ADN</div></Html></group></ClickableObject>
      <ClickableObject position={[0, 0.06, 0.3]} selected={selectedItem === "power"} enabled={dnaLoaded && !powerOn} onClick={() => setSelectedItem("power")}><group><mesh><boxGeometry args={[0.04, 0.03, 0.03]} /><meshStandardMaterial color="#ef4444" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-red-500 text-white px-1 py-0.5 rounded text-xs font-bold">ON</div></Html></group></ClickableObject>
      <ClickableObject position={[0.25, 0.06, 0.3]} selected={selectedItem === "stain"} enabled={!migrating && migrationProgress >= 100 && !stained} onClick={() => setSelectedItem("stain")}><group><mesh><cylinderGeometry args={[0.015, 0.015, 0.05, 16]} /><meshStandardMaterial color="#8b5cf6" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-purple-500 text-white px-1 py-0.5 rounded text-xs font-bold">EtBr</div></Html></group></ClickableObject>
      <ClickableObject position={[0.45, 0.06, 0.3]} selected={selectedItem === "uv"} enabled={stained && !uvOn} onClick={() => setSelectedItem("uv")}><group><mesh><cylinderGeometry args={[0.02, 0.025, 0.08, 16]} /><meshStandardMaterial color="#1e1b4b" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-indigo-900 text-white px-1 py-0.5 rounded text-xs font-bold">UV</div></Html></group></ClickableObject>

      {uvOn && <Html position={[0, 0.35, 0]} center><div className="bg-indigo-900 text-white p-2 rounded text-xs"><div className="font-bold text-orange-400">?? Resultat</div><div>Piste 1: 3 bandes</div><div>Piste 2: 2 bandes</div><div>Piste 3: 3 bandes</div><div>Piste 4: 1 bande</div></div></Html>}
      
    </group>
  )
}

function MicroscopyExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary }) {
  const { slidePrep, stainApplied, coverOn, positioned, focus10, focus40 } = state
  
  const handleAction = (a) => {
    if (a === "slide" && selectedItem === "slide") { setState(p => ({ ...p, slidePrep: true })); setSelectedItem(null); setStep(1); toast.success("?? Lame preparee!") }
    else if (a === "stain" && selectedItem === "stain") { setState(p => ({ ...p, stainApplied: true })); setSelectedItem(null); setStep(2); toast.success("?? Coloration Gram!") }
    else if (a === "cover" && selectedItem === "cover") { setState(p => ({ ...p, coverOn: true })); setSelectedItem(null); setStep(3); toast.success("?? Lamelle placee!") }
    else if (a === "position" && selectedItem === "position") { setState(p => ({ ...p, positioned: true })); setSelectedItem(null); setStep(4); toast.success("?? Positionne!") }
    else if (a === "x10" && selectedItem === "x10") { setState(p => ({ ...p, focus10: true })); setSelectedItem(null); setStep(5); toast.success("?? Focus x10!") }
    else if (a === "x40" && selectedItem === "x40") { setState(p => ({ ...p, focus40: true })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("?? Focus x40!") }
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
          ) : <div className="text-purple-300 text-3xl">   </div>}
        </div>
      </Html>}

      <TargetZone position={[-0.2, 0.1, 0]} label="?? Lame" active={selectedItem === "slide"} onClick={() => handleAction("slide")} />
      <TargetZone position={[-0.2, 0.17, 0]} label="?? Gram" active={selectedItem === "stain" && slidePrep} onClick={() => handleAction("stain")} />
      <TargetZone position={[-0.2, 0.24, 0]} label="?? Lamelle" active={selectedItem === "cover" && stainApplied} onClick={() => handleAction("cover")} />
      <TargetZone position={[0.17, 0.15, 0]} label="?? Placer" active={selectedItem === "position" && coverOn} onClick={() => handleAction("position")} />
      <TargetZone position={[0.17, 0.22, 0]} label="?? x10" active={selectedItem === "x10" && positioned} onClick={() => handleAction("x10")} />
      <TargetZone position={[0.17, 0.29, 0]} label="?? x40" active={selectedItem === "x40" && focus10} onClick={() => handleAction("x40")} />

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
function SolarPanelExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { panelPlaced, meterConnected, measuring, angle, voltage } = state
  const [currentAngle, setCurrentAngle] = useState(45)
  const calculateVoltage = (a) => (12 * Math.sin(a * Math.PI / 180)).toFixed(1)
  
  const handleAction = (action) => {
    if (action === "panel" && selectedItem === "panel") { setState(p => ({ ...p, panelPlaced: true })); setSelectedItem(null); setStep(1); toast.success("?? Panneau place!") }
    else if (action === "meter" && selectedItem === "meter" && panelPlaced) { setState(p => ({ ...p, meterConnected: true, measuring: true, voltage: calculateVoltage(45) })); setSelectedItem(null); setStep(2); toast.success("?? Multimetre connecte!") }
    else if (action === "optimize" && measuring) { setCurrentAngle(90); setState(p => ({ ...p, angle: 90, voltage: "12.0" })); setStep(experiment.steps.length - 1); toast.success("? Rendement optimal a 90 !") }
  }
  
  return (
    <group>
      {/* Sun lamp */}
      <group position={[0, 0.8, -0.3]}>
        <mesh><sphereGeometry args={[0.1, 32, 32]} /><meshBasicMaterial color="#ffdd00" /></mesh>
        <pointLight color="#ffdd00" intensity={3} distance={2} />
        <Html position={[0, 0.15, 0]} center><div className="bg-yellow-400 px-2 py-1 rounded text-xs font-bold">?? Soleil</div></Html>
      </group>

      {/* Solar panel */}
      {panelPlaced && <group position={[0, 0.2, 0]} rotation={[-(90 - currentAngle) * Math.PI / 180, 0, 0]}>
        <mesh><boxGeometry args={[0.4, 0.3, 0.02]} /><meshStandardMaterial color="#1e3a5f" metalness={0.8} /></mesh>
        <mesh position={[0, 0, 0.011]}><boxGeometry args={[0.35, 0.25, 0.005]} /><meshStandardMaterial color="#4a90d9" metalness={0.9} /></mesh>
        <Html position={[0, 0.2, 0]} center><div className="bg-blue-900 text-white px-2 py-1 rounded text-xs">Panneau {currentAngle} </div></Html>
      </group>}

      {/* Multimeter */}
      {meterConnected && <group position={[0.35, 0.15, 0.2]}>
        <mesh><boxGeometry args={[0.1, 0.15, 0.03]} /><meshStandardMaterial color="#333" /></mesh>
        <Html position={[0, 0, 0.02]} center><div className="bg-green-500 text-white px-2 py-1 rounded text-sm font-mono">{voltage}V</div></Html>
        <Html position={[0, -0.12, 0]} center><div className="bg-gray-700 text-white px-2 py-1 rounded text-xs">Multimetre</div></Html>
      </group>}

      {/* Target zones */}
      <TargetZone position={[0, 0.2, 0]} label="?? Panneau" active={selectedItem === "panel"} onClick={() => handleAction("panel")} />
      {panelPlaced && <TargetZone position={[0.35, 0.15, 0.2]} label="?? Connecter" active={selectedItem === "meter"} onClick={() => handleAction("meter")} />}
      {measuring && <TargetZone position={[0, 0.4, 0]} label="?? Optimiser 90 " active={true} onClick={() => handleAction("optimize")} />}

      {/* Clickable items */}
      {!panelPlaced && <ClickableObject position={[-0.4, 0.1, 0.3]} selected={selectedItem === "panel"} enabled={true} onClick={() => setSelectedItem(selectedItem === "panel" ? null : "panel")}><group><mesh><boxGeometry args={[0.15, 0.1, 0.01]} /><meshStandardMaterial color="#1e3a5f" /></mesh><Html position={[0, 0.08, 0]} center><div className="bg-blue-100 px-2 py-1 rounded text-xs font-bold">Panneau</div></Html></group></ClickableObject>}
      {!meterConnected && panelPlaced && <ClickableObject position={[0.4, 0.1, 0.3]} selected={selectedItem === "meter"} enabled={true} onClick={() => setSelectedItem(selectedItem === "meter" ? null : "meter")}><group><mesh><boxGeometry args={[0.06, 0.08, 0.02]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.07, 0]} center><div className="bg-gray-200 px-2 py-1 rounded text-xs font-bold">Multimetre</div></Html></group></ClickableObject>}

      {/* Info display */}
      {measuring && <Html position={[-0.4, 0.4, 0]} center><div className="bg-blue-900 text-white p-2 rounded text-xs"><div className="font-bold">Effet Photovoltaique</div><div className="text-yellow-300">P = U   I</div><div className="text-green-300">Angle: {currentAngle} </div></div></Html>}
    </group>
  )
}

function SoilNPKExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { sampleTaken, nTested, pTested, kTested } = state
  const [results, setResults] = useState({ n: 0, p: 0, k: 0 })
  
  const handleAction = (action) => {
    if (action === "sample" && selectedItem === "sample") { setState(p => ({ ...p, sampleTaken: true })); setSelectedItem(null); setStep(1); toast.success("?? Echantillon preleve!") }
    else if (action === "testN" && sampleTaken && !nTested) { setState(p => ({ ...p, nTested: true })); setResults(r => ({ ...r, n: 45 })); setStep(2); toast.success("N = 45 mg/kg") }
    else if (action === "testP" && nTested && !pTested) { setState(p => ({ ...p, pTested: true })); setResults(r => ({ ...r, p: 28 })); setStep(3); toast.success("P = 28 mg/kg") }
    else if (action === "testK" && pTested && !kTested) { setState(p => ({ ...p, kTested: true })); setResults(r => ({ ...r, k: 62 })); setStep(experiment.steps.length - 1); toast.success("K = 62 mg/kg - Sol fertile!") }
  }
  
  return (
    <group>
      {/* Soil sample */}
      <group position={[-0.2, 0.08, 0]}>
        <mesh><cylinderGeometry args={[0.08, 0.08, 0.1, 32]} /><meshStandardMaterial color="#8B4513" /></mesh>
        <Html position={[0, -0.08, 0]} center><div className="bg-amber-800 text-white px-2 py-1 rounded text-xs">Sol</div></Html>
      </group>

      {/* Test tubes */}
      <group position={[0.15, 0.15, 0]}>
        <mesh><cylinderGeometry args={[0.02, 0.02, 0.12, 16]} /><meshPhysicalMaterial color={nTested ? "#22c55e" : "#ddd"} transparent opacity={0.8} /></mesh>
        <Html position={[0, 0.1, 0]} center><div className={`px-2 py-1 rounded text-xs font-bold ${nTested ? "bg-green-500 text-white" : "bg-gray-200"}`}>N {nTested ? results.n : "?"}</div></Html>
      </group>
      <group position={[0.25, 0.15, 0]}>
        <mesh><cylinderGeometry args={[0.02, 0.02, 0.12, 16]} /><meshPhysicalMaterial color={pTested ? "#f97316" : "#ddd"} transparent opacity={0.8} /></mesh>
        <Html position={[0, 0.1, 0]} center><div className={`px-2 py-1 rounded text-xs font-bold ${pTested ? "bg-orange-500 text-white" : "bg-gray-200"}`}>P {pTested ? results.p : "?"}</div></Html>
      </group>
      <group position={[0.35, 0.15, 0]}>
        <mesh><cylinderGeometry args={[0.02, 0.02, 0.12, 16]} /><meshPhysicalMaterial color={kTested ? "#a855f7" : "#ddd"} transparent opacity={0.8} /></mesh>
        <Html position={[0, 0.1, 0]} center><div className={`px-2 py-1 rounded text-xs font-bold ${kTested ? "bg-purple-500 text-white" : "bg-gray-200"}`}>K {kTested ? results.k : "?"}</div></Html>
      </group>

      {/* Target zones */}
      <TargetZone position={[-0.2, 0.15, 0]} label="?? Prelever" active={selectedItem === "sample"} onClick={() => handleAction("sample")} />
      {sampleTaken && <TargetZone position={[0.15, 0.25, 0]} label="Test N" active={!nTested} onClick={() => handleAction("testN")} />}
      {nTested && <TargetZone position={[0.25, 0.25, 0]} label="Test P" active={!pTested} onClick={() => handleAction("testP")} />}
      {pTested && <TargetZone position={[0.35, 0.25, 0]} label="Test K" active={!kTested} onClick={() => handleAction("testK")} />}

      {/* Clickable items */}
      {!sampleTaken && <ClickableObject position={[-0.4, 0.08, 0.3]} selected={selectedItem === "sample"} enabled={true} onClick={() => setSelectedItem(selectedItem === "sample" ? null : "sample")}><group><mesh><boxGeometry args={[0.08, 0.06, 0.08]} /><meshStandardMaterial color="#8B4513" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-amber-100 px-2 py-1 rounded text-xs font-bold">Echantillon</div></Html></group></ClickableObject>}

      {/* Results */}
      {kTested && <Html position={[0, 0.45, 0]} center><div className="bg-green-800 text-white p-3 rounded text-xs"><div className="font-bold mb-1">Analyse NPK Complete</div><div className="text-green-300">N: {results.n} mg/kg (Bon)</div><div className="text-orange-300">P: {results.p} mg/kg (Moyen)</div><div className="text-purple-300">K: {results.k} mg/kg (Bon)</div><div className="mt-1 text-yellow-300">Sol fertile pour arachide!</div></div></Html>}
    </group>
  )
}

function BloodPressureExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { cuffPlaced, inflated, systolicRead, diastolicRead } = state
  const [pressure, setPressure] = useState(0)
  
  const handleAction = (action) => {
    if (action === "cuff" && selectedItem === "cuff") { setState(p => ({ ...p, cuffPlaced: true })); setSelectedItem(null); setStep(1); toast.success("?? Brassard installe!") }
    else if (action === "inflate" && cuffPlaced && !inflated) { setState(p => ({ ...p, inflated: true })); setPressure(180); setStep(2); toast.success("Gonflage...") }
    else if (action === "systolic" && inflated && !systolicRead) { setState(p => ({ ...p, systolicRead: true })); setPressure(120); setStep(3); toast.success("Systolique: 120 mmHg") }
    else if (action === "diastolic" && systolicRead && !diastolicRead) { setState(p => ({ ...p, diastolicRead: true })); setPressure(80); setStep(experiment.steps.length - 1); toast.success("Diastolique: 80 mmHg - Normal!") }
  }
  
  return (
    <group>
      {/* Arm */}
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.06, 0.05, 0.4, 32]} /><meshStandardMaterial color="#e8beac" /></mesh>
      
      {/* Cuff */}
      {cuffPlaced && <group position={[0, 0.1, 0]}>
        <mesh><cylinderGeometry args={[0.08, 0.08, 0.12, 32, 1, true]} /><meshStandardMaterial color="#2563eb" /></mesh>
        <Html position={[0, 0.1, 0]} center><div className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Brassard</div></Html>
      </group>}

      {/* Manometer */}
      <group position={[0.3, 0.2, 0]}>
        <mesh><cylinderGeometry args={[0.06, 0.06, 0.02, 32]} /><meshStandardMaterial color="#fff" /></mesh>
        <Html position={[0, 0, 0.02]} center><div className="bg-white border-2 border-gray-400 w-16 h-16 rounded-full flex items-center justify-center"><span className="text-xl font-bold">{pressure}</span></div></Html>
        <Html position={[0, -0.08, 0]} center><div className="bg-gray-700 text-white px-2 py-1 rounded text-xs">mmHg</div></Html>
      </group>

      {/* Target zones */}
      <TargetZone position={[0, 0.15, 0.1]} label="?? Brassard" active={selectedItem === "cuff"} onClick={() => handleAction("cuff")} />
      {cuffPlaced && !inflated && <TargetZone position={[0.15, 0.2, 0]} label="?? Gonfler" active={true} onClick={() => handleAction("inflate")} />}
      {inflated && !systolicRead && <TargetZone position={[0.3, 0.3, 0]} label="?? Systole" active={true} onClick={() => handleAction("systolic")} />}
      {systolicRead && !diastolicRead && <TargetZone position={[0.3, 0.3, 0]} label="?? Diastole" active={true} onClick={() => handleAction("diastolic")} />}

      {/* Clickable items */}
      {!cuffPlaced && <ClickableObject position={[-0.35, 0.1, 0.3]} selected={selectedItem === "cuff"} enabled={true} onClick={() => setSelectedItem(selectedItem === "cuff" ? null : "cuff")}><group><mesh><torusGeometry args={[0.05, 0.02, 8, 32]} /><meshStandardMaterial color="#2563eb" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-blue-100 px-2 py-1 rounded text-xs font-bold">Brassard</div></Html></group></ClickableObject>}

      {/* Results */}
      {diastolicRead && <Html position={[-0.3, 0.4, 0]} center><div className="bg-green-800 text-white p-3 rounded text-xs"><div className="font-bold mb-1">Tension Arterielle</div><div className="text-2xl text-green-300">120/80</div><div className="text-green-300">mmHg - Normal</div></div></Html>}
    </group>
  )
}

function ElectricMotorExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { coilPlaced, magnetsPlaced, powerConnected, spinning } = state
  const motorRef = useRef()
  useFrame((s) => { if (spinning && motorRef.current) motorRef.current.rotation.z = s.clock.elapsedTime * 10 })
  
  const handleAction = (action) => {
    if (action === "coil" && selectedItem === "coil") { setState(p => ({ ...p, coilPlaced: true })); setSelectedItem(null); setStep(1); toast.success("?? Bobine placee!") }
    else if (action === "magnets" && selectedItem === "magnets" && coilPlaced) { setState(p => ({ ...p, magnetsPlaced: true })); setSelectedItem(null); setStep(2); toast.success("?? Aimants places!") }
    else if (action === "power" && selectedItem === "power" && magnetsPlaced) { setState(p => ({ ...p, powerConnected: true, spinning: true })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("? Moteur en marche!") }
  }
  
  return (
    <group>
      {/* Motor base */}
      <mesh position={[0, 0.03, 0]}><cylinderGeometry args={[0.15, 0.15, 0.06, 32]} /><meshStandardMaterial color="#444" metalness={0.8} /></mesh>
      <Html position={[0, -0.02, 0.18]} center><div className="bg-gray-800 text-white px-2 py-1 rounded text-xs">Base Moteur</div></Html>
      
      {/* Magnets */}
      {magnetsPlaced && <>
        <mesh position={[-0.1, 0.12, 0]}><boxGeometry args={[0.03, 0.12, 0.06]} /><meshStandardMaterial color="#ef4444" /></mesh>
        <mesh position={[0.1, 0.12, 0]}><boxGeometry args={[0.03, 0.12, 0.06]} /><meshStandardMaterial color="#3b82f6" /></mesh>
        <Html position={[-0.1, 0.22, 0]} center><div className="bg-red-500 text-white px-1 rounded text-xs">N</div></Html>
        <Html position={[0.1, 0.22, 0]} center><div className="bg-blue-500 text-white px-1 rounded text-xs">S</div></Html>
      </>}
      
      {/* Coil/Rotor */}
      {coilPlaced && <group ref={motorRef} position={[0, 0.12, 0]}>
        <mesh rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.05, 0.01, 8, 32]} /><meshStandardMaterial color="#f59e0b" metalness={0.9} /></mesh>
        <mesh><cylinderGeometry args={[0.008, 0.008, 0.15, 8]} /><meshStandardMaterial color="#666" /></mesh>
      </group>}
      
      {/* Power indicator */}
      {powerConnected && <Html position={[0.25, 0.2, 0]} center><div className="bg-green-500 text-white p-2 rounded text-xs"><div className="font-bold">F = BIL</div><div className="text-yellow-300">Vitesse: 1200 RPM</div></div></Html>}

      {/* Target zones */}
      <TargetZone position={[0, 0.12, 0]} label="?? Bobine" active={selectedItem === "coil"} onClick={() => handleAction("coil")} />
      {coilPlaced && <TargetZone position={[0, 0.12, 0.1]} label="?? Aimants" active={selectedItem === "magnets"} onClick={() => handleAction("magnets")} />}
      {magnetsPlaced && <TargetZone position={[0.2, 0.1, 0]} label="? Alimenter" active={selectedItem === "power"} onClick={() => handleAction("power")} />}

      {/* Clickable items */}
      {!coilPlaced && <ClickableObject position={[-0.35, 0.08, 0.3]} selected={selectedItem === "coil"} enabled={true} onClick={() => setSelectedItem(selectedItem === "coil" ? null : "coil")}><group><mesh rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.04, 0.008, 8, 32]} /><meshStandardMaterial color="#f59e0b" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-yellow-100 px-2 py-1 rounded text-xs font-bold">Bobine Cu</div></Html></group></ClickableObject>}
      {!magnetsPlaced && coilPlaced && <ClickableObject position={[0, 0.08, 0.3]} selected={selectedItem === "magnets"} enabled={true} onClick={() => setSelectedItem(selectedItem === "magnets" ? null : "magnets")}><group><mesh><boxGeometry args={[0.06, 0.04, 0.02]} /><meshStandardMaterial color="#ef4444" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-red-100 px-2 py-1 rounded text-xs font-bold">Aimants</div></Html></group></ClickableObject>}
      {!powerConnected && magnetsPlaced && <ClickableObject position={[0.35, 0.08, 0.3]} selected={selectedItem === "power"} enabled={true} onClick={() => setSelectedItem(selectedItem === "power" ? null : "power")}><group><mesh><boxGeometry args={[0.06, 0.08, 0.03]} /><meshStandardMaterial color="#22c55e" /></mesh><Html position={[0, 0.07, 0]} center><div className="bg-green-100 px-2 py-1 rounded text-xs font-bold">12V DC</div></Html></group></ClickableObject>}
    </group>
  )
}

function HydroponicsExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { tankReady, plantsPlaced, phAdjusted, ecChecked } = state
  const [ph, setPh] = useState(7.0)
  const [ec, setEc] = useState(0)
  
  const handleAction = (action) => {
    if (action === "tank" && selectedItem === "tank") { setState(p => ({ ...p, tankReady: true })); setEc(1.8); setSelectedItem(null); setStep(1); toast.success("?? Solution nutritive prete!") }
    else if (action === "plants" && selectedItem === "plants" && tankReady) { setState(p => ({ ...p, plantsPlaced: true })); setSelectedItem(null); setStep(2); toast.success("?? Plants installes!") }
    else if (action === "ph" && plantsPlaced && !phAdjusted) { setState(p => ({ ...p, phAdjusted: true })); setPh(6.0); setStep(3); toast.success("pH ajuste a 6.0!") }
    else if (action === "ec" && phAdjusted && !ecChecked) { setState(p => ({ ...p, ecChecked: true })); setStep(experiment.steps.length - 1); toast.success("EC = 1.8 mS/cm - Optimal!") }
  }
  
  return (
    <group>
      {/* Hydroponic tank */}
      <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.5, 0.1, 0.3]} /><meshPhysicalMaterial color="#1e40af" transparent opacity={0.3} /></mesh>
      {tankReady && <mesh position={[0, 0.02, 0]}><boxGeometry args={[0.48, 0.06, 0.28]} /><meshStandardMaterial color="#22d3ee" transparent opacity={0.7} /></mesh>}
      <Html position={[0, -0.02, 0.18]} center><div className="bg-blue-800 text-white px-2 py-1 rounded text-xs">Bac Hydroponique</div></Html>
      
      {/* Plants */}
      {plantsPlaced && <>
        <group position={[-0.15, 0.15, 0]}>
          <mesh><cylinderGeometry args={[0.02, 0.02, 0.12, 8]} /><meshStandardMaterial color="#22c55e" /></mesh>
          <mesh position={[0, 0.08, 0]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#16a34a" /></mesh>
        </group>
        <group position={[0, 0.15, 0]}>
          <mesh><cylinderGeometry args={[0.02, 0.02, 0.14, 8]} /><meshStandardMaterial color="#22c55e" /></mesh>
          <mesh position={[0, 0.1, 0]}><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color="#16a34a" /></mesh>
        </group>
        <group position={[0.15, 0.15, 0]}>
          <mesh><cylinderGeometry args={[0.02, 0.02, 0.1, 8]} /><meshStandardMaterial color="#22c55e" /></mesh>
          <mesh position={[0, 0.07, 0]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial color="#16a34a" /></mesh>
        </group>
        <Html position={[0, 0.28, 0]} center><div className="bg-green-600 text-white px-2 py-1 rounded text-xs">Laitue</div></Html>
      </>}
      
      {/* Meters */}
      {plantsPlaced && <Html position={[0.35, 0.2, 0]} center><div className="bg-gray-800 text-white p-2 rounded text-xs space-y-1">
        <div className={phAdjusted ? "text-green-400" : "text-yellow-400"}>pH: {ph.toFixed(1)}</div>
        <div className={ecChecked ? "text-green-400" : "text-blue-400"}>EC: {ec} mS/cm</div>
      </div></Html>}

      {/* Target zones */}
      <TargetZone position={[0, 0.1, 0]} label="?? Solution" active={selectedItem === "tank"} onClick={() => handleAction("tank")} />
      {tankReady && <TargetZone position={[0, 0.2, 0]} label="?? Plants" active={selectedItem === "plants"} onClick={() => handleAction("plants")} />}
      {plantsPlaced && !phAdjusted && <TargetZone position={[0.3, 0.15, 0]} label="?? pH" active={true} onClick={() => handleAction("ph")} />}
      {phAdjusted && !ecChecked && <TargetZone position={[0.3, 0.15, 0]} label="?? EC" active={true} onClick={() => handleAction("ec")} />}

      {/* Clickable items */}
      {!tankReady && <ClickableObject position={[-0.4, 0.08, 0.3]} selected={selectedItem === "tank"} enabled={true} onClick={() => setSelectedItem(selectedItem === "tank" ? null : "tank")}><group><mesh><boxGeometry args={[0.08, 0.05, 0.05]} /><meshStandardMaterial color="#22d3ee" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-cyan-100 px-2 py-1 rounded text-xs font-bold">Nutriments</div></Html></group></ClickableObject>}
      {!plantsPlaced && tankReady && <ClickableObject position={[0.4, 0.08, 0.3]} selected={selectedItem === "plants"} enabled={true} onClick={() => setSelectedItem(selectedItem === "plants" ? null : "plants")}><group><mesh><cylinderGeometry args={[0.02, 0.02, 0.06, 8]} /><meshStandardMaterial color="#22c55e" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-green-100 px-2 py-1 rounded text-xs font-bold">Plants</div></Html></group></ClickableObject>}
    </group>
  )
}

function ECGExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { electrodesPlaced, connected, calibrated, recording, analyzed } = state
  const [heartRate, setHeartRate] = useState(0)
  const [waveOffset, setWaveOffset] = useState(0)
  
  useEffect(() => {
    if (recording) {
      const interval = setInterval(() => setWaveOffset(p => (p + 1) % 100), 50)
      return () => clearInterval(interval)
    }
  }, [recording])
  
  const handleAction = (action) => {
    if (action === "electrodes" && selectedItem === "electrodes") { setState(p => ({ ...p, electrodesPlaced: true })); setSelectedItem(null); setStep(1); toast.success("?? Electrodes placees!") }
    else if (action === "connect" && electrodesPlaced && !connected) { setState(p => ({ ...p, connected: true })); setStep(2); toast.success("?? Derivations connectees!") }
    else if (action === "calibrate" && connected && !calibrated) { setState(p => ({ ...p, calibrated: true })); setStep(3); toast.success("?? Calibration OK!") }
    else if (action === "record" && calibrated && !recording) { setState(p => ({ ...p, recording: true })); setHeartRate(72); setStep(4); toast.success("?? Enregistrement...") }
    else if (action === "analyze" && recording && !analyzed) { setState(p => ({ ...p, analyzed: true })); setStep(experiment.steps.length - 1); toast.success("? ECG normal - 72 BPM") }
  }
  
  return (
    <group>
      {/* Patient torso */}
      <mesh position={[0, 0.15, 0]}><boxGeometry args={[0.4, 0.3, 0.15]} /><meshStandardMaterial color="#e8beac" /></mesh>
      <Html position={[0, -0.02, 0.1]} center><div className="bg-gray-600 text-white px-2 py-1 rounded text-xs">Patient</div></Html>
      
      {/* Electrodes */}
      {elecElectrodesOn && <>
        <mesh position={[-0.12, 0.22, 0.08]}><sphereGeometry args={[0.02, 16, 16]} /><meshStandardMaterial color="#ef4444" /></mesh>
        <mesh position={[0.12, 0.22, 0.08]}><sphereGeometry args={[0.02, 16, 16]} /><meshStandardMaterial color="#fbbf24" /></mesh>
        <mesh position={[-0.12, 0.08, 0.08]}><sphereGeometry args={[0.02, 16, 16]} /><meshStandardMaterial color="#22c55e" /></mesh>
        <mesh position={[0.12, 0.08, 0.08]}><sphereGeometry args={[0.02, 16, 16]} /><meshStandardMaterial color="#333" /></mesh>
      </>}
      
      {/* ECG Machine */}
      <group position={[0.4, 0.2, 0]}>
        <mesh><boxGeometry args={[0.2, 0.25, 0.08]} /><meshStandardMaterial color="#f5f5f5" /></mesh>
        <mesh position={[0, 0.03, 0.041]}><boxGeometry args={[0.16, 0.12, 0.005]} /><meshStandardMaterial color={recording ? "#111" : "#333"} /></mesh>
        {recording && <Html position={[0, 0.03, 0.05]} center>
          <div className="w-32 h-12 bg-black overflow-hidden">
            <svg width="128" height="48" className="text-green-500">
              <path d={`M ${waveOffset} 24 l 10 0 l 2 -15 l 4 30 l 2 -15 l 15 0 l 3 -8 l 3 8 l 15 0`} stroke="currentColor" fill="none" strokeWidth="2"/>
            </svg>
          </div>
        </Html>}
        {heartRate > 0 && <Html position={[0.06, -0.08, 0.05]} center><div className="text-red-500 font-bold text-sm">{heartRate} BPM</div></Html>}
      </group>

      {/* Target zones */}
      <TargetZone position={[0, 0.2, 0.1]} label="?? Electrodes" active={selectedItem === "electrodes"} onClick={() => handleAction("electrodes")} />
      {electrodesPlaced && !connected && <TargetZone position={[0.3, 0.2, 0]} label="?? Connecter" active={true} onClick={() => handleAction("connect")} />}
      {connected && !calibrated && <TargetZone position={[0.4, 0.3, 0]} label="?? Calibrer" active={true} onClick={() => handleAction("calibrate")} />}
      {calibrated && !recording && <TargetZone position={[0.4, 0.2, 0]} label="?? Enregistrer" active={true} onClick={() => handleAction("record")} />}
      {recording && !analyzed && <TargetZone position={[0.4, 0.1, 0]} label="?? Analyser" active={true} onClick={() => handleAction("analyze")} />}

      {/* Clickable items */}
      {!electrodesPlaced && <ClickableObject position={[-0.4, 0.1, 0.3]} selected={selectedItem === "electrodes"} enabled={true} onClick={() => setSelectedItem(selectedItem === "electrodes" ? null : "electrodes")}><group><mesh><sphereGeometry args={[0.025, 16, 16]} /><meshStandardMaterial color="#ef4444" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-red-100 px-2 py-1 rounded text-xs font-bold">Electrodes</div></Html></group></ClickableObject>}

      {/* Result */}
      {analyzed && <Html position={[-0.3, 0.4, 0]} center><div className="bg-green-800 text-white p-3 rounded text-xs"><div className="font-bold mb-1">ECG Normal</div><div className="text-green-300">Rythme sinusal</div><div className="text-yellow-300">FC: 72 BPM</div><div className="text-blue-300">PR: 0.16s QRS: 0.08s</div></div></Html>}
    </group>
  )
}

function BloodAnalysisExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { bloodDrawn, centrifuged, rbcCounted, wbcCounted, hbMeasured } = state
  const [results, setResults] = useState({ rbc: 0, wbc: 0, hb: 0, plt: 0 })
  
  const handleAction = (action) => {
    if (action === "draw" && selectedItem === "syringe") { setState(p => ({ ...p, bloodDrawn: true })); setSelectedItem(null); setStep(1); toast.success("?? Sang preleve!") }
    else if (action === "centrifuge" && bloodDrawn && !centrifuged) { setState(p => ({ ...p, centrifuged: true })); setStep(2); toast.success("?? Centrifugation...") }
    else if (action === "rbc" && centrifuged && !rbcCounted) { setState(p => ({ ...p, rbcCounted: true })); setResults(r => ({ ...r, rbc: 4.8 })); setStep(3); toast.success("GR: 4.8 M/mm ") }
    else if (action === "wbc" && rbcCounted && !wbcCounted) { setState(p => ({ ...p, wbcCounted: true })); setResults(r => ({ ...r, wbc: 7200, plt: 245000 })); setStep(4); toast.success("GB: 7200/mm ") }
    else if (action === "hb" && wbcCounted && !hbMeasured) { setState(p => ({ ...p, hbMeasured: true })); setResults(r => ({ ...r, hb: 14.2 })); setStep(experiment.steps.length - 1); toast.success("Hb: 14.2 g/dL - NFS normale!") }
  }
  
  return (
    <group>
      {/* Blood tube */}
      <group position={[-0.15, 0.15, 0]}>
        <mesh><cylinderGeometry args={[0.02, 0.02, 0.12, 16]} /><meshPhysicalMaterial color="#7c3aed" transparent opacity={0.5} /></mesh>
        {bloodDrawn && <mesh position={[0, -0.02, 0]}><cylinderGeometry args={[0.018, 0.018, 0.08, 16]} /><meshStandardMaterial color="#dc2626" /></mesh>}
        {centrifuged && <>
          <mesh position={[0, -0.04, 0]}><cylinderGeometry args={[0.018, 0.018, 0.04, 16]} /><meshStandardMaterial color="#dc2626" /></mesh>
          <mesh position={[0, 0.01, 0]}><cylinderGeometry args={[0.018, 0.018, 0.04, 16]} /><meshStandardMaterial color="#fef3c7" /></mesh>
        </>}
        <Html position={[0, -0.1, 0]} center><div className="bg-purple-600 text-white px-2 py-1 rounded text-xs">Tube EDTA</div></Html>
      </group>
      
      {/* Centrifuge */}
      <group position={[0.1, 0.1, 0]}>
        <mesh><cylinderGeometry args={[0.1, 0.1, 0.06, 32]} /><meshStandardMaterial color="#444" /></mesh>
        <Html position={[0, -0.06, 0]} center><div className="bg-gray-700 text-white px-2 py-1 rounded text-xs">Centrifugeuse</div></Html>
      </group>
      
      {/* Analyzer display */}
      {centrifuged && <Html position={[0.35, 0.25, 0]} center><div className="bg-gray-900 text-white p-2 rounded text-xs font-mono">
        <div className="font-bold mb-1 text-green-400">NFS Resultats</div>
        <div className={rbcCounted ? "text-green-300" : "text-gray-500"}>GR: {rbcCounted ? results.rbc + " M/mm " : "---"}</div>
        <div className={wbcCounted ? "text-green-300" : "text-gray-500"}>GB: {wbcCounted ? results.wbc + "/mm " : "---"}</div>
        <div className={hbMeasured ? "text-green-300" : "text-gray-500"}>Hb: {hbMeasured ? results.hb + " g/dL" : "---"}</div>
        <div className={wbcCounted ? "text-green-300" : "text-gray-500"}>Plt: {wbcCounted ? results.plt + "/mm " : "---"}</div>
      </div></Html>}

      {/* Target zones */}
      <TargetZone position={[-0.15, 0.2, 0]} label="?? Prelever" active={selectedItem === "syringe"} onClick={() => handleAction("draw")} />
      {bloodDrawn && !centrifuged && <TargetZone position={[0.1, 0.15, 0]} label="?? Centrifuger" active={true} onClick={() => handleAction("centrifuge")} />}
      {centrifuged && !rbcCounted && <TargetZone position={[0.3, 0.2, 0]} label="?? GR" active={true} onClick={() => handleAction("rbc")} />}
      {rbcCounted && !wbcCounted && <TargetZone position={[0.3, 0.2, 0]} label="? GB" active={true} onClick={() => handleAction("wbc")} />}
      {wbcCounted && !hbMeasured && <TargetZone position={[0.3, 0.2, 0]} label="?? Hb" active={true} onClick={() => handleAction("hb")} />}

      {/* Clickable items */}
      {!bloodDrawn && <ClickableObject position={[-0.4, 0.1, 0.3]} selected={selectedItem === "syringe"} enabled={true} onClick={() => setSelectedItem(selectedItem === "syringe" ? null : "syringe")}><group><mesh rotation={[0, 0, Math.PI/4]}><cylinderGeometry args={[0.01, 0.01, 0.1, 16]} /><meshStandardMaterial color="#f5f5f5" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">Seringue</div></Html></group></ClickableObject>}

      {/* Result */}
      {hbMeasured && <Html position={[-0.3, 0.4, 0]} center><div className="bg-green-800 text-white p-3 rounded text-xs"><div className="font-bold mb-1">NFS Complete</div><div className="text-green-300">Tous les parametres normaux</div><div className="text-yellow-300">Pas d anemie</div></div></Html>}
    </group>
  )
}

function GlucoseTestExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { fingerCleaned, pricked, bloodApplied, resultRead } = state
  const [glucose, setGlucose] = useState(0)
  
  const handleAction = (action) => {
    if (action === "clean" && selectedItem === "alcohol") { setState(p => ({ ...p, fingerCleaned: true })); setSelectedItem(null); setStep(1); toast.success("?? Doigt desinfecte!") }
    else if (action === "prick" && selectedItem === "lancet" && fingerCleaned) { setState(p => ({ ...p, pricked: true })); setSelectedItem(null); setStep(2); toast.success("?? Piqure effectuee!") }
    else if (action === "apply" && pricked && !bloodApplied) { setState(p => ({ ...p, bloodApplied: true })); setStep(3); toast.success("?? Sang applique!") }
    else if (action === "read" && bloodApplied && !resultRead) { setState(p => ({ ...p, resultRead: true })); setGlucose(0.95); setStep(experiment.steps.length - 1); toast.success("Glycemie: 0.95 g/L - Normal!") }
  }
  
  return (
    <group>
      {/* Finger */}
      <mesh position={[-0.15, 0.1, 0]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.025, 0.02, 0.12, 16]} /><meshStandardMaterial color={pricked ? "#ffcccc" : "#e8beac"} /></mesh>
      {pricked && <mesh position={[-0.2, 0.1, 0]}><sphereGeometry args={[0.015, 16, 16]} /><meshStandardMaterial color="#dc2626" /></mesh>}
      <Html position={[-0.15, 0.02, 0]} center><div className="bg-gray-600 text-white px-2 py-1 rounded text-xs">Doigt</div></Html>
      
      {/* Glucometer */}
      <group position={[0.15, 0.1, 0]}>
        <mesh><boxGeometry args={[0.12, 0.18, 0.03]} /><meshStandardMaterial color="#f5f5f5" /></mesh>
        <mesh position={[0, 0.06, 0.016]}><boxGeometry args={[0.08, 0.05, 0.005]} /><meshStandardMaterial color={resultRead ? "#22c55e" : "#333"} /></mesh>
        {resultRead && <Html position={[0, 0.06, 0.02]} center><div className="text-white font-mono font-bold text-sm">{glucose}</div></Html>}
        <Html position={[0, -0.12, 0]} center><div className="bg-gray-700 text-white px-2 py-1 rounded text-xs">Glucometre</div></Html>
      </group>
      
      {/* Strip slot */}
      {bloodApplied && <mesh position={[0.15, -0.02, 0.016]}><boxGeometry args={[0.02, 0.04, 0.003]} /><meshStandardMaterial color="#fbbf24" /></mesh>}

      {/* Target zones */}
      <TargetZone position={[-0.15, 0.15, 0]} label="?? Nettoyer" active={selectedItem === "alcohol"} onClick={() => handleAction("clean")} />
      {fingerCleaned && <TargetZone position={[-0.2, 0.15, 0]} label="?? Piquer" active={selectedItem === "lancet"} onClick={() => handleAction("prick")} />}
      {pricked && !bloodApplied && <TargetZone position={[0.15, 0, 0]} label="?? Appliquer" active={true} onClick={() => handleAction("apply")} />}
      {bloodApplied && !resultRead && <TargetZone position={[0.15, 0.1, 0]} label="?? Lire" active={true} onClick={() => handleAction("read")} />}

      {/* Clickable items */}
      {!fingerCleaned && <ClickableObject position={[-0.4, 0.08, 0.3]} selected={selectedItem === "alcohol"} enabled={true} onClick={() => setSelectedItem(selectedItem === "alcohol" ? null : "alcohol")}><group><mesh><cylinderGeometry args={[0.02, 0.02, 0.06, 16]} /><meshStandardMaterial color="#60a5fa" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-blue-100 px-2 py-1 rounded text-xs font-bold">Alcool</div></Html></group></ClickableObject>}
      {!pricked && fingerCleaned && <ClickableObject position={[0, 0.08, 0.3]} selected={selectedItem === "lancet"} enabled={true} onClick={() => setSelectedItem(selectedItem === "lancet" ? null : "lancet")}><group><mesh><boxGeometry args={[0.015, 0.05, 0.015]} /><meshStandardMaterial color="#9ca3af" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">Lancette</div></Html></group></ClickableObject>}

      {/* Result */}
      {resultRead && <Html position={[0, 0.35, 0]} center><div className="bg-green-800 text-white p-3 rounded text-xs"><div className="font-bold mb-1">Glycemie</div><div className="text-2xl text-green-300">{glucose} g/L</div><div className="text-green-300">Normal (0.7-1.1)</div></div></Html>}
    </group>
  )
}


function SpectrophotometryExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, triggerMascotAction, grabbedItem }) {
  const { samplePrepared, cuvetteInserted, wavelengthSet, blanked, measured } = state
  const [wavelength, setWavelength] = useState(540)
  const [absorbance, setAbsorbance] = useState(0)
  const [concentration, setConcentration] = useState(0)

  const handleAction = (action) => {
    if (action === "sample" && selectedItem === "sample") {
      triggerMascotAction([-0.35, 0.08, 0.25], [0, 0.08, 0.15], "#3b82f6", "Je prépare l'échantillon!", () => {
        setState(p => ({ ...p, samplePrepared: true }))
        setSelectedItem(null)
        setStep(1)
        toast.success("💧 Solution préparée!")
      }, "sample")
    }
    else if (action === "cuvette" && selectedItem === "cuvette" && samplePrepared) {
      triggerMascotAction([0.35, 0.08, 0.25], [0, 0.15, 0], "#fff", "Je place la cuvette!", () => {
        setState(p => ({ ...p, cuvetteInserted: true }))
        setSelectedItem(null)
        setStep(2)
        toast.success("📊 Cuvette insérée!")
      }, "cuvette")
    }
    else if (action === "wavelength" && cuvetteInserted && !wavelengthSet) {
      setState(p => ({ ...p, wavelengthSet: true }))
      setStep(3)
      toast.success(`🌈 λ = ${wavelength} nm`)
    }
    else if (action === "blank" && wavelengthSet && !blanked) {
      setState(p => ({ ...p, blanked: true }))
      setStep(4)
      toast.success("⚪ Blanc calibré!")
    }
    else if (action === "measure" && blanked && !measured) {
      const abs = 0.45
      const conc = (abs / 0.015).toFixed(2) // Beer-Lambert: A = εlc
      setAbsorbance(abs)
      setConcentration(conc)
      setState(p => ({ ...p, measured: true }))
      setStep(experiment.steps.length - 1)
      toast.success(`🔬 A=${abs}, C=${conc} µM`)
    }
  }

  return (
    <group>
      {/* Spectrophotometer body */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.4, 0.2, 0.25]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Display screen */}
      <mesh position={[0, 0.18, 0.13]}>
        <boxGeometry args={[0.25, 0.12, 0.01]} />
        <meshStandardMaterial color={blanked ? "#001100" : "#333"} />
      </mesh>
      
      {measured && (
        <Html position={[0, 0.18, 0.14]} center>
          <div className="bg-green-900 text-green-400 px-3 py-2 rounded font-mono text-sm">
            <div>λ: {wavelength} nm</div>
            <div className="text-xl">A: {absorbance.toFixed(3)}</div>
            <div>C: {concentration} µM</div>
          </div>
        </Html>
      )}

      {/* Sample compartment door */}
      <mesh position={[-0.15, 0.08, 0.13]}>
        <boxGeometry args={[0.08, 0.08, 0.01]} />
        <meshStandardMaterial color={cuvetteInserted ? "#4ade80" : "#666"} />
      </mesh>

      {/* Cuvette inside */}
      {cuvetteInserted && (
        <group position={[0, 0.08, 0]}>
          <mesh>
            <boxGeometry args={[0.04, 0.1, 0.04]} />
            <meshPhysicalMaterial color="#3b82f6" transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.035, 0.08, 0.035]} />
            <meshStandardMaterial color="#1e40af" transparent opacity={0.7} />
          </mesh>
        </group>
      )}

      {/* Light beam effect */}
      {wavelengthSet && (
        <mesh position={[0, 0.08, 0]} rotation={[0, Math.PI/2, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.2, 8]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Wavelength dial */}
      <mesh position={[0.15, 0.08, 0.13]}>
        <cylinderGeometry args={[0.03, 0.03, 0.01, 32]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <Html position={[0.15, 0.14, 0.13]} center>
        <div className="bg-gray-700 text-white px-2 py-1 rounded text-xs">{wavelength}nm</div>
      </Html>

      {/* Wavelength slider */}
      {cuvetteInserted && !wavelengthSet && (
        <Html position={[0.3, 0.2, 0]} center>
          <div className="bg-white p-2 rounded shadow">
            <div className="text-xs mb-1">λ: {wavelength} nm</div>
            <input 
              type="range" 
              min="400" 
              max="700" 
              value={wavelength} 
              onChange={(e) => setWavelength(Number(e.target.value))}
              className="w-32"
            />
          </div>
        </Html>
      )}

      {/* Target zones */}
      <TargetZone position={[0, 0.15, 0.2]} label="💧 Échantillon" active={selectedItem === "sample"} onClick={() => handleAction("sample")} />
      {samplePrepared && <TargetZone position={[0, 0.15, 0]} label="📊 Cuvette" active={selectedItem === "cuvette"} onClick={() => handleAction("cuvette")} />}
      {cuvetteInserted && !wavelengthSet && <TargetZone position={[0.15, 0.15, 0.13]} label="🌈 λ" active={true} onClick={() => handleAction("wavelength")} />}
      {wavelengthSet && !blanked && <TargetZone position={[-0.15, 0.15, 0.13]} label="⚪ Blanc" active={true} onClick={() => handleAction("blank")} />}
      {blanked && !measured && <TargetZone position={[0, 0.25, 0.13]} label="🔬 Mesurer" active={true} onClick={() => handleAction("measure")} />}

      {/* Clickable items */}
      {!samplePrepared && grabbedItem !== "sample" && (
        <ClickableObject position={[-0.35, 0.08, 0.25]} selected={selectedItem === "sample"} enabled={true} onClick={() => setSelectedItem(selectedItem === "sample" ? null : "sample")}>
          <group>
            <mesh>
              <cylinderGeometry args={[0.025, 0.025, 0.06, 16]} />
              <meshPhysicalMaterial color="#3b82f6" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
              <meshStandardMaterial color="#1e40af" transparent opacity={0.8} />
            </mesh>
            <Html position={[0, 0.06, 0]} center>
              <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">Solution CuSO₄</div>
            </Html>
          </group>
        </ClickableObject>
      )}

      {!cuvetteInserted && samplePrepared && grabbedItem !== "cuvette" && (
        <ClickableObject position={[0.35, 0.08, 0.25]} selected={selectedItem === "cuvette"} enabled={true} onClick={() => setSelectedItem(selectedItem === "cuvette" ? null : "cuvette")}>
          <group>
            <mesh>
              <boxGeometry args={[0.04, 0.1, 0.04]} />
              <meshPhysicalMaterial color="#fff" transparent opacity={0.3} />
            </mesh>
            <Html position={[0, 0.08, 0]} center>
              <div className="bg-white px-2 py-1 rounded text-xs font-bold shadow border">Cuvette</div>
            </Html>
          </group>
        </ClickableObject>
      )}

      {/* Formula display */}
      {measured && (
        <Html position={[-0.35, 0.3, 0]} center>
          <div className="bg-blue-900 text-white p-2 rounded text-xs">
            <div className="font-bold">Loi Beer-Lambert</div>
            <div className="text-yellow-300">A = ε × l × c</div>
            <div className="text-green-300 mt-1">ε = 15 M⁻¹cm⁻¹</div>
            <div className="text-green-300">l = 1 cm</div>
            <div className="text-white">c = {concentration} µM</div>
          </div>
        </Html>
      )}
    </group>
  )
}

function PlaceholderExperiment({ name }) {
  return (
    <group>
      <Html position={[0, 0.3, 0]} center>
        <div className="bg-yellow-500 text-black px-4 py-3 rounded-lg text-center">
          <div className="text-2xl mb-2">??</div>
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
  const { canAccessLab, isFree, plan } = usePlan()
  const [subject, setSubject] = useState(null)
  const [level, setLevel] = useState(null)
  const [experiment, setExperiment] = useState(null)
  const [completedExperiments, setCompletedExperiments] = useState(() => {
    const saved = localStorage.getItem('edusen_completed_experiments')
    return saved ? JSON.parse(saved) : []
  })
  
  const FREE_EXPERIMENT_LIMIT = 3
  const canAccessExperiment = (expId) => {
    if (!isFree) return true // Paid users get unlimited
    // Free users: allow if already completed OR under limit
    return completedExperiments.includes(expId) || completedExperiments.length < FREE_EXPERIMENT_LIMIT
  }
  
  const markExperimentStarted = (expId) => {
    if (!completedExperiments.includes(expId)) {
      const updated = [...completedExperiments, expId]
      setCompletedExperiments(updated)
      localStorage.setItem('edusen_completed_experiments', JSON.stringify(updated))
    }
  }

if (!subject) return (
   <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6"><button onClick={() => navigate(-1)} className="btn-secondary"><ArrowLeft size={20} /></button><div><h1 className="text-2xl font-bold">Laboratoire 3D</h1><p className="text-gray-600 text-sm">Experiences interactives en environnement realiste</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {[{id:"chemistry",icon:"🧪",name:"Chimie",color:"from-purple-50 to-pink-50"},{id:"physics",icon:"⚡",name:"Physique",color:"from-blue-50 to-cyan-50"},{id:"biology",icon:"🧬",name:"Biologie",color:"from-green-50 to-emerald-50"},{id:"engineering",icon:"⚙️",name:"Ingenierie",color:"from-orange-50 to-amber-50"},{id:"agriculture",icon:"🌾",name:"Agriculture",color:"from-lime-50 to-green-50"},{id:"medicine",icon:"🏥",name:"Medecine",color:"from-red-50 to-rose-50"}].map(s => <div key={s.id} onClick={() => setSubject(s.id)} className={`card p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br ${s.color}`}><div className="text-4xl mb-3 text-center">{s.icon}</div><h2 className="text-xl font-bold text-center">{s.name}</h2></div>)}
</div>
</div>
  )

  if (!level) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6"><button onClick={() => setSubject(null)} className="btn-secondary"><ArrowLeft size={20} /></button><h1 className="text-xl font-bold">{subject === "chemistry" ? "🧪 Chimie" : subject === "physics" ? "⚡ Physique" : subject === "biology" ? "🧬 Biologie" : subject === "engineering" ? "⚙️ Ingenierie" : subject === "agriculture" ? "🌾 Agriculture" : "🏥 Medecine"}</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div onClick={() => setLevel("lycee")} className="card p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-50"><School size={40} className="mx-auto mb-3 text-green-600" /><h2 className="text-xl font-bold text-center mb-1">🏫 Lycee</h2><p className="text-center text-gray-500 text-sm">{arLabService.getExperimentsByLevel(subject, "lycee").length} experiences</p></div>
        <div onClick={() => setLevel("universite")} className="card p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-purple-50 to-indigo-50"><GraduationCap size={40} className="mx-auto mb-3 text-purple-600" /><h2 className="text-xl font-bold text-center mb-1">🎓 Universite</h2><p className="text-center text-gray-500 text-sm">{arLabService.getExperimentsByLevel(subject, "universite").length} experiences</p></div>
      </div>
    </div>
  )

  if (!experiment) {
    const experiments = arLabService.getExperimentsByLevel(subject, level)
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4"><button onClick={() => setLevel(null)} className="btn-secondary"><ArrowLeft size={20} /></button><h1 className="text-lg font-bold">{level === "lycee" ? "🏫 Lycee" : "🎓 Universite"}</h1></div>
        {isFree && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-orange-800">Plan Gratuit</p>
              <p className="text-sm text-orange-600">{FREE_EXPERIMENT_LIMIT - completedExperiments.length} experiences restantes</p>
            </div>
            <button onClick={() => navigate('/pricing')} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition">
              Passer Premium
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {experiments.map((exp, index) => {
            const isLocked = isFree && !canAccessExperiment(exp.id)
            return (
              <div 
                key={exp.id} 
                onClick={() => {
                  if (isLocked) {
                    toast.error(`Abonnez-vous pour acceder a plus de ${FREE_EXPERIMENT_LIMIT} experiences!`)
                    return
                  }
                  markExperimentStarted(exp.id)
                  setExperiment(exp)
                }} 
                className={`card p-4 cursor-pointer transition-all ${isLocked ? 'opacity-60 grayscale' : 'hover:shadow-lg hover:scale-102'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    {isLocked && <span className="text-orange-500">🔒</span>}
                    {exp.name}
                  </h3>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${exp.difficulty === "Facile" ? "bg-green-100 text-green-700" : exp.difficulty === "Moyen" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{exp.difficulty}</span>
                </div>
                <p className="text-gray-600 text-xs mb-2">{exp.description}</p>
                {isLocked ? (
                  <button className="w-full text-sm py-1.5 bg-gray-200 text-gray-500 rounded-lg">
                    <span className="inline mr-1">🔒</span> Premium requis
                  </button>
                ) : (
                  <button className="btn-primary w-full text-sm py-1.5">
                    <PlayCircle size={14} className="inline mr-1" />Commencer
                  </button>
                )}
              </div>
            )
          })}
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
    batteryPlaced: false, r1Connected: false, r2Connected: false, bulb1Lit: false, bulb2Lit: false,
    panelPlaced: false, meterConnected: false, measuring: false, angle: 45, voltage: '0',
    sampleTaken: false, nTested: false, pTested: false, kTested: false,
    cuffPlaced: false, inflated: false, systolicRead: false, diastolicRead: false,
    coilPlaced: false, magnetsPlaced: false, powerConnected: false, spinning: false,
    tankReady: false, plantsPlaced: false, phAdjusted: false, ecChecked: false,
    fingerCleaned: false, pricked: false, bloodApplied: false, resultRead: false,
    electrodesPlaced: false, connected: false, calibrated: false, recording: false, analyzed: false,
    bloodDrawn: false, centrifuged: false, rbcCounted: false, wbcCounted: false, hbMeasured: false,
    tankFilled: false, elecElectrodesOn: false, elecPowerOn: false, bubblingH2: false, bubblingO2: false,
    ballPlaced: false, released: false, measured: false,
    seedsPlaced: false, watered: false, germLightOn: false, radicleVisible: false, comparison: false,
    lensPlaced: false, candleLit: false, screenPlaced: false, imageFocused: false, divergentTested: false,
    agno3Added: false, naclAdded: false, precipitateFormed: false, filtered: false,
    heartViewed: false, pulmonaryTracked: false, systemicTracked: false, organsIdentified: false,
    stringAttached: false, massAttached: false, swinging: false, period: 0,
    slideReady: false, stainAdded: false, coverslipOn: false, focusedLow: false, focusedHigh: false,
    plantReady: false, lightOn: false, bubblesVisible: false, darkCompared: false,
  }
  const [state, setState] = useState(initialState)
  
  // Mascot control states
  const [mascotTarget, setMascotTarget] = useState(null)
  const [mascotWorking, setMascotWorking] = useState(false)
  const [mascotMessage, setMascotMessage] = useState("Salut! Moi c'est Ziz ðŸ‘‹")
  const [pendingAction, setPendingAction] = useState(null)
  
  // Helper function to trigger mascot action
  const [mascotObjectPos, setMascotObjectPos] = useState(null)
  const [mascotObjectColor, setMascotObjectColor] = useState(null)
  const [grabbedItem, setGrabbedItem] = useState(null)
  
  const triggerMascotAction = (objectPos, targetPos, objectColor, message, action, itemId = null) => {
    setGrabbedItem(itemId)
    setMascotObjectPos(objectPos)
    setMascotTarget(targetPos)
    setMascotObjectColor(objectColor)
    setMascotMessage(message)
    setMascotWorking(true)
    setPendingAction(() => action)
  }
  
  // When mascot completes action
  const handleMascotComplete = () => {
    if (pendingAction) {
      pendingAction()
      setPendingAction(null)
    }
    setMascotWorking(false)
    setMascotTarget(null)
    setGrabbedItem(null)
    setMascotMessage("C'est fait! âœ…")
    setTimeout(() => setMascotMessage(""), 2000)
  }
  const reset = () => { setState(initialState); setStep(0); setSelectedItem(null); toast.success("?? Reset!") }

  const startCamera = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); streamRef.current = stream; if (videoRef.current) videoRef.current.srcObject = stream; setArMode(true) } catch { toast.error("Camera indisponible") } }
  const stopCamera = () => { streamRef.current?.getTracks().forEach(t => t.stop()); setArMode(false) }
  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), [])

  const renderExperiment = () => {
    const props = { state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary, triggerMascotAction, grabbedItem }
    switch(experiment.id) {
      case "acid-base": return <AcidBaseExperiment {...props} />
      case "precipitation": return <PrecipitationExperiment {...props} />
      case "electrolysis": return <ElectrolysisExperiment {...props} />
      case "combustion": return <CombustionExperiment {...props} />
      case "simple-circuit": return <CircuitExperiment {...props} />
      case "optics-lens": return <OpticsLensExperiment {...props} />
      case "free-fall": return <FreeFallExperiment {...props} />
      case "pendulum": return <PendulumExperiment {...props} />
      case "parallel-circuit": return <ParallelCircuitExperiment {...props} />
      case "cell-observation": return <CellObservationExperiment {...props} />
      case "blood-circulation": return <BloodCirculationExperiment {...props} />
      case "germination": return <GerminationExperiment {...props} />
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
      case "solar-panel": return <SolarPanelExperiment {...props} />
      case "electric-motor": return <ElectricMotorExperiment {...props} />
      case "soil-npk": return <SoilNPKExperiment {...props} />
      case "hydroponics": return <HydroponicsExperiment {...props} />
      case "blood-pressure": return <BloodPressureExperiment {...props} />
      case "glucose-test": return <GlucoseTestExperiment {...props} />
      case "ecg": return <ECGExperiment {...props} />
      case "blood-analysis": return <BloodAnalysisExperiment {...props} />
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
      {selectedItem && <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-2 mb-2 text-xs flex items-center justify-between"><span className="font-bold">? Selectionne ? Cliquez cible!</span><button onClick={() => setSelectedItem(null)} className="font-bold text-yellow-700">?</button></div>}
      
      <div className="flex-1 relative rounded-xl overflow-hidden shadow-xl">
        {arMode && <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />}
        <div className={`absolute inset-0 ${arMode ? "" : ""}`}>
          <Canvas 
            camera={{ position: [0, 2, 4], fov: 50 }} 
            gl={{ alpha: arMode }}
            shadows
          >
            <ambientLight intensity={0.4} />
<directionalLight position={[5, 10, 5]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
<directionalLight position={[-3, 5, -5]} intensity={0.3} />
<pointLight position={[0, 3, 0]} intensity={0.5} color="#fff5e6" />
<Environment preset="city" background={false} />
            
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
                <LabMascot 
                  targetPosition={mascotTarget}
                  objectPosition={mascotObjectPos}
                  objectColor={mascotObjectColor}
                  isWorking={mascotWorking}
                  message={mascotMessage}
                  onActionComplete={handleMascotComplete}
                />
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
        <LabTutor experimentId={experiment.id} currentStep={step} />
      </div>
    </div>
  )
}



































































































































