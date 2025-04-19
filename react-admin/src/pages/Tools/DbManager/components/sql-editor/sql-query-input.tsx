import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Card } from 'antd';
import SqlInput, { SqlInputRef } from '@/components/sql-input';

interface SqlQueryInputProps {
  loading: boolean;
  onExecute: (sqlText: string) => void;
  onSave: (sqlText: string) => void;
}

const SqlQueryInput = forwardRef<SqlInputRef, SqlQueryInputProps>(({ loading, onExecute, onSave }, ref) => {
  const inputRef = useRef<SqlInputRef>(null);

  // 向父组件暴露 setValue 方法
  useImperativeHandle(ref, () => ({
    setValue: (value: string) => {
      inputRef.current?.setValue(value);
    },
    getValue: () => {
      return inputRef.current?.getValue() || '';
    },
    focus: () => {
      inputRef.current?.focus();
    },
    format: () => {
      inputRef.current?.format();
    },
    getEditor: () => {
      return inputRef.current?.getEditor() || null;
    }
  }));

  return (
    <Card>
      <SqlInput
        ref={inputRef}
        defaultValue="SELECT * FROM users LIMIT 10;"
        height={240}
        onChange={() => {
          // 可以在这里添加自动保存功能
        }}
        onExecute={onExecute}
        onSave={onSave}
        loading={loading}
      />
    </Card>
  );
});

SqlQueryInput.displayName = 'SqlQueryInput';

export default SqlQueryInput;
