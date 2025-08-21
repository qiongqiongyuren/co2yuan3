import React, { useState, useEffect } from 'react';
import { Button, Grid, TextField, Accordion, AccordionSummary, AccordionDetails, Typography, Box, Autocomplete, List, ListItem, ListItemText, Collapse, Select, InputLabel, FormControl } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useForm, Controller } from 'react-hook-form';
import { formSections } from './formFields';
import factors from '../utils/emissionFactors';

const LOCAL_STORAGE_KEY = 'carbon_form_data';

const DataEntryForm = ({ regions, onSubmit, initialValues, isEditMode = false }) => {
  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      regionCode: '',
      year: '',
      ...formSections.flatMap(s => s.panels ? s.panels.flatMap(p => p.fields) : s.fields).reduce((acc, field) => {
        acc[field.name.join('.')] = '';
        return acc;
      }, {})
    }
  });
  const [singleItemEmissions, setSingleItemEmissions] = useState({});
  const [open, setOpen] = useState({});

  const watchedValues = watch();

  const handleCityClick = (cityCode) => {
    setOpen(prevOpen => ({ ...prevOpen, [cityCode]: !prevOpen[cityCode] }));
  };

  const handleRegionSelect = (regionCode) => {
    setValue('regionCode', regionCode);
  };

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
  }, [initialValues, isEditMode, reset]);

  useEffect(() => {
    if (!isEditMode) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(watchedValues));
    }
  }, [watchedValues, isEditMode]);

  const getNestedValue = (obj, path) => path.reduce((o, k) => (o && typeof o[k] !== 'undefined' ? o[k] : undefined), obj);

  const calculateEmission = (field) => {
    const value = getNestedValue(watchedValues, field.name);
    if (!value || value <= 0) return 0;

    const [category, type, fuel] = field.name;
    let emission = 0;
    
    if (category === 'fossilFuels' && factors[type] && factors[type][fuel]) {
        const factor = factors[type][fuel];
        emission = type === 'gas' ? (value / 10000) * factor : value * factor;
    } else if (category === 'mobileSources' && factors.mobile?.[type]?.[fuel]) {
        const factor = factors.mobile[type][fuel];
        emission = (value * factor) / 1000;
    } else if (category === 'indirectEmissions' && factors.indirect) {
        if (type === 'purchasedElectricity') emission = value * 10 * factors.indirect.electricity;
        else if (type === 'purchasedHeat') emission = value * (factors.indirect.heat / 1000);
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
              disabled={isEditMode}
              renderValue={(selected) => {
                const selectedRegion = regions.flatMap(c => [c, ...(c.children || [])]).find(r => r.code === selected);
                return selectedRegion ? selectedRegion.name : '';
              }}
            >
              {regions.map((city) => (
                <div key={city.code}>
                  <ListItem 
                    onClick={() => handleCityClick(city.code)}
                    onDoubleClick={() => handleRegionSelect(city.code)}
                  >
                    <ListItemText primary={city.name} />
                    {city.children && city.children.length > 0 ? (open[city.code] ? <ExpandLess /> : <ExpandMore />) : null}
                  </ListItem>
                  <Collapse in={open[city.code]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {city.children && city.children.map((district) => (
                        <ListItem 
                          key={district.code} 
                          sx={{ pl: 4 }}
                          onClick={() => handleRegionSelect(district.code)}
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
