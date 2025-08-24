// 电梯控制系统数据跟踪分析工具 - 数据类型定义

// 电梯数据主结构
export interface ElevatorData {
  fileName: string;
  timestamp: string;
  fileSize: string;
  controlInfo: {
    timestamp: string;
    version: string;
    deviceId: string;
    [key: string]: any;
  };
  bitData: BitSignal[];
  data25ms: NumericData[];
  data50ms: NumericData[];
  snapshotData: SnapshotData[];
  parseTime: number; // 解析耗时(ms)
}

// 比特信号数据结构
export interface BitSignal {
  orderNo: number;
  signalName: string;
  invertFlag: string | null; // "*-" 表示信号反转
  description: string; // 从XML配置解析的信号描述
  binaryData: string; // 32位二进制数据
  isActive: boolean; // 当前信号状态
  hexValue: string; // 原始十六进制值
}

// 数值数据结构 (25ms/50ms)
export interface NumericData {
  signalName: string;
  hexValues: string[]; // 十六进制数据数组
  timestamps?: string[]; // 对应的时间戳
  unit?: string;
  dataType: '25ms' | '50ms';
}

// 快照数据结构
export interface SnapshotData {
  timestamp: string;
  name: string;
  description: string;
  data: string;
  category?: string; // 数据分类
  orderNo?: number; // 数据顺序号
}

// XML配置项结构
export interface AuxSubTableItem {
  libId: string;
  tableCode: string;
  orderNo: number;
  startPos: number;
  startCount: number;
  itemCode: string;
  itemName: string;
  converterId: string;
  converterParam?: string;
}

// XML配置结构
export interface XMLConfig {
  items: AuxSubTableItem[];
  tableCodeMap: Map<string, AuxSubTableItem[]>;
  itemCodeMap: Map<string, AuxSubTableItem>;
}

// 数据存储状态
export interface DataStore {
  currentData: ElevatorData | null;
  xmlConfig: XMLConfig | null;
  isLoading: boolean;
  error: string | null;
  parseProgress: number; // 解析进度 0-100
  selectedSignals: string[]; // 用户选择的信号
}

// 数据操作类型
export type DataAction =
  | { type: 'SET_DATA'; payload: ElevatorData }
  | { type: 'SET_XML_CONFIG'; payload: XMLConfig }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_PARSE_PROGRESS'; payload: number }
  | { type: 'SELECT_SIGNALS'; payload: string[] }
  | { type: 'CLEAR_DATA' };

// 数据段结构
export interface DataSections {
  control: string;
  bit: string;
  ms25: string;
  ms50: string;
  snapshot: string;
}

// 图表数据结构
export interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
}

export interface ChartDataset {
  label: string;
  data: ChartDataPoint[];
  borderColor: string;
  backgroundColor: string;
  tension?: number;
}

// 导出选项
export interface ExportOptions {
  format: 'csv' | 'excel';
  includeHeaders: boolean;
  selectedColumns?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// 筛选选项
export interface FilterOptions {
  signalName?: string;
  signalType?: string;
  isActive?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// 分页选项
export interface PaginationOptions {
  page: number;
  pageSize: number;
  total: number;
}

// 排序选项
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}