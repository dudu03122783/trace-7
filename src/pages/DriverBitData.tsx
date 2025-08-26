// 驱动段比特数据页面
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import VirtualScroll from '../components/VirtualScroll';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  BoltIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

type SamplingRate = '5ms' | '10ms' | '50ms' | 'all';

export default function DriverBitData() {
  const { state, getDriverBitData, hasDriverData } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRate, setSelectedRate] = useState<SamplingRate>('all');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [useVirtualScroll, setUseVirtualScroll] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedSignal, setSelectedSignal] = useState<any>(null);
  const [hoveredBitColumn, setHoveredBitColumn] = useState<number | null>(null);

  // 获取驱动段比特数据
  const driverBitData = useMemo(() => {
    if (selectedRate === 'all') {
      return getDriverBitData();
    }
    return getDriverBitData(selectedRate);
  }, [getDriverBitData, selectedRate]);

  // 过滤数据
  const filteredData = useMemo(() => {
    let filtered = driverBitData;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.signalName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 状态过滤
    if (filterActive === 'active') {
      filtered = filtered.filter(item => item.isActive);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter(item => !item.isActive);
    }

    return filtered;
  }, [driverBitData, searchTerm, filterActive]);

  // 获取统计信息
  const stats = useMemo(() => {
    const totalRecords = driverBitData.length;
    const activeSignals = driverBitData.filter(item => item.isActive).length;
    const rateStats = {
      '5ms': driverBitData.filter(item => item.samplingRate === '5ms').length,
      '10ms': driverBitData.filter(item => item.samplingRate === '10ms').length,
      '50ms': driverBitData.filter(item => item.samplingRate === '50ms').length
    };
    
    return { totalRecords, activeSignals, rateStats };
  }, [driverBitData]);

  // 分页数据
  const paginatedData = useMemo(() => {
    if (useVirtualScroll) return filteredData;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize, useVirtualScroll]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // 导出数据
  const exportToCSV = () => {
    const headers = ['序号', '采样频率', '采样率(Hz)', '信号名称', '反转标记', '32位数据', '激活状态'];
    
    const csvData = filteredData.map(item => [
      item.orderNo,
      item.samplingRate,
      item.samplingRate === '5ms' ? '200' : item.samplingRate === '10ms' ? '100' : '20',
      item.signalName,
      item.invertFlag || '',
      item.hexValue,
      item.isActive ? '激活' : '未激活'
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'driver_bit_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 获取数据列的分组背景色
  const getBitColumnBgColor = (bitIndex: number) => {
    const group = Math.floor(bitIndex / 8);
    switch (group) {
      case 0: return 'bg-blue-50'; // 第1-8列：浅蓝色
      case 1: return 'bg-green-50'; // 第9-16列：浅绿色
      case 2: return 'bg-yellow-50'; // 第17-24列：浅黄色
      case 3: return 'bg-purple-50'; // 第25-32列：浅紫色
      default: return 'bg-gray-50';
    }
  };

  // 十六进制转32位二进制的函数
  const hexToBinary = (hexData: string): string => {
    if (!hexData || typeof hexData !== 'string') {
      return '00000000000000000000000000000000';
    }
    
    // 如果已经是32位二进制字符串，直接返回
    if (hexData.length === 32 && /^[01]+$/.test(hexData)) {
      return hexData;
    }
    
    // 移除空格和非十六进制字符
    const cleanHex = hexData.replace(/[^0-9a-fA-F]/g, '');
    
    // 确保有8个十六进制字符（32位）
    const paddedHex = cleanHex.padEnd(8, '0').substring(0, 8);
    
    // 转换为二进制
    let binary = '';
    for (let i = 0; i < paddedHex.length; i++) {
      const hexChar = paddedHex[i];
      const decimal = parseInt(hexChar, 16);
      const binaryChar = decimal.toString(2).padStart(4, '0');
      binary += binaryChar;
    }
    
    return binary;
  };

  // 渲染表格行
  const renderTableRow = (signal: any, index: number) => {
    // 添加调试信息
    console.log('Signal data:', {
      signalName: signal.signalName,
      originalBinaryData: signal.binaryData,
      dataType: typeof signal.binaryData
    });
    
    // 将十六进制数据转换为32位二进制
    const bits = hexToBinary(signal.binaryData);
    
    console.log('Converted bits:', bits);
    
    const rowKey = `${signal.samplingRate}-${signal.signalName}-${index}`;
    
    return (
      <tr
        key={rowKey}
        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors cursor-pointer`}
        onClick={() => setSelectedSignal(signal)}
      >
        <td className="px-1 py-2 text-xs text-gray-900 font-mono text-center">{signal.orderNo}</td>
        <td className="px-1 py-2 text-xs text-center">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            signal.samplingRate === '5ms' ? 'bg-red-100 text-red-800' :
            signal.samplingRate === '10ms' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {signal.samplingRate}
          </span>
        </td>
        <td className="px-1 py-2 text-xs text-gray-900 font-mono break-all">
          <div className="flex items-center space-x-1">
            {signal.invertFlag && (
              <span className="text-red-600 font-bold">{signal.invertFlag}</span>
            )}
            <span className="truncate" title={signal.signalName}>{signal.signalName}</span>
          </div>
        </td>

        {/* 32位数据列 */}
        {bits.split('').map((bit, bitIndex) => {
          const groupBgColor = getBitColumnBgColor(bitIndex);
          const bitPosition = 31 - bitIndex; // 从高位到低位：31, 30, 29...2, 1, 0
          return (
            <td
              key={bitIndex}
              className={`px-0.5 py-2 text-center text-xs font-mono w-6 ${
                hoveredBitColumn === bitIndex ? 'bg-blue-200' : groupBgColor
              } ${bit !== '0' ? 'bg-yellow-200 text-yellow-900 font-bold' : 'text-gray-500'}`}
              onMouseEnter={() => setHoveredBitColumn(bitIndex)}
              onMouseLeave={() => setHoveredBitColumn(null)}
              title={`位${bitPosition}: ${bit}`}
            >
              {bit}
            </td>
          );
        })}

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
          <p className="text-gray-600 mb-4">当前文件中未检测到驱动段比特数据</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>请确保TXT文件包含以下数据段：</p>
            <p>• 比特5ms - 5毫秒周期比特数据</p>
            <p>• 比特10ms - 10毫秒周期比特数据</p>
            <p>• 比特50ms - 50毫秒周期比特数据</p>
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
      {/* 页面标题 */}




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

          {/* 状态过滤 */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部状态</option>
              <option value="active">仅激活</option>
              <option value="inactive">仅未激活</option>
            </select>
          </div>

          {/* 显示模式切换 */}
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
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <colgroup>
              <col className="w-12" />
              <col className="w-16" />
              <col className="w-24" />
              {Array.from({ length: 32 }, (_, i) => (
                <col key={i} className="w-6" />
              ))}
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NO</th>
                <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">频率</th>
                <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">信号名</th>
                {Array.from({ length: 32 }, (_, i) => {
                  const groupBgColor = getBitColumnBgColor(i);
                  const bitPosition = 31 - i; // 从高位到低位：31, 30, 29...2, 1, 0
                  return (
                    <th key={i} className={`px-0.5 py-2 text-center text-xs font-medium text-gray-600 ${groupBgColor}`} title={`位${bitPosition}`}>
                      {bitPosition}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {useVirtualScroll ? (
                <tr>
                  <td colSpan={35} className="p-0">
                    <VirtualScroll
                      items={filteredData}
                      itemHeight={40}
                      containerHeight={600}
                      renderItem={(signal, index) => (
                        <div className="w-full">
                          <table className="w-full table-fixed">
                            <colgroup>
                              <col className="w-12" />
                              <col className="w-16" />
                              <col className="w-24" />
                              {Array.from({ length: 32 }, (_, i) => (
                                <col key={i} className="w-6" />
                              ))}
                            </colgroup>
                            <tbody>
                              {renderTableRow(signal, index)}
                            </tbody>
                          </table>
                        </div>
                      )}
                    />
                  </td>
                </tr>
              ) : (
                paginatedData.map((signal, index) => renderTableRow(signal, index))
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

      {/* 信号详情模态框 */}
      {selectedSignal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">信号详情</h3>
              <button
                onClick={() => setSelectedSignal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3">
              <div><strong>信号名称:</strong> {selectedSignal.signalName}</div>
              <div><strong>采样频率:</strong> {selectedSignal.samplingRate}</div>
              <div><strong>反转标记:</strong> {selectedSignal.invertFlag || '无'}</div>

              <div><strong>十六进制值:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{selectedSignal.hexValue}</code></div>
              <div><strong>二进制值:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{selectedSignal.binaryData}</code></div>
              <div><strong>激活状态:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  selectedSignal.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedSignal.isActive ? '激活' : '未激活'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 数据为空时的提示 */}
      {filteredData.length === 0 && driverBitData.length > 0 && (
        <div className="text-center py-12 bg-white rounded-lg mt-6">
          <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到匹配的数据</h3>
          <p className="text-gray-500">请尝试调整搜索条件或筛选器</p>
        </div>
      )}
    </div>
  );
}