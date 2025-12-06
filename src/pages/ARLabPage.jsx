import { useState, useEffect, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import { arLabService, calculatePH, getIndicatorColor, calculateCurrent, calculatePeriod } from "../services/arLab"
import toast from "react-hot-toast"
import { ArrowLeft, PlayCircle, Camera, X, List, ChevronDown, ChevronUp, Circle, CheckCircle, RotateCcw, MousePointer, Hand, GraduationCap, School } from "lucide-react"
import { useNavigate } from "react-router-dom"
import * as THREE from "three"

function TargetZone({ position, label, active, onClick }) {
  const ringRef = useRef()
  const [hovered, setHovered] = useState(false)
  useFrame((state) => { if (ringRef.current && active) ringRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.15) })
  if (!active) return null
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick?.() }} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.08, 0.12, 32]} /><meshBasicMaterial color={hovered ? "#16a34a" : "#22c55e"} transparent opacity={0.8} side={THREE.DoubleSide} /></mesh>
      <Html position={[0, 0.15, 0]} center><div className={`px-2 py-1 rounded text-xs font-bold shadow whitespace-nowrap ${hovered ? "bg-green-700" : "bg-green-600"} text-white animate-bounce`}>{label}</div></Html>
    </group>
  )
}

function ClickableObject({ children, position, selected, onClick, enabled }) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef()
  useFrame((state) => { if (groupRef.current && selected) groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 8) * 0.01 })
  return (
    <group ref={groupRef} position={position} onClick={(e) => { e.stopPropagation(); enabled && onClick?.() }} onPointerOver={() => enabled && setHovered(true)} onPointerOut={() => setHovered(false)}>
      {children}
      {selected && <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.02,0]}><ringGeometry args={[0.07,0.1,32]} /><meshBasicMaterial color="#fbbf24" transparent opacity={0.9} side={THREE.DoubleSide} /></mesh>}
      {enabled && !selected && <Html position={[0,-0.06,0]} center><div className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${hovered ? "bg-green-600" : "bg-green-500"} text-white`}><MousePointer size={10} /></div></Html>}
      {selected && <Html position={[0,-0.06,0]} center><div className="bg-yellow-500 text-black px-1.5 py-0.5 rounded-full text-xs font-bold animate-pulse">Cible!</div></Html>}
      {!enabled && <Html position={[0,-0.05,0]} center><div className="bg-gray-400 text-white px-1 py-0.5 rounded text-xs">🔒</div></Html>}
    </group>
  )
}

function Wire({ start, end, color = "#f00", glowing = false }) {
  const ref = useRef()
  useFrame((s) => { if (ref.current && glowing) ref.current.material.emissiveIntensity = 0.5 + Math.sin(s.clock.elapsedTime * 6) * 0.3 })
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(...start), new THREE.Vector3(...end)])
  return <mesh ref={ref}><tubeGeometry args={[curve, 16, 0.008, 8, false]} /><meshStandardMaterial color={color} emissive={glowing ? color : "#000"} emissiveIntensity={glowing ? 0.5 : 0} /></mesh>
}

function StepsPanel({ steps, currentStep, expanded, onToggle }) {
  return (
    <div className="absolute top-2 right-2 z-20 max-w-[200px]">
      <div className="rounded-xl shadow-lg overflow-hidden bg-white/95">
        <button onClick={onToggle} className="w-full px-2 py-1.5 flex items-center justify-between bg-gray-50">
          <span className="font-bold text-xs flex items-center gap-1"><List size={14} /> {currentStep+1}/{steps.length}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expanded && <div className="px-2 pb-2 pt-1 max-h-[160px] overflow-y-auto">{steps.map((step, i) => (
          <div key={i} className={`flex items-start gap-1 py-0.5 text-xs ${i < currentStep ? "text-green-600" : i === currentStep ? "text-orange-500 font-bold" : "text-gray-400"}`}>
            {i < currentStep ? <CheckCircle size={11} /> : <Circle size={11} className={i === currentStep ? "animate-pulse" : ""} />}
            <span>{step}</span>
          </div>
        ))}</div>}
      </div>
    </div>
  )
}

function LabTable({ position }) { return <mesh position={position}><boxGeometry args={[1.4, 0.04, 1.1]} /><meshStandardMaterial color="#5c4033" roughness={0.8} /></mesh> }
function CompletionBanner({ text }) { return <Html position={[0, 0.45, 0]} center><div className="bg-green-500 text-white px-3 py-2 rounded-lg font-bold animate-bounce shadow-xl">{text}</div></Html> }

// LYCEE CHEMISTRY
function AcidBaseExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { hclVolume, indicatorAdded, pH, color, neutralized } = state
  const handlePour = (type) => {
    if (type === "hcl" && selectedItem === "hcl") { setState(p => ({ ...p, hclVolume: 50, pH: 1 })); setSelectedItem(null); setStep(1); toast.success("🧪 HCl!") }
    else if (type === "indicator" && selectedItem === "indicator") { setState(p => ({ ...p, indicatorAdded: true })); setSelectedItem(null); setStep(2); toast.success("💧 Indicateur!") }
    else if (type === "naoh" && selectedItem === "naoh" && !neutralized) {
      setState(p => { const nV = p.naohVolume + 8, nPH = calculatePH(p.hclVolume, nV), nC = getIndicatorColor(nPH), done = nPH >= 6.5
        if (done) setTimeout(() => { setStep(experiment.steps.length - 1); toast.success("🎉 Neutralise!") }, 300)
        return { ...p, naohVolume: nV, pH: nPH, color: nC, neutralized: done }
      }); setSelectedItem(null)
    }
  }
  return (
    <group>
      <mesh position={[0, 0.01, 0.05]}><boxGeometry args={[1.1, 0.02, 0.6]} /><meshStandardMaterial color="#3d3d3d" /></mesh>
      <mesh position={[0, 0.01, 0.45]}><boxGeometry args={[1.1, 0.02, 0.25]} /><meshStandardMaterial color="#2d2d2d" /></mesh>
      <group position={[0, 0.1, -0.05]}>
        <mesh><cylinderGeometry args={[0.1, 0.08, 0.18, 32, 1, true]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.2} side={THREE.DoubleSide} /></mesh>
        {hclVolume > 0 && <mesh position={[0, -0.02, 0]}><cylinderGeometry args={[0.08, 0.07, 0.12, 32]} /><meshStandardMaterial color={color} transparent opacity={0.85} /></mesh>}
        <Html position={[0, 0.14, 0]} center><div className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-bold">pH: {pH.toFixed(1)}</div></Html>
      </group>
      <TargetZone position={[0, 0.22, -0.05]} label="⬇️ Verser" active={["hcl","indicator","naoh"].includes(selectedItem) && ((selectedItem==="hcl"&&!hclVolume)||(selectedItem==="indicator"&&hclVolume&&!indicatorAdded)||(selectedItem==="naoh"&&indicatorAdded&&!neutralized))} onClick={() => handlePour(selectedItem)} />
      <ClickableObject position={[-0.35, 0.1, 0.42]} selected={selectedItem === "hcl"} enabled={!hclVolume} onClick={() => setSelectedItem(selectedItem === "hcl" ? null : "hcl")}><group><mesh><cylinderGeometry args={[0.035, 0.035, 0.1, 16]} /><meshStandardMaterial color="#ff6b6b" /></mesh><Html position={[0, 0.08, 0]} center><div className="bg-white px-1 py-0.5 rounded text-xs font-bold">HCl</div></Html></group></ClickableObject>
      <ClickableObject position={[0, 0.08, 0.45]} selected={selectedItem === "indicator"} enabled={hclVolume > 0 && !indicatorAdded} onClick={() => setSelectedItem(selectedItem === "indicator" ? null : "indicator")}><group><mesh><cylinderGeometry args={[0.025, 0.025, 0.07, 16]} /><meshStandardMaterial color="#9b59b6" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-white px-1 py-0.5 rounded text-xs font-bold">Ind</div></Html></group></ClickableObject>
      <ClickableObject position={[0.35, 0.1, 0.42]} selected={selectedItem === "naoh"} enabled={indicatorAdded && !neutralized} onClick={() => setSelectedItem(selectedItem === "naoh" ? null : "naoh")}><group><mesh><cylinderGeometry args={[0.035, 0.035, 0.1, 16]} /><meshStandardMaterial color="#4dabf7" /></mesh><Html position={[0, 0.08, 0]} center><div className="bg-white px-1 py-0.5 rounded text-xs font-bold">NaOH</div></Html></group></ClickableObject>
      {neutralized && <CompletionBanner text="✅ Neutralisation!" />}
    </group>
  )
}

function CombustionExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { bunsenLit, magnesiumBurning } = state
  const handleAction = (a) => {
    if (a === "lighter" && selectedItem === "lighter") { setState(p => ({ ...p, bunsenLit: true })); setSelectedItem(null); setStep(1); toast.success("🔥 Allume!") }
    else if (a === "magnesium" && selectedItem === "magnesium" && bunsenLit) { setState(p => ({ ...p, magnesiumBurning: true })); setSelectedItem(null); setStep(3); toast.success("✨ Combustion!"); setTimeout(() => setStep(experiment.steps.length - 1), 2000) }
  }
  return (
    <group>
      <mesh position={[0, 0.01, 0.05]}><boxGeometry args={[1.1, 0.02, 0.55]} /><meshStandardMaterial color="#3d3d3d" /></mesh>
      <mesh position={[0, 0.01, 0.4]}><boxGeometry args={[1.1, 0.02, 0.2]} /><meshStandardMaterial color="#2d2d2d" /></mesh>
      <group position={[0, 0.02, 0]}>
        <mesh position={[0, 0.015, 0]}><cylinderGeometry args={[0.07, 0.07, 0.03, 16]} /><meshStandardMaterial color="#333" metalness={0.9} /></mesh>
        <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.025, 0.025, 0.18, 16]} /><meshStandardMaterial color="#444" metalness={0.8} /></mesh>
        {bunsenLit && <><mesh position={[0, 0.26, 0]}><coneGeometry args={[0.03, 0.1, 16]} /><meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={2} transparent opacity={0.9} /></mesh><pointLight position={[0, 0.26, 0]} color="#ff6600" intensity={1.5} distance={0.8} /></>}
      </group>
      {magnesiumBurning && <group position={[0, 0.32, 0]}><mesh><sphereGeometry args={[0.05, 16, 16]} /><meshBasicMaterial color="#fff" /></mesh><pointLight color="#fff" intensity={5} distance={2} /></group>}
      <TargetZone position={[0, 0.22, 0]} label="🔥" active={selectedItem === "lighter"} onClick={() => handleAction("lighter")} />
      <TargetZone position={[0, 0.32, 0]} label="✨" active={selectedItem === "magnesium" && bunsenLit} onClick={() => handleAction("magnesium")} />
      <ClickableObject position={[-0.35, 0.08, 0.38]} selected={selectedItem === "lighter"} enabled={!bunsenLit} onClick={() => setSelectedItem(selectedItem === "lighter" ? null : "lighter")}><group><mesh><boxGeometry args={[0.025, 0.07, 0.015]} /><meshStandardMaterial color="#e74c3c" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-red-500 text-white px-1 py-0.5 rounded text-xs">🔥</div></Html></group></ClickableObject>
      <ClickableObject position={[0.35, 0.08, 0.38]} selected={selectedItem === "magnesium"} enabled={bunsenLit && !magnesiumBurning} onClick={() => setSelectedItem(selectedItem === "magnesium" ? null : "magnesium")}><group><mesh rotation={[0, 0, 0.3]}><boxGeometry args={[0.12, 0.01, 0.005]} /><meshStandardMaterial color="#ccc" metalness={0.95} /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-gray-200 px-1 py-0.5 rounded text-xs font-bold">Mg</div></Html></group></ClickableObject>
      {magnesiumBurning && <CompletionBanner text="✅ 2Mg + O₂ → 2MgO" />}
    </group>
  )
}

// LYCEE PHYSICS
function CircuitExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { batteryConnected, resistorConnected, bulbLit } = state
  const handlePlace = (item) => {
    if (item === "battery" && selectedItem === "battery") { setState(p => ({ ...p, batteryConnected: true })); setSelectedItem(null); setStep(1); toast.success("🔋 Pile!") }
    else if (item === "resistor" && selectedItem === "resistor") { setState(p => ({ ...p, resistorConnected: true })); setSelectedItem(null); setStep(2); toast.success("⚡ Resistance!") }
    else if (item === "bulb" && selectedItem === "bulb") { setState(p => ({ ...p, bulbLit: true, current: 0.09 })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("💡 I=0.09A") }
  }
  return (
    <group>
      <mesh position={[0, 0.01, 0]}><boxGeometry args={[1.1, 0.02, 0.5]} /><meshStandardMaterial color="#1a5c32" /></mesh>
      <mesh position={[0, 0.01, 0.4]}><boxGeometry args={[1.1, 0.02, 0.25]} /><meshStandardMaterial color="#2d2d2d" /></mesh>
      <TargetZone position={[-0.3, 0.04, 0]} label="🔋" active={selectedItem === "battery"} onClick={() => handlePlace("battery")} />
      <TargetZone position={[0, 0.04, 0]} label="⚡" active={selectedItem === "resistor"} onClick={() => handlePlace("resistor")} />
      <TargetZone position={[0.3, 0.04, 0]} label="💡" active={selectedItem === "bulb"} onClick={() => handlePlace("bulb")} />
      {!batteryConnected ? <ClickableObject position={[-0.3, 0.1, 0.38]} selected={selectedItem === "battery"} enabled={true} onClick={() => setSelectedItem(selectedItem === "battery" ? null : "battery")}><group><mesh><boxGeometry args={[0.06, 0.1, 0.04]} /><meshStandardMaterial color="#1e40af" /></mesh><Html position={[0, 0.08, 0]} center><div className="bg-yellow-400 px-1 text-xs font-bold rounded">9V</div></Html></group></ClickableObject> : <group position={[-0.3, 0.1, 0]}><mesh><boxGeometry args={[0.06, 0.1, 0.04]} /><meshStandardMaterial color="#1e40af" /></mesh></group>}
      {!resistorConnected ? <ClickableObject position={[0, 0.1, 0.38]} selected={selectedItem === "resistor"} enabled={batteryConnected} onClick={() => setSelectedItem(selectedItem === "resistor" ? null : "resistor")}><group><mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.02, 0.02, 0.1, 16]} /><meshStandardMaterial color="#c2410c" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-orange-200 px-1 text-xs font-bold rounded">100Ω</div></Html></group></ClickableObject> : <group position={[0, 0.1, 0]}><mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.02, 0.02, 0.1, 16]} /><meshStandardMaterial color="#c2410c" emissive={bulbLit?"#f60":"#000"} emissiveIntensity={bulbLit?0.4:0} /></mesh></group>}
      {!bulbLit ? <ClickableObject position={[0.3, 0.12, 0.38]} selected={selectedItem === "bulb"} enabled={resistorConnected} onClick={() => setSelectedItem(selectedItem === "bulb" ? null : "bulb")}><group><mesh><sphereGeometry args={[0.035, 32, 32]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.4} /></mesh></group></ClickableObject> : <group position={[0.3, 0.12, 0]}><mesh><sphereGeometry args={[0.035, 32, 32]} /><meshPhysicalMaterial color="#ffc" emissive="#ff0" emissiveIntensity={2} /></mesh><pointLight color="#ff0" intensity={2} distance={1} /></group>}
      {batteryConnected && <Wire start={[-0.22, 0.1, 0]} end={[-0.08, 0.1, 0]} color={bulbLit?"#0f0":"#c00"} glowing={bulbLit} />}
      {resistorConnected && <Wire start={[0.08, 0.1, 0]} end={[0.22, 0.12, 0]} color={bulbLit?"#0f0":"#00c"} glowing={bulbLit} />}
      {bulbLit && <CompletionBanner text="✅ I = U/R = 0.09A" />}
    </group>
  )
}

function PendulumExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { stringAttached, massAttached, swinging, period } = state
  const pendulumRef = useRef()
  useFrame((s) => { if (swinging && pendulumRef.current) pendulumRef.current.rotation.z = Math.sin(s.clock.elapsedTime * Math.PI) * 0.4 })
  const handleAction = (a) => {
    if (a === "string" && selectedItem === "string") { setState(p => ({ ...p, stringAttached: true })); setSelectedItem(null); setStep(1); toast.success("🧵 Ficelle!") }
    else if (a === "mass" && selectedItem === "mass") { setState(p => ({ ...p, massAttached: true })); setSelectedItem(null); setStep(2); toast.success("⚖️ Masse!") }
    else if (a === "swing" && selectedItem === "swing") { const T = calculatePeriod(1); setState(p => ({ ...p, swinging: true, period: T })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success(`⏱️ T=${T.toFixed(2)}s`) }
  }
  return (
    <group>
      <mesh position={[0, 0.01, 0.05]}><boxGeometry args={[1.1, 0.02, 0.6]} /><meshStandardMaterial color="#3d3d3d" /></mesh>
      <mesh position={[0, 0.01, 0.45]}><boxGeometry args={[1.1, 0.02, 0.2]} /><meshStandardMaterial color="#2d2d2d" /></mesh>
      <group position={[0, 0.02, -0.1]}>
        <mesh position={[0, 0.012, 0]}><boxGeometry args={[0.2, 0.025, 0.12]} /><meshStandardMaterial color="#444" metalness={0.8} /></mesh>
        <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.012, 0.012, 0.45, 16]} /><meshStandardMaterial color="#555" metalness={0.9} /></mesh>
        <mesh position={[0.08, 0.45, 0]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.008, 0.008, 0.16, 16]} /><meshStandardMaterial color="#555" metalness={0.9} /></mesh>
        {stringAttached && <group ref={pendulumRef} position={[0.14, 0.45, 0]}><mesh position={[0, -0.15, 0]}><cylinderGeometry args={[0.002, 0.002, 0.3, 8]} /><meshStandardMaterial color="#8B4513" /></mesh>{massAttached && <mesh position={[0, -0.32, 0]}><sphereGeometry args={[0.04, 32, 32]} /><meshStandardMaterial color="#dc2626" metalness={0.7} /></mesh>}</group>}
      </group>
      <TargetZone position={[0.14, 0.45, -0.1]} label="🧵" active={selectedItem === "string"} onClick={() => handleAction("string")} />
      <TargetZone position={[0.14, 0.15, -0.1]} label="⚖️" active={selectedItem === "mass" && stringAttached} onClick={() => handleAction("mass")} />
      <TargetZone position={[0.3, 0.15, -0.1]} label="👆" active={selectedItem === "swing" && massAttached} onClick={() => handleAction("swing")} />
      <ClickableObject position={[-0.35, 0.08, 0.42]} selected={selectedItem === "string"} enabled={!stringAttached} onClick={() => setSelectedItem(selectedItem === "string" ? null : "string")}><group><mesh rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.03, 0.01, 8, 32]} /><meshStandardMaterial color="#8B4513" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-white px-1 py-0.5 rounded text-xs font-bold">1m</div></Html></group></ClickableObject>
      <ClickableObject position={[0, 0.08, 0.42]} selected={selectedItem === "mass"} enabled={stringAttached && !massAttached} onClick={() => setSelectedItem(selectedItem === "mass" ? null : "mass")}><group><mesh><sphereGeometry args={[0.03, 32, 32]} /><meshStandardMaterial color="#dc2626" metalness={0.7} /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-white px-1 py-0.5 rounded text-xs font-bold">100g</div></Html></group></ClickableObject>
      <ClickableObject position={[0.35, 0.08, 0.42]} selected={selectedItem === "swing"} enabled={massAttached && !swinging} onClick={() => setSelectedItem(selectedItem === "swing" ? null : "swing")}><group><mesh><boxGeometry args={[0.04, 0.05, 0.015]} /><meshStandardMaterial color="#f59e0b" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-yellow-400 px-1 py-0.5 rounded text-xs font-bold">👆</div></Html></group></ClickableObject>
      {swinging && <Html position={[0.4, 0.35, 0]} center><div className="bg-blue-900 text-white p-2 rounded text-xs"><div className="font-bold">T = 2π√(L/g)</div><div className="text-lg text-yellow-300">T ≈ 2.01s</div></div></Html>}
      {swinging && <CompletionBanner text="✅ Periode mesuree!" />}
    </group>
  )
}

// UNIVERSITY CHEMISTRY
function SpectrophotometryExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { blankInserted, calibrated, sampleInserted, wavelengthSet, absorbanceMeasured, absorbance } = state
  const handleAction = (a) => {
    if (a === "blank" && selectedItem === "blank") { setState(p => ({ ...p, blankInserted: true })); setSelectedItem(null); setStep(1); toast.success("📦 Blanc!") }
    else if (a === "calibrate" && selectedItem === "calibrate") { setState(p => ({ ...p, calibrated: true })); setSelectedItem(null); setStep(2); toast.success("✅ Calibre!") }
    else if (a === "sample" && selectedItem === "sample") { setState(p => ({ ...p, sampleInserted: true })); setSelectedItem(null); setStep(3); toast.success("🧪 Echantillon!") }
    else if (a === "wavelength" && selectedItem === "wavelength") { setState(p => ({ ...p, wavelengthSet: true })); setSelectedItem(null); setStep(4); toast.success("🌈 λ=540nm") }
    else if (a === "measure" && selectedItem === "measure") { const A = 0.35 + Math.random() * 0.1; setState(p => ({ ...p, absorbanceMeasured: true, absorbance: A })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success(`📊 A=${A.toFixed(3)}`) }
  }
  return (
    <group>
      <mesh position={[0, 0.01, 0]}><boxGeometry args={[1.2, 0.02, 0.7]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
      <group position={[0, 0.08, 0]}><mesh position={[0, 0.06, 0]}><boxGeometry args={[0.4, 0.12, 0.28]} /><meshStandardMaterial color="#ddd" /></mesh><Html position={[0, 0.14, 0.1]} center><div className="bg-black text-green-400 px-2 py-1 rounded font-mono text-xs w-24">{!calibrated ? "Calibrer..." : absorbanceMeasured ? `A=${absorbance.toFixed(3)}` : `λ=${wavelengthSet?"540":"---"}nm`}</div></Html><mesh position={[-0.12, 0.02, 0]}><boxGeometry args={[0.05, 0.08, 0.05]} /><meshStandardMaterial color="#333" /></mesh>{blankInserted && !sampleInserted && <mesh position={[-0.12, 0.04, 0]}><boxGeometry args={[0.03, 0.06, 0.03]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.4} /></mesh>}{sampleInserted && <mesh position={[-0.12, 0.04, 0]}><boxGeometry args={[0.03, 0.06, 0.03]} /><meshPhysicalMaterial color="#3b82f6" transparent opacity={0.6} /></mesh>}</group>
      <mesh position={[0, 0.01, 0.48]}><boxGeometry args={[1.2, 0.02, 0.25]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <TargetZone position={[-0.12, 0.12, 0]} label="📦" active={selectedItem === "blank" || selectedItem === "sample"} onClick={() => handleAction(selectedItem)} />
      <TargetZone position={[0.12, 0.16, 0.08]} label="🔧" active={["calibrate","wavelength","measure"].includes(selectedItem)} onClick={() => handleAction(selectedItem)} />
      <ClickableObject position={[-0.45, 0.06, 0.45]} selected={selectedItem === "blank"} enabled={!blankInserted} onClick={() => setSelectedItem("blank")}><group><mesh><boxGeometry args={[0.03, 0.06, 0.03]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.4} /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-white px-1 py-0.5 rounded text-xs font-bold">Blanc</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.2, 0.06, 0.45]} selected={selectedItem === "calibrate"} enabled={blankInserted && !calibrated} onClick={() => setSelectedItem("calibrate")}><group><mesh><boxGeometry args={[0.05, 0.03, 0.05]} /><meshStandardMaterial color="#22c55e" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-green-500 text-white px-1 py-0.5 rounded text-xs font-bold">Cal</div></Html></group></ClickableObject>
      <ClickableObject position={[0.05, 0.06, 0.45]} selected={selectedItem === "sample"} enabled={calibrated && !sampleInserted} onClick={() => setSelectedItem("sample")}><group><mesh><boxGeometry args={[0.03, 0.06, 0.03]} /><meshPhysicalMaterial color="#3b82f6" transparent opacity={0.6} /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-bold">Ech</div></Html></group></ClickableObject>
      <ClickableObject position={[0.28, 0.06, 0.45]} selected={selectedItem === "wavelength"} enabled={sampleInserted && !wavelengthSet} onClick={() => setSelectedItem("wavelength")}><group><mesh><boxGeometry args={[0.05, 0.03, 0.05]} /><meshStandardMaterial color="#f59e0b" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-yellow-500 px-1 py-0.5 rounded text-xs font-bold">λ</div></Html></group></ClickableObject>
      <ClickableObject position={[0.48, 0.06, 0.45]} selected={selectedItem === "measure"} enabled={wavelengthSet && !absorbanceMeasured} onClick={() => setSelectedItem("measure")}><group><mesh><boxGeometry args={[0.06, 0.04, 0.05]} /><meshStandardMaterial color="#8b5cf6" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-purple-500 text-white px-1 py-0.5 rounded text-xs font-bold">Mes</div></Html></group></ClickableObject>
      {absorbanceMeasured && <Html position={[0.45, 0.28, 0]} center><div className="bg-blue-900 text-white p-2 rounded text-xs"><div className="font-bold">Beer-Lambert</div><div>A = εlc</div><div className="text-lg text-yellow-300">A = {absorbance.toFixed(3)}</div></div></Html>}
      {absorbanceMeasured && <CompletionBanner text="✅ Mesure complete!" />}
    </group>
  )
}

function GalvanicCellExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { zincPlaced, copperPlaced, saltBridgeConnected, voltmeterConnected, measured, voltage } = state
  const handleAction = (a) => {
    if (a === "zinc" && selectedItem === "zinc") { setState(p => ({ ...p, zincPlaced: true })); setSelectedItem(null); setStep(0); toast.success("🔩 Zn!") }
    else if (a === "copper" && selectedItem === "copper") { setState(p => ({ ...p, copperPlaced: true })); setSelectedItem(null); setStep(1); toast.success("🟤 Cu!") }
    else if (a === "bridge" && selectedItem === "bridge") { setState(p => ({ ...p, saltBridgeConnected: true })); setSelectedItem(null); setStep(2); toast.success("🌉 Pont!") }
    else if (a === "voltmeter" && selectedItem === "voltmeter") { setState(p => ({ ...p, voltmeterConnected: true })); setSelectedItem(null); setStep(3); toast.success("⚡ Voltmetre!") }
    else if (a === "measure" && selectedItem === "measure") { const E = 1.10 + (Math.random() - 0.5) * 0.02; setState(p => ({ ...p, measured: true, voltage: E })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success(`📊 E=${E.toFixed(2)}V`) }
  }
  return (
    <group>
      <mesh position={[0, 0.01, 0]}><boxGeometry args={[1.2, 0.02, 0.7]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
      <group position={[-0.25, 0.08, 0]}><mesh><cylinderGeometry args={[0.08, 0.07, 0.14, 32, 1, true]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.25} side={THREE.DoubleSide} /></mesh><mesh position={[0, -0.04, 0]}><cylinderGeometry args={[0.06, 0.06, 0.06, 32]} /><meshStandardMaterial color="#87ceeb" transparent opacity={0.7} /></mesh>{zincPlaced && <mesh position={[0, 0.02, 0]}><boxGeometry args={[0.015, 0.12, 0.004]} /><meshStandardMaterial color="#a0a0a0" metalness={0.9} /></mesh>}<Html position={[0, 0.12, 0]} center><div className="bg-gray-600 text-white px-1 py-0.5 rounded text-xs">ZnSO4</div></Html></group>
      <group position={[0.25, 0.08, 0]}><mesh><cylinderGeometry args={[0.08, 0.07, 0.14, 32, 1, true]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.25} side={THREE.DoubleSide} /></mesh><mesh position={[0, -0.04, 0]}><cylinderGeometry args={[0.06, 0.06, 0.06, 32]} /><meshStandardMaterial color="#87ceeb" transparent opacity={0.7} /></mesh>{copperPlaced && <mesh position={[0, 0.02, 0]}><boxGeometry args={[0.015, 0.12, 0.004]} /><meshStandardMaterial color="#b87333" metalness={0.9} /></mesh>}<Html position={[0, 0.12, 0]} center><div className="bg-blue-600 text-white px-1 py-0.5 rounded text-xs">CuSO4</div></Html></group>
      {saltBridgeConnected && <mesh position={[0, 0.12, 0]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.02, 0.02, 0.4, 16]} /><meshStandardMaterial color="#f0e68c" /></mesh>}
      {voltmeterConnected && <group position={[0, 0.25, 0.12]}><mesh><boxGeometry args={[0.12, 0.08, 0.04]} /><meshStandardMaterial color="#222" /></mesh><Html position={[0, 0, 0.025]} center><div className="bg-black text-red-500 px-1 py-0.5 rounded font-mono text-sm font-bold">{measured ? `${voltage.toFixed(2)}V` : "0.00V"}</div></Html><Wire start={[-0.06, -0.04, 0]} end={[-0.25, -0.17, -0.12]} color="#f00" /><Wire start={[0.06, -0.04, 0]} end={[0.25, -0.17, -0.12]} color="#000" /></group>}
      <mesh position={[0, 0.01, 0.48]}><boxGeometry args={[1.2, 0.02, 0.22]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <TargetZone position={[-0.25, 0.1, 0]} label="Zn" active={selectedItem === "zinc"} onClick={() => handleAction("zinc")} />
      <TargetZone position={[0.25, 0.1, 0]} label="Cu" active={selectedItem === "copper"} onClick={() => handleAction("copper")} />
      <TargetZone position={[0, 0.15, 0]} label="🌉" active={selectedItem === "bridge"} onClick={() => handleAction("bridge")} />
      <TargetZone position={[0, 0.28, 0.12]} label="⚡" active={selectedItem === "voltmeter"} onClick={() => handleAction("voltmeter")} />
      <TargetZone position={[0, 0.35, 0.15]} label="📊" active={selectedItem === "measure" && voltmeterConnected} onClick={() => handleAction("measure")} />
      <ClickableObject position={[-0.48, 0.06, 0.45]} selected={selectedItem === "zinc"} enabled={!zincPlaced} onClick={() => setSelectedItem("zinc")}><group><mesh><boxGeometry args={[0.015, 0.08, 0.004]} /><meshStandardMaterial color="#a0a0a0" metalness={0.9} /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-gray-500 text-white px-1 py-0.5 rounded text-xs font-bold">Zn</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.25, 0.06, 0.45]} selected={selectedItem === "copper"} enabled={zincPlaced && !copperPlaced} onClick={() => setSelectedItem("copper")}><group><mesh><boxGeometry args={[0.015, 0.08, 0.004]} /><meshStandardMaterial color="#b87333" metalness={0.9} /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-orange-700 text-white px-1 py-0.5 rounded text-xs font-bold">Cu</div></Html></group></ClickableObject>
      <ClickableObject position={[0, 0.06, 0.45]} selected={selectedItem === "bridge"} enabled={copperPlaced && !saltBridgeConnected} onClick={() => setSelectedItem("bridge")}><group><mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.015, 0.015, 0.08, 16]} /><meshStandardMaterial color="#f0e68c" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-yellow-200 px-1 py-0.5 rounded text-xs font-bold">Pont</div></Html></group></ClickableObject>
      <ClickableObject position={[0.25, 0.06, 0.45]} selected={selectedItem === "voltmeter"} enabled={saltBridgeConnected && !voltmeterConnected} onClick={() => setSelectedItem("voltmeter")}><group><mesh><boxGeometry args={[0.06, 0.04, 0.025]} /><meshStandardMaterial color="#222" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-800 text-white px-1 py-0.5 rounded text-xs font-bold">V</div></Html></group></ClickableObject>
      <ClickableObject position={[0.48, 0.06, 0.45]} selected={selectedItem === "measure"} enabled={voltmeterConnected && !measured} onClick={() => setSelectedItem("measure")}><group><mesh><boxGeometry args={[0.05, 0.03, 0.04]} /><meshStandardMaterial color="#22c55e" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-green-500 text-white px-1 py-0.5 rounded text-xs font-bold">Mes</div></Html></group></ClickableObject>
      {measured && <Html position={[0.5, 0.3, 0]} center><div className="bg-purple-900 text-white p-2 rounded text-xs"><div className="font-bold">Pile Daniell</div><div>E° = 0.34 - (-0.76)</div><div className="text-lg text-yellow-300">E° = 1.10V</div></div></Html>}
      {measured && <CompletionBanner text="✅ Pile electrochimique!" />}
    </group>
  )
}

function ChromatographyExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { extractPrepared, sampleDeposited, solventReady, plateInTank, migrationDone, rfCalculated } = state
  const handleAction = (a) => {
    if (a === "extract" && selectedItem === "extract") { setState(p => ({ ...p, extractPrepared: true })); setSelectedItem(null); setStep(0); toast.success("🌿 Extrait!") }
    else if (a === "deposit" && selectedItem === "deposit") { setState(p => ({ ...p, sampleDeposited: true })); setSelectedItem(null); setStep(1); toast.success("💧 Depot!") }
    else if (a === "solvent" && selectedItem === "solvent") { setState(p => ({ ...p, solventReady: true })); setSelectedItem(null); setStep(2); toast.success("🧪 Eluant!") }
    else if (a === "place" && selectedItem === "place") { setState(p => ({ ...p, plateInTank: true })); setSelectedItem(null); setStep(3); toast.success("📥 Migration..."); setTimeout(() => { setState(p => ({ ...p, migrationDone: true })); toast.success("✅ Migration!") }, 3000) }
    else if (a === "calculate" && selectedItem === "calculate") { setState(p => ({ ...p, rfCalculated: true })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("📊 Rf!") }
  }
  return (
    <group>
      <mesh position={[0, 0.01, 0]}><boxGeometry args={[1.2, 0.02, 0.7]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
      <group position={[0.2, 0.08, 0]}><mesh><boxGeometry args={[0.2, 0.2, 0.15]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.2} side={THREE.DoubleSide} /></mesh>{solventReady && <mesh position={[0, -0.08, 0]}><boxGeometry args={[0.18, 0.03, 0.13]} /><meshStandardMaterial color="#a0d8ef" transparent opacity={0.6} /></mesh>}{plateInTank && <group position={[0, 0, 0]}><mesh><boxGeometry args={[0.1, 0.16, 0.005]} /><meshStandardMaterial color="#f5f5f5" /></mesh>{sampleDeposited && <mesh position={[0, -0.06, 0.003]}><circleGeometry args={[0.01, 16]} /><meshStandardMaterial color="#2d5a27" /></mesh>}{migrationDone && <><mesh position={[0, 0.02, 0.003]}><circleGeometry args={[0.012, 16]} /><meshStandardMaterial color="#90EE90" /></mesh><mesh position={[0, 0.04, 0.003]}><circleGeometry args={[0.008, 16]} /><meshStandardMaterial color="#FFD700" /></mesh><mesh position={[0, 0.055, 0.003]}><circleGeometry args={[0.006, 16]} /><meshStandardMaterial color="#FFA500" /></mesh></>}</group>}<Html position={[0, 0.14, 0]} center><div className="bg-gray-600 text-white px-1 py-0.5 rounded text-xs">Cuve CCM</div></Html></group>
      <mesh position={[0, 0.01, 0.48]}><boxGeometry args={[1.2, 0.02, 0.22]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <TargetZone position={[-0.35, 0.1, 0]} label="🌿" active={selectedItem === "extract"} onClick={() => handleAction("extract")} />
      <TargetZone position={[-0.15, 0.1, 0]} label="💧" active={selectedItem === "deposit" && extractPrepared} onClick={() => handleAction("deposit")} />
      <TargetZone position={[0.2, 0.02, 0]} label="🧪" active={selectedItem === "solvent" && sampleDeposited} onClick={() => handleAction("solvent")} />
      <TargetZone position={[0.2, 0.1, 0]} label="📥" active={selectedItem === "place" && solventReady} onClick={() => handleAction("place")} />
      <TargetZone position={[0.45, 0.1, 0]} label="📊" active={selectedItem === "calculate" && migrationDone} onClick={() => handleAction("calculate")} />
      <ClickableObject position={[-0.48, 0.06, 0.45]} selected={selectedItem === "extract"} enabled={!extractPrepared} onClick={() => setSelectedItem("extract")}><group><mesh><cylinderGeometry args={[0.03, 0.03, 0.08, 16]} /><meshStandardMaterial color="#2d5a27" transparent opacity={0.8} /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-green-700 text-white px-1 py-0.5 rounded text-xs">🌿</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.25, 0.06, 0.45]} selected={selectedItem === "deposit"} enabled={extractPrepared && !sampleDeposited} onClick={() => setSelectedItem("deposit")}><group><mesh><cylinderGeometry args={[0.008, 0.002, 0.06, 16]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-gray-700 text-white px-1 py-0.5 rounded text-xs">Cap</div></Html></group></ClickableObject>
      <ClickableObject position={[0, 0.06, 0.45]} selected={selectedItem === "solvent"} enabled={sampleDeposited && !solventReady} onClick={() => setSelectedItem("solvent")}><group><mesh><cylinderGeometry args={[0.025, 0.025, 0.08, 16]} /><meshStandardMaterial color="#a0d8ef" transparent opacity={0.7} /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-blue-300 px-1 py-0.5 rounded text-xs">Eluant</div></Html></group></ClickableObject>
      <ClickableObject position={[0.25, 0.06, 0.45]} selected={selectedItem === "place"} enabled={solventReady && !plateInTank} onClick={() => setSelectedItem("place")}><group><mesh><boxGeometry args={[0.06, 0.1, 0.003]} /><meshStandardMaterial color="#f5f5f5" /></mesh><Html position={[0, 0.07, 0]} center><div className="bg-white border px-1 py-0.5 rounded text-xs">Plaque</div></Html></group></ClickableObject>
      <ClickableObject position={[0.48, 0.06, 0.45]} selected={selectedItem === "calculate"} enabled={migrationDone && !rfCalculated} onClick={() => setSelectedItem("calculate")}><group><mesh><boxGeometry args={[0.05, 0.04, 0.04]} /><meshStandardMaterial color="#8b5cf6" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-purple-500 text-white px-1 py-0.5 rounded text-xs">Rf</div></Html></group></ClickableObject>
      {rfCalculated && <Html position={[0.5, 0.28, 0]} center><div className="bg-green-900 text-white p-2 rounded text-xs"><div className="font-bold mb-1">Pigments</div><div>Chl b: Rf=0.42</div><div>Chl a: Rf=0.58</div><div>Carotenes: Rf=0.95</div></div></Html>}
      {rfCalculated && <CompletionBanner text="✅ Pigments separes!" />}
    </group>
  )
}

// UNIVERSITY PHYSICS
function DoubleSlitExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { laserOn, slitsAligned, screenPlaced, patternVisible } = state
  const handleAction = (a) => {
    if (a === "laser" && selectedItem === "laser") { setState(p => ({ ...p, laserOn: true })); setSelectedItem(null); setStep(0); toast.success("🔴 Laser!") }
    else if (a === "slits" && selectedItem === "slits") { setState(p => ({ ...p, slitsAligned: true })); setSelectedItem(null); setStep(1); toast.success("📐 Aligne!") }
    else if (a === "screen" && selectedItem === "screen") { setState(p => ({ ...p, screenPlaced: true })); setSelectedItem(null); setStep(2); toast.success("🎯 Ecran!") }
    else if (a === "observe" && selectedItem === "observe") { setState(p => ({ ...p, patternVisible: true })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("🌈 Franges!") }
  }
  return (
    <group>
      <mesh position={[0, 0.01, 0]}><boxGeometry args={[1.4, 0.02, 0.7]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <group position={[-0.5, 0.08, 0]}><mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.025, 0.025, 0.12, 16]} /><meshStandardMaterial color="#333" /></mesh>{laserOn && <><mesh position={[0.35, 0, 0]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.002, 0.002, 0.6, 8]} /><meshBasicMaterial color="#ff0000" transparent opacity={0.8} /></mesh><pointLight position={[0.06, 0, 0]} color="#ff0000" intensity={0.5} distance={0.3} /></>}</group>
      {slitsAligned && <group position={[-0.1, 0.08, 0]}><mesh><boxGeometry args={[0.008, 0.1, 0.12]} /><meshStandardMaterial color="#111" /></mesh></group>}
      {screenPlaced && <group position={[0.45, 0.12, 0]}><mesh><boxGeometry args={[0.015, 0.25, 0.35]} /><meshStandardMaterial color="#f5f5f5" /></mesh>{patternVisible && <group position={[-0.01, 0, 0]}>{[-0.06, -0.03, 0, 0.03, 0.06].map((y, i) => <mesh key={i} position={[0, y, 0]}><boxGeometry args={[0.004, 0.012, 0.3]} /><meshBasicMaterial color="#ff0000" transparent opacity={i === 2 ? 1 : 0.6 - Math.abs(i - 2) * 0.15} /></mesh>)}</group>}</group>}
      <mesh position={[0, 0.01, 0.48]}><boxGeometry args={[1.4, 0.02, 0.22]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
      <TargetZone position={[-0.5, 0.12, 0]} label="🔴" active={selectedItem === "laser"} onClick={() => handleAction("laser")} />
      <TargetZone position={[-0.1, 0.12, 0]} label="📐" active={selectedItem === "slits"} onClick={() => handleAction("slits")} />
      <TargetZone position={[0.45, 0.15, 0]} label="🎯" active={selectedItem === "screen"} onClick={() => handleAction("screen")} />
      <TargetZone position={[0.45, 0.28, 0]} label="👁️" active={selectedItem === "observe" && screenPlaced} onClick={() => handleAction("observe")} />
      <ClickableObject position={[-0.5, 0.06, 0.45]} selected={selectedItem === "laser"} enabled={!laserOn} onClick={() => setSelectedItem("laser")}><group><mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.015, 0.015, 0.06, 16]} /><meshStandardMaterial color="#cc0000" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-red-600 text-white px-1 py-0.5 rounded text-xs font-bold">Laser</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.2, 0.06, 0.45]} selected={selectedItem === "slits"} enabled={laserOn && !slitsAligned} onClick={() => setSelectedItem("slits")}><group><mesh><boxGeometry args={[0.006, 0.06, 0.05]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-gray-700 text-white px-1 py-0.5 rounded text-xs font-bold">Fentes</div></Html></group></ClickableObject>
      <ClickableObject position={[0.1, 0.06, 0.45]} selected={selectedItem === "screen"} enabled={slitsAligned && !screenPlaced} onClick={() => setSelectedItem("screen")}><group><mesh><boxGeometry args={[0.008, 0.08, 0.06]} /><meshStandardMaterial color="#f5f5f5" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-white border px-1 py-0.5 rounded text-xs font-bold">Ecran</div></Html></group></ClickableObject>
      <ClickableObject position={[0.4, 0.06, 0.45]} selected={selectedItem === "observe"} enabled={screenPlaced && !patternVisible} onClick={() => setSelectedItem("observe")}><group><mesh><sphereGeometry args={[0.025, 16, 16]} /><meshStandardMaterial color="#3b82f6" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-bold">👁️</div></Html></group></ClickableObject>
      {patternVisible && <Html position={[0.65, 0.2, 0]} center><div className="bg-indigo-900 text-white p-2 rounded text-xs"><div className="font-bold">Interference</div><div>i = λD/a</div><div className="text-yellow-300">i ≈ 6.3mm</div></div></Html>}
      {patternVisible && <CompletionBanner text="✅ Nature ondulatoire!" />}
    </group>
  )
}

function RLCCircuitExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { rConnected, lConnected, cConnected, generatorOn, oscilloscopeOn, resonanceFound, resonanceFreq } = state
  const coilRef = useRef()
  useFrame((s) => { if (coilRef.current && resonanceFound) coilRef.current.material.emissiveIntensity = 0.5 + Math.sin(s.clock.elapsedTime * 10) * 0.3 })
  const allConnected = rConnected && lConnected && cConnected
  const handleAction = (a) => {
    if (a === "r" && selectedItem === "r") { setState(p => ({ ...p, rConnected: true })); setSelectedItem(null); setStep(0); toast.success("⚡ R!") }
    else if (a === "l" && selectedItem === "l") { setState(p => ({ ...p, lConnected: true })); setSelectedItem(null); setStep(0); toast.success("🔄 L!") }
    else if (a === "c" && selectedItem === "c") { setState(p => ({ ...p, cConnected: true })); setSelectedItem(null); setStep(0); toast.success("⚡ C!") }
    else if (a === "generator" && selectedItem === "generator") { setState(p => ({ ...p, generatorOn: true })); setSelectedItem(null); setStep(1); toast.success("📡 GBF!") }
    else if (a === "oscilloscope" && selectedItem === "oscilloscope") { setState(p => ({ ...p, oscilloscopeOn: true })); setSelectedItem(null); setStep(2); toast.success("📊 Oscillo!") }
    else if (a === "find" && selectedItem === "find") { const f0 = 1592; setState(p => ({ ...p, resonanceFound: true, resonanceFreq: f0 })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success(`🎯 f₀=${f0}Hz`) }
  }
  return (
    <group>
      <mesh position={[0, 0.01, 0]}><boxGeometry args={[1.3, 0.02, 0.7]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[0, 0.025, 0]}><boxGeometry args={[0.8, 0.015, 0.35]} /><meshStandardMaterial color="#1a5c32" /></mesh>
      {rConnected && <group position={[-0.25, 0.08, 0]}><mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.02, 0.02, 0.08, 16]} /><meshStandardMaterial color="#c2410c" /></mesh></group>}
      {lConnected && <group position={[0, 0.08, 0]}><mesh ref={coilRef}><torusGeometry args={[0.03, 0.01, 8, 32]} /><meshStandardMaterial color="#b87333" emissive={resonanceFound ? "#ff6600" : "#000"} emissiveIntensity={0} /></mesh></group>}
      {cConnected && <group position={[0.25, 0.06, 0]}><mesh><boxGeometry args={[0.04, 0.06, 0.02]} /><meshStandardMaterial color="#3b82f6" /></mesh></group>}
      {generatorOn && <group position={[-0.5, 0.08, 0]}><mesh><boxGeometry args={[0.12, 0.08, 0.08]} /><meshStandardMaterial color="#444" /></mesh><Html position={[0, 0.06, 0]} center><div className="bg-gray-700 text-green-400 px-1 py-0.5 rounded text-xs font-mono">~</div></Html></group>}
      {oscilloscopeOn && <group position={[0.5, 0.1, 0]}><mesh><boxGeometry args={[0.18, 0.12, 0.1]} /><meshStandardMaterial color="#222" /></mesh><Html position={[0, 0, 0.06]} center><div className="bg-black border border-green-500 p-1 rounded w-14 h-8">{resonanceFound && <div className="text-green-400 text-xs text-center animate-pulse">MAX</div>}</div></Html></group>}
      <mesh position={[0, 0.01, 0.48]}><boxGeometry args={[1.3, 0.02, 0.22]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
      <TargetZone position={[-0.25, 0.06, 0]} label="R" active={selectedItem === "r"} onClick={() => handleAction("r")} />
      <TargetZone position={[0, 0.06, 0]} label="L" active={selectedItem === "l"} onClick={() => handleAction("l")} />
      <TargetZone position={[0.25, 0.06, 0]} label="C" active={selectedItem === "c"} onClick={() => handleAction("c")} />
      <TargetZone position={[-0.5, 0.1, 0]} label="📡" active={selectedItem === "generator"} onClick={() => handleAction("generator")} />
      <TargetZone position={[0.5, 0.15, 0]} label="📊" active={selectedItem === "oscilloscope"} onClick={() => handleAction("oscilloscope")} />
      <TargetZone position={[0, 0.2, 0]} label="🎯" active={selectedItem === "find" && oscilloscopeOn} onClick={() => handleAction("find")} />
      <ClickableObject position={[-0.5, 0.06, 0.45]} selected={selectedItem === "r"} enabled={!rConnected} onClick={() => setSelectedItem("r")}><group><mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.015, 0.015, 0.06, 16]} /><meshStandardMaterial color="#c2410c" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-orange-600 text-white px-1 py-0.5 rounded text-xs font-bold">R</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.25, 0.06, 0.45]} selected={selectedItem === "l"} enabled={!lConnected} onClick={() => setSelectedItem("l")}><group><mesh><torusGeometry args={[0.02, 0.006, 8, 32]} /><meshStandardMaterial color="#b87333" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-yellow-700 text-white px-1 py-0.5 rounded text-xs font-bold">L</div></Html></group></ClickableObject>
      <ClickableObject position={[0, 0.06, 0.45]} selected={selectedItem === "c"} enabled={!cConnected} onClick={() => setSelectedItem("c")}><group><mesh><boxGeometry args={[0.03, 0.04, 0.015]} /><meshStandardMaterial color="#3b82f6" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-bold">C</div></Html></group></ClickableObject>
      <ClickableObject position={[0.25, 0.06, 0.45]} selected={selectedItem === "generator"} enabled={allConnected && !generatorOn} onClick={() => setSelectedItem("generator")}><group><mesh><boxGeometry args={[0.08, 0.05, 0.05]} /><meshStandardMaterial color="#444" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-600 text-white px-1 py-0.5 rounded text-xs font-bold">GBF</div></Html></group></ClickableObject>
      <ClickableObject position={[0.48, 0.06, 0.45]} selected={selectedItem === "oscilloscope"} enabled={generatorOn && !oscilloscopeOn} onClick={() => setSelectedItem("oscilloscope")}><group><mesh><boxGeometry args={[0.1, 0.07, 0.06]} /><meshStandardMaterial color="#222" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-gray-800 text-green-400 px-1 py-0.5 rounded text-xs font-bold">Osc</div></Html></group></ClickableObject>
      <ClickableObject position={[0.6, 0.06, 0.45]} selected={selectedItem === "find"} enabled={oscilloscopeOn && !resonanceFound} onClick={() => setSelectedItem("find")}><group><mesh><boxGeometry args={[0.05, 0.03, 0.04]} /><meshStandardMaterial color="#22c55e" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-green-500 text-white px-1 py-0.5 rounded text-xs font-bold">f₀</div></Html></group></ClickableObject>
      {resonanceFound && <Html position={[0, 0.35, 0]} center><div className="bg-purple-900 text-white p-2 rounded text-xs"><div className="font-bold">Resonance RLC</div><div>f₀ = 1/(2π√LC)</div><div className="text-lg text-yellow-300">f₀ ≈ 1.6 kHz</div></div></Html>}
      {resonanceFound && <CompletionBanner text="✅ Resonance trouvee!" />}
    </group>
  )
}

function PhotoelectricExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { cathodeReady, circuitReady, lightOn, frequencySet, currentMeasured, thresholdFound } = state
  const handleAction = (a) => {
    if (a === "cathode" && selectedItem === "cathode") { setState(p => ({ ...p, cathodeReady: true })); setSelectedItem(null); setStep(0); toast.success("🔩 Cathode!") }
    else if (a === "circuit" && selectedItem === "circuit") { setState(p => ({ ...p, circuitReady: true })); setSelectedItem(null); setStep(1); toast.success("⚡ Circuit!") }
    else if (a === "light" && selectedItem === "light") { setState(p => ({ ...p, lightOn: true })); setSelectedItem(null); setStep(2); toast.success("💡 Lumiere!") }
    else if (a === "frequency" && selectedItem === "frequency") { setState(p => ({ ...p, frequencySet: true })); setSelectedItem(null); setStep(3); toast.success("🌈 f variee") }
    else if (a === "measure" && selectedItem === "measure") { setState(p => ({ ...p, currentMeasured: true })); setSelectedItem(null); setStep(4); toast.success("📊 Courant!") }
    else if (a === "threshold" && selectedItem === "threshold") { setState(p => ({ ...p, thresholdFound: true })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("🎯 f₀ trouvee!") }
  }
  return (
    <group>
      <mesh position={[0, 0.01, 0]}><boxGeometry args={[1.3, 0.02, 0.7]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <group position={[0, 0.12, 0]}><mesh><sphereGeometry args={[0.1, 32, 32]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.15} side={THREE.DoubleSide} /></mesh>{cathodeReady && <mesh position={[-0.04, 0, 0]}><boxGeometry args={[0.03, 0.08, 0.03]} /><meshStandardMaterial color="#888" metalness={0.9} /></mesh>}{cathodeReady && <mesh position={[0.04, 0, 0]}><boxGeometry args={[0.015, 0.08, 0.015]} /><meshStandardMaterial color="#b87333" metalness={0.9} /></mesh>}{lightOn && <><mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI/2]}><coneGeometry args={[0.03, 0.1, 16]} /><meshBasicMaterial color={frequencySet ? "#9b59b6" : "#3b82f6"} transparent opacity={0.6} /></mesh><pointLight position={[-0.15, 0, 0]} color={frequencySet ? "#9b59b6" : "#3b82f6"} intensity={0.8} distance={0.3} /></>}{currentMeasured && thresholdFound && <mesh position={[0, 0, 0]}><sphereGeometry args={[0.02, 16, 16]} /><meshBasicMaterial color="#ffff00" /></mesh>}</group>
      {circuitReady && <group position={[0.35, 0.08, 0]}><mesh><cylinderGeometry args={[0.05, 0.05, 0.03, 32]} /><meshStandardMaterial color="#222" /></mesh><Html position={[0, 0.03, 0]} center><div className="bg-black text-green-400 px-1 py-0.5 rounded font-mono text-xs">{currentMeasured ? (thresholdFound ? "2.3μA" : "0.0μA") : "---"}</div></Html></group>}
      <mesh position={[0, 0.01, 0.48]}><boxGeometry args={[1.3, 0.02, 0.22]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
      <TargetZone position={[0, 0.12, 0]} label="🔩" active={selectedItem === "cathode"} onClick={() => handleAction("cathode")} />
      <TargetZone position={[0.35, 0.1, 0]} label="⚡" active={selectedItem === "circuit"} onClick={() => handleAction("circuit")} />
      <TargetZone position={[-0.2, 0.12, 0]} label="💡" active={selectedItem === "light"} onClick={() => handleAction("light")} />
      <TargetZone position={[-0.3, 0.12, 0]} label="🌈" active={selectedItem === "frequency" && lightOn} onClick={() => handleAction("frequency")} />
      <TargetZone position={[0.35, 0.15, 0]} label="📊" active={selectedItem === "measure" && frequencySet} onClick={() => handleAction("measure")} />
      <TargetZone position={[0, 0.25, 0]} label="🎯" active={selectedItem === "threshold" && currentMeasured} onClick={() => handleAction("threshold")} />
      <ClickableObject position={[-0.5, 0.06, 0.45]} selected={selectedItem === "cathode"} enabled={!cathodeReady} onClick={() => setSelectedItem("cathode")}><group><mesh><boxGeometry args={[0.025, 0.06, 0.025]} /><meshStandardMaterial color="#888" metalness={0.9} /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-gray-500 text-white px-1 py-0.5 rounded text-xs font-bold">Zn</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.25, 0.06, 0.45]} selected={selectedItem === "circuit"} enabled={cathodeReady && !circuitReady} onClick={() => setSelectedItem("circuit")}><group><mesh><cylinderGeometry args={[0.03, 0.03, 0.02, 32]} /><meshStandardMaterial color="#222" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-800 text-white px-1 py-0.5 rounded text-xs font-bold">A</div></Html></group></ClickableObject>
      <ClickableObject position={[0, 0.06, 0.45]} selected={selectedItem === "light"} enabled={circuitReady && !lightOn} onClick={() => setSelectedItem("light")}><group><mesh><sphereGeometry args={[0.025, 16, 16]} /><meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-yellow-500 px-1 py-0.5 rounded text-xs">💡</div></Html></group></ClickableObject>
      <ClickableObject position={[0.25, 0.06, 0.45]} selected={selectedItem === "frequency"} enabled={lightOn && !frequencySet} onClick={() => setSelectedItem("frequency")}><group><mesh><boxGeometry args={[0.06, 0.03, 0.04]} /><meshStandardMaterial color="#9b59b6" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-purple-500 text-white px-1 py-0.5 rounded text-xs font-bold">f↑</div></Html></group></ClickableObject>
      <ClickableObject position={[0.48, 0.06, 0.45]} selected={selectedItem === "measure"} enabled={frequencySet && !currentMeasured} onClick={() => setSelectedItem("measure")}><group><mesh><boxGeometry args={[0.05, 0.03, 0.04]} /><meshStandardMaterial color="#22c55e" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-green-500 text-white px-1 py-0.5 rounded text-xs font-bold">I</div></Html></group></ClickableObject>
      <ClickableObject position={[0.6, 0.06, 0.45]} selected={selectedItem === "threshold"} enabled={currentMeasured && !thresholdFound} onClick={() => setSelectedItem("threshold")}><group><mesh><boxGeometry args={[0.05, 0.03, 0.04]} /><meshStandardMaterial color="#ef4444" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-red-500 text-white px-1 py-0.5 rounded text-xs font-bold">f₀</div></Html></group></ClickableObject>
      {thresholdFound && <Html position={[0.55, 0.25, 0]} center><div className="bg-red-900 text-white p-2 rounded text-xs"><div className="font-bold">Photoelectrique</div><div>E = hf - W</div><div className="text-yellow-300">W = 4.3 eV (Zn)</div></div></Html>}
      {thresholdFound && <CompletionBanner text="✅ Quantification!" />}
    </group>
  )
}

// UNIVERSITY BIOLOGY
function GelElectrophoresisExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { gelPrepared, samplesLoaded, powerOn, migrationDone, stained, bandsVisible } = state
  const handleAction = (a) => {
    if (a === "gel" && selectedItem === "gel") { setState(p => ({ ...p, gelPrepared: true })); setSelectedItem(null); setStep(0); toast.success("🧪 Gel!") }
    else if (a === "samples" && selectedItem === "samples") { setState(p => ({ ...p, samplesLoaded: true })); setSelectedItem(null); setStep(2); toast.success("💉 ADN!") }
    else if (a === "power" && selectedItem === "power") { setState(p => ({ ...p, powerOn: true })); setSelectedItem(null); setStep(4); toast.success("⚡ Migration..."); setTimeout(() => { setState(p => ({ ...p, migrationDone: true })); toast.success("✅ Migration!") }, 3000) }
    else if (a === "stain" && selectedItem === "stain") { setState(p => ({ ...p, stained: true })); setSelectedItem(null); setStep(5); toast.success("🎨 Coloration!") }
    else if (a === "visualize" && selectedItem === "visualize") { setState(p => ({ ...p, bandsVisible: true })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("🔬 Bandes!") }
  }
  return (
    <group>
      <mesh position={[0, 0.01, 0]}><boxGeometry args={[1.3, 0.02, 0.7]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <group position={[0, 0.06, 0]}><mesh><boxGeometry args={[0.4, 0.08, 0.25]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.2} side={THREE.DoubleSide} /></mesh>{gelPrepared && <mesh position={[0, 0.01, 0]}><boxGeometry args={[0.3, 0.03, 0.15]} /><meshStandardMaterial color="#aaddff" transparent opacity={0.6} /></mesh>}{samplesLoaded && <group position={[0, 0.03, -0.05]}>{[-0.08, -0.04, 0, 0.04, 0.08].map((x, i) => <mesh key={i} position={[x, 0, 0]}><boxGeometry args={[0.02, 0.015, 0.02]} /><meshStandardMaterial color="#3b82f6" /></mesh>)}</group>}{migrationDone && stained && bandsVisible && <group position={[0, 0.025, 0.02]}><mesh position={[-0.08, 0, 0]}><boxGeometry args={[0.015, 0.005, 0.015]} /><meshStandardMaterial color="#ff6b6b" /></mesh><mesh position={[-0.08, 0, 0.02]}><boxGeometry args={[0.015, 0.005, 0.01]} /><meshStandardMaterial color="#ff6b6b" /></mesh><mesh position={[0, 0, 0.01]}><boxGeometry args={[0.015, 0.005, 0.015]} /><meshStandardMaterial color="#ff6b6b" /></mesh><mesh position={[0.04, 0, 0.02]}><boxGeometry args={[0.015, 0.005, 0.01]} /><meshStandardMaterial color="#ff6b6b" /></mesh></group>}{powerOn && <><mesh position={[0, 0.02, -0.1]}><boxGeometry args={[0.3, 0.01, 0.01]} /><meshStandardMaterial color="#333" /></mesh><mesh position={[0, 0.02, 0.1]}><boxGeometry args={[0.3, 0.01, 0.01]} /><meshStandardMaterial color="#c00" /></mesh></>}</group>
      {powerOn && <group position={[0.4, 0.06, 0]}><mesh><boxGeometry args={[0.1, 0.06, 0.08]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-red-500 text-white px-1 py-0.5 rounded text-xs animate-pulse">120V</div></Html></group>}
      <mesh position={[0, 0.01, 0.48]}><boxGeometry args={[1.3, 0.02, 0.22]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
      <TargetZone position={[0, 0.08, 0]} label="🧪" active={selectedItem === "gel"} onClick={() => handleAction("gel")} />
      <TargetZone position={[0, 0.12, -0.05]} label="💉" active={selectedItem === "samples" && gelPrepared} onClick={() => handleAction("samples")} />
      <TargetZone position={[0.4, 0.08, 0]} label="⚡" active={selectedItem === "power" && samplesLoaded} onClick={() => handleAction("power")} />
      <TargetZone position={[-0.3, 0.08, 0]} label="🎨" active={selectedItem === "stain" && migrationDone} onClick={() => handleAction("stain")} />
      <TargetZone position={[0, 0.15, 0]} label="🔬" active={selectedItem === "visualize" && stained} onClick={() => handleAction("visualize")} />
      <ClickableObject position={[-0.5, 0.06, 0.45]} selected={selectedItem === "gel"} enabled={!gelPrepared} onClick={() => setSelectedItem("gel")}><group><mesh><boxGeometry args={[0.06, 0.02, 0.04]} /><meshStandardMaterial color="#aaddff" transparent opacity={0.6} /></mesh><Html position={[0, 0.03, 0]} center><div className="bg-blue-200 px-1 py-0.5 rounded text-xs font-bold">Agarose</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.25, 0.06, 0.45]} selected={selectedItem === "samples"} enabled={gelPrepared && !samplesLoaded} onClick={() => setSelectedItem("samples")}><group><mesh><cylinderGeometry args={[0.015, 0.015, 0.06, 16]} /><meshStandardMaterial color="#3b82f6" /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-bold">ADN</div></Html></group></ClickableObject>
      <ClickableObject position={[0, 0.06, 0.45]} selected={selectedItem === "power"} enabled={samplesLoaded && !powerOn} onClick={() => setSelectedItem("power")}><group><mesh><boxGeometry args={[0.06, 0.04, 0.05]} /><meshStandardMaterial color="#333" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-700 text-white px-1 py-0.5 rounded text-xs font-bold">⚡</div></Html></group></ClickableObject>
      <ClickableObject position={[0.25, 0.06, 0.45]} selected={selectedItem === "stain"} enabled={migrationDone && !stained} onClick={() => setSelectedItem("stain")}><group><mesh><cylinderGeometry args={[0.02, 0.02, 0.05, 16]} /><meshStandardMaterial color="#ff6b6b" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-red-400 text-white px-1 py-0.5 rounded text-xs font-bold">BET</div></Html></group></ClickableObject>
      <ClickableObject position={[0.48, 0.06, 0.45]} selected={selectedItem === "visualize"} enabled={stained && !bandsVisible} onClick={() => setSelectedItem("visualize")}><group><mesh><boxGeometry args={[0.05, 0.03, 0.05]} /><meshStandardMaterial color="#8b5cf6" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-purple-500 text-white px-1 py-0.5 rounded text-xs font-bold">UV</div></Html></group></ClickableObject>
      {bandsVisible && <Html position={[0.55, 0.2, 0]} center><div className="bg-green-900 text-white p-2 rounded text-xs"><div className="font-bold">ADN</div><div>~500 pb</div><div>~1000 pb</div><div>~2000 pb</div></div></Html>}
      {bandsVisible && <CompletionBanner text="✅ ADN separe!" />}
    </group>
  )
}

function MicroscopyExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { slideReady, stainAdded, coverslipOn, onMicroscope, focused, highMag } = state
  const handleAction = (a) => {
    if (a === "slide" && selectedItem === "slide") { setState(p => ({ ...p, slideReady: true })); setSelectedItem(null); setStep(0); toast.success("🔬 Lame!") }
    else if (a === "stain" && selectedItem === "stain") { setState(p => ({ ...p, stainAdded: true })); setSelectedItem(null); setStep(1); toast.success("🎨 Colorant!") }
    else if (a === "coverslip" && selectedItem === "coverslip") { setState(p => ({ ...p, coverslipOn: true })); setSelectedItem(null); setStep(2); toast.success("📋 Lamelle!") }
    else if (a === "place" && selectedItem === "place") { setState(p => ({ ...p, onMicroscope: true })); setSelectedItem(null); setStep(3); toast.success("🔬 Place!") }
    else if (a === "focus" && selectedItem === "focus") { setState(p => ({ ...p, focused: true })); setSelectedItem(null); setStep(5); toast.success("🎯 Net!") }
    else if (a === "highmag" && selectedItem === "highmag") { setState(p => ({ ...p, highMag: true })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("🔍 x40!") }
  }
  return (
    <group>
      <mesh position={[0, 0.01, 0]}><boxGeometry args={[1.3, 0.02, 0.7]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
      <group position={[0.15, 0.02, 0]}><mesh position={[0, 0.02, 0]}><boxGeometry args={[0.2, 0.04, 0.15]} /><meshStandardMaterial color="#222" /></mesh><mesh position={[-0.08, 0.15, 0]}><boxGeometry args={[0.04, 0.25, 0.04]} /><meshStandardMaterial color="#333" /></mesh><mesh position={[0.02, 0.28, 0]} rotation={[0.3, 0, 0]}><cylinderGeometry args={[0.03, 0.04, 0.12, 16]} /><meshStandardMaterial color="#222" /></mesh><mesh position={[0, 0.08, 0]}><boxGeometry args={[0.15, 0.01, 0.12]} /><meshStandardMaterial color="#444" /></mesh><mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.02, 0.015, 0.05, 16]} /><meshStandardMaterial color="#333" /></mesh>{onMicroscope && <mesh position={[0, 0.09, 0]}><boxGeometry args={[0.06, 0.002, 0.02]} /><meshPhysicalMaterial color="#aaddff" transparent opacity={0.5} /></mesh>}{focused && <Html position={[0.02, 0.35, 0]} center><div className="bg-white rounded-full w-14 h-14 border-4 border-gray-800 overflow-hidden flex items-center justify-center">{highMag ? <div className="relative w-full h-full bg-blue-50"><div className="absolute w-5 h-7 bg-purple-300 rounded-full top-1 left-2 opacity-70"></div><div className="absolute w-2 h-2 bg-purple-800 rounded-full top-3 left-4"></div><div className="absolute w-4 h-6 bg-purple-300 rounded-full top-5 left-7 opacity-70"></div><div className="absolute w-2 h-2 bg-purple-800 rounded-full top-7 left-9"></div></div> : <div className="text-purple-300 text-xl">●●●</div>}</div></Html>}</group>
      <mesh position={[0, 0.01, 0.48]}><boxGeometry args={[1.3, 0.02, 0.22]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <TargetZone position={[-0.35, 0.06, 0]} label="🔬" active={selectedItem === "slide"} onClick={() => handleAction("slide")} />
      <TargetZone position={[-0.35, 0.1, 0]} label="🎨" active={selectedItem === "stain" && slideReady} onClick={() => handleAction("stain")} />
      <TargetZone position={[-0.35, 0.14, 0]} label="📋" active={selectedItem === "coverslip" && stainAdded} onClick={() => handleAction("coverslip")} />
      <TargetZone position={[0.15, 0.1, 0]} label="📥" active={selectedItem === "place" && coverslipOn} onClick={() => handleAction("place")} />
      <TargetZone position={[0.15, 0.18, 0]} label="🎯" active={selectedItem === "focus" && onMicroscope} onClick={() => handleAction("focus")} />
      <TargetZone position={[0.15, 0.22, 0]} label="🔍" active={selectedItem === "highmag" && focused} onClick={() => handleAction("highmag")} />
      <ClickableObject position={[-0.5, 0.06, 0.45]} selected={selectedItem === "slide"} enabled={!slideReady} onClick={() => setSelectedItem("slide")}><group><mesh><boxGeometry args={[0.06, 0.002, 0.02]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.4} /></mesh><Html position={[0, 0.03, 0]} center><div className="bg-white border px-1 py-0.5 rounded text-xs font-bold">Lame</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.25, 0.06, 0.45]} selected={selectedItem === "stain"} enabled={slideReady && !stainAdded} onClick={() => setSelectedItem("stain")}><group><mesh><cylinderGeometry args={[0.015, 0.015, 0.05, 16]} /><meshStandardMaterial color="#3b82f6" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-bold">Bleu</div></Html></group></ClickableObject>
      <ClickableObject position={[0, 0.06, 0.45]} selected={selectedItem === "coverslip"} enabled={stainAdded && !coverslipOn} onClick={() => setSelectedItem("coverslip")}><group><mesh><boxGeometry args={[0.025, 0.001, 0.025]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.3} /></mesh><Html position={[0, 0.03, 0]} center><div className="bg-gray-200 px-1 py-0.5 rounded text-xs font-bold">Lamelle</div></Html></group></ClickableObject>
      <ClickableObject position={[0.25, 0.06, 0.45]} selected={selectedItem === "place"} enabled={coverslipOn && !onMicroscope} onClick={() => setSelectedItem("place")}><group><mesh><boxGeometry args={[0.04, 0.003, 0.015]} /><meshPhysicalMaterial color="#aaddff" transparent opacity={0.5} /></mesh><Html position={[0, 0.03, 0]} center><div className="bg-blue-100 px-1 py-0.5 rounded text-xs font-bold">Placer</div></Html></group></ClickableObject>
      <ClickableObject position={[0.45, 0.06, 0.45]} selected={selectedItem === "focus"} enabled={onMicroscope && !focused} onClick={() => setSelectedItem("focus")}><group><mesh><cylinderGeometry args={[0.02, 0.02, 0.02, 16]} /><meshStandardMaterial color="#666" /></mesh><Html position={[0, 0.03, 0]} center><div className="bg-gray-600 text-white px-1 py-0.5 rounded text-xs font-bold">x10</div></Html></group></ClickableObject>
      <ClickableObject position={[0.58, 0.06, 0.45]} selected={selectedItem === "highmag"} enabled={focused && !highMag} onClick={() => setSelectedItem("highmag")}><group><mesh><cylinderGeometry args={[0.015, 0.015, 0.03, 16]} /><meshStandardMaterial color="#444" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-gray-800 text-white px-1 py-0.5 rounded text-xs font-bold">x40</div></Html></group></ClickableObject>
      {highMag && <Html position={[-0.4, 0.2, 0]} center><div className="bg-purple-900 text-white p-2 rounded text-xs"><div className="font-bold">Cellules</div><div>Noyau</div><div>Cytoplasme</div><div>Membrane</div></div></Html>}
      {highMag && <CompletionBanner text="✅ Cellules observees!" />}
    </group>
  )
}

function EnzymeKineticsExperiment({ state, setState, setStep, experiment, selectedItem, setSelectedItem }) {
  const { substratesReady, enzymeAdded, reactionStarted, dataCollected, vmaxFound, kmCalculated } = state
  const handleAction = (a) => {
    if (a === "substrates" && selectedItem === "substrates") { setState(p => ({ ...p, substratesReady: true })); setSelectedItem(null); setStep(0); toast.success("🧪 Substrats!") }
    else if (a === "enzyme" && selectedItem === "enzyme") { setState(p => ({ ...p, enzymeAdded: true })); setSelectedItem(null); setStep(1); toast.success("⚗️ Enzyme!") }
    else if (a === "start" && selectedItem === "start") { setState(p => ({ ...p, reactionStarted: true })); setSelectedItem(null); setStep(2); toast.success("⏱️ Reaction..."); setTimeout(() => { setState(p => ({ ...p, dataCollected: true })); toast.success("📊 Donnees!") }, 2500) }
    else if (a === "vmax" && selectedItem === "vmax") { setState(p => ({ ...p, vmaxFound: true })); setSelectedItem(null); setStep(5); toast.success("📈 Vmax!") }
    else if (a === "km" && selectedItem === "km") { setState(p => ({ ...p, kmCalculated: true })); setSelectedItem(null); setStep(experiment.steps.length - 1); toast.success("🎯 Km!") }
  }
  return (
    <group>
      <mesh position={[0, 0.01, 0]}><boxGeometry args={[1.3, 0.02, 0.7]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
      <group position={[-0.2, 0.06, 0]}><mesh position={[0, 0.01, 0]}><boxGeometry args={[0.25, 0.02, 0.08]} /><meshStandardMaterial color="#8B4513" /></mesh>{substratesReady && [-0.08, -0.04, 0, 0.04, 0.08].map((x, i) => <group key={i} position={[x, 0.06, 0]}><mesh><cylinderGeometry args={[0.012, 0.012, 0.1, 16]} /><meshPhysicalMaterial color="#fff" transparent opacity={0.3} side={THREE.DoubleSide} /></mesh><mesh position={[0, -0.03, 0]}><cylinderGeometry args={[0.01, 0.01, 0.04, 16]} /><meshStandardMaterial color={reactionStarted ? "#f59e0b" : "#3b82f6"} transparent opacity={0.7} /></mesh></group>)}</group>
      {dataCollected && <group position={[0.3, 0.08, 0]}><mesh><boxGeometry args={[0.2, 0.1, 0.15]} /><meshStandardMaterial color="#ddd" /></mesh><Html position={[0, 0.07, 0.06]} center><div className="bg-black text-green-400 px-2 py-1 rounded font-mono text-xs">{vmaxFound ? "Vmax=2.5" : "V₀..."}</div></Html></group>}
      {vmaxFound && <Html position={[0.55, 0.2, 0]} center><div className="bg-white p-2 rounded border shadow-lg"><div className="text-xs font-bold mb-1">Michaelis-Menten</div><svg width="70" height="40" className="bg-gray-50"><path d="M 5 38 Q 18 15, 65 8" stroke="#3b82f6" strokeWidth="2" fill="none" />{kmCalculated && <line x1="5" y1="23" x2="65" y2="23" stroke="#f00" strokeWidth="1" strokeDasharray="3" />}</svg></div></Html>}
      <mesh position={[0, 0.01, 0.48]}><boxGeometry args={[1.3, 0.02, 0.22]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <TargetZone position={[-0.2, 0.1, 0]} label="🧪" active={selectedItem === "substrates"} onClick={() => handleAction("substrates")} />
      <TargetZone position={[-0.2, 0.15, 0]} label="⚗️" active={selectedItem === "enzyme" && substratesReady} onClick={() => handleAction("enzyme")} />
      <TargetZone position={[-0.2, 0.2, 0]} label="⏱️" active={selectedItem === "start" && enzymeAdded} onClick={() => handleAction("start")} />
      <TargetZone position={[0.3, 0.12, 0]} label="📈" active={selectedItem === "vmax" && dataCollected} onClick={() => handleAction("vmax")} />
      <TargetZone position={[0.3, 0.18, 0]} label="🎯" active={selectedItem === "km" && vmaxFound} onClick={() => handleAction("km")} />
      <ClickableObject position={[-0.5, 0.06, 0.45]} selected={selectedItem === "substrates"} enabled={!substratesReady} onClick={() => setSelectedItem("substrates")}><group><mesh><cylinderGeometry args={[0.025, 0.025, 0.06, 16]} /><meshStandardMaterial color="#3b82f6" transparent opacity={0.7} /></mesh><Html position={[0, 0.05, 0]} center><div className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-bold">[S]</div></Html></group></ClickableObject>
      <ClickableObject position={[-0.25, 0.06, 0.45]} selected={selectedItem === "enzyme"} enabled={substratesReady && !enzymeAdded} onClick={() => setSelectedItem("enzyme")}><group><mesh><cylinderGeometry args={[0.02, 0.02, 0.05, 16]} /><meshStandardMaterial color="#22c55e" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-green-500 text-white px-1 py-0.5 rounded text-xs font-bold">E</div></Html></group></ClickableObject>
      <ClickableObject position={[0, 0.06, 0.45]} selected={selectedItem === "start"} enabled={enzymeAdded && !reactionStarted} onClick={() => setSelectedItem("start")}><group><mesh><boxGeometry args={[0.05, 0.03, 0.04]} /><meshStandardMaterial color="#f59e0b" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-yellow-500 px-1 py-0.5 rounded text-xs font-bold">Start</div></Html></group></ClickableObject>
      <ClickableObject position={[0.25, 0.06, 0.45]} selected={selectedItem === "vmax"} enabled={dataCollected && !vmaxFound} onClick={() => setSelectedItem("vmax")}><group><mesh><boxGeometry args={[0.05, 0.03, 0.04]} /><meshStandardMaterial color="#8b5cf6" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-purple-500 text-white px-1 py-0.5 rounded text-xs font-bold">Vmax</div></Html></group></ClickableObject>
      <ClickableObject position={[0.48, 0.06, 0.45]} selected={selectedItem === "km"} enabled={vmaxFound && !kmCalculated} onClick={() => setSelectedItem("km")}><group><mesh><boxGeometry args={[0.05, 0.03, 0.04]} /><meshStandardMaterial color="#ef4444" /></mesh><Html position={[0, 0.04, 0]} center><div className="bg-red-500 text-white px-1 py-0.5 rounded text-xs font-bold">Km</div></Html></group></ClickableObject>
      {kmCalculated && <Html position={[-0.45, 0.2, 0]} center><div className="bg-green-900 text-white p-2 rounded text-xs"><div className="font-bold">Parametres</div><div>Vmax = 2.5 μM/s</div><div>Km = 0.8 mM</div></div></Html>}
      {kmCalculated && <CompletionBanner text="✅ Cinetique complete!" />}
    </group>
  )
}

// MAIN PAGE
export default function ARLabPage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState(null)
  const [level, setLevel] = useState(null)
  const [experiment, setExperiment] = useState(null)

  if (!subject) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6"><button onClick={() => navigate(-1)} className="btn-secondary"><ArrowLeft size={20} /></button><div><h1 className="text-2xl font-bold">Laboratoire 3D</h1><p className="text-gray-600 text-sm">Experiences interactives</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{id:"chemistry",icon:"🧪",name:"Chimie",color:"from-purple-50 to-pink-50"},{id:"physics",icon:"⚡",name:"Physique",color:"from-blue-50 to-cyan-50"},{id:"biology",icon:"🧬",name:"Biologie",color:"from-green-50 to-emerald-50"}].map(s => <div key={s.id} onClick={() => setSubject(s.id)} className={`card p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br ${s.color}`}><div className="text-4xl mb-3 text-center">{s.icon}</div><h2 className="text-xl font-bold text-center">{s.name}</h2></div>)}
      </div>
    </div>
  )

  if (!level) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6"><button onClick={() => setSubject(null)} className="btn-secondary"><ArrowLeft size={20} /></button><h1 className="text-xl font-bold">{subject === "chemistry" ? "🧪 Chimie" : subject === "physics" ? "⚡ Physique" : "🧬 Biologie"}</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div onClick={() => setLevel("lycee")} className="card p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-50"><School size={40} className="mx-auto mb-3 text-green-600" /><h2 className="text-xl font-bold text-center mb-1">Lycee</h2><p className="text-center text-gray-500 text-sm">{arLabService.getExperimentsByLevel(subject, "lycee").length} experiences</p></div>
        <div onClick={() => setLevel("universite")} className="card p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-purple-50 to-indigo-50"><GraduationCap size={40} className="mx-auto mb-3 text-purple-600" /><h2 className="text-xl font-bold text-center mb-1">Universite</h2><p className="text-center text-gray-500 text-sm">{arLabService.getExperimentsByLevel(subject, "universite").length} experiences</p></div>
      </div>
    </div>
  )

  if (!experiment) {
    const experiments = arLabService.getExperimentsByLevel(subject, level)
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4"><button onClick={() => setLevel(null)} className="btn-secondary"><ArrowLeft size={20} /></button><h1 className="text-lg font-bold">{level === "lycee" ? "📚 Lycee" : "🎓 Universite"}</h1></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {experiments.map(exp => <div key={exp.id} onClick={() => setExperiment(exp)} className="card p-4 cursor-pointer hover:shadow-lg hover:scale-102 transition-all"><div className="flex justify-between items-start mb-2"><h3 className="font-bold text-sm">{exp.name}</h3><span className={`px-1.5 py-0.5 rounded text-xs ${exp.difficulty === "Facile" ? "bg-green-100 text-green-700" : exp.difficulty === "Moyen" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{exp.difficulty}</span></div><p className="text-gray-600 text-xs mb-2">{exp.description}</p><button className="btn-primary w-full text-sm py-1.5"><PlayCircle size={14} className="inline mr-1" />Commencer</button></div>)}
        </div>
      </div>
    )
  }

  return <ExperimentView experiment={experiment} onBack={() => setExperiment(null)} />
}

