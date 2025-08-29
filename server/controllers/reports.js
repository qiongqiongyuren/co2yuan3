const CarbonData = require('../models/CarbonData');
const { formSections } = require('../../client/src/components/formFields'); // 导入前端表单字段定义
const { getRegionFullNameByCode } = require('../utils/regionData'); // 导入获取地区全名的方法

// A simple utility to convert a flat JSON object to a CSV row
function jsonToCsv(items) {
  if (!items || items.length === 0) {
    return ''; // Return empty string if no items
  }
  const header = Object.keys(items[0]);
  const headerString = header.join(',');

  // Build the CSV string
  const replacer = (key, value) => value === null || value === undefined ? '' : value;
  const rowItems = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
  
  return [headerString, ...rowItems].join('\r\n');
}

// Helper to get nested value safely
const getNestedValue = (obj, path) => {
  return path.reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj);
};

// Helper to flatten activity data based on formSections
const flattenActivityData = (activityData, entry) => {
  const flat = {};
  formSections.forEach(section => {
    const processFields = (fields) => {
      fields.forEach(field => {
        const fieldPath = field.name; // e.g., ['fossilFuels', 'solid', 'anthracite']
        const flatKey = fieldPath.join('_'); // e.g., 'fossilFuels_solid_anthracite'
        flat[flatKey] = getNestedValue(activityData, fieldPath) || '';
      });
    };

    if (section.panels) {
      section.panels.forEach(panel => processFields(panel.fields));
    } else {
      processFields(section.fields);
    }
  });
  return flat;
};

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
      const activityFlat = flattenActivityData(entry.activityData, entry); // Flatten all activity data

      return {
        year: entry.year,
        regionCode: entry.regionCode,
        regionName: getRegionFullNameByCode(entry.regionCode) || entry.regionCode, // 添加地区全名
        ...activityFlat, // 展开所有活动数据字段
        // Calculated Emissions
        totalEmissions_tCO2: entry.calculatedEmissions?.totalEmissions || 0,
        totalDirect_tCO2: entry.calculatedEmissions?.totalDirect || 0,
        totalIndirect_tCO2: entry.calculatedEmissions?.totalIndirect || 0,
        intensityByArea_tCO2_per_m2: entry.calculatedEmissions?.emissionIntensityByArea || 0,
        intensityByPerson_tCO2_per_person: entry.calculatedEmissions?.emissionIntensityByPerson || 0,
        // Breakdown
        breakdown_fossilFuels_tCO2: entry.calculatedEmissions?.breakdown?.fossilFuels || 0,
        breakdown_electricity_tCO2: entry.calculatedEmissions?.breakdown?.electricity || 0,
        breakdown_heat_tCO2: entry.calculatedEmissions?.breakdown?.heat || 0,
        createdAt: entry.createdAt ? entry.createdAt.toISOString() : ''
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
