import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import HomePage from './pages/HomePage';
import WaterBillPage from './pages/WaterBillPage';
import ElectricityBillPage from './pages/ElectricityBillPage';
import HistoryPage from './pages/HistoryPage';
import AppLayout from './components/layout/AppLayout';
import './App.css';

const App = () => {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="water-bill" element={<WaterBillPage />} />
          <Route path="electricity-bill" element={<ElectricityBillPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="*" element={
            <div className="container mx-auto py-12 text-center">
              <h1 className="text-3xl font-bold mb-4">页面未找到</h1>
              <p className="mb-8">您请求的页面不存在</p>
              <a href="/" className="text-primary hover:underline">返回首页</a>
            </div>
          } />
        </Route>
      </Routes>
    </AppProvider>
  );
};

export default App;