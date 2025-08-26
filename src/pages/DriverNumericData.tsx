// 驱动段数值数据页面
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import VirtualScroll from '../components/VirtualScroll';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  BoltIcon,
  ClockIcon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type SamplingRate = '5ms' | '10ms' | '50ms' | 'all';
type ViewMode = 'table' | 'chart';

export default function DriverNumericData() {
  const { state, getDriverNumericData, hasDriverData } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRate, setSelectedRate] = useState<SamplingRate>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [hideYobiSignals, setHideYobiSignals] = useState(true);
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [useVirtualScroll, setUseVirtualScroll] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // 获取驱动段数值数据
  const driverNumericData = useMemo(() => {
    if (selectedRate === 'all') {
      return getDriverNumericData();
    }
    return getDriverNumericData(selectedRate);
  }, [getDriverNumericData, selectedRate]);

  // 过滤数据
  const filteredData = useMemo(() => {
    let filtered = driverNumericData;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.signalName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 隐藏yobi信号
    if (hideYobiSignals) {
      filtered = filtered.filter(item => 
        !item.signalName.toLowerCase().includes('yobi') && 
        !item.signalName.toLowerCase().includes('dummy')
      );
    }

    return filtered;
  }, [driverNumericData, searchTerm, hideYobiSignals]);

  // 获取统计信息
  const stats = useMemo(() => {
    const totalSignals = driverNumericData.length;
    const rateStats = {
      '5ms': driverNumericData.filter(item => item.dataType === '5ms').length,
      '10ms': driverNumericData.filter(item => item.dataType === '10ms').length,
      '50ms': driverNumericData.filter(item => item.dataType === '50ms').length
    };
    
    const avgDataPoints = driverNumericData.length > 0 
      ? Math.round(driverNumericData.reduce((sum, item) => sum + item.hexValues.length, 0) / driverNumericData.length)
      : 0;
    
    return { totalSignals, rateStats, avgDataPoints };
  }, [driverNumericData]);

  // 分页数据
  const paginatedData = useMemo(() => {
    if (useVirtualScroll) return filteredData;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize, useVirtualScroll]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // 图表数据
  const chartData = useMemo(() => {
    if (filteredData.length === 0 || selectedSignals.length === 0) {
      return { labels: [], datasets: [] };
    }

    const selectedData = filteredData.filter(item => selectedSignals.includes(item.signalName));
    if (selectedData.length === 0) return { labels: [], datasets: [] };

    // 生成x轴标签（数据点索引）
    const maxLength = Math.max(...selectedData.map(item => item.hexValues.length));
    const labels = Array.from({ length: maxLength }, (_, i) => `${i + 1}`);

    // 颜色调色板
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];

    const datasets = selectedData.map((item, index) => {
      const color = colors[index % colors.length];
      
      // 将十六进制值转换为十进制
      const data = item.hexValues.map((hexValue, idx) => ({
        x: idx + 1,
        y: parseInt(hexValue, 16) || 0
      }));

      return {
        label: `${item.signalName} (${item.dataType})`,
        data,
        borderColor: color,
        backgroundColor: color + '20',
        tension: 0.1,
        pointRadius: 1,
        pointHoverRadius: 3
      };
    });

    return { labels, datasets };
  }, [filteredData, selectedSignals]);

  // 导出数据
  const exportToCSV = () => {
    const maxLength = Math.max(...filteredData.map(item => item.hexValues.length));
    const headers = ['信号名称', '采样频率', '采样率(Hz)', '数据点数量', ...Array.from({length: maxLength}, (_, i) => `#${i + 1}`)];
    
    const csvData = filteredData.map(item => [
      item.signalName,
      item.dataType,
      item.samplingRate,
      item.hexValues.length,
      ...item.hexValues,
      ...Array(maxLength - item.hexValues.length).fill('')
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'driver_numeric_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 切换信号选择
  const toggleSignalSelection = (signalName: string) => {
    setSelectedSignals(prev => 
      prev.includes(signalName)
        ? prev.filter(name => name !== signalName)
        : [...prev, signalName]
    );
  };

  // 获取32位数据列的背景色（每8列一组）
  const getColumnBgColor = (colIndex: number) => {
    const groupIndex = Math.floor(colIndex / 8);
    const colors = ['bg-red-50', 'bg-blue-50', 'bg-green-50', 'bg-yellow-50'];
    return colors[groupIndex % colors.length];
  };

  // 渲染表格行
  const renderTableRow = (item: any, index: number) => {
    const isSelected = selectedSignals.includes(item.signalName);
    const rowKey = `${item.dataType}-${item.signalName}-${index}`;
    
    // 确保有32个数据，不足的用空字符串填充
    const paddedValues = [...item.hexValues];
    while (paddedValues.length < 32) {
      paddedValues.push('');
    }
    // 只取前32个
    const displayValues = paddedValues.slice(0, 32);
    
    return (
      <tr
        key={rowKey}
        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors cursor-pointer ${
          isSelected ? 'bg-blue-100' : ''
        }`}
        onClick={() => toggleSignalSelection(item.signalName)}
      >
        <td 
          className="px-2 py-2 text-sm sticky left-0 bg-inherit z-10"
          style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSignalSelection(item.signalName)}
            className="mr-2"
          />
          <span className="font-mono">{item.signalName}</span>
        </td>
        <td 
          className="px-2 py-2 text-sm text-center"
          style={{ width: '80px', minWidth: '80px', maxWidth: '80px' }}
        >
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            item.dataType === '5ms' ? 'bg-red-100 text-red-800' :
            item.dataType === '10ms' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {item.dataType}
          </span>
        </td>
        {/* 32个数据列，按1-32顺序显示 */}
        {displayValues.map((value: string, colIndex: number) => (
          <td
            key={colIndex}
            className={`px-1 py-2 text-xs font-mono text-center border-l border-gray-200 ${getColumnBgColor(colIndex)}`}
            style={{ width: '50px', minWidth: '50px', maxWidth: '50px' }}
            title={value ? `位置${colIndex + 1}: ${value} (${parseInt(value, 16)})` : `位置${colIndex + 1}: 无数据`}
          >
            {value || '-'}
          </td>
        ))}
      </tr>
    );
  };

  // 如果没有驱动段数据
  if (!hasDriverData()) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BoltIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">暂无驱动段数据</h2>
          <p className="text-gray-600 mb-4">当前文件中未检测到驱动段数值数据</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>请确保TXT文件包含以下数据段：</p>
            <p>• 数值5ms - 5毫秒周期数值数据</p>
            <p>• 数值10ms - 10毫秒周期数值数据</p>
            <p>• 数值50ms - 50毫秒周期数值数据</p>
          </div>
          <button
            onClick={() => window.location.href = '/import'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新导入数据
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900">驱动段数值数据</h1>
        </div>


      </div>

      {/* 搜索和过滤 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索信号名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 采样频率过滤 */}
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            <select
              value={selectedRate}
              onChange={(e) => setSelectedRate(e.target.value as SamplingRate)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部频率</option>
              <option value="5ms">5ms (200Hz)</option>
              <option value="10ms">10ms (100Hz)</option>
              <option value="50ms">50ms (20Hz)</option>
            </select>
          </div>

          {/* 视图模式切换 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                viewMode === 'chart' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              <ChartBarIcon className="w-4 h-4" />
              <span>{viewMode === 'table' ? '图表视图' : '表格视图'}</span>
            </button>
          </div>

          {/* 隐藏yobi信号 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setHideYobiSignals(!hideYobiSignals)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                hideYobiSignals 
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
              title={hideYobiSignals ? '显示yobi信号' : '隐藏yobi信号'}
            >
              {hideYobiSignals ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>

          {/* 显示模式切换 */}
          {viewMode === 'table' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setUseVirtualScroll(!useVirtualScroll)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  useVirtualScroll 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
                title={useVirtualScroll ? '虚拟滚动模式' : '分页模式'}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 导出按钮 */}
          <button
            onClick={exportToCSV}
            disabled={!filteredData.length}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>导出CSV</span>
          </button>
        </div>

        {/* 选中信号提示 */}
        {viewMode === 'chart' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-700">
                已选择 {selectedSignals.length} 个信号进行图表展示
                {selectedSignals.length === 0 && ' - 请点击表格行选择信号'}
              </div>
              {selectedSignals.length > 0 && (
                <button
                  onClick={() => setSelectedSignals([])}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  清除选择
                </button>
              )}
            </div>
            {selectedSignals.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedSignals.map(signal => (
                  <span key={signal} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {signal}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 图表视图 */}
      {viewMode === 'chart' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">数值趋势图表</h3>
          {selectedSignals.length > 0 ? (
            <div style={{ height: '500px' }}>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: '驱动段数值数据趋势'
                    },
                    legend: {
                      position: 'top' as const,
                    }
                  },
                  scales: {
                    x: {
                      display: true,
                      title: {
                        display: true,
                        text: '数据点索引 (1-32)'
                      },
                      grid: {
                        display: true
                      },
                      ticks: {
                        maxTicksLimit: 32,
                        stepSize: 1
                      }
                    },
                    y: {
                      display: true,
                      title: {
                        display: true,
                        text: '数值 (十进制)'
                      },
                      grid: {
                        display: true
                      }
                    }
                  },
                  interaction: {
                    mode: 'index' as const,
                    intersect: false,
                  }
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p>请在下方表格中选择信号以显示图表</p>
            </div>
          )}
        </div>
      )}

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '200px' }} />
              <col style={{ width: '80px' }} />
              {Array.from({ length: 32 }, (_, i) => (
                <col key={i} style={{ width: '50px' }} />
              ))}
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20"
                  style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}
                >
                  信号名称
                </th>
                <th 
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: '80px', minWidth: '80px', maxWidth: '80px' }}
                >
                  频率
                </th>
                {/* 32个数据列标题，按1-32顺序 */}
                {Array.from({ length: 32 }, (_, i) => {
                  const colIndex = i;
                  const groupIndex = Math.floor(colIndex / 8);
                  const groupColors = ['bg-red-100', 'bg-blue-100', 'bg-green-100', 'bg-yellow-100'];
                  const bgColor = groupColors[groupIndex % groupColors.length];
                  
                  return (
                    <th
                      key={i}
                      className={`px-1 py-3 text-center text-xs font-medium text-gray-700 border-l border-gray-300 ${bgColor}`}
                      style={{ width: '50px', minWidth: '50px', maxWidth: '50px' }}
                      title={`数据位置 ${i + 1}`}
                    >
                      {i + 1}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {useVirtualScroll ? (
                <tr>
                  <td colSpan={34} className="p-0">
                    <VirtualScroll
                      items={filteredData}
                      itemHeight={60}
                      containerHeight={600}
                      renderItem={(item, index) => renderTableRow(item, index)}
                    />
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => renderTableRow(item, index))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页控件 (非虚拟滚动模式) */}
        {!useVirtualScroll && totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, filteredData.length)} 项，共 {filteredData.length} 项
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="text-sm text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 数据为空时的提示 */}
      {filteredData.length === 0 && driverNumericData.length > 0 && (
        <div className="text-center py-12 bg-white rounded-lg mt-6">
          <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到匹配的数据</h3>
          <p className="text-gray-500">请尝试调整搜索条件或筛选器</p>
        </div>
      )}
    </div>
  );
}