import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Overview from './pages/Overview.jsx';
import Settings from './pages/Settings.jsx';

const App = () => (
  <>
    <div className="ambient-background" aria-hidden="true">
      <div className="ambient-line line-1"></div>
      <div className="ambient-line line-2"></div>
      <div className="ambient-line line-3"></div>
      <div className="ambient-line line-4"></div>
    </div>
    <Navbar />
    <main className="app-shell">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  </>
);

export default App;
