import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ViteのWebSocket接続エラー（HMR無効化による無害なエラー）や、設計上のタイムアウト警告を完全に無視するためのハンドラ
if (typeof window !== 'undefined') {
  const ignorePatterns = ['websocket', 'vite', 'hmr', 'timeout', 'abort', 'timed out'];

  // console.error と console.warn のフィルタリング
  const originalError = console.error;
  console.error = function (...args: any[]) {
    const msg = args.map(arg => String(arg)).join(' ');
    if (ignorePatterns.some(pattern => msg.toLowerCase().includes(pattern))) {
      return;
    }
    originalError.apply(console, args);
  };

  const originalWarn = console.warn;
  console.warn = function (...args: any[]) {
    const msg = args.map(arg => String(arg)).join(' ');
    if (ignorePatterns.some(pattern => msg.toLowerCase().includes(pattern))) {
      return;
    }
    originalWarn.apply(console, args);
  };

  // 未処理の拒否やエラーイベントのハンドリング
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason);
    if (ignorePatterns.some(pattern => message.toLowerCase().includes(pattern))) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const message = event.message || '';
    if (ignorePatterns.some(pattern => message.toLowerCase().includes(pattern))) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

