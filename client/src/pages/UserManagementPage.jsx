import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  Button,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useRegions } from '../hooks/useRegions';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { regions, loading: regionsLoading, error: regionsError } = useRegions();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = users.filter(user => {
      const unitNameMatch = user.unitName?.toLowerCase().includes(lowercasedSearchTerm);
      const regionName = regionMap[user.region] || '';
      const regionMatch = regionName.toLowerCase().includes(lowercasedSearchTerm);
      return unitNameMatch || regionMatch;
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const regionMap = useMemo(() => {
    if (!regions || regions.length === 0) return {};
    const map = {};
    const traverse = (node) => {
      map[node.code] = node.name;
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    regions.forEach(traverse);
    return map;
  }, [regions]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const res = await axios.get('/api/auth/users', config);
      setUsers(res.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      await axios.put(`/api/auth/users/${userId}/role`, { role: newRole }, config);
      // Refresh users after role change
      fetchUsers();
    } catch (err) {
      setError('Failed to update user role.');
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      await axios.delete(`/api/auth/users/${selectedUser._id}`, config);
      // Refresh users after delete
      fetchUsers();
      handleClose();
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  if (loading || regionsLoading) return <Typography>加载中...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (regionsError) return <Typography color="error">加载地区数据失败</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        用户权限管理
      </Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="按单位名称或地区搜索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>邮箱</TableCell>
              <TableCell>单位名称</TableCell>
              <TableCell>地区</TableCell>
              <TableCell>角色</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.unitName}</TableCell>
                <TableCell>{regionMap[user.region] ? `${regionMap[user.region]} (${user.region})` : user.region}</TableCell>
                <TableCell>
                  <FormControl size="small">
                    <Select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    >
                      <MenuItem value="admin">管理员</MenuItem>
                      <MenuItem value="editor">编辑员</MenuItem>
                      <MenuItem value="viewer">观察员</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeleteClick(user)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您确定要删除用户 {selectedUser?.email} 吗？此操作无法撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleDeleteConfirm} color="primary" autoFocus>
            确认
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage;
