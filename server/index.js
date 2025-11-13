const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const aiRoutes = require('./routes/ai');
const emissionFactorsRoutes = require('./routes/emissionFactors'); // 导入排放因子路由
const uploadRoutes = require('./routes/upload'); // 导入上传路由
const dataMappingRoutes = require('./routes/dataMapping'); // 导入数据映射路由

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/regions', require('./routes/regions'));
app.use('/api/carbon-data', require('./routes/carbonData'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/ai', aiRoutes); // 添加 AI 路由
app.use('/api/emission-factors', emissionFactorsRoutes); // 添加排放因子路由
app.use('/api/upload', uploadRoutes); // 添加上传路由
app.use('/api/data-mapping', dataMappingRoutes); // 添加数据映射路由

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
