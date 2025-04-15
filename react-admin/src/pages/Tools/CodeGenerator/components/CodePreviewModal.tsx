import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Spin, Empty } from 'antd';
import { CodePreview } from '@/types/code-generator';
import { previewCode } from '@/api/code-generator';
import { message } from '@/hooks/useMessage';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface CodePreviewModalProps {
  visible: boolean;
  generatorId: number | null;
  onCancel: () => void;
}

const CodePreviewModal: React.FC<CodePreviewModalProps> = ({
  visible,
  generatorId,
  onCancel,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<CodePreview[]>([]);
  const [activeKey, setActiveKey] = useState<string>('');

  useEffect(() => {
    if (visible && generatorId) {
      loadPreviewData(generatorId);
    } else {
      setPreviewData([]);
    }
  }, [visible, generatorId]);

  const loadPreviewData = async (id: number) => {
    // 检查ID是否有效
    if (!id) {
      message.error('生成器ID不能为空');
      return;
    }
    
    setLoading(true);
    try {
      const data = await previewCode(id);
      setPreviewData(data);
      if (data.length > 0) {
        setActiveKey(data[0].path);
      }
    } catch (error) {
      console.error('加载代码预览失败:', error);
      message.error('加载代码预览失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取文件类型
  const getFileType = (filePath: string): string => {
    const extension = filePath.split('.').pop() || '';
    switch (extension.toLowerCase()) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'typescript'; // 默认为typescript
    }
  };

  const getTabItems = () => {
    return previewData.map(item => ({
      key: item.path,
      label: item.path.split('/').pop() || item.path,
      children: (
        <div style={{ height: '500px', overflow: 'auto' }}>
          <SyntaxHighlighter
            language={getFileType(item.path)}
            style={vs2015}
            showLineNumbers
          >
            {item.content}
          </SyntaxHighlighter>
        </div>
      ),
    }));
  };

  return (
    <Modal
      title="代码预览"
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={null}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {previewData.length > 0 ? (
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            items={getTabItems()}
            tabPosition="left"
            style={{ height: 500 }}
          />
        ) : (
          <Empty description="暂无代码预览" />
        )}
      </Spin>
    </Modal>
  );
};

export default CodePreviewModal;