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

export default CellObservationExperiment
