# 🏢 电梯控制系统数据跟踪分析工具 (Elevator Control System Data Tracking Tool)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-green.svg)](https://vitejs.dev/)

一个专门为电梯控制系统工程师和维护人员开发的数据跟踪分析工具。该工具能够高效解析和可视化电梯运行过程中的各种数据，帮助工程师快速诊断故障和优化系统性能。

## ✨ 功能特点

### 📊 多数据格式支持
- **比特数据 (0xD131)** - 实时比特信号显示和分析
- **25ms 数据分析** - 高精度时序数据监控 
- **50ms TRACE数据** - 系统运行轨迹跟踪
- **快照数据 (SNAPSHOT)** - 系统状态瞬时记录分析
- **驱动器数据** - 电机控制参数监控

### 🔍 智能分析功能
- 信号筛选和过滤
- 自动信号解释匹配
- 实时数据可视化
- 数据导出和报告生成
- 虚拟滚动优化大数据展示

### 🎨 用户体验
- 响应式设计，支持各种屏幕尺寸
- 现代化UI界面，基于Tailwind CSS
- 快速数据加载和渲染
- 直观的数据表格展示

## 🛠️ 技术栈

### 前端框架
- **React 18** - 现代化前端框架
- **TypeScript 5.8** - 类型安全的开发体验
- **Vite 6.3** - 快速构建工具
- **Tailwind CSS 3.4** - 实用优先的CSS框架
- **React Router 7.8** - 单页面应用路由

### 状态管理与工具
- **Zustand 5.0** - 轻量级状态管理
- **Chart.js 4.5** - 数据可视化图表
- **ESLint 9.25** - 代码质量检查

### 后端支持
- **Express 4.21** - 后端API服务
- **CORS 2.8** - 跨域资源共享
- **Nodemon 3.1** - 开发热重载

## 🚀 快速开始

### 环境要求
- Node.js 18.x 或更高版本
- npm 10.x 或更高版本

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/dudu03122783/trace-7.git
   cd trace-7
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   # 同时启动前后端服务器
   npm run dev
   
   # 或者分别启动
   npm run client:dev  # 前端开发服务器
   npm run server:dev  # 后端开发服务器
   ```

4. **访问应用**
   - 前端: http://localhost:5173
   - 后端API: http://localhost:3001

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📁 项目结构

```
trace-7/
├── src/
│   ├── components/          # 可复用UI组件
│   │   ├── Layout/         # 布局组件
│   │   ├── FileUpload.tsx  # 文件上传组件
│   │   └── VirtualScroll.tsx # 虚拟滚动组件
│   ├── pages/              # 页面组件
│   │   ├── DataImport.tsx  # 数据导入页面
│   │   ├── BitData.tsx     # 比特数据分析
│   │   ├── Data25ms.tsx    # 25ms数据分析
│   │   ├── Data50ms.tsx    # 50ms数据分析
│   │   └── SnapshotData.tsx # 快照数据分析
│   ├── context/            # React上下文
│   │   └── DataContext.tsx # 全局数据状态
│   ├── utils/              # 工具函数
│   │   ├── elevatorDataParser.ts # 电梯数据解析器
│   │   ├── driverDataParser.ts   # 驱动器数据解析器
│   │   └── xmlConfigParser.ts    # XML配置解析器
│   ├── hooks/              # 自定义React钩子
│   │   ├── useElevatorData.ts # 电梯数据钩子
│   │   └── useTheme.ts        # 主题钩子
│   └── types/              # TypeScript类型定义
├── api/                    # 后端API服务
│   ├── routes/            # API路由
│   ├── app.ts             # Express应用配置
│   └── server.ts          # 服务器启动文件
├── public/                 # 静态资源
└── docs/                   # 项目文档
```

## 📋 使用指南

### 1. 数据导入
1. 在数据导入页面选择要分析的数据文件
2. 支持的文件格式：`.txt`、`.xml`
3. 上传后系统自动解析并分类数据

### 2. 数据分析
- **比特数据分析**：查看32位数据的比特位状态
- **25ms/50ms数据**：分析时序数据和信号变化
- **快照数据**：检查系统状态瞬时记录
- **驱动器数据**：监控电机控制参数

### 3. 数据筛选
- 使用搜索框快速定位特定信号
- 支持信号名称和地址筛选
- 实时过滤显示结果

## 🤝 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- 使用 ESLint 进行代码检查
- 遵循 TypeScript 最佳实践
- 编写清晰的提交信息
- 为新功能添加相应的测试

## 📝 更新日志

### v1.0.0 (2024-08-26)
- ✨ 初始版本发布
- 🎉 支持多种电梯数据格式解析
- 🎨 现代化UI界面
- ⚡ 高性能数据渲染

## 🐛 问题反馈

如果您发现任何问题或有改进建议，请：
1. 在 [Issues](https://github.com/dudu03122783/trace-7/issues) 页面创建新问题
2. 提供详细的问题描述和复现步骤
3. 包含相关的错误日志或截图

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👨‍💻 作者

- **dudu03122783** - *初始开发* - [GitHub](https://github.com/dudu03122783)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

<div align="center">
  Made with ❤️ for elevator control system engineers
</div>
