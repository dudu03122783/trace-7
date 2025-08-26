import React, { useRef } from 'react';
import { useData } from '../context/DataContext';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setFileContent, setFileName } = useData();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      setFileContent(content);
      setFileName(file.name);
      
      if (onFileSelect) {
        onFileSelect(file);
      }
    } catch (error) {
      console.error('读取文件失败:', error);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.log,.dat"
      />
      <Upload className="w-12 h-12 text-gray-400 mb-4" />
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        选择文件
      </button>
      <p className="text-sm text-gray-500 mt-2">
        支持 .txt, .log, .dat 格式文件
      </p>
    </div>
  );
}

export default FileUpload;