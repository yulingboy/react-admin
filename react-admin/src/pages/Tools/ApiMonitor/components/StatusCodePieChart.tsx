import React, { useRef, useEffect } from 'react';
import { Card, Typography, Alert } from 'antd';
import * as echarts from 'echarts';

const { Text } = Typography;

interface StatusCodeItem {
  statusCode: string;
  _sum: {
    requestCount: number;
  };
}

interface StatusCodePieChartProps {
  data: StatusCodeItem[];
  loading: boolean;
}

const StatusCodePieChart: React.FC<StatusCodePieChartProps> = ({ data, loading }) => {
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
  }, [data]);

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

  // 获取状态码对应的颜色
  const getStatusCodeColor = (code: number) => {
    if (code >= 500) return '#ff4d4f'; // 服务器错误
    if (code >= 400) return '#faad14'; // 客户端错误
    if (code >= 300) return '#1890ff'; // 重定向
    if (code >= 200) return '#52c41a'; // 成功
    return '#d9d9d9'; // 其他
  };

  // 获取状态码分类描述
  const getStatusCodeDescription = (code: number) => {
    if (code >= 500) return '服务器错误';
    if (code >= 400) return '客户端错误';
    if (code >= 300) return '重定向';
    if (code >= 200) return '成功';
    return '其他';
  };

  const renderChart = () => {
    if (!chartInstance.current) return;

    // 准备数据
    const formattedData = data.map(item => {
      const statusCode = parseInt(item.statusCode);
      return {
        name: `${item.statusCode} (${getStatusCodeDescription(statusCode)})`,
        value: item._sum.requestCount,
        itemStyle: {
          color: getStatusCodeColor(statusCode)
        }
      };
    });

    // 设置图表配置
    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        type: 'scroll',
        textStyle: {
          fontSize: 12
        }
      },
      series: [
        {
          name: '状态码',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 1
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: formattedData
        }
      ]
    };

    // 渲染图表
    chartInstance.current.setOption(option);
  };

  return (
    <Card title="状态码分布" className="w-full bg-white rounded-lg shadow-sm h-full">
      {loading ? (
        <div className="flex justify-center items-center h-[350px]">
          <Text type="secondary">加载中...</Text>
        </div>
      ) : data && data.length > 0 ? (
        <div ref={chartRef} className="h-[350px] w-full" />
      ) : (
        <div className="flex justify-center items-center h-[350px]">
          <Alert message="暂无状态码分布数据" type="info" showIcon />
        </div>
      )}
    </Card>
  );
};

export default StatusCodePieChart;
