import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import CreateTest from './pages/CreateTest';
import TestInterface from './pages/TestInterface';
import Analysis from './pages/Analysis';
import History from './pages/History';
import './index.css';

const AppContent = () => {
  const location = useLocation();
  const isTestRoute = location.pathname.startsWith('/test');

  return (
    <div className="min-h-screen bg-ssc-light dark:bg-ssc-dark dark:text-white transition-colors duration-200">
      {!isTestRoute && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/create-test" element={<CreateTest />} />
          <Route path="/test" element={<TestInterface />} />
          <Route path="/analysis/:id" element={<Analysis />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  );
};

import { TestProvider } from './context/TestContext';

function App() {
  return (
    <Router>
      <TestProvider>
        <AppContent />
      </TestProvider>
    </Router>
  );
}

export default App;
