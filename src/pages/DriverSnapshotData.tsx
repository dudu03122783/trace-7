// 驱动段快照数据页面
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  BoltIcon,
  CameraIcon,
  ClockIcon,
  InformationCircleIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface SnapshotGroup {
  timestamp: string;
  snapshots: any[];
}

export default function DriverSnapshotData() {
  const { state, getDriverSnapshotData, hasDriverData } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedSnapshot, setSelectedSnapshot] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'name' | 'timestamp' | 'order'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // 获取驱动段快照数据
  const driverSnapshotData = getDriverSnapshotData();

  // 过滤和排序数据
  const filteredAndSortedData = useMemo(() => {
    let filtered = driverSnapshotData;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(snapshot => 
        snapshot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snapshot.data.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'order':
        default:
          comparison = (a.orderNo || 0) - (b.orderNo || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [driverSnapshotData, searchTerm, sortBy, sortOrder]);

  // 按时间戳分组
  const groupedData = useMemo(() => {
    const groups = new Map<string, any[]>();
    
    filteredAndSortedData.forEach(snapshot => {
      const timestamp = snapshot.timestamp;
      if (!groups.has(timestamp)) {
        groups.set(timestamp, []);
      }
      groups.get(timestamp)!.push(snapshot);
    });

    return Array.from(groups.entries()).map(([timestamp, snapshots]) => ({
      timestamp,
      snapshots: snapshots.sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0))
    }));
  }, [filteredAndSortedData]);

  // 获取统计信息
  const stats = useMemo(() => {
    const totalSnapshots = driverSnapshotData.length;
    const uniqueSignals = new Set(driverSnapshotData.map(s => s.name)).size;
    const timestampGroups = groupedData.length;
    
    // 分析数据值分布
    const nonZeroCount = driverSnapshotData.filter(s => s.data !== '00' && s.data !== '0000').length;
    
    return { totalSnapshots, uniqueSignals, timestampGroups, nonZeroCount };
  }, [driverSnapshotData, groupedData]);

  // 切换组展开状态
  const toggleGroupExpansion = (timestamp: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(timestamp)) {
      newExpanded.delete(timestamp);
    } else {
      newExpanded.add(timestamp);
    }
    setExpandedGroups(newExpanded);
  };

  // 展开所有组
  const expandAllGroups = () => {
    setExpandedGroups(new Set(groupedData.map(group => group.timestamp)));
  };

  // 折叠所有组
  const collapseAllGroups = () => {
    setExpandedGroups(new Set());
  };

  // 导出数据
  const exportToCSV = () => {
    const headers = ['序号', '时间戳', '信号名称', '数据值', '分类'];
    const csvData = filteredAndSortedData.map(snapshot => [
      snapshot.orderNo || '',
      snapshot.timestamp,
      snapshot.name,
      snapshot.data,
      snapshot.category
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'driver_snapshot_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 格式化数据值显示
  const formatDataValue = (value: string) => {
    if (!value) return '0';
    
    // 转换为十进制显示
    const decValue = parseInt(value, 16);
    if (isNaN(decValue)) return value;
    
    return `${value} (${decValue})`;
  };

  // 获取数据值的颜色
  const getDataValueColor = (value: string) => {
    const decValue = parseInt(value, 16);
    if (isNaN(decValue) || decValue === 0) {
      return 'text-gray-500 bg-gray-100';
    } else if (decValue <= 255) {
      return 'text-blue-700 bg-blue-100';
    } else {
      return 'text-green-700 bg-green-100';
    }
  };

  // 如果没有驱动段数据
  if (!hasDriverData()) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BoltIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">暂无驱动段数据</h2>
          <p className="text-gray-600 mb-4">当前文件中未检测到驱动段快照数据</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>请确保TXT文件包含驱动段快照数据段</p>
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
        <div className="flex items-center space-x-3 mb-2">
          <CameraIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">驱动段快照数据</h1>
            <p className="text-gray-600">系统关键时刻状态快照</p>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600">总快照数</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalSnapshots}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600">独立信号</div>
            <div className="text-2xl font-bold text-blue-600">{stats.uniqueSignals}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600">时间组</div>
            <div className="text-2xl font-bold text-green-600">{stats.timestampGroups}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600">非零值</div>
            <div className="text-2xl font-bold text-orange-600">{stats.nonZeroCount}</div>
          </div>
        </div>
      </div>

      {/* 搜索和控制 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索信号名或数据值..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 排序选择 */}
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'timestamp' | 'order')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="order">按序号排序</option>
              <option value="name">按信号名排序</option>
              <option value="timestamp">按时间排序</option>
            </select>
          </div>

          {/* 排序方向 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={sortOrder === 'asc' ? '升序' : '降序'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* 展开/折叠控制 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={expandAllGroups}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              展开全部
            </button>
            <button
              onClick={collapseAllGroups}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              折叠全部
            </button>
          </div>

          {/* 导出按钮 */}
          <button
            onClick={exportToCSV}
            disabled={!filteredAndSortedData.length}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>导出CSV</span>
          </button>
        </div>
      </div>

      {/* 快照数据组 */}
      <div className="space-y-4">
        {groupedData.map((group) => {
          const isExpanded = expandedGroups.has(group.timestamp);
          
          return (
            <div key={group.timestamp} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* 组标题 */}
              <div 
                className="px-6 py-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleGroupExpansion(group.timestamp)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        快照时间: {group.timestamp}
                      </h3>
                      <p className="text-sm text-gray-600">
                        包含 {group.snapshots.length} 个快照项
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {isExpanded ? '点击折叠' : '点击展开'}
                  </div>
                </div>
              </div>

              {/* 组内容 */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">序号</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">信号名称</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">数据值</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.snapshots.map((snapshot, index) => (
                        <tr 
                          key={`${snapshot.name}-${snapshot.orderNo}-${index}`}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                            {snapshot.orderNo || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 font-mono">
                            {snapshot.name}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 text-xs font-mono rounded ${getDataValueColor(snapshot.data)}`}>
                              {formatDataValue(snapshot.data)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setSelectedSnapshot(snapshot)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="查看详情"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 无数据提示 */}
      {filteredAndSortedData.length === 0 && driverSnapshotData.length > 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到匹配的数据</h3>
          <p className="text-gray-500">请尝试调整搜索条件</p>
        </div>
      )}

      {/* 完全无数据提示 */}
      {driverSnapshotData.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <CameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无快照数据</h3>
          <p className="text-gray-500">当前驱动段数据中没有快照信息</p>
        </div>
      )}

      {/* 快照详情弹窗 */}
      {selectedSnapshot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">快照详情</h3>
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div><strong>序号：</strong>{selectedSnapshot.orderNo || '未设置'}</div>
              <div><strong>信号名：</strong><code className="bg-gray-100 px-2 py-1 rounded">{selectedSnapshot.name}</code></div>
              <div><strong>时间戳：</strong>{selectedSnapshot.timestamp}</div>
              <div><strong>数据值：</strong>
                <span className={`ml-2 px-2 py-1 text-sm font-mono rounded ${getDataValueColor(selectedSnapshot.data)}`}>
                  {formatDataValue(selectedSnapshot.data)}
                </span>
              </div>
              <div><strong>分类：</strong>{selectedSnapshot.category}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}