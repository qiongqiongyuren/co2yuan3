import React, { useState } from 'react';
import {
  TextField, Button, Box, CircularProgress, Alert, Grid, Link
} from '@mui/material';

const LoginForm = ({ onLogin, onSwitchToRegister }) => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // This logic will be passed in via onLogin prop from the parent LoginPage
      await onLogin({ account, password });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        margin="normal"
        required
        fullWidth
        id="account"
        label="账号 (8位)"
        name="account"
        autoComplete="username"
        autoFocus
        value={account}
        onChange={(e) => setAccount(e.target.value)}
        inputProps={{
          pattern: "\\d{8}",
          title: "请输入8位数字账号"
        }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="密码 (6位)"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        inputProps={{
          minLength: "6",
          title: "请输入至少6位密码"
        }}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : '登录'}
      </Button>
      <Grid container justifyContent="flex-end">
        <Grid item>
          <Link href="#" variant="body2" onClick={onSwitchToRegister}>
            还没有账号? 注册
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoginForm;
