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
    if (action === "fill" && selectedItem === "water") { triggerMascotAction([-0.35, 0.1, 0.25], [0, 0.15, 0], "#3b82f6", "Je remplis!", () => { setState(p => ({ ...p, tankFilled: true })); setSelectedItem(null); setStep(1); toast.success("💧 Cuve remplie!") }, "water") }
    else if (action === "electrodes" && selectedItem === "electrodes" && tankFilled) { triggerMascotAction([0.35, 0.08, 0.25], [0, 0.18, 0], "#333", "Electrodes!", () => { setState(p => ({ ...p, elecElectrodesOn: true })); setSelectedItem(null); setStep(2); toast.success("⚡ Electrodes placees!") }, "electrodes") }
    else if (action === "power" && elecElectrodesOn && !elecPowerOn) { triggerMascotAction([0.32, 0.1, 0], [0.32, 0.12, 0], "#22c55e", "J allume!", () => { setState(p => ({ ...p, elecPowerOn: true, bubblingH2: true, bubblingO2: true })); setStep(3); toast.success("🔌 Electrolyse en cours!") }) }
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
        <Html position={[-0.1, 0.38, 0]} center><div className="bg-gray-200 px-2 py-1 rounded text-xs font-bold">H₂ {h2Volume}mL</div></Html>
        <Html position={[0.1, 0.38, 0]} center><div className="bg-blue-200 px-2 py-1 rounded text-xs font-bold">O₂ {o2Volume}mL</div></Html>
      </>}
      
      {elecElectrodesOn && <group position={[0.3, 0.1, 0]}>
        <mesh><boxGeometry args={[0.1, 0.08, 0.06]} /><meshStandardMaterial color={elecPowerOn ? "#22c55e" : "#666"} /></mesh>
        <Html position={[0, 0.06, 0]} center><div className={`px-2 py-1 rounded text-xs font-bold ${elecPowerOn ? "bg-green-500 text-white" : "bg-gray-300"}`}>12V DC</div></Html>
      </group>}
      {/* Target zones */}
      <TargetZone position={[0, 0.15, 0.12]} label="💧 Remplir" active={selectedItem === "water"} onClick={() => handleAction("fill")} />
      {tankFilled && <TargetZone position={[0, 0.2, 0]} label="⚡ Electrodes" active={selectedItem === "electrodes"} onClick={() => handleAction("electrodes")} />}
      {elecElectrodesOn && !elecPowerOn && <TargetZone position={[0.3, 0.15, 0]} label="🔌 Allumer" active={true} onClick={() => handleAction("power")} />}
      {h2Volume >= 20 && <TargetZone position={[0, 0.4, 0]} label="✅ Identifier" active={true} onClick={() => handleAction("identify")} />}

      {/* Clickable items */}
      {!tankFilled && grabbedItem !== "water" && <ClickableObject position={[-0.35, 0.1, 0.25]} selected={selectedItem === "water"} enabled={true} onClick={() => setSelectedItem(selectedItem === "water" ? null : "water")}><group><mesh><cylinderGeometry args={[0.025, 0.07, 0.12, 32, 1, true]} /><meshPhysicalMaterial color="#88ccff" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh><mesh position={[0, -0.06, 0]} rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[0.07, 32]} /><meshStandardMaterial color="#88ccff" transparent opacity={0.4} /></mesh><mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.022, 0.025, 0.04, 16]} /><meshPhysicalMaterial color="#88ccff" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh><mesh position={[0, 0.1, 0]}><torusGeometry args={[0.022, 0.004, 8, 16]} /><meshStandardMaterial color="#ffffff" /></mesh><mesh position={[0, -0.02, 0]}><cylinderGeometry args={[0.035, 0.06, 0.06, 32]} /><meshStandardMaterial color="#3b82f6" transparent opacity={0.7} /></mesh><Html position={[0, 0.14, 0]} center><div className="bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">H₂O + Na₂SO₄</div></Html></group></ClickableObject>}
      {!elecElectrodesOn && tankFilled && grabbedItem !== "electrodes" && <ClickableObject position={[0.35, 0.08, 0.25]} selected={selectedItem === "electrodes"} enabled={true} onClick={() => setSelectedItem(selectedItem === "electrodes" ? null : "electrodes")}><group><mesh position={[-0.015, 0, 0]}><cylinderGeometry args={[0.012, 0.012, 0.12, 12]} /><meshStandardMaterial color="#1a1a1a" /></mesh><mesh position={[0.015, 0, 0]}><cylinderGeometry args={[0.012, 0.012, 0.12, 12]} /><meshStandardMaterial color="#1a1a1a" /></mesh><mesh position={[-0.015, 0.065, 0]}><sphereGeometry args={[0.015, 12, 12]} /><meshStandardMaterial color="#dc2626" /></mesh><mesh position={[0.015, 0.065, 0]}><sphereGeometry args={[0.015, 12, 12]} /><meshStandardMaterial color="#2563eb" /></mesh><Html position={[0, 0.1, 0]} center><div className="bg-gray-700 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">Electrodes C</div></Html></group></ClickableObject>}

      {/* Formula display */}
      {elecPowerOn && <Html position={[-0.35, 0.3, 0]} center><div className="bg-blue-900 text-white p-2 rounded text-xs"><div className="font-bold">Electrolyse</div><div className="text-yellow-300">2H₂O → 2H₂ + O₂</div><div className="text-green-300 mt-1">V(H₂) = 2 × V(O₂)</div></div></Html>}
    </group>
  )
}

export default ElectrolysisExperiment
