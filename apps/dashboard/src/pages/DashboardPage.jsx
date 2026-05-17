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

    const parseOS = (ua) => {
        if (!ua) return null;
        const lowerUA = ua.toLowerCase();
        if (lowerUA.includes('android')) return 'Android';
        if (lowerUA.includes('iphone') || lowerUA.includes('ipad') || lowerUA.includes('ios')) return 'iOS';
        if (lowerUA.includes('windows')) return 'Windows';
        if (lowerUA.includes('mac os') || lowerUA.includes('macintosh')) return 'macOS';
        if (lowerUA.includes('linux')) return 'Linux';
        return null;
    };

    const parseBrowser = (ua) => {
        if (!ua) return null;
        const lowerUA = ua.toLowerCase();
        if (lowerUA.includes('fbav') || lowerUA.includes('fban') || lowerUA.includes('fbiab')) return 'Facebook';
        if (lowerUA.includes('instagram')) return 'Instagram';
        if (lowerUA.includes('tiktok')) return 'TikTok';
        if (lowerUA.includes('whatsapp')) return 'WhatsApp';
        if (lowerUA.includes('chrome')) return 'Chrome';
        if (lowerUA.includes('safari') && !lowerUA.includes('chrome')) return 'Safari';
        if (lowerUA.includes('firefox')) return 'Firefox';
        return null;
    };

    // Helper: Format row from Supabase to frontend format
    const formatRow = useCallback((row) => {
        // Use dedicated columns if available, otherwise fallback to old parsing logic
        let os = row.os;
        if (!os || os === 'Unknown' || os === 'WAP' || os === 'WEB') {
            os = parseOS(row.user_agent) || row.traffic_type || 'Unknown';
        }

        let browser = row.browser;
        if (!browser || browser === 'Unknown' || browser === row.user_agent) {
            browser = parseBrowser(row.user_agent) || 'Unknown';
        }

        // Legacy Fallback: Parse "OS | Browser" format if it was saved in user_agent column
        if (!row.os && row.user_agent && row.user_agent.includes(' | ')) {
            const parts = row.user_agent.split(' | ');
            os = parts[0];
            browser = parts[1];
        }

        return {
            id: row.id,
            subId: (row.sub_id && (row.sub_id.length > 50 || row.sub_id.includes(',') || row.sub_id.includes('%2C'))) 
                ? 'Unknown' 
                : row.sub_id,
            clickId: (row.click_id && (row.click_id.length > 50 || row.click_id.includes(',') || row.click_id.includes('%2C')))
                ? 'Unknown'
                : row.click_id,
            network: row.network,
            country: row.country,
            flag: row.country && row.country !== 'XX'
                ? `https://flagcdn.com/${String(row.country).toLowerCase()}.svg`
                : null,
            countryName: row.country_name,
            traffic: row.traffic_type,
            os: os,
            browser: browser,
            earning: parseFloat(row.earning) || 0,
            ipAddress: row.ip_address,
            created_at: row.created_at,
            highlighted: parseFloat(row.earning) > 10
        };
    }, []);

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
                    // Quick check: if lengths are different, it's definitely different
                    if (prev.length !== formatted.length) return formatted;
                    
                    // Check if the first and last IDs are the same (covers most cases for conversion logs)
                    if (prev.length > 0 && formatted.length > 0) {
                        if (prev[0].id !== formatted[0].id || prev[prev.length - 1].id !== formatted[formatted.length - 1].id) {
                            return formatted;
                        }
                    } else if (prev.length === 0 && formatted.length > 0) {
                        return formatted;
                    }
                    
                    return prev;
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

        // Polling (5s) - Increased from 1s to reduce CPU load and battery usage
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchData(true);
            }
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [fetchData]);

    const filteredData = useMemo(() => {
        // --- GHOST FILTER: Jangan tampilkan data ghoib di tabel ---
        const cleanData = data.filter(item => {
            const s = String(item.subId || '');
            const c = String(item.clickId || '');
            
            // Cek apakah ini list negara (biasanya punya banyak separator %2C atau koma)
            const isJunkList = (str) => {
                if (!str) return false;
                const separators = (str.match(/%2C|,/g) || []).length;
                return separators > 4; // Kalau ada lebih dari 4 separator, fix ini list negara ghoib
            };

            return !isJunkList(s) && !isJunkList(c);
        });

        if (!searchQuery) return cleanData;
        const query = searchQuery.toLowerCase();
        return cleanData.filter(item =>
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

            <div className="flex-1 h-fit min-w-0 rounded-lg bg-white dark:bg-[#171e2e] border border-dashed border-gray-200 dark:border-gray-700 shadow-card dark:shadow-none relative z-10 pb-4 overflow-clip">
                {isLoading && data.length === 0 ? (
                    <div className="flex items-center justify-center h-40">
                        <span className="text-sm text-gray-400 dark:text-gray-500 font-mono">Loading...</span>
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
