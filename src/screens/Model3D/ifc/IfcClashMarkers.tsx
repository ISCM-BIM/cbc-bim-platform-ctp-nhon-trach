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

// Bán kính quả cầu đánh dấu va chạm (đơn vị mét thật trong mô hình) - tăng từ 0.5 lên theo yêu
// cầu người dùng (2026-08-25) để dễ bấm trúng hơn trên model thật (cấu kiện dày đặc, marker nhỏ
// dễ bị khuất/khó nhắm chuột).
const RADIUS = 0.9

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
