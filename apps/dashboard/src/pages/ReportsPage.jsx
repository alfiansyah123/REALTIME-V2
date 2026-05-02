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
    const [selectedNetwork, setSelectedNetwork] = useState('IMONETIZEIT');

    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            let response;
            if (selectedNetwork === 'TRAFEE') {
                response = await api.getTrafeeReports(startDate, endDate);
            } else {
                response = await api.getDailyReports(startDate, endDate);
            }

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
    }, [startDate, endDate, selectedNetwork]);

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

            <div className="flex justify-start px-6 -mb-2 mt-2">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setSelectedNetwork('IMONETIZEIT')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            selectedNetwork === 'IMONETIZEIT'
                                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                    >
                        IMONETIZEIT
                    </button>
                    <button
                        onClick={() => setSelectedNetwork('TRAFEE')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            selectedNetwork === 'TRAFEE'
                                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                    >
                        TRAFEE
                    </button>
                </div>
            </div>

            <div className="flex-1 h-fit min-w-0 rounded-3xl glass-panel relative z-10 pb-4 overflow-clip">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <ReportsTable
                        data={filteredData}
                        currency={currency}
                        currencyRate={currencyRate}
                        startDate={startDate}
                        endDate={endDate}
                        selectedNetwork={selectedNetwork}
                    />
                )}
            </div>
        </div>
    );
};

export default ReportsPage;