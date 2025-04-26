import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Spin, Empty, Tooltip, Badge, Space } from 'antd';
import { CodeOutlined, CopyOutlined, FileTextOutlined, FileTwoTone } from '@ant-design/icons';
import { CodePreview } from '@/modules/tools/types/code-generator';
import { message } from '@/hooks/useMessage';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { previewCode } from '@/modules/tools/api/code-generator-api';

interface CodePreviewModalProps {
  visible: boolean;
  generatorId: number | null;
  onCancel: () => void;
}

/**
 * 代码预览模态框组件
 * 用于展示代码生成器生成的代码文件
 */
const CodePreviewModal: React.FC<CodePreviewModalProps> = ({ visible, generatorId, onCancel }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<CodePreview[]>([]);
  const [activeKey, setActiveKey] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (visible && generatorId) {
      loadPreviewData(generatorId);
    } else {
      setPreviewData([]);
    }
  }, [visible, generatorId]);

  // 加载预览数据
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

  // 获取文件图标
  const getFileIcon = (filePath: string) => {
    const extension = filePath.split('.').pop() || '';
    const color = {
      ts: '#3178c6',
      tsx: '#3178c6',
      js: '#f0db4f',
      jsx: '#f0db4f',
      html: '#e34c26',
      css: '#264de4',
      json: '#5b5b5b',
      md: '#083fa1',
    }[extension.toLowerCase()] || '#3178c6';

    return <FileTwoTone twoToneColor={color} />;
  };

  // 复制代码
  const copyCode = (content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopied(true);
        message.success('代码已复制到剪贴板');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('复制失败:', err);
        message.error('复制代码失败');
      });
  };

  // 获取标签页项目
  const getTabItems = () => {
    return previewData.map(item => ({
      key: item.path,
      label: (
        <div className="flex items-center space-x-1 max-w-[160px] overflow-hidden whitespace-nowrap text-ellipsis">
          {getFileIcon(item.path)}
          <span className="ml-1">{item.path.split('/').pop() || item.path}</span>
        </div>
      ),
      children: (
        <div className="relative h-[calc(100vh-280px)] min-h-[450px] bg-gray-900 rounded-md overflow-auto">
          <div className="absolute right-2 top-2 z-10">
            <Tooltip title="复制代码">
              <button
                onClick={() => copyCode(item.content)}
                className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
              >
                <CopyOutlined className={copied ? 'text-green-500' : ''} />
              </button>
            </Tooltip>
          </div>
          <SyntaxHighlighter
            language={getFileType(item.path)}
            style={vs2015}
            showLineNumbers
            wrapLines={true}
            wrapLongLines={true}
            customStyle={{
              margin: 0,
              borderRadius: '0.375rem',
              fontSize: '14px',
              lineHeight: '1.5',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
            codeTagProps={{
              style: {
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }
            }}
            lineProps={{
              style: {
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
              }
            }}
          >
            {item.content}
          </SyntaxHighlighter>
        </div>
      )
    }));
  };

  // 模态框标题
  const modalTitle = (
    <div className="flex items-center space-x-2 max-w-[calc(100%-40px)]">
      <div className="flex items-center">
        <CodeOutlined className="text-blue-500 mr-2" />
        <span>代码预览</span>
        {previewData.length > 0 && (
          <Badge count={previewData.length} className="ml-2" overflowCount={99} />
        )}
      </div>
      {activeKey && (
        <div className="text-sm text-gray-500 ml-2 truncate flex-1">
          <FileTextOutlined className="mr-1" />
          <span className="truncate">{activeKey}</span>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={onCancel}
      width="85vw"
      style={{ maxWidth: '1200px' }}
      bodyStyle={{ padding: '12px' }}
      footer={null}
      destroyOnClose
      className="code-preview-modal"
    >
      <Spin spinning={loading} tip="加载代码中...">
        <div className="w-full">
          {previewData.length > 0 ? (
            <Tabs
              activeKey={activeKey}
              onChange={setActiveKey}
              items={getTabItems()}
              tabPosition="left"
              className="h-full code-preview-tabs"
              tabBarStyle={{
                width: '200px',
                height: '100%',
                padding: '8px 0',
                borderRight: '1px solid #f0f0f0'
              }}
            />
          ) : (
            <Empty
              description="暂无代码预览"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="py-20"
            />
          )}
        </div>
      </Spin>
    </Modal>
  );
};

export default CodePreviewModal;
