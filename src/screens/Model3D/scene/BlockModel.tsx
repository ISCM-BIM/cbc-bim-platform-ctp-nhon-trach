import { useMemo } from 'react'
import * as THREE from 'three'
import { Instances, Instance } from '@react-three/drei'
import type { BlockId, Discipline } from '../../../types'
import { BLOCK_LAYOUT } from '../../../utils/geometry'
import { sequencedMonth, stageMonth } from '../constructionStages'
import { segmentTransform } from './geometryUtils'
import type { SceneMaterials } from './materials'

const EAVE_HEIGHT = 9
const RIDGE_HEIGHT = 11
const BAY_SPACING = 8
const MEMBER_SIZE = 0.42
const FOOTING_SIZE = 1.6

interface BlockModelProps {
  blockId: BlockId
  currentMonth: number
  visible: Record<Discipline, boolean>
  materials: SceneMaterials
}

export function BlockModel({ blockId, currentMonth, visible, materials }: BlockModelProps) {
  const layout = BLOCK_LAYOUT[blockId]
  const { x0, z0, width, depth } = layout

  const geo = useMemo(() => {
    const numBays = Math.max(2, Math.round(width / BAY_SPACING))
    const spacing = width / numBays
    const frameCount = numBays + 1
    const framesX = Array.from({ length: frameCount }, (_, i) => x0 + i * spacing)
    const bays = Array.from({ length: numBays }, (_, i) => ({
      x: x0 + i * spacing,
      xNext: x0 + (i + 1) * spacing,
      xMid: x0 + (i + 0.5) * spacing,
    }))
    return { numBays, spacing, frameCount, framesX, bays }
  }, [width, x0])

  const zFront = z0
  const zBack = z0 + depth
  const zMid = z0 + depth / 2
  const officeDir = zMid < 88 ? -1 : 1
  const officeZ0 = officeDir === -1 ? zFront - 10 : zBack
  const officeZ1 = officeDir === -1 ? zFront : zBack + 10
  const officeX0 = x0 + geo.spacing * 1.1
  const officeX1 = x0 + geo.spacing * 4.4

  // Vì kèo/mái đối xứng nên độ dài + góc nghiêng của 2 mái dốc giống nhau ở mọi khung -
  // chỉ tính một lần để dùng chung hình học cho toàn bộ instance (chỉ vị trí X thay đổi).
  const truss = useMemo(() => {
    const t1 = segmentTransform([0, EAVE_HEIGHT, zFront], [0, RIDGE_HEIGHT, zMid])
    const t2 = segmentTransform([0, RIDGE_HEIGHT, zMid], [0, EAVE_HEIGHT, zBack])
    return { t1, t2 }
  }, [zFront, zMid, zBack])

  const geometries = useMemo(
    () => ({
      footing: new THREE.BoxGeometry(FOOTING_SIZE, 0.7, FOOTING_SIZE),
      column: new THREE.BoxGeometry(MEMBER_SIZE, EAVE_HEIGHT, MEMBER_SIZE),
      truss: new THREE.BoxGeometry(MEMBER_SIZE * 0.8, truss.t1.length, MEMBER_SIZE * 0.8),
      roofPanel: new THREE.BoxGeometry(geo.spacing * 0.96, truss.t1.length, 0.12),
    }),
    [truss, geo.spacing],
  )

  const sFoundation = stageMonth(blockId, 'foundation')
  const sColumns = stageMonth(blockId, 'columns')
  const sTrusses = stageMonth(blockId, 'trusses')
  const sRoof = stageMonth(blockId, 'roof')
  const sWalls = stageMonth(blockId, 'walls')
  const sDoors = stageMonth(blockId, 'containerDoors')
  const sOfficeStruct = stageMonth(blockId, 'officeStructure')
  const sOfficeFinish = stageMonth(blockId, 'officeFinish')
  const sMep = stageMonth(blockId, 'mep')

  const showKetCau = visible['Kết cấu']
  const showKienTruc = visible['Kiến trúc']
  const showMep = visible.MEP

  const visibleFrames = geo.framesX
    .map((x, i) => ({ x, i, month: sequencedMonth(sColumns, i, geo.frameCount, 1.1) }))
    .filter((f) => currentMonth >= f.month)
  const visibleFootings = geo.framesX
    .map((x, i) => ({ x, i, month: sequencedMonth(sFoundation, i, geo.frameCount, 0.8) }))
    .filter((f) => currentMonth >= f.month)
  const visibleTrusses = geo.framesX
    .map((x, i) => ({ x, i, month: sequencedMonth(sTrusses, i, geo.frameCount, 1.1) }))
    .filter((f) => currentMonth >= f.month)
  const visibleRoofBays = geo.bays
    .map((b, i) => ({ ...b, i, month: sequencedMonth(sRoof, i, geo.numBays, 1.2) }))
    .filter((b) => currentMonth >= b.month)
  const visibleWallBaysFront = geo.bays
    .map((b, i) => ({ ...b, i, month: sequencedMonth(sWalls, i, geo.numBays, 1.0), hasDoor: i % 3 === 1 }))
    .filter((b) => currentMonth >= b.month)
  const visibleWallBaysBack = geo.bays
    .map((b, i) => ({ ...b, i, month: sequencedMonth(sWalls, i, geo.numBays, 1.0) }))
    .filter((b) => currentMonth >= b.month)

  const slabVisible = currentMonth >= sWalls
  const gableVisible = currentMonth >= sWalls
  const doorsVisible = currentMonth >= sDoors
  const officeStructVisible = currentMonth >= sOfficeStruct
  const officeFinishVisible = currentMonth >= sOfficeFinish
  const mepVisible = currentMonth >= sMep

  return (
    <group>
      {/* Đài móng */}
      {showKetCau && visibleFootings.length > 0 && (
        <Instances geometry={geometries.footing} material={materials.footing} limit={geo.frameCount * 2}>
          {visibleFootings.map((f) => (
            <group key={f.i}>
              <Instance position={[f.x, -0.25, zFront]} />
              <Instance position={[f.x, -0.25, zBack]} />
            </group>
          ))}
        </Instances>
      )}

      {/* Sàn nền */}
      {showKetCau && slabVisible && (
        <mesh position={[x0 + width / 2, 0.03, zMid]} material={materials.slab} receiveShadow>
          <boxGeometry args={[width, 0.1, depth]} />
        </mesh>
      )}

      {/* Cột thép */}
      {showKetCau && visibleFrames.length > 0 && (
        <Instances geometry={geometries.column} material={materials.ketCau} limit={geo.frameCount * 2} castShadow>
          {visibleFrames.map((f) => (
            <group key={f.i}>
              <Instance position={[f.x, EAVE_HEIGHT / 2, zFront]} />
              <Instance position={[f.x, EAVE_HEIGHT / 2, zBack]} />
            </group>
          ))}
        </Instances>
      )}

      {/* Vì kèo mái (2 mái dốc gặp nhau tại đỉnh) */}
      {showKetCau && visibleTrusses.length > 0 && (
        <Instances geometry={geometries.truss} material={materials.ketCau} limit={geo.frameCount * 2}>
          {visibleTrusses.map((f) => (
            <group key={f.i}>
              <Instance
                position={[f.x + truss.t1.position[0], truss.t1.position[1], truss.t1.position[2]]}
                rotation={truss.t1.rotation}
              />
              <Instance
                position={[f.x + truss.t2.position[0], truss.t2.position[1], truss.t2.position[2]]}
                rotation={truss.t2.rotation}
              />
            </group>
          ))}
        </Instances>
      )}

      {/* Mái tôn */}
      {showKienTruc && visibleRoofBays.length > 0 && (
        <Instances geometry={geometries.roofPanel} material={materials.roof} limit={geo.numBays * 2} castShadow receiveShadow>
          {visibleRoofBays.map((b) => (
            <group key={b.i}>
              <Instance
                position={[b.xMid + truss.t1.position[0], truss.t1.position[1], truss.t1.position[2]]}
                rotation={truss.t1.rotation}
              />
              <Instance
                position={[b.xMid + truss.t2.position[0], truss.t2.position[1], truss.t2.position[2]]}
                rotation={truss.t2.rotation}
              />
            </group>
          ))}
        </Instances>
      )}

      {/* Tường bao cạnh trước (có xen cửa cuốn) */}
      {showKienTruc &&
        visibleWallBaysFront.map((b) =>
          b.hasDoor ? null : (
            <mesh
              key={`wf-${b.i}`}
              position={[b.xMid, EAVE_HEIGHT / 2, zFront]}
              material={materials.kienTruc}
              receiveShadow
            >
              <boxGeometry args={[geo.spacing * 0.96, EAVE_HEIGHT, 0.25]} />
            </mesh>
          ),
        )}

      {/* Tường bao cạnh sau */}
      {showKienTruc &&
        visibleWallBaysBack.map((b) => (
          <mesh
            key={`wb-${b.i}`}
            position={[b.xMid, EAVE_HEIGHT / 2, zBack]}
            material={materials.kienTruc}
            receiveShadow
          >
            <boxGeometry args={[geo.spacing * 0.96, EAVE_HEIGHT, 0.25]} />
          </mesh>
        ))}

      {/* Tường đầu hồi 2 bên */}
      {showKienTruc && gableVisible && (
        <>
          <mesh position={[x0, EAVE_HEIGHT / 2, zMid]} material={materials.kienTruc} receiveShadow>
            <boxGeometry args={[0.25, EAVE_HEIGHT, depth]} />
          </mesh>
          <mesh position={[x0 + width, EAVE_HEIGHT / 2, zMid]} material={materials.kienTruc} receiveShadow>
            <boxGeometry args={[0.25, EAVE_HEIGHT, depth]} />
          </mesh>
        </>
      )}

      {/* Cửa cuốn container */}
      {showKienTruc &&
        doorsVisible &&
        visibleWallBaysFront
          .filter((b) => b.hasDoor)
          .map((b) => (
            <group key={`dr-${b.i}`}>
              <mesh position={[b.xMid, 2.3, zFront]} material={materials.door}>
                <boxGeometry args={[geo.spacing * 0.6, 4.6, 0.2]} />
              </mesh>
              <mesh position={[b.xMid, 4.6 + (EAVE_HEIGHT - 4.6) / 2, zFront]} material={materials.kienTruc}>
                <boxGeometry args={[geo.spacing * 0.6, EAVE_HEIGHT - 4.6, 0.22]} />
              </mesh>
            </group>
          ))}

      {/* Khu văn phòng 2 tầng */}
      {showKienTruc && officeStructVisible && (
        <group>
          <mesh
            position={[(officeX0 + officeX1) / 2, 3.5, (officeZ0 + officeZ1) / 2]}
            material={materials.office}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[officeX1 - officeX0, 7, officeZ1 - officeZ0]} />
          </mesh>
          {officeFinishVisible && (
            <mesh
              position={[
                (officeX0 + officeX1) / 2,
                3.6,
                officeDir === -1 ? officeZ0 + 0.05 : officeZ1 - 0.05,
              ]}
              material={materials.glass}
            >
              <boxGeometry args={[officeX1 - officeX0 - 1, 5.2, 0.12]} />
            </mesh>
          )}
        </group>
      )}

      {/* Hệ MEP chạy dưới mái: ống gió, ống PCCC, máng cáp điện */}
      {showMep && mepVisible && (
        <group>
          <mesh
            position={[x0 + width / 2, EAVE_HEIGHT - 1.4, z0 + depth * 0.28]}
            rotation={[0, 0, Math.PI / 2]}
            material={materials.mepDuct}
          >
            <cylinderGeometry args={[0.42, 0.42, width * 0.94, 10]} />
          </mesh>
          <mesh
            position={[x0 + width / 2, EAVE_HEIGHT - 1.9, z0 + depth * 0.5]}
            rotation={[0, 0, Math.PI / 2]}
            material={materials.mepPipe}
          >
            <cylinderGeometry args={[0.2, 0.2, width * 0.94, 8]} />
          </mesh>
          <mesh position={[x0 + width / 2, EAVE_HEIGHT - 1.6, z0 + depth * 0.72]} material={materials.mepTray}>
            <boxGeometry args={[width * 0.94, 0.18, 0.5]} />
          </mesh>
        </group>
      )}
    </group>
  )
}
