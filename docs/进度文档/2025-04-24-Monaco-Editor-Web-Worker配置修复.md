# Monaco Editor Web Worker 配置修复

**日期时间**: 2025年4月24日 21:45

## 问题描述

在使用 Monaco Editor 组件 (`json-editor.tsx`) 时，出现了以下错误：

```
You must define a function MonacoEnvironment.getWorkerUrl or MonacoEnvironment.getWorker

TypeError: Cannot read properties of undefined (reading 'toUrl')
    at _FileAccessImpl.toUri (network.js:225:40)
    at _FileAccessImpl.asBrowserUri (network.js:174:26)
    at editorSimpleWorker.js:322:40
```

这个错误是因为 Monaco Editor 需要正确配置 Web Worker 才能正常工作，但在 Vite 环境中需要特殊处理。

## 解决方案

1. **修改 `json-editor.tsx` 组件**：
   - 导入 Monaco Editor 所需的 worker 文件
   - 配置 `MonacoEnvironment.getWorker` 函数，根据语言类型返回对应的 worker

2. **更新 Vite 配置**：
   - 添加 worker 格式配置
   - 排除 monaco-editor 的预构建
   - 优化构建输出，将 monaco-editor 单独打包

## 技术细节

### json-editor.tsx 修改

添加了以下代码：

```typescript
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

// 配置Monaco Editor的Web Worker
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    return new editorWorker();
  }
};
```

### vite.config.ts 修改

添加了以下配置：

```typescript
worker: {
  format: 'es', // 使用ES模块格式的worker
},
optimizeDeps: {
  exclude: ['monaco-editor'] // 排除monaco-editor的预构建
},
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        // 将monaco-editor相关代码单独打包，避免主包过大
        'monaco-editor': ['monaco-editor']
      }
    }
  }
}
```

## 收益

- 修复了 Monaco Editor 的 Web Worker 加载错误
- 优化了构建配置，提高了应用性能
- 确保了 JSON 编辑器组件的正常工作
- 改进了代码分割策略，减小了主包体积