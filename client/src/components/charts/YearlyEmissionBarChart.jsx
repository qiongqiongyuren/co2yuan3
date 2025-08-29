import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, Typography } from '@mui/material'; // 使用MUI组件

const YearlyEmissionBarChart = ({ yearlyData, comparisonData, compareMode, currentYear }) => {
  if (!yearlyData || yearlyData.length === 0) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography variant="body1" color="textSecondary">无年度排放数据</Typography></Box>;

  const renderYearlyTrendChart = () => {
    const sortedData = [...yearlyData].sort((a, b) => a.year - b.year);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: { top: 'bottom' },
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: { type: 'category', data: sortedData.map(d => `${d.regionName || ''}/${d.year}`), axisLabel: { interval: 0, rotate: 30 } },
      yAxis: { type: 'value', name: 'tCO₂' },
      series: [
        {
          name: '直接排放',
          type: 'bar',
          stack: 'total',
          emphasis: { focus: 'series' },
          data: sortedData.map(d => (d.calculatedEmissions.breakdown.fossilFuels + d.calculatedEmissions.breakdown.mobileSources).toFixed(2))
        },
        {
          name: '间接排放',
          type: 'bar',
          stack: 'total',
          emphasis: { focus: 'series' },
          data: sortedData.map(d => (d.calculatedEmissions.breakdown.electricity + d.calculatedEmissions.breakdown.heat).toFixed(2))
        },
        {
            name: '总排放',
            type: 'line',
            yAxisIndex: 0,
            data: sortedData.map(d => d.calculatedEmissions.totalEmissions.toFixed(2)),
        }
      ]
    };
    return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
  };

  const renderComparisonChart = () => {
    const currentYearData = yearlyData.find(d => d.year === currentYear);
    if (!currentYearData) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography variant="body1" color="textSecondary">{`无 ${currentYear} 年的数据`}</Typography></Box>;

    const allData = [{ ...currentYearData, regionName: '本单位' }, ...comparisonData];
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: { top: 'bottom' },
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: allData.map(d => d.regionName),
        axisLabel: { interval: 0, rotate: 30 }
      },
      yAxis: { type: 'value', name: 'tCO₂' },
      series: [
        {
          name: '直接排放',
          type: 'bar',
          stack: 'total',
          emphasis: { focus: 'series' },
          data: allData.map(d => (d.calculatedEmissions.breakdown.fossilFuels + d.calculatedEmissions.breakdown.mobileSources).toFixed(2))
        },
        {
          name: '间接排放',
          type: 'bar',
          stack: 'total',
          emphasis: { focus: 'series' },
          data: allData.map(d => (d.calculatedEmissions.breakdown.electricity + d.calculatedEmissions.breakdown.heat).toFixed(2))
        },
        {
          name: '总排放',
          type: 'bar',
          emphasis: { focus: 'series' },
          data: allData.map(d => d.calculatedEmissions.totalEmissions.toFixed(2))
        }
      ]
    };
    return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {compareMode ? renderComparisonChart() : renderYearlyTrendChart()}
    </div>
  );
};

export default YearlyEmissionBarChart;
