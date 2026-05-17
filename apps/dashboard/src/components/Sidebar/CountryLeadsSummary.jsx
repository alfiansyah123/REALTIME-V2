import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../utils/api';

// ISO 3166-1 alpha-3 to alpha-2 mapping for country flags
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
    const strCode = String(alpha3Code);
    if (strCode.length === 2) return strCode.toLowerCase();
    return countryCodeMapping[strCode.toUpperCase()] || strCode.substring(0, 2).toLowerCase();
};

export default function CountryLeadsSummary() {
    const [searchParams] = useSearchParams();
    const dateParam = searchParams.get('date') || 'rt_1'; // rt_1 = Today, rt_2 = Yesterday
    const isYesterday = dateParam === 'rt_2';

    const [data, setData] = useState({ today: [], yesterday: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                const [todayResult, yesterdayResult] = await Promise.all([
                    api.getCountryLeads(today),
                    api.getCountryLeads(yesterday)
                ]);

                setData({
                    today: todayResult.data || [],
                    yesterday: yesterdayResult.data || []
                });
            } catch (error) {
                console.error('Country Leads Fetch Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        // Refresh every 60 seconds
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const CountryRow = ({ country, leads, rank }) => {
        const alpha2 = getAlpha2Code(country);
        const flagUrl = `https://flagcdn.com/20x15/${alpha2}.png`;

        return (
            <div className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                <span className="text-xs font-medium text-gray-400 w-4">{rank}</span>
                <img
                    src={flagUrl}
                    alt={country}
                    className="w-5 h-5 object-cover rounded-full ring-1 ring-gray-200 dark:ring-gray-700"
                    onError={(e) => e.target.style.display = 'none'}
                />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 flex-1 font-mono">{country}</span>
                <span className="text-xs font-bold text-orange-500">{leads}</span>
            </div>
        );
    };

    // Determine which data to show based on current page
    const currentData = isYesterday ? data.yesterday : data.today;
    const title = isYesterday ? 'Yesterday' : 'Today';
    const icon = isYesterday ? 'history' : 'today';

    return (
        <div className="rounded-xl p-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <div>
                        <h3 className="text-xs font-bold uppercase text-gray-900 dark:text-white leading-tight">
                            Top Country
                        </h3>
                        <span className="text-[9px] font-medium text-gray-400 uppercase">{title}</span>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">Loading...</span>
                </div>
            ) : currentData.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">No leads yet</div>
            ) : (
                <div className="space-y-1">
                    {currentData.map((item, index) => (
                        <CountryRow
                            key={item.country}
                            country={item.country}
                            leads={item.leads}
                            rank={index + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
