import * as THREE from 'three'

export interface SegmentTransform {
  position: [number, number, number]
  rotation: [number, number, number]
  length: number
}

const UP = new THREE.Vector3(0, 1, 0)

// Tính vị trí/góc xoay để đặt một hình hộp (trục dài theo Y cục bộ) nối liền hai điểm p1-p2.
// Dùng cho vì kèo, tuyến ống MEP, giằng mái... - mọi thanh xiên trong mô hình.
export function segmentTransform(
  p1: [number, number, number],
  p2: [number, number, number],
): SegmentTransform {
  const a = new THREE.Vector3(...p1)
  const b = new THREE.Vector3(...p2)
  const mid = a.clone().add(b).multiplyScalar(0.5)
  const dir = b.clone().sub(a)
  const length = dir.length()
  const quaternion = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize())
  const euler = new THREE.Euler().setFromQuaternion(quaternion)
  return {
    position: [mid.x, mid.y, mid.z],
    rotation: [euler.x, euler.y, euler.z],
    length,
  }
}
