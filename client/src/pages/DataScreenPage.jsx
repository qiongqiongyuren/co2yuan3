import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useDataScreen } from '../hooks/useDataScreen';
import { useRegions } from '../hooks/useRegions'; // 导入useRegions
import StatCardsGrid from '../components/StatCardsGrid';
import ChartsGrid from '../components/ChartsGrid';
import DataScreenRegionSelector from '../components/DataScreenRegionSelector'; // 导入DataScreenRegionSelector

const DataScreenPage = () => {
  const [selectedRegionCode, setSelectedRegionCode] = useState(''); // 添加地区选择状态
  const { data, loading, error } = useDataScreen(selectedRegionCode); // 将selectedRegionCode传递给hook
  const { regions } = useRegions(); // 获取地区数据

  const handleRegionChange = (event) => {
    setSelectedRegionCode(event.target.value);
  };

  if (loading) return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3, color: 'white' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ flexGrow: 1, textAlign: 'center' }}>数据大屏</Typography>
        <Box sx={{ width: 200 }}> {/* 限制选择器宽度 */}
          <DataScreenRegionSelector value={selectedRegionCode} onChange={handleRegionChange} />
        </Box>
      </Box>
      <StatCardsGrid data={data?.cardData} />
      <ChartsGrid charts={data} />
    </Box>
  );
};

export default DataScreenPage;
