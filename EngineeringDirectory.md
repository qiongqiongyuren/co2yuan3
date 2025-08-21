# 工程目录结构

```
├── client/                # 前端代码 (React + Vite)
│   ├── public/            # 静态资源,直接复制到构建目录
│   │   └── geo/
│   │       └── region_150000.json # 地图组件的地理数据
│   ├── src/               # 前端源码
│   │   ├── assets/        # 资源文件 (图片, 字体等)
│   │   ├── components/    # 可复用UI组件
│   │   │   ├── DataEntryForm.jsx       # 数据录入表单
│   │   │   ├── ErrorBoundary.jsx       # 错误边界组件
│   │   │   ├── formFields.js           # 表单字段定义
│   │   │   ├── InlineEditForm.jsx      # 行内编辑表单
│   │   │   └── charts/                 # 图表组件目录
│   │   │       ├── AnnualChangeLineChart.jsx # 年度变化折线图
│   │   │       ├── EmissionMapChart.jsx      # 排放地图
│   │   │       ├── EmissionPieChart.jsx      # 排放占比饼图
│   │   │       ├── IntensityBarChart.jsx     # 强度对比柱状图
│   │   │       └── YearlyEmissionBarChart.jsx# 年度排放柱状图
│   │   ├── context/       # React Context (全局状态管理)
│   │   │   └── AppContext.jsx          # 应用级Context
│   │   ├── pages/         # 页面组件
│   │   │   ├── DashboardPage.jsx       # 仪表盘页面
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
├── README.md              # 项目说明
└── EngineeringDirectory.md # 本文件,工程目录详细说明
