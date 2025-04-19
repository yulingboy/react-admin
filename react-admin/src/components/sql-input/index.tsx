import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button, Space, message } from 'antd';
import { PlayCircleOutlined, FormatPainterOutlined, SaveOutlined, CopyOutlined } from '@ant-design/icons';
import * as monaco from 'monaco-editor';

// SQL关键字列表，用于自动补全
const SQL_KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'CREATE',
  'TABLE',
  'ALTER',
  'INDEX',
  'VIEW',
  'TRIGGER',
  'PROCEDURE',
  'FUNCTION',
  'DATABASE',
  'SCHEMA',
  'JOIN',
  'INNER',
  'LEFT',
  'RIGHT',
  'OUTER',
  'FULL',
  'UNION',
  'ALL',
  'GROUP BY',
  'ORDER BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'AS',
  'ON',
  'AND',
  'OR',
  'NOT',
  'IN',
  'BETWEEN',
  'LIKE',
  'IS NULL',
  'IS NOT NULL',
  'DESC',
  'ASC',
  'DISTINCT'
];

export interface SqlInputRef {
  getValue: () => string;
  setValue: (value: string) => void;
  focus: () => void;
  format: () => void;
  getEditor: () => monaco.editor.IStandaloneCodeEditor | null;
}

export interface SqlInputProps {
  defaultValue?: string;
  height?: number | string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  border?: boolean;
  placeholder?: string;
  showToolbar?: boolean;
  showExecuteButton?: boolean;
  showFormatButton?: boolean;
  showCopyButton?: boolean;
  showSaveButton?: boolean;
  onExecute?: (sql: string) => void;
  onSave?: (sql: string) => void;
  onFormat?: (sql: string) => void;
  onCopy?: (sql: string) => void;
  loading?: boolean;
}

