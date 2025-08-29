import React from 'react';
import { Card, CardHeader, CardContent } from '@mui/material';
import DataEntryForm from './DataEntryForm';

const DataEntryTab = ({ regions, onSubmit }) => {
  return (
    <Card>
      <CardHeader title="数据录入" />
      <CardContent>
        <DataEntryForm regions={regions} onSubmit={onSubmit} />
      </CardContent>
    </Card>
  );
};

export default DataEntryTab;
