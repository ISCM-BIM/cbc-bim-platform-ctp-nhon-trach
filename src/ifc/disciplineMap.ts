import type { Discipline } from '../types'

// Phân loại bộ môn theo tên lớp IFC (IfcClass viết hoa, vd "IFCCOLUMN") để tái dùng đúng 4
// nhóm Discipline đang có trong toàn bộ platform (panel bộ môn, màu sắc, toggle hiển thị...).
//
// Lưu ý: IFC không phân biệt "tường kết cấu chịu lực" và "tường ngăn kiến trúc" ở mức lớp
// (cả hai đều là IfcWall) - việc phân loại chính xác cần đọc thêm thuộc tính LoadBearing,
// ngoài phạm vi bản đầu tiên này. Ở đây dùng quy ước phổ biến của các phần mềm xem BIM:
// tường/cửa/mái/nội thất -> Kiến trúc; khung chịu lực (cột/dầm/sàn/móng/cốt thép) -> Kết cấu.

const EXACT: Record<string, Discipline> = {
  // Kết cấu - khung chịu lực
  IFCCOLUMN: 'Kết cấu',
  IFCCOLUMNSTANDARDCASE: 'Kết cấu',
  IFCBEAM: 'Kết cấu',
  IFCBEAMSTANDARDCASE: 'Kết cấu',
  IFCSLAB: 'Kết cấu',
  IFCSLABSTANDARDCASE: 'Kết cấu',
  IFCFOOTING: 'Kết cấu',
  IFCPILE: 'Kết cấu',
  IFCMEMBER: 'Kết cấu',
  IFCMEMBERSTANDARDCASE: 'Kết cấu',
  IFCPLATE: 'Kết cấu',
  IFCPLATESTANDARDCASE: 'Kết cấu',
  IFCREINFORCINGBAR: 'Kết cấu',
  IFCREINFORCINGMESH: 'Kết cấu',
  IFCREINFORCINGELEMENT: 'Kết cấu',
  IFCTENDON: 'Kết cấu',
  IFCTENDONANCHOR: 'Kết cấu',
  IFCELEMENTASSEMBLY: 'Kết cấu',

  // Kiến trúc - bao che, hoàn thiện, nội thất
  IFCWALL: 'Kiến trúc',
  IFCWALLSTANDARDCASE: 'Kiến trúc',
  IFCWALLELEMENTEDCASE: 'Kiến trúc',
  IFCCURTAINWALL: 'Kiến trúc',
  IFCWINDOW: 'Kiến trúc',
  IFCWINDOWSTANDARDCASE: 'Kiến trúc',
  IFCDOOR: 'Kiến trúc',
  IFCDOORSTANDARDCASE: 'Kiến trúc',
  IFCROOF: 'Kiến trúc',
  IFCCOVERING: 'Kiến trúc',
  IFCRAILING: 'Kiến trúc',
  IFCSTAIR: 'Kiến trúc',
  IFCSTAIRFLIGHT: 'Kiến trúc',
  IFCRAMP: 'Kiến trúc',
  IFCRAMPFLIGHT: 'Kiến trúc',
  IFCFURNISHINGELEMENT: 'Kiến trúc',
  IFCFURNITURE: 'Kiến trúc',
  IFCSPACE: 'Kiến trúc',
  IFCBUILDINGELEMENTPROXY: 'Kiến trúc',
  IFCCURTAINWALLELEMENT: 'Kiến trúc',

  // Hạ tầng - hạng mục sân bãi/dân dụng
  IFCCIVILELEMENT: 'Hạ tầng',
  IFCROAD: 'Hạ tầng',
  IFCRAIL: 'Hạ tầng',
  IFCBRIDGE: 'Hạ tầng',
  IFCMARINEFACILITY: 'Hạ tầng',
  IFCPAVEMENT: 'Hạ tầng',
  IFCEARTHWORKSCUT: 'Hạ tầng',
  IFCEARTHWORKSFILL: 'Hạ tầng',
  IFCGEOGRAPHICELEMENT: 'Hạ tầng',
}

// Tiền tố lớp IFC luôn thuộc MEP (điện/nước/HVAC/PCCC/thông tin liên lạc).
const MEP_PREFIXES = [
  'IFCPIPE',
  'IFCDUCT',
  'IFCCABLE',
  'IFCFLOW',
  'IFCSANITARYTERMINAL',
  'IFCFIRESUPPRESSIONTERMINAL',
  'IFCJUNCTIONBOX',
  'IFCOUTLET',
  'IFCLAMP',
  'IFCLIGHTFIXTURE',
  'IFCELECTRICAPPLIANCE',
  'IFCELECTRICDISTRIBUTIONBOARD',
  'IFCELECTRICFLOWSTORAGEDEVICE',
  'IFCELECTRICGENERATOR',
  'IFCELECTRICMOTOR',
  'IFCELECTRICTIMECONTROL',
  'IFCBOILER',
  'IFCCHILLER',
  'IFCCOIL',
  'IFCCOMPRESSOR',
  'IFCCONDENSER',
  'IFCCOOLEDBEAM',
  'IFCCOOLINGTOWER',
  'IFCDAMPER',
  'IFCEVAPORATIVECOOLER',
  'IFCEVAPORATOR',
  'IFCFAN',
  'IFCFILTER',
  'IFCHEATEXCHANGER',
  'IFCHUMIDIFIER',
  'IFCINTERCEPTOR',
  'IFCMEDICALDEVICE',
  'IFCPROTECTIVEDEVICE',
  'IFCPUMP',
  'IFCSPACEHEATER',
  'IFCSWITCHINGDEVICE',
  'IFCTANK',
  'IFCTRANSFORMER',
  'IFCTUBEBUNDLE',
  'IFCUNITARYCONTROLELEMENT',
  'IFCUNITARYEQUIPMENT',
  'IFCVALVE',
  'IFCVIBRATIONISOLATOR',
  'IFCAUDIOVISUALAPPLIANCE',
  'IFCCOMMUNICATIONSAPPLIANCE',
  'IFCALARM',
  'IFCSENSOR',
  'IFCACTUATOR',
  'IFCCONTROLLER',
]

const INFRA_PREFIXES = ['IFCCIVIL', 'IFCALIGNMENT', 'IFCROAD', 'IFCRAIL', 'IFCBRIDGE']

export function classifyDiscipline(ifcClass: string): Discipline {
  const cls = ifcClass.toUpperCase()
  if (EXACT[cls]) return EXACT[cls]
  if (MEP_PREFIXES.some((p) => cls.startsWith(p))) return 'MEP'
  if (INFRA_PREFIXES.some((p) => cls.startsWith(p))) return 'Hạ tầng'
  // Mặc định an toàn: phần lớn lớp IFC "lạ"/generic trong file kiến trúc-kết cấu thường là
  // đối tượng kiến trúc/nội thất không có lớp chuyên biệt.
  return 'Kiến trúc'
}
