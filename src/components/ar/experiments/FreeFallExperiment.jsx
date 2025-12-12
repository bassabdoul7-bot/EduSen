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
      toast.success(`⏱️ t = ${time.toFixed(2)}s, g ≈ 9.8 m/s²`)
    }
  }, [falling, ballY])

  const handleAction = (action) => {
    if (action === "place" && selectedItem === "ball") { triggerMascotAction([-0.35, 0.08, 0.3], [0.15, 0.5, -0.1], "#3b82f6", "La bille!", () => { setState(p => ({ ...p, ballPlaced: true })); setSelectedItem(null); setStep(1); toast.success("🔵 Bille placee!") }, "ball") }
    else if (action === "release" && ballPlaced && !released) { triggerMascotAction([0.15, 0.55, -0.1], [0.15, 0.55, -0.1], "#ef4444", "Je lache!", () => { setState(p => ({ ...p, released: true })); setFalling(true); setStep(2); toast.success("⬇️ Chute libre!") }, null) }
    else if (action === "calculate" && measured) { setStep(experiment.steps.length - 1); toast.success("g = 2h/t² ≈ 9.81 m/s²") }
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
      <TargetZone position={[0.15, 0.55, -0.05]} label="🔵" active={selectedItem === "ball"} onClick={() => handleAction("place")} />
      {ballPlaced && !released && <TargetZone position={[0.15, 0.6, 0]} label="⬇️" active={true} onClick={() => handleAction("release")} />}
      {measured && <TargetZone position={[0, 0.25, 0.1]} label="📊" active={true} onClick={() => handleAction("calculate")} />}

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
      {measured && <Html position={[-0.28, 0.3, 0.1]} center><div className="bg-blue-900 text-white p-2 rounded text-xs"><div className="font-bold">Chute Libre</div><div className="text-yellow-300">h = ½gt²</div><div className="text-green-300">g = 2h/t²</div><div className="text-white mt-1">g ≈ 9.81 m/s²</div></div></Html>}
    </group>
  )
}

export default FreeFallExperiment
