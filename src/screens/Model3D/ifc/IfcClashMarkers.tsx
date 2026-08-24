import { useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { ModelClashPoint } from '../../../data/modelClashes'

export interface ClashMarkerData {
  clash: ModelClashPoint
  position: THREE.Vector3
}

interface IfcClashMarkersProps {
  markers: ClashMarkerData[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const RADIUS = 0.5

export function IfcClashMarkers({ markers, selectedId, onSelect }: IfcClashMarkersProps) {
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#ed1c24', emissive: '#ed1c24', emissiveIntensity: 0.8 }),
    [],
  )
  const selectedMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#4ac4f3', emissive: '#4ac4f3', emissiveIntensity: 1 }),
    [],
  )

  return (
    <group>
      {markers.map(({ clash, position }) => (
        <mesh
          key={clash.id}
          position={position}
          material={clash.id === selectedId ? selectedMaterial : material}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation()
            onSelect(clash.id)
          }}
          renderOrder={999}
        >
          <sphereGeometry args={[RADIUS, 20, 20]} />
        </mesh>
      ))}
    </group>
  )
}
