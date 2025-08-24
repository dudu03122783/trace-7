// 25ms数据页面
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { NumericData } from '../types';



// 25ms信号名称到解释的映射表（基于XML配置中的orderNo顺序）
const SIGNAL_NAME_TO_DESCRIPTION_25MS: Record<string, string> = {
  // 根据XML配置中25ms TRACE的orderNo顺序建立映射
  'yobi1': 'yobi1[%d]', // orderNo: 0
  'yobi2': 'yobi2[%d]', // orderNo: 1
  'yobi3': 'yobi3[%d]', // orderNo: 2
  'MP_PTMD': 'MP_PTMD   Patternmode  01：待機、02：ジャーク、03：加速、04：加速丸め、05：一定速、06：減速丸め、07：減速、08：着床、17：かご揺すり検知減速丸め、18：手動着床(緩停止)[%d] ', // orderNo: 3
  'WQ_VPAT': 'WQ_VPAT  制御 Pattern指令  0.01m/min/digit[%d]', // orderNo: 4
  'WQ_VTSD': 'WQ_VTSD   ＴＳＤ Pattern指令  0.01m/min/digit[%d]', // orderNo: 5
  'WQ_VPOUT': 'WQ_VPOUT   制御 Pattern指令 0.01m/min/digit  [%d]', // orderNo: 6
  'WP_SYNC': 'WP_SYNC  同步位置 1mm/digit[%d]', // orderNo: 7
  'WQ_RDST': 'WQ_RDST  剩余距离[%d]', // orderNo: 8
  'WQ_RDST_TLP': 'WQ_RDST_TLP  ＴＬＰ剩余距离 1mm/digit[%d]', // orderNo: 9
  'WQ_VGTNR': 'WQ_VGTNR   タコ  0.01m/min/digit [%d]', // orderNo: 10
  'MS_FDZ_LS': 'MS_FDZ_LS( D3bit：DZU、D0bit：DZD) [%d]', // orderNo: 11
  'MS_FRL_LS': 'MS_FRL_LS(D3bit：RLU、D0bit：RLD)[%d]', // orderNo: 12
  'MS_RDZ_LS': 'MS_RDZ_LS(D3bit：DZU、D0bit：DZD)[%d]', // orderNo: 13
  'MS_RRL_LS': 'MS_RRL_LS(D3bit：RLU、D0bit：RLD)[%d]', // orderNo: 14
  'yobi4': 'yobi4[%d]', // orderNo: 15
  'yobi5': 'yobi5[%d]', // orderNo: 16
  'yobi6': 'yobi6[%d]', // orderNo: 17
  'yobi7': 'yobi7[%d]', // orderNo: 18
  'RS_FDZ_LD': 'RS_FDZ_LD[%d]', // orderNo: 19
  'RS_FRL_LD': 'RS_FRL_LD[%d]', // orderNo: 20
  'RS_RDZ_LD': 'RS_RDZ_LD[%d]', // orderNo: 21
  'RS_RRL_LD': 'RS_RRL_LD[%d]', // orderNo: 22
  'WP_TMP1': 'WP_TMP1[%d]', // orderNo: 23
  'WP_TMP2': 'WP_TMP2[%d]', // orderNo: 24
  'WP_TMP3': 'WP_TMP3[%d]', // orderNo: 25
  'WP_TMP4': 'WP_TMP4[%d]' // orderNo: 26
};

