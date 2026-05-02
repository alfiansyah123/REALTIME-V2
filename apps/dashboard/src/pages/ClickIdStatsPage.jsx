import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import { api } from '../utils/api';

export default function ClickIdStatsPage({
    currency = 'USD',
    currencyRate = 16000,
    isDarkMode,
    toggleTheme,
    onLogout
}) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const clickId = searchParams.get('click_id');

    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({ totalConversions: 0, totalEarning: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [searchQuery, setSearchQuery] = useState('');

    // Default to today
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    useEffect(() => {
        if (!clickId) {
            setError('No click_id provided');
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const startOfDay = `${startDate}T00:00:00.000Z`;
                const endOfDay = `${endDate}T23:59:59.999Z`;

                const response = await api.getConversions(100, startOfDay, endOfDay, clickId);
                const rows = response.data;

                if (rows) {
                    let totalEarning = 0;
                    const formatted = rows.map(row => {
                        const earning = parseFloat(row.earning) || 0;
                        totalEarning += earning;
                        return {
                            id: row.id,
                            subId: row.sub_id,
                            clickId: row.click_id,
                            network: row.network,
                            country: row.country,
                            flag: row.country && row.country !== 'XX'
                                ? `https://flagcdn.com/${row.country.toLowerCase()}.svg`
                                : null,
                            countryName: row.country_name,
                            traffic: row.traffic_type,
                            earning: earning,
                            ipAddress: row.ip_address,
                            created_at: row.created_at,
                        };
                    });

                    setData(formatted);
                    setSummary({
                        clickId: clickId,
                        totalConversions: formatted.length,
                        totalEarning: totalEarning
                    });
                }
            } catch (err) {
                setError('Failed to connect to server');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [clickId, startDate, endDate]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        let sortableData = [...data];

        // Filter by Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            sortableData = sortableData.filter(item =>
                (item.subId && item.subId.toLowerCase().includes(query)) ||
                (item.network && item.network.toLowerCase().includes(query)) ||
                (item.country && item.country.toLowerCase().includes(query)) ||
                (item.ipAddress && item.ipAddress.includes(query))
            );
        }

        if (sortConfig.key !== null) {
            sortableData.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [data, sortConfig, searchQuery]);

    // Aggregate earnings by SubID logic REMOVED (Reviewing single Click ID)

    const formatCurrency = (num) => {
        if (!num) return currency === 'IDR' ? 'Rp 0' : '$0.00';
        if (currency === 'IDR') {
            const idrVal = num * currencyRate;
            return `Rp ${idrVal.toLocaleString('id-ID')}`;
        }
        return `$${num.toFixed(2)}`;
    };

    const getTrafficIcon = (traffic) => {
        if (traffic === 'WAP') {
            return (
                <div className="flex items-center justify-center gap-0.5 text-orange-600 dark:text-orange-400">
                    <span className="material-icons-round text-sm">smartphone</span>
                    <span className="text-[10px] font-semibold">WAP</span>
                </div>
            );
        } else if (traffic === 'WEB') {
            return (
                <div className="flex items-center justify-center gap-0.5 text-cyan-600 dark:text-cyan-400">
                    <span className="material-icons-round text-sm">desktop_windows</span>
                    <span className="text-[10px] font-semibold">WEB</span>
                </div>
            );
        } else if (traffic === 'BOT') {
            return (
                <div className="flex items-center justify-center gap-0.5 text-blue-600 dark:text-blue-400">
                    <span className="text-[10px] font-semibold">BOT</span>
                </div>
            );
        }
        return <span className="text-[10px]">-</span>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col gap-4 relative min-h-screen">
            <Header
                title="Click ID Statistics"
                selectedView="reports" // Enable date filters
                onSearch={setSearchQuery}
                onRefresh={() => {/* Trigger re-fetch if needed, or just rely on state */ }}
                startDate={startDate}
                endDate={endDate}
                onDateRangeChange={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                }}
                currency={currency}
                itemCount={summary.totalConversions}
                totalPayout={summary.totalEarning}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                onLogout={onLogout}
                onBack={() => navigate(-1)}
                hideActions={true}
            />

            {/* Conversion History Table Container */}
            <div className="flex-1 h-fit min-w-0 rounded-3xl glass-panel relative z-10 pb-4 overflow-clip flex flex-col">
                <div className="relative p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Conversion History</h2>
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                            ID: {clickId}
                        </span>
                    </div>
                </div>

                <div className="w-full max-w-full overflow-x-auto relative scrollbar-hide">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center p-8 text-red-500">
                            <span className="material-icons-round text-4xl mb-2">error</span>
                            <span>{error}</span>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                            <span className="material-icons-round text-4xl mb-2">inbox</span>
                            <span>No conversions found for this Click ID</span>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse text-[11px]">
                            <thead className="bg-white/5 dark:bg-black/20 text-[10px] uppercase text-gray-500 dark:text-gray-400 font-semibold sticky top-0 z-10 border-b border-white/10 backdrop-blur-sm">
                                <tr>
                                    <th className="px-2 py-2.5 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('id')}>#</th>
                                    <th className="px-2 py-2.5 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('clickId')}>CLICK ID</th>
                                    <th className="px-2 py-2.5 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('network')}>NETWORK</th>
                                    <th className="px-2 py-2.5 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('country')}>COUNTRY</th>
                                    <th className="px-2 py-2.5 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('traffic')}>TRAFFIC</th>
                                    <th className="px-2 py-2.5 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('earning')}>EARNING</th>
                                    <th className="px-2 py-2.5 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('ipAddress')}>IP</th>
                                    <th className="px-2 py-2.5 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('created_at')}>DATE</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 dark:divide-white/5">
                                {sortedData.map((row, index) => {
                                    return (
                                        <tr key={row.id} className="hover:bg-white/5 dark:hover:bg-white/5">
                                            <td className="px-2 py-2 text-center text-gray-400 dark:text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-2 py-2 text-left text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                                <span className="font-bold">
                                                    {row.clickId}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                {(() => {
                                                    const network = row.network || '';
                                                    const lowerNet = network.toLowerCase().replace(/\s+/g, '');
                                                    const logoPath = `/networks/${lowerNet}.png`;

                                                    return (
                                                        <div className="flex justify-center items-center h-full">
                                                            <img
                                                                src={logoPath}
                                                                alt={network}
                                                                className="h-5 w-auto object-contain max-w-[80px]"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'inline-flex';
                                                                }}
                                                            />
                                                            <span
                                                                className="hidden items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                                                style={{ display: 'none' }}
                                                            >
                                                                {network || '-'}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                {row.flag && row.country && row.country !== 'XX' ? (
                                                    <img
                                                        alt={row.country}
                                                        className="w-5 h-3.5 object-cover rounded-sm inline-block"
                                                        src={row.flag}
                                                    />
                                                ) : (
                                                    <span>
                                                        {row.country !== 'XX' ? row.country : (row.countryName || '🌐')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-center whitespace-nowrap">
                                                {getTrafficIcon(row.traffic)}
                                            </td>
                                            <td className="px-2 py-2 text-center font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                {formatCurrency(row.earning)}
                                            </td>
                                            <td className="px-2 py-2 text-center text-[9px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {row.ipAddress || '-'}
                                            </td>
                                            <td className="px-2 py-2 text-center text-[9px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {formatDate(row.created_at)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
