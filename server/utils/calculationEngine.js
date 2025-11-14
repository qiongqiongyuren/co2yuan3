const EmissionFactor = require('../models/EmissionFactor');

// 辅助函数：从数据库获取并格式化排放因子
async function getFormattedEmissionFactors() {
  const factors = {};
  const dbFactors = await EmissionFactor.find({});

  dbFactors.forEach(factor => {
    if (!factors[factor.category]) {
      factors[factor.category] = {};
    }

    // 处理嵌套结构，例如 mobile.fuel 和 mobile.mileage
    if (factor.category === 'mobile' && (factor.type === 'fuel' || factor.type === 'mileage')) {
      if (!factors[factor.category][factor.type]) {
        factors[factor.category][factor.type] = {};
      }
      factors[factor.category][factor.type][factor.name] = factor.value;
    } else {
      factors[factor.category][factor.name] = factor.value;
    }
  });
  return factors;
}

async function calculateEmissions(activityData) {
  const { fossilFuels, mobileSources, indirectEmissions, intensityMetrics } = activityData;

  const dbFactors = await getFormattedEmissionFactors(); // 从数据库获取最新排放因子

  const breakdown = {
    fossilFuels: 0,
    mobileSources: 0,
    electricity: 0,
    heat: 0,
  };

  // --- Direct Emissions ---
  // Solid fuels
  for (const fuel in fossilFuels.solid) {
    breakdown.fossilFuels += (fossilFuels.solid[fuel] || 0) * dbFactors.solid[fuel];
  }
  // Liquid fuels
  for (const fuel in fossilFuels.liquid) {
    breakdown.fossilFuels += (fossilFuels.liquid[fuel] || 0) * dbFactors.liquid[fuel];
  }
  // Gaseous fuels (unit conversion)
  for (const fuel in fossilFuels.gas) {
    breakdown.fossilFuels += ((fossilFuels.gas[fuel] || 0) / 10000) * dbFactors.gas[fuel];
  }

  // Mobile Sources (unit conversion from kg to t)
  if (mobileSources) {
    if (mobileSources.fuel) {
      for (const type in mobileSources.fuel) {
        breakdown.mobileSources += (mobileSources.fuel[type] || 0) * (dbFactors.mobile.fuel[type] / 1000);
      }
    }
    if (mobileSources.mileage) {
      for (const type in mobileSources.mileage) {
        breakdown.mobileSources += (mobileSources.mileage[type] || 0) * (dbFactors.mobile.mileage[type] / 1000);
      }
    }
  }

  // --- Indirect Emissions ---
  // Purchased Electricity (unit conversion)
  breakdown.electricity = (indirectEmissions.purchasedElectricity || 0) * 10 * dbFactors.indirect.electricity;
  // Purchased Heat (unit conversion)
  breakdown.heat = (indirectEmissions.purchasedHeat || 0) * (dbFactors.indirect.heat / 1000);

  // --- Totals ---
  const totalDirect = breakdown.fossilFuels + breakdown.mobileSources;
  const totalIndirect = breakdown.electricity + breakdown.heat;
  const totalEmissions = totalDirect + totalIndirect;

  // --- Intensity ---
  const emissionIntensityByArea = intensityMetrics.buildingArea > 0 
    ? totalEmissions / intensityMetrics.buildingArea 
    : 0;
  const emissionIntensityByPerson = intensityMetrics.personnelCount > 0 
    ? totalEmissions / intensityMetrics.personnelCount 
    : 0;

  return {
    breakdown, // Detailed breakdown for charts
    totalDirect,
    totalIndirect,
    totalEmissions,
    emissionIntensityByArea,
    emissionIntensityByPerson
  };
  console.log('Calculated Emissions:', {
    breakdown, // Detailed breakdown for charts
    totalDirect,
    totalIndirect,
    totalEmissions,
    emissionIntensityByArea,
    emissionIntensityByPerson
  }); // 添加日志
  return {
    breakdown, // Detailed breakdown for charts
    totalDirect,
    totalIndirect,
    totalEmissions,
    emissionIntensityByArea,
    emissionIntensityByPerson
  };
}

module.exports = { calculateEmissions };
