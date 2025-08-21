import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Empty, Row, Col } from 'antd';

const IntensityBarChart = ({ recordData, comparisonData, compareMode }) => {
  if (!recordData) return <Empty description="无排放强度数据" />;

  const { perCapita, perArea } = recordData;

  const renderSingleChart = () => {
    const chartData = [
      { value: perCapita?.toFixed(4) || 0, name: '人均排放 (tCO₂/人)' },
      { value: perArea?.toFixed(4) || 0, name: '单位面积排放 (tCO₂/m²)' },
    ];

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: { containLabel: true },
      xAxis: {
        type: 'category',
        data: chartData.map(d => d.name)
      },
      yAxis: { type: 'value' },
      series: [{
        name: '排放强度',
        type: 'bar',
        data: chartData.map(d => d.value),
        barWidth: '60%',
      }]
    };
    return <ReactECharts option={option} style={{ height: '100%' }} />;
  };

  const renderComparisonChart = () => {
    if (!comparisonData || comparisonData.length === 0) {
      return <Empty description="无同级别单位对比数据" />;
    }
    
    const allData = [
      { ...recordData, regionName: '本单位' },
      ...comparisonData.map(d => ({...d.calculatedEmissions.intensity, regionName: d.regionName}))
    ];

    const personIntensityData = allData.map(d => ({
      name: d.regionName,
      value: d.perCapita?.toFixed(4) || 0,
    })).sort((a, b) => b.value - a.value);

    const areaIntensityData = allData.map(d => ({
        name: d.regionName,
        value: d.perArea?.toFixed(4) || 0,
    })).sort((a, b) => b.value - a.value);

    const personOption = {
      title: { text: '人均排放对比', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { containLabel: true, left: '3%', right: '4%', bottom: '3%'},
      xAxis: { type: 'category', data: personIntensityData.map(d => d.name), axisLabel: { interval: 0, rotate: 30 } },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: personIntensityData.map(d => d.value) }]
    };

    const areaOption = {
        title: { text: '单位面积排放对比', left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { containLabel: true, left: '3%', right: '4%', bottom: '3%' },
        xAxis: { type: 'category', data: areaIntensityData.map(d => d.name), axisLabel: { interval: 0, rotate: 30 } },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: areaIntensityData.map(d => d.value) }]
      };

    return (
      <Row gutter={16} style={{ height: '100%' }}>
        <Col span={12} style={{ height: '100%' }}>
          <ReactECharts option={personOption} style={{ height: '100%' }} />
        </Col>
        <Col span={12} style={{ height: '100%' }}>
          <ReactECharts option={areaOption} style={{ height: '100%' }} />
        </Col>
      </Row>
    );
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {compareMode ? renderComparisonChart() : renderSingleChart()}
    </div>
  );
};

export default IntensityBarChart;
