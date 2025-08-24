// XML配置解析器
import { XMLConfig, AuxSubTableItem } from '../types';

export class XMLConfigParser {
  // 解析XML配置文件
  parseXMLConfig(xmlContent: string): XMLConfig {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      // 检查解析错误
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('XML解析失败: ' + parseError.textContent);
      }
      
      const items: AuxSubTableItem[] = [];
      
      const auxItems = xmlDoc.querySelectorAll('AuxSubTableItem');
      auxItems.forEach(item => {
        items.push({
          libId: item.getAttribute('libId') || '',
          tableCode: item.getAttribute('tableCode') || '',
          orderNo: parseInt(item.getAttribute('orderNo') || '0'),
          startPos: parseInt(item.getAttribute('startPos') || '0'),
          startCount: parseInt(item.getAttribute('startCount') || '0'),
          itemCode: item.getAttribute('itemCode') || '',
          itemName: item.getAttribute('itemName') || '',
          converterId: item.getAttribute('converterId') || '',
          converterParam: item.getAttribute('converterParam') || undefined
        });
      });
      
      return {
        items,
        tableCodeMap: this.createTableCodeMap(items),
        itemCodeMap: this.createItemCodeMap(items)
      };
    } catch (error) {
      console.error('XML配置解析失败:', error);
      throw new Error('XML配置文件解析失败: ' + (error as Error).message);
    }
  }

  // 从文件加载XML配置
  async loadXMLConfigFromFile(file: File): Promise<XMLConfig> {
    try {
      const content = await this.readFileContent(file);
      return this.parseXMLConfig(content);
    } catch (error) {
      console.error('XML文件加载失败:', error);
      throw new Error('XML文件加载失败: ' + (error as Error).message);
    }
  }

  // 从URL加载XML配置
  async loadXMLConfigFromURL(url: string): Promise<XMLConfig> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }
      const content = await response.text();
      return this.parseXMLConfig(content);
    } catch (error) {
      console.error('XML配置加载失败:', error);
      throw new Error('XML配置加载失败: ' + (error as Error).message);
    }
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

  // 创建tableCode映射
  private createTableCodeMap(items: AuxSubTableItem[]): Map<string, AuxSubTableItem[]> {
    const map = new Map<string, AuxSubTableItem[]>();
    items.forEach(item => {
      if (!map.has(item.tableCode)) {
        map.set(item.tableCode, []);
      }
      map.get(item.tableCode)!.push(item);
    });
    return map;
  }

  // 创建itemCode映射
  private createItemCodeMap(items: AuxSubTableItem[]): Map<string, AuxSubTableItem> {
    const map = new Map<string, AuxSubTableItem>();
    items.forEach(item => {
      map.set(item.itemCode, item);
    });
    return map;
  }

  // 获取信号描述（已废弃，现在直接在DataContext中通过索引获取）
  getSignalDescription(signalName: string, xmlConfig: XMLConfig): string {
    // 这个方法已经不再使用，因为现在直接通过orderNo索引获取itemCode
    return '未知信号';
  }

  // 验证XML文件格式
  static validateXMLFile(file: File): { isValid: boolean; error?: string } {
    // 检查文件扩展名
    if (!file.name.toLowerCase().endsWith('.xml')) {
      return { isValid: false, error: '请选择XML格式的文件' };
    }
    
    // 检查文件大小 (限制为10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { isValid: false, error: 'XML文件大小不能超过10MB' };
    }
    
    // 检查文件是否为空
    if (file.size === 0) {
      return { isValid: false, error: 'XML文件不能为空' };
    }
    
    return { isValid: true };
  }

  // 获取配置统计信息
  getConfigStats(xmlConfig: XMLConfig): {
    totalItems: number;
    tableCount: number;
    topTables: Array<{ tableCode: string; count: number }>;
  } {
    const totalItems = xmlConfig.items.length;
    const tableCount = xmlConfig.tableCodeMap.size;
    
    const tableCounts = Array.from(xmlConfig.tableCodeMap.entries())
      .map(([tableCode, items]) => ({ tableCode, count: items.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalItems,
      tableCount,
      topTables: tableCounts
    };
  }
}