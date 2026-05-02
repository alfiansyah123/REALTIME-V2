import { useState, useMemo, Fragment } from 'react';
import { api } from '../../utils/api';

export default function ReportsTable({ data = [], currency = 'USD', currencyRate = 16000, startDate, endDate, selectedNetwork = 'IMONETIZEIT' }) {
    const [sortConfig, setSortConfig] = useState({ key: 'payouts', direction: 'desc' });
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [loadingRows, setLoadingRows] = useState(new Set());
    const [rowDetails, setRowDetails] = useState({}); // Cache for country details

    const isTrafee = selectedNetwork === 'TRAFEE';

    const fetchCountryDetails = async (row, rowIndex) => {
        if (!row) return;
        const smartlinkName = row.smartlink;
        const smartlinkId = row.smartlink_id;

        if (rowDetails[smartlinkName]) {
            toggleRowExpanded(rowIndex);
            return;
        }

        setLoadingRows(prev => new Set(prev).add(rowIndex));

        try {
            const start = startDate || new Date().toISOString().split('T')[0];
            const end = endDate || new Date().toISOString().split('T')[0];

            if (smartlinkId) {
                const fnData = await api.getReportCountries(start, end, smartlinkId);
                if (fnData && Array.isArray(fnData.data)) {
                    setRowDetails(prev => ({ ...prev, [smartlinkName]: fnData.data }));
                    return;
                }
            }
            setRowDetails(prev => ({ ...prev, [smartlinkName]: [] }));
        } catch (error) {
            console.error('Failed to fetch country details', error);
        } finally {
            setLoadingRows(prev => {
                const next = new Set(prev);
                next.delete(rowIndex);
                return next;
            });
            toggleRowExpanded(rowIndex);
        }
    };

    const toggleRowExpanded = (index) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const handleExpandClick = (row, index) => {
        if (expandedRows.has(index)) toggleRowExpanded(index);
        else fetchCountryDetails(row, index);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        if (!Array.isArray(data)) return [];
        if (!sortConfig.key) return data;
        return [...data].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];
            if (['clicks', 'leads', 'payouts', 'cr', 'visits', 'unique'].includes(sortConfig.key)) {
                aValue = parseFloat(String(aValue || 0).replace(/[^0-9.-]+/g, ""));
                bValue = parseFloat(String(bValue || 0).replace(/[^0-9.-]+/g, ""));
            }
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig]);

    const formatCurrency = (num) => {
        const value = parseFloat(num) || 0;
        if (currency === 'IDR') return `Rp ${(value * currencyRate).toLocaleString('id-ID')}`;
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const countryCodeMapping = {
        'AFG': 'af', 'ALB': 'al', 'DZA': 'dz', 'AND': 'ad', 'AGO': 'ao', 'ARG': 'ar', 'ARM': 'am', 'AUS': 'au', 'AUT': 'at', 'AZE': 'az',
        'BHS': 'bs', 'BHR': 'bh', 'BGD': 'bd', 'BLR': 'by', 'BEL': 'be', 'BLZ': 'bz', 'BEN': 'bj', 'BTN': 'bt', 'BOL': 'bo', 'BIH': 'ba',
        'BWA': 'bw', 'BRA': 'br', 'BRN': 'bn', 'BGR': 'bg', 'BFA': 'bf', 'BDI': 'bi', 'KHM': 'kh', 'CMR': 'cm', 'CAN': 'ca', 'CPV': 'cv',
        'CAF': 'cf', 'TCD': 'td', 'CHL': 'cl', 'CHN': 'cn', 'COL': 'co', 'COM': 'km', 'COG': 'cg', 'COD': 'cd', 'CRI': 'cr', 'CIV': 'ci',
        'HRV': 'hr', 'CUB': 'cu', 'CYP': 'cy', 'CZE': 'cz', 'DNK': 'dk', 'DJI': 'dj', 'DMA': 'dm', 'DOM': 'do', 'ECU': 'ec', 'EGY': 'eg',
        'SLV': 'sv', 'GNQ': 'gq', 'ERI': 'er', 'EST': 'ee', 'SWZ': 'sz', 'ETH': 'et', 'FJI': 'fj', 'FIN': 'fi', 'FRA': 'fr', 'GAB': 'ga',
        'GMB': 'gm', 'GEO': 'ge', 'DEU': 'de', 'GHA': 'gh', 'GRC': 'gr', 'GTM': 'gt', 'GIN': 'gn', 'GNB': 'gw', 'GUY': 'gy', 'HTI': 'ht',
        'HND': 'hn', 'HKG': 'hk', 'HUN': 'hu', 'ISL': 'is', 'IND': 'in', 'IDN': 'id', 'IRN': 'ir', 'IRQ': 'iq', 'IRL': 'ie', 'ISR': 'il',
        'ITA': 'it', 'JAM': 'jm', 'JPN': 'jp', 'JOR': 'jo', 'KAZ': 'kz', 'KEN': 'ke', 'KWT': 'kw', 'KGZ': 'kg', 'LAO': 'la', 'LVA': 'lv',
        'LBN': 'lb', 'LBR': 'lr', 'LBY': 'ly', 'LIE': 'li', 'LTU': 'lt', 'LUX': 'lu', 'MAC': 'mo', 'MDG': 'mg', 'MWI': 'mw', 'MYS': 'my',
        'MDV': 'mv', 'MLI': 'ml', 'MLT': 'mt', 'MRT': 'mr', 'MUS': 'mu', 'MEX': 'mx', 'MDA': 'md', 'MCO': 'mc', 'MNG': 'mn', 'MNE': 'me',
        'MAR': 'ma', 'MOZ': 'mz', 'MMR': 'mm', 'NAM': 'na', 'NPL': 'np', 'NLD': 'nl', 'NZL': 'nz', 'NIC': 'ni', 'NER': 'ne', 'NGA': 'ng',
        'MKD': 'mk', 'NOR': 'no', 'OMN': 'om', 'PAK': 'pk', 'PSE': 'ps', 'PAN': 'pa', 'PNG': 'pg', 'PRY': 'py', 'PER': 'pe', 'PHL': 'ph',
        'POL': 'pl', 'PRT': 'pt', 'QAT': 'qa', 'ROU': 'ro', 'RUS': 'ru', 'RWA': 'rw', 'SAU': 'sa', 'SEN': 'sn', 'SRB': 'rs', 'SGP': 'sg',
        'SVK': 'sk', 'SVN': 'si', 'SOM': 'so', 'ZAF': 'za', 'KOR': 'kr', 'SSD': 'ss', 'ESP': 'es', 'LKA': 'lk', 'SDN': 'sd', 'SUR': 'sr',
        'SWE': 'se', 'CHE': 'ch', 'SYR': 'sy', 'TWN': 'tw', 'TJK': 'tj', 'TZA': 'tz', 'THA': 'th', 'TLS': 'tl', 'TGO': 'tg', 'TTO': 'tt',
        'TUN': 'tn', 'TUR': 'tr', 'TKM': 'tm', 'UGA': 'ug', 'UKR': 'ua', 'ARE': 'ae', 'GBR': 'gb', 'USA': 'us', 'URY': 'uy', 'UZB': 'uz',
        'VEN': 've', 'VNM': 'vn', 'YEM': 'ye', 'ZMB': 'zm', 'ZWE': 'zw'
    };

    const getAlpha2Code = (alpha3Code) => {
        if (!alpha3Code) return 'xx';
        if (alpha3Code.length === 2) return alpha3Code.toLowerCase();
        return countryCodeMapping[alpha3Code.toUpperCase()] || alpha3Code.substring(0, 2).toLowerCase();
    };

    const getNetworkBadge = (network) => {
        const networkName = network || 'IMONETIZEIT';
        const lowerNet = networkName.toLowerCase().replace(/\s+/g, '');
        const logoPath = `/networks/${lowerNet}.png`;
        return (
            <div className="flex justify-center items-center h-full">
                <img src={logoPath} alt={networkName} className="h-5 w-auto object-contain max-w-[80px]" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline-flex'; }} />
                <span className="hidden items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{networkName}</span>
            </div>
        );
    };

    const totalStats = useMemo(() => {
        return data.reduce((acc, row) => ({
            visits: acc.visits + (parseInt(row.visits) || 0),
            unique: acc.unique + (parseInt(row.unique) || 0),
            clicks: acc.clicks + (parseInt(row.clicks) || 0),
            leads: acc.leads + (parseInt(row.leads) || 0),
            payouts: acc.payouts + (parseFloat(row.payouts) || 0),
        }), { visits: 0, unique: 0, clicks: 0, leads: 0, payouts: 0 });
    }, [data]);

    return (
        <div className="w-full overflow-x-auto relative scrollbar-hide">
            {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-text-muted-light dark:text-text-muted-dark opacity-60 h-64">
                    <span className="material-icons-round text-4xl mb-2">inbox</span>
                    <span>No data available</span>
                </div>
            ) : (
                <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-[10px] uppercase text-gray-500 dark:text-gray-400 font-semibold sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('smartlink')}>SMARTLINK</th>
                            <th className="px-4 py-3 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('network')}>NETWORK</th>
                            {!isTrafee && <th className="px-4 py-3 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('visits')}>VISITS</th>}
                            {!isTrafee && <th className="px-4 py-3 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('unique')}>UNIQUE</th>}
                            <th className="px-4 py-3 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('clicks')}>CLICKS</th>
                            <th className="px-4 py-3 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('leads')}>LEADS</th>
                            <th className="px-4 py-3 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('cr')}>CR</th>
                            <th className="px-4 py-3 text-center cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => handleSort('payouts')}>PAYOUTS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {sortedData.map((row, index) => {
                            if (!row) return null;
                            const clicks = parseInt(row.clicks) || 0;
                            const leads = parseInt(row.leads) || 0;
                            const cr = clicks > 0 ? ((leads / clicks) * 100).toFixed(2) + '%' : '0.00%';
                            const isExpanded = expandedRows.has(index);
                            const isLoading = loadingRows.has(index);
                            const countries = rowDetails[row.smartlink] || [];

                            return (
                                <Fragment key={index}>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/40 group">
                                        <td className="px-4 py-3 text-left text-gray-800 dark:text-gray-200 whitespace-nowrap cursor-pointer" onClick={() => handleExpandClick(row, index)}>
                                            <div className="flex items-center gap-2">
                                                <button className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none">
                                                    {isLoading ? (
                                                        <svg className="animate-spin h-3 w-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    ) : (
                                                        <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isExpanded ? 'transform rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    )}
                                                </button>
                                                <span>{row.smartlink || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">{getNetworkBadge(row.network || 'IMONETIZEIT')}</td>
                                        {!isTrafee && <td className="px-4 py-3 text-center text-gray-800 dark:text-gray-200">{row.visits}</td>}
                                        {!isTrafee && <td className="px-4 py-3 text-center text-gray-800 dark:text-gray-200">{row.unique}</td>}
                                        <td className="px-4 py-3 text-center text-gray-800 dark:text-gray-200">{row.clicks}</td>
                                        <td className="px-4 py-3 text-center text-gray-800 dark:text-gray-200">{row.leads}</td>
                                        <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">{cr}</td>
                                        <td className="px-4 py-3 text-center font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{formatCurrency(row.payouts)}</td>
                                    </tr>
                                    {isExpanded && !isLoading && countries.length > 0 && (
                                        countries.map((country, cIndex) => {
                                            if (!country) return null;
                                            const cClicks = parseInt(country.clicks) || 0;
                                            const cLeads = parseInt(country.leads) || 0;
                                            const cCr = cClicks > 0 ? ((cLeads / cClicks) * 100).toFixed(2) + '%' : '0.00%';
                                            const countryCode = country.country || 'XX';
                                            const flagUrl = `https://flagcdn.com/20x15/${getAlpha2Code(countryCode)}.png`;
                                            return (
                                                <tr key={`${index}-${cIndex}`} className="bg-gray-50/50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 text-[11px] border-b border-gray-100 dark:border-gray-800/50 last:border-0 text-gray-600 dark:text-gray-400">
                                                    <td className="px-4 py-2 text-left pl-12 border-r border-transparent">
                                                        <div className="flex items-center gap-2">
                                                            <img src={flagUrl} alt={countryCode} className="w-5 h-3.5 object-cover rounded-[1px] shadow-sm" onError={(e) => e.target.style.display = 'none'} />
                                                            <span className="font-medium text-[10px]">{countryCode}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 text-center"></td>
                                                    {!isTrafee && <td className="px-4 py-2 text-center">{parseInt(country.visits) || 0}</td>}
                                                    {!isTrafee && <td className="px-4 py-2 text-center">{parseInt(country.unique) || 0}</td>}
                                                    <td className="px-4 py-2 text-center">{cClicks}</td>
                                                    <td className="px-4 py-2 text-center">{cLeads}</td>
                                                    <td className="px-4 py-2 text-center text-gray-500">{cCr}</td>
                                                    <td className="px-4 py-2 text-center font-medium text-emerald-600 dark:text-emerald-500">{formatCurrency(country.payouts)}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                    {isExpanded && !isLoading && countries.length === 0 && (
                                        <tr className="bg-gray-50/50 dark:bg-gray-900/30">
                                            <td colSpan={isTrafee ? "6" : "8"} className="px-4 py-3 text-center text-xs text-gray-400 italic">No country data or unable to fetch details.</td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-100 dark:bg-gray-800 font-bold border-t-2 border-gray-300 dark:border-gray-600 sticky bottom-0 z-10">
                        <tr>
                            <td className="px-4 py-3 text-center text-[10px] uppercase" colSpan="2">TOTAL</td>
                            {!isTrafee && <td className="px-4 py-3 text-center text-gray-800 dark:text-gray-200">{totalStats.visits}</td>}
                            {!isTrafee && <td className="px-4 py-3 text-center text-gray-800 dark:text-gray-200">{totalStats.unique}</td>}
                            <td className="px-4 py-3 text-center text-gray-800 dark:text-gray-200">{totalStats.clicks}</td>
                            <td className="px-4 py-3 text-center text-gray-800 dark:text-gray-200">{totalStats.leads}</td>
                            <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">{totalStats.clicks > 0 ? ((totalStats.leads / totalStats.clicks) * 100).toFixed(2) + '%' : '0.00%'}</td>
                            <td className="px-4 py-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalStats.payouts)}</td>
                        </tr>
                    </tfoot>
                </table>
            )}
        </div>
    );
}
