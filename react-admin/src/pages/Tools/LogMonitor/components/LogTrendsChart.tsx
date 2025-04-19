import React, { useRef, useEffect } from 'react';
import { Card, Typography } from 'antd';
import * as echarts from 'echarts';
import { LogTrend } from '@/types/system-monitor';
import dayjs from 'dayjs';

const { Text } = Typography;

interface LogTrendsChartProps {
  logTrends: LogTrend[];
}

const LogTrendsChart: React.FC<LogTrendsChartProps> = ({ logTrends }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 初始化或销毁图表
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      if (logTrends.length > 0) {
        renderChart();
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [logTrends]);

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

    // 准备数据
    const dates = [...new Set(logTrends.map(trend => dayjs(trend.date).format('MM-DD')))];

    const errorData = logTrends.map(trend => trend.ERROR);
    const warnData = logTrends.map(trend => trend.WARN);
    const infoData = logTrends.map(trend => trend.INFO);

    // 设置图表配置
    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: ['ERROR', 'WARN', 'INFO'],
        top: '10px'
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
        data: dates,
        axisLabel: {
          formatter: (value: string) => value
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'ERROR',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: errorData,
          itemStyle: {
            color: '#ff4d4f'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 77, 79, 0.5)' },
              { offset: 1, color: 'rgba(255, 77, 79, 0.1)' }
            ])
          }
        },
        {
          name: 'WARN',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: warnData,
          itemStyle: {
            color: '#faad14'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(250, 173, 20, 0.5)' },
              { offset: 1, color: 'rgba(250, 173, 20, 0.1)' }
            ])
          }
        },
        {
          name: 'INFO',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: infoData,
          itemStyle: {
            color: '#52c41a'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(82, 196, 26, 0.5)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.1)' }
            ])
          }
        }
      ]
    };

    // 渲染图表
    chartInstance.current.setOption(option);
  };

  return (
    <Card title="日志趋势" className="w-full bg-white rounded-lg shadow-sm">
      {logTrends.length > 0 ? (
        <div ref={chartRef} className="h-[300px] w-full" />
      ) : (
        <div className="flex justify-center items-center h-[300px]">
          <Text type="secondary">暂无日志趋势数据</Text>
        </div>
      )}
    </Card>
  );
};

export default LogTrendsChart;
