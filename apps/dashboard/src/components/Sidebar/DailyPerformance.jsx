import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../utils/api';

export default function DailyPerformance({ currency = 'USD', currencyRate = 16000 }) {
    const [searchParams] = useSearchParams();
    const dateParam = searchParams.get('date') || 'rt_1'; // rt_1 = Today, rt_2 = Yesterday

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchDailyPerformance = async (isSilent = false) => {
            if (!isSilent) setLoading(true);
            try {
                const targetDate = new Date();
                if (dateParam === 'rt_2') {
                    targetDate.setUTCDate(targetDate.getUTCDate() - 1);
                }
                const dateString = targetDate.toISOString().split('T')[0];

                const startOfDay = `${dateString}T00:00:00.000Z`;
                const endOfDay = `${dateString}T23:59:59.999Z`;

                const response = await api.getConversions(1000, startOfDay, endOfDay);
                const rows = response.data;

                if (rows && rows.length > 0) {
                    const aggregated = rows.reduce((acc, curr) => {
                        let name = curr.sub_id && curr.sub_id !== 'Unknown' ? curr.sub_id : curr.click_id;
                        if (!name) name = 'Unknown';

                        if (!acc[name]) {
                            acc[name] = { name, count: 0, amount: 0 };
                        }
                        acc[name].count += 1;
                        acc[name].amount += Number(curr.earning) || 0;
                        return acc;
                    }, {});

                    const sortedData = Object.values(aggregated).sort((a, b) => b.amount - a.amount);
                    setData(sortedData);
                } else {
                    setData([]);
                }
            } catch (error) {
                console.error('Error fetching daily performance:', error);
            } finally {
                if (!isSilent) setLoading(false);
            }
        };

        fetchDailyPerformance();

        // Polling every 5s for sidebar aggregate is enough
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchDailyPerformance(true);
            }
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [dateParam]);

    const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToPrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
    const goToNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

    if (loading) {
        return (
            <div className="py-4 flex justify-center text-gray-400 dark:text-gray-500 items-center">
                <span className="text-xs font-mono">Loading...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase text-text-main-light dark:text-text-main-dark">
                    {dateParam === 'rt_2' ? 'Yesterday performance' : 'Daily performance'}
                </h3>
                <div className="flex items-center text-xs bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 border border-border-light dark:border-border-dark">
                    <span className="font-mono">{data.length > 0 ? `${startIndex + 1}/${itemsPerPage}` : '0/0'}</span>
                    <span className="material-icons-round text-sm ml-1 cursor-pointer hover:text-primary">
                        expand_more
                    </span>
                </div>
            </div>

            <div className="space-y-0.5 text-xs">
                {currentData.length > 0 ? (
                    currentData.map((item, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center py-1.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded group cursor-pointer border-l-2 border-transparent hover:border-primary transition-all"
                        >
                            <div className="flex items-baseline truncate pr-2">
                                <span className="font-medium truncate max-w-[80px]" title={item.name}>{item.name}</span>
                                <span className="text-text-muted-light dark:text-text-muted-dark text-[10px] ml-1">
                                    x{item.count}
                                </span>
                            </div>
                            <span className="font-mono font-medium">
                                {currency === 'IDR'
                                    ? `Rp ${(item.amount * currencyRate).toLocaleString('id-ID')}`
                                    : `$${item.amount.toFixed(2)}`
                                }
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 text-text-muted-light dark:text-text-muted-dark italic">
                        No performance data for {dateParam === 'rt_2' ? 'yesterday' : 'today'}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {data.length > 0 && (
                <div className="flex justify-center mt-3 gap-1">
                    <button
                        onClick={goToFirstPage}
                        disabled={currentPage === 1}
                        className="p-1 text-text-muted-light dark:text-text-muted-dark hover:text-primary disabled:opacity-30"
                    >
                        <span className="material-icons-round text-base">first_page</span>
                    </button>
                    <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className="p-1 text-text-muted-light dark:text-text-muted-dark hover:text-primary disabled:opacity-30"
                    >
                        <span className="material-icons-round text-base">chevron_left</span>
                    </button>
                    <span className="text-xs self-center font-mono text-text-muted-light dark:text-text-muted-dark">
                        {currentPage}/{totalPages} • {startIndex + 1}-{Math.min(endIndex, data.length)}
                    </span>
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="p-1 text-text-muted-light dark:text-text-muted-dark hover:text-primary disabled:opacity-30"
                    >
                        <span className="material-icons-round text-base">chevron_right</span>
                    </button>
                    <button
                        onClick={goToLastPage}
                        disabled={currentPage === totalPages}
                        className="p-1 text-text-muted-light dark:text-text-muted-dark hover:text-primary disabled:opacity-30"
                    >
                        <span className="material-icons-round text-base">last_page</span>
                    </button>
                </div>
            )}
        </div>
    );
}
