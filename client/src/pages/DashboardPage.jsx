import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Typography, Button, Card, CardContent, CardHeader,
  AppBar, Toolbar, Tabs, Tab, Box, Collapse, Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Logout } from '@mui/icons-material';
import { useCarbonData } from '../hooks/useCarbonData';
import { useRegions } from '../hooks/useRegions';
import DataEntryTab from '../components/DataEntryTab';
import HistoricalDataTable from '../components/HistoricalDataTable';
import ChartAnalysis from '../components/ChartAnalysis';
import SearchBar from '../components/SearchBar';
import EmissionMapChart from '../components/charts/EmissionMapChart';

const MotionBox = motion(Box);

const DashboardPage = ({ onLogout }) => {
  const {
    submittedData,
    allSubmittedData,
    loadingData,
    error,
    success,
    setError,
    setSuccess,
    handleSearch,
    handleDelete,
    handleSaveEdit,
    handleFormSubmit,
    handleExport,
  } = useCarbonData();

  const { regions } = useRegions();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showHistory, setShowHistory] = useState(true);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedRecord(null);
  };

  const handleSelectRecord = (record) => {
    setSelectedRecord(record);
    setTimeout(() => {
      document.getElementById('chart-analysis-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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
              <DataEntryTab regions={regions} onSubmit={handleFormSubmit} />
            )}

            {activeTab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}> {/* 恢复原始Box样式 */}
                <Card>
                  <CardHeader title="排放地图" />
                  <CardContent sx={{ height: '75vh' }}>
                    <EmissionMapChart />
                  </CardContent>
                </Card>
                <Card> {/* 恢复原始Card样式 */}
                  <CardHeader
                    title="历史提交数据"
                    action={
                      <Button onClick={() => setShowHistory(!showHistory)}>
                        {showHistory ? '隐藏历史记录' : '显示历史记录'}
                      </Button>
                    }
                  />
                  <Collapse in={showHistory}> {/* 恢复原始Collapse样式 */}
                    <CardContent> {/* 恢复原始CardContent样式 */}
                      <SearchBar
                        regions={regions}
                        onSearch={handleSearch}
                        onExport={handleExport}
                        isExportDisabled={submittedData.length === 0}
                      />
                      <HistoricalDataTable
                        data={submittedData}
                        loading={loadingData}
                        onSelect={handleSelectRecord}
                        onDelete={handleDelete}
                        onSaveEdit={handleSaveEdit}
                      />
                    </CardContent>
                  </Collapse>
                </Card>

                <ChartAnalysis
                  selectedRecord={selectedRecord}
                  allData={allSubmittedData}
                />
              </Box>
            )}
          </MotionBox>
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default DashboardPage;
