// 电梯数据解析器
import { ElevatorData, BitSignal, NumericData, SnapshotData, DataSections, DriverData } from '../types';
import { getSignalConfig, isInvertedSignal } from './xmlConfig';
import { DriverDataParser } from './driverDataParser';

export class ElevatorDataParser {
  private startTime: number = 0;

  // 主解析方法
  async parseFile(file: File): Promise<ElevatorData> {
    this.startTime = Date.now();
    const content = await this.readFileContent(file);
    const sections = this.splitIntoSections(content);
    
    // 检查是否包含驱动段数据
    let driverData: DriverData | undefined;
    if (DriverDataParser.hasDriverData(content)) {
      try {
        const driverParser = new DriverDataParser();
        driverData = await driverParser.parseDriverData(content);
        console.log('驱动段数据解析成功:', driverData);
      } catch (error) {
        console.warn('驱动段数据解析失败:', error);
      }
    }
    
    return {
      fileName: file.name,
      timestamp: new Date().toISOString(),
      fileSize: this.formatFileSize(file.size),
      controlInfo: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        deviceId: 'unknown',
        raw: sections.control || ''
      },
      bitData: this.parseBitSection(sections.bit),
      data25ms: this.parseMs25Section(sections.ms25),
      data50ms: this.parseMs50Section(sections.ms50),
      snapshotData: this.parseSnapshotSection(sections.snapshot),
      driverData,
      parseTime: Date.now() - this.startTime
    };
  }

  // 读取文件内容
  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'utf-8');
    });
  }

  // 分割数据段
  private splitIntoSections(content: string): DataSections {
    const sections: DataSections = {
      control: '',
      bit: '',
      ms25: '',
      ms50: '',
      snapshot: ''
    };
    
    // 根据标识符分割数据段
    const controlMatch = content.match(/控制[\s\S]*?(?=比特|数值25ms|数值50ms|快照|$)/);
    const bitMatch = content.match(/比特[\s\S]*?(?=数值25ms|数值50ms|快照|$)/);
    const ms25Match = content.match(/数值25ms[\s\S]*?(?=数值50ms|快照|$)/);
    const ms50Match = content.match(/数值50ms[\s\S]*?(?=快照|$)/);
    const snapshotMatch = content.match(/快照[\s\S]*$/);
    
    if (controlMatch) sections.control = controlMatch[0];
    if (bitMatch) sections.bit = bitMatch[0];
    if (ms25Match) sections.ms25 = ms25Match[0];
    if (ms50Match) sections.ms50 = ms50Match[0];
    if (snapshotMatch) sections.snapshot = snapshotMatch[0];
    
    return sections;
  }

  // 解析控制信息段
  private parseControlSection(content: string): string {
    if (!content) return '';
    
    // 提取控制信息的关键内容
    const lines = content.split('\n').filter(line => line.trim());
    const controlInfo = lines.slice(1, 5).join('\n'); // 取前几行作为控制信息
    
    return controlInfo || '无控制信息';
  }

  // 解析比特数据段 - 支持一行包含两组数据的格式
  private parseBitSection(content: string): BitSignal[] {
    if (!content) return [];
    
    const lines = content.split('\n').filter(line => line.trim());
    const signals: BitSignal[] = [];
    let orderNo = 0;
    
    lines.forEach((line, lineIndex) => {
      if (lineIndex === 0 || !line.trim()) return; // 跳过标题行和空行
      
      // 解析一行中的两组数据
      // 格式: SN_29 00000000 00000000 00000000 00000000 *-SS_29LT 00000000 00000000 00000011 11111111
      const parts = line.trim().split(/\s+/);
      
      if (parts.length >= 10) { // 至少需要两个信号名 + 8个十六进制数据
        // 查找第二个信号名的位置（以*-开头或者是已知的信号名）
        let secondSignalIndex = -1;
        for (let i = 5; i < parts.length; i++) {
          if (parts[i].startsWith('*-') || this.isSignalName(parts[i])) {
            secondSignalIndex = i;
            break;
          }
        }
        
        if (secondSignalIndex > 0 && secondSignalIndex === 5) {
          // 标准格式：第一个信号名 + 4个十六进制数据 + 第二个信号名 + 4个十六进制数据
          // 解析第一组数据
          const firstSignalName = parts[0];
          const firstHexData = parts.slice(1, 5); // 取4个十六进制数据
          this.addBitSignal(signals, firstSignalName, firstHexData, orderNo++);
          
          // 解析第二组数据
          const secondSignalName = parts[5];
          const secondHexData = parts.slice(6, 10); // 取4个十六进制数据
          this.addBitSignal(signals, secondSignalName, secondHexData, orderNo++);
        } else {
          // 如果没有找到标准格式的第二个信号，按原来的方式解析
          const signalName = parts[0];
          const hexData = parts.slice(1);
          this.addBitSignal(signals, signalName, hexData, orderNo++);
        }
      } else if (parts.length >= 2) {
        // 单个信号的情况
        const signalName = parts[0];
        const hexData = parts.slice(1);
        this.addBitSignal(signals, signalName, hexData, orderNo++);
      }
    });
    
    return signals;
  }
  
  // 添加比特信号到数组
  private addBitSignal(signals: BitSignal[], signalName: string, hexData: string[], orderNo: number): void {
    // 检查信号反转标记
    const invertFlag = isInvertedSignal(signalName) ? '*-' : null;
    const cleanSignalName = signalName.replace(/^\*-/, '');
    
    // 不在解析时设置描述，让DataContext的getBitData方法动态获取
    const description = '';
    
    // 确保有4个十六进制数据（32位）
    const paddedHexData = [...hexData];
    while (paddedHexData.length < 4) {
      paddedHexData.push('00000000');
    }
    
    signals.push({
      orderNo,
      signalName: cleanSignalName,
      invertFlag,
      description,
      binaryData: this.hexToBinary(paddedHexData.join(' ')),
      isActive: this.checkSignalActive(paddedHexData),
      hexValue: paddedHexData.join(' ')
    });
  }
  
  // 判断是否为信号名
  private isSignalName(str: string): boolean {
    // 信号名通常以字母开头，包含字母、数字、下划线
    return /^[A-Za-z][A-Za-z0-9_]*$/.test(str.replace(/^\*-/, ''));
  }

  // 解析25ms数据段
  private parseMs25Section(content: string): NumericData[] {
    return this.parseNumericSection(content, '25ms');
  }

  // 解析50ms数据段
  private parseMs50Section(content: string): NumericData[] {
    return this.parseNumericSection(content, '50ms');
  }

  // 解析数值数据的通用方法
  private parseNumericSection(content: string, dataType: '25ms' | '50ms'): NumericData[] {
    if (!content) return [];
    
    const lines = content.split('\n').filter(line => line.trim());
    const data: NumericData[] = [];
    
    lines.forEach((line, index) => {
      if (index === 0 || !line.trim()) return; // 跳过标题行和空行
      
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const signalName = parts[0];
        const hexValues = parts.slice(1);
        
        data.push({
          signalName,
          hexValues,
          dataType,
          unit: 'hex'
        });
      }
    });
    
    return data;
  }

  // 解析快照数据段 - 支持固定格式：一行4组数据（信号名+数据值）
  private parseSnapshotSection(content: string): SnapshotData[] {
    if (!content.trim()) return [];
    
    const lines = content.split('\n').filter(line => line.trim());
    const snapshots: SnapshotData[] = [];
    let orderNo = 0;
    
    lines.forEach((line, lineIndex) => {
      if (lineIndex === 0 || !line.trim()) return; // 跳过标题行和空行
      
      // 解析一行中的4组数据：信号名1 数据1 信号名2 数据2 信号名3 数据3 信号名4 数据4
      const parts = line.trim().split(/\s+/);
      
      // 每行应该有8个部分（4组信号名+数据值）
      if (parts.length >= 8) {
        for (let i = 0; i < parts.length; i += 2) {
          if (i + 1 < parts.length) {
            const signalName = parts[i];
            const dataValue = parts[i + 1];
            
            snapshots.push({
              timestamp: new Date().toISOString(),
              name: signalName,
              description: '', // 描述将在DataContext中动态获取
              data: dataValue,
              category: 'snapshot',
              orderNo: orderNo++
            });
          }
        }
      } else if (parts.length >= 2) {
        // 处理不完整的行（少于4组数据）
        for (let i = 0; i < parts.length; i += 2) {
          if (i + 1 < parts.length) {
            const signalName = parts[i];
            const dataValue = parts[i + 1];
            
            snapshots.push({
              timestamp: new Date().toISOString(),
              name: signalName,
              description: '', // 描述将在DataContext中动态获取
              data: dataValue,
              category: 'snapshot',
              orderNo: orderNo++
            });
          }
        }
      }
    });
    
    return snapshots;
  }

  // 直接返回十六进制字符（不转换）
  private hexToBinary(hex: string): string {
    try {
      // 移除空格，直接返回十六进制字符串
      const cleanHex = hex.replace(/\s+/g, '').replace(/[^0-9A-Fa-f]/g, '');
      if (!cleanHex) return '00000000000000000000000000000000';
      
      // 确保长度为32位，不足的用0补齐
      return cleanHex.padStart(32, '0').substring(0, 32);
    } catch (error) {
      console.warn('十六进制处理失败:', hex, error);
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

  // 格式化文件大小
  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // 验证文件格式
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // 检查文件扩展名
    if (!file.name.toLowerCase().endsWith('.txt')) {
      return { isValid: false, error: '请选择TXT格式的文件' };
    }
    
    // 检查文件大小 (限制为50MB)
    if (file.size > 50 * 1024 * 1024) {
      return { isValid: false, error: '文件大小不能超过50MB' };
    }
    
    // 检查文件是否为空
    if (file.size === 0) {
      return { isValid: false, error: '文件不能为空' };
    }
    
    return { isValid: true };
  }
}