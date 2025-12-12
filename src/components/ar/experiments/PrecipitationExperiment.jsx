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
        setState(p => ({ ...p, agno3Added: true })); setSelectedItem(null); setStep(1); toast.success("🧪 AgNO3 verse!")
      })
    }
    else if (action === "nacl" && selectedItem === "nacl" && agno3Added) {
      triggerMascotAction([0.35, 0.1, 0.25], [0, 0.15, 0], "#ffffff", "J'ajoute NaCl!", () => {
        setState(p => ({ ...p, naclAdded: true, precipitateFormed: true })); setSelectedItem(null); setStep(2); toast.success("⚪ Precipite blanc forme!")
      })
    }
    else if (action === "filter" && precipitateAmount >= 10) {
      triggerMascotAction([0, 0.1, 0], [0.3, 0.15, 0], "#ffffff", "Je filtre!", () => {
        setState(p => ({ ...p, filtered: true })); setStep(3); toast.success("🔬 AgCl filtre!")
      })
    }
    else if (action === "identify" && filtered) { setStep(experiment.steps.length - 1); toast.success("✅ AgCl identifie - Test Cl- positif!") }
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
      <TargetZone position={[0, 0.2, 0]} label="🧪 AgNO3" active={selectedItem === "agno3"} onClick={() => handleAction("agno3")} />
      {agno3Added && <TargetZone position={[0, 0.22, 0.05]} label="🧪 NaCl" active={selectedItem === "nacl"} onClick={() => handleAction("nacl")} />}
      {precipitateAmount >= 10 && !filtered && <TargetZone position={[0.3, 0.2, 0]} label="🔬 Filtrer" active={true} onClick={() => handleAction("filter")} />}
      {filtered && <TargetZone position={[0.3, 0.25, 0]} label="✅ Identifier" active={true} onClick={() => handleAction("identify")} />}

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
      {naclAdded && <Html position={[-0.3, 0.3, 0]} center><div className="bg-purple-900 text-white p-2 rounded text-xs"><div className="font-bold">Precipitation</div><div className="text-yellow-300">Ag+ + Cl- → AgCl(s)</div><div className="text-white mt-1">Precipite blanc</div></div></Html>}
    </group>
  )
}

export default PrecipitationExperiment
