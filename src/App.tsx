import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout/Layout';
import DataImport from './pages/DataImport';
import BitData from './pages/BitData';
import Data25ms from './pages/Data25ms';
import Data50ms from './pages/Data50ms';
import SnapshotData from './pages/SnapshotData';
// 驱动段数据页面
import DriverData from './pages/DriverData';

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/import" replace />} />
              <Route path="import" element={<DataImport />} />
              <Route path="bit-data" element={<BitData />} />
              <Route path="data-25ms" element={<Data25ms />} />
              <Route path="data-50ms" element={<Data50ms />} />
              <Route path="snapshot" element={<SnapshotData />} />
              {/* 驱动段数据路由 */}
              <Route path="driver-data" element={<DriverData />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
