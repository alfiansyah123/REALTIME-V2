import { NavLink } from 'react-router-dom';
import DailyPerformance from './DailyPerformance';
import CountryLeadsSummary from './CountryLeadsSummary';
import LiveTraffic from './LiveTraffic';

export default function Sidebar({ currency, currencyRate, isOpen, onClose }) {
    return (
        <aside
            className={`
                flex flex-col flex-shrink-0 overflow-hidden rounded-lg
                bg-white dark:bg-[#171e2e] border border-dashed border-gray-200 dark:border-gray-700 shadow-card dark:shadow-none
                transition-transform duration-300 z-50
                fixed inset-y-4 left-4 w-64
                lg:static lg:translate-x-0 lg:inset-auto lg:h-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}
            `}
        >
            {/* Close Button for Mobile */}
            <div className="lg:hidden absolute top-4 right-4 z-50">
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-teal-500 text-gray-500 dark:text-gray-400 transition-all active:scale-95"
                >
                    <span className="material-icons-round text-xl">close</span>
                </button>
            </div>

            {/* Logo and Title */}
            <div className="h-16 flex items-center px-4 border-b border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse"></div>
                    <div>
                        <h1 className="font-bold text-sm font-mono text-gray-900 dark:text-white tracking-wider uppercase">Realtime</h1>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono tracking-wider">
                            Conversion Monitor
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col h-[calc(100vh-8rem)] scrollbar-hide">
                {/* Navigation - with teal highlight bar */}
                <div className="relative flex flex-col gap-2">
                    <NavLink
                        to="/dashboard?date=rt_1"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded transition-colors duration-200 font-mono relative text-sm ${isActive
                                ? 'bg-teal-500 text-white font-semibold shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95'
                            }`
                        }
                    >
                        <span className="material-icons-round text-lg">show_chart</span>
                        <span className="tracking-wider">Today</span>
                    </NavLink>
                    <NavLink
                        to="/dashboard?date=rt_2"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded transition-colors duration-200 font-mono relative text-sm ${isActive
                                ? 'bg-teal-500 text-white font-semibold shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95'
                            }`
                        }
                    >
                        <span className="material-icons-round text-lg">history</span>
                        <span className="tracking-wider">Yesterday</span>
                    </NavLink>
                    <NavLink
                        to="/reports"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded transition-colors duration-200 font-mono relative text-sm ${isActive
                                ? 'bg-teal-500 text-white font-semibold shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95'
                            }`
                        }
                    >
                        <span className="material-icons-round text-lg">assessment</span>
                        <span className="tracking-wider">Reports</span>
                    </NavLink>
                    <NavLink
                        to="/click-performance"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded transition-colors duration-200 font-mono relative text-sm ${isActive
                                ? 'bg-teal-500 text-white font-semibold shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95'
                            }`
                        }
                    >
                        <span className="material-icons-round text-lg">ads_click</span>
                        <span className="tracking-wider">Click Perf</span>
                    </NavLink>
                </div>

                {/* Live Traffic */}
                <div className="mt-6 bg-white dark:bg-light-dark rounded-lg p-1 border border-dashed border-gray-200 dark:border-gray-700 shadow-card dark:shadow-none">
                    <LiveTraffic />
                </div>

                {/* Divider */}
                <div className="h-px w-full border-b border-dashed border-gray-200 dark:border-gray-700 my-4"></div>

                {/* Daily Performance */}
                <div className="bg-white dark:bg-light-dark rounded-lg p-1 border border-dashed border-gray-200 dark:border-gray-700 shadow-card dark:shadow-none">
                    <DailyPerformance currency={currency} currencyRate={currencyRate} />
                </div>

                {/* Divider */}
                <div className="h-px w-full border-b border-dashed border-gray-200 dark:border-gray-700 my-4"></div>

                {/* Country Leads Summary */}
                <CountryLeadsSummary />
            </div>

            {/* Footer */}
            <div className="p-4 mt-auto text-center border-t border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-[10px] font-bold font-mono tracking-widest text-teal-500 uppercase">
                    POWERED BY CCPXNGINE
                </p>
            </div>
        </aside>
    );
}
