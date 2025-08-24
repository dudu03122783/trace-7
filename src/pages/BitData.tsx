// 比特数据页面
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { BitSignal } from '../types';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { XMLConfigParser } from '../utils/xmlConfigParser';

export default function BitData() {
  const { state, getSignalDescription, getBitData } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedSignal, setSelectedSignal] = useState<BitSignal | null>(null);
  const [hoveredBitColumn, setHoveredBitColumn] = useState<number | null>(null);

  const bitData = getBitData();

  // 过滤和搜索数据
  const filteredData = useMemo(() => {
    let filtered = bitData;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(signal => 
        signal.signalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        signal.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 状态过滤
    if (filterActive !== 'all') {
      filtered = filtered.filter(signal => 
        filterActive === 'active' ? signal.isActive : !signal.isActive
      );
    }

    return filtered;
  }, [bitData, searchTerm, filterActive]);

  const totalRecords = bitData.length;
  const activeSignals = bitData.filter(signal => signal.isActive).length;
  const inactiveSignals = bitData.filter(signal => !signal.isActive).length;
  
  const exportData = filteredData;

  // 分页数据
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // 将32位数据转换为位数组
  const convertHexToBits = (hexValue: string): string[] => {
    if (!hexValue) return Array(32).fill('0');
    
    // 移除空格，直接按字符顺序显示
    const cleanHex = hexValue.replace(/\s+/g, '');
    
    // 直接将每个字符按顺序放入32个位置
    const result = Array(32).fill('0');
    for (let i = 0; i < Math.min(cleanHex.length, 32); i++) {
      result[i] = cleanHex[i];
    }
    
    return result;
  };

  // 导出数据
  const exportToCSV = () => {
    const headers = ['NO顺序', '信号名', '信号解释', ...Array.from({ length: 32 }, (_, i) => `位${i + 1}`), '状态'];
    const csvData = filteredData.map(signal => {
      const bits = convertHexToBits(signal.hexValue);
      return [
        signal.orderNo,
        signal.signalName + (signal.invertFlag ? ` ${signal.invertFlag}` : ''),
        signal.description || '-',
        ...bits,
        signal.isActive ? '反转' : '不反转'
      ];
    });
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bit_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* 搜索和过滤 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索地址或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
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
              <option value="active">仅翻转</option>
              <option value="inactive">仅不翻转</option>
            </select>
          </div>

          {/* 每页显示数量 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">每页:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  NO顺序
                </th>
                <th className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">信号名</th>
                <th className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">信号解释</th>
                {/* 32位数据列 */}
                {Array.from({ length: 32 }, (_, i) => {
                  const groupIndex = Math.floor(i / 8);
                  const bgColors = ['bg-red-50', 'bg-blue-50', 'bg-green-50', 'bg-yellow-50'];
                  const groupBg = bgColors[groupIndex % 4];
                  
                  return (
                    <th 
                      key={i}
                      className={`px-1 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-6 ${
                        hoveredBitColumn === i ? 'bg-blue-100' : groupBg
                      }`}
                      onMouseEnter={() => setHoveredBitColumn(i)}
                      onMouseLeave={() => setHoveredBitColumn(null)}
                    >
                      {i + 1}
                    </th>
                  );
                })}

              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((signal, index) => {
                const isActive = signal.isActive;
                const bits = convertHexToBits(signal.hexValue);
                return (
                  <tr key={`${signal.signalName}-${index}`} className="hover:bg-gray-50">
                    <td className="px-1 py-1 whitespace-nowrap text-sm text-gray-900 w-12">
                      {signal.orderNo}
                    </td>
                    <td className="px-1 py-1 whitespace-nowrap text-sm font-mono text-gray-900 w-20">
                      {signal.signalName}
                      {signal.invertFlag && (
                        <span className="ml-2 text-xs text-red-600">{signal.invertFlag}</span>
                      )}
                    </td>
                    <td className="px-1 py-1 text-sm text-gray-900 w-24">
                      {signal.description || '-'}
                    </td>
                    {/* 32位数据列 */}
                    {bits.map((bit, bitIndex) => {
                      const groupIndex = Math.floor(bitIndex / 8);
                      const bgColors = ['bg-red-50', 'bg-blue-50', 'bg-green-50', 'bg-yellow-50'];
                      const groupBg = bgColors[groupIndex % 4];
                      
                      // 检查是否是翻转信号的第一个变化数字
                      let isFirstChange = false;
                      if (signal.invertFlag === '*-') {
                        const prevSignal = bitData.find(s => s.orderNo === signal.orderNo - 1);
                        if (prevSignal) {
                          const prevBits = convertHexToBits(prevSignal.hexValue);
                          const currentBits = bits;
                          // 找到第一个发生变化的位置
                          for (let i = 0; i <= bitIndex; i++) {
                            if (prevBits[i] !== currentBits[i]) {
                              isFirstChange = i === bitIndex;
                              break;
                            }
                          }
                        }
                      }
                      
                      return (
                        <td 
                          key={bitIndex}
                          className={`px-1 py-2 text-center text-sm font-mono w-6 ${
                            hoveredBitColumn === bitIndex ? 'bg-blue-100' : 
                            isFirstChange ? 'bg-red-500 text-white' : groupBg
                          } ${
                            bit === '1' ? 'text-green-600 font-bold' : 'text-gray-400'
                          }`}
                          onMouseEnter={() => setHoveredBitColumn(bitIndex)}
                          onMouseLeave={() => setHoveredBitColumn(null)}
                        >
                          {bit}
                        </td>
                      );
                    })}

                  </tr>
                );
              })}
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

      {/* 信号详情模态框 */}
      {selectedSignal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">信号详情</h3>
                <button
                  onClick={() => setSelectedSignal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">NO顺序</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSignal.orderNo}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">信号反转标记</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSignal.invertFlag || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">信号名</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{selectedSignal.signalName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">信号解释</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSignal.description || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">32位数据</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{selectedSignal.hexValue}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">状态</label>
                  <p className={`mt-1 text-sm font-medium ${
                    selectedSignal.isActive ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {selectedSignal.isActive ? '激活' : '未激活'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => setSelectedSignal(null)}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}