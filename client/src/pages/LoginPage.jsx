import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, TextField, Button, Card, CardContent,
  CardHeader, Box, CircularProgress, Alert, Grid, Link,
  MenuItem, FormControl, InputLabel, Select, List, ListItem, ListItemText, Collapse
} from '@mui/material';
import { motion } from 'framer-motion';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [unitName, setUnitName] = useState('');
  const [region, setRegion] = useState('');
  const [regions, setRegions] = useState([]);
  const [open, setOpen] = useState({});

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await axios.get('/api/regions');
        setRegions(res.data.data);
      } catch (err) {
        console.error('Failed to fetch regions', err);
      }
    };
    fetchRegions();
  }, []);

  const handleCityClick = (cityCode) => {
    setOpen(prevOpen => ({ ...prevOpen, [cityCode]: !prevOpen[cityCode] }));
  };

  const handleRegionSelect = (regionCode, regionName) => {
    setRegion(regionCode);
  };


  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/register', { email, password, unitName, region });
      if (res.data.success) {
        onLogin(res.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { account, password });
      if (res.data.success) {
        onLogin(res.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
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
                    <Link href="#" variant="body2" onClick={() => setIsLogin(false)}>
                      还没有账号? 注册
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="邮箱"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="密码"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="unitName"
                  label="单位名称"
                  id="unitName"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                />
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="region-select-label">地区</InputLabel>
                  <Select
                    labelId="region-select-label"
                    id="region-select"
                    value={region}
                    label="地区"
                    onChange={(e) => setRegion(e.target.value)}
                    renderValue={(selected) => {
                      const selectedRegion = regions.flatMap(c => [c, ...(c.children || [])]).find(r => r.code === selected);
                      return selectedRegion ? selectedRegion.name : '';
                    }}
                  >
                    {regions.map((city) => (
                      <div key={city.code}>
                        <ListItem 
                          button 
                          onClick={() => handleCityClick(city.code)}
                          onDoubleClick={() => handleRegionSelect(city.code, city.name)}
                        >
                          <ListItemText primary={city.name} />
                          {city.children && city.children.length > 0 ? (open[city.code] ? <ExpandLess /> : <ExpandMore />) : null}
                        </ListItem>
                        <Collapse in={open[city.code]} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                            {city.children && city.children.map((district) => (
                              <ListItem 
                                key={district.code} 
                                button 
                                sx={{ pl: 4 }}
                                onClick={() => handleRegionSelect(district.code, district.name)}
                              >
                                <ListItemText primary={district.name} />
                              </ListItem>
                            ))}
                          </List>
                        </Collapse>
                      </div>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : '注册'}
                </Button>
                <Grid container justifyContent="flex-end">
                  <Grid item>
                    <Link href="#" variant="body2" onClick={() => setIsLogin(true)}>
                      已有账号? 登录
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default LoginPage;
