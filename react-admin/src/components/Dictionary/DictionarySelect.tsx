import React from 'react';
import { Select, Spin } from 'antd';
import { useDictionary, DictionarySelectProps } from '@/hooks/useDictionary';

/**
 * 字典下拉选择组件
 * 用于表单中的字典下拉选择
 */
const DictionarySelect: React.FC<DictionarySelectProps> = ({
  code,
  value,
  placeholder = '请选择',
  allowClear = true,
  disabled = false,
  mode,
  onChange,
  style,
  ...restProps
}) => {
  const { loading, options } = useDictionary(code);

  return (
    <Select
      placeholder={placeholder}
      allowClear={allowClear}
      disabled={disabled}
      loading={loading}
      value={value}
      onChange={onChange}
      mode={mode}
      style={{ width: '100%', ...style }}
      options={options}
      notFoundContent={loading ? <Spin size="small" /> : null}
      optionLabelProp="label"
      optionRender={(option) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {option.data.color && (
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: option.data.color,
                marginRight: '8px',
                borderRadius: '2px',
                border: '1px solid #f0f0f0'
              }}
            />
          )}
          {option.label}
        </div>
      )}
      {...restProps}
    />
  );
};

export default DictionarySelect;