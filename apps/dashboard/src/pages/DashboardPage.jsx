import Header from '../components/Header/Header.jsx';
import ConversionTable from '../components/Table/ConversionTable.jsx';
import Toast from '../components/Notification/Toast.jsx';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { speakMessage } from '../utils/voice';

const DashboardPage = ({ onLogout, currency, setCurrency, currencyRate, setCurrencyRate, isDarkMode, toggleTheme }) => {
    const [searchParams] = useSearchParams();
    const dateParam = searchParams.get('date') || 'rt_1'; // rt_1 = Today, rt_2 = Yesterday

    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const prevIdsRef = useRef(new Set());

    // Notification Sound Reference
    const notificationSound = useRef(null);

    useEffect(() => {
        notificationSound.current = new Audio('/notification.mp3');
        notificationSound.current.load(); // Preload
    }, []);

    const playSound = () => {
        if (notificationSound.current) {
            notificationSound.current.currentTime = 0;
            notificationSound.current.play().catch(e => console.error("Playback failed:", e));
        }
    };

    // Request Browser Notification Permission on mount
    useEffect(() => {
        if ("Notification" in window) {
            if (Notification.permission !== "granted" && Notification.permission !== "denied") {
                Notification.requestPermission();
            }
        }
    }, []);

    // Helper: Format row from Supabase to frontend format
    const formatRow = useCallback((row) => ({
        id: row.id,
        subId: row.sub_id,
        clickId: row.click_id,
        network: row.network,
        country: row.country,
        flag: row.country && row.country !== 'XX'
            ? `https://flagcdn.com/${String(row.country).toLowerCase()}.svg`
            : null,
        countryName: row.country_name,
        traffic: row.traffic_type,
        os: row.traffic_type,
        browser: row.user_agent,
        earning: parseFloat(row.earning) || 0,
        ipAddress: row.ip_address,
        created_at: row.created_at,
        highlighted: parseFloat(row.earning) > 10
    }), []);

    // Show notification for new conversion
    const showNewConversionNotification = useCallback((newest) => {
        // 1. Show In-App Toast
        setNotification(newest);

        // 2.5 Voice Notification (TTS)
        const voiceTxt = `${newest.clickId || 'Unknown'} dapat ${newest.earning} dollar`;
        speakMessage(voiceTxt);

        // 3. Show Browser Native Notification
        if ("Notification" in window && Notification.permission === "granted") {
            try {
                new Notification("New Conversion! 💰", {
                    body: `Click ID: ${newest.clickId || 'N/A'}\nPayout: $${newest.earning.toFixed(2)}\nCountry: ${newest.countryName}`,
                    icon: "/favicon.ico",
                    silent: false
                });
            } catch (e) {
                console.error("Browser notification failed", e);
            }
        }
    }, []);

    // Fetch data logic
    const fetchData = useCallback(async (isSilent = false) => {
        // Calculate target date
        const targetDate = new Date();
        if (dateParam === 'rt_2') {
            targetDate.setUTCDate(targetDate.getUTCDate() - 1);
        }
        const dateString = targetDate.toISOString().split('T')[0];

        try {
            if (!isSilent) setIsLoading(true);
            const startOfDay = `${dateString}T00:00:00.000Z`;
            const endOfDay = `${dateString}T23:59:59.999Z`;

            const response = await api.getConversions(500, startOfDay, endOfDay);
            const rows = response.data;

            if (rows) {
                const formatted = rows.map(formatRow);

                // Check for new conversions
                if (prevIdsRef.current.size > 0) {
                    const newEntries = formatted.filter(item => !prevIdsRef.current.has(item.id));
                    if (newEntries.length > 0) {
                        showNewConversionNotification(newEntries[0]);
                    }
                }

                // Update Set
                if (formatted.length > 0) {
                    prevIdsRef.current = new Set(formatted.map(item => item.id));
                }

                // OPTIMIZATION: Only update if data actually changed
                setData(prev => {
                    const isSame = JSON.stringify(prev) === JSON.stringify(formatted);
                    return isSame ? prev : formatted;
                });
            }
        } catch (err) {
            console.error("Failed to fetch conversions", err);
        } finally {
            if (!isSilent) setIsLoading(false);
        }
    }, [dateParam, formatRow, showNewConversionNotification]);

    // Effect: Initial Load + Polling
    useEffect(() => {
        // Initial Fetch
        fetchData();

        // Polling (1s)
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchData(true);
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [fetchData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        const query = searchQuery.toLowerCase();
        return data.filter(item =>
            (item.clickId && String(item.clickId).toLowerCase().includes(query)) ||
            (item.subId && String(item.subId).toLowerCase().includes(query)) ||
            (item.network && String(item.network).toLowerCase().includes(query)) ||
            (item.country && String(item.country).toLowerCase().includes(query)) ||
            (item.ipAddress && String(item.ipAddress).includes(query))
        );
    }, [data, searchQuery]);

    const totalPayout = useMemo(() => {
        return filteredData.reduce((acc, curr) => acc + curr.earning, 0);
    }, [filteredData]);

    return (
        <div className="flex flex-col gap-4 relative min-h-screen">
            {notification && (
                <Toast
                    data={notification}
                    onClose={() => setNotification(null)}
                />
            )}

            <Header
                selectedView="conversions"
                onSearch={setSearchQuery}
                onRefresh={() => setData([])}
                currency={currency}
                onCurrencyChange={setCurrency}
                currencyRate={currencyRate}
                onCurrencyRateChange={setCurrencyRate}
                totalPayout={totalPayout}
                itemCount={filteredData.length}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                onLogout={onLogout}
            />

            <div className="flex-1 h-fit min-w-0 rounded-3xl glass-panel relative z-10 pb-4 overflow-clip">
                {isLoading && data.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary blur-sm absolute top-0 left-0"></div>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    </div>
                ) : (
                    <ConversionTable
                        searchQuery={searchQuery}
                        currency={currency}
                        currencyRate={currencyRate}
                        data={data}
                    />
                )}
            </div>

        </div>
    );
};

export default DashboardPage;
