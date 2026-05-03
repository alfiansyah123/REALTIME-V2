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
            (item.subId && String(item.subId).toLowerCase().includes(query)) ||
            (item.clickId && String(item.clickId).toLowerCase().includes(query)) ||
            (item.network && String(item.network).toLowerCase().includes(query)) ||
            (item.country && String(item.country).toLowerCase().includes(query)) ||
            (item.ipAddress && String(item.ipAddress).includes(query))
        );
    });

    const getOSIcon = (os) => {
        const iconStyle = { width: '16px', height: '16px', opacity: 0.9 };
        const androidSvg = <svg viewBox="0 0 24 24" fill="#3DDC84" style={iconStyle}><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l-1.997-3.4592c-.3087-.5346-.9858-.7181-1.5208-.4094-.535.3087-.7189.9854-.4098 1.5204l1.9168 3.3204c-1.8946-.8626-4.0494-.8626-5.9439 0l1.9168-3.3204c.3079-.535.1252-1.2117-.4098-1.5204-.5361-.3087-1.2121-.1252-1.5208.4094l-1.9969 3.4592c-2.9103 1.5879-4.7003 4.549-4.9082 7.7788h18.8213c-.2083-3.2298-1.9983-6.1909-4.9086-7.7788" /></svg>;
        const appleSvg = <svg viewBox="0 0 384 512" fill="#A2AAAD" style={iconStyle}><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" /></svg>;
        const windowsSvg = <svg viewBox="0 0 448 512" fill="#0078D7" style={iconStyle}><path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v177.9zm0-380.6v180.1H448V32L203.8 65.7z" /></svg>;
        const linuxSvg = <svg viewBox="0 0 448 512" fill="#FCC624" style={iconStyle}><path d="M220.6 65.3c2.9-2.2 4.6-5.9 4.3-9.6-1.5-16.7 3.9-39 20-53 2.1-1.9 5.2-2.3 7.7-1.1 25.1 12.1 43.8 48 44.5 90.7.1 2.9-1.3 5.7-3.6 7.4-16.7 11.9-45.3 19.7-72.9-34.4zM448 296c0 66.3-53.7 120-120 120h-8c-17.7 0-32 14.3-32 32s14.3 32 32 32c53 0 96-43 96-96 0-8.8 7.2-16 16-16s16 7.2 16 16c0 70.7-57.3 128-128 128-35.3 0-67.3-14.3-90.5-37.5-6.1-6.1-17.5-6.1-23.6-.1-23.1 23-55 37.6-90.3 37.6-70.7 0-128-57.3-128-128 0-8.8 7.2-16 16-16s-16-7.2-16-16z" /></svg>;
        const defaultOsIcon = <div className="flex items-center text-cyan-500"><span className="material-icons-round text-sm">desktop_windows</span></div>;
        const defaultWapIcon = <div className="flex items-center text-orange-500"><span className="material-icons-round text-sm">smartphone</span></div>;

        if (!os) return defaultOsIcon;
        const lowerOs = String(os).toLowerCase();
        if (lowerOs.includes('android')) return androidSvg;
        if (lowerOs.includes('ios') || lowerOs.includes('mac') || lowerOs.includes('iphone')) return appleSvg;
        if (lowerOs.includes('windows')) return windowsSvg;
        if (lowerOs.includes('linux')) return linuxSvg;
        if (lowerOs === 'wap') return defaultWapIcon;
        return defaultOsIcon;
    };

    const getBrowserIcon = (browser) => {
        const iconStyle = { width: '16px', height: '16px', opacity: 0.9 };
        if (!browser) return <span style={{ fontSize: '14px' }}>🌐</span>;
        const lowerBrowser = String(browser).toLowerCase();

        const facebookSvg = <svg style={{ ...iconStyle, color: '#1877F2' }} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
        const instagramSvg = <svg style={{ ...iconStyle, color: '#E1306C' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.072 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>;
        const chromeSvg = <svg style={{ ...iconStyle, color: '#4285F4' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm0 4.154c1.927 0 3.692.68 5.097 1.82L15.355 9.17c-.85-.596-1.875-.95-2.986-.95-2.9 0-5.32 1.99-6.077 4.708H2.435C3.39 7.426 7.338 4.154 12 4.154zm0 15.692c-2.368 0-4.47-1.054-5.922-2.73l3.65-6.32c.22.89.87 1.62 1.72 2.05l-3.33 5.772c1.17.78 2.56 1.228 4.052 1.228 4.23 0 7.747-3.13 8.355-7.23h3.81c-.69 6.27-6.02 11.23-12.335 11.23zm7.077-8.308c-.225 3.32-2.26 6.088-5.077 7.45l-3.65-6.32c.596-.34 1.085-.83 1.425-1.425l6.73 3.882c.35-1.14.572-2.35.572-3.587 0-1.87-.52-3.63-1.42-5.17l-3.75 6.49c.65 1.135 1.05 2.457 1.05 3.86z" /></svg>;
        const safariSvg = <svg style={{ ...iconStyle, color: '#00A4E4' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.6c-5.302 0-9.6-4.298-9.6-9.6s4.298-9.6 9.6-9.6 9.6 4.298 9.6 9.6-4.298 9.6-9.6 9.6zm1.146-13.854l-5.694 10.392 10.392-5.694-4.698-4.698zm-1.05 6.648l-1.698 3.102 3.102-1.698-1.404-1.404z" /></svg>;
        const firefoxSvg = <svg style={{ ...iconStyle, color: '#FF7139' }} viewBox="0 0 24 24" fill="currentColor"><path d="M22.42 8.78c-1.55-2.304-4.05-3.32-6.525-2.65-.632-1.291-1.611-2.903-3.081-3.682 3.067-.552 4.417 2.025 4.305 2.502 0 0 .19-1.252-1.294-3.483-2.613-3.68-7.781-1.077-7.781-1.077s.824 1.166.529 3.968c-4.212 1.458-5.319 5.867-5.39 6.208 0 0-.27 2.148 1.442 3.904.582.597 1.637.896 1.637.896s-.686-.427-1.396-1.574c-.71-1.149-.661-2.9.229-4.265.89-1.365 3.321-2.228 4.226-2.073-.787 2.721 1.264 4.544 2.809 6.376-2.193.364-4.133 1.815-4.496 4.771-.069.566.216.732.216.732s.672-2.363 3.652-1.841c.205 1.503 2.1 3.208 4.881 2.457 2.783-.751 3.238-2.67 3.238-2.67s1.396.223 1.936-.884c.54-1.107-.638-1.574-.638-1.574s2.449-2.126 1.101-5.716z" /></svg>;

        if (lowerBrowser.includes('facebook')) return facebookSvg;
        if (lowerBrowser.includes('instagram')) return instagramSvg;
        if (lowerBrowser.includes('tiktok')) return <span style={{ fontSize: '14px' }}>🎵</span>;
        if (lowerBrowser.includes('chrome')) return chromeSvg;
        if (lowerBrowser.includes('safari')) return safariSvg;
        if (lowerBrowser.includes('firefox')) return firefoxSvg;

        return <span style={{ fontSize: '14px' }}>🌐</span>;
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
                                        const lowerNet = String(network).toLowerCase().replace(/\s+/g, ''); // remove spaces for filename
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
                                    {(() => {
                                        let displayCountry = row.country;
                                        if (displayCountry === 'UN') displayCountry = 'US';
                                        if (displayCountry === 'ME' && row.countryName === 'MEXICO') displayCountry = 'MX';

                                        if (row.flag && displayCountry && displayCountry !== 'XX') {
                                            // Ensure flag URL uses the corrected code if possible, but the DB 'flag' usually comes from postback
                                            // We'll just trust the corrected code if we were to fetch it, but here we just show it
                                            return <img
                                                alt={displayCountry}
                                                className="w-5 h-3.5 object-cover rounded-sm inline-block"
                                                src={row.flag.replace(/\/un\.png/i, '/us.png')}
                                            />;
                                        }
                                        return <span>
                                            {displayCountry !== 'XX' ? displayCountry : (row.countryName || '🌐')}
                                        </span>;
                                    })()}
                                </td>
                                <td className="px-2 py-2 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                                        {getOSIcon(row.os)}
                                        {getBrowserIcon(row.browser)}
                                    </div>
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
