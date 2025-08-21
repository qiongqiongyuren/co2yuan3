import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Button, Grid, Card, CardContent, CardHeader,
  AppBar, Toolbar, Tabs, Tab, Box, TextField, Select, MenuItem, InputLabel, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, IconButton, Collapse, Checkbox, FormControlLabel, Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Logout, Edit, Delete, ExpandMore, ExpandLess, Search } from '@mui/icons-material';
import DataEntryForm from '../components/DataEntryForm';
import EmissionPieChart from '../components/charts/EmissionPieChart';
import IntensityBarChart from '../components/charts/IntensityBarChart';
import YearlyEmissionBarChart from '../components/charts/YearlyEmissionBarChart';
import AnnualChangeLineChart from '../components/charts/AnnualChangeLineChart';
import EmissionMapChart from '../components/charts/EmissionMapChart';
import InlineEditForm from '../components/InlineEditForm';

const MotionBox = motion(Box);

const DashboardPage = ({ onLogout }) => {
  const [regions, setRegions] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [submittedData, setSubmittedData] = useState([]);
  const [allSubmittedData, setAllSubmittedData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [editingRowKey, setEditingRowKey] = useState('');
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [searchYear, setSearchYear] = useState('');
  const [searchRegion, setSearchRegion] = useState('');
  const [showHistory, setShowHistory] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const yearlyDataForSelectedRegion = allSubmittedData.filter(
    d => selectedRecord && d.regionCode === selectedRecord.regionCode
  );

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await axios.get('/api/regions');
        setRegions(res.data.data);
      } catch (err) {
        setError("获取行政区划数据失败");
        console.error("Failed to fetch regions", err);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const loadAllData = async () => {
      if (activeTab === 1 && allSubmittedData.length === 0) {
        setLoadingData(true);
        try {
          const res = await axios.get('/api/carbon-data');
          setAllSubmittedData(res.data.data);
          setSubmittedData(res.data.data);
        } catch (err) {
          setError("获取全部历史数据失败");
        } finally {
          setLoadingData(false);
        }
      }
    };
    loadAllData();
  }, [activeTab, allSubmittedData.length]);

  const handleSearch = () => {
    let filteredData = [...allSubmittedData];
    if (searchYear) {
      filteredData = filteredData.filter(d => d.year.toString() === searchYear);
    }
    if (searchRegion) {
      const isProvince = searchRegion.endsWith('0000');
      const isCity = searchRegion.endsWith('00') && !isProvince;
      if (isProvince) {
        const prefix = searchRegion.substring(0, 2);
        filteredData = filteredData.filter(d => d.regionCode.startsWith(prefix));
      } else if (isCity) {
        const prefix = searchRegion.substring(0, 4);
        filteredData = filteredData.filter(d => d.regionCode.startsWith(prefix));
      } else {
        filteredData = filteredData.filter(d => d.regionCode === searchRegion);
      }
    }
    setSubmittedData(filteredData);
  };

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedRecord(null);
    setCompareMode(false);
    setComparisonData([]);
  };

  const handleViewCharts = (record) => {
    setSelectedRecord(record);
    setCompareMode(false);
    setComparisonData([]);
    setTimeout(() => {
      document.getElementById('chart-analysis-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const refetchAllData = async () => {
    setLoadingData(true);
    try {
      const res = await axios.get('/api/carbon-data');
      setAllSubmittedData(res.data.data);
      let filteredData = res.data.data;
      if (searchYear) filteredData = filteredData.filter(d => d.year.toString() === searchYear);
      if (searchRegion) {
        const isProvince = searchRegion.endsWith('0000');
        const isCity = searchRegion.endsWith('00') && !isProvince;
        if (isProvince) {
            const prefix = searchRegion.substring(0, 2);
            filteredData = filteredData.filter(d => d.regionCode.startsWith(prefix));
        } else if (isCity) {
            const prefix = searchRegion.substring(0, 4);
            filteredData = filteredData.filter(d => d.regionCode.startsWith(prefix));
        } else {
            filteredData = filteredData.filter(d => d.regionCode === searchRegion);
        }
      }
      setSubmittedData(filteredData);
    } catch (err) {
      setError("重新获取数据失败");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveEdit = () => {
    setEditingRowKey('');
    refetchAllData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("确定删除此条记录吗?")) {
      try {
        await axios.delete(`/api/carbon-data/${id}`);
        setSuccess('记录已删除');
        refetchAllData();
      } catch (err) {
        setError(err.response?.data?.error || '删除失败');
      }
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get('/api/reports/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = res.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || 'report.csv';
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('导出失败');
    }
  };

  const handleFormSubmit = async (values) => {
    const { year, regionCode: regionCodeArray, ...activityData } = values;
    const regionCode = Array.isArray(regionCodeArray) ? regionCodeArray[regionCodeArray.length - 1] : regionCodeArray;
    const payload = { year, regionCode, activityData };
    try {
      await axios.post('/api/carbon-data', payload);
      setSuccess('数据提交成功!');
      localStorage.removeItem('carbon_form_data');
      refetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || '数据提交失败');
    }
  };

  const toggleRowExpansion = (id) => {
    const newExpandedRowKeys = expandedRowKeys.includes(id) ? expandedRowKeys.filter(key => key !== id) : [...expandedRowKeys, id];
    setExpandedRowKeys(newExpandedRowKeys);
    if (!newExpandedRowKeys.includes(id)) setEditingRowKey('');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            碳排放数据监测系统
          </Typography>
          <Button color="inherit" startIcon={<Logout />} onClick={onLogout}>
            退出登录
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="数据填报" />
            <Tab label="数据看板" />
            <Tab label="数据大屏" component={Link} to="/data-screen" />
          </Tabs>
        </Box>

        <AnimatePresence mode="wait">
          <MotionBox
            key={activeTab}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 0 && (
              <Card>
                <CardHeader title="数据录入" />
                <CardContent>
                  <DataEntryForm regions={regions} onSubmit={handleFormSubmit} />
                </CardContent>
              </Card>
            )}

            {activeTab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Card>
                  <CardHeader title="排放地图" />
                  <CardContent sx={{ height: '75vh' }}>
                    <EmissionMapChart />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader
                    title="历史提交数据"
                    action={
                      <Button onClick={() => setShowHistory(!showHistory)}>
                        {showHistory ? '隐藏历史记录' : '显示历史记录'}
                      </Button>
                    }
                  />
                  <Collapse in={showHistory}>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                        <TextField
                          type="number"
                          label="年份"
                          variant="outlined"
                          size="small"
                          value={searchYear}
                          onChange={(e) => setSearchYear(e.target.value)}
                        />
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                          <InputLabel>行政区</InputLabel>
                          <Select value={searchRegion} label="行政区" onChange={(e) => setSearchRegion(e.target.value)}>
                            <MenuItem value=""><em>所有行政区</em></MenuItem>
                            {regions.map(r => <MenuItem key={r.code} value={r.code}>{r.name}</MenuItem>)}
                          </Select>
                        </FormControl>
                        <Button variant="contained" startIcon={<Search />} onClick={handleSearch}>搜索</Button>
                        <Button variant="outlined" onClick={handleExport} disabled={submittedData.length === 0}>导出为 CSV</Button>
                      </Box>
                      {loadingData ? <CircularProgress /> : (
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
                              {submittedData.map(record => (
                                <React.Fragment key={record._id}>
                                  <TableRow hover>
                                    <TableCell>{record.year}</TableCell>
                                    <TableCell>{record.regionName}</TableCell>
                                    <TableCell>{record.calculatedEmissions.totalEmissions.toFixed(2)}</TableCell>
                                    <TableCell>
                                      <Button size="small" onClick={() => handleViewCharts(record)}>图表</Button>
                                      <IconButton size="small" onClick={() => handleDelete(record._id)}><Delete /></IconButton>
                                      <IconButton size="small" onClick={() => toggleRowExpansion(record._id)}>
                                        {expandedRowKeys.includes(record._id) ? <ExpandLess /> : <ExpandMore />}
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                                      <Collapse in={expandedRowKeys.includes(record._id)} timeout="auto" unmountOnExit>
                                        <Box sx={{ margin: 1 }}>
                                          {editingRowKey === record._id ? (
                                            <InlineEditForm record={record} onSave={handleSaveEdit} onCancel={() => setEditingRowKey('')} />
                                          ) : (
                                            <Box>
                                              <Typography variant="h6">分类排放详情:</Typography>
                                              <ul>
                                                <li>化石燃料燃烧: {(record.calculatedEmissions?.breakdown?.fossilFuels || 0).toFixed(2)} tCO₂</li>
                                                <li>移动源燃烧: {(record.calculatedEmissions?.breakdown?.mobileSources || 0).toFixed(2)} tCO₂</li>
                                                <li>外购电力: {(record.calculatedEmissions?.breakdown?.electricity || 0).toFixed(2)} tCO₂</li>
                                                <li>外购热力: {(record.calculatedEmissions?.breakdown?.heat || 0).toFixed(2)} tCO₂</li>
                                              </ul>
                                              <Button startIcon={<Edit />} onClick={() => setEditingRowKey(record._id)}>编辑</Button>
                                            </Box>
                                          )}
                                        </Box>
                                      </Collapse>
                                    </TableCell>
                                  </TableRow>
                                </React.Fragment>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </Collapse>
                </Card>

                {/* Chart Analysis Section */}
                <AnimatePresence>
                  {selectedRecord && (
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
                        <CardContent>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Paper sx={{ p: 2, height: '60vh' }}>
                                <Typography variant="h6" align="center">排放构成</Typography>
                                <EmissionPieChart 
                                  data={selectedRecord.calculatedEmissions.breakdown} 
                                  comparisonData={comparisonData}
                                  compareMode={compareMode}
                                />
                              </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Paper sx={{ p: 2, height: '60vh' }}>
                                <Typography variant="h6" align="center">排放强度</Typography>
                                <IntensityBarChart
                                  recordData={{...selectedRecord.calculatedEmissions.intensity, regionName: selectedRecord.regionName}}
                                  comparisonData={comparisonData}
                                  compareMode={compareMode}
                                />
                              </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Paper sx={{ p: 2, height: '60vh' }}>
                                <Typography variant="h6" align="center">年度排放量</Typography>
                                <YearlyEmissionBarChart
                                  yearlyData={yearlyDataForSelectedRegion}
                                  currentYear={selectedRecord.year}
                                  comparisonData={comparisonData}
                                  compareMode={compareMode}
                                />
                              </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Paper sx={{ p: 2, height: '60vh' }}>
                                <Typography variant="h6" align="center">年均变化率</Typography>
                                <AnnualChangeLineChart 
                                  yearlyData={yearlyDataForSelectedRegion} 
                                  compareMode={compareMode}
                                />
                              </Paper>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </MotionBox>
                  )}
                </AnimatePresence>
              </Box>
            )}
          </MotionBox>
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default DashboardPage;
