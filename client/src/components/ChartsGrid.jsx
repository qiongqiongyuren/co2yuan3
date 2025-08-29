import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import DonutChart from './charts/DonutChart';
import StackedAreaChart from './charts/StackedAreaChart';
import DualAxisChart from './charts/DualAxisChart';
import LineChart from './charts/LineChart';
import StackedBarChart from './charts/StackedBarChart';

const ChartsGrid = ({ charts }) => {
  if (!charts) return null;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={6}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.5)' }}> {/* 移除固定高度，使用flex布局 */}
          <Typography variant="h6" sx={{ mb: 2 }}>排放源占比</Typography>
          <Box sx={{ height: '350px' }}> {/* 设置图表容器的固定高度 */}
            <DonutChart data={charts.donutData} />
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} lg={6}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>近5年排放源结构变化</Typography>
          <Box sx={{ height: '350px' }}>
            <StackedAreaChart data={charts.stackedAreaChartData} />
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>单位建筑面积/人均碳排放</Typography>
          <Box sx={{ height: '350px' }}>
            <DualAxisChart data={charts.dualAxisChartData} />
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>碳排放总量年均变化率</Typography>
          <Box sx={{ height: '350px' }}>
            <LineChart data={charts.lineChartData} />
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>年度排放量构成</Typography>
          <Box sx={{ height: '350px' }}>
            <StackedBarChart data={charts.stackedBarChartData} />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ChartsGrid;
