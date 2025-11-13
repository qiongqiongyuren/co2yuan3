const mongoose = require('mongoose');

const emissionFactorSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['solid', 'liquid', 'gas', 'indirect', 'mobile'] // 排放因子类别
  },
  type: {
    type: String,
    required: true // 具体燃料类型或排放源
  },
  name: {
    type: String,
    required: true,
    unique: true // 排放因子的名称，例如 'anthracite', 'gasoline', 'electricity'
  },
  value: {
    type: Number,
    required: true // 排放因子值
  },
  unit: {
    type: String,
    required: true // 排放因子单位，例如 'tCO2/t', 'tCO2/L', 'tCO2/MWh'
  },
  description: {
    type: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EmissionFactor', emissionFactorSchema);
