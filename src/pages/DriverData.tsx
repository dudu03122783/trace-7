// 驱动段数据综合页面
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import DriverBitData from './DriverBitData';
import DriverNumericData from './DriverNumericData';
import DriverSnapshotData from './DriverSnapshotData';
import {
  BoltIcon,
  CpuChipIcon,
  ChartBarIcon,
  CameraIcon,
  ClockIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

type TabType = 'bit' | 'numeric' | 'snapshot';

interface TabItem {
  id: TabType;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  component: React.ComponentType;
}

const tabs: TabItem[] = [
  {
    id: 'bit',
    name: '比特数据',
    icon: CpuChipIcon,
    description: '高频比特信号状态 (5ms/10ms/50ms)',
    component: DriverBitData
  },
  {
    id: 'numeric',
    name: '数值数据',
    icon: ChartBarIcon,
    description: '数值信号趋势分析 (5ms/10ms/50ms)',
    component: DriverNumericData
  },
  {
    id: 'snapshot',
    name: '快照数据',
    icon: CameraIcon,
    description: '系统关键时刻状态快照',
    component: DriverSnapshotData
  }
];

export default function DriverData() {
  const { state, hasDriverData, getDriverBitData, getDriverNumericData, getDriverSnapshotData } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('bit');

  // 获取统计信息
  const stats = React.useMemo(() => {
    if (!hasDriverData()) {
      return { bitData: 0, numericData: 0, snapshotData: 0, timestamp: null };
    }

    const bitData = getDriverBitData();
    const numericData = getDriverNumericData();
    const snapshotData = getDriverSnapshotData();
    const timestamp = state.currentData?.driverData?.timestamp;

    return {
      bitData: bitData.length,
      numericData: numericData.length,
      snapshotData: snapshotData.length,
      timestamp
    };
  }, [hasDriverData, getDriverBitData, getDriverNumericData, getDriverSnapshotData, state.currentData]);

  // 如果没有驱动段数据
  if (!hasDriverData()) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BoltIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">驱动段数据分析</h1>
          <p className="text-xl text-gray-600 mb-6">当前文件中未检测到驱动段数据</p>
          
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">驱动段数据包含以下类型：</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-red-700">比特数据</div>
                  <div className="text-gray-600 mt-1">
                    • 比特5ms (200Hz)<br/>
                    • 比特10ms (100Hz)<br/>
                    • 比特50ms (20Hz)
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-yellow-700">数值数据</div>
                  <div className="text-gray-600 mt-1">
                    • 数值5ms (200Hz)<br/>
                    • 数值10ms (100Hz)<br/>
                    • 数值50ms (20Hz)
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-green-700">快照数据</div>
                  <div className="text-gray-600 mt-1">
                    • 关键时刻状态<br/>
                    • 系统快照信息<br/>
                    • 故障记录
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-500">
              请上传包含驱动段数据的TXT文件，系统将自动识别和解析驱动段内容
            </p>
            <button
              onClick={() => window.location.href = '/import'}
              className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              重新导入数据
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || DriverBitData;

  return (
    <div>
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BoltIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">驱动段数据分析</h1>
              <p className="text-gray-600">高频驱动系统数据综合分析平台</p>
            </div>
          </div>

          {/* 数据概览 */}
          <div className="flex items-center space-x-6 text-sm">
            {stats.timestamp && (
              <div className="flex items-center space-x-2 text-gray-500">
                <ClockIcon className="w-4 h-4" />
                <span>数据时间: {stats.timestamp}</span>
              </div>
            )}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{stats.bitData}</div>
                <div className="text-xs text-gray-500">比特信号</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{stats.numericData}</div>
                <div className="text-xs text-gray-500">数值信号</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{stats.snapshotData}</div>
                <div className="text-xs text-gray-500">快照数据</div>
              </div>
            </div>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="mt-6">
          <nav className="flex space-x-8" aria-label="驱动段数据分析标签">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`mr-2 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  <div className="text-left">
                    <div className="font-medium">{tab.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 标签页内容 */}
      <div>
        <ActiveComponent />
      </div>
    </div>
  );
}