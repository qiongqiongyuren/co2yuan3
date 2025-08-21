const mongoose = require('mongoose');

const CarbonDataSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.ObjectId,
    ref: 'Account',
    required: true
  },
  year: {
    type: Number,
    required: [true, 'Please add a year for the data']
  },
  regionCode: {
    type: String,
    required: true
  },
  // Raw activity data
  activityData: {
    fossilFuels: {
      solid: {
        anthracite: { type: Number, default: 0 },
        bituminousCoal: { type: Number, default: 0 },
        lignite: { type: Number, default: 0 },
        cokingCoal: { type: Number, default: 0 },
        briquettes: { type: Number, default: 0 },
        coke: { type: Number, default: 0 },
        otherCokingProducts: { type: Number, default: 0 }
      },
      liquid: {
        crudeOil: { type: Number, default: 0 },
        fuelOil: { type: Number, default: 0 },
        gasoline: { type: Number, default: 0 },
        diesel: { type: Number, default: 0 },
        kerosene: { type: Number, default: 0 },
        lpg: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
        naphtha: { type: Number, default: 0 },
        asphalt: { type: Number, default: 0 },
        lubricants: { type: Number, default: 0 },
        petroleumCoke: { type: Number, default: 0 },
        petrochemicalFeedstock: { type: Number, default: 0 },
        otherOils: { type: Number, default: 0 }
      },
      gas: {
        naturalGas: { type: Number, default: 0 },
        refineryGas: { type: Number, default: 0 },
        cokeOvenGas: { type: Number, default: 0 },
        pipelineGas: { type: Number, default: 0 }
      }
    },
    mobileSources: {
      fuel: {
        gasoline: { type: Number, default: 0 },
        diesel: { type: Number, default: 0 }
      },
      mileage: {
        gasolineCar: { type: Number, default: 0 },
        dieselCar: { type: Number, default: 0 }
      }
    },
    indirectEmissions: {
      purchasedElectricity: { type: Number, default: 0 }, // in 10^4 kWh
      purchasedHeat: { type: Number, default: 0 } // in GJ
    },
    intensityMetrics: {
      buildingArea: { type: Number, default: 0 }, // in m^2
      personnelCount: { type: Number, default: 0 }
    }
  },
  // Calculated results
  calculatedEmissions: {
    breakdown: {
      fossilFuels: { type: Number, default: 0 },
      mobileSources: { type: Number, default: 0 },
      electricity: { type: Number, default: 0 },
      heat: { type: Number, default: 0 },
    },
    totalDirect: Number,
    totalIndirect: Number,
    totalEmissions: Number,
    emissionIntensityByArea: Number,
    emissionIntensityByPerson: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CarbonData', CarbonDataSchema);
