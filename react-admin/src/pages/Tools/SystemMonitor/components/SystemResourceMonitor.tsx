import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Progress, Statistic, Divider, Spin, Alert, Tabs, Tag } from 'antd';
import { ReloadOutlined, DashboardOutlined, DesktopOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { systemResourceApi } from '@/api/system-monitor';
import { SystemResourceInfo } from '@/types/system-monitor';
import { formatBytes, formatUptime, formatPercent } from '@/utils/formatters';

interface SystemResourceMonitorProps {
  refreshInterval?: number; // 刷新间隔，单位毫秒
}

const SystemResourceMonitor: React.FC<SystemResourceMonitorProps> = ({
  refreshInterval = 30000 // 默认30秒刷新一次
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resources, setResources] = useState<SystemResourceInfo | null>(null);
  const [activeTab, setActiveTab] = useState('1');

  const fetchResourceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await systemResourceApi.getRealtime();
      // 处理数据，提取嵌套在systemInfo中的属性
      const processedData = {
        ...data,
        cpuCores: data.systemInfo?.cpus || 0,
        memoryUsed: data.systemInfo?.usedMemory || data.systemInfo?.totalMemory - data.systemInfo?.freeMemory || 0,
        totalMemory: data.systemInfo?.totalMemory || 0,
        diskFree: data.systemInfo?.diskFree || 0,
        loadAvg: data.systemInfo?.loadavg || [0, 0, 0]
      };

      setResources(processedData);
    } catch (err) {
      setError('获取系统资源数据失败，请稍后重试');
      console.error('获取系统资源数据错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 首次加载和定时刷新
  useEffect(() => {
    fetchResourceData();

    const timer = setInterval(() => {
      fetchResourceData();
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [refreshInterval]);

  if (error) {
    return <Alert message="错误" description={error} type="error" showIcon />;
  }

  const renderResourceUsage = () => {
    if (!resources) return null;

    return (
      <>
        <Row gutter={16}>
          <Col span={8}>
            <Card title="CPU使用率" size="small">
              <Progress
                type="dashboard"
                percent={resources.cpuUsage * 100}
                format={percent => formatPercent(parseFloat(percent as string) / 100, 1)}
                status={resources.cpuUsage > 0.9 ? 'exception' : resources.cpuUsage > 0.7 ? 'warning' : 'normal'}
              />
              <div style={{ marginTop: 16 }}>
                <Statistic title="处理器" value={`${resources.cpuCores}核`} />
                {resources.systemInfo?.cpuModel && (
                  <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)', marginTop: 4 }}>{resources.systemInfo.cpuModel}</div>
                )}
              </div>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="内存使用率" size="small">
              <Progress
                type="dashboard"
                percent={resources.memUsage * 100}
                format={percent => formatPercent(parseFloat(percent as string) / 100, 1)}
                status={resources.memUsage > 0.9 ? 'exception' : resources.memUsage > 0.7 ? 'warning' : 'normal'}
              />
              <div style={{ marginTop: 16 }}>
                <Statistic title="已用/总共" value={`${formatBytes(resources.memoryUsed)} / ${formatBytes(resources.totalMemory)}`} />
              </div>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="磁盘使用率" size="small">
              <Progress
                type="dashboard"
                percent={resources.diskUsage * 100}
                format={percent => formatPercent(parseFloat(percent as string) / 100, 1)}
                status={resources.diskUsage > 0.9 ? 'exception' : resources.diskUsage > 0.7 ? 'warning' : 'normal'}
              />
              <div style={{ marginTop: 16 }}>
                <Statistic title="可用空间" value={formatBytes(resources.diskFree || 0)} />
                {resources.systemInfo?.diskSize && (
                  <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)', marginTop: 4 }}>总容量: {formatBytes(resources.systemInfo.diskSize)}</div>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Row gutter={16}>
          {resources.loadAvg && resources.loadAvg.length >= 3 ? (
            <>
              <Col span={6}>
                <Statistic
                  title="系统负载（1分钟）"
                  value={resources.loadAvg[0].toFixed(2)}
                  valueStyle={{ color: resources.loadAvg[0] > resources.cpuCores ? '#ff4d4f' : '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="系统负载（5分钟）"
                  value={resources.loadAvg[1].toFixed(2)}
                  valueStyle={{ color: resources.loadAvg[1] > resources.cpuCores ? '#ff4d4f' : '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="系统负载（15分钟）"
                  value={resources.loadAvg[2].toFixed(2)}
                  valueStyle={{ color: resources.loadAvg[2] > resources.cpuCores ? '#ff4d4f' : '#3f8600' }}
                />
              </Col>
            </>
          ) : (
            <Col span={18}>
              <Alert message="系统负载数据不可用" type="warning" />
            </Col>
          )}
          <Col span={6}>
            <Statistic title="系统运行时间" value={formatUptime(resources.uptime)} />
          </Col>
        </Row>
      </>
    );
  };

  const renderSystemInfo = () => {
    if (!resources || !resources.systemInfo) return null;

    const { systemInfo } = resources;

    return (
      <Card>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Statistic title="主机名" value={systemInfo.hostname} />
          </Col>
          <Col span={8}>
            <Statistic title="操作系统" value={`${systemInfo.platform} ${systemInfo.arch}`} />
          </Col>
          <Col span={8}>
            <Statistic title="系统版本" value={systemInfo.release} />
          </Col>

          {systemInfo.systemModel && (
            <Col span={24}>
              <Card size="small" title="系统信息">
                <p>{systemInfo.systemModel}</p>
              </Card>
            </Col>
          )}

          <Col span={24}>
            <Card size="small" title="网络接口">
              {Object.keys(systemInfo.networkInterfaces).length > 0 ? (
                Object.entries(systemInfo.networkInterfaces).map(([name, interfaces]) => (
                  <div key={name} style={{ marginBottom: 8 }}>
                    <div>
                      <strong>{name}:</strong>
                    </div>
                    {Array.isArray(interfaces) &&
                      interfaces.map((iface: any, idx) => (
                        <div key={idx} style={{ paddingLeft: 16 }}>
                          <Tag color="blue">{iface.family}</Tag> {iface.address}
                          {iface.mac && <div>MAC: {iface.mac}</div>}
                        </div>
                      ))}
                  </div>
                ))
              ) : (
                <Alert message="网络接口数据不可用" type="info" />
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <Spin spinning={loading}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ display: 'flex', alignItems: 'center' }}>
          <DashboardOutlined style={{ marginRight: 8 }} />
          系统资源监控
          <a onClick={fetchResourceData} style={{ marginLeft: 8, fontSize: 14 }}>
            <ReloadOutlined /> 刷新
          </a>
        </h3>
        <p style={{ color: 'rgba(0, 0, 0, 0.45)' }}>监控服务器CPU、内存、磁盘和系统负载情况</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: '1',
            label: (
              <span>
                <DashboardOutlined />
                资源使用
              </span>
            ),
            children: renderResourceUsage()
          },
          {
            key: '2',
            label: (
              <span>
                <InfoCircleOutlined />
                系统信息
              </span>
            ),
            children: renderSystemInfo()
          }
        ]}
      />
    </Spin>
  );
};

export default SystemResourceMonitor;
