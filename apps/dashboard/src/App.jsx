import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ClickIdStatsPage from './pages/ClickIdStatsPage';
import ClickPerformancePage from './pages/ClickPerformancePage';
// import LiveClickToast from './components/LiveClickToast';
import { useTheme } from './context/ThemeContext';

// Component to handle sidebar closing on route change
function SidebarController({ setSidebarOpen, isMobile }) {
  const location = useLocation();
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile, setSidebarOpen]);
  return null;
}

function ProtectedLayout({ children, isSidebarOpen, setIsSidebarOpen, isMobile, toggleTheme, isDarkMode, currency, setCurrency, currencyRate, setCurrencyRate, showSidebar = true }) {
  if (!children) return null;
  return (
    <div className="bg-body dark:bg-dark text-gray-900 dark:text-white font-sans h-screen flex flex-col overflow-hidden selection:bg-teal-500/30 selection:text-teal-600 relative">

      {showSidebar && <SidebarController setSidebarOpen={setIsSidebarOpen} isMobile={isMobile} />}

      {/* Mobile Header */}
      <div className={`lg:hidden flex items-center justify-between p-4 border-b border-dashed border-gray-200 dark:border-gray-700 sticky top-0 z-30 bg-body dark:bg-dark ${!showSidebar ? 'hidden' : ''}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-teal-500 active:scale-95 transition-all text-gray-700 dark:text-gray-100"
          >
            <span className="material-icons-round text-2xl">menu</span>
          </button>
          <div className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse"></div>
          <h1 className="font-bold text-lg leading-tight font-mono text-teal-500">SCATTER TEAM</h1>
        </div>
        {/* Theme Toggle for Mobile */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/20 active:scale-95 transition-all text-text-main-light dark:text-text-main-dark"
        >
          <span className="material-icons-round text-xl">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden p-1 sm:p-4 gap-4 relative">

        {/* Sidebar - Mobile Overlay Backdrop */}
        {showSidebar && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            currency={currency}
            currencyRate={currencyRate}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative gap-4">
          {children}
        </main>
      </div>

      {/* Live Click Toast Notification disabled for performance */}
      {/* <LiveClickToast /> */}
    </div>
  );
}

function App() {
  const { isDark: isDarkMode, toggleTheme } = useTheme();
  const [currency, setCurrency] = useState('USD');
  const [currencyRate, setCurrencyRate] = useState(16000);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check local storage for auth persistence
    return localStorage.getItem('auth_token') === 'loggedin';
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false); // Reset on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('auth_token', 'loggedin');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  // Auto Logout on Inactivity (1 Hour)
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;
    const OneHour = 60 * 60 * 1000; // 3600000 ms

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log("Auto logging out due to inactivity");
        handleLogout();
      }, OneHour);
    };

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer(); // Start timer

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />
        } />

        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard?date=rt_1" replace /> : <Navigate to="/login" replace />
        } />

        <Route path="/dashboard" element={
          isAuthenticated ? (
            <ProtectedLayout
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              isMobile={isMobile}
              toggleTheme={toggleTheme}
              isDarkMode={isDarkMode}
              currency={currency}
              setCurrency={setCurrency}
              currencyRate={currencyRate}
              setCurrencyRate={setCurrencyRate}
            >
              <DashboardPage onLogout={handleLogout} currency={currency} setCurrency={setCurrency} currencyRate={currencyRate} setCurrencyRate={setCurrencyRate} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            </ProtectedLayout>
          ) : <Navigate to="/login" replace />
        } />

        <Route path="/reports" element={
          isAuthenticated ? (
            <ProtectedLayout
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              isMobile={isMobile}
              toggleTheme={toggleTheme}
              isDarkMode={isDarkMode}
              currency={currency}
              setCurrency={setCurrency}
              currencyRate={currencyRate}
              setCurrencyRate={setCurrencyRate}
            >
              <ReportsPage onLogout={handleLogout} currency={currency} setCurrency={setCurrency} currencyRate={currencyRate} setCurrencyRate={setCurrencyRate} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            </ProtectedLayout>
          ) : <Navigate to="/login" replace />
        } />

        <Route path="/click-performance" element={
          isAuthenticated ? (
            <ProtectedLayout
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              isMobile={isMobile}
              toggleTheme={toggleTheme}
              isDarkMode={isDarkMode}
              currency={currency}
              setCurrency={setCurrency}
              currencyRate={currencyRate}
              setCurrencyRate={setCurrencyRate}
            >
              <ClickPerformancePage />
            </ProtectedLayout>
          ) : <Navigate to="/login" replace />
        } />

        <Route path="/stats" element={
          isAuthenticated ? (
            <ProtectedLayout
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              isMobile={isMobile}
              toggleTheme={toggleTheme}
              isDarkMode={isDarkMode}
              currency={currency}
              setCurrency={setCurrency}
              currencyRate={currencyRate}
              setCurrencyRate={setCurrencyRate}
            >
              <ClickIdStatsPage currency={currency} currencyRate={currencyRate} />
            </ProtectedLayout>
          ) : <Navigate to="/login" replace />
        } />

        <Route path="/ganti_pw" element={
          isAuthenticated ? (
            <ProtectedLayout
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              isMobile={isMobile}
              toggleTheme={toggleTheme}
              isDarkMode={isDarkMode}
              currency={currency}
              setCurrency={setCurrency}
              currencyRate={currencyRate}
              setCurrencyRate={setCurrencyRate}
              showSidebar={false}
            >
              <ChangePasswordPage />
            </ProtectedLayout>
          ) : <Navigate to="/login" replace />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
