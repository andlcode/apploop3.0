
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import ScrollToTop from './components/ScrollToTop.jsx';
import { LoopManagerProvider } from './contexts/LoopManagerContext.jsx';
import LooperPage from './pages/LooperPage.jsx';

function App() {
  return (
    <Router>
      <LoopManagerProvider>
        <ScrollToTop />
        <Toaster theme="dark" richColors position="top-center" />
        <Routes>
          <Route path="/" element={<LooperPage />} />
        </Routes>
      </LoopManagerProvider>
    </Router>
  );
}

export default App;
