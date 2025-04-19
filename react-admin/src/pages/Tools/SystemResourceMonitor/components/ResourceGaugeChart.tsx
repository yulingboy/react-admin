import React, { useRef, useEffect } from 'react';
import { Card, Statistic } from 'antd';
import * as echarts from 'echarts';
import { formatPercent } from '@/utils/formatters';

interface ResourceGaugeChartProps {
  title: string;
  value: number;
  status?: 'normal' | 'warning' | 'exception';
  description?: React.ReactNode;
  extraContent?: React.ReactNode;
}

const ResourceGaugeChart: React.FC<ResourceGaugeChartProps> = ({ title, value, status = 'normal', description, extraContent }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // 根据状态确定颜色
  const getColor = () => {
    if (status === 'exception') return '#ff4d4f';
    if (status === 'warning') return '#faad14';
    return '#52c41a';
  };

  useEffect(() => {
    // 初始化或销毁图表
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      renderChart();
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [value, status]);

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

    const option: echarts.EChartsOption = {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          center: ['50%', '75%'],
          radius: '90%',
          min: 0,
          max: 100,
          splitNumber: 10,
          axisLine: {
            lineStyle: {
              width: 6,
              color: [
                [0.7, '#52c41a'],
                [0.9, '#faad14'],
                [1, '#ff4d4f']
              ]
            }
          },
          pointer: {
            icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
            length: '12%',
            width: 10,
            offsetCenter: [0, '5%'],
            itemStyle: {
              color: getColor()
            }
          },
          axisTick: {
            length: 12,
            lineStyle: {
              color: 'auto',
              width: 1
            }
          },
          axisLabel: {
            distance: -60,
            color: '#999',
            fontSize: 14
          },
          splitLine: {
            length: 20,
            lineStyle: {
              color: 'auto',
              width: 2
            }
          },
          title: {
            show: false
          },
          detail: {
            valueAnimation: true,
            width: '60%',
            lineHeight: 40,
            borderRadius: 8,
            offsetCenter: [0, '30%'],
            fontSize: 24,
            fontWeight: 'bold',
            formatter: `{value}%`,
            color: getColor()
          },
          data: [
            {
              value: (value * 100).toFixed(1)
            }
          ]
        }
      ]
    };

    chartInstance.current.setOption(option);
  };

  return (
    <Card title={title} className="w-full h-full bg-white rounded-lg shadow-sm">
      <div className="flex flex-col items-center">
        <div ref={chartRef} className="h-[180px] w-full" />
        {description && <div className="mt-2 text-center">{description}</div>}
        {extraContent && <div className="mt-2">{extraContent}</div>}
      </div>
    </Card>
  );
};

export default ResourceGaugeChart;
