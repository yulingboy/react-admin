import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './router';
import { App as AntdApp } from 'antd';

const App: React.FC = () => {
  return (
    <AntdApp>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </AntdApp>
  );
};

export default App;
