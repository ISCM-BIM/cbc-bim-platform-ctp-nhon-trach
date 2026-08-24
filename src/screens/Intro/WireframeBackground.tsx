import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { Discipline } from '../../types'
import { DISCIPLINES } from '../../data/constants'
import { SITE_BOUNDS } from '../../utils/geometry'
import { Warehouse } from '../Model3D/scene/Warehouse'
import { useWireframeMaterials } from './wireframeMaterials'

const ALL_VISIBLE: Record<Discipline, boolean> = DISCIPLINES.reduce(
  (acc, d) => ({ ...acc, [d]: true }),
  {} as Record<Discipline, boolean>,
)

function RotatingRig({ children }: { children: React.ReactNode }) {
  const ref = useRef<Group>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.045
  })
  return (
    <group position={[-SITE_BOUNDS.width / 2, -20, -SITE_BOUNDS.depth / 2]}>
      <group ref={ref} position={[SITE_BOUNDS.width / 2, 0, SITE_BOUNDS.depth / 2]}>
        {children}
      </group>
    </group>
  )
}

export function WireframeBackground() {
  const materials = useWireframeMaterials()

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [230, 150, 260], fov: 40, near: 1, far: 1200 }}
      className="pointer-events-none"
    >
      <RotatingRig>
        <Warehouse
          currentMonth={9}
          visible={ALL_VISIBLE}
          selectedBlock="all"
          materials={materials}
          clashMarkers={[]}
          selectedClashId={null}
          onSelectClash={() => {}}
        />
      </RotatingRig>
    </Canvas>
  )
}
