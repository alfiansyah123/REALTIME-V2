import { useState, useEffect } from 'react';

export default function Header({
    selectedView,
    onSearch,
    onRefresh,
    onPause,
    startDate,
    endDate,
    onDateRangeChange,
    currency = 'USD',
    onCurrencyChange,
    currencyRate = 16000,
    onCurrencyRateChange,
    totalPayout = 0,
    itemCount = 0,
    isDarkMode,
    toggleTheme,
    onLogout,
    title,
    onBack,
    hideActions
}) {
    const [searchValue, setSearchValue] = useState('');
    const [isPaused, setIsPaused] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSearch = (e) => {
        setSearchValue(e.target.value);
        if (onSearch) onSearch(e.target.value);
    };

    const handlePause = () => {
        setIsPaused(!isPaused);
        if (onPause) onPause(!isPaused);
    };

    const handleStartDateChange = (e) => {
        if (onDateRangeChange) onDateRangeChange(e.target.value, endDate);
    };

    const handleEndDateChange = (e) => {
        if (onDateRangeChange) onDateRangeChange(startDate, e.target.value);
    };

    const handlePresetChange = (e) => {
        const preset = e.target.value;
        if (!preset) return;

        // Use UTC-based date for consistency with API (new day starts at 07:00 WIB)
        const now = new Date();
        const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        let start = new Date(todayUTC);
        let end = new Date(todayUTC);

        const formatDate = (date) => {
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        if (preset === 'today') {
            // default is today (UTC)
        } else if (preset === 'yesterday') {
            start.setUTCDate(todayUTC.getUTCDate() - 1);
            end.setUTCDate(todayUTC.getUTCDate() - 1);
        } else if (preset === 'week') {
            // Last 7 days
            start.setUTCDate(todayUTC.getUTCDate() - 6);
        } else if (preset === 'month') {
            // This month (UTC)
            start = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), 1));
        }

        if (onDateRangeChange) {
            onDateRangeChange(formatDate(start), formatDate(end));
        }
    };

    const getTitle = () => {
        if (title) return title;
        return selectedView === 'reports' ? 'Reports' : 'Realtime Conversion';
    };

    return (
        <header className="glass-panel sticky top-0 z-40 rounded-2xl p-2 sm:p-4 flex flex-col gap-2 sm:gap-4 transition-all duration-300 backdrop-blur-xl">
            {/* Top Row: Title & Status */}
            <div className="flex flex-row justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="material-icons-round text-xl text-gray-600 dark:text-gray-400">arrow_back</span>
                        </button>
                    )}
                    <h2 className="text-sm sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 whitespace-nowrap">
                        {getTitle()}
                    </h2>
                    {/* Mobile Live Indicator */}
                    <div className="lg:hidden flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full text-[10px] text-green-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        <span className="font-bold tracking-wider">LIVE</span>
                    </div>
                </div>

                {/* Status Box - Glass Card */}
                <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono glass-interactive px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl">
                    <span className="hidden sm:inline opacity-60">
                        {currentTime.toLocaleTimeString('en-US', { timeZone: 'UTC' })}
                    </span>
                    <div className="h-3 w-[1px] bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>

                    <div className="flex items-center gap-2">
                        <span className="text-text-muted-light dark:text-text-muted-dark hidden sm:inline opacity-80">Total:</span>
                        <span className="font-bold text-primary text-sm shadow-green-500/20 drop-shadow-sm">
                            {currency === 'IDR' ? `Rp ${(totalPayout * currencyRate).toLocaleString('id-ID')}` : `$${totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </span>
                    </div>

                    <div className="h-3 w-[1px] bg-gray-300 dark:bg-gray-700 hidden lg:block"></div>
                    <div className="hidden lg:flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                        <span className="text-green-500 font-bold tracking-wider text-[10px]">LIVE</span>
                    </div>
                </div>
            </div>

            {/* Controls Row - Compact Mobile Layout */}
            <div className="flex flex-col gap-2 sm:gap-3">
                {/* Row 2: Search + Filters (Side-by-side) */}
                <div className="flex items-center gap-2">
                    {/* Search - Takes available space */}
                    <div className="relative group flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-gray-400">
                            <span className="material-icons-round text-lg">search</span>
                        </div>
                        <input
                            className="glass-input w-full pl-8 pr-2 py-1.5 sm:py-2 text-xs sm:text-sm rounded-xl outline-none placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Search..."
                            type="text"
                            value={searchValue}
                            onChange={handleSearch}
                        />
                    </div>

                    {/* Filters (Currency / Date) - Compact on right */}
                    <div className="shrink-0 flex items-center">
                        {selectedView === 'reports' ? (
                            <div className="flex items-center gap-1">
                                <select
                                    className="glass-interactive py-2 px-2 text-xs rounded-xl cursor-pointer outline-none max-w-[80px]"
                                    onChange={handlePresetChange}
                                    defaultValue="today"
                                >
                                    <option className="bg-white dark:bg-gray-900" value="today">Today</option>
                                    <option className="bg-white dark:bg-gray-900" value="yesterday">Yest</option>
                                    <option className="bg-white dark:bg-gray-900" value="week">Week</option>
                                    <option className="bg-white dark:bg-gray-900" value="month">Month</option>
                                </select>
                                <input
                                    type="date"
                                    value={startDate || ''}
                                    onChange={handleStartDateChange}
                                    className="glass-interactive py-2 px-1 text-[10px] w-[85px] rounded-xl outline-none"
                                />
                                <span className="text-text-muted-light dark:text-text-muted-dark opacity-50 text-[10px]">-</span>
                                <input
                                    type="date"
                                    value={endDate || ''}
                                    onChange={handleEndDateChange}
                                    className="glass-interactive py-2 px-1 text-[10px] w-[85px] rounded-xl outline-none"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <select
                                    value={currency}
                                    onChange={(e) => onCurrencyChange && onCurrencyChange(e.target.value)}
                                    className="glass-interactive py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm rounded-xl cursor-pointer outline-none"
                                >
                                    <option className="bg-white dark:bg-gray-900" value="USD">USD</option>
                                    <option className="bg-white dark:bg-gray-900" value="IDR">IDR</option>
                                </select>
                                {currency === 'IDR' && (
                                    <input
                                        type="number"
                                        value={currencyRate}
                                        onChange={(e) => onCurrencyRateChange && onCurrencyRateChange(Number(e.target.value))}
                                        className="glass-interactive w-20 py-2 px-2 text-sm rounded-xl text-right outline-none hidden sm:block"
                                        placeholder="Rate"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Row 3: Item Count + Actions (Side-by-side) */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark opacity-60 ml-1">
                        {itemCount} items
                    </span>

                    {/* Actions */}
                    {!hideActions && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onRefresh}
                                className="w-7 h-7 sm:w-8 sm:h-8 glass-interactive rounded-lg shadow-sm flex items-center justify-center text-text-main-light dark:text-text-main-dark group"
                                title="Refresh"
                            >
                                <span className="material-icons-round text-lg group-hover:rotate-180 transition-transform duration-500">refresh</span>
                            </button>

                            <button
                                onClick={toggleTheme}
                                className="w-7 h-7 sm:w-8 sm:h-8 glass-interactive rounded-lg shadow-sm flex items-center justify-center text-text-main-light dark:text-text-main-dark"
                                title="Toggle Theme"
                            >
                                <span className="material-icons-round text-lg">
                                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                                </span>
                            </button>

                            <button
                                onClick={onLogout}
                                className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 backdrop-blur-md active:scale-95 transition-all rounded-lg shadow-sm flex items-center justify-center"
                                title="Logout"
                            >
                                <span className="material-icons-round text-lg">logout</span>
                            </button>

                            <button
                                onClick={handlePause}
                                className="w-7 h-7 sm:w-8 sm:h-8 glass-interactive rounded-lg shadow-sm flex items-center justify-center text-text-main-light dark:text-text-main-dark"
                                title={isPaused ? "Resume" : "Pause"}
                            >
                                <span className="material-icons-round text-lg">
                                    {isPaused ? 'play_arrow' : 'pause'}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
