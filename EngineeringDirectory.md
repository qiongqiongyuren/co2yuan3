# 工程目录结构

```
├── client/                # 前端代码 (React + Vite)
│   ├── public/            # 静态资源,直接复制到构建目录
│   │   ├── geo/
│   │   │   └── region_150000.json # 地图组件的地理数据
│   │   └── Video/         # 视频资源
│   │       ├── 连贯动图已准备就绪.mp4
│   │       ├── 视频展示.mp4
│   │       ├── 视频展示1.mp4
│   │       ├── 视频展示1.zip
│   │       ├── 视频展示2.mp4
│   │       └── 视频展示2.zip
│   ├── src/               # 前端源码
│   │   ├── assets/        # 资源文件 (图片, 字体等)
│   │   ├── components/    # 可复用UI组件
│   │   │   ├── ChartAnalysis.jsx       # 图表分析组件
│   │   │   ├── ChartsGrid.jsx          # 图表网格布局
│   │   │   ├── DataCard.jsx            # 数据卡片
│   │   │   ├── DataEntryForm.jsx       # 数据录入表单
│   │   │   ├── DataEntryTab.jsx        # 数据录入标签页
│   │   │   ├── DataScreenRegionSelector.jsx # 数据筛选区域选择器
│   │   │   ├── ErrorBoundary.jsx       # 错误边界组件
│   │   │   ├── formFields.js           # 表单字段定义
│   │   │   ├── HistoricalDataTable.jsx # 历史数据表格
│   │   │   ├── InlineEditForm.jsx      # 行内编辑表单
│   │   │   ├── LoginForm.jsx           # 登录表单
│   │   │   ├── RegionSelector.jsx      # 区域选择器
│   │   │   ├── RegistrationForm.jsx    # 注册表单
│   │   │   ├── SearchBar.jsx           # 搜索栏
│   │   │   ├── StatCardsGrid.jsx       # 统计卡片网格
│   │   │   ├── TableRowDetail.jsx      # 表格行详情
│   │   │   ├── VideoBackground.jsx     # 视频背景组件
│   │   │   └── charts/                 # 图表组件目录
│   │   │       ├── AnnualChangeLineChart.jsx # 年度变化折线图
│   │   │       ├── DonutChart.jsx            # 甜甜圈图
│   │   │       ├── DualAxisChart.jsx         # 双轴图
│   │   │       ├── EmissionMapChart.jsx      # 排放地图
│   │   │       ├── EmissionPieChart.jsx      # 排放占比饼图
│   │   │       ├── IntensityBarChart.jsx     # 强度对比柱状图
│   │   │       ├── LineChart.jsx             # 折线图
│   │   │       ├── StackedAreaChart.jsx      # 堆叠面积图
│   │   │       ├── StackedBarChart.jsx       # 堆叠柱状图
│   │   │       └── YearlyEmissionBarChart.jsx# 年度排放柱状图
│   │   ├── context/       # React Context (全局状态管理)
│   │   │   ├── AppContext.js           # 应用级Context (JS版本)
│   │   │   └── AppContext.jsx          # 应用级Context (JSX版本)
│   │   ├── hooks/         # 自定义Hooks
│   │   │   ├── useCarbonData.js        # 碳数据相关Hook
│   │   │   ├── useDataScreen.js        # 数据筛选页面相关Hook
│   │   │   └── useRegions.js           # 区域数据相关Hook
│   │   ├── pages/         # 页面组件
│   │   │   ├── DashboardPage.jsx       # 仪表盘页面
│   │   │   ├── DataScreenPage.jsx      # 数据筛选页面
│   │   │   └── LoginPage.jsx           # 登录页面
│   │   ├── utils/         # 工具函数
│   │   │   └── emissionFactors.js      # 前端排放因子
│   │   ├── App.jsx        # 应用根组件
│   │   ├── index.css      # 全局样式
│   │   └── main.jsx       # 应用入口文件
│   ├── vite.config.js     # Vite 配置文件
│   ├── package.json       # 前端依赖和脚本
│   ├── package-lock.json  # 锁定前端依赖版本
│   └── index.html         # HTML 入口文件
│
├── server/                # 后端代码 (Node.js + Express)
│   ├── controllers/       # 控制器 (处理业务逻辑)
│   │   ├── auth.js        # 用户认证控制器
│   │   ├── carbonData.js  # 碳数据控制器
│   │   └── reports.js     # 报告控制器
│   ├── middleware/        # 中间件
│   │   └── auth.js        # 身份验证中间件
│   ├── models/            # 数据模型 (数据库 Schema)
│   │   ├── Account.js     # 用户账户模型
│   │   └── CarbonData.js  # 碳数据模型
│   ├── routes/            # 路由 (定义 API 端点)
│   │   ├── auth.js        # 认证路由
│   │   ├── carbonData.js  # 碳数据路由
│   │   ├── regions.js     # 区域数据路由
│   │   └── reports.js     # 报告路由
│   ├── utils/             # 工具函数
│   │   ├── calculationEngine.js # 碳排放计算引擎
│   │   ├── emissionFactors.js   # 后端排放因子
│   │   └── regionData.js        # 区域数据处理
│   ├── index.js           # 服务启动入口
│   ├── package.json       # 后端依赖和脚本
│   └── package-lock.json  # 锁定后端依赖版本
│
├── .env.example           # 环境变量示例文件
├── .gitignore             # Git 忽略配置
├── 布局.md                # 布局说明文件
├── 配置流程.md            # 配置流程说明文件
├── EngineeringDirectory.md # 本文件,工程目录详细说明
├── hashPassword.js        # 密码哈希工具
├── help.md                # 帮助文档
├── help.zip               # 帮助文档压缩包
├── INITIAL.md             # 初始化说明文件
├── qu.md                  # 问题文档
├── qu1.md                 # 问题文档1
├── README.md              # 项目说明
