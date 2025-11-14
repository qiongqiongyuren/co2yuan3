import React, { useState } from 'react';
import {
  Grid, Paper, Typography, Card, CardHeader, CardContent,
  FormControlLabel, Checkbox, Box
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import EmissionPieChart from './charts/EmissionPieChart';
import IntensityBarChart from './charts/IntensityBarChart';
import YearlyEmissionBarChart from './charts/YearlyEmissionBarChart';
import AnnualChangeLineChart from './charts/AnnualChangeLineChart';

const MotionBox = motion(Box);

const ChartAnalysis = ({ selectedRecord, allData }) => {
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonData, setComparisonData] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const yearlyDataForSelectedRegion = allData.filter(
    d => selectedRecord && d.regionCode === selectedRecord.regionCode
  );

  const handleCompare = async (e) => {
    const checked = e.target.checked;
    setCompareMode(checked);
    if (!checked || !selectedRecord) {
      setComparisonData([]);
      return;
    }
    try {
      const res = await axios.get('/api/reports/compare', { params: { year: selectedRecord.year, regionCode: selectedRecord.regionCode } });
      setComparisonData(res.data.data);
      setSuccess(`已加载 ${res.data.data.length} 条同级别单位数据用于对比`);
    } catch (err) {
      setError('获取对比数据失败');
      setCompareMode(false);
    }
  };

  if (!selectedRecord) {
    return null;
  }

  return (
    <AnimatePresence>
      <MotionBox
        id="chart-analysis-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        sx={{ mt: 4 }}
      >
        <Card>
          <CardHeader
            title={`${selectedRecord.year}年 ${selectedRecord.regionName} - 图表分析`}
            action={
              <FormControlLabel
                control={<Checkbox checked={compareMode} onChange={handleCompare} />}
                label="与同级别单位对比"
              />
            }
          />
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}> {/* 移除minHeight，让内容决定高度，并添加gap */}
            <Grid container spacing={3}> {/* 移除flexGrow和height，让Grid自然布局 */}
              <Grid item xs={12}> {/* 每个图表占据整行宽度 */}
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}> {/* 移除minHeight，让内部Box决定高度 */}
                  <Typography variant="h6" align="center" sx={{ mb: 2 }}>排放构成</Typography>
                  <Box sx={{ height: '350px' }}> {/* 直接设置图表容器的固定高度 */}
                    <EmissionPieChart 
                      data={selectedRecord.calculatedEmissions?.breakdown} 
                      comparisonData={comparisonData}
                      compareMode={compareMode}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" align="center" sx={{ mb: 2 }}>排放强度</Typography>
                  <Box sx={{ height: '350px' }}>
                    <IntensityBarChart
                      recordData={{...selectedRecord.calculatedEmissions.intensity, regionName: selectedRecord.regionName}}
                      comparisonData={comparisonData}
                      compareMode={compareMode}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" align="center" sx={{ mb: 2 }}>年度排放量</Typography>
                  <Box sx={{ height: '350px' }}>
                    <YearlyEmissionBarChart
                      yearlyData={yearlyDataForSelectedRegion}
                      currentYear={selectedRecord.year}
                      comparisonData={comparisonData}
                      compareMode={compareMode}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" align="center" sx={{ mb: 2 }}>年均变化率</Typography>
                  <Box sx={{ height: '350px' }}>
                    <AnnualChangeLineChart 
                      yearlyData={yearlyDataForSelectedRegion} 
                      compareMode={compareMode}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </MotionBox>
    </AnimatePresence>
  );
};

export default ChartAnalysis;
