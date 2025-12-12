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
function OpticsLensExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem, triggerMascotAction, grabbedItem }) {
  const { lensPlaced, candleLit, screenPlaced, imageFocused, divergentTested } = state
  const [screenPos, setScreenPos] = useState(0.4)
  const [imageSharp, setImageSharp] = useState(false)
  const [lensType, setLensType] = useState('convergente')

  const handleAction = (action) => {
    if (action === "lens" && selectedItem === "lens") { triggerMascotAction([-0.4, 0.08, 0.25], [0, 0.1, 0], "#87ceeb", "Lentille!", () => { setState(p => ({ ...p, lensPlaced: true })); setSelectedItem(null); setStep(1); toast.success("🔍 Lentille placee!") }, "lens") }
    else if (action === "candle" && lensPlaced && !candleLit) { triggerMascotAction([-0.35, 0.1, 0], [-0.35, 0.1, 0], "#ff9500", "Allume!", () => { setState(p => ({ ...p, candleLit: true })); setStep(2); toast.success("🕯️ Bougie allumee!") }, null) }
    else if (action === "screen" && selectedItem === "screen" && candleLit) { triggerMascotAction([0.4, 0.08, 0.25], [screenPos, 0.1, 0], "#fff", "Ecran!", () => { setState(p => ({ ...p, screenPlaced: true })); setSelectedItem(null); setStep(3); toast.success("📺 Ecran place!") }, "screen") }
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
      <TargetZone position={[0, 0.18, 0]} label="🔍" active={selectedItem === "lens"} onClick={() => handleAction("lens")} />
      {lensPlaced && !candleLit && <TargetZone position={[-0.35, 0.18, 0]} label="🕯️" active={true} onClick={() => handleAction("candle")} />}
      {candleLit && <TargetZone position={[screenPos, 0.18, 0]} label="📺" active={selectedItem === "screen"} onClick={() => handleAction("screen")} />}
      {screenPlaced && !imageFocused && <TargetZone position={[screenPos, 0.22, 0]} label="🎯" active={true} onClick={() => handleAction("focus")} />}
      {imageFocused && !divergentTested && <TargetZone position={[0, 0.25, 0]} label="🔄" active={true} onClick={() => handleAction("divergent")} />}

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

export default OpticsLensExperiment
