const factors = require('./emissionFactors');

function calculateEmissions(activityData) {
  const { fossilFuels, mobileSources, indirectEmissions, intensityMetrics } = activityData;

  const breakdown = {
    fossilFuels: 0,
    mobileSources: 0,
    electricity: 0,
    heat: 0,
  };

  // --- Direct Emissions ---
  // Solid fuels
  for (const fuel in fossilFuels.solid) {
    breakdown.fossilFuels += (fossilFuels.solid[fuel] || 0) * factors.solid[fuel];
  }
  // Liquid fuels
  for (const fuel in fossilFuels.liquid) {
    breakdown.fossilFuels += (fossilFuels.liquid[fuel] || 0) * factors.liquid[fuel];
  }
  // Gaseous fuels (unit conversion)
  for (const fuel in fossilFuels.gas) {
    breakdown.fossilFuels += ((fossilFuels.gas[fuel] || 0) / 10000) * factors.gas[fuel];
  }

  // Mobile Sources (unit conversion from kg to t)
  if (mobileSources) {
    if (mobileSources.fuel) {
      for (const type in mobileSources.fuel) {
        breakdown.mobileSources += (mobileSources.fuel[type] || 0) * (factors.mobile.fuel[type] / 1000);
      }
    }
    if (mobileSources.mileage) {
      for (const type in mobileSources.mileage) {
        breakdown.mobileSources += (mobileSources.mileage[type] || 0) * (factors.mobile.mileage[type] / 1000);
      }
    }
  }

  // --- Indirect Emissions ---
  // Purchased Electricity (unit conversion)
  breakdown.electricity = (indirectEmissions.purchasedElectricity || 0) * 10 * factors.indirect.electricity;
  // Purchased Heat (unit conversion)
  breakdown.heat = (indirectEmissions.purchasedHeat || 0) * (factors.indirect.heat / 1000);

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
}

module.exports = { calculateEmissions };
