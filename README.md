# 电梯控制系统数据跟踪分析工具

这是一个用于电梯控制系统数据跟踪和分析的工具，基于React、TypeScript和Vite构建。

## 功能特点

- 支持多种数据格式的导入和解析
- 比特数据（0xD131）显示和分析
- 50ms TRACE数据显示和分析
- 快照数据（SNAPSHOT）显示和分析
- 信号筛选和过滤功能
- 信号解释自动匹配

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

## 开发环境设置

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

- `/src/pages` - 页面组件
- `/src/components` - 可复用组件
- `/src/context` - React上下文
- `/src/utils` - 工具函数
- `/src/hooks` - 自定义React钩子
- `/public` - 静态资源

## 数据格式

项目支持解析多种电梯控制系统数据格式，包括：

- 比特数据
- 50ms TRACE数据
- 快照数据

## 许可证

MIT
