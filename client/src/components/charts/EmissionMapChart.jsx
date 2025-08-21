import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import axios from 'axios';
import geoJson from '../../../public/geo/region_150000.json'; // Direct import

const EmissionMapChart = () => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const renderMap = async () => {
            try {
                if (!chartRef.current) return;

                const dataResponse = await axios.get('/api/carbon-data');
                const carbonData = dataResponse.data.data;

                chartInstanceRef.current = echarts.init(chartRef.current);
                const mapName = 'region_150000';
                echarts.registerMap(mapName, geoJson);

                const mapSeriesData = carbonData.map(item => ({
                    name: item.regionName.split('/')[0],
                    value: (item.calculatedEmissions?.intensity?.perCapita || 0).toFixed(2)
                }));

                const option = {
                    title: { text: '内蒙古各市碳排放强度 (人均)', left: 'center' },
                    tooltip: { trigger: 'item', formatter: '{b}<br/>人均排放强度: {c} (tCO₂/人)' },
                    visualMap: {
                        min: 0,
                        max: Math.max(...mapSeriesData.map(d => parseFloat(d.value) || 0), 1),
                        calculable: true,
                        inRange: { color: ['#E0F3F8', '#ABD9E9', '#74ADD1', '#4575B4', '#313695'].reverse() },
                        textStyle: { color: '#333' }
                    },
                    series: [{
                        name: '人均排放强度',
                        type: 'map',
                        map: mapName,
                        roam: true,
                        label: { show: true, formatter: '{b}', color: '#000', fontSize: 12 },
                        emphasis: { label: { show: true }, itemStyle: { areaColor: '#FFD700' } },
                        data: mapSeriesData
                    }]
                };

                chartInstanceRef.current.setOption(option);
                setLoading(false);

            } catch (err) {
                console.error("Failed to render map:", err);
                setError("无法加载地图数据，请稍后重试。");
                setLoading(false);
            }
        };

        renderMap();

        const handleResize = () => {
            chartInstanceRef.current?.resize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chartInstanceRef.current?.dispose();
        };
    }, []);

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>
            {loading && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>地图加载中...</div>}
            <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
};

export default EmissionMapChart;
