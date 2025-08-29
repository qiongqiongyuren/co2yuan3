import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, Typography } from '@mui/material'; // 使用MUI组件

const AnnualChangeLineChart = ({ yearlyData, compareMode }) => {
  if (compareMode) {
    return (
      <Box sx={{ textAlign: 'center', p: 5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="textSecondary">年变化率对比功能需要获取所有对比单位连续两年的数据，当前暂不支持。</Typography>
      </Box>
    );
  }
  
  if (!yearlyData || yearlyData.length < 2) {
    return (
        <Box sx={{ textAlign: 'center', p: 5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="textSecondary">提交至少两年的数据后，将在此处显示年变化率图表。</Typography>
        </Box>
    );
  }

  const sortedData = [...yearlyData].sort((a, b) => a.year - b.year);

  const chartData = [];
  for (let i = 1; i < sortedData.length; i++) {
    const currentYearData = sortedData[i];
    const previousYearData = sortedData[i - 1];
    
    const currentEmissions = currentYearData.calculatedEmissions.totalEmissions;
    const previousEmissions = previousYearData.calculatedEmissions.totalEmissions;

    let changeRate = 0;
    if (previousEmissions > 0) {
      changeRate = ((currentEmissions - previousEmissions) / previousEmissions) * 100;
    }

    chartData.push({
      year: currentYearData.year,
      changeRate: changeRate.toFixed(2)
    });
  }

  if (chartData.length === 0) {
    return (
        <Box sx={{ textAlign: 'center', p: 5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="textSecondary">无法计算年变化率。</Typography>
        </Box>
    );
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}年<br/>变化率: {c}%',
      textStyle: { // 确保tooltip文字颜色为白色
        color: '#fff'
      }
    },
    grid: { // 增加grid边距，为标签留出更多空间
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.year),
      axisLabel: { // 确保X轴标签文字颜色为白色
        color: '#fff'
      }
    },
    yAxis: {
      type: 'value',
      name: '变化率 (%)',
      nameTextStyle: { // 确保Y轴名称文字颜色为白色
        color: '#fff'
      },
      axisLabel: {
        formatter: '{value} %',
        color: '#fff' // 确保Y轴标签文字颜色为白色
      }
    },
    series: [
      {
        data: chartData.map(d => d.changeRate),
        type: 'line',
        label: {
          show: true,
          formatter: '{c}%',
          color: '#fff' // 确保数据标签文字颜色为白色
        },
        itemStyle: { // 确保数据点颜色
          color: '#66bb6a' // 使用主题primary color
        },
        lineStyle: { // 确保线条颜色
          color: '#66bb6a' // 使用主题primary color
        }
      }
    ]
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default AnnualChangeLineChart;
