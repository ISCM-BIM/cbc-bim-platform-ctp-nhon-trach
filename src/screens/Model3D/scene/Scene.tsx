import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { BlockId, Clash, Discipline } from '../../../types'
import { SITE_BOUNDS } from '../../../utils/geometry'
import type { ParsedIfcModel, Ifc4dPlan } from '../../../ifc/types'
import type { MepSystemCategory } from '../../../ifc/mepSystem'
import { useSceneMaterials } from './materials'
import { Warehouse } from './Warehouse'
import { IfcModelView } from '../ifc/IfcModelView'
import { IfcClashMarkers, type ClashMarkerData } from '../ifc/IfcClashMarkers'

type SceneMode =
  | {
      kind: 'sample'
      currentMonth: number
      visible: Record<Discipline, boolean>
      selectedBlock: BlockId | 'all'
      clashMarkers: Clash[]
      selectedClashId: string | null
      onSelectClash: (clash: Clash | null) => void
    }
  | {
      kind: 'ifc'
      model: ParsedIfcModel
      plan: Ifc4dPlan
      bounds: { center: [number, number, number]; radius: number; fullRadius: number; groundY: number }
      month: number
      visibleDisciplines: Record<Discipline, boolean>
      visibleStoreys: 'all' | Set<number | null>
      visibleMepSystems: Record<MepSystemCategory, boolean>
      selectedExpressID: number | null
      onSelectElement: (expressID: number | null) => void
      clashMarkers: ClashMarkerData[]
      selectedModelClashId: string | null
      onSelectModelClash: (id: string) => void
    }

interface SceneProps {
  mode: SceneMode
  cutEnabled: boolean
  cutPosition: number
}

const SAMPLE_CENTER: [number, number, number] = [SITE_BOUNDS.width / 2, 4, SITE_BOUNDS.depth / 2]

