// 驱动段数据解析器
import { 
  DriverData, 
  DriverBitSignal, 
  DriverNumericData, 
  DriverSnapshotData,
  DriverSections 
} from '../types';
import { isInvertedSignal } from './xmlConfig';

export class DriverDataParser {
  private startTime: number = 0;

  // 主解析方法
  async parseDriverData(content: string): Promise<DriverData> {
    this.startTime = Date.now();
    
    // 查找驱动段开始位置
    const driverMatch = content.match(/驱动[\s\S]*$/);
    if (!driverMatch) {
      throw new Error('未找到驱动段数据');
    }

    const driverContent = driverMatch[0];
    const sections = this.splitDriverSections(driverContent);
    
    return {
      timestamp: this.extractDriverTimestamp(driverContent),
      deviceInfo: 'driver',
      bit5msData: this.parseDriverBitSection(sections.bit5ms, '5ms'),
      bit10msData: this.parseDriverBitSection(sections.bit10ms, '10ms'),
      bit50msData: this.parseDriverBitSection(sections.bit50ms, '50ms'),
      numeric5msData: this.parseDriverNumericSection(sections.numeric5ms, '5ms'),
      numeric10msData: this.parseDriverNumericSection(sections.numeric10ms, '10ms'),
      numeric50msData: this.parseDriverNumericSection(sections.numeric50ms, '50ms'),
      snapshotData: this.parseDriverSnapshotSection(sections.snapshot)
    };
  }

  // 分割驱动段各个子段
  private splitDriverSections(content: string): DriverSections {
    const sections: DriverSections = {
      bit5ms: '',
      bit10ms: '',
      bit50ms: '',
      numeric5ms: '',
      numeric10ms: '',
      numeric50ms: '',
      snapshot: ''
    };

    // 使用正则表达式提取各个数据段
    const bit5msMatch = content.match(/比特5ms[\s\S]*?(?=比特10ms|比特50ms|数值5ms|数值10ms|数值50ms|快照|管理|$)/);
    const bit10msMatch = content.match(/比特10ms[\s\S]*?(?=比特50ms|数值5ms|数值10ms|数值50ms|快照|管理|$)/);
    const bit50msMatch = content.match(/比特50ms[\s\S]*?(?=数值5ms|数值10ms|数值50ms|快照|管理|$)/);
    const numeric5msMatch = content.match(/数值5ms[\s\S]*?(?=数值10ms|数值50ms|快照|管理|$)/);
    const numeric10msMatch = content.match(/数值10ms[\s\S]*?(?=数值50ms|快照|管理|$)/);
    const numeric50msMatch = content.match(/数值50ms[\s\S]*?(?=快照|管理|$)/);
    const snapshotMatch = content.match(/快照[\s\S]*?(?=管理|$)/);

    if (bit5msMatch) sections.bit5ms = bit5msMatch[0];
    if (bit10msMatch) sections.bit10ms = bit10msMatch[0];
    if (bit50msMatch) sections.bit50ms = bit50msMatch[0];
    if (numeric5msMatch) sections.numeric5ms = numeric5msMatch[0];
    if (numeric10msMatch) sections.numeric10ms = numeric10msMatch[0];
    if (numeric50msMatch) sections.numeric50ms = numeric50msMatch[0];
    if (snapshotMatch) sections.snapshot = snapshotMatch[0];

    return sections;
  }

  // 提取驱动段时间戳
  private extractDriverTimestamp(content: string): string {
    const timestampMatch = content.match(/(\d{4}\/\d{1,2}\/\d{1,2}\s+星期[一二三四五六日]\s+[上下]午\s+\d{1,2}:\d{2}:\d{2})/);
    return timestampMatch ? timestampMatch[1] : new Date().toISOString();
  }

  // 解析驱动段比特数据
  private parseDriverBitSection(content: string, samplingRate: '5ms' | '10ms' | '50ms'): DriverBitSignal[] {
    if (!content) return [];
    
    const lines = content.split('\n').filter(line => line.trim());
    const signals: DriverBitSignal[] = [];
    let orderNo = 0;
    
    lines.forEach((line, lineIndex) => {
      if (lineIndex === 0 || !line.trim()) return; // 跳过标题行和空行
      
      // 解析比特数据行
      const parts = line.trim().split(/\s+/);
      
      if (parts.length >= 10) {
        // 标准两组数据格式
        this.addDriverBitSignal(signals, parts[0], parts.slice(1, 5), orderNo++, samplingRate);
        
        // 查找第二个信号名
        const secondSignalIndex = this.findSecondSignalIndex(parts, 5);
        if (secondSignalIndex === 5) {
          this.addDriverBitSignal(signals, parts[5], parts.slice(6, 10), orderNo++, samplingRate);
        }
      } else if (parts.length >= 5) {
        // 单组数据格式
        this.addDriverBitSignal(signals, parts[0], parts.slice(1), orderNo++, samplingRate);
      }
    });
    
    return signals;
  }

  // 查找第二个信号名的索引位置
  private findSecondSignalIndex(parts: string[], startIndex: number): number {
    for (let i = startIndex; i < parts.length; i++) {
      if (parts[i].startsWith('*-') || this.isSignalName(parts[i])) {
        return i;
      }
    }
    return -1;
  }

  // 添加驱动段比特信号到数组
  private addDriverBitSignal(
    signals: DriverBitSignal[], 
    signalName: string, 
    hexData: string[], 
    orderNo: number, 
    samplingRate: '5ms' | '10ms' | '50ms'
  ): void {
    // 检查信号反转标记
    const invertFlag = isInvertedSignal(signalName) ? '*-' : null;
    const cleanSignalName = signalName.replace(/^\*-/, '');
    
    // 确保有4个十六进制数据（32位）
    const paddedHexData = [...hexData];
    while (paddedHexData.length < 4) {
      paddedHexData.push('00000000');
    }
    
    signals.push({
      orderNo,
      signalName: cleanSignalName,
      invertFlag,
      description: '', // 描述将在DataContext中动态获取
      binaryData: this.hexToBinary(paddedHexData.join(' ')),
      isActive: this.checkSignalActive(paddedHexData),
      hexValue: paddedHexData.join(' '),
      samplingRate
    });
  }

