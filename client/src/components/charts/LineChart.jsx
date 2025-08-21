import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const LineChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: data.years
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%',
          color: '#fff'
        }
      },
      series: [
        {
          data: data.changeRates,
          type: 'line',
          markLine: {
            data: [{ type: 'average', name: '平均值' }]
          }
        }
      ]
    };
    chart.setOption(option);

    return () => {
      chart.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};

export default LineChart;
