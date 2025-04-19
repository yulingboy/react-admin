import React, { useRef, useEffect } from 'react';
import { Card, Typography } from 'antd';
import * as echarts from 'echarts';
import { LogDistribution } from '@/types/system-monitor';

const { Text } = Typography;

interface LogDistributionChartProps {
  logDistribution: LogDistribution[];
}

const LogDistributionChart: React.FC<LogDistributionChartProps> = ({ logDistribution }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 初始化图表
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      if (logDistribution.length > 0) {
        renderChart();
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [logDistribution]);

  // 监听窗口大小变化
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
    const chartData = logDistribution.map(item => ({
      value: item.count,
      name: item.level
    }));

    // 配置饼图
    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        top: 'top',
        data: logDistribution.map(item => item.level)
      },
      color: ['#ff4d4f', '#faad14', '#52c41a'],
      series: [
        {
          name: '日志级别分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: chartData
        }
      ]
    };

    // 渲染图表
    chartInstance.current.setOption(option);
  };

  return (
    <Card title="日志级别分布" className="w-full bg-white rounded-lg shadow-sm h-full">
      {logDistribution.length > 0 ? (
        <div ref={chartRef} className="h-[300px] w-full" />
      ) : (
        <div className="flex justify-center items-center h-[300px]">
          <Text type="secondary">暂无日志分布数据</Text>
        </div>
      )}
    </Card>
  );
};

export default LogDistributionChart;
