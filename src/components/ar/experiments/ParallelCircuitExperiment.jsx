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
function ParallelCircuitExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, setShowSummary, triggerMascotAction, grabbedItem }) {
  const { batteryPlaced, r1Connected, l1Connected, r2Connected, l2Connected } = state
  const bulb1Lit = r1Connected && l1Connected && batteryPlaced
  const bulb2Lit = r2Connected && l2Connected && batteryPlaced
  const handlePlace = (item) => {
    if (item === "battery" && selectedItem === "battery") { triggerMascotAction([-0.35, 0.08, 0.32], [-0.38, 0.06, 0], "#1e40af", "La pile!", () => { setState(p => ({ ...p, batteryPlaced: true })); setSelectedItem(null); setStep(1); toast.success("🔋 Pile connectee!") }, "battery") }
    else if (item === "r1" && selectedItem === "r1") { triggerMascotAction([-0.05, 0.08, 0.32], [-0.05, 0.045, -0.12], "#c2410c", "R1!", () => { setState(p => ({ ...p, r1Connected: true })); setSelectedItem(null); setStep(2); toast.success("⚡ R1 = 100Ω") }, "r1") }
    else if (item === "l1" && selectedItem === "l1") { triggerMascotAction([0.1, 0.08, 0.32], [0.18, 0.055, -0.12], "#ffc", "L1!", () => { setState(p => ({ ...p, l1Connected: true })); setSelectedItem(null); setStep(3); toast.success("💡 L1 allumee!") }, "l1") }
    else if (item === "r2" && selectedItem === "r2") { triggerMascotAction([0.25, 0.08, 0.32], [-0.05, 0.045, 0.12], "#7c3aed", "R2!", () => { setState(p => ({ ...p, r2Connected: true })); setSelectedItem(null); setStep(4); toast.success("⚡ R2 = 200Ω") }, "r2") }
    else if (item === "l2" && selectedItem === "l2") { triggerMascotAction([0.4, 0.08, 0.32], [0.18, 0.055, 0.12], "#ffc", "L2!", () => { setState(p => ({ ...p, l2Connected: true })); setSelectedItem(null); setStep(5); toast.success("💡 L2 allumee!"); setTimeout(() => setStep(experiment.steps.length - 1), 1500) }, "l2") }
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
      <TargetZone position={[-0.38, 0.08, 0]} label="🔋" active={selectedItem === "battery"} onClick={() => handlePlace("battery")} />
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
      {bulb1Lit && <Html position={[0.38, 0.16, -0.05]} center><div className="bg-blue-900 text-white p-2 rounded text-xs"><div className="font-bold">Loi des noeuds</div><div className="text-yellow-300">I = I1 + I2</div><div className="text-lg text-green-300">I = {iTotal.toFixed(3)}A</div>{bulb2Lit && <div className="text-xs mt-1">Req = 66.7Ω</div>}</div></Html>}
    </group>
  )
}

export default ParallelCircuitExperiment