  // 判断是否为信号名
  private isSignalName(str: string): boolean {
    // 信号名通常以字母开头，包含字母、数字、下划线、点号
    return /^[A-Za-z][A-Za-z0-9_\.]*$/.test(str.replace(/^\*-/, ''));
  }

  // 解析驱动段数值数据
  private parseDriverNumericSection(content: string, dataType: '5ms' | '10ms' | '50ms'): DriverNumericData[] {
    if (!content) return [];
    
    const lines = content.split('\n').filter(line => line.trim());
    const data: DriverNumericData[] = [];
    
    // 跳过段标题行（如"数值5ms"）和序号标题行（如"1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16"），从第2行开始处理数据
    for (let i = 2; i < lines.length; i += 2) {
      if (i + 1 < lines.length) {
        // 第一行：信号名 + 16个数据
        const firstLine = lines[i].trim().split(/\s+/);
        // 第二行：可能包含信号名 + 16个数据，或者只有16个数据
        const secondLineParts = lines[i + 1].trim().split(/\s+/);
        
        if (firstLine.length >= 2) {
          const signalName = firstLine[0].replace(/^\*-/, ''); // 移除反转标记
          const firstRowData = firstLine.slice(1); // 第一行的数据
          
          // 处理第二行数据
          let secondRowData: string[];
          
          // 检查第二行是否以相同的信号名开头（可能带有*-前缀）
          const cleanSecondLineFirstPart = secondLineParts[0]?.replace(/^\*-/, '');
          if (cleanSecondLineFirstPart === signalName) {
            // 第二行包含重复的信号名，跳过信号名，只取数据部分
            secondRowData = secondLineParts.slice(1);
          } else {
            // 第二行只有数据，直接使用
            secondRowData = secondLineParts;
          }
          
          // 合并两行数据，总共32个数据
          const allHexValues = [...firstRowData, ...secondRowData];
          
          // 确保有32个数据
          while (allHexValues.length < 32) {
            allHexValues.push('0000');
          }
          
          // 只取前32个数据
          const hexValues = allHexValues.slice(0, 32);
          
          data.push({
            signalName,
            hexValues,
            dataType,
            unit: 'hex',
            samplingRate: this.getSamplingRateHz(dataType)
          });
        }
      }
    }
    
    return data;
  }

  // 解析驱动段快照数据
  private parseDriverSnapshotSection(content: string): DriverSnapshotData[] {
    if (!content.trim()) return [];
    
    const lines = content.split('\n').filter(line => line.trim());
    const snapshots: DriverSnapshotData[] = [];
    let orderNo = 0;
    
    lines.forEach((line, lineIndex) => {
      if (lineIndex === 0 || !line.trim()) return; // 跳过标题行和空行
      
      // 解析一行中的多组数据：信号名1 数据1 信号名2 数据2 ...
      const parts = line.trim().split(/\s+/);
      
      // 每两个部分组成一个快照项
      for (let i = 0; i < parts.length; i += 2) {
        if (i + 1 < parts.length) {
          const signalName = parts[i];
          const dataValue = parts[i + 1];
          
          snapshots.push({
            timestamp: new Date().toISOString(),
            name: signalName,
            description: '', // 描述将在DataContext中动态获取
            data: dataValue,
            category: 'driver_snapshot',
            orderNo: orderNo++
          });
        }
      }
    });
    
    return snapshots;
  }

  // 获取采样频率（Hz）
  private getSamplingRateHz(dataType: '5ms' | '10ms' | '50ms'): number {
    switch (dataType) {
      case '5ms': return 200; // 5ms = 200Hz
      case '10ms': return 100; // 10ms = 100Hz  
      case '50ms': return 20;  // 50ms = 20Hz
      default: return 20;
    }
  }

  // 将十六进制转换为32位二进制字符串
  private hexToBinary(hex: string): string {
    try {
      // 移除空格，分割成4个8位十六进制数据
      const hexParts = hex.trim().split(/\s+/);
      let binaryResult = '';
      
      // 处理每个8位十六进制数据，每个转换为8位二进制
      for (let i = 0; i < 4; i++) {
        const hexPart = hexParts[i] || '00000000';
        const cleanHex = hexPart.replace(/[^0-9A-Fa-f]/g, '').padStart(8, '0').substring(0, 8);
        
        // 将8位十六进制转换为8位二进制
        const decimal = parseInt(cleanHex, 16);
        const binary = decimal.toString(2).padStart(8, '0');
        binaryResult += binary;
      }
      
      // 返回32位二进制字符串
      return binaryResult.padStart(32, '0').substring(0, 32);
    } catch (error) {
      console.warn('十六进制转二进制失败:', hex, error);
      return '00000000000000000000000000000000';
    }
  }

  // 检查信号是否激活
  private checkSignalActive(hexData: string[]): boolean {
    try {
      return hexData.some(hex => {
        const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
        return cleanHex && parseInt(cleanHex, 16) > 0;
      });
    } catch (error) {
      console.warn('信号状态检查失败:', hexData, error);
      return false;
    }
  }

  // 验证驱动段数据是否存在
  static hasDriverData(content: string): boolean {
    return /驱动[\s\S]*?比特5ms|比特10ms|比特50ms|数值5ms|数值10ms|数值50ms/.test(content);
  }
}