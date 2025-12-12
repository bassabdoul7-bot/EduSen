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
function CircuitExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary, triggerMascotAction, grabbedItem }) {
  const { batteryConnected, resistorConnected, bulbLit } = state
  const handlePlace = (item) => {
    if (item === "battery" && selectedItem === "battery") { triggerMascotAction([-0.35, 0.1, 0.3], [-0.28, 0.08, -0.05], "#1e40af", "La pile!", () => { setState(p => ({ ...p, batteryConnected: true })); setSelectedItem(null); setStep(1); toast.success("🔋 Pile!") }, "battery") }
    else if (item === "resistor" && selectedItem === "resistor") { triggerMascotAction([0, 0.1, 0.3], [0, 0.06, -0.05], "#c2410c", "Resistance!", () => { setState(p => ({ ...p, resistorConnected: true })); setSelectedItem(null); setStep(2); toast.success("⚡ Resistance!") }, "resistor") }
    else if (item === "bulb" && selectedItem === "bulb") { triggerMascotAction([0.35, 0.12, 0.3], [0.28, 0.1, -0.05], "#ffc", "Ampoule!", () => { setState(p => ({ ...p, bulbLit: true, current: 0.09 })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("💡 I=0.09A") }, "bulb") }
  }
  return (
    <group>
      {/* Circuit board - green PCB */}
      <mesh position={[0, 0.015, -0.05]}><boxGeometry args={[0.9, 0.02, 0.4]} /><meshStandardMaterial color="#1a5c32" /></mesh>
      <mesh position={[-0.15, 0.026, -0.05]}><boxGeometry args={[0.3, 0.002, 0.01]} /><meshStandardMaterial color="#c9a227" metalness={0.8} /></mesh>
      <mesh position={[0.15, 0.026, -0.05]}><boxGeometry args={[0.3, 0.002, 0.01]} /><meshStandardMaterial color="#c9a227" metalness={0.8} /></mesh>

      <TargetZone position={[-0.28, 0.06, -0.05]} label="🔋" active={selectedItem === "battery"} onClick={() => handlePlace("battery")} />
      <TargetZone position={[0, 0.06, -0.05]} label="⚡" active={selectedItem === "resistor"} onClick={() => handlePlace("resistor")} />
      <TargetZone position={[0.28, 0.06, -0.05]} label="💡" active={selectedItem === "bulb"} onClick={() => handlePlace("bulb")} />

      {batteryConnected && <group position={[-0.28, 0.08, -0.05]}><mesh><boxGeometry args={[0.05, 0.09, 0.025]} /><meshStandardMaterial color="#1e40af" /></mesh><mesh position={[0, 0.045, 0]}><boxGeometry args={[0.04, 0.01, 0.02]} /><meshStandardMaterial color="#333" /></mesh><mesh position={[-0.01, 0.05, 0]}><cylinderGeometry args={[0.004, 0.004, 0.015, 8]} /><meshStandardMaterial color="#dc2626" /></mesh><mesh position={[0.01, 0.05, 0]}><cylinderGeometry args={[0.004, 0.004, 0.015, 8]} /><meshStandardMaterial color="#333" /></mesh></group>}
      {resistorConnected && <group position={[0, 0.06, -0.05]} rotation={[0, 0, Math.PI/2]}><mesh><cylinderGeometry args={[0.018, 0.018, 0.08, 16]} /><meshStandardMaterial color="#d4a574" /></mesh><mesh position={[0, 0.015, 0]}><cylinderGeometry args={[0.019, 0.019, 0.008, 16]} /><meshStandardMaterial color="#8B4513" /></mesh><mesh position={[0, 0, 0]}><cylinderGeometry args={[0.019, 0.019, 0.008, 16]} /><meshStandardMaterial color="#000" /></mesh><mesh position={[0, -0.015, 0]}><cylinderGeometry args={[0.019, 0.019, 0.008, 16]} /><meshStandardMaterial color="#8B4513" /></mesh></group>}
      {bulbLit && <group position={[0.28, 0.1, -0.05]}><mesh><sphereGeometry args={[0.035, 32, 32]} /><meshPhysicalMaterial color="#ffc" emissive="#ff0" emissiveIntensity={2} transparent opacity={0.9} /></mesh><mesh position={[0, -0.04, 0]}><cylinderGeometry args={[0.015, 0.02, 0.025, 16]} /><meshStandardMaterial color="#333" /></mesh><pointLight color="#ff0" intensity={2} distance={1.5} /></group>}

      {!batteryConnected && grabbedItem !== "battery" && <ClickableObject position={[-0.35, 0.1, 0.3]} selected={selectedItem === "battery"} enabled={true} onClick={() => setSelectedItem(selectedItem === "battery" ? null : "battery")}><group><mesh><boxGeometry args={[0.05, 0.09, 0.025]} /><meshStandardMaterial color="#1e40af" /></mesh><mesh position={[0, 0.045, 0]}><boxGeometry args={[0.04, 0.01, 0.02]} /><meshStandardMaterial color="#333" /></mesh><mesh position={[-0.01, 0.05, 0]}><cylinderGeometry args={[0.004, 0.004, 0.015, 8]} /><meshStandardMaterial color="#dc2626" /></mesh><mesh position={[0.01, 0.05, 0]}><cylinderGeometry args={[0.004, 0.004, 0.015, 8]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.08, 0]} center><div className="bg-yellow-400 px-2 py-1 text-xs font-bold rounded">Pile 9V</div></Html></group></ClickableObject>}
      {!resistorConnected && grabbedItem !== "resistor" && <ClickableObject position={[0, 0.1, 0.3]} selected={selectedItem === "resistor"} enabled={batteryConnected} onClick={() => setSelectedItem(selectedItem === "resistor" ? null : "resistor")}><group rotation={[0, 0, Math.PI/2]}><mesh><cylinderGeometry args={[0.018, 0.018, 0.08, 16]} /><meshStandardMaterial color="#d4a574" /></mesh><mesh position={[0, 0.015, 0]}><cylinderGeometry args={[0.019, 0.019, 0.008, 16]} /><meshStandardMaterial color="#8B4513" /></mesh><mesh position={[0, 0, 0]}><cylinderGeometry args={[0.019, 0.019, 0.008, 16]} /><meshStandardMaterial color="#000" /></mesh><mesh position={[0, -0.015, 0]}><cylinderGeometry args={[0.019, 0.019, 0.008, 16]} /><meshStandardMaterial color="#8B4513" /></mesh><Html position={[0.06, 0, 0]} center><div className="bg-orange-200 px-2 py-1 text-xs font-bold rounded">100Ω</div></Html></group></ClickableObject>}
      {!bulbLit && grabbedItem !== "bulb" && <ClickableObject position={[0.35, 0.12, 0.3]} selected={selectedItem === "bulb"} enabled={resistorConnected} onClick={() => setSelectedItem(selectedItem === "bulb" ? null : "bulb")}><group><mesh><sphereGeometry args={[0.035, 32, 32]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.4} /></mesh><mesh position={[0, -0.04, 0]}><cylinderGeometry args={[0.015, 0.02, 0.025, 16]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-yellow-100 px-2 py-1 text-xs font-bold rounded">Ampoule</div></Html></group></ClickableObject>}

      {batteryConnected && resistorConnected && <Wire start={[-0.2, 0.08, -0.05]} end={[-0.06, 0.06, -0.05]} color={bulbLit?"#0f0":"#c00"} glowing={bulbLit} />}
      {resistorConnected && bulbLit && <Wire start={[0.06, 0.06, -0.05]} end={[0.2, 0.1, -0.05]} color="#0f0" glowing={true} />}
    </group>
  )
}

export default CircuitExperiment
