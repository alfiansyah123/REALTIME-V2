import Header from '../components/Header/Header.jsx';
import ReportsTable from '../components/Table/ReportsTable.jsx';
import { useState, useMemo, useEffect } from 'react';
import { api } from '../utils/api';

const ReportsPage = ({ onLogout, currency, setCurrency, currencyRate, setCurrencyRate, isDarkMode, toggleTheme }) => {
    // Helper function - returns "yesterday" if before 7am WIB, otherwise today
    const getWIBDateString = () => {
        const now = new Date();
        const wibHour = now.getHours(); // Local hour (WIB)

        // If before 7am, use yesterday's date for reporting
        let targetDate = now;
        if (wibHour < 7) {
            targetDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Subtract 1 day
        }

        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [startDate, setStartDate] = useState(getWIBDateString);
    const [endDate, setEndDate] = useState(getWIBDateString);
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const response = await api.getDailyReports(startDate, endDate);

            if (response && Array.isArray(response.data)) {
                // Sort by payouts desc
                const sorted = [...response.data].sort((a, b) => (parseFloat(b.payouts) || 0) - (parseFloat(a.payouts) || 0));
                setData(sorted);
            } else {
                setData([]);
            }
        } catch (err) {
            console.error('Failed to fetch reports', err);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [startDate, endDate]);

    const totalPayout = useMemo(() => {
        return data.reduce((acc, curr) => acc + (parseFloat(curr.payouts) || 0), 0);
    }, [data]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        const query = searchQuery.toLowerCase();
        return data.filter(item =>
            (item.smartlink && item.smartlink.toLowerCase().includes(query)) ||
            (item.network && item.network.toLowerCase().includes(query))
        );
    }, [data, searchQuery]);

    return (
        <div className="flex flex-col gap-4 relative min-h-screen">
            <Header
                selectedView="reports"
                onSearch={setSearchQuery}
                onRefresh={fetchReports}
                startDate={startDate}
                endDate={endDate}
                onDateRangeChange={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                }}
                currency={currency}
                onCurrencyChange={setCurrency}
                currencyRate={currencyRate}
                onCurrencyRateChange={setCurrencyRate}
                totalPayout={totalPayout}
                itemCount={data.length}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                onLogout={onLogout}
            />



            <div className="flex-1 h-fit min-w-0 rounded-lg bg-white dark:bg-[#171e2e] border border-dashed border-gray-200 dark:border-gray-700 shadow-card dark:shadow-none relative z-10 pb-4 overflow-clip">
                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <span className="text-sm text-gray-400 dark:text-gray-500 font-mono">Loading...</span>
                    </div>
                ) : (
                    <ReportsTable
                        data={filteredData}
                        currency={currency}
                        currencyRate={currencyRate}
                        startDate={startDate}
                        endDate={endDate}
                        selectedNetwork="IMONETIZEIT"
                    />
                )}
            </div>
        </div>
    );
};

export default ReportsPage;