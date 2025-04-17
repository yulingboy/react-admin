import { useEffect, useState } from 'react';
import { systemMonitorApi } from '@/api/system-monitor';
import { SystemHealth } from '@/types/system-monitor';

export const useSystemHealth = () => {
  const [healthStatus, setHealthStatus] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthStatus = async () => {
    try {
      setLoading(true);
      const data = await systemMonitorApi.getHealth();
      setHealthStatus(data);
      setError(null);
    } catch (err: any) {
      setError('获取系统健康状态失败：' + (err.message || '未知错误'));
      console.error('获取系统健康状态失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    
    // 每60秒更新一次系统健康状态
    const timer = setInterval(fetchHealthStatus, 60000);
    return () => clearInterval(timer);
  }, []);

  return {
    healthStatus,
    loading,
    error,
    refreshHealth: fetchHealthStatus
  };
};