// 根据信号名称获取对应的信号解释
function getSignalDescriptionFor25ms(signalName: string): string {
  // 直接从映射表中获取信号解释
  const description = SIGNAL_NAME_TO_DESCRIPTION_25MS[signalName];
  if (description) {
    return description;
  }
  
  // 如果无法匹配，返回默认描述
  return '未知信号';
}
import {
  ChartBarIcon,
  TableCellsIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function Data25ms() {
  const { state, getSignalDescription } = useData();
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [hideYobiSignals, setHideYobiSignals] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [chartTimeRange, setChartTimeRange] = useState<'all' | '1h' | '6h' | '24h'>('1h');
  const [showAllDataChart, setShowAllDataChart] = useState<boolean>(false);

  const data25ms = state.currentData?.data25ms || [];

  // 获取所有通道
  const allChannels = useMemo(() => {
    if (!data25ms || data25ms.length === 0) return [];
    return data25ms.map(item => item.signalName);
  }, [data25ms]);

  // 过滤和处理数据
  const filteredData = useMemo(() => {
    if (!data25ms) return [];
    
    let filtered = data25ms;
    
    // 1. 删除第一行数据
    if (filtered.length > 0) {
      filtered = filtered.slice(1);
    }
    
    // 2. 合并同信号名的两行数据为32个十六进制值
    const mergedData: NumericData[] = [];
    const processedSignals = new Set<string>();
    
    for (let i = 0; i < filtered.length; i++) {
      const currentItem = filtered[i];
      
      // 如果这个信号已经处理过，跳过
      if (processedSignals.has(currentItem.signalName)) {
        continue;
      }
      
      // 查找下一行是否有相同信号名的数据
      const nextItem = filtered.find((item, index) => 
        index > i && item.signalName === currentItem.signalName
      );
      
      if (nextItem) {
        // 合并两行的hexValues数据
        const mergedHexValues = [
          ...currentItem.hexValues,
          ...nextItem.hexValues
        ];
        
        mergedData.push({
          ...currentItem,
          hexValues: mergedHexValues
        });
        
        // 标记这个信号已经处理过
        processedSignals.add(currentItem.signalName);
      } else {
        // 如果没有找到相同信号名的第二行，保持原数据
        mergedData.push(currentItem);
        processedSignals.add(currentItem.signalName);
      }
    }
    
    filtered = mergedData;
    
    // 按搜索关键词过滤
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.signalName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 按通道过滤
    if (selectedChannel !== 'all') {
      filtered = filtered.filter(item => 
        item.signalName === selectedChannel
      );
    }
    
    // 隐藏yobi信号过滤
    if (hideYobiSignals) {
      filtered = filtered.filter(item => 
        !item.signalName.toLowerCase().startsWith('yobi')
      );
    }
    
    return filtered;
  }, [data25ms, searchTerm, selectedChannel, hideYobiSignals]);

  // 分页数据
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // 提取信号解释中的单位信息
  const extractUnitFromDescription = (description: string): string => {
    // 匹配常见的单位格式，如：0.01m/min/digit、1mm/digit等
    const unitMatch = description.match(/([0-9.]+[a-zA-Z]+\/[a-zA-Z]+\/[a-zA-Z]+|[0-9.]+[a-zA-Z]+\/[a-zA-Z]+|[a-zA-Z]+\/[a-zA-Z]+|[a-zA-Z]+)/g);
    if (unitMatch && unitMatch.length > 0) {
      // 返回最后一个匹配的单位（通常是最相关的）
      return unitMatch[unitMatch.length - 1];
    }
    return 'digit'; // 默认单位
  };

  // 全数据图表数据
  const allDataChartData = useMemo(() => {
    if (!showAllDataChart || !filteredData.length) return null;

    // 按单位分组数据
    const unitGroups = new Map<string, { items: NumericData[], color: string }>();
    const colors = [
      'rgb(59, 130, 246)', // blue
      'rgb(16, 185, 129)', // green
      'rgb(245, 101, 101)', // red
      'rgb(139, 92, 246)', // purple
      'rgb(245, 158, 11)', // yellow
      'rgb(236, 72, 153)', // pink
      'rgb(20, 184, 166)', // teal
      'rgb(251, 146, 60)', // orange
    ];

    filteredData.forEach((item, index) => {
      const description = getSignalDescriptionFor25ms(item.signalName);
      const unit = extractUnitFromDescription(description);
      
      if (!unitGroups.has(unit)) {
        unitGroups.set(unit, {
          items: [],
          color: colors[unitGroups.size % colors.length]
        });
      }
      unitGroups.get(unit)!.items.push(item);
    });

    // 为每个单位组创建数据集，每个信号显示32个数据点
    const datasets = Array.from(unitGroups.entries()).flatMap(([unit, group]) => 
      group.items.map((item, itemIndex) => {
        // 为每个信号创建32个数据点
        const dataPoints = item.hexValues.slice(0, 32).map((hexValue, index) => ({
          x: index + 1, // x轴为数据索引（1-32）
          y: parseInt(hexValue, 16) || 0, // y轴为十六进制值转换为十进制
          signalName: item.signalName,
          description: getSignalDescriptionFor25ms(item.signalName)
        }));
        
        return {
          label: `${item.signalName} (${unit})`,
          data: dataPoints,
          borderColor: `hsl(${(itemIndex * 60) % 360}, 70%, 50%)`,
          backgroundColor: `hsla(${(itemIndex * 60) % 360}, 70%, 50%, 0.1)`,
          tension: 0.1,
          pointRadius: 2,
          pointHoverRadius: 4
        };
      })
    );

    return { datasets };
  }, [filteredData, showAllDataChart]);

  // 图表数据
  const chartData = useMemo(() => {
    if (!data25ms || viewMode !== 'chart') return null;

    // 时间范围过滤
    const now = new Date();
    let timeFilter: (item: NumericData) => boolean;
    
    switch (chartTimeRange) {
      case '1h':
        timeFilter = (item) => item.timestamps?.[0] && new Date(item.timestamps[0]).getTime() > now.getTime() - 60 * 60 * 1000;
        break;
      case '6h':
        timeFilter = (item) => item.timestamps?.[0] && new Date(item.timestamps[0]).getTime() > now.getTime() - 6 * 60 * 60 * 1000;
        break;
      case '24h':
        timeFilter = (item) => item.timestamps?.[0] && new Date(item.timestamps[0]).getTime() > now.getTime() - 24 * 60 * 60 * 1000;
        break;
      default:
        timeFilter = () => true;
    }

    const filteredChartData = filteredData.filter(timeFilter);
    
    // 按通道分组
    const channelGroups = new Map<string, NumericData[]>();
    filteredChartData.forEach(item => {
      if (!channelGroups.has(item.signalName)) {
        channelGroups.set(item.signalName, []);
      }
      channelGroups.get(item.signalName)!.push(item);
    });

    // 生成颜色
    const colors = [
      'rgb(59, 130, 246)', // blue
      'rgb(16, 185, 129)', // green
      'rgb(245, 101, 101)', // red
      'rgb(139, 92, 246)', // purple
      'rgb(245, 158, 11)', // yellow
      'rgb(236, 72, 153)', // pink
      'rgb(20, 184, 166)', // teal
      'rgb(251, 146, 60)', // orange
    ];

    const datasets = Array.from(channelGroups.entries()).map(([channel, items], index) => ({
      label: channel,
      data: items.map(item => ({
        x: item.timestamps?.[0] || new Date(),
        y: parseInt(item.hexValues[0], 16) || 0
      })),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length] + '20',
      tension: 0.1,
      pointRadius: 2,
      pointHoverRadius: 4
    }));

    return {
      datasets
    };
  }, [data25ms, filteredData, viewMode, chartTimeRange]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // 导出数据
  const handleExport = () => {
    if (!filteredData.length) return;

    const csvContent = [
      ['信号名称', '信号解释', ...Array.from({ length: 32 }, (_, i) => `数据${i + 1}`), '单位'].join(','),
      ...filteredData.map(item => [
        item.signalName,
        `"${getSignalDescriptionFor25ms(item.signalName)}"`,
        ...Array.from({ length: 32 }, (_, i) => item.hexValues[i] || '00000000'),
        item.unit || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `25ms数据_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 如果没有数据
  if (!state.currentData) {
    return (
      <div className="p-6">

        <div className="text-center py-12">
          <InformationCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">暂无数据</h2>
          <p className="text-gray-600 mb-4">请先在数据导入页面上传TXT文件</p>
          <button
            onClick={() => window.location.href = '/import'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            前往数据导入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 控制面板 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 视图模式切换 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">视图:</span>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TableCellsIcon className="w-4 h-4 inline mr-1" />
                表格
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'chart'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChartBarIcon className="w-4 h-4 inline mr-1" />
                图表
              </button>
            </div>
          </div>

          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索通道或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 通道过滤 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">通道:</span>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部通道</option>
              {allChannels.map((channel, index) => (
                <option key={`${channel}-${index}`} value={channel}>{channel}</option>
              ))}
            </select>
          </div>

          {/* yobi信号过滤 */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideYobiSignals}
                onChange={(e) => setHideYobiSignals(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-600">隐藏yobi信号</span>
            </label>
          </div>

          {/* 图表时间范围 */}
          {viewMode === 'chart' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">时间:</span>
              <select
                value={chartTimeRange}
                onChange={(e) => setChartTimeRange(e.target.value as 'all' | '1h' | '6h' | '24h')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1h">最近1小时</option>
                <option value="6h">最近6小时</option>
                <option value="24h">最近24小时</option>
                <option value="all">全部时间</option>
              </select>
            </div>
          )}

          {/* 全数据绘图按钮 */}
          <button
            onClick={() => setShowAllDataChart(!showAllDataChart)}
            disabled={!filteredData.length}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              showAllDataChart
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            <ChartBarIcon className="w-4 h-4" />
            <span>{showAllDataChart ? '关闭绘图' : '全数据绘图'}</span>
          </button>

          {/* 导出按钮 */}
          <button
            onClick={handleExport}
            disabled={!filteredData.length}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>导出</span>
          </button>
        </div>
      </div>

      {/* 全数据图表 */}
      {showAllDataChart && allDataChartData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">全数据绘图 - 32个数据点完整显示</h3>
            <button
              onClick={() => setShowAllDataChart(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mb-2 text-sm text-gray-600">
            每条线显示一个信号的32个十六进制数据值（转换为十进制）
          </div>
          <div className="h-96">
            <Line
              data={allDataChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: '所有信号32个数据点完整图表'
                  },
                  legend: {
                    display: true,
                    position: 'top'
                  },
                  tooltip: {
                     callbacks: {
                       title: function(context: any) {
                         const point = context[0];
                         return `信号: ${(point.raw as any).signalName}`;
                       },
                       label: function(context: any) {
                         const point = context.raw as any;
                         return [
                           `数据点: ${point.x}`,
                           `数值: ${point.y}`,
                           `描述: ${point.description}`
                         ];
                       }
                     }
                   }
                },
                scales: {
                  x: {
                    type: 'linear',
                    title: {
                      display: true,
                      text: '数据索引 (1-32)'
                    },
                    min: 1,
                    max: 32,
                    ticks: {
                      stepSize: 4
                    }
                  },
                  y: {
                    title: {
                      display: true,
                      text: '数值（十进制）'
                    }
                  }
                },
                interaction: {
                  intersect: false,
                  mode: 'index'
                }
              }}
            />
          </div>
        </div>
      )}

      {/* 内容区域 */}
      {viewMode === 'table' ? (
        /* 表格视图 */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">信号名称</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">信号解释</th>
                    {Array.from({ length: 32 }, (_, i) => (
                      <th key={`header-${i}`} className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #{i + 1}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      单位
                    </th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((item, index) => (
                  <tr key={`${item.signalName}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.signalName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate" title={getSignalDescriptionFor25ms(item.signalName)}>
                      {getSignalDescriptionFor25ms(item.signalName)}
                    </td>
                    {Array.from({ length: 32 }, (_, i) => (
                      <td key={`hex-${index}-${i}`} className="px-1 py-4 whitespace-nowrap text-xs text-gray-900 text-center font-mono">
                        {item.hexValues[i] || '00000000'}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.unit || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    显示第 <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> 到{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, filteredData.length)}
                    </span>{' '}
                    条，共 <span className="font-medium">{filteredData.length}</span> 条记录
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + Math.max(1, currentPage - 2);
                      if (page > totalPages) return null;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 图表视图 */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {chartData && chartData.datasets.length > 0 ? (
            <div className="h-96">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: '25ms数据趋势图'
                    },
                    legend: {
                      display: true,
                      position: 'top'
                    }
                  },
                  scales: {
                    x: {
                      type: 'time',
                      time: {
                        displayFormats: {
                          minute: 'HH:mm',
                          hour: 'HH:mm'
                        }
                      },
                      title: {
                        display: true,
                        text: '时间'
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: '数值'
                      }
                    }
                  },
                  interaction: {
                    intersect: false,
                    mode: 'index'
                  }
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无图表数据</h3>
              <p className="text-gray-600">请调整过滤条件或时间范围</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}