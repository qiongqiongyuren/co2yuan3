const CarbonData = require('../models/CarbonData');
const { calculateEmissions } = require('../utils/calculationEngine');
const { getRegionFullNameByCode } = require('../utils/regionData');

// @desc    Submit carbon data
// @route   POST /api/carbon-data
// @access  Private
exports.submitData = async (req, res, next) => {
  try {
    const { year, regionCode, activityData } = req.body;

    // Basic validation
    if (!year || !regionCode || !activityData) {
      return res.status(400).json({ success: false, error: 'Missing required fields: year, regionCode, activityData' });
    }
    if (!activityData.fossilFuels || !activityData.indirectEmissions || !activityData.intensityMetrics) {
       return res.status(400).json({ success: false, error: 'activityData must contain fossilFuels, indirectEmissions, and intensityMetrics' });
    }

    // Calculate emissions using the engine
    const calculatedEmissions = calculateEmissions(activityData);

    // Find and update/create record to prevent duplicates for the same year and region
    const query = { account: req.user.id, year: year, regionCode: regionCode };
    const update = {
      regionCode,
      activityData,
      calculatedEmissions
    };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const data = await CarbonData.findOneAndUpdate(query, update, options);

    res.status(201).json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get carbon data for the logged-in user
// @route   GET /api/carbon-data
// @access  Private
exports.getData = async (req, res, next) => {
  try {
    const { year, regionCode } = req.query;
    const query = { account: req.user.id };

    if (year) {
      query.year = year;
    }
    if (regionCode) {
      // If the region code is for a city (e.g., '150100' for Hohhot),
      // we should match all districts under it.
      // City codes end with '00', district codes do not.
      if (regionCode.endsWith('0000')) { // Province-level
        const prefix = regionCode.substring(0, 2);
        query.regionCode = new RegExp(`^${prefix}`);
      } else if (regionCode.endsWith('00')) { // City-level
        const prefix = regionCode.substring(0, 4);
        query.regionCode = new RegExp(`^${prefix}`);
      } else { // District-level
        query.regionCode = regionCode;
      }
    }

    const dbData = await CarbonData.find(query)
      .populate('account', 'unitName') // Populate the unit name
      .sort({ year: -1 })
      .lean(); // Use .lean() for faster queries when we're just reading data

    const dataWithRegionName = dbData.map(item => ({
      ...item,
      regionName: getRegionFullNameByCode(item.regionCode) || '未知区域'
    }));

    res.status(200).json({
      success: true,
      count: dataWithRegionName.length,
      data: dataWithRegionName
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update single carbon data entry by ID
// @route   PUT /api/carbon-data/:id
// @access  Private
exports.updateDataById = async (req, res, next) => {
  try {
    let data = await CarbonData.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ success: false, error: 'No data found' });
    }

    // Make sure user is the owner of the data
    if (data.account.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this data' });
    }

    const { year, regionCode, activityData } = req.body;

    // Basic validation
    if (!year || !regionCode || !activityData) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Recalculate emissions
    const calculatedEmissions = calculateEmissions(activityData);

    // Prepare the update object
    const updateFields = {
      year,
      regionCode,
      activityData,
      calculatedEmissions
    };

    data = await CarbonData.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: data });

  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete single carbon data entry by ID
// @route   DELETE /api/carbon-data/:id
// @access  Private
exports.deleteDataById = async (req, res, next) => {
  try {
    const data = await CarbonData.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ success: false, error: 'No data found' });
    }

    // Make sure user is the owner of the data
    if (data.account.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this data' });
    }

    // Use findByIdAndDelete instead of .remove()
    await CarbonData.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Delete Error:', error); // Log the actual error
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get single carbon data entry by year for the logged-in user
// @route   GET /api/carbon-data/:year
// @access  Private
exports.getDataByYear = async (req, res, next) => {
  try {
    const data = await CarbonData.findOne({ 
      account: req.user.id, 
      year: req.params.year 
    });

    if (!data) {
      // It's not an error if no data exists for a year, just return success: false
      return res.status(200).json({ success: false, data: null });
    }

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
