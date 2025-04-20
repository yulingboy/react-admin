import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { formatTime } from '../../../../utils/date-utils';

interface ResourceUsageChartProps {
  data: any[];
}

const ResourceUsageChart: React.FC<ResourceUsageChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 初始化图表
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // 在组件卸载时销毁图表
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (!chartInstance.current || !data || data.length === 0) return;

    // 转换数据
    const timestamps = data.map(item => formatTime(item.timestamp));
    const cpuData = data.map(item => item.cpuUsage);
    const memData = data.map(item => item.memUsage);
    const diskData = data.map(item => item.diskUsage);

    // 配置图表选项
    const options: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          let result = params[0].name + '<br/>';
          params.forEach((item: any) => {
            result += 
              `<div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${item.color};"></span>
                <span>${item.seriesName}:</span>
                <span style="float:right;font-weight:bold;margin-left:20px;">${item.value.toFixed(2)}%</span>
              </div>`;
          });
          return result;
        }
      },
      legend: {
        data: ['CPU', '内存', '磁盘'],
        icon: 'circle',
        right: '10%',
        textStyle: {
          fontSize: 12
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
        data: timestamps,
        axisLabel: {
          formatter: (value: string) => {
            return value.split(' ')[1]; // 只显示时间部分
          }
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: 'CPU',
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#FF5722'
          },
          areaStyle: {
            opacity: 0.1,
            color: '#FF5722'
          },
          symbol: 'none',
          data: cpuData
        },
        {
          name: '内存',
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#2196F3'
          },
          areaStyle: {
            opacity: 0.1,
            color: '#2196F3'
          },
          symbol: 'none',
          data: memData
        },
        {
          name: '磁盘',
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#4CAF50'
          },
          areaStyle: {
            opacity: 0.1,
            color: '#4CAF50'
          },
          symbol: 'none',
          data: diskData
        }
      ]
    };

    // 更新图表
    chartInstance.current.setOption(options);

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      chartInstance.current?.resize();
    });

    return () => {
      window.removeEventListener('resize', () => {
        chartInstance.current?.resize();
      });
    };
  }, [data]);

  return <div ref={chartRef} className="w-full h-80" />;
};

export default ResourceUsageChart;