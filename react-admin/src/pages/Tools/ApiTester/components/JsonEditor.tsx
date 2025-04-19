import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface JsonEditorProps {
  value: any;
  onChange?: (value: any) => void;
  height?: string;
  readOnly?: boolean;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, height = '300px', readOnly = false }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      // 格式化JSON字符串
      const formattedJson = JSON.stringify(value, null, 2);

      // 创建编辑器
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value: formattedJson,
        language: 'json',
        theme: 'vs',
        automaticLayout: true,
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        readOnly,
        fontSize: 14
      });

      // 监听编辑器内容变化
      if (!readOnly && onChange) {
        monacoEditorRef.current.onDidChangeModelContent(() => {
          try {
            const content = monacoEditorRef.current?.getValue() || '';
            const jsonValue = content ? JSON.parse(content) : {};
            onChange(jsonValue);
          } catch (error) {
            // JSON 格式错误时不触发 onChange
            console.log('JSON 格式错误，请检查');
          }
        });
      }

      return () => {
        monacoEditorRef.current?.dispose();
      };
    }
  }, []);

  // 当外部的 value 更新时，更新编辑器的值
  useEffect(() => {
    if (monacoEditorRef.current) {
      const currentValue = monacoEditorRef.current.getValue();
      const newValue = JSON.stringify(value, null, 2);

      // 避免内容无变化时触发不必要的更新
      if (currentValue !== newValue) {
        monacoEditorRef.current.setValue(newValue);
      }
    }
  }, [value]);

  return <div ref={editorRef} style={{ height, width: '100%', border: '1px solid #d9d9d9', borderRadius: '2px' }}></div>;
};

export default JsonEditor;
