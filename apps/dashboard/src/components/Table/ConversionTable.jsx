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

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return data;
        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return sortedData;
        const query = searchQuery.toLowerCase();
        return sortedData.filter((item) => {
            return (
                (item.subId && String(item.subId).toLowerCase().includes(query)) ||
                (item.clickId && String(item.clickId).toLowerCase().includes(query)) ||
                (item.network && String(item.network).toLowerCase().includes(query)) ||
                (item.country && String(item.country).toLowerCase().includes(query)) ||
                (item.ipAddress && String(item.ipAddress).includes(query))
            );
        });
    }, [sortedData, searchQuery]);

    const getOSIcon = (os, browser) => {
        const iconStyle = { width: '16px', height: '16px', verticalAlign: 'middle', opacity: 0.9 };
        if (!os) return null;
        
        let l = String(os).toLowerCase();
        const b = String(browser || '').toLowerCase();

        // Smart Detection: If OS is generic WAP/WEB, try to find real OS in browser string (UA)
        if (l === 'wap' || l === 'web') {
            if (b.includes('android')) l = 'android';
            else if (b.includes('iphone') || b.includes('ipad') || b.includes('ios') || b.includes('mac')) l = 'ios';
            else if (b.includes('windows')) l = 'windows';
        }

        if (l.includes('android')) {
            return <svg viewBox="0 0 24 24" fill="#3DDC84" style={iconStyle}><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l-1.997-3.4592c-.3087-.5346-.9858-.7181-1.5208-.4094-.535.3087-.7189.9854-.4098 1.5204l1.9168 3.3204c-1.8946-.8626-4.0494-.8626-5.9439 0l1.9168-3.3204c.3079-.535.1252-1.2117-.4098-1.5204-.5361-.3087-1.2121-.1252-1.5208.4094l-1.9969 3.4592c-2.9103 1.5879-4.7003 4.549-4.9082 7.7788h18.8213c-.2083-3.2298-1.9983-6.1909-4.9086-7.7788" /></svg>;
        }
        if (l.includes('ios') || l.includes('mac') || l.includes('iphone') || l.includes('ipad') || l.includes('apple')) {
            return <svg viewBox="0 0 384 512" fill="#A2AAAD" style={iconStyle}><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" /></svg>;
        }
        if (l.includes('windows') || l.includes('win')) {
            return <svg viewBox="0 0 448 512" fill="#0078D7" style={iconStyle}><path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v177.9zm0-380.6v180.1H448V32L203.8 65.7z" /></svg>;
        }
        if (l.includes('linux')) {
            return <svg style={iconStyle} viewBox="0 0 448 512" fill="#FCC624"><path d="M220.6 65.3c2.9-2.2 4.6-5.9 4.3-9.6-1.5-16.7 3.9-39 20-53 2.1-1.9 5.2-2.3 7.7-1.1 25.1 12.1 43.8 48 44.5 90.7.1 2.9-1.3 5.7-3.6 7.4-16.7 11.9-45.3 19.7-72.9-34.4z" /></svg>;
        }

        return <svg style={iconStyle} viewBox="0 0 512 512" fill="currentColor"><path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z" /></svg>;
    };

    const getBrowserIcon = (browser) => {
        const iconStyle = { width: '16px', height: '16px', verticalAlign: 'middle', opacity: 0.9 };
        if (!browser || browser === 'Unknown' || browser === 'Other') {
            return <span style={{ fontSize: '14px', filter: 'grayscale(100%)', opacity: 0.5 }}>🌐</span>;
        }
        const lb = String(browser).toLowerCase();

        if (lb.includes('facebook')) return <svg style={iconStyle} viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
        if (lb.includes('instagram')) return <svg style={iconStyle} viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.072 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>;
        if (lb.includes('tiktok')) return <svg style={iconStyle} viewBox="0 0 24 24" fill="#000000"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48v-7.15a8.16 8.16 0 005.58 2.17v-3.46a4.85 4.85 0 01-2-.55V6.69h2z" /></svg>;
        if (lb.includes('edge')) return <svg style={iconStyle} viewBox="0 0 24 24" fill="#0078D7"><path d="M21.86 17.86q.14 0 .25.12.1.13.1.25l-.02.46q-.58 2.86-3.14 4.59Q16.49 25 13.2 25q-2.56 0-4.7-1.2-2.13-1.21-3.37-3.32Q4 18.4 4 16q0-2.3.97-4.39.96-2.1 2.65-3.62 1.68-1.52 3.77-2.25 2.09-.73 4.39-.73 3.12 0 5.47 1.83 2.36 1.82 2.76 4.75l.03.49H12.76q.08-1.22 1.15-2.14 1.08-.93 2.48-.93 2.25 0 3.54 1.67 1.3 1.67 1.3 3.8 0 .58-.06 1.17z" /></svg>;
        if (lb.includes('chrome')) return <svg style={iconStyle} viewBox="0 0 24 24" fill="#4285F4"><path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0112 6.545h10.691A12 12 0 0012 0zM1.931 5.47A11.943 11.943 0 000 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 01-6.865-2.29zm13.342 2.166a5.446 5.446 0 011.45 7.09l.002.001-3.953 6.848c.267.019.536.025.806.025 6.627 0 12-5.373 12-12 0-1.034-.131-2.037-.372-2.964zM12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" /></svg>;
        if (lb.includes('safari')) return <svg style={iconStyle} viewBox="0 0 24 24" fill="#006CFF"><path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-2c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm1.25-15.75L8.5 15.5l9.25-4.75-4.5-4.5z" /></svg>;
        if (lb.includes('firefox')) return <svg style={iconStyle} viewBox="0 0 24 24" fill="#FF7139"><path d="M22.42 8.78c-1.55-2.3-4.05-3.32-6.53-2.65a7.95 7.95 0 00-3.08-3.68c3.07-.55 4.42 2.03 4.3 2.5 0 0 .19-1.25-1.29-3.48C13.2-2.22 8.03.38 8.03.38s.82 1.17.53 3.97c-4.21 1.46-5.32 5.87-5.39 6.21 0 0-.27 2.15 1.44 3.9.58.6 1.64.9 1.64.9s-.69-.43-1.4-1.57c-.71-1.15-.66-2.9.23-4.27.89-1.36 3.32-2.23 4.23-2.07-.79 2.72 1.26 4.54 2.81 6.38-2.19.36-4.13 1.81-4.5 4.77-.07.57.22.73.22.73s.67-2.36 3.65-1.84c.2 1.5 2.1 3.21 4.88 2.46 2.78-.75 3.24-2.67 3.24-2.67s1.4.22 1.94-.88c.54-1.11-.64-1.57-.64-1.57s2.45-2.13 1.1-5.72z" /></svg>;

        return <span style={{ fontSize: '14px', filter: 'grayscale(100%)', opacity: 0.5 }}>🌐</span>;
    };

    const formatCurrency = (num) => {
        if (!num) return currency === 'IDR' ? 'Rp 0' : '$0.00';
        if (currency === 'IDR') {
            return `Rp ${(num * currencyRate).toLocaleString('id-ID')}`;
        }
        return `$${num.toFixed(2)}`;
    };

    const topClickId = useMemo(() => {
        if (data.length === 0) return null;
        const totals = data.reduce((acc, curr) => {
            acc[curr.clickId] = (acc[curr.clickId] || 0) + curr.earning;
            return acc;
        }, {});
        let max = 0, winner = null;
        Object.entries(totals).forEach(([id, total]) => {
            if (total > max) { max = total; winner = id; }
        });
        return winner;
    }, [data]);

    return (
        <div className="w-full overflow-x-auto relative scrollbar-hide">
            <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-gray-50 dark:bg-[#171e2e] text-[10px] uppercase text-gray-600 dark:text-gray-400 font-semibold font-mono sticky top-0 z-10 border-b border-dashed border-gray-200 dark:border-gray-700">
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
                <tbody>
                    {filteredData.map((row, index) => {
                        const isTopWinner = topClickId && row.clickId === topClickId;
                        const isOdd = index % 2 === 1;
                        return (
                            <tr key={row.id} className={`hover:bg-orange-50 dark:hover:bg-orange-900/10 transition ${isOdd ? 'bg-gray-50 dark:bg-[#0d1321]' : 'bg-white dark:bg-[#171e2e]'}`}>
                                <td className="px-2 py-2 text-center text-gray-400 dark:text-gray-500">{index + 1}</td>
                                <td className="px-2 py-2 text-left text-gray-900 dark:text-gray-100 whitespace-nowrap font-mono text-xs">
                                    {isTopWinner && <span className="mr-0.5 text-lg">👑</span>}
                                    <button
                                        onClick={() => navigate(`/stats?click_id=${encodeURIComponent(row.clickId)}`)}
                                        className={`hover:text-orange-500 dark:hover:text-orange-400 hover:underline text-left ${isTopWinner ? 'rgb-text font-bold' : ''}`}
                                    >
                                        {row.clickId}
                                    </button>
                                </td>
                                <td className="px-2 py-2 text-center">
                                    {(() => {
                                        const network = row.network || '';
                                        const lowerNet = String(network).toLowerCase().replace(/\s+/g, '');
                                        return (
                                            <div className="flex justify-center items-center h-full">
                                                <img
                                                    src={`/networks/${lowerNet}.png`}
                                                    alt={network}
                                                    className="h-5 w-auto object-contain max-w-[80px]"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'inline-flex';
                                                    }}
                                                />
                                                <span className="hidden items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" style={{ display: 'none' }}>
                                                    {network || '-'}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </td>
                                <td className="px-2 py-2 text-center">
                                    {(() => {
                                        const country = row.country;
                                        if (country && country !== 'XX') {
                                            return (
                                                <img
                                                    alt={country}
                                                    className="w-5 h-5 object-cover rounded-full inline-block ring-1 ring-gray-200 dark:ring-gray-700"
                                                    src={`https://flagcdn.com/${country.toLowerCase()}.svg`}
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline'; }}
                                                />
                                            );
                                        }
                                        return <span className="text-gray-400 text-[10px]">{country || '🌐'}</span>;
                                    })()}
                                </td>
                                <td className="px-2 py-2 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100">
                                        {getOSIcon(row.os, row.browser)}
                                        {getBrowserIcon(row.browser)}
                                    </div>
                                </td>
                                <td className="px-2 py-2 text-center font-semibold text-orange-600 dark:text-orange-400 whitespace-nowrap font-mono">
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
