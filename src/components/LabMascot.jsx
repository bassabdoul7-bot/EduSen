// ============ LAB MASCOT - NICE DESIGN + GRAB FLOW ============
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

export function LabMascot({ 
  targetPosition, 
  objectPosition,
  objectColor,
  isWorking, 
  message, 
  onActionComplete 
}) {
  const groupRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  
  const currentPos = useRef(new THREE.Vector3(-0.6, 0.3, 0.4))
  const phase = useRef('idle')
  const hasObject = useRef(false)
  const homePosition = new THREE.Vector3(-0.6, 0.3, 0.4)
  const completedRef = useRef(false)
  
  useEffect(() => {
    if (isWorking && objectPosition) {
      phase.current = 'goingToObject'
      hasObject.current = false
      completedRef.current = false
    }
    if (!isWorking) {
      phase.current = 'returning'
      hasObject.current = false
    }
  }, [isWorking, objectPosition])
  
  useFrame((state) => {
    if (!groupRef.current) return
    
    const time = state.clock.elapsedTime
    const bob = Math.sin(time * 2) * 0.015
    
    // Arm animation
    if (leftArmRef.current && rightArmRef.current) {
      if (hasObject.current) {
        leftArmRef.current.rotation.x = -0.8 + Math.sin(time * 4) * 0.1
        rightArmRef.current.rotation.x = -0.8 + Math.sin(time * 4 + 0.3) * 0.1
        leftArmRef.current.rotation.z = -0.3
        rightArmRef.current.rotation.z = 0.3
      } else if (phase.current !== 'idle') {
        leftArmRef.current.rotation.x = Math.sin(time * 6) * 0.4
        rightArmRef.current.rotation.x = Math.sin(time * 6 + Math.PI) * 0.4
        leftArmRef.current.rotation.z = 0
        rightArmRef.current.rotation.z = 0
      } else {
        leftArmRef.current.rotation.x = Math.sin(time * 1.5) * 0.1
        rightArmRef.current.rotation.x = Math.sin(time * 1.5 + 0.5) * 0.1
        leftArmRef.current.rotation.z = 0
        rightArmRef.current.rotation.z = 0
      }
    }
    
    // Leg animation
    if (leftLegRef.current && rightLegRef.current) {
      if (phase.current !== 'idle' && phase.current !== 'pouring') {
        leftLegRef.current.rotation.x = Math.sin(time * 6) * 0.3
        rightLegRef.current.rotation.x = Math.sin(time * 6 + Math.PI) * 0.3
      } else {
        leftLegRef.current.rotation.x = 0
        rightLegRef.current.rotation.x = 0
      }
    }
    
    // Movement based on phase
    if (phase.current === 'goingToObject' && objectPosition) {
      const target = new THREE.Vector3(objectPosition[0], objectPosition[1] + 0.2, objectPosition[2])
      const dist = currentPos.current.distanceTo(target)
      
      if (dist > 0.1) {
        currentPos.current.lerp(target, 0.08)
      } else {
        hasObject.current = true
        phase.current = 'goingToTarget'
      }
      groupRef.current.position.copy(currentPos.current)
      groupRef.current.position.y += bob
      
    } else if (phase.current === 'goingToTarget' && targetPosition) {
      const target = new THREE.Vector3(targetPosition[0], targetPosition[1] + 0.2, targetPosition[2])
      const dist = currentPos.current.distanceTo(target)
      
      if (dist > 0.1) {
        currentPos.current.lerp(target, 0.08)
      } else {
        phase.current = 'pouring'
        setTimeout(() => {
          if (!completedRef.current) {
            completedRef.current = true
            onActionComplete?.()
          }
        }, 800)
      }
      groupRef.current.position.copy(currentPos.current)
      groupRef.current.position.y += bob
      
    } else if (phase.current === 'pouring') {
      groupRef.current.rotation.z = Math.sin(time * 8) * 0.15
      groupRef.current.position.y += Math.sin(time * 6) * 0.005
      
    } else {
      const dist = currentPos.current.distanceTo(homePosition)
      if (dist > 0.1) {
        currentPos.current.lerp(homePosition, 0.06)
      } else {
        currentPos.current.copy(homePosition)
        phase.current = 'idle'
      }
      groupRef.current.position.copy(currentPos.current)
      groupRef.current.position.y += bob
      groupRef.current.rotation.z = 0
    }
    
    groupRef.current.lookAt(0, 0.3, 0)
  })
  
  return (
    <group ref={groupRef} position={[-0.6, 0.3, 0.4]} scale={[1.2, 1.2, 1.2]}>
      
      {/* ============ HEAD ============ */}
      <group position={[0, 0.14, 0]}>
        {/* Main head - helmet shape */}
        <mesh>
          <sphereGeometry args={[0.055, 32, 32]} />
          <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.2} />
        </mesh>
        
        {/* Face visor */}
        <mesh position={[0, 0, 0.03]} rotation={[0.1, 0, 0]}>
          <sphereGeometry args={[0.045, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial 
            color="#0ff" 
            metalness={0.1} 
            roughness={0} 
            transparent 
            opacity={0.4}
            emissive="#0ff"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[-0.018, 0.01, 0.045]}>
          <sphereGeometry args={[0.012, 16, 16]} />
          <meshStandardMaterial color="#fff" emissive="#0ff" emissiveIntensity={2} />
        </mesh>
        <mesh position={[0.018, 0.01, 0.045]}>
          <sphereGeometry args={[0.012, 16, 16]} />
          <meshStandardMaterial color="#fff" emissive="#0ff" emissiveIntensity={2} />
        </mesh>
        
        {/* Pupils */}
        <mesh position={[-0.018, 0.01, 0.055]}>
          <sphereGeometry args={[0.005, 12, 12]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[0.018, 0.01, 0.055]}>
          <sphereGeometry args={[0.005, 12, 12]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        
        {/* Ear pieces */}
        <mesh position={[-0.05, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.02, 16]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} />
        </mesh>
        <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.02, 16]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} />
        </mesh>
        
        {/* Antenna */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.03, 8]} />
          <meshStandardMaterial color="#4a5568" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.008, 12, 12]} />
          <meshStandardMaterial 
            color={isWorking ? "#ff0" : "#0ff"} 
            emissive={isWorking ? "#ff0" : "#0ff"} 
            emissiveIntensity={isWorking ? 3 : 1} 
          />
        </mesh>
      </group>
      
      {/* ============ NECK ============ */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 0.02, 16]} />
        <meshStandardMaterial color="#4a5568" metalness={0.6} />
      </mesh>
      
      {/* ============ TORSO ============ */}
      <group position={[0, 0, 0]}>
        {/* Main body */}
        <mesh>
          <capsuleGeometry args={[0.045, 0.06, 8, 16]} />
          <meshStandardMaterial color="#f7fafc" metalness={0.2} roughness={0.3} />
        </mesh>
        
        {/* Chest plate */}
        <mesh position={[0, 0.01, 0.035]}>
          <boxGeometry args={[0.06, 0.05, 0.015]} />
          <meshStandardMaterial color="#3182ce" metalness={0.5} roughness={0.3} />
        </mesh>
        
        {/* Chest light/core */}
        <mesh position={[0, 0.01, 0.044]}>
          <circleGeometry args={[0.012, 16]} />
          <meshStandardMaterial 
            color="#0ff" 
            emissive="#0ff" 
            emissiveIntensity={isWorking ? 3 : 1.5} 
          />
        </mesh>
        
        {/* Lab coat flaps */}
        <mesh position={[-0.03, -0.03, 0.02]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.025, 0.04, 0.008]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        </mesh>
        <mesh position={[0.03, -0.03, 0.02]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.025, 0.04, 0.008]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        </mesh>
      </group>
      
      {/* ============ LEFT ARM ============ */}
      <group ref={leftArmRef} position={[-0.06, 0.02, 0]}>
        <mesh>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial color="#4a5568" metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.03, 0]}>
          <capsuleGeometry args={[0.01, 0.03, 6, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.3} />
        </mesh>
        <mesh position={[0, -0.055, 0]}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshStandardMaterial color="#4a5568" metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.085, 0]}>
          <capsuleGeometry args={[0.009, 0.03, 6, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.3} />
        </mesh>
        <group position={[0, -0.115, 0]}>
          <mesh>
            <sphereGeometry args={[0.014, 12, 12]} />
            <meshStandardMaterial color="#3182ce" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.015, 0.005]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.02, 0.015, 0.008]} />
            <meshStandardMaterial color="#3182ce" roughness={0.6} />
          </mesh>
        </group>
      </group>
      
      {/* ============ RIGHT ARM ============ */}
      <group ref={rightArmRef} position={[0.06, 0.02, 0]}>
        <mesh>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial color="#4a5568" metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.03, 0]}>
          <capsuleGeometry args={[0.01, 0.03, 6, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.3} />
        </mesh>
        <mesh position={[0, -0.055, 0]}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshStandardMaterial color="#4a5568" metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.085, 0]}>
          <capsuleGeometry args={[0.009, 0.03, 6, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.3} />
        </mesh>
        <group position={[0, -0.115, 0]}>
          <mesh>
            <sphereGeometry args={[0.014, 12, 12]} />
            <meshStandardMaterial color="#3182ce" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.015, 0.005]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.02, 0.015, 0.008]} />
            <meshStandardMaterial color="#3182ce" roughness={0.6} />
          </mesh>
        </group>
      </group>
      
      {/* ============ HELD BOTTLE ============ */}
      {hasObject.current && objectColor && (
        <group position={[0, -0.05, 0.08]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 0.06, 12]} />
            <meshStandardMaterial color={objectColor} />
          </mesh>
          <mesh position={[0, 0.035, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.015, 12]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      )}
      
      {/* ============ WAIST/HIP ============ */}
      <mesh position={[0, -0.055, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.025, 16]} />
        <meshStandardMaterial color="#4a5568" metalness={0.6} />
      </mesh>
      
      {/* ============ LEFT LEG ============ */}
      <group ref={leftLegRef} position={[-0.025, -0.07, 0]}>
        <mesh>
          <sphereGeometry args={[0.015, 12, 12]} />
          <meshStandardMaterial color="#4a5568" metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.03, 0]}>
          <capsuleGeometry args={[0.012, 0.03, 6, 12]} />
          <meshStandardMaterial color="#2d3748" metalness={0.4} />
        </mesh>
        <mesh position={[0, -0.055, 0]}>
          <sphereGeometry args={[0.013, 12, 12]} />
          <meshStandardMaterial color="#4a5568" metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.085, 0]}>
          <capsuleGeometry args={[0.01, 0.035, 6, 12]} />
          <meshStandardMaterial color="#2d3748" metalness={0.4} />
        </mesh>
        <mesh position={[0, -0.115, 0.01]}>
          <boxGeometry args={[0.022, 0.015, 0.035]} />
          <meshStandardMaterial color="#1a202c" metalness={0.5} />
        </mesh>
      </group>
      
      {/* ============ RIGHT LEG ============ */}
      <group ref={rightLegRef} position={[0.025, -0.07, 0]}>
        <mesh>
          <sphereGeometry args={[0.015, 12, 12]} />
          <meshStandardMaterial color="#4a5568" metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.03, 0]}>
          <capsuleGeometry args={[0.012, 0.03, 6, 12]} />
          <meshStandardMaterial color="#2d3748" metalness={0.4} />
        </mesh>
        <mesh position={[0, -0.055, 0]}>
          <sphereGeometry args={[0.013, 12, 12]} />
          <meshStandardMaterial color="#4a5568" metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.085, 0]}>
          <capsuleGeometry args={[0.01, 0.035, 6, 12]} />
          <meshStandardMaterial color="#2d3748" metalness={0.4} />
        </mesh>
        <mesh position={[0, -0.115, 0.01]}>
          <boxGeometry args={[0.022, 0.015, 0.035]} />
          <meshStandardMaterial color="#1a202c" metalness={0.5} />
        </mesh>
      </group>
      
      {/* ============ SPEECH BUBBLE ============ */}
      {message && (
        <Html position={[0.15, 0.18, 0]} center>
          <div className="bg-white px-3 py-2 rounded-2xl shadow-xl text-xs font-semibold max-w-36 border-2 border-blue-400 relative">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2">
              <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[8px] border-transparent border-r-white"></div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-500">🤖</span>
              {message}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}
