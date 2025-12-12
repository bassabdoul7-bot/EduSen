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
function CombustionExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary, triggerMascotAction, grabbedItem }) {
  const { bunsenLit, magnesiumBurning } = state
  const handleAction = (a) => {
    if (a === "lighter" && selectedItem === "lighter") { triggerMascotAction([-0.35, 0.08, 0.28], [0, 0.32, -0.1], "#e74c3c", "J allume!", () => { setState(p => ({ ...p, bunsenLit: true })); setSelectedItem(null); setStep(1); toast.success("🔥 Allume!") }, "lighter") }
    else if (a === "magnesium" && selectedItem === "magnesium" && bunsenLit) { triggerMascotAction([0.35, 0.08, 0.28], [0, 0.45, -0.1], "#ccc", "Je brule!", () => { setState(p => ({ ...p, magnesiumBurning: true })); setSelectedItem(null); setStep(3); toast.success("✨ Combustion!"); setTimeout(() => setStep(experiment.steps.length - 1), 2000) }, "magnesium") }
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

      {grabbedItem !== "lighter" && <ClickableObject position={[-0.4, 0.08, 0.3]} selected={selectedItem === "lighter"} enabled={!bunsenLit} onClick={() => setSelectedItem(selectedItem === "lighter" ? null : "lighter")}>
        <group><mesh><boxGeometry args={[0.03, 0.08, 0.018]} /><meshStandardMaterial color="#e74c3c" /></mesh><Html position={[0, 0.07, 0]} center><div className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">🔥</div></Html></group>
      </ClickableObject>}
      {grabbedItem !== "magnesium" && <ClickableObject position={[0.4, 0.08, 0.3]} selected={selectedItem === "magnesium"} enabled={bunsenLit && !magnesiumBurning} onClick={() => setSelectedItem(selectedItem === "magnesium" ? null : "magnesium")}>
        <group><mesh rotation={[0, 0, 0.3]}><boxGeometry args={[0.15, 0.012, 0.006]} /><meshStandardMaterial color="#ccc" metalness={0.95} /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-gray-200 px-2 py-1 rounded text-xs font-bold">Ruban Mg</div></Html></group>
      </ClickableObject>}

      
    </group>
  )
}

export default CombustionExperiment
