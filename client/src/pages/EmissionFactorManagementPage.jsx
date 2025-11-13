import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const EmissionFactorManagementPage = () => {
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingFactor, setEditingFactor] = useState(null); // Factor being edited
  const [openDialog, setOpenDialog] = useState(false); // For add/edit dialog
  const [currentFactor, setCurrentFactor] = useState({ // Factor data in dialog
    category: '',
    type: '',
    name: '',
    value: '',
    unit: '',
    description: ''
  });

  const categories = [
    { value: 'solid', label: '固体燃料' },
    { value: 'liquid', label: '液体燃料' },
    { value: 'gas', label: '气体燃料' },
    { value: 'indirect', label: '间接排放' },
    { value: 'mobile', label: '移动源' }
  ];
  const mobileTypes = [
    { value: 'fuel', label: '燃料' },
    { value: 'mileage', label: '里程' }
  ];

  useEffect(() => {
    fetchFactors();
  }, []);

  const fetchFactors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/emission-factors`);
      setFactors(response.data);
    } catch (err) {
      setError(err.response?.data?.message || '获取排放因子失败');
      console.error('Error fetching emission factors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentFactor({
      category: '',
      type: '',
      name: '',
      value: '',
      unit: '',
      description: ''
    });
    setEditingFactor(null);
    setOpenDialog(true);
  };

  const handleEditClick = (factor) => {
    setCurrentFactor({ ...factor });
    setEditingFactor(factor._id);
    setOpenDialog(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('确定要删除此排放因子吗？')) {
      try {
        await axios.delete(`${API_BASE_URL}/emission-factors/${id}`);
        fetchFactors(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.message || '删除排放因子失败');
        console.error('Error deleting emission factor:', err);
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingFactor(null);
    setError(null); // Clear error on close
  };

  const handleSaveFactor = async () => {
    setError(null);
    try {
      if (editingFactor) {
        // Update existing factor
        await axios.put(`${API_BASE_URL}/emission-factors/${editingFactor}`, currentFactor);
      } else {
        // Create new factor
        await axios.post(`${API_BASE_URL}/emission-factors`, currentFactor);
      }
      fetchFactors(); // Refresh list
      handleDialogClose();
    } catch (err) {
      setError(err.response?.data?.message || '保存排放因子失败');
      console.error('Error saving emission factor:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentFactor(prev => ({ ...prev, [name]: value }));
  };

  const handleInitializeFactors = async () => {
    if (window.confirm('确定要初始化排放因子吗？这将从硬编码文件导入数据，并跳过已存在的因子。')) {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${API_BASE_URL}/emission-factors/initialize`);
        alert(response.data.message);
        fetchFactors();
      } catch (err) {
        setError(err.response?.data?.message || '初始化排放因子失败');
        console.error('Error initializing emission factors:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        排放因子管理
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          添加新因子
        </Button>
        <Button variant="outlined" onClick={handleInitializeFactors}>
          初始化默认因子
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>类别</TableCell>
              <TableCell>类型</TableCell>
              <TableCell>名称</TableCell>
              <TableCell>值</TableCell>
              <TableCell>单位</TableCell>
              <TableCell>描述</TableCell>
              <TableCell>最后更新</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {factors.map((factor) => (
              <TableRow key={factor._id}>
                <TableCell>
                  {categories.find(cat => cat.value === factor.category)?.label || factor.category}
                </TableCell>
                <TableCell>
                  {factor.category === 'mobile'
                    ? mobileTypes.find(type => type.value === factor.type)?.label || factor.type
                    : factor.type}
                </TableCell>
                <TableCell>{factor.name}</TableCell>
                <TableCell>{factor.value}</TableCell>
                <TableCell>{factor.unit}</TableCell>
                <TableCell>{factor.description}</TableCell>
                <TableCell>{new Date(factor.lastUpdated).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEditClick(factor)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteClick(factor._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{editingFactor ? '编辑排放因子' : '添加排放因子'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>类别</InputLabel>
            <Select
              name="category"
              value={currentFactor.category}
              onChange={handleChange}
              label="类别"
            >
              {categories.map(cat => (
                <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {currentFactor.category === 'mobile' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>移动源类型</InputLabel>
              <Select
                name="type"
                value={currentFactor.type}
                onChange={handleChange}
                label="移动源类型"
              >
                {mobileTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            margin="normal"
            fullWidth
            label="名称"
            name="name"
            value={currentFactor.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="值"
            name="value"
            type="number"
            value={currentFactor.value}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="单位"
            name="unit"
            value={currentFactor.unit}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="描述"
            name="description"
            value={currentFactor.description}
            onChange={handleChange}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} startIcon={<CancelIcon />}>取消</Button>
          <Button onClick={handleSaveFactor} startIcon={<SaveIcon />} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmissionFactorManagementPage;
