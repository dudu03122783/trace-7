// 数据导入页面
import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { ElevatorDataParser } from '../utils/elevatorDataParser';
import {
  DocumentArrowUpIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function DataImport() {
  const { state, dispatch } = useData();
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);


  // 处理文件拖拽
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // 处理文件放置
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };



  // 处理TXT文件上传
  const handleFileUpload = async (file: File) => {
    try {
      setUploadStatus('uploading');
      setUploadMessage('正在验证文件...');
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_PARSE_PROGRESS', payload: 0 });

      // 验证文件
      const validation = ElevatorDataParser.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || '文件验证失败');
      }

      setUploadMessage('正在解析数据...');
      dispatch({ type: 'SET_PARSE_PROGRESS', payload: 10 });

      // 解析文件
      const parser = new ElevatorDataParser();
      const elevatorData = await parser.parseFile(file);

      dispatch({ type: 'SET_PARSE_PROGRESS', payload: 90 });
      setUploadMessage('解析完成，正在加载数据...');

      // 设置数据
      dispatch({ type: 'SET_DATA', payload: elevatorData });
      dispatch({ type: 'SET_PARSE_PROGRESS', payload: 100 });

      setUploadStatus('success');
      setUploadMessage(`成功解析文件: ${file.name}`);

      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('文件上传失败:', error);
      const errorMessage = error instanceof Error ? error.message : '文件上传失败';
      setUploadStatus('error');
      setUploadMessage(errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };



  // 清除数据
  const handleClearData = () => {
    dispatch({ type: 'CLEAR_DATA' });
    setUploadStatus('idle');
    setUploadMessage('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">数据导入</h1>
        <p className="text-gray-600">
          上传电梯控制系统的TXT数据文件进行解析和分析
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* TXT文件上传区域 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <DocumentArrowUpIcon className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">TXT数据文件</h2>
          </div>

          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : state.currentData
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={state.isLoading}
            />

            <div className="space-y-4">
              {state.currentData ? (
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto" />
              ) : (
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto" />
              )}

              <div>
                <p className="text-lg font-medium text-gray-900">
                  {state.currentData ? '数据已加载' : '拖拽文件到此处或点击上传'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  支持 .txt 格式，最大 50MB
                </p>
              </div>

              {state.currentData && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="text-sm space-y-1">
                    <div><strong>文件名:</strong> {state.currentData.fileName}</div>
                    <div><strong>文件大小:</strong> {state.currentData.fileSize}</div>
                    <div><strong>解析时间:</strong> {state.currentData.parseTime}</div>
                    <div><strong>比特数据:</strong> {state.currentData.bitData.length} 条</div>
                    <div><strong>25ms数据:</strong> {state.currentData.data25ms.length} 条</div>
                    <div><strong>50ms数据:</strong> {state.currentData.data50ms.length} 条</div>
                    <div><strong>快照数据:</strong> {state.currentData.snapshotData.length} 条</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {state.currentData && (
            <button
              onClick={handleClearData}
              className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              清除数据
            </button>
          )}
        </div>


      </div>

      {/* 状态消息 */}
      {uploadMessage && (
        <div className={`mt-6 p-4 rounded-lg flex items-center ${
          uploadStatus === 'success' ? 'bg-green-50 border border-green-200' :
          uploadStatus === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          {uploadStatus === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />}
          {uploadStatus === 'error' && <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />}
          {uploadStatus === 'uploading' && (
            <div className="w-5 h-5 mr-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
          <span className={`text-sm ${
            uploadStatus === 'success' ? 'text-green-700' :
            uploadStatus === 'error' ? 'text-red-700' :
            'text-blue-700'
          }`}>
            {uploadMessage}
          </span>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">使用说明</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start">
            <span className="font-medium text-gray-900 mr-2">1.</span>
            <span>首先上传TXT数据文件，系统将自动解析比特数据、25ms数据、50ms数据和快照数据</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium text-gray-900 mr-2">2.</span>
            <span>数据解析完成后，可通过左侧导航栏访问各个数据页面进行查看和分析</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium text-gray-900 mr-2">3.</span>
            <span>支持数据导出功能，可将分析结果导出为CSV或Excel格式</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium text-gray-900 mr-2">4.</span>
            <span>系统内置信号配置，自动提供信号描述和解释</span>
          </div>
        </div>
      </div>
    </div>
  );
}