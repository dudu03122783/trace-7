// 数据状态管理Context
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { DataStore, DataAction, ElevatorData, XMLConfig } from '../types';
import { XMLConfigParser } from '../utils/xmlConfigParser';

// 初始状态
const initialState: DataStore = {
  currentData: null,
  xmlConfig: null,
  isLoading: false,
  error: null,
  parseProgress: 0,
  selectedSignals: []
};

// Reducer函数
function dataReducer(state: DataStore, action: DataAction): DataStore {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        currentData: action.payload,
        isLoading: false,
        error: null,
        parseProgress: 100
      };
    
    case 'SET_XML_CONFIG':
      return {
        ...state,
        xmlConfig: action.payload,
        error: null
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        parseProgress: 0
      };
    
    case 'SET_PROGRESS':
      return {
        ...state,
        parseProgress: Math.max(0, Math.min(100, action.payload))
      };
    
    case 'SET_PARSE_PROGRESS':
      return {
        ...state,
        parseProgress: action.payload
      };
    
    case 'SELECT_SIGNALS':
      return {
        ...state,
        selectedSignals: action.payload
      };
    
    case 'CLEAR_DATA':
      return {
        ...initialState,
        xmlConfig: state.xmlConfig // 保留XML配置
      };
    
    default:
      return state;
  }
}

// Context类型
interface DataContextType {
  state: DataStore;
  dispatch: React.Dispatch<DataAction>;
  // 便捷方法
  setData: (data: ElevatorData) => void;
  setXMLConfig: (config: XMLConfig) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setProgress: (progress: number) => void;
  selectSignals: (signals: string[]) => void;
  clearData: () => void;
  // 数据获取方法
  getBitData: () => any[];
  getMs25Data: () => any[];
  getMs50Data: () => any[];
  getSnapshotData: () => any[];
  getSnapshotDataWithDescription: () => any[];
  getSignalDescription: (signalName: string, orderIndex?: number, tableCode?: string) => string;
}

