import React, { useRef, useEffect } from 'react';
import { Card, Typography } from 'antd';
import * as echarts from 'echarts';
import { formatMilliseconds } from '@/utils/formatters';

const { Text } = Typography;

interface DataPoint {
  date: string;
  avgResponseTime: number;
  requestCount?: number;
  errorRate?: number;
}

interface ApiPerformanceTrendChartProps {
  title: string;
  data: DataPoint[];
  loading: boolean;
  type: 'response-time' | 'request-count' | 'error-rate';
}

const ApiPerformanceTrendChart: React.FC<ApiPerformanceTrendChartProps> = ({ title, data, loading, type }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 初始化或销毁图表
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      if (data && data.length > 0) {
        renderChart();
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [data, type]);

  // 监听窗口大小变化，重新调整图表
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const renderChart = () => {
    if (!chartInstance.current) return;

    // 格式化日期
    const formatDate = (dateStr: string) => {
      return dateStr.split('T')[0];
    };

    // 准备数据和配置
    let option: echarts.EChartsOption;

    if (type === 'response-time') {
      // 响应时间趋势图
      option = {
        tooltip: {
          trigger: 'axis',
          formatter: function (params: any) {
            const dataIndex = params[0].dataIndex;
            const date = formatDate(data[dataIndex].date);
            const value = formatMilliseconds(data[dataIndex].avgResponseTime);
            return `日期: ${date}<br/>平均响应时间: ${value}`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.map(item => formatDate(item.date)),
          axisLabel: {
            interval: 0,
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: '响应时间(ms)',
          axisLabel: {
            formatter: (value: number) => {
              return value.toFixed(0);
            }
          }
        },
        series: [
          {
            name: '平均响应时间',
            type: 'line',
            areaStyle: {
              opacity: 0.3,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(24, 144, 255, 0.7)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
              ])
            },
            itemStyle: {
              color: '#1890ff'
            },
            lineStyle: {
              width: 2
            },
            emphasis: {
              focus: 'series'
            },
            data: data.map(item => item.avgResponseTime)
          }
        ]
      };
    } else if (type === 'request-count') {
      // 请求数量趋势图
      option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.map(item => formatDate(item.date)),
          axisLabel: {
            interval: 0,
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: '请求数量'
        },
        series: [
          {
            name: '请求数量',
            type: 'bar',
            barWidth: '60%',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#52c41a' },
                { offset: 1, color: '#95de64' }
              ])
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#389e0d' },
                  { offset: 1, color: '#73d13d' }
                ])
              }
            },
            data: data.map(item => item.requestCount || 0)
          }
        ]
      };
    } else {
      // 错误率趋势图
      option = {
        tooltip: {
          trigger: 'axis',
          formatter: function (params: any) {
            const dataIndex = params[0].dataIndex;
            const date = formatDate(data[dataIndex].date);
            const value = `${((data[dataIndex].errorRate || 0) / 100).toFixed(1)}%`;
            return `日期: ${date}<br/>错误率: ${value}`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.map(item => formatDate(item.date)),
          axisLabel: {
            interval: 0,
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: '错误率(%)',
          axisLabel: {
            formatter: (value: number) => {
              return (value / 100).toFixed(1) + '%';
            }
          }
        },
        series: [
          {
            name: '错误率',
            type: 'line',
            areaStyle: {
              opacity: 0.3,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255, 77, 79, 0.7)' },
                { offset: 1, color: 'rgba(255, 77, 79, 0.1)' }
              ])
            },
            itemStyle: {
              color: '#ff4d4f'
            },
            emphasis: {
              focus: 'series'
            },
            data: data.map(item => item.errorRate || 0)
          }
        ]
      };
    }

    // 渲染图表
    chartInstance.current.setOption(option);
  };

  return (
    <Card title={title} className="w-full bg-white rounded-lg shadow-sm h-full">
      {loading ? (
        <div className="flex justify-center items-center h-[300px]">
          <Text type="secondary">加载中...</Text>
        </div>
      ) : data.length > 0 ? (
        <div ref={chartRef} className="h-[300px] w-full" />
      ) : (
        <div className="flex justify-center items-center h-[300px]">
          <Text type="secondary">暂无数据</Text>
        </div>
      )}
    </Card>
  );
};

export default ApiPerformanceTrendChart;
