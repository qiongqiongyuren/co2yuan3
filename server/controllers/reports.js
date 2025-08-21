const CarbonData = require('../models/CarbonData');
// A simple utility to convert a flat JSON object to a CSV row
function jsonToCsv(items) {
  const header = Object.keys(items[0]);
  const headerString = header.join(',');

  // Build the CSV string
  const replacer = (key, value) => value === null ? '' : value;
  const rowItems = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
  
  return [headerString, ...rowItems].join('\r\n');
}

// @desc    Export user data to CSV
// @route   GET /api/reports/csv
// @access  Private
exports.exportCsv = async (req, res, next) => {
  try {
    const data = await CarbonData.find({ account: req.user.id }).lean();

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: 'No data found to export' });
    }

    // We need to flatten the complex data structure for CSV export
    const flattenedData = data.map(entry => {
      return {
        year: entry.year,
        regionCode: entry.regionCode,
        // Activity Data - Solids
        anthracite_t: entry.activityData.fossilFuels.solid.anthracite,
        bituminousCoal_t: entry.activityData.fossilFuels.solid.bituminousCoal,
        // ... add all other activity data fields
        // Calculated Emissions
        totalEmissions_tCO2: entry.calculatedEmissions.totalEmissions,
        totalDirect_tCO2: entry.calculatedEmissions.totalDirect,
        totalIndirect_tCO2: entry.calculatedEmissions.totalIndirect,
        intensityByArea_tCO2_per_m2: entry.calculatedEmissions.emissionIntensityByArea,
        intensityByPerson_tCO2_per_person: entry.calculatedEmissions.emissionIntensityByPerson,
        // Breakdown
        breakdown_fossilFuels_tCO2: entry.calculatedEmissions.breakdown.fossilFuels,
        breakdown_electricity_tCO2: entry.calculatedEmissions.breakdown.electricity,
        breakdown_heat_tCO2: entry.calculatedEmissions.breakdown.heat,
        createdAt: entry.createdAt.toISOString()
      };
    });

    const csv = jsonToCsv(flattenedData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`carbon_report_${req.user.id}.csv`);
    res.send(csv);

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get comparison data for a given year and region
// @route   GET /api/reports/compare
// @access  Private
exports.compareData = async (req, res, next) => {
  try {
    const { year, regionCode } = req.query;

    if (!year || !regionCode) {
      return res.status(400).json({ success: false, error: 'Year and regionCode are required' });
    }

    // Determine the city-level prefix (e.g., '150102' -> '1501')
    const cityPrefix = regionCode.substring(0, 4);
    const regionRegex = new RegExp(`^${cityPrefix}`);

    const comparisonData = await CarbonData.find({
      year: parseInt(year),
      regionCode: { $regex: regionRegex }
    }).populate('account', 'unitName'); // Populate the unit name from the Account model

    res.status(200).json({
      success: true,
      data: comparisonData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
