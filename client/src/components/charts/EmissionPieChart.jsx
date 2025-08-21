import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Empty, Row, Col } from 'antd';

const emissionTypes = {
  fossilFuels: '化石燃料燃烧',
  mobileSources: '移动源燃烧',
  electricity: '外购电力',
  heat: '外购热力',
};

const EmissionPieChart = ({ data, comparisonData, compareMode }) => {
  if (!data) return <Empty description="无排放构成数据" />;

  const generatePieOption = (title, chartDataSource) => {
    const chartData = Object.entries(emissionTypes).map(([key, name]) => ({
      name,
      value: chartDataSource[key] || 0,
    })).filter(d => d.value > 0);

    if (chartData.length === 0) {
      return null;
    }

    return {
      title: {
        text: title,
        left: 'center',
        top: 'bottom'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} tCO₂ ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [{
        name: '排放来源',
        type: 'pie',
        radius: '50%',
        data: chartData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  };

  const renderComparisonChart = () => {
    if (!comparisonData || comparisonData.length === 0) {
      return <Empty description="无同级别单位对比数据" />;
    }

    // Calculate average for comparison data
    const avgBreakdown = {
      fossilFuels: 0,
      mobileSources: 0,
      electricity: 0,
      heat: 0,
    };
    
    comparisonData.forEach(item => {
        const breakdown = item.calculatedEmissions?.breakdown;
        if(breakdown) {
            avgBreakdown.fossilFuels += breakdown.fossilFuels || 0;
            avgBreakdown.mobileSources += breakdown.mobileSources || 0;
            avgBreakdown.electricity += breakdown.electricity || 0;
            avgBreakdown.heat += breakdown.heat || 0;
        }
    });

    const count = comparisonData.length;
    Object.keys(avgBreakdown).forEach(key => {
      avgBreakdown[key] = (avgBreakdown[key] / count);
    });

    const ownOption = generatePieOption('本单位', data);
    const avgOption = generatePieOption('同级别单位平均', avgBreakdown);

    return (
      <Row gutter={16} style={{ height: '100%' }}>
        <Col span={12} style={{ height: '100%' }}>
          {ownOption ? <ReactECharts option={ownOption} style={{ height: '100%' }} /> : <Empty description="无本单位数据" />}
        </Col>
        <Col span={12} style={{ height: '100%' }}>
          {avgOption ? <ReactECharts option={avgOption} style={{ height: '100%' }} /> : <Empty description="无对比数据" />}
        </Col>
      </Row>
    );
  };

  const renderSingleChart = () => {
    const option = generatePieOption('本单位排放构成', data);
    if (!option) return <Empty description="无排放构成数据" />;
    return <ReactECharts option={option} style={{ height: '100%' }} />;
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {compareMode ? renderComparisonChart() : renderSingleChart()}
    </div>
  );
};

export default EmissionPieChart;
