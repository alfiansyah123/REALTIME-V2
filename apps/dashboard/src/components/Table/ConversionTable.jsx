import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ConversionTable({ searchQuery, currency = 'USD', currencyRate = 16000, data = [] }) {
    const navigate = useNavigate();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredData = sortedData.filter((item) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            item.subId.toLowerCase().includes(query) ||
            (item.clickId && item.clickId.toLowerCase().includes(query)) ||
            item.network.toLowerCase().includes(query) ||
            item.country.toLowerCase().includes(query) ||
            item.ipAddress.includes(query)
        );
    });

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
    };

    const formatCurrency = (num) => {
        if (!num) return currency === 'IDR' ? 'Rp 0' : '$0.00';
        if (currency === 'IDR') {
            const idrVal = num * currencyRate;
            return `Rp ${idrVal.toLocaleString('id-ID')}`;
        }
        return `$${num.toFixed(2)}`;
    };

    // Aggregate earnings by ClickID to find the "King" of ClickIDs
    const topClickId = useMemo(() => {
        if (data.length === 0) return null;
        const totals = data.reduce((acc, curr) => {
            acc[curr.clickId] = (acc[curr.clickId] || 0) + curr.earning;
            return acc;
        }, {});

        let max = 0;
        let winner = null;
        Object.entries(totals).forEach(([id, total]) => {
            if (total > max) {
                max = total;
                winner = id;
            }
        });
        return winner;
    }, [data]);

    return (
        <div className="w-full overflow-x-auto relative scrollbar-hide">
            <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-gray-50 dark:bg-gray-800 text-[10px] uppercase text-gray-500 dark:text-gray-400 font-semibold sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="px-2 py-2.5 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('id')}>#</th>
                        <th className="px-2 py-2.5 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('clickId')}>CLICK ID</th>
                        <th className="px-2 py-2.5 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('network')}>NETWORK</th>
                        <th className="px-2 py-2.5 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('country')}>COUNTRY</th>
                        <th className="px-2 py-2.5 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('traffic')}>TRAFFIC</th>
                        <th className="px-2 py-2.5 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('earning')}>EARNING</th>
                        <th className="px-2 py-2.5 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('ipAddress')}>IP</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredData.map((row, index) => {
                        const isTopWinner = topClickId && row.clickId === topClickId;
                        return (
                            <tr
                                key={row.id}
                                className="hover:bg-white/5 dark:hover:bg-white/5"
                            >
                                <td className="px-2 py-2 text-center text-gray-400 dark:text-gray-500">
                                    {index + 1}
                                </td>
                                <td className="px-2 py-2 text-left text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                    {isTopWinner && <span className="mr-0.5 text-lg">👑</span>}
                                    <button
                                        onClick={() => navigate(`/stats?click_id=${encodeURIComponent(row.clickId)}`)}
                                        className={`hover:text-blue-500 dark:hover:text-blue-400 hover:underline text-left ${isTopWinner ? "rgb-text font-bold" : ""}`}
                                    >
                                        {row.clickId}
                                    </button>
                                </td>
                                <td className="px-2 py-2 text-center">
                                    {(() => {
                                        const network = row.network || '';
                                        const lowerNet = network.toLowerCase().replace(/\s+/g, ''); // remove spaces for filename
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
                                                    style={{ display: 'none' }} // Initially hidden, shown by onError
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
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
