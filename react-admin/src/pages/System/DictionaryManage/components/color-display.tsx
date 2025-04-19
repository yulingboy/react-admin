import React from 'react';

interface ColorDisplayProps {
  color: string;
}

const ColorDisplay: React.FC<ColorDisplayProps> = ({ color }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div 
        style={{ 
          width: '16px', 
          height: '16px', 
          backgroundColor: color, 
          marginRight: '8px',
          borderRadius: '2px',
          border: '1px solid #f0f0f0'
        }} 
      />
      {color}
    </div>
  );
};

export default ColorDisplay;
