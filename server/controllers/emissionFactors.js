const EmissionFactor = require('../models/EmissionFactor');
const initialFactors = require('../utils/emissionFactors'); // 导入硬编码的排放因子

// 获取所有排放因子
exports.getAllFactors = async (req, res) => {
  try {
    const factors = await EmissionFactor.find({});
    res.status(200).json(factors);
  } catch (error) {
    res.status(500).json({ message: '获取排放因子失败', error: error.message });
  }
};

// 根据ID获取单个排放因子
exports.getFactorById = async (req, res) => {
  try {
    const factor = await EmissionFactor.findById(req.params.id);
    if (!factor) {
      return res.status(404).json({ message: '未找到排放因子' });
    }
    res.status(200).json(factor);
  } catch (error) {
    res.status(500).json({ message: '获取排放因子失败', error: error.message });
  }
};

// 创建新的排放因子
exports.createFactor = async (req, res) => {
  try {
    const { category, type, name, value, unit, description } = req.body;
    const newFactor = new EmissionFactor({ category, type, name, value, unit, description });
    await newFactor.save();
    res.status(201).json(newFactor);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: '排放因子名称已存在', error: error.message });
    }
    res.status(500).json({ message: '创建排放因子失败', error: error.message });
  }
};

// 更新现有排放因子
exports.updateFactor = async (req, res) => {
  try {
    const { category, type, name, value, unit, description } = req.body;
    const updatedFactor = await EmissionFactor.findByIdAndUpdate(
      req.params.id,
      { category, type, name, value, unit, description, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedFactor) {
      return res.status(404).json({ message: '未找到排放因子' });
    }
    res.status(200).json(updatedFactor);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: '排放因子名称已存在', error: error.message });
    }
    res.status(500).json({ message: '更新排放因子失败', error: error.message });
  }
};

// 删除排放因子
exports.deleteFactor = async (req, res) => {
  try {
    const deletedFactor = await EmissionFactor.findByIdAndDelete(req.params.id);
    if (!deletedFactor) {
      return res.status(404).json({ message: '未找到排放因子' });
    }
    res.status(200).json({ message: '排放因子删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除排放因子失败', error: error.message });
  }
};

// 初始化排放因子到数据库
exports.initializeFactors = async (req, res) => {
  try {
    const factorsToInsert = [];
    for (const category in initialFactors) {
      for (const type in initialFactors[category]) {
        if (typeof initialFactors[category][type] === 'object' && !Array.isArray(initialFactors[category][type])) {
          // Handle nested objects like mobile.fuel and mobile.mileage
          for (const name in initialFactors[category][type]) {
            factorsToInsert.push({
              category,
              type: type, // e.g., 'fuel', 'mileage'
              name: name, // e.g., 'gasoline', 'diesel'
              value: initialFactors[category][type][name],
              unit: getUnitForFactor(category, type, name) // 辅助函数获取单位
            });
          }
        } else {
          // Handle direct properties
          factorsToInsert.push({
            category,
            type: category, // For simplicity, use category as type if not nested
            name: type, // e.g., 'anthracite', 'naturalGas'
            value: initialFactors[category][type],
            unit: getUnitForFactor(category, type) // 辅助函数获取单位
          });
        }
      }
    }

    // 批量插入，忽略重复项
    const result = await EmissionFactor.insertMany(factorsToInsert, { ordered: false, rawResult: true });
    res.status(200).json({ message: '排放因子初始化成功', insertedCount: result.insertedCount });
  } catch (error) {
    if (error.code === 11000) {
      res.status(200).json({ message: '部分排放因子已存在，跳过插入', error: error.message });
    } else {
      res.status(500).json({ message: '初始化排放因子失败', error: error.message });
    }
  }
};

// 辅助函数：根据类别和名称获取单位
function getUnitForFactor(category, type, name = null) {
  switch (category) {
    case 'solid':
      return 'tCO2/t';
    case 'liquid':
      return 'tCO2/t';
    case 'gas':
      return 'tCO2/10^4 Nm^3';
    case 'indirect':
      if (type === 'electricity') return 'tCO2/MWh';
      if (type === 'heat') return 'kgCO2e/GJ';
      return '';
    case 'mobile':
      if (type === 'fuel') return 'kgCO2/L';
      if (type === 'mileage') return 'kgCO2/km';
      return '';
    default:
      return '';
  }
}
