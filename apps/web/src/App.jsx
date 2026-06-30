
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';
import { LoopManagerProvider } from './contexts/LoopManagerContext.jsx';
import LooperPage from './pages/LooperPage.jsx';

function App() {
  return (
    <Router>
      <LoopManagerProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LooperPage />} />
        </Routes>
      </LoopManagerProvider>
    </Router>
  );
}

export default App;
