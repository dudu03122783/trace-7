// 主布局组件
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useData } from '../../context/DataContext';

export default function Layout() {
  const { state } = useData();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧导航栏 */}
      <Sidebar />
      
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部状态栏 */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                电梯控制系统数据跟踪分析工具
              </h2>
              
              {/* 数据状态徽章 */}
              {state.currentData && (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx={4} cy={4} r={3} />
                    </svg>
                    数据已加载
                  </span>
                  <span className="text-sm text-gray-500">
                    {state.currentData.fileName}
                  </span>
                </div>
              )}
            </div>
            
            {/* 右侧操作区域 */}
            <div className="flex items-center space-x-3">
              {/* XML配置状态 */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  state.xmlConfig ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {state.xmlConfig ? 'XML配置已加载' : 'XML配置未加载'}
                </span>
              </div>
              
              {/* 时间戳 */}
              <div className="text-sm text-gray-500">
                {new Date().toLocaleString('zh-CN')}
              </div>
            </div>
          </div>
          
          {/* 加载进度条 */}
          {state.isLoading && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>正在解析数据...</span>
                <span>{state.parseProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.parseProgress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* 错误提示 */}
          {state.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-800">{state.error}</span>
              </div>
            </div>
          )}
        </header>
        
        {/* 主内容区域 */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}