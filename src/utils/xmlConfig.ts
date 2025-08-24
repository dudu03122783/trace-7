// 内置的AuxSubTableItem.xml配置数据
export interface SignalConfig {
  orderNo: number;
  startPos: number;
  startCount: number;
  itemCode: string;
  itemName: string;
  converterId: string;
}

// 0xD131数据内容的信号配置
export const bitDataSignalConfig: SignalConfig[] = [
  { orderNo: 0, startPos: 0, startCount: 4, itemCode: "SN_29", itemName: "安全开关", converterId: "BinaryConverter" },
  { orderNo: 1, startPos: 4, startCount: 4, itemCode: "SS_29LT", itemName: "安全开关 (锁存)", converterId: "BinaryConverter" },
  { orderNo: 2, startPos: 8, startCount: 4, itemCode: "SN_PCH", itemName: "控制面板门打开", converterId: "BinaryConverter" },
  { orderNo: 3, startPos: 12, startCount: 4, itemCode: "SN_60", itemName: "自动/检修开关 [ＯＮ:１]", converterId: "BinaryConverter" },
  { orderNo: 4, startPos: 16, startCount: 4, itemCode: "SN_60A", itemName: "自动/检修开关 [ＯＮ:１]", converterId: "BinaryConverter" },
  { orderNo: 5, startPos: 20, startCount: 4, itemCode: "SW_60E", itemName: "60･60A合理性异常", converterId: "BinaryConverter" },
  { orderNo: 6, startPos: 24, startCount: 4, itemCode: "DUMMY", itemName: "", converterId: "NoDisplayConverter" },
  { orderNo: 7, startPos: 28, startCount: 4, itemCode: "DUMMY", itemName: "", converterId: "NoDisplayConverter" },
  { orderNo: 8, startPos: 32, startCount: 4, itemCode: "SS_PWF", itemName: "７９回路電源异常 [异常:０]", converterId: "BinaryConverter" },
  { orderNo: 9, startPos: 36, startCount: 4, itemCode: "SS_ACFS", itemName: "ＡＣ電源异常 [异常:０]", converterId: "BinaryConverter" },
  { orderNo: 10, startPos: 40, startCount: 4, itemCode: "SS_PSPF", itemName: "ＤＣ－ＤＣ转换异常 [异常:０]", converterId: "BinaryConverter" },
  { orderNo: 11, startPos: 44, startCount: 4, itemCode: "SS_RPWD", itemName: "ＰＷＤ－１ ＦＥＴ Ｏｎ検出 [検出:０]", converterId: "BinaryConverter" },
  { orderNo: 12, startPos: 48, startCount: 4, itemCode: "DUMMY", itemName: "", converterId: "NoDisplayConverter" },
  { orderNo: 13, startPos: 52, startCount: 4, itemCode: "SS_P12VF", itemName: "１２Ｖ電源异常 [异常:０]", converterId: "BinaryConverter" },
  { orderNo: 14, startPos: 56, startCount: 4, itemCode: "SS_24VF", itemName: "２４Ｖ電源异常 [异常:０]", converterId: "BinaryConverter" },
  { orderNo: 15, startPos: 60, startCount: 4, itemCode: "SS_S79ER", itemName: "１２５Ｖ電源异常（ＧＰＳ－４） [异常:０]", converterId: "NoDisplayConverter" },
  { orderNo: 16, startPos: 64, startCount: 4, itemCode: "SW_ACFST", itemName: "AC電源低下", converterId: "BinaryConverter" },
  { orderNo: 17, startPos: 68, startCount: 4, itemCode: "SW_PSPFT", itemName: "DC電源低下", converterId: "BinaryConverter" },
  { orderNo: 18, startPos: 72, startCount: 4, itemCode: "SF_POKL", itemName: "", converterId: "NoDisplayConverter" },
  { orderNo: 19, startPos: 76, startCount: 4, itemCode: "SW_D89", itemName: "安全回路動作", converterId: "BinaryConverter" },
  { orderNo: 20, startPos: 80, startCount: 4, itemCode: "SW_EST", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 21, startPos: 84, startCount: 4, itemCode: "SW_SFS", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 22, startPos: 88, startCount: 4, itemCode: "SW_NFS", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 23, startPos: 92, startCount: 4, itemCode: "SD_32GQ", itemName: "急停 驱动S/W", converterId: "BinaryConverter" },
  { orderNo: 24, startPos: 96, startCount: 4, itemCode: "SC_S29", itemName: "急停 管理S/W", converterId: "BinaryConverter" },
  { orderNo: 25, startPos: 100, startCount: 4, itemCode: "SS_MCP_D89", itemName: "ＭＣＰ側安全回路 ＃８９指令moto", converterId: "BinaryConverter" },
  { orderNo: 26, startPos: 104, startCount: 4, itemCode: "SS_DEST", itemName: "E.STOP(SLC)", converterId: "BinaryConverter" },
  { orderNo: 27, startPos: 108, startCount: 4, itemCode: "DUMMY", itemName: "", converterId: "NoDisplayConverter" },
  { orderNo: 28, startPos: 112, startCount: 4, itemCode: "SW_NDP", itemName: "出发异常", converterId: "BinaryConverter" },
  { orderNo: 29, startPos: 116, startCount: 4, itemCode: "SW_RTY", itemName: "低电量重试", converterId: "BinaryConverter" },
  { orderNo: 30, startPos: 120, startCount: 4, itemCode: "SW_NRS", itemName: "起動不能", converterId: "BinaryConverter" },
  { orderNo: 31, startPos: 124, startCount: 4, itemCode: "SD_DNRS", itemName: "再起動不能 駆動S/W", converterId: "BinaryConverter" },
  { orderNo: 32, startPos: 128, startCount: 4, itemCode: "SP_RUNC", itemName: "开门禁止状態", converterId: "BinaryConverter" },
  { orderNo: 33, startPos: 132, startCount: 4, itemCode: "SY_FD22", itemName: "強制关门指令", converterId: "BinaryConverter" },
  { orderNo: 34, startPos: 136, startCount: 4, itemCode: "SC_F43", itemName: "关门指令（前门）", converterId: "BinaryConverter" },
  { orderNo: 35, startPos: 140, startCount: 4, itemCode: "SC_R43", itemName: "关门指令（后门）", converterId: "BinaryConverter" },
  { orderNo: 36, startPos: 144, startCount: 4, itemCode: "SY_F1_D21", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 37, startPos: 148, startCount: 4, itemCode: "SY_F1_D22", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 38, startPos: 152, startCount: 4, itemCode: "SY_R1_D21", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 39, startPos: 156, startCount: 4, itemCode: "SY_R1_D22", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 40, startPos: 160, startCount: 4, itemCode: "SS_MCP_D21", itemName: "ＭＣＰ側前门开门指令moto", converterId: "BinaryConverter" },
  { orderNo: 41, startPos: 164, startCount: 4, itemCode: "SS_MCP_D21R", itemName: "ＭＣＰ側后门开门指令moto", converterId: "BinaryConverter" },
  { orderNo: 42, startPos: 168, startCount: 4, itemCode: "SS_MCP_D22", itemName: "ＭＣＰ側关门指令｛前门・后门共通｝moto", converterId: "BinaryConverter" },
  { orderNo: 43, startPos: 172, startCount: 4, itemCode: "SN_41DGA", itemName: "厅门门锁和轿门门锁开关检出（外部信号）[閉：１]", converterId: "BinaryConverter" },
  { orderNo: 44, startPos: 176, startCount: 4, itemCode: "SN_41DG", itemName: "厅门门锁和轿门门锁开关检出（内部信号）[閉：１]", converterId: "BinaryConverter" },
  { orderNo: 45, startPos: 180, startCount: 4, itemCode: "SN_G4", itemName: "轿门门锁 [閉：１]", converterId: "BinaryConverter" },
  { orderNo: 46, startPos: 184, startCount: 4, itemCode: "SN_D41N", itemName: "门锁信号・・海外 [閉：０]", converterId: "BinaryConverter" },
  { orderNo: 47, startPos: 188, startCount: 4, itemCode: "SN_D41", itemName: "门锁信号・・海外 [閉：１]", converterId: "BinaryConverter" },
  { orderNo: 48, startPos: 192, startCount: 4, itemCode: "SN_DOQ", itemName: "前门安全触板 [开门：１]", converterId: "BinaryConverter" },
  { orderNo: 49, startPos: 196, startCount: 4, itemCode: "SN_DOQR", itemName: "后门安全触板 [开门：１]", converterId: "BinaryConverter" },
  { orderNo: 50, startPos: 200, startCount: 4, itemCode: "SF_F41G", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 51, startPos: 204, startCount: 4, itemCode: "SF_FCLT", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 52, startPos: 208, startCount: 4, itemCode: "SF_FFG", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 53, startPos: 212, startCount: 4, itemCode: "SF_FOLT", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 54, startPos: 216, startCount: 4, itemCode: "SF_R41G", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 55, startPos: 220, startCount: 4, itemCode: "SF_RCLT", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 56, startPos: 224, startCount: 4, itemCode: "SF_RFG", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 57, startPos: 228, startCount: 4, itemCode: "SF_ROLT", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 58, startPos: 232, startCount: 4, itemCode: "SY_DRL", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 59, startPos: 236, startCount: 4, itemCode: "SN_RL", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 60, startPos: 240, startCount: 4, itemCode: "SY_DRLOK", itemName: "DZ检查回路駆動指令", converterId: "BinaryConverter" },
  { orderNo: 61, startPos: 244, startCount: 4, itemCode: "SN_DZCC", itemName: "门区检查回路動作状態 [ＯＫ:１]", converterId: "BinaryConverter" },
  { orderNo: 62, startPos: 248, startCount: 4, itemCode: "ST_41DGL", itemName: "４１ＤＧ信号（ST_41DGS,ST_41DGF選択後）", converterId: "BinaryConverter" },
  { orderNo: 63, startPos: 252, startCount: 4, itemCode: "SY_DIRF", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 64, startPos: 256, startCount: 4, itemCode: "SY_SELM5", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 65, startPos: 260, startCount: 4, itemCode: "SY_D5", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 66, startPos: 264, startCount: 4, itemCode: "SS_MCP_D5", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 67, startPos: 268, startCount: 4, itemCode: "SN_5", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 68, startPos: 272, startCount: 4, itemCode: "*SY_DBC", itemName: "制动器基板检查指令", converterId: "BinaryConverter" },
  { orderNo: 69, startPos: 276, startCount: 4, itemCode: "*SY_DCONL", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 70, startPos: 280, startCount: 4, itemCode: "SY_IGEN", itemName: "逆变器栅极控制", converterId: "BinaryConverter" },
  { orderNo: 71, startPos: 284, startCount: 4, itemCode: "SY_DEPT", itemName: "pattern出力指令", converterId: "BinaryConverter" },
  { orderNo: 72, startPos: 288, startCount: 4, itemCode: "SY_WIN", itemName: "秤インジェクション指令", converterId: "BinaryConverter" },
  { orderNo: 73, startPos: 292, startCount: 4, itemCode: "SY_WM", itemName: "秤起動指令", converterId: "BinaryConverter" },
  { orderNo: 74, startPos: 296, startCount: 4, itemCode: "DUMMY", itemName: "", converterId: "NoDisplayConverter" },
  { orderNo: 75, startPos: 300, startCount: 4, itemCode: "SY_DSB", itemName: "控制器线圈指令", converterId: "NoDisplayConverter" },
  { orderNo: 76, startPos: 304, startCount: 4, itemCode: "SY_DLB", itemName: "LB駆動指令", converterId: "BinaryConverter" },
  { orderNo: 77, startPos: 308, startCount: 4, itemCode: "SN_LB", itemName: "", converterId: "BinaryConverter" },
  { orderNo: 78, startPos: 312, startCount: 4, itemCode: "SY_DSB1", itemName: "制动器BK１线圈指令", converterId: "BinaryConverter" },
  { orderNo: 79, startPos: 316, startCount: 4, itemCode: "SY_DSB2", itemName: "制动器BK２线圈指令", converterId: "BinaryConverter" },
  { orderNo: 80, startPos: 320, startCount: 4, itemCode: "SN_BK1", itemName: "制动器接点ＢＫ１ [開放：０]", converterId: "BinaryConverter" },
  { orderNo: 81, startPos: 324, startCount: 4, itemCode: "SN_BK2", itemName: "制动器接点ＢＫ２ [開放：０]", converterId: "BinaryConverter" },
  { orderNo: 82, startPos: 328, startCount: 4, itemCode: "DUMMY", itemName: "", converterId: "NoDisplayConverter" },
  { orderNo: 83, startPos: 332, startCount: 4, itemCode: "DUMMY", itemName: "", converterId: "NoDisplayConverter" },
  { orderNo: 84, startPos: 336, startCount: 4, itemCode: "DUMMY", itemName: "", converterId: "NoDisplayConverter" },
  { orderNo: 85, startPos: 340, startCount: 4, itemCode: "DUMMY", itemName: "", converterId: "NoDisplayConverter" },
  { orderNo: 86, startPos: 344, startCount: 4, itemCode: "DUMMY", itemName: "", converterId: "NoDisplayConverter" },
  { orderNo: 87, startPos: 348, startCount: 4, itemCode: "DUMMY", itemName: "", converterId: "NoDisplayConverter" },
  { orderNo: 88, startPos: 352, startCount: 4, itemCode: "DUMMY", itemName: "", converterId: "NoDisplayConverter" },
  { orderNo: 89, startPos: 356, startCount: 4, itemCode: "DUMMY", itemName: "", converterId: "NoDisplayConverter" },
  { orderNo: 90, startPos: 360, startCount: 4, itemCode: "SY_DDYN", itemName: "动态制动器线圈励磁指令", converterId: "NoDisplayConverter" },
  { orderNo: 91, startPos: 364, startCount: 4, itemCode: "SN_DYN", itemName: "ＤＹＮ接点（国内、ＥＬＥＮＥＳＳＡ） [ＯＮ:１]", converterId: "NoDisplayConverter" },
  { orderNo: 92, startPos: 368, startCount: 4, itemCode: "SW_DOPN", itemName: "走行中开门", converterId: "BinaryConverter" },
  { orderNo: 93, startPos: 372, startCount: 4, itemCode: "SS_DKC", itemName: "走行中开门(SLC)", converterId: "BinaryConverter" },
  { orderNo: 94, startPos: 376, startCount: 4, itemCode: "SW_41DGA", itemName: "４１ＤＧ ＯＮ异常", converterId: "BinaryConverter" },
  { orderNo: 95, startPos: 380, startCount: 4, itemCode: "SW_41DGB", itemName: "４１ＤＧ ＯＦＦ异常", converterId: "BinaryConverter" },
  { orderNo: 96, startPos: 384, startCount: 4, itemCode: "SW_FCLT1A2A", itemName: "轿厢前门 ＣＬＴ ＯＮ异常（轿厢１と轿厢２のＯＲ）", converterId: "BinaryConverter" },
  { orderNo: 97, startPos: 388, startCount: 4, itemCode: "SW_FCLT1B2B", itemName: "轿厢前门 ＣＬＴ ＯＦＦ异常[合理性异常＋超时]（轿厢１と轿厢２のＯＲ）", converterId: "BinaryConverter" }
];

// 根据信号名获取信号配置
export function getSignalConfig(signalName: string): SignalConfig | undefined {
  // 移除信号名中的反转标记（*-前缀）
  const cleanSignalName = signalName.replace(/^\*-/, '');
  
  // 首先在内置配置中查找
  const builtinConfig = bitDataSignalConfig.find(config => config.itemCode === cleanSignalName);
  if (builtinConfig) {
    return builtinConfig;
  }
  
  // 如果内置配置中没有找到，返回undefined
  // 真正的描述会在DataContext的getBitData方法中通过XML配置设置
  return undefined;
}

// 检查信号是否为反转信号
export function isInvertedSignal(signalName: string): boolean {
  return signalName.startsWith('*-');
}