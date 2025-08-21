import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import DataCard from '../components/DataCard';
import DonutChart from '../components/charts/DonutChart';
import StackedAreaChart from '../components/charts/StackedAreaChart';
import DualAxisChart from '../components/charts/DualAxisChart';
import LineChart from '../components/charts/LineChart';
import StackedBarChart from '../components/charts/StackedBarChart';

const DataScreenPage = () => {
  const [cardData, setCardData] = useState({
    totalEmissions: { value: 0, change: 0, isPositive: false },
    perCapitaEmissions: { value: 0, change: 0, isPositive: false },
    perAreaEmissions: { value: 0, change: 0, isPositive: false },
    targetCompletion: { value: 68, change: 32, isPositive: false }, // Mock data
  });
  const [donutData, setDonutData] = useState([]);
  const [stackedAreaChartData, setStackedAreaChartData] = useState({
    years: [],
    fossilFuels: [],
    mobileSources: [],
    electricity: [],
    heat: [],
  });
  const [stackedBarChartData, setStackedBarChartData] = useState({
    years: [],
    fossilFuels: [],
    mobileSources: [],
    electricity: [],
    heat: [],
  });
  const [dualAxisChartData, setDualAxisChartData] = useState({
    years: [],
    areaIntensity: [],
    perCapitaIntensity: [],
  });
  const [lineChartData, setLineChartData] = useState({
    years: [],
    changeRates: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/carbon-data');
        const allData = res.data.data;

        if (allData.length > 1) {
          const sortedData = allData.sort((a, b) => b.year - a.year);
          const latestData = sortedData[0];
          const previousData = sortedData[1];

          // Card Data - with safe access
          const latestEmissions = latestData.calculatedEmissions;
          const previousEmissions = previousData.calculatedEmissions;

          const totalEmissionsChange = ((latestEmissions?.totalEmissions || 0) - (previousEmissions?.totalEmissions || 0)) / (previousEmissions?.totalEmissions || 1) * 100;
          const perCapitaChange = ((latestEmissions?.intensity?.perCapita || 0) - (previousEmissions?.intensity?.perCapita || 0)) / (previousEmissions?.intensity?.perCapita || 1) * 100;
          const perAreaChange = ((latestEmissions?.intensity?.perArea || 0) - (previousEmissions?.intensity?.perArea || 0)) / (previousEmissions?.intensity?.perArea || 1) * 100;

          setCardData({
            totalEmissions: { value: (latestEmissions?.totalEmissions || 0).toFixed(2), change: Math.abs(totalEmissionsChange).toFixed(2), isPositive: totalEmissionsChange > 0 },
            perCapitaEmissions: { value: (latestEmissions?.intensity?.perCapita || 0).toFixed(2), change: Math.abs(perCapitaChange).toFixed(2), isPositive: perCapitaChange > 0 },
            perAreaEmissions: { value: (latestEmissions?.intensity?.perArea || 0).toFixed(2), change: Math.abs(perAreaChange).toFixed(2), isPositive: perAreaChange > 0 },
            targetCompletion: { value: 68, change: 32, isPositive: false }, // Mock data
          });

          // Donut Chart
          const { fossilFuels, mobileSources, electricity, heat } = latestData.calculatedEmissions.breakdown;
          setDonutData([
            { value: fossilFuels || 0, name: '化石燃料' },
            { value: mobileSources || 0, name: '移动源' },
            { value: electricity || 0, name: '外购电力' },
            { value: heat || 0, name: '外购热力' },
          ]);

          // Other Charts (last 5 years)
          const last5YearsData = sortedData.slice(0, 5).reverse();
          const years = last5YearsData.map(d => d.year);
          const fossilFuelsData = last5YearsData.map(d => d.calculatedEmissions.breakdown.fossilFuels || 0);
          const mobileSourcesData = last5YearsData.map(d => d.calculatedEmissions.breakdown.mobileSources || 0);
          const electricityData = last5YearsData.map(d => d.calculatedEmissions.breakdown.electricity || 0);
          const heatData = last5YearsData.map(d => d.calculatedEmissions.breakdown.heat || 0);

          setStackedAreaChartData({ years, fossilFuels: fossilFuelsData, mobileSources: mobileSourcesData, electricity: electricityData, heat: heatData });
          setStackedBarChartData({ years, fossilFuels: fossilFuelsData, mobileSources: mobileSourcesData, electricity: electricityData, heat: heatData });

          const areaIntensity = last5YearsData.map(d => d.calculatedEmissions?.intensity?.perArea || 0);
          const perCapitaIntensity = last5YearsData.map(d => d.calculatedEmissions?.intensity?.perCapita || 0);
          setDualAxisChartData({ years, areaIntensity, perCapitaIntensity });

          const changeRates = [];
          for (let i = 1; i < last5YearsData.length; i++) {
            const prev = last5YearsData[i - 1].calculatedEmissions.totalEmissions;
            const curr = last5YearsData[i].calculatedEmissions.totalEmissions;
            changeRates.push(((curr - prev) / prev * 100).toFixed(2));
          }
          setLineChartData({ years: years.slice(1), changeRates });
        }
      } catch (err) {
        setError('无法加载图表数据');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3, color: 'white' }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>数据大屏</Typography>
      
      {/* Data Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}><DataCard title="总碳排放量" value={cardData.totalEmissions.value} change={cardData.totalEmissions.change} unit="tCO₂" changeUnit="%" isPositive={cardData.totalEmissions.isPositive} /></Grid>
        <Grid item xs={12} sm={6} md={3}><DataCard title="人均碳排放量" value={cardData.perCapitaEmissions.value} change={cardData.perCapitaEmissions.change} unit="tCO₂/人" changeUnit="%" isPositive={cardData.perCapitaEmissions.isPositive} /></Grid>
        <Grid item xs={12} sm={6} md={3}><DataCard title="单位面积排放" value={cardData.perAreaEmissions.value} change={cardData.perAreaEmissions.change} unit="tCO₂/m²" changeUnit="%" isPositive={cardData.perAreaEmissions.isPositive} /></Grid>
        <Grid item xs={12} sm={6} md={3}><DataCard title="减排目标完成率" value={cardData.targetCompletion.value} change={cardData.targetCompletion.change} unit="%" changeUnit="%" isPositive={cardData.targetCompletion.isPositive} /></Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2, height: '40vh', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <Typography variant="h6">排放源占比</Typography>
            <DonutChart data={donutData} />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2, height: '40vh', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <Typography variant="h6">近5年排放源结构变化</Typography>
            <StackedAreaChart data={stackedAreaChartData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '42vh', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <Typography variant="h6">单位建筑面积/人均碳排放</Typography>
            <DualAxisChart data={dualAxisChartData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '42vh', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <Typography variant="h6">碳排放总量年均变化率</Typography>
            <LineChart data={lineChartData} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: '42vh', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <Typography variant="h6">年度排放量构成</Typography>
            <StackedBarChart data={stackedBarChartData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataScreenPage;
