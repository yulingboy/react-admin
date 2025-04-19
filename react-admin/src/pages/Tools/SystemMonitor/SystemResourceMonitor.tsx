import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Divider, Spin, Alert, Button, Tabs, Tag } from 'antd';
import { ReloadOutlined, DashboardOutlined, DesktopOutlined, InfoCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { systemResourceApi } from '@/api/system-monitor';
import { SystemResourceInfo } from '@/types/system-monitor';
import { formatBytes, formatUptime, formatPercent } from '@/utils/formatters';
import './index.css';

const { TabPane } = Tabs;

const SystemResourceMonitor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resources, setResources] = useState<SystemResourceInfo | null>(null);
  const [activeTab, setActiveTab] = useState('1');
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 默认30秒刷新一次

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

  const handleIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
  };

  if (error) {
    return (
      <div className="submodule-container">
        <div className="submodule-header">
          <div className="submodule-title">
            <Link to="/tools/system-monitor">
              <ArrowLeftOutlined style={{ marginRight: 12 }} />
            </Link>
            <DashboardOutlined />
            <span style={{ marginLeft: 8 }}>系统资源监控</span>
          </div>
        </div>
        <Alert message="错误" description={error} type="error" showIcon />
      </div>
    );
  }

  const renderResourceUsage = () => {
    if (!resources) return null;

    return (
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <Card className="dashboard-card" title="CPU使用率">
            <div className="gauge-wrapper">
              <Progress
                type="dashboard"
                percent={resources.cpuUsage * 100}
                format={percent => formatPercent(parseFloat(percent as string) / 100, 1)}
                status={resources.cpuUsage > 0.9 ? 'exception' : resources.cpuUsage > 0.7 ? 'warning' : 'normal'}
                width={180}
                strokeWidth={10}
              />
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Statistic title="处理器" value={`${resources.cpuCores}核`} />
                {resources.systemInfo?.cpuModel && (
                  <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)', marginTop: 4 }}>{resources.systemInfo.cpuModel}</div>
                )}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="dashboard-card" title="内存使用率">
            <div className="gauge-wrapper">
              <Progress
                type="dashboard"
                percent={resources.memUsage * 100}
                format={percent => formatPercent(parseFloat(percent as string) / 100, 1)}
                status={resources.memUsage > 0.9 ? 'exception' : resources.memUsage > 0.7 ? 'warning' : 'normal'}
                width={180}
                strokeWidth={10}
              />
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Statistic title="已用/总共" value={`${formatBytes(resources.memoryUsed)} / ${formatBytes(resources.totalMemory)}`} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="dashboard-card" title="磁盘使用率">
            <div className="gauge-wrapper">
              <Progress
                type="dashboard"
                percent={resources.diskUsage * 100}
                format={percent => formatPercent(parseFloat(percent as string) / 100, 1)}
                status={resources.diskUsage > 0.9 ? 'exception' : resources.diskUsage > 0.7 ? 'warning' : 'normal'}
                width={180}
                strokeWidth={10}
              />
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Statistic title="可用空间" value={formatBytes(resources.diskFree || 0)} />
                {resources.systemInfo?.diskSize && (
                  <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)', marginTop: 4 }}>总容量: {formatBytes(resources.systemInfo.diskSize)}</div>
                )}
              </div>
            </div>
          </Card>
        </Col>

        <Col span={24}>
          <Card className="dashboard-card" title="系统负载与运行时间">
            <Row gutter={16}>
              {resources.loadAvg && resources.loadAvg.length >= 3 ? (
                <>
                  <Col xs={24} sm={6}>
                    <Statistic
                      title="系统负载（1分钟）"
                      value={resources.loadAvg[0].toFixed(2)}
                      valueStyle={{ color: resources.loadAvg[0] > resources.cpuCores ? '#ff4d4f' : '#3f8600' }}
                    />
                  </Col>
                  <Col xs={24} sm={6}>
                    <Statistic
                      title="系统负载（5分钟）"
                      value={resources.loadAvg[1].toFixed(2)}
                      valueStyle={{ color: resources.loadAvg[1] > resources.cpuCores ? '#ff4d4f' : '#3f8600' }}
                    />
                  </Col>
                  <Col xs={24} sm={6}>
                    <Statistic
                      title="系统负载（15分钟）"
                      value={resources.loadAvg[2].toFixed(2)}
                      valueStyle={{ color: resources.loadAvg[2] > resources.cpuCores ? '#ff4d4f' : '#3f8600' }}
                    />
                  </Col>
                </>
              ) : (
                <Col xs={24} sm={18}>
                  <Alert message="系统负载数据不可用" type="warning" />
                </Col>
              )}
              <Col xs={24} sm={6}>
                <Statistic title="系统运行时间" value={formatUptime(resources.uptime)} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderSystemInfo = () => {
    if (!resources || !resources.systemInfo) return null;

    const { systemInfo } = resources;

    return (
      <Card className="dashboard-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card size="small" title="基本信息" className="metric-card">
              <Statistic title="主机名" value={systemInfo.hostname} />
              <Divider style={{ margin: '12px 0' }} />
              <Statistic title="操作系统" value={`${systemInfo.platform} ${systemInfo.arch}`} />
              <Divider style={{ margin: '12px 0' }} />
              <Statistic title="系统版本" value={systemInfo.release} />
            </Card>
          </Col>

          <Col xs={24} sm={16}>
            <Card size="small" title="系统详情" className="metric-card">
              {systemInfo.systemModel && <p style={{ marginBottom: 16 }}>{systemInfo.systemModel}</p>}

              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="CPU型号" value={systemInfo.cpuModel || '未知'} valueStyle={{ fontSize: '14px' }} />
                </Col>
                <Col span={8}>
                  <Statistic title="CPU核心数" value={systemInfo.cpus || 0} />
                </Col>
                <Col span={8}>
                  <Statistic title="总内存" value={formatBytes(systemInfo.totalMemory)} />
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card size="small" title="网络接口" className="metric-card">
              {Object.keys(systemInfo.networkInterfaces).length > 0 ? (
                Object.entries(systemInfo.networkInterfaces).map(([name, interfaces]) => (
                  <div key={name} style={{ marginBottom: 12 }}>
                    <div>
                      <strong>{name}:</strong>
                    </div>
                    {Array.isArray(interfaces) &&
                      interfaces.map((iface: any, idx) => (
                        <div key={idx} style={{ paddingLeft: 16, marginTop: 4 }}>
                          <Tag color="blue">{iface.family}</Tag> {iface.address}
                          {iface.mac && <div style={{ marginTop: 2 }}>MAC: {iface.mac}</div>}
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
    <div className="submodule-container">
      <div className="submodule-header">
        <div className="submodule-title">
          <Link to="/tools/system-monitor">
            <ArrowLeftOutlined style={{ marginRight: 12 }} />
          </Link>
          <DashboardOutlined />
          <span style={{ marginLeft: 8 }}>系统资源监控</span>
        </div>
        <div>
          <Button.Group style={{ marginRight: 16 }}>
            <Button type={refreshInterval === 10000 ? 'primary' : 'default'} onClick={() => handleIntervalChange(10000)}>
              10秒
            </Button>
            <Button type={refreshInterval === 30000 ? 'primary' : 'default'} onClick={() => handleIntervalChange(30000)}>
              30秒
            </Button>
            <Button type={refreshInterval === 60000 ? 'primary' : 'default'} onClick={() => handleIntervalChange(60000)}>
              1分钟
            </Button>
          </Button.Group>
          <Button type="primary" icon={<ReloadOutlined />} onClick={fetchResourceData} loading={loading}>
            刷新
          </Button>
        </div>
      </div>

      <Spin spinning={loading && !resources}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="resource-tabs"
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
    </div>
  );
};

export default SystemResourceMonitor;
