const DataMappingTemplate = require('../models/DataMappingTemplate');
const CarbonData = require('../models/CarbonData'); // 用于获取 CarbonData 模型的结构

// 辅助函数：递归遍历 Mongoose Schema，提取所有字段路径
function getSchemaPaths(schema, prefix = '') {
  let paths = [];
  schema.eachPath((pathName, schemaType) => {
    const fullPath = prefix ? `${prefix}.${pathName}` : pathName;
    if (schemaType instanceof mongoose.Schema.Types.Subdocument || schemaType instanceof mongoose.Schema.Types.Embedded) {
      // 如果是子文档或嵌入文档，递归获取其路径
      paths = paths.concat(getSchemaPaths(schemaType.schema, fullPath));
    } else if (schemaType instanceof mongoose.Schema.Types.DocumentArray) {
      // 如果是文档数组，递归获取其子文档的路径
      paths = paths.concat(getSchemaPaths(schemaType.schema, `${fullPath}.$`)); // 使用 $ 表示数组中的元素
    } else if (schemaType instanceof mongoose.Schema.Types.Map) {
      // 如果是 Map 类型，可以考虑暴露其键值对的通用路径
      paths.push(`${fullPath}.key`); // 示例：Map 的键
      paths.push(`${fullPath}.value`); // 示例：Map 的值
    } else {
      paths.push(fullPath);
    }
  });
  return paths;
}

// 获取所有可用的 CarbonData 数据库字段路径
exports.getCarbonDataFields = async (req, res) => {
  try {
    const schemaPaths = getSchemaPaths(CarbonData.schema);
    // 过滤掉一些内部字段或不需要映射的字段
    const filteredPaths = schemaPaths.filter(path => 
      !path.startsWith('_') && 
      !path.startsWith('account') && // account 字段通常由系统自动处理
      !path.startsWith('createdAt') && 
      !path.startsWith('calculatedEmissions') // 计算结果字段不需要用户导入
    );
    res.status(200).json(filteredPaths);
  } catch (error) {
    res.status(500).json({ message: '获取 CarbonData 字段失败', error: error.message });
  }
};

// 获取所有数据映射模板
exports.getAllMappingTemplates = async (req, res) => {
  try {
    const templates = await DataMappingTemplate.find({ account: req.user.id });
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: '获取映射模板失败', error: error.message });
  }
};

// 根据ID获取单个数据映射模板
exports.getMappingTemplateById = async (req, res) => {
  try {
    const template = await DataMappingTemplate.findById(req.params.id);
    if (!template || template.account.toString() !== req.user.id) {
      return res.status(404).json({ message: '未找到映射模板' });
    }
    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ message: '获取映射模板失败', error: error.message });
  }
};

// 创建新的数据映射模板
exports.createMappingTemplate = async (req, res) => {
  try {
    const { templateName, mappings } = req.body;
    const newTemplate = new DataMappingTemplate({
      account: req.user.id,
      templateName,
      mappings
    });
    await newTemplate.save();
    res.status(201).json(newTemplate);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: '映射模板名称已存在', error: error.message });
    }
    res.status(500).json({ message: '创建映射模板失败', error: error.message });
  }
};

// 更新现有数据映射模板
exports.updateMappingTemplate = async (req, res) => {
  try {
    const { templateName, mappings } = req.body;
    const updatedTemplate = await DataMappingTemplate.findOneAndUpdate(
      { _id: req.params.id, account: req.user.id },
      { templateName, mappings, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedTemplate) {
      return res.status(404).json({ message: '未找到映射模板' });
    }
    res.status(200).json(updatedTemplate);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: '映射模板名称已存在', error: error.message });
    }
    res.status(500).json({ message: '更新映射模板失败', error: error.message });
  }
};

// 删除数据映射模板
exports.deleteMappingTemplate = async (req, res) => {
  try {
    const deletedTemplate = await DataMappingTemplate.findOneAndDelete({ _id: req.params.id, account: req.user.id });
    if (!deletedTemplate) {
      return res.status(404).json({ message: '未找到映射模板' });
    }
    res.status(200).json({ message: '映射模板删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除映射模板失败', error: error.message });
  }
};
