import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Collapse, Box, CircularProgress
} from '@mui/material';
import { Delete, ExpandMore, ExpandLess } from '@mui/icons-material';
import TableRowDetail from './TableRowDetail';

const HistoricalDataTable = ({ data, loading, onSelect, onDelete, onSaveEdit }) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [editingRowKey, setEditingRowKey] = useState('');

  const toggleRowExpansion = (id) => {
    const newExpandedRowKeys = expandedRowKeys.includes(id)
      ? expandedRowKeys.filter(key => key !== id)
      : [...expandedRowKeys, id];
    setExpandedRowKeys(newExpandedRowKeys);
    if (!newExpandedRowKeys.includes(id)) {
      setEditingRowKey('');
    }
  };

  const handleEdit = (id) => {
    setEditingRowKey(id);
    if (!expandedRowKeys.includes(id)) {
      setExpandedRowKeys([...expandedRowKeys, id]);
    }
  };

  const handleSave = () => {
    setEditingRowKey('');
    onSaveEdit();
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>年份</TableCell>
            <TableCell>行政区划</TableCell>
            <TableCell>总排放量 (tCO₂)</TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(record => (
            <React.Fragment key={record._id}>
              <TableRow hover>
                <TableCell>{record.year}</TableCell>
                <TableCell>{record.regionName}</TableCell>
                <TableCell>{record.calculatedEmissions.totalEmissions.toFixed(2)}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => onSelect(record)}>图表</Button>
                  <IconButton size="small" onClick={() => onDelete(record._id)}><Delete /></IconButton>
                  <IconButton size="small" onClick={() => toggleRowExpansion(record._id)}>
                    {expandedRowKeys.includes(record._id) ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                  <Collapse in={expandedRowKeys.includes(record._id)} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>
                      <TableRowDetail
                        record={record}
                        isEditing={editingRowKey === record._id}
                        onEdit={() => handleEdit(record._id)}
                        onSave={handleSave}
                        onCancel={() => setEditingRowKey('')}
                      />
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HistoricalDataTable;
