// ============ LAB HANDS - Professional Gloved Hands ============
import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function LabHands({ 
  targetPosition, 
  objectPosition,
  objectColor,
  isWorking, 
  onActionComplete 
}) {
  const leftHandRef = useRef()
  const rightHandRef = useRef()
  const heldObjectRef = useRef()
  const [phase, setPhase] = useState('idle')
  const [showHands, setShowHands] = useState(false)
  const [showHeldObject, setShowHeldObject] = useState(false)
  const completedRef = useRef(false)
  
  useEffect(() => {
    if (isWorking && objectPosition) {
      setPhase('appearing')
      setShowHands(true)
      completedRef.current = false
      setTimeout(() => setPhase('grabbing'), 300)
      setTimeout(() => {
        setPhase('carrying')
        setShowHeldObject(true)
      }, 800)
    }
    if (!isWorking) {
      setPhase('idle')
      setShowHands(false)
      setShowHeldObject(false)
    }
  }, [isWorking, objectPosition])
  
  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    if (leftHandRef.current && rightHandRef.current && showHands) {
      if (phase === 'appearing') {
        // Hands fade in from bottom
        leftHandRef.current.position.lerp(
          new THREE.Vector3(objectPosition[0] - 0.15, objectPosition[1] - 0.1, objectPosition[2]),
          0.1
        )
        rightHandRef.current.position.lerp(
          new THREE.Vector3(objectPosition[0] + 0.15, objectPosition[1] - 0.1, objectPosition[2]),
          0.1
        )
      } else if (phase === 'grabbing') {
        // Hands move to grab object
        leftHandRef.current.position.lerp(
          new THREE.Vector3(objectPosition[0] - 0.06, objectPosition[1] + 0.05, objectPosition[2]),
          0.12
        )
        rightHandRef.current.position.lerp(
          new THREE.Vector3(objectPosition[0] + 0.06, objectPosition[1] + 0.05, objectPosition[2]),
          0.12
        )
      } else if (phase === 'carrying' && targetPosition) {
        // Hands move to target
        leftHandRef.current.position.lerp(
          new THREE.Vector3(targetPosition[0] - 0.06, targetPosition[1] + 0.15, targetPosition[2]),
          0.08
        )
        rightHandRef.current.position.lerp(
          new THREE.Vector3(targetPosition[0] + 0.06, targetPosition[1] + 0.15, targetPosition[2]),
          0.08
        )
        
        // Update held object position
        if (heldObjectRef.current) {
          heldObjectRef.current.position.set(
            (leftHandRef.current.position.x + rightHandRef.current.position.x) / 2,
            leftHandRef.current.position.y + 0.02,
            leftHandRef.current.position.z
          )
        }
        
        // Check if reached target
        const dist = leftHandRef.current.position.distanceTo(
          new THREE.Vector3(targetPosition[0] - 0.06, targetPosition[1] + 0.15, targetPosition[2])
        )
        if (dist < 0.05 && !completedRef.current) {
          setPhase('pouring')
          setShowHeldObject(false)
          completedRef.current = true
          setTimeout(() => {
            onActionComplete?.()
          }, 800)
        }
      } else if (phase === 'pouring') {
        // Tilt hands for pouring
        leftHandRef.current.rotation.z = Math.sin(time * 8) * 0.2
        rightHandRef.current.rotation.z = Math.sin(time * 8) * -0.2
      }
      
      // Subtle breathing animation
      if (phase !== 'pouring') {
        const breathe = Math.sin(time * 2) * 0.008
        leftHandRef.current.position.y += breathe
        rightHandRef.current.position.y += breathe
      }
    }
  })
  
  if (!showHands) return null
  
  const gloveColor = "#5DADE2" // Nice blue lab glove color
  
  return (
    <>
      {/* LEFT HAND */}
      <group ref={leftHandRef} position={[objectPosition?.[0] - 0.15, objectPosition?.[1] - 0.2, objectPosition?.[2]]}>
        {/* Palm */}
        <mesh rotation={[0.1, 0, -0.15]}>
          <boxGeometry args={[0.055, 0.075, 0.018]} />
          <meshStandardMaterial 
            color={gloveColor} 
            roughness={0.4} 
            metalness={0.05}
            emissive={gloveColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Wrist */}
        <mesh position={[0, -0.05, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.028, 0.04, 12]} />
          <meshStandardMaterial 
            color={gloveColor} 
            roughness={0.4} 
            metalness={0.05}
          />
        </mesh>
        
        {/* Thumb */}
        <group position={[-0.04, 0.01, 0.01]} rotation={[0, 0.3, -0.6]}>
          <mesh position={[0, 0.02, 0]}>
            <capsuleGeometry args={[0.009, 0.03, 8, 8]} />
            <meshStandardMaterial color={gloveColor} roughness={0.4} />
          </mesh>
        </group>
        
        {/* Fingers */}
        {[0, 1, 2, 3].map((i) => {
          const curl = phase === 'grabbing' || phase === 'carrying' ? -0.4 : -0.1
          return (
            <group key={i} position={[-0.022 + i * 0.014, 0.045, 0]} rotation={[0, 0, curl]}>
              <mesh position={[0, 0.025, 0]}>
                <capsuleGeometry args={[0.007, 0.035, 6, 6]} />
                <meshStandardMaterial color={gloveColor} roughness={0.4} />
              </mesh>
            </group>
          )
        })}
      </group>
      
      {/* RIGHT HAND */}
      <group ref={rightHandRef} position={[objectPosition?.[0] + 0.15, objectPosition?.[1] - 0.2, objectPosition?.[2]]}>
        {/* Palm */}
        <mesh rotation={[0.1, 0, 0.15]}>
          <boxGeometry args={[0.055, 0.075, 0.018]} />
          <meshStandardMaterial 
            color={gloveColor} 
            roughness={0.4} 
            metalness={0.05}
            emissive={gloveColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Wrist */}
        <mesh position={[0, -0.05, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.028, 0.04, 12]} />
          <meshStandardMaterial 
            color={gloveColor} 
            roughness={0.4} 
            metalness={0.05}
          />
        </mesh>
        
        {/* Thumb */}
        <group position={[0.04, 0.01, 0.01]} rotation={[0, -0.3, 0.6]}>
          <mesh position={[0, 0.02, 0]}>
            <capsuleGeometry args={[0.009, 0.03, 8, 8]} />
            <meshStandardMaterial color={gloveColor} roughness={0.4} />
          </mesh>
        </group>
        
        {/* Fingers */}
        {[0, 1, 2, 3].map((i) => {
          const curl = phase === 'grabbing' || phase === 'carrying' ? 0.4 : 0.1
          return (
            <group key={i} position={[-0.022 + i * 0.014, 0.045, 0]} rotation={[0, 0, curl]}>
              <mesh position={[0, 0.025, 0]}>
                <capsuleGeometry args={[0.007, 0.035, 6, 6]} />
                <meshStandardMaterial color={gloveColor} roughness={0.4} />
              </mesh>
            </group>
          )
        })}
      </group>
      
      {/* HELD OBJECT */}
      {showHeldObject && objectColor && (
        <group ref={heldObjectRef}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 0.06, 12]} />
            <meshPhysicalMaterial 
              color={objectColor} 
              transparent 
              opacity={0.7}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0.035, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.015, 12]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      )}
    </>
  )
}
