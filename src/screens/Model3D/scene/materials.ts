import { useMemo } from 'react'
import * as THREE from 'three'
import { DISCIPLINE_COLORS } from '../../../data/constants'

export interface SceneMaterials {
  ketCau: THREE.Material
  kienTruc: THREE.Material
  mep: THREE.Material
  mepDuct: THREE.Material
  mepPipe: THREE.Material
  mepTray: THREE.Material
  haTang: THREE.Material
  roof: THREE.Material
  door: THREE.Material
  office: THREE.Material
  officeAccent: THREE.Material
  glass: THREE.Material
  footing: THREE.Material
  slab: THREE.Material
  road: THREE.Material
  fence: THREE.Material
}

export function useSceneMaterials(clipPlane: THREE.Plane, cutEnabled: boolean) {
  return useMemo(() => {
    const clippingPlanes = cutEnabled ? [clipPlane] : []
    const make = (color: string, metalness = 0.3, roughness = 0.6) =>
      new THREE.MeshStandardMaterial({ color, metalness, roughness, clippingPlanes })

    const glass = make('#4ac4f3', 0.1, 0.2)
    glass.transparent = true
    glass.opacity = 0.5

    return {
      ketCau: make(DISCIPLINE_COLORS['Kết cấu'], 0.55, 0.4),
      kienTruc: make(DISCIPLINE_COLORS['Kiến trúc'], 0.1, 0.85),
      // MEP dùng thẳng Sky Accent tươi (không dùng bản đã tối màu của DISCIPLINE_COLORS -
      // bản đó được hiệu chỉnh riêng cho chữ/legend 2D, vật liệu 3D cần độ tươi để nổi bật).
      mep: make('#4ac4f3', 0.4, 0.5),
      mepDuct: make('#c084fc', 0.35, 0.5),
      mepPipe: make('#f472b6', 0.4, 0.45),
      mepTray: make('#818cf8', 0.5, 0.4),
      haTang: make(DISCIPLINE_COLORS['Hạ tầng'], 0.1, 0.9),
      roof: make('#4b5b74', 0.55, 0.5),
      door: make('#f59e0b', 0.4, 0.55),
      office: make('#e3e2e2', 0.1, 0.7),
      officeAccent: make('#06477c', 0.2, 0.6),
      glass,
      footing: make('#8a9099', 0.1, 0.9),
      slab: make('#6b7280', 0.05, 0.95),
      road: make('#3a3f47', 0.05, 0.95),
      fence: make('#727780', 0.4, 0.6),
    }
  }, [clipPlane, cutEnabled])
}
