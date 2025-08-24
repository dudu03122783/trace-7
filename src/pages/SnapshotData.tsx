// 快照数据页面
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { SnapshotData as SnapshotDataType } from '../types';
import { Filter, ChevronDown, FileText, Search, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function SnapshotDataPage() {
  const { getSnapshotDataWithDescription } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('所有通道');
  const [hideYobi, setHideYobi] = useState(true);
  
  const snapshotData = getSnapshotDataWithDescription();

  // 获取所有唯一的信号名称作为筛选选项
  const channelOptions = useMemo(() => {
    const channels = ['所有通道', ...Array.from(new Set(snapshotData.map(item => item.name)))];
    return channels;
  }, [snapshotData]);

  // 过滤数据
  const filteredData = useMemo(() => {
    let filtered = snapshotData;

    // 隐藏yobi信号
    if (hideYobi) {
      filtered = filtered.filter(item => !item.name.toLowerCase().startsWith('yobi'));
    }

    // 按通道筛选
    if (selectedChannel !== '所有通道') {
      filtered = filtered.filter(item => item.name === selectedChannel);
    }

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [snapshotData, hideYobi, selectedChannel, searchTerm]);



  // 导出数据
  const exportData = () => {
    const csvContent = [
      ['序号', '信号名', '数据值', '信号描述'].join(','),
      ...filteredData.map((item, index) => [
        (index + 1).toString(),
        item.name,
        item.data,
        item.description || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `快照数据_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    link.click();
  };

  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [compareSnapshot, setCompareSnapshot] = useState(null);

  // 查看快照详情
  const handleViewSnapshot = (snapshot: SnapshotDataType) => {
    setSelectedSnapshot(snapshot);
  };

  // 对比快照
  const handleCompareSnapshot = (snapshot: SnapshotDataType) => {
    if (!selectedSnapshot) {
      setSelectedSnapshot(snapshot);
    } else if (selectedSnapshot.timestamp === snapshot.timestamp) {
      return; // 不能与自己对比
    } else {
      setCompareSnapshot(snapshot);
    }
  };

  // 清除选择
  const handleClearSelection = () => {
    setSelectedSnapshot(null);
    setCompareSnapshot(null);
  };

  // 格式化数据大小
  const formatDataSize = (data: string) => {
    const bytes = new Blob([data]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 对比两个快照的差异
  const getSnapshotDiff = (snapshot1: SnapshotDataType, snapshot2: SnapshotDataType) => {
    const lines1 = snapshot1.data.split('\n');
    const lines2 = snapshot2.data.split('\n');
    const maxLines = Math.max(lines1.length, lines2.length);
    
    const diff = [];
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      if (line1 !== line2) {
        diff.push({
          lineNumber: i + 1,
          snapshot1: line1,
          snapshot2: line2
        });
      }
    }
    return diff;
  };

  // 如果没有数据
  if (!snapshotData || snapshotData.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
      {/* 页面标题 */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">快照数据</h1>
        <p className="text-sm text-gray-600">
          查看电梯系统快照数据详情
        </p>
      </div>



      {/* 控制面板 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索信号名或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 筛选选项 */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {channelOptions.map(channel => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hideYobi}
                onChange={(e) => setHideYobi(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">隐藏yobi信号</span>
            </label>
          </div>

          {/* 导出按钮 */}
          <button
            onClick={exportData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>导出</span>
          </button>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无快照数据</h3>
            <p className="text-gray-500">当前没有可显示的快照数据</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    序号
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    信号名
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    数据值
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    信号描述
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr key={`${item.name}-${item.orderNo || index}`} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-mono">
                      {item.data}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs text-gray-600">{item.description || '-'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


      </div>

      {/* 快照详情和对比 */}
      {selectedSnapshot && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 选中的快照 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-blue-600" />
                {selectedSnapshot.name}
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  主快照
                </span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(selectedSnapshot.timestamp).toLocaleString()}
              </p>
              {selectedSnapshot.description && (
                <p className="text-sm text-gray-700 mt-2">{selectedSnapshot.description}</p>
              )}
            </div>
            <div className="px-6 py-4">
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                  {selectedSnapshot.data}
                </pre>
              </div>
            </div>
          </div>

          {/* 对比快照或提示 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {compareSnapshot ? (
              <>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-green-600" />
                    {compareSnapshot.name}
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      对比快照
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(compareSnapshot.timestamp).toLocaleString()}
                  </p>
                  {compareSnapshot.description && (
                    <p className="text-sm text-gray-700 mt-2">{compareSnapshot.description}</p>
                  )}
                </div>
                <div className="px-6 py-4">
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                      {compareSnapshot.data}
                    </pre>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-6 py-4 text-center">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">选择对比快照</h3>
                <p className="text-gray-600">
                  点击列表中的"对比"按钮来选择要对比的快照
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 差异对比 */}
      {selectedSnapshot && compareSnapshot && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-purple-600" />
              差异对比
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              显示两个快照之间的差异内容
            </p>
          </div>
          <div className="px-6 py-4">
            {(() => {
              const diff = getSnapshotDiff(selectedSnapshot, compareSnapshot);
              if (diff.length === 0) {
                return (
                  <div className="text-center py-8">
                    <p className="text-gray-600">两个快照内容完全相同</p>
                  </div>
                );
              }
              return (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {diff.slice(0, 50).map((diffItem, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                        行 {diffItem.lineNumber}
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-gray-200">
                        <div className="p-4 bg-red-50">
                          <div className="text-xs text-red-600 font-medium mb-1">主快照</div>
                          <pre className="text-xs text-red-800 whitespace-pre-wrap font-mono">
                            {diffItem.snapshot1 || '(空行)'}
                          </pre>
                        </div>
                        <div className="p-4 bg-green-50">
                          <div className="text-xs text-green-600 font-medium mb-1">对比快照</div>
                          <pre className="text-xs text-green-800 whitespace-pre-wrap font-mono">
                            {diffItem.snapshot2 || '(空行)'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                  {diff.length > 50 && (
                    <div className="text-center py-4 text-gray-600">
                      还有 {diff.length - 50} 处差异未显示...
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}