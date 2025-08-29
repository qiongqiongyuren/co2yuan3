import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useCarbonData = () => {
  const [submittedData, setSubmittedData] = useState([]);
  const [allSubmittedData, setAllSubmittedData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const refetchAllData = useCallback(async (searchYear = '', searchRegion = '') => {
    setLoadingData(true);
    setError('');
    try {
      const res = await axios.get('/api/carbon-data');
      setAllSubmittedData(res.data.data);
      
      let filteredData = res.data.data;
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
    } catch (err) {
      setError("重新获取数据失败");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    refetchAllData();
  }, [refetchAllData]);

  const handleSearch = (searchYear, searchRegion) => {
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

  const handleSaveEdit = () => {
    refetchAllData();
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

  return {
    submittedData,
    allSubmittedData,
    loadingData,
    error,
    success,
    setError,
    setSuccess,
    refetchAllData,
    handleSearch,
    handleDelete,
    handleSaveEdit,
    handleFormSubmit,
    handleExport,
  };
};
