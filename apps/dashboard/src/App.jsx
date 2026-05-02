import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ClickIdStatsPage from './pages/ClickIdStatsPage';
import ClickPerformancePage from './pages/ClickPerformancePage';
import LiveClickToast from './components/LiveClickToast';
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
    <div className="bg-gray-200 dark:bg-gray-900 text-text-main-light dark:text-text-main-dark font-sans h-screen flex flex-col overflow-hidden selection:bg-primary selection:text-white relative transition-colors duration-500">

      {/* 🔮 BACKGROUND BLOBS (Animated) - iOS 26 Style */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-300 dark:bg-yellow-900 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      {showSidebar && <SidebarController setSidebarOpen={setIsSidebarOpen} isMobile={isMobile} />}

      {/* Mobile Header / Toggle Button - Glass Effect */}
      <div className={`lg:hidden flex items-center justify-between p-4 border-b border-white/20 dark:border-gray-700/30 sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 ${!showSidebar ? 'hidden' : ''}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/20 active:scale-95 transition-all text-text-main-light dark:text-text-main-dark"
          >
            <span className="material-icons-round text-2xl">menu</span>
          </button>
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <h1 className="font-bold text-lg leading-tight liquid-text">Realtime</h1>
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

      {/* Live Click Toast Notification */}
      <LiveClickToast />
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
