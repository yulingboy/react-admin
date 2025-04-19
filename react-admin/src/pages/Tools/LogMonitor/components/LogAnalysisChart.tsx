import React, { useRef, useEffect } from 'react';
import { Card, Typography, Alert } from 'antd';
import * as echarts from 'echarts';
import { LogStat } from '@/types/system-monitor';
import dayjs from 'dayjs';

const { Text } = Typography;

interface LogAnalysisChartProps {
  logStats: LogStat[];
}

const LogAnalysisChart: React.FC<LogAnalysisChartProps> = ({ logStats }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 初始化图表
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      if (logStats.length > 0) {
        renderChart();
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [logStats]);

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
    const dates = [...new Set(logStats.map(stat => dayjs(stat.date).format('MM-DD')))];

    // 按日期和日志级别重组数据
    const errorData: number[] = [];
    const warnData: number[] = [];
    const infoData: number[] = [];

    dates.forEach(date => {
      const dayStats = logStats.filter(stat => dayjs(stat.date).format('MM-DD') === date);

      const errorStat = dayStats.find(stat => stat.level === 'ERROR');
      const warnStat = dayStats.find(stat => stat.level === 'WARN');
      const infoStat = dayStats.find(stat => stat.level === 'INFO');

      errorData.push(errorStat ? errorStat.count : 0);
      warnData.push(warnStat ? warnStat.count : 0);
      infoData.push(infoStat ? infoStat.count : 0);
    });

    // 设置图表配置
    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
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
        data: dates
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'ERROR',
          type: 'bar',
          data: errorData,
          itemStyle: {
            color: '#ff4d4f'
          }
        },
        {
          name: 'WARN',
          type: 'bar',
          data: warnData,
          itemStyle: {
            color: '#faad14'
          }
        },
        {
          name: 'INFO',
          type: 'bar',
          data: infoData,
          itemStyle: {
            color: '#52c41a'
          }
        }
      ]
    };

    // 渲染图表
    chartInstance.current.setOption(option);
  };

  return (
    <div className="space-y-4">
      <Card title="日志数量分析" className="w-full bg-white rounded-lg shadow-sm">
        {logStats.length > 0 ? (
          <div ref={chartRef} className="h-[300px] w-full" />
        ) : (
          <div className="flex justify-center items-center h-[300px]">
            <Text type="secondary">暂无日志数据</Text>
          </div>
        )}
      </Card>

      <Alert
        message="日志分析说明"
        description={
          <ul className="list-disc pl-4">
            <li className="text-red-500">错误日志(ERROR): 表示系统出现严重问题，需要立即处理的错误</li>
            <li className="text-yellow-500">警告日志(WARN): 表示系统可能存在潜在问题，但不影响系统正常运行</li>
            <li className="text-green-500">信息日志(INFO): 表示系统正常运行的信息记录</li>
          </ul>
        }
        type="info"
        showIcon
        className="bg-blue-50"
      />
    </div>
  );
};

export default LogAnalysisChart;
