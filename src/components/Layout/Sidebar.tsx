// 左侧导航栏组件
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentArrowUpIcon,
  CpuChipIcon,
  ClockIcon,
  CameraIcon,
  ChartBarIcon,
  BoltIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { useData } from '../../context/DataContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  requiresData?: boolean;
  requiresDriverData?: boolean;
}

const navItems: NavItem[] = [
  {
    name: '数据导入',
    path: '/import',
    icon: DocumentArrowUpIcon,
    description: '上传TXT文件并解析数据'
  },
  {
    name: '比特数据',
    path: '/bit-data',
    icon: CpuChipIcon,
    description: '查看信号状态和配置',
    requiresData: true
  },
  {
    name: '25ms数据',
    path: '/data-25ms',
    icon: ClockIcon,
    description: '25毫秒周期数值数据',
    requiresData: true
  },
  {
    name: '50ms数据',
    path: '/data-50ms',
    icon: ChartBarIcon,
    description: '50毫秒周期数值数据',
    requiresData: true
  },
  {
    name: '快照数据',
    path: '/snapshot',
    icon: CameraIcon,
    description: '系统状态快照',
    requiresData: true
  },
  {
    name: '驱动段数据',
    path: '/driver-data',
    icon: BoltIcon,
    description: '驱动段高频数据分析',
    requiresData: true,
    requiresDriverData: true
  }
];

export default function Sidebar() {
  const location = useLocation();
  const { state, hasDriverData } = useData();
  const hasData = !!state.currentData;
  const hasDriver = hasDriverData();

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      {/* Logo区域 */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <HomeIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">电梯数据分析</h1>
            <p className="text-sm text-gray-400">控制系统跟踪工具</p>
          </div>
        </div>
      </div>

      {/* 数据状态指示器 */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="space-y-2">
          {/* 控制段数据状态 */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              hasData ? 'bg-green-500' : 'bg-gray-500'
            }`} />
            <span className="text-sm text-gray-300">
              {hasData ? '控制段数据已加载' : '未加载数据'}
            </span>
          </div>
          
          {/* 驱动段数据状态 */}
          {hasData && (
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                hasDriver ? 'bg-blue-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm text-gray-300">
                {hasDriver ? '驱动段数据已加载' : '未检测到驱动段'}
              </span>
            </div>
          )}
        </div>
        
        {state.currentData && (
          <div className="mt-2 text-xs text-gray-400">
            文件: {state.currentData.fileName}
          </div>
        )}
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isDisabled = (item.requiresData && !hasData) || 
                            (item.requiresDriverData && !hasDriver);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive: linkActive }) => {
                const baseClasses = 'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200';
                
                if (isDisabled) {
                  return `${baseClasses} text-gray-500 cursor-not-allowed bg-gray-800/50`;
                }
                
                if (linkActive || isActive) {
                  return `${baseClasses} bg-blue-600 text-white shadow-lg`;
                }
                
                return `${baseClasses} text-gray-300 hover:bg-gray-800 hover:text-white`;
              }}
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault();
                }
              }}
            >
              <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                isDisabled ? 'text-gray-500' : 
                isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
              }`} />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className={`text-xs mt-0.5 ${
                  isDisabled ? 'text-gray-600' :
                  isActive ? 'text-blue-200' : 'text-gray-500 group-hover:text-gray-300'
                }`}>
                  {item.description}
                </div>
              </div>
              {isDisabled && (
                <div className="ml-2">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {/* 驱动段特殊标记 */}
              {item.requiresDriverData && hasDriver && (
                <div className="ml-2">
                  <BoltIcon className="w-4 h-4 text-blue-400" />
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* 底部信息 */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          <div className="mb-1">版本 1.0.0</div>
          <div>电梯控制系统数据分析工具</div>
        </div>
        
        {/* XML配置状态 */}
        <div className="mt-3 flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            state.xmlConfig ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          <span className="text-xs text-gray-400">
            {state.xmlConfig ? 'XML配置已加载' : 'XML配置未加载'}
          </span>
        </div>
        
        {/* 加载进度 */}
        {state.isLoading && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>解析进度</span>
              <span>{state.parseProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${state.parseProgress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* 错误提示 */}
        {state.error && (
          <div className="mt-3 p-2 bg-red-900/50 border border-red-700 rounded text-xs text-red-300">
            {state.error}
          </div>
        )}
      </div>
    </div>
  );
}