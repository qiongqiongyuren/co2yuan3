import React, { useState } from 'react';
import axios from 'axios';
import {
  Container, Typography, Card, CardContent, CardHeader
} from '@mui/material';
import { motion } from 'framer-motion';
import LoginForm from '../components/LoginForm';
import RegistrationForm from '../components/RegistrationForm';

const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = async (credentials) => {
    const res = await axios.post('/api/auth/login', credentials);
    if (res.data.success) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.token);
    }
  };

  const handleRegister = async (userData) => {
    const res = await axios.post('/api/auth/register', userData);
    if (res.data.success) {
      alert('注册成功');
      setIsLogin(true);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
          <CardHeader title={
            <Typography component="h1" variant="h5">
              {isLogin ? '碳排放管理平台登录' : '注册新账号'}
            </Typography>
          } />
          <CardContent>
            {isLogin ? (
              <LoginForm
                onLogin={handleLogin}
                onSwitchToRegister={() => setIsLogin(false)}
              />
            ) : (
              <RegistrationForm
                onRegister={handleRegister}
                onSwitchToLogin={() => setIsLogin(true)}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default LoginPage;
