import React, { useState, useEffect } from 'react';
import { Button, Grid, TextField, Accordion, AccordionSummary, AccordionDetails, Typography, Box, Autocomplete, List, ListItem, ListItemText, Collapse, Select, InputLabel, FormControl } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useForm, Controller } from 'react-hook-form';
import { formSections } from './formFields';
import axios from 'axios'; // 导入 axios

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const LOCAL_STORAGE_KEY = 'carbon_form_data';

const DataEntryForm = ({ regions, onSubmit, initialValues, isEditMode = false }) => {
  // Determine initial regionCode based on user data from localStorage
  const getInitialRegionCode = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // If not root user and has a region, use it as default
      if (user.email !== 'root@root.com' && user.region) {
        return user.region;
      }
    }
    return ''; // Default to empty if no specific user region or is root
  };

  const [emissionFactors, setEmissionFactors] = useState({}); // 新增：存储从数据库获取的排放因子
  const [factorsLoading, setFactorsLoading] = useState(true); // 新增：排放因子加载状态
  const [factorsError, setFactorsError] = useState(null); // 新增：排放因子错误状态

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      regionCode: getInitialRegionCode(), // Initialize regionCode here
      year: '',
      ...formSections.flatMap(s => s.panels ? s.panels.flatMap(p => p.fields) : s.fields).reduce((acc, field) => {
        acc[field.name.join('.')] = '';
        return acc;
      }, {})
    }
  });
  const [singleItemEmissions, setSingleItemEmissions] = useState({});
  const [open, setOpen] = useState({});
  const [currentUserRegion, setCurrentUserRegion] = useState(''); // State for user's region
  const [isRootUser, setIsRootUser] = useState(false); // State for root user status

  const watchedValues = watch();

  const handleCityClick = (cityCode) => {
    setOpen(prevOpen => ({ ...prevOpen, [cityCode]: !prevOpen[cityCode] }));
  };

  const handleRegionSelect = (regionCode) => {
    setValue('regionCode', regionCode);
  };

  // Effect for fetching user info
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    let tempUserRegion = '';
    let tempIsRootUser = false;

    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.email === 'root@root.com') {
        tempIsRootUser = true;
      } else {
        tempUserRegion = user.region;
      }
    }
    setCurrentUserRegion(tempUserRegion);
    setIsRootUser(tempIsRootUser);
  }, []);

  // Effect for fetching emission factors
  useEffect(() => {
    const fetchEmissionFactors = async () => {
      setFactorsLoading(true);
      setFactorsError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/emission-factors`);
        const formattedFactors = {};
        response.data.forEach(factor => {
          if (!formattedFactors[factor.category]) {
            formattedFactors[factor.category] = {};
          }
          if (factor.category === 'mobile' && (factor.type === 'fuel' || factor.type === 'mileage')) {
            if (!formattedFactors[factor.category][factor.type]) {
              formattedFactors[factor.category][factor.type] = {};
            }
            formattedFactors[factor.category][factor.type][factor.name] = factor.value;
          } else {
            formattedFactors[factor.category][factor.name] = factor.value;
          }
        });
        setEmissionFactors(formattedFactors);
      } catch (err) {
        setFactorsError('获取排放因子失败');
        console.error('Error fetching emission factors:', err);
      } finally {
        setFactorsLoading(false);
      }
    };

    fetchEmissionFactors();
  }, []);

  // Effect for form reset based on edit mode or local storage
  useEffect(() => {
    if (isEditMode && initialValues) {
      const flattenedData = {
        year: initialValues.year,
        regionCode: initialValues.regionCode,
        ...initialValues.activityData.fossilFuels?.solid,
        ...initialValues.activityData.fossilFuels?.liquid,
        ...initialValues.activityData.fossilFuels?.gas,
        ...initialValues.activityData.mobileSources,
        ...initialValues.activityData.indirectEmissions,
        ...initialValues.activityData.intensityMetrics,
      };
      reset(flattenedData);
    } else {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        reset(JSON.parse(savedData));
      }
    }
  }, [initialValues, isEditMode, reset, setValue]);

  useEffect(() => {
    if (!isEditMode) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(watchedValues));
    }
  }, [watchedValues, isEditMode]);

  const getNestedValue = (obj, path) => path.reduce((o, k) => (o && typeof o[k] !== 'undefined' ? o[k] : undefined), obj);

  const calculateEmission = (field) => {
    const value = getNestedValue(watchedValues, field.name);
    if (!value || value <= 0 || factorsLoading || factorsError) return 0; // 增加加载和错误检查

    const [category, type, fuel] = field.name;
    let emission = 0;
    
    if (category === 'fossilFuels' && emissionFactors[type] && emissionFactors[type][fuel]) {
        const factor = emissionFactors[type][fuel];
        emission = type === 'gas' ? (value / 10000) * factor : value * factor;
    } else if (category === 'mobileSources' && emissionFactors.mobile?.[type]?.[fuel]) {
        const factor = emissionFactors.mobile[type][fuel];
        emission = (value * factor) / 1000;
    } else if (category === 'indirectEmissions' && emissionFactors.indirect) {
        if (type === 'purchasedElectricity') emission = value * 10 * emissionFactors.indirect.electricity;
        else if (type === 'purchasedHeat') emission = value * (emissionFactors.indirect.heat / 1000);
    }
    return emission;
  };

  const handleClearForm = () => {
    reset({});
    if (!isEditMode) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setSingleItemEmissions({});
  };

  const renderFormItem = (field) => {
    const key = field.name.join('_');
    const fieldName = field.name.join('.');
    const emissionValue = calculateEmission(field);

    return (
      <Grid container key={key} spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={8}>
          <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            render={({ field: controllerField }) => (
              <TextField
                {...controllerField}
                type="number"
                label={field.label}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                    inputProps: { 
                        min: 0 
                    }
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={4} sx={{ textAlign: 'right' }}>
          {emissionValue > 0 && (
            <Typography variant="caption" color="textSecondary">
              ≈ {emissionValue.toFixed(2)} tCO₂
            </Typography>
          )}
        </Grid>
      </Grid>
    );
  };

  const generateAccordions = (sections) => {
    return sections.map(section => (
      <Accordion key={section.key}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{section.header}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {section.panels ? generateAccordions(section.panels) : section.fields.map(renderFormItem)}
        </AccordionDetails>
      </Accordion>
    ));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="regionCode"
        control={control}
        rules={{ required: '请选择行政区划' }}
        render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth error={!!error} sx={{ mb: 3 }}>
            <InputLabel id="region-select-label">行政区划</InputLabel>
            <Select
              {...field}
              labelId="region-select-label"
              label="行政区划"
              disabled={isEditMode || (!isRootUser && currentUserRegion)} // Disable if in edit mode OR (not root user AND has a region)
              renderValue={(selected) => {
                if (!regions || regions.length === 0) {
                  // If regions are not loaded yet, display the raw code or a loading indicator
                  return selected || '加载中...';
                }
                const selectedRegion = regions.flatMap(c => [c, ...(c.children || [])]).find(r => r.code === selected);
                return selectedRegion ? selectedRegion.name : selected; // Fallback to code if name not found
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#1e1e1e !important', // 使用具体颜色值并提升优先级
                    backgroundImage: 'none', // 确保没有背景图片干扰
                  },
                },
              }}
            >
              {regions.map((city) => (
                <div key={city.code}>
                  <ListItem>
                    <Box 
                      onClick={(event) => { // 单击用于展开/折叠
                        event.stopPropagation(); // 阻止事件冒泡，防止Select意外关闭
                        handleCityClick(city.code);
                      }} 
                      onDoubleClick={(event) => { // 双击用于选择城市
                        event.stopPropagation(); // 阻止事件冒泡，防止Select意外关闭
                        handleRegionSelect(city.code);
                      }}
                      sx={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer' }} // 确保整个区域可点击
                    >
                      <ListItemText primary={city.name} />
                      {Array.isArray(city.children) && city.children.length > 0 ? (open[city.code] ? <ExpandLess /> : <ExpandMore />) : null}
                    </Box>
                  </ListItem>
                  <Collapse in={open[city.code]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {Array.isArray(city.children) && city.children.map((district) => ( // 确保 children 是数组
                        <ListItem 
                          key={district.code} 
                          sx={{ pl: 4 }}
                          onClick={(event) => { // 单击用于选择区县
                            event.stopPropagation(); // 阻止事件冒泡，防止Select意外关闭
                            handleRegionSelect(district.code);
                          }}
                        >
                          <ListItemText primary={district.name} />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </div>
              ))}
            </Select>
            {error && <Typography color="error" variant="caption">{error.message}</Typography>}
          </FormControl>
        )}
      />
      <Controller
        name="year"
        control={control}
        rules={{ required: '请输入数据年份' }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            type="number"
            label="数据年份"
            fullWidth
            variant="outlined"
            error={!!error}
            helperText={error ? error.message : '例如: 2023'}
            disabled={isEditMode}
            sx={{ mb: 3 }}
          />
        )}
      />

      {generateAccordions(formSections)}

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button type="submit" variant="contained" color="primary">
          {isEditMode ? '更新数据' : '提交数据'}
        </Button>
        {!isEditMode && (
          <Button variant="outlined" onClick={handleClearForm}>
            清空表单
          </Button>
        )}
      </Box>
    </form>
  );
};

export default DataEntryForm;
