import React from 'react';
import { Select } from 'antd';

// 颜色选项
const COLOR_OPTIONS = [
  { label: '红色', value: '#f5222d' },
  { label: '火山', value: '#fa541c' },
  { label: '日暮', value: '#fa8c16' },
  { label: '金盏花', value: '#faad14' },
  { label: '黄色', value: '#fadb14' },
  { label: '青柠', value: '#a0d911' },
  { label: '绿色', value: '#52c41a' },
  { label: '青色', value: '#13c2c2' },
  { label: '蓝色', value: '#1677ff' },
  { label: '紫色', value: '#722ed1' },
  { label: '洋红', value: '#eb2f96' },
  { label: '灰色', value: '#bfbfbf' },
  { label: '黑色', value: '#000000' }
];

interface ColorSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ value, onChange }) => {
  return (
    <Select
      placeholder="请选择颜色"
      allowClear
      optionLabelProp="label"
      value={value}
      onChange={onChange}
      style={{ width: '100%' }}
      dropdownStyle={{ padding: '4px' }}
      options={COLOR_OPTIONS}
      optionRender={option => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: option.value as string,
              marginRight: '8px',
              borderRadius: '2px',
              border: '1px solid #f0f0f0'
            }}
          />
          {option.label}
        </div>
      )}
    />
  );
};

export default ColorSelector;
