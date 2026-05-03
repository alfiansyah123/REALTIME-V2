import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api';
import Header from '../components/Header/Header';
import ConversionTable from '../components/Table/ConversionTable';
import Footer from '../components/Footer/Footer';
import Toast from '../components/Notification/Toast';

export default function ConversionsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const mountedRef = useRef(true);

    // Helper: Format row
    const formatRow = useCallback((row) => ({
        id: row.id,
        subId: row.sub_id,
        clickId: row.click_id,
        network: row.network,
        country: row.country,
        flag: row.country && row.country !== 'XX' ? `https://flagcdn.com/${row.country.toLowerCase()}.svg` : null,
        countryName: row.country_name,
        traffic: row.traffic_type,
        os: row.traffic_type,         // OS is stored in traffic_type column
        browser: row.user_agent,      // Browser is stored in user_agent column
        earning: parseFloat(row.earning) || 0,
        ipAddress: row.ip_address,
        created_at: row.created_at,
        highlighted: parseFloat(row.earning) > 10
    }), []);

    const fetchData = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const response = await api.getConversions(100);
            const rows = response.data;

            if (rows && mountedRef.current) {
                const newFormatted = rows.map(formatRow);

                setData(prev => {
                    const isSame = JSON.stringify(prev) === JSON.stringify(newFormatted);
                    if (isSame) return prev;
                    
                    // Check for new leads to show notification
                    if (prev.length > 0 && newFormatted.length > 0) {
                        const newItems = newFormatted.filter(newItem => !prev.some(oldItem => oldItem.id === newItem.id));
                        if (newItems.length > 0) {
                            setNotification(newItems[0]);
                        }
                    }
                    
                    return newFormatted;
                });
            }
        } catch (err) {
            console.error('Error fetching conversions:', err);
        } finally {
            if (!isSilent && mountedRef.current) setLoading(false);
        }
    }, [formatRow]);

    useEffect(() => {
        mountedRef.current = true;
        fetchData(); // Initial load

        // Auto-Sync / Polling Fallback (Every 1 second - Aggressive Mode)
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchData(true);
            }
        }, 1000);

        return () => {
            mountedRef.current = false;
            clearInterval(interval);
        };
    }, [fetchData]);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleRefresh = () => {
        fetchData();
    };

    const handleExport = () => {
        console.log('Exporting...');
        // TODO: Implement CSV export logic
    };

    const handlePause = (isPaused) => {
        console.log('Pause:', isPaused);
    };

    return (
        <div className="flex flex-col min-h-screen relative">
            {notification && (
                <Toast
                    data={notification}
                    onClose={() => setNotification(null)}
                />
            )}

            <Header
                selectedView="conversions"
                onSearch={handleSearch}
                onRefresh={handleRefresh}
                onExport={handleExport}
                onPause={handlePause}
                itemCount={data.length}
            />

            <div className="flex-1 p-4">
                {loading && data.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <ConversionTable
                        searchQuery={searchQuery}
                        data={data}
                    />
                )}
            </div>

            <Footer />
        </div>
    );
}
