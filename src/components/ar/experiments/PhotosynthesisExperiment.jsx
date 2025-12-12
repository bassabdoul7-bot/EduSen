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

export default PhotosynthesisExperiment