const SqlInput = forwardRef<SqlInputRef, SqlInputProps>((props, ref) => {
  const {
    defaultValue = '',
    height = 200,
    onChange,
    readOnly = false,
    border = true,
    placeholder = 'SELECT * FROM table_name;',
    showToolbar = true, // 修改为默认显示工具栏
    showExecuteButton = true,
    showFormatButton = true,
    showCopyButton = true,
    showSaveButton = true, // 修改为默认显示保存按钮
    onExecute,
    onSave,
    onFormat,
    onCopy,
    loading = false
  } = props;

  const [sql, setSql] = useState<string>(defaultValue);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<typeof monaco | null>(null);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    getValue: () => {
      return editorRef.current ? editorRef.current.getValue() : sql;
    },
    setValue: (value: string) => {
      if (editorRef.current) {
        editorRef.current.setValue(value);
      }
    },
    focus: () => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    },
    format: () => {
      if (monacoRef.current && editorRef.current) {
        const editorModel = editorRef.current.getModel();
        if (editorModel) {
          try {
            editorRef.current.pushUndoStop();
            const formatAction = editorRef.current.getAction('editor.action.formatDocument');
            if (formatAction) {
              formatAction
                .run()
                .then(() => {
                  editorRef.current?.pushUndoStop();
                })
                .catch(err => {
                  console.error('内置格式化失败:', err);
                });
            } else {
              console.warn('找不到格式化操作');
            }
          } catch (err) {
            console.error('格式化时出错:', err);
          }
        }
      }
    },
    getEditor: () => editorRef.current
  }));

  // 初始化Monaco编辑器
  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      initMonacoEditor();
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);

  // 初始化Monaco编辑器
  const initMonacoEditor = async () => {
    try {
      monaco.languages.registerCompletionItemProvider('sql', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };

          const suggestions = SQL_KEYWORDS.map(keyword => ({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range: range
          }));

          return { suggestions };
        }
      });

      if (containerRef.current) {
        const editorInstance = monaco.editor.create(containerRef.current, {
          value: sql || placeholder,
          language: 'sql',
          theme: 'vs',
          automaticLayout: true,
          minimap: { enabled: false },
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          fontSize: 14,
          folding: true,
          tabSize: 2,
          wordWrap: 'on',
          suggestOnTriggerCharacters: true,
          cursorBlinking: 'blink',
          renderControlCharacters: true,
          renderWhitespace: 'none',
          contextmenu: true,
          readOnly,
          glyphMargin: false
          // lightbulb: {
          //   enabled: 'always'
          // }
        });

        editorRef.current = editorInstance;
        monacoRef.current = monaco;

        editorInstance.onDidChangeModelContent(() => {
          const value = editorInstance.getValue();
          setSql(value);
          onChange?.(value);
        });

        if (!readOnly && defaultValue) {
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.focus();
              const model = editorRef.current.getModel();
              if (model) {
                const lastLine = model.getLineCount();
                const lastColumn = model.getLineMaxColumn(lastLine);
                editorRef.current.setPosition({ lineNumber: lastLine, column: lastColumn });
              }
            }
          }, 100);
        }

        const resizeObserver = new ResizeObserver(() => {
          if (editorRef.current) {
            editorRef.current.layout();
          }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
          resizeObserver.disconnect();
        };
      }
    } catch (err) {
      console.error('Monaco editor initialization failed:', err);
    }
  };

  const focusEditor = () => {
    if (editorRef.current && !readOnly) {
      editorRef.current.focus();
    }
  };

  const handleExecuteSql = () => {
    if (!editorRef.current) return;

    const sqlText = editorRef.current.getValue();
    if (!sqlText.trim()) {
      message.error('SQL语句不能为空');
      return;
    }

    onExecute?.(sqlText);
  };

  const handleFormatSql = () => {
    if (!editorRef.current) return;

    const sqlText = editorRef.current.getValue();
    if (onFormat) {
      onFormat(sqlText);
    } else {
      if (monacoRef.current && editorRef.current) {
        const editorModel = editorRef.current.getModel();
        if (editorModel) {
          try {
            editorRef.current.pushUndoStop();
            const formatAction = editorRef.current.getAction('editor.action.formatDocument');
            if (formatAction) {
              formatAction
                .run()
                .then(() => {
                  editorRef.current?.pushUndoStop();
                  message.success('SQL格式化成功');
                })
                .catch(err => {
                  message.error('SQL格式化失败');
                });
            } else {
              message.warning('找不到格式化操作');
            }
          } catch (err) {
            message.error('SQL格式化失败');
          }
        }
      }
    }
  };

  const handleCopySql = () => {
    if (!editorRef.current) return;

    const sqlText = editorRef.current.getValue();
    if (onCopy) {
      onCopy(sqlText);
    } else {
      navigator.clipboard.writeText(sqlText).then(
        () => {
          message.success('已复制到剪贴板');
        },
        () => {
          message.error('复制失败');
        }
      );
    }
  };

  const handleSaveSql = () => {
    if (!editorRef.current) return;
    const sqlText = editorRef.current.getValue();
    onSave?.(sqlText);
  };

  const calculateEditorHeight = () => {
    const baseHeight = typeof height === 'number' ? height : parseInt(height as string);
    return showToolbar ? baseHeight - 40 : baseHeight;
  };

  return (
    <div className="sql-input-component">
      {showToolbar && (
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <Space>
            {showExecuteButton && onExecute && (
              <Button type="primary" icon={<PlayCircleOutlined />} loading={loading} onClick={handleExecuteSql} title="执行SQL (Ctrl+Enter)">
                执行
              </Button>
            )}
            {showFormatButton && (
              <Button icon={<FormatPainterOutlined />} onClick={handleFormatSql} title="格式化SQL">
                格式化
              </Button>
            )}
            {showCopyButton && (
              <Button icon={<CopyOutlined />} onClick={handleCopySql} title="复制SQL">
                复制
              </Button>
            )}
            {showSaveButton && onSave && (
              <Button icon={<SaveOutlined />} onClick={handleSaveSql} title="保存SQL">
                保存
              </Button>
            )}
          </Space>
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          height: calculateEditorHeight(),
          width: '100%',
          border: border ? '1px solid #d9d9d9' : 'none',
          overflow: 'hidden'
        }}
        onClick={focusEditor}
      />
    </div>
  );
});

export default SqlInput;
