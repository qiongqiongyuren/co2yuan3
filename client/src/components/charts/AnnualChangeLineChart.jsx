import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Empty } from 'antd';

const AnnualChangeLineChart = ({ yearlyData, compareMode }) => {
  if (compareMode) {
    return (
      <div style={{ textAlign: 'center', padding: 40, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <Empty description="年变化率对比功能需要获取所有对比单位连续两年的数据，当前暂不支持。" />
        </div>
      </div>
    );
  }
  
  if (!yearlyData || yearlyData.length < 2) {
    return (
        <div style={{ textAlign: 'center', padding: 40, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description="提交至少两年的数据后，将在此处显示年变化率图表。" />
        </div>
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
        <div style={{ textAlign: 'center', padding: 40, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description="无法计算年变化率。" />
        </div>
    );
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}年<br/>变化率: {c}%'
    },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.year)
    },
    yAxis: {
      type: 'value',
      name: '变化率 (%)',
      axisLabel: {
        formatter: '{value} %'
      }
    },
    series: [
      {
        data: chartData.map(d => d.changeRate),
        type: 'line',
        label: {
          show: true,
          formatter: '{c}%'
        }
      }
    ]
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactECharts option={option} style={{ height: '100%' }} />
    </div>
  );
};

export default AnnualChangeLineChart;
