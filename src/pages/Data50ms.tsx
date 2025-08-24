import React, { useState, useMemo } from 'react';
import { Search, Download, BarChart3, Filter, Eye, EyeOff } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useElevatorData } from '../hooks/useElevatorData';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);



interface Data50msItem {
  signalName: string;
  signalDescription: string;
  hexValues: string[];
  unit: string;
}

const Data50ms: React.FC = () => {
  const { data50ms } = useElevatorData();
  const { state, getSignalDescription } = useData();

  // 添加调试信息
  console.log('Data50ms页面 - data50ms:', data50ms);
  console.log('Data50ms页面 - xmlConfig:', state.xmlConfig);
  console.log('Data50ms页面 - data50ms长度:', data50ms?.length || 0);

  // 使用DataContext中的getSignalDescription方法，专门用于50ms TRACE
  const getSignalDescriptionFor50ms = (signalName: string): string => {
    return getSignalDescription(signalName, undefined, '50ms TRACE');
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [hideYobiSignals, setHideYobiSignals] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'allChart'>('table');

  // 从信号解释中提取单位
  const extractUnit = (description: string): string => {
    const unitMatch = description.match(/\[([^\]]+)\]/);
    return unitMatch ? unitMatch[1] : '';
  };

  // 处理50ms数据：删除第一行，合并同信号名的两行数据
  const processedData = useMemo(() => {
    if (!data50ms || data50ms.length === 0) return [];
    
    // 删除第一行数据
    const dataWithoutFirst = data50ms.slice(1);
    
    const mergedData: Data50msItem[] = [];
    const processedSignals = new Set<string>();
    
    for (let i = 0; i < dataWithoutFirst.length; i++) {
      const currentRow = dataWithoutFirst[i];
      const signalName = currentRow.signalName;
      
      if (processedSignals.has(signalName)) {
        continue;
      }
      
      // 查找下一行是否有相同的信号名
      const nextRowIndex = dataWithoutFirst.findIndex((row, index) => 
        index > i && row.signalName === signalName
      );
      
      if (nextRowIndex !== -1) {
        // 合并两行数据：第一行32个 + 第二行32个 = 64个数据
        const nextRow = dataWithoutFirst[nextRowIndex];
        const combinedHexValues = [...currentRow.hexValues, ...nextRow.hexValues];
        
        // 确保有64个数据，不足时补齐
        while (combinedHexValues.length < 64) {
          combinedHexValues.push('00');
        }
        
        const signalDescription = getSignalDescriptionFor50ms(signalName);
        
        mergedData.push({
          signalName,
          signalDescription,
          hexValues: combinedHexValues.slice(0, 64),
          unit: extractUnit(signalDescription)
        });
        
        processedSignals.add(signalName);
      } else {
        // 只有一行数据的情况，补齐到64个
        const hexValues = [...currentRow.hexValues];
        while (hexValues.length < 64) {
          hexValues.push('00');
        }
        
        const signalDescription = getSignalDescriptionFor50ms(signalName);
        
        mergedData.push({
          signalName,
          signalDescription,
          hexValues: hexValues.slice(0, 64),
          unit: extractUnit(signalDescription)
        });
        
        processedSignals.add(signalName);
      }
    }
    
    return mergedData;
  }, [data50ms]);

  // 过滤数据
  const filteredData = useMemo(() => {
    return processedData.filter(item => {
      const matchesSearch = item.signalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.signalDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesChannel = selectedChannel === 'all' || item.signalName === selectedChannel;
      const matchesYobiFilter = !hideYobiSignals || !item.signalName.toLowerCase().startsWith('kp_yobi');
      
      return matchesSearch && matchesChannel && matchesYobiFilter;
    });
  }, [processedData, searchTerm, selectedChannel, hideYobiSignals]);

  // 显示所有数据，不分页
  const displayData = filteredData;

  // 获取所有信号名称选项（排除yobi信号）
  const channelOptions = useMemo(() => {
    const signalNames = new Set<string>();
    processedData.forEach(item => {
      // 如果隐藏yobi信号，则不包含yobi开头的信号
      if (!hideYobiSignals || !item.signalName.toLowerCase().startsWith('kp_yobi')) {
        signalNames.add(item.signalName);
      }
    });
    return Array.from(signalNames).sort();
  }, [processedData, hideYobiSignals]);

  // 全数据图表数据（显示所有信号的64个数据点）
  const allDataChartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return { labels: [], datasets: [] };
    }

    // 生成x轴标签（数据索引1-64）
    const labels = Array.from({ length: 64 }, (_, i) => `${i + 1}`);

    // 按单位分组
    const unitGroups: { [unit: string]: any[] } = {};
    filteredData.forEach(item => {
      const unit = item.unit || 'default';
      if (!unitGroups[unit]) {
        unitGroups[unit] = [];
      }
      unitGroups[unit].push(item);
    });

    // 为每个单位组生成不同的颜色
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];

    const datasets = Object.entries(unitGroups).flatMap(([unit, items], groupIndex) => {
      const baseColor = colors[groupIndex % colors.length];
      
      return items.map((item, itemIndex) => {
        // 为每个信号的64个数据点创建数据
        const data = item.hexValues.slice(0, 64).map((hexValue: string, index: number) => ({
          x: index + 1,
          y: parseInt(hexValue, 16) || 0 // 十六进制转十进制
        }));

        // 为同一单位组内的不同信号生成略有差异的颜色
        const colorVariation = itemIndex * 20;
        const color = `hsl(${(parseInt(baseColor.slice(1), 16) + colorVariation) % 360}, 70%, 50%)`;

        return {
          label: `${item.signalName} (${item.signalDescription})`,
          data,
          borderColor: color,
          backgroundColor: color + '20',
          tension: 0.1,
          pointRadius: 2,
          pointHoverRadius: 4
        };
      });
    });

    return { labels, datasets };
  }, [filteredData]);



  // 导出CSV
  const exportToCSV = () => {
    const headers = ['信号名称', '信号解释', ...Array.from({length: 64}, (_, i) => `#${i + 1}`), '单位'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.signalName,
        `"${item.signalDescription}"`,
        ...item.hexValues,
        item.unit
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '50ms_data.csv';
    link.click();
  };

  // 检查是否有原始数据
  const hasRawData = data50ms && data50ms.length > 0;
  const hasProcessedData = processedData && processedData.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2">
      <div className="w-full max-w-none px-1">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">50ms 数据分析</h1>
              <p className="text-sm text-gray-600">共 {filteredData.length} 条信号数据，每个信号包含64个数据点</p>
              {/* 数据状态显示 */}
              <div className="mt-3 flex items-center space-x-4">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  hasRawData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  原始数据: {hasRawData ? `${data50ms.length}条` : '无数据'}
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  hasProcessedData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  处理后数据: {hasProcessedData ? `${processedData.length}条` : '无数据'}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                表格视图
              </button>
              <button
                onClick={() => setViewMode('allChart')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  viewMode === 'allChart'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                全数据绘图
              </button>
            </div>
          </div>

          {/* 控制面板 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="搜索信号名称或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 信号筛选 */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="w-full pl-10 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">所有信号</option>
                  {channelOptions.map(signalName => (
                    <option key={signalName} value={signalName}>{signalName}</option>
                  ))}
                </select>
              </div>

              {/* 隐藏yobi信号 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hideYobi"
                  checked={hideYobiSignals}
                  onChange={(e) => setHideYobiSignals(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="hideYobi" className="text-xs text-gray-700 flex items-center">
                  {hideYobiSignals ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  隐藏yobi信号
                </label>
              </div>

              {/* 导出按钮 */}
              <button
                onClick={exportToCSV}
                className="flex items-center justify-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                导出CSV
              </button>
            </div>


          </div>

          {/* 全数据图表视图 */}
          {viewMode === 'allChart' && allDataChartData && (
            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">50ms数据完整64点图表</h3>
              <p className="text-gray-600 mb-6">显示所有信号的64个数据点，x轴为数据索引（1-64），y轴为十进制数值</p>
              <div className="h-96">
                <Line
                  data={allDataChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: '50ms数据完整64点图表'
                      },
                      tooltip: {
                        callbacks: {
                          title: (context) => `数据点 #${context[0].parsed.x}`,
                          label: (context) => {
                            const value = context.parsed.y;
                            return `${context.dataset.label}: ${value}`;
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: '数据索引'
                        },
                        min: 1,
                        max: 64
                      },
                      y: {
                        title: {
                          display: true,
                          text: '十进制数值'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* 表格视图 */}
          {viewMode === 'table' && (
            <div className="overflow-x-auto w-full" style={{maxHeight: 'calc(100vh - 200px)'}}>
              <table className="min-w-full bg-white border border-gray-200 rounded-lg text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      信号名称
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      信号解释
                    </th>
                    {Array.from({ length: 64 }, (_, i) => (
                      <th key={i} className="px-1 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        #{i + 1}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      单位
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50" style={{height: '28px'}}>
                      <td className="px-3 py-1 whitespace-nowrap text-xs font-medium text-gray-900 border-r">
                         {item.signalName}
                       </td>
                       <td className="px-3 py-1 text-xs text-gray-700 border-r max-w-xs">
                         <div className="truncate" title={item.signalDescription}>
                           {item.signalDescription}
                         </div>
                       </td>
                      {item.hexValues.map((value, i) => (
                        <td key={i} className="px-1 py-1 text-center text-xs text-gray-900 border-r font-mono">
                          {value}
                        </td>
                      ))}
                      <td className="px-3 py-1 whitespace-nowrap text-xs text-gray-700">
                        {item.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}





          {/* 无数据提示 */}
          {!hasRawData ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无50ms数据</h3>
              <p className="text-gray-500 mb-4">请先导入包含50ms TRACE数据的文件</p>
              <div className="text-sm text-gray-400">
                <p>支持的文件格式：.trace、.xml等</p>
                <p>确保文件中包含tableCode="50ms TRACE"的数据项</p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                返回首页导入数据
              </Link>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到匹配的数据</h3>
              <p className="text-gray-500">请尝试调整搜索条件或筛选器</p>
              <p className="text-sm text-gray-400 mt-2">当前有 {processedData.length} 条可用数据</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Data50ms;