// 创建Context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider组件
interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // 自动加载内置XML配置
  useEffect(() => {
    const loadBuiltinXMLConfig = async () => {
      try {
        console.log('开始加载内置XML配置...');
        // 加载内置的AuxSubTableItem.xml文件
        const response = await fetch('/AuxSubTableItem.xml');
        if (!response.ok) {
          throw new Error(`加载XML配置失败: ${response.status}`);
        }
        const xmlText = await response.text();
        console.log('XML文件加载成功，大小:', xmlText.length);
        
        // 解析XML配置
        const xmlConfigParser = new XMLConfigParser();
        const xmlConfig = xmlConfigParser.parseXMLConfig(xmlText);
        console.log('XML配置解析成功，项目数量:', xmlConfig.items.length);
        
        // 设置XML配置到状态中
        setXMLConfig(xmlConfig);
        console.log('XML配置已加载到DataContext');
      } catch (error) {
        console.error('加载内置XML配置失败:', error);
        setError(`加载XML配置失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    };

    // 只在xmlConfig为空时加载
    if (!state.xmlConfig) {
      loadBuiltinXMLConfig();
    }
  }, [state.xmlConfig]);

  // 便捷方法
  const setData = (data: ElevatorData) => {
    dispatch({ type: 'SET_DATA', payload: data });
  };

  const setXMLConfig = (config: XMLConfig) => {
    dispatch({ type: 'SET_XML_CONFIG', payload: config });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setProgress = (progress: number) => {
    dispatch({ type: 'SET_PROGRESS', payload: progress });
  };

  const selectSignals = (signals: string[]) => {
    dispatch({ type: 'SELECT_SIGNALS', payload: signals });
  };

  const clearData = () => {
    dispatch({ type: 'CLEAR_DATA' });
  };

  // 数据获取方法
  const getBitData = () => {
    if (!state.currentData) return [];
    
    return state.currentData.bitData.map((signal, index) => ({
      ...signal,
      description: getSignalDescription(signal.signalName, index)
    }));
  };

  const getMs25Data = () => {
    return state.currentData?.data25ms || [];
  };

  const getMs50Data = () => {
    return state.currentData?.data50ms || [];
  };

  const getSnapshotData = () => {
    return state.currentData?.snapshotData || [];
  };

  const getSnapshotDataWithDescription = () => {
    if (!state.currentData) return [];
    
    return state.currentData.snapshotData.map((snapshot, index) => ({
      ...snapshot,
      description: getSignalDescription(snapshot.name, snapshot.orderNo, '0xD132数据内容(SNATSHOT)')
    })).sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0));
  };

  const getSignalDescription = (signalName: string, orderIndex?: number, tableCode?: string): string => {
    if (!state.xmlConfig || !signalName) {
      console.log('getSignalDescription: xmlConfig未加载或signalName为空', { xmlConfig: !!state.xmlConfig, signalName });
      return '未知信号';
    }
    
    try {
      // 根据tableCode确定要查找的配置项
      let targetTableCode = tableCode;
      if (!targetTableCode) {
        // 如果没有指定tableCode，根据信号名推断
        if (signalName.includes('50ms') || signalName.includes('TRACE')) {
          targetTableCode = '50ms TRACE';
        } else {
          targetTableCode = '0xD131数据内容';
        }
      }
      
      console.log('getSignalDescription: 查找配置', { signalName, orderIndex, targetTableCode });
      
      // 获取对应tableCode的配置项
      const configItems = state.xmlConfig.items.filter(item => 
        item.tableCode === targetTableCode
      ).sort((a, b) => a.orderNo - b.orderNo);
      
      console.log(`getSignalDescription: 找到${targetTableCode}配置项数量:`, configItems.length);
      
      // 如果提供了orderIndex，直接使用索引获取
      if (typeof orderIndex === 'number') {
        if (configItems[orderIndex]) {
          const result = configItems[orderIndex].itemCode || '未知信号';
          console.log('getSignalDescription: 通过orderIndex找到描述', { orderIndex, result });
          return result;
        } else {
          console.log('getSignalDescription: orderIndex超出范围', { orderIndex, maxIndex: configItems.length - 1 });
        }
      }
      
      // 对于50ms TRACE，尝试通过信号名匹配
      if (targetTableCode === '50ms TRACE') {
        // 提取信号名的前缀部分（空格前的部分）
        const signalPrefix = signalName.split(' ')[0];
        console.log('getSignalDescription: 50ms TRACE信号前缀', { signalName, signalPrefix });
        
        // 查找匹配的配置项
        for (const item of configItems) {
          const itemPrefix = item.itemCode.split(' ')[0];
          if (itemPrefix === signalPrefix) {
            console.log('getSignalDescription: 找到匹配的50ms TRACE配置', { signalPrefix, itemCode: item.itemCode });
            return item.itemCode;
          }
        }
        
        console.log('getSignalDescription: 未找到匹配的50ms TRACE配置', { signalPrefix, availablePrefixes: configItems.map(item => item.itemCode.split(' ')[0]) });
      }
      
      // 对于快照数据，通过信号名直接匹配
      if (targetTableCode === '0xD132数据内容(SNATSHOT)') {
        console.log('getSignalDescription: 查找快照数据配置', { signalName, configItemsCount: configItems.length });
        
        // 直接通过信号名匹配
        const item = configItems.find(item => item.itemName === signalName);
        if (item) {
          console.log('getSignalDescription: 找到匹配的快照数据配置', { signalName, itemCode: item.itemCode });
          return item.itemCode;
        }
        
        // 如果提供了orderIndex，使用索引获取
        if (typeof orderIndex === 'number' && configItems[orderIndex]) {
          const result = configItems[orderIndex].itemCode || '未知信号';
          console.log('getSignalDescription: 通过orderIndex找到快照数据描述', { orderIndex, result });
          return result;
        }
        
        console.log('getSignalDescription: 未找到匹配的快照数据配置', { signalName, availableItems: configItems.map(item => item.itemName) });
      }
      
      // 对于比特数据，尝试通过orderNo匹配（从信号名中提取NO）
      if (targetTableCode === '0xD131数据内容') {
        const orderNoMatch = signalName.match(/NO(\d+)/);
        if (orderNoMatch) {
          const orderNo = parseInt(orderNoMatch[1]);
          const item = configItems.find(item => item.orderNo === orderNo);
          if (item) {
            console.log('getSignalDescription: 通过orderNo找到比特数据描述', { orderNo, itemCode: item.itemCode });
            return item.itemCode;
          }
        }
      }
      
      console.log('getSignalDescription: 未找到匹配的配置项');
      return '未知信号';
    } catch (error) {
      console.warn('获取信号描述失败:', signalName, error);
      return '未知信号';
    }
  };

  const value: DataContextType = {
    state,
    dispatch,
    setData,
    setXMLConfig,
    setLoading,
    setError,
    setProgress,
    selectSignals,
    clearData,
    getBitData,
    getMs25Data,
    getMs50Data,
    getSnapshotData,
    getSnapshotDataWithDescription,
    getSignalDescription
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// Hook for using the context
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// 选择器Hook
export function useDataSelector<T>(selector: (state: DataStore) => T): T {
  const { state } = useData();
  return selector(state);
}

// 常用选择器
export const useCurrentData = () => useDataSelector(state => state.currentData);
export const useXMLConfig = () => useDataSelector(state => state.xmlConfig);
export const useIsLoading = () => useDataSelector(state => state.isLoading);
export const useError = () => useDataSelector(state => state.error);
export const useParseProgress = () => useDataSelector(state => state.parseProgress);
export const useSelectedSignals = () => useDataSelector(state => state.selectedSignals);