import { useMemo } from 'react'
import * as THREE from 'three'
import type { SceneMaterials } from '../Model3D/scene/materials'

// Vật liệu wireframe dùng chung cho toàn bộ mô hình nền trang giới thiệu - tái sử dụng
// nguyên bộ BlockModel/Warehouse ở chế độ trình diễn (không tương tác, không đổ bóng).
export function useWireframeMaterials(): SceneMaterials {
  return useMemo(() => {
    const line = new THREE.MeshBasicMaterial({
      color: '#3d4860',
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    })
    const accent = new THREE.MeshBasicMaterial({
      color: '#c72127',
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    })
    return {
      ketCau: line,
      kienTruc: line,
      mep: accent,
      mepDuct: accent,
      mepPipe: accent,
      mepTray: accent,
      haTang: line,
      roof: line,
      door: accent,
      office: line,
      officeAccent: line,
      glass: line,
      footing: line,
      slab: line,
      road: line,
      fence: line,
    }
  }, [])
}