export function Scene({ mode, cutEnabled, cutPosition }: SceneProps) {
  const isIfc = mode.kind === 'ifc'
  const center: [number, number, number] = isIfc ? mode.bounds.center : SAMPLE_CENTER
  const radius = isIfc ? mode.bounds.radius : 260
  // fullRadius (chưa lọc outlier) dùng làm giới hạn zoom-out/far-plane, để cấu kiện quy mô
  // toàn site (nếu có) vẫn xem được khi người dùng chủ động kéo camera ra xa.
  const fullRadius = isIfc ? mode.bounds.fullRadius : 260
  // Cao độ mặt nền: LUÔN lấy đúng đáy thật của công trình (groundY, tính theo trục Y riêng -
  // xem computeModelBounds), KHÔNG suy từ center-radius nữa - công trình rộng/dẹt (mặt bằng lớn
  // hơn nhiều lần chiều cao, như nhà xưởng 1 tầng chân đế lớn) từng khiến mặt nền lơ lửng ngang
  // giữa khối nhà vì radius bị chiều ngang chi phối (đã có bug thật, xem ghi chú parseIfc.ts).
  const groundY = isIfc ? mode.bounds.groundY : -radius * 0.02
  const groundSize = isIfc ? radius * 6 : SITE_BOUNDS.width + 200
  const camDistance = isIfc ? radius * 2.6 : 300

  const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), [])
  // Mô hình mẫu: cutPosition là toạ độ tuyệt đối 0..270 (theo SITE_BOUNDS). Mô hình IFC: mỗi
  // file có kích thước/tâm khác nhau nên cutPosition là độ lệch so với tâm model (-radius..radius).
  clipPlane.constant = isIfc ? center[0] + cutPosition : cutPosition
  const sampleMaterials = useSceneMaterials(clipPlane, cutEnabled)

  return (
    <Canvas
      // key: khi đổi model IFC (hoặc chuyển sang mô hình mẫu), remount Canvas để camera/
      // OrbitControls canh lại đúng theo kích thước thật của model mới thay vì giữ góc nhìn cũ.
      key={isIfc ? `ifc-${mode.model.modelID}` : 'sample'}
      // Mô hình IFC thật có thể lên tới hàng triệu tam giác (khác hẳn mô hình mẫu dựng thủ
      // tục, luôn nhẹ) - đổ bóng (shadow map) là phần tốn GPU nhất khi hình học lớn, nên tắt
      // hẳn ở chế độ IFC thay vì chỉ giảm độ phân giải. dpr cũng hạ về 1 (bỏ nhân đôi cho màn
      // hình retina/4K) để đổi lấy khung hình mượt hơn với model nặng.
      shadows={isIfc ? false : 'basic'}
      dpr={isIfc ? 1 : [1, 1.5]}
      // frameloop="demand": R3F mặc định vẽ lại TOÀN BỘ cảnh mỗi khung hình (~60 lần/giây) dù
      // không có gì đổi - với model IFC thật (có thể hơn chục triệu tam giác) đã đo thực tế
      // thấy tốn ~27ms/khung hình (~37fps) NGAY CẢ LÚC ĐỨNG YÊN, chỉ vì vẽ lại vô ích liên tục.
      // "demand" chỉ vẽ lại khi có thay đổi thật (kéo OrbitControls, đổi tháng/bộ lọc/cắt mặt
      // cắt...) - OrbitControls (drei) tự gọi invalidate() khi xoay/kéo damping, mọi state khác
      // (month, cutPosition, visibleDisciplines...) tự kích hoạt vẽ lại qua React commit, nên
      // không cần đổi gì thêm. CHỈ bật cho IFC - chế độ mẫu có hiệu ứng nhấp nháy marker xung
      // đột chạy liên tục qua useFrame (scene/ClashMarkers.tsx) sẽ đứng hình nếu đổi frameloop.
      frameloop={isIfc ? 'demand' : 'always'}
      gl={{ localClippingEnabled: true, antialias: !isIfc, powerPreference: 'high-performance' }}
      camera={{
        position: isIfc
          ? [center[0] + camDistance * 0.6, center[1] + camDistance * 0.5, center[2] + camDistance * 0.6]
          : [200, 140, 240],
        fov: 42,
        near: 0.1,
        far: Math.max(2000, fullRadius * 3),
      }}
      onPointerMissed={() => (isIfc ? mode.onSelectElement(null) : mode.onSelectClash(null))}
    >
      {/* Viewport sáng kiểu "bản vẽ kỹ thuật" - nền concrete-gray nhạt + lưới xám-xanh. */}
      <color attach="background" args={['#d6d4d2']} />
      <fog attach="fog" args={['#d6d4d2', camDistance * 1.1, camDistance * 2.6]} />
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[center[0] + radius, center[1] + radius * 1.8, center[2] + radius * 0.8]}
        intensity={1.3}
        castShadow={!isIfc}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-radius * 1.5}
        shadow-camera-right={radius * 1.5}
        shadow-camera-top={radius * 1.5}
        shadow-camera-bottom={-radius * 1.5}
        shadow-camera-far={radius * 6}
        shadow-bias={-0.0015}
      />
      <hemisphereLight args={['#ffffff', '#c9c7c5', 0.55]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[center[0], groundY, center[2]]} receiveShadow={!isIfc}>
        <planeGeometry args={[groundSize, groundSize]} />
        <meshStandardMaterial color="#c9c7c5" roughness={1} />
      </mesh>
      <gridHelper args={[groundSize, 60, '#9aa1ad', '#c2c7d1']} position={[center[0], groundY, center[2]]} />

      {isIfc ? (
        <>
          <IfcModelView
            model={mode.model}
            plan={mode.plan}
            month={mode.month}
            visibleDisciplines={mode.visibleDisciplines}
            visibleStoreys={mode.visibleStoreys}
            visibleMepSystems={mode.visibleMepSystems}
            selectedExpressID={mode.selectedExpressID}
            onSelectElement={mode.onSelectElement}
            clipPlane={clipPlane}
            cutEnabled={cutEnabled}
          />
          <IfcClashMarkers
            markers={mode.clashMarkers}
            selectedId={mode.selectedModelClashId}
            onSelect={mode.onSelectModelClash}
          />
        </>
      ) : (
        <Warehouse
          currentMonth={mode.currentMonth}
          visible={mode.visible}
          selectedBlock={mode.selectedBlock}
          materials={sampleMaterials}
          clashMarkers={mode.clashMarkers}
          selectedClashId={mode.selectedClashId}
          onSelectClash={mode.onSelectClash}
        />
      )}

      <OrbitControls
        target={center}
        minDistance={isIfc ? radius * 0.15 : 40}
        maxDistance={isIfc ? Math.max(radius * 8, fullRadius * 1.5) : 520}
        maxPolarAngle={Math.PI / 2 - 0.02}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  )
}