function ExperimentView({ experiment, onBack }) {
  const [step, setStep] = useState(0)
  const [arMode, setArMode] = useState(false)
  const [stepsOpen, setStepsOpen] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const initialState = {
    hclVolume: 0, naohVolume: 0, indicatorAdded: false, pH: 1, color: "#ff6b6b", neutralized: false,
    bunsenLit: false, magnesiumBurning: false,
    batteryConnected: false, resistorConnected: false, bulbLit: false, current: 0,
    stringAttached: false, massAttached: false, swinging: false, period: 0,
    blankInserted: false, calibrated: false, sampleInserted: false, wavelengthSet: false, absorbanceMeasured: false, absorbance: 0,
    zincPlaced: false, copperPlaced: false, saltBridgeConnected: false, voltmeterConnected: false, measured: false, voltage: 0,
    extractPrepared: false, sampleDeposited: false, solventReady: false, plateInTank: false, migrationDone: false, rfCalculated: false,
    laserOn: false, slitsAligned: false, screenPlaced: false, patternVisible: false,
    rConnected: false, lConnected: false, cConnected: false, generatorOn: false, oscilloscopeOn: false, resonanceFound: false, resonanceFreq: 0,
    cathodeReady: false, circuitReady: false, lightOn: false, frequencySet: false, currentMeasured: false, thresholdFound: false,
    gelPrepared: false, samplesLoaded: false, powerOn: false, stained: false, bandsVisible: false,
    slideReady: false, stainAdded: false, coverslipOn: false, onMicroscope: false, focused: false, highMag: false,
    substratesReady: false, enzymeAdded: false, reactionStarted: false, dataCollected: false, vmaxFound: false, kmCalculated: false,
  }
  const [state, setState] = useState(initialState)

  const reset = () => { setState(initialState); setStep(0); setSelectedItem(null); toast.success("🔄 Reset!") }

  const startCamera = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); streamRef.current = stream; if (videoRef.current) videoRef.current.srcObject = stream; setArMode(true) } catch { toast.error("Camera indisponible") } }
  const stopCamera = () => { streamRef.current?.getTracks().forEach(t => t.stop()); setArMode(false) }
  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), [])

  const renderExperiment = () => {
    const props = { state, setState, setStep, experiment, selectedItem, setSelectedItem }
    const expMap = { "acid-base": AcidBaseExperiment, "combustion": CombustionExperiment, "simple-circuit": CircuitExperiment, "pendulum": PendulumExperiment, "spectrophotometry": SpectrophotometryExperiment, "galvanic-cell": GalvanicCellExperiment, "chromatography": ChromatographyExperiment, "double-slit": DoubleSlitExperiment, "rlc-circuit": RLCCircuitExperiment, "photoelectric": PhotoelectricExperiment, "gel-electrophoresis": GelElectrophoresisExperiment, "microscopy": MicroscopyExperiment, "enzyme-kinetics": EnzymeKineticsExperiment }
    const Exp = expMap[experiment.id]
    return Exp ? <Exp {...props} /> : <Html position={[0, 0.3, 0]} center><div className="bg-yellow-500 text-black px-3 py-2 rounded">🚧 En construction</div></Html>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => { stopCamera(); onBack() }} className="btn-secondary p-2"><ArrowLeft size={18} /></button>
        <div className="flex-1 mx-2"><h2 className="text-sm font-bold leading-tight">{experiment.name}</h2><div className="text-xs text-gray-500">{step + 1}/{experiment.steps.length}</div></div>
        <div className="flex gap-1"><button onClick={reset} className="btn-secondary p-2"><RotateCcw size={16} /></button><button onClick={() => arMode ? stopCamera() : startCamera()} className={`p-2 rounded-lg ${arMode ? "bg-red-500 text-white" : "bg-gray-100"}`}>{arMode ? <X size={16} /> : <Camera size={16} />}</button></div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2 text-xs flex items-center gap-2"><Hand size={16} className="text-blue-600" /><span><b>1.</b> Cliquez objet <b>2.</b> Cliquez cible verte</span></div>
      {selectedItem && <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-2 mb-2 text-xs flex items-center justify-between"><span className="font-bold">✓ Selectionne → Cliquez cible!</span><button onClick={() => setSelectedItem(null)} className="font-bold text-yellow-700">✕</button></div>}
      <div className="flex-1 relative rounded-xl overflow-hidden shadow-xl">
        {arMode && <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />}
        <div className={`absolute inset-0 ${arMode ? "" : "bg-gradient-to-b from-sky-200 via-sky-100 to-white"}`}>
          <Canvas camera={{ position: [0, 1.1, 1.8], fov: 42 }} gl={{ alpha: arMode }}><ambientLight intensity={0.85} /><directionalLight position={[5, 10, 5]} intensity={1} /><LabTable position={[0, -0.02, 0.12]} />{renderExperiment()}<OrbitControls enablePan={false} minDistance={0.6} maxDistance={3.5} maxPolarAngle={Math.PI / 2.1} /></Canvas>
        </div>
        {arMode && <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />AR</div>}
        <StepsPanel steps={experiment.steps} currentStep={step} expanded={stepsOpen} onToggle={() => setStepsOpen(!stepsOpen)} />
      </div>
    </div>
  )
}
