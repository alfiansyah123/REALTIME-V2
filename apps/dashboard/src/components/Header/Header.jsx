import { useState, useEffect, memo } from 'react';

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

    // Isolated Clock Component to prevent Header re-renders every second
    const Clock = memo(() => {
        const [time, setTime] = useState(new Date());
        useEffect(() => {
            const timer = setInterval(() => setTime(new Date()), 1000);
            return () => clearInterval(timer);
        }, []);
        return <span>{time.toLocaleTimeString('en-US', { timeZone: 'UTC' })}</span>;
    });

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
        <header className="sticky top-0 z-10 bg-body dark:bg-dark border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-2 sm:p-4 flex flex-col gap-2 sm:gap-4 shadow-card dark:shadow-none">
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
                    <h2 className="text-sm sm:text-lg font-medium uppercase text-gray-900 dark:text-white font-mono tracking-wider whitespace-nowrap">
                        {getTitle()}
                    </h2>
                    {/* Mobile Live Indicator */}
                    <div className="lg:hidden flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 border border-dashed border-orange-300 dark:border-orange-700 px-2 py-0.5 rounded text-[10px] text-orange-500 font-mono">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                        <span className="font-bold tracking-wider">LIVE</span>
                    </div>
                </div>

                {/* Status Box - Glass Card */}
                <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono bg-white dark:bg-light-dark border border-dashed border-gray-200 dark:border-gray-700 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-card dark:shadow-none">
                    <span className="hidden sm:inline opacity-60">
                        <Clock />
                    </span>
                    <div className="h-3 w-[1px] bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>

                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">Total:</span>
                        <span className="font-bold text-orange-500 text-sm">
                            {currency === 'IDR' ? `Rp ${(totalPayout * currencyRate).toLocaleString('id-ID')}` : `$${totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </span>
                    </div>

                    <div className="h-3 w-[1px] bg-gray-300 dark:bg-gray-600 hidden lg:block"></div>
                    <div className="hidden lg:flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                        <span className="text-orange-500 font-bold tracking-wider text-[10px]">LIVE</span>
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
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 font-mono ml-1">
                        {itemCount} items
                    </span>

                    {/* Actions */}
                    {!hideActions && (
                        <div className="flex items-center gap-2">

                            <button
                                onClick={toggleTheme}
                                className="w-7 h-7 sm:w-8 sm:h-8 bg-white dark:bg-light-dark border border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500 rounded-lg shadow-card dark:shadow-none flex items-center justify-center text-gray-700 dark:text-gray-100"
                                title="Toggle Theme"
                            >
                                <span className="material-icons-round text-lg">
                                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                                </span>
                            </button>

                            <button
                                onClick={onLogout}
                                className="w-7 h-7 sm:w-8 sm:h-8 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 active:scale-95 transition-all rounded-lg shadow-sm flex items-center justify-center"
                                title="Logout"
                            >
                                <span className="material-icons-round text-lg">logout</span>
                            </button>

                            <button
                                onClick={handlePause}
                                className="w-7 h-7 sm:w-8 sm:h-8 bg-white dark:bg-light-dark border border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500 rounded-lg shadow-card dark:shadow-none flex items-center justify-center text-gray-700 dark:text-gray-100"
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
