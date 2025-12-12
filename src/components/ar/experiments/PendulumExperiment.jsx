import { Html } from '@react-three/drei'
import * as THREE from 'three'
import toast from 'react-hot-toast'
import { calculatePH, getIndicatorColor, calculateCurrent, calculatePeriod } from '../../../services/arLab'

function ClickableObject({ position, selected, enabled, onClick, children }) {
  return (
    <group position={position} onClick={enabled ? onClick : undefined}>
      {children}
      {selected && <mesh><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#ffeb3b" transparent opacity={0.3} /></mesh>}
    </group>
  )
}

function TargetZone({ position, label, active, onClick }) {
  return active ? (
    <group position={position} onClick={onClick}>
      <mesh><cylinderGeometry args={[0.1, 0.1, 0.01]} /><meshBasicMaterial color="#4caf50" transparent opacity={0.6} /></mesh>
      <Html center><div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">{label}</div></Html>
    </group>
  ) : null
}
function PendulumExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary, triggerMascotAction, grabbedItem }) {
  const { stringAttached, massAttached, swinging, period } = state
  const pendulumRef = useRef()
  useFrame((s) => { if (swinging && pendulumRef.current) pendulumRef.current.rotation.z = Math.sin(s.clock.elapsedTime * Math.PI) * 0.4 })
  const handleAction = (a) => {
    if (a === "string" && selectedItem === "string") { triggerMascotAction([-0.4, 0.08, 0.3], [0.18, 0.55, -0.15], "#8B4513", "La ficelle!", () => { setState(p => ({ ...p, stringAttached: true })); setSelectedItem(null); setStep(1); toast.success("🧵 Ficelle!") }, "string") }
    else if (a === "mass" && selectedItem === "mass") { triggerMascotAction([0, 0.08, 0.3], [0.18, 0.2, -0.15], "#dc2626", "La masse!", () => { setState(p => ({ ...p, massAttached: true })); setSelectedItem(null); setStep(2); toast.success("⚖️ Masse!") }, "mass") }
    else if (a === "swing" && selectedItem === "swing") { const T = 2.01; setState(p => ({ ...p, swinging: true, period: T })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success(`⏱️ T=${T.toFixed(2)}s`) }
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
      <TargetZone position={[0.18, 0.58, -0.1]} label="🧵" active={selectedItem === "string"} onClick={() => handleAction("string")} />
      <TargetZone position={[0.18, 0.2, -0.1]} label="⚖️" active={selectedItem === "mass" && stringAttached} onClick={() => handleAction("mass")} />
      {massAttached && !swinging && <TargetZone position={[0.35, 0.25, -0.1]} label="👆" active={selectedItem === "swing"} onClick={() => handleAction("swing")} />}

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
      {swinging && <Html position={[0.4, 0.35, 0]} center><div className="bg-blue-900 text-white p-2 rounded text-xs"><div className="font-bold">Pendule Simple</div><div className="text-yellow-300">T = 2π√(L/g)</div><div className="text-green-300 mt-1">L = 1m, g = 9.81</div><div className="text-lg text-white">T ≈ 2.01s</div></div></Html>}
    </group>
  )
}
// BIOLOGY EXPERIMENTS

export default PendulumExperiment
