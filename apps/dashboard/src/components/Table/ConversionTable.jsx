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

    // High-end SVG icons to replace all emojis
    const getOSIcon = (os) => {
        const s = { width: '16px', height: '16px' };
        if (!os) return null;
        
        const l = String(os).toLowerCase();
        
        const androidSvg = <svg viewBox="0 0 24 24" fill="#3DDC84" style={s}><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l-1.997-3.4592c-.3087-.5346-.9858-.7181-1.5208-.4094-.535.3087-.7189.9854-.4098 1.5204l1.9168 3.3204c-1.8946-.8626-4.0494-.8626-5.9439 0l1.9168-3.3204c.3079-.535.1252-1.2117-.4098-1.5204-.5361-.3087-1.2121-.1252-1.5208.4094l-1.9969 3.4592c-2.9103 1.5879-4.7003 4.549-4.9082 7.7788h18.8213c-.2083-3.2298-1.9983-6.1909-4.9086-7.7788" /></svg>;
        const appleSvg = <svg viewBox="0 0 384 512" fill="#8e8e93" style={s}><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" /></svg>;
        const windowsSvg = <svg viewBox="0 0 448 512" fill="#0078D7" style={s}><path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v177.9zm0-380.6v180.1H448V32L203.8 65.7z" /></svg>;
        const phoneSvg = <svg viewBox="0 0 24 24" fill="#94a3b8" style={s}><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" /></svg>;
        const desktopSvg = <svg viewBox="0 0 24 24" fill="#94a3b8" style={s}><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z" /></svg>;

        if (l.includes('andr')) return androidSvg;
        if (l.includes('ios') || l.includes('mac') || l.includes('ipho') || l.includes('ipa') || l.includes('apple')) return appleSvg;
        if (l.includes('win')) return windowsSvg;
        if (l.includes('wap') || l.includes('mobile')) return phoneSvg;
        return desktopSvg;
    };

    const getBrowserIcon = (browser) => {
        const s = { width: '16px', height: '16px' };
        if (!browser) return null;
        const l = String(browser).toLowerCase();

        const facebookSvg = <svg style={{ ...s, color: '#1877F2' }} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
        const chromeSvg = <svg style={s} viewBox="0 0 24 24"><path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0112 6.545h10.691A12 12 0 0012 0z" fill="#DB4437" /><path d="M1.931 5.47A11.943 11.943 0 000 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 01-6.865-2.29z" fill="#0F9D58" /><path d="M15.273 7.636a5.446 5.446 0 011.45 7.09l.002.001-3.953 6.848c.267.019.536.025.806.025 6.627 0 12-5.373 12-12 0-1.034-.131-2.037-.372-2.964z" fill="#FFBA00" /><path d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" fill="#FFFFFF" /></svg>;
        const safariSvg = <svg style={{ ...s, color: '#00A4E4' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.6c-5.302 0-9.6-4.298-9.6-9.6s4.298-9.6 9.6-9.6 9.6 4.298 9.6 9.6-4.298 9.6-9.6 9.6zm1.146-13.854l-5.694 10.392 10.392-5.694-4.698-4.698zm-1.05 6.648l-1.698 3.102 3.102-1.698-1.404-1.404z" /></svg>;
        const instagramSvg = <svg style={{ ...s, color: '#E1306C' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.072 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>;

        if (l.includes('facebook') || l.includes('fbios') || l.includes('fban')) return facebookSvg;
        if (l.includes('chrome')) return chromeSvg;
        if (l.includes('safari')) return safariSvg;
        if (l.includes('instagram')) return instagramSvg;

        return null;
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
                            <tr key={row.id} className="hover:bg-white/5 dark:hover:bg-white/5">
                                <td className="px-2 py-2 text-center text-gray-400 dark:text-gray-500">{index + 1}</td>
                                <td className="px-2 py-2 text-left text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                    {isTopWinner && <span className="mr-0.5 text-lg">👑</span>}
                                    <button
                                        onClick={() => navigate(`/stats?click_id=${encodeURIComponent(row.clickId)}`)}
                                        className={`hover:text-blue-500 dark:hover:text-blue-400 hover:underline text-left ${isTopWinner ? 'rgb-text font-bold' : ''}`}
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
                                                    className="w-5 h-3.5 object-cover rounded-sm inline-block"
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
