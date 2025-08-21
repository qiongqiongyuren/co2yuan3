import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

const DataCard = ({ title, value, change, unit, changeUnit, isPositive }) => {
  const ChangeIcon = isPositive ? ArrowUpward : ArrowDownward;
  const changeColor = isPositive ? 'error.main' : 'success.main';

  return (
    <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(10px)', color: 'white', height: '100%' }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Typography variant="h4" component="div" gutterBottom>
        {value} <Typography variant="body1" component="span">{unit}</Typography>
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', color: changeColor }}>
        <ChangeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
        <Typography variant="body2">
          较去年{isPositive ? '上升' : '下降'} {change} {changeUnit}
        </Typography>
      </Box>
    </Paper>
  );
};

export default DataCard;
