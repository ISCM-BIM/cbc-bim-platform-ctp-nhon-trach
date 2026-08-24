import { SITE_BOUNDS } from '../../../utils/geometry'
import type { SceneMaterials } from './materials'

interface SiteInfraProps {
  visible: boolean
  materials: SceneMaterials
}

const MARGIN = 18
const SITE_W = SITE_BOUNDS.width
const SITE_D = SITE_BOUNDS.depth

export function SiteInfra({ visible, materials }: SiteInfraProps) {
  if (!visible) return null

  const fenceH = 2.2
  const cx = SITE_W / 2
  const cz = SITE_D / 2
  const outerW = SITE_W + MARGIN * 2
  const outerD = SITE_D + MARGIN * 2

  const lightPositions: [number, number][] = [
    [-MARGIN + 2, -MARGIN + 2],
    [SITE_W + MARGIN - 2, -MARGIN + 2],
    [-MARGIN + 2, SITE_D + MARGIN - 2],
    [SITE_W + MARGIN - 2, SITE_D + MARGIN - 2],
    [cx, -MARGIN + 2],
    [cx, SITE_D + MARGIN - 2],
  ]

  return (
    <group>
      {/* Đường nội bộ hình chữ thập giữa các block */}
      <mesh position={[cx, 0.01, 88]} receiveShadow material={materials.road}>
        <boxGeometry args={[outerW - 6, 0.05, 20]} />
      </mesh>
      <mesh position={[135, 0.01, cz]} receiveShadow material={materials.road}>
        <boxGeometry args={[20, 0.05, outerD - 6]} />
      </mesh>

      {/* Hàng rào bao quanh công trường */}
      <mesh position={[cx, fenceH / 2, -MARGIN]} material={materials.fence}>
        <boxGeometry args={[outerW, fenceH, 0.15]} />
      </mesh>
      <mesh position={[cx, fenceH / 2, SITE_D + MARGIN]} material={materials.fence}>
        <boxGeometry args={[outerW, fenceH, 0.15]} />
      </mesh>
      <mesh position={[-MARGIN, fenceH / 2, cz]} material={materials.fence}>
        <boxGeometry args={[0.15, fenceH, outerD]} />
      </mesh>
      <mesh position={[SITE_W + MARGIN, fenceH / 2, cz]} material={materials.fence}>
        <boxGeometry args={[0.15, fenceH, outerD]} />
      </mesh>

      {/* Đèn chiếu sáng sân bãi (chỉ dùng vật liệu phát sáng, không tạo point light động để giữ hiệu năng) */}
      {lightPositions.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 4, 0]} material={materials.fence}>
            <cylinderGeometry args={[0.12, 0.12, 8, 8]} />
          </mesh>
          <mesh position={[0, 8, 0]}>
            <sphereGeometry args={[0.35, 10, 10]} />
            <meshBasicMaterial color="#fde68a" />
          </mesh>
        </group>
      ))}
    </group>
  )
}
