import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DataScreenPage from './pages/DataScreenPage';
import EmissionFactorManagementPage from './pages/EmissionFactorManagementPage'; // 导入排放因子管理页面
import DataUploadPage from './pages/DataUploadPage'; // 导入数据上传页面
import axios from 'axios';
import { Box, CircularProgress } from '@mui/material';
import VideoBackground from './components/VideoBackground';
import AiChat from './components/AiChat'; // 导入新组件

function App() {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const handleLogin = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
    };

    useEffect(() => {
        const interceptor = axios.interceptors.request.use(
            config => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            error => Promise.reject(error)
        );

        return () => {
            axios.interceptors.request.eject(interceptor);
        };
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Router>
            <VideoBackground />
            <Routes>
                <Route path="/login" element={!token ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={token ? <DashboardPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
                <Route path="/data-screen" element={token ? <DataScreenPage /> : <Navigate to="/login" />} />
                <Route path="/emission-factors" element={token ? <EmissionFactorManagementPage /> : <Navigate to="/login" />} /> {/* 添加排放因子管理路由 */}
                <Route path="/upload-data" element={token ? <DataUploadPage /> : <Navigate to="/login" />} /> {/* 添加数据上传路由 */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
            {/* 在所有页面的底部渲染AI助手 */}
            <AiChat />
        </Router>
    );
}

export default App;
