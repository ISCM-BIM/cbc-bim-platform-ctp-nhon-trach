import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Mesh } from 'three'
import type { Clash } from '../../../types'

interface SharedMarkerAssets {
  sphereGeometry: THREE.SphereGeometry
  hitGeometry: THREE.SphereGeometry
  normalMaterial: THREE.MeshStandardMaterial
  selectedMaterial: THREE.MeshStandardMaterial
  hitMaterial: THREE.MeshBasicMaterial
}

interface MarkerProps {
  clash: Clash
  selected: boolean
  onSelect: (clash: Clash) => void
  assets: SharedMarkerAssets
}

function ClashMarker({ clash, selected, onSelect, assets }: MarkerProps) {
  const ref = useRef<Mesh>(null)
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime() * 2.4 + phase
    const pulse = 0.75 + Math.sin(t) * 0.25
    ref.current.scale.setScalar(selected ? 1.6 : pulse)
  })

  return (
    <group position={[clash.position.x, clash.position.y, clash.position.z]}>
      {/* Vùng bấm mở rộng (vô hình) - dễ trúng hơn quả cầu hiển thị nhỏ */}
      <mesh
        geometry={assets.hitGeometry}
        material={assets.hitMaterial}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(clash)
        }}
      />
      <mesh ref={ref} geometry={assets.sphereGeometry} material={selected ? assets.selectedMaterial : assets.normalMaterial} />
    </group>
  )
}

interface ClashMarkersProps {
  clashes: Clash[]
  selectedId: string | null
  onSelect: (clash: Clash) => void
}

export function ClashMarkers({ clashes, selectedId, onSelect }: ClashMarkersProps) {
  const assets = useMemo<SharedMarkerAssets>(() => {
    const normalMaterial = new THREE.MeshStandardMaterial({
      color: '#ef4444',
      emissive: '#ef4444',
      emissiveIntensity: 0.9,
      toneMapped: false,
    })
    const selectedMaterial = new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      emissive: '#fbbf24',
      emissiveIntensity: 0.9,
      toneMapped: false,
    })
    const hitMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    return {
      sphereGeometry: new THREE.SphereGeometry(0.9, 12, 10),
      hitGeometry: new THREE.SphereGeometry(2.6, 8, 6),
      normalMaterial,
      selectedMaterial,
      hitMaterial,
    }
  }, [])

  return (
    <group>
      {clashes.map((c) => (
        <ClashMarker key={c.id} clash={c} selected={c.id === selectedId} onSelect={onSelect} assets={assets} />
      ))}
    </group>
  )
}
