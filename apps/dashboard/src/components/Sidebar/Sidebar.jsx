import { NavLink } from 'react-router-dom';
import DailyPerformance from './DailyPerformance';
import CountryLeadsSummary from './CountryLeadsSummary';
import LiveTraffic from './LiveTraffic';

export default function Sidebar({ currency, currencyRate, isOpen, onClose }) {
    return (
        <aside
            className={`
                glass-panel flex flex-col flex-shrink-0 overflow-hidden rounded-3xl
                transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-50
                fixed inset-y-4 left-4 w-64
                lg:static lg:translate-x-0 lg:inset-auto lg:h-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}
            `}
        >
            {/* Close Button for Mobile */}
            <div className="lg:hidden absolute top-4 right-4 z-50">
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-black/20 text-text-muted-light dark:text-text-muted-dark backdrop-blur-md transition-all active:scale-95"
                >
                    <span className="material-icons-round text-xl">close</span>
                </button>
            </div>

            {/* Logo and Title - Glass Header */}
            <div className="h-20 flex items-center px-6 border-b border-white/10 dark:border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
                <div className="h-3 w-3 rounded-full bg-primary mr-3 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.6)]"></div>
                <div>
                    <h1 className="font-bold text-xl leading-tight tracking-tight liquid-text">Realtime</h1>
                    <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest font-medium opacity-70">
                        Conversion Monitor
                    </p>
                </div>
            </div>

            {/* Main Content with hidden scrollbar */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide relative">
                {/* Date Navigation */}
                <div className="space-y-2">
                    <NavLink
                        to="/dashboard?date=rt_1"
                        className={({ isActive }) =>
                            `w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300 relative overflow-hidden group ${isActive
                                ? 'text-white shadow-[0_4px_24px_0_rgba(255,255,255,0.15)] bg-white/10 border border-white/20 backdrop-blur-xl transform scale-[1.02]'
                                : 'text-text-muted-light dark:text-text-muted-dark hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/5 active:scale-95'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none"></div>
                                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
                                    </>
                                )}
                                <span className={`material-icons-round text-xl mr-3 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] text-blue-400' : 'group-hover:scale-110'}`}>show_chart</span>
                                <span className={`relative z-10 font-bold tracking-wide ${isActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200' : ''}`}>Today</span>
                            </>
                        )}
                    </NavLink>
                    <NavLink
                        to="/dashboard?date=rt_2"
                        className={({ isActive }) =>
                            `w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300 relative overflow-hidden group ${isActive
                                ? 'text-white shadow-[0_4px_24px_0_rgba(255,255,255,0.15)] bg-white/10 border border-white/20 backdrop-blur-xl transform scale-[1.02]'
                                : 'text-text-muted-light dark:text-text-muted-dark hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/5 active:scale-95'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none"></div>
                                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
                                    </>
                                )}
                                <span className={`material-icons-round text-xl mr-3 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] text-purple-400' : 'group-hover:scale-110'}`}>history</span>
                                <span className={`relative z-10 font-bold tracking-wide ${isActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200' : ''}`}>Yesterday</span>
                            </>
                        )}
                    </NavLink>
                    <NavLink
                        to="/reports"
                        className={({ isActive }) =>
                            `w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300 relative overflow-hidden group ${isActive
                                ? 'text-white shadow-[0_4px_24px_0_rgba(255,255,255,0.15)] bg-white/10 border border-white/20 backdrop-blur-xl transform scale-[1.02]'
                                : 'text-text-muted-light dark:text-text-muted-dark hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/5 active:scale-95'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none"></div>
                                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>
                                    </>
                                )}
                                <span className={`material-icons-round text-xl mr-3 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)] text-emerald-400' : 'group-hover:scale-110'}`}>assessment</span>
                                <span className={`relative z-10 font-bold tracking-wide ${isActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200' : ''}`}>Reports</span>
                            </>
                        )}
                    </NavLink>
                    <NavLink
                        to="/click-performance"
                        className={({ isActive }) =>
                            `w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300 relative overflow-hidden group ${isActive
                                ? 'text-white shadow-[0_4px_24px_0_rgba(255,255,255,0.15)] bg-white/10 border border-white/20 backdrop-blur-xl transform scale-[1.02]'
                                : 'text-text-muted-light dark:text-text-muted-dark hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/5 active:scale-95'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none"></div>
                                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-400/50 to-transparent"></div>
                                    </>
                                )}
                                <span className={`material-icons-round text-xl mr-3 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] text-orange-400' : 'group-hover:scale-110'}`}>ads_click</span>
                                <span className={`relative z-10 font-bold tracking-wide ${isActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-200' : ''}`}>Click Performance</span>
                            </>
                        )}
                    </NavLink>
                </div>

                {/* Live Traffic - Supabase Realtime */}
                <div className="bg-white/5 dark:bg-black/20 backdrop-blur-sm rounded-xl p-1 border border-white/5">
                    <LiveTraffic />
                </div>

                {/* Divider with gradient */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300/30 dark:via-gray-600/30 to-transparent my-4"></div>

                {/* Daily Performance - Frosted Card */}
                <div className="bg-white/5 dark:bg-black/20 backdrop-blur-sm rounded-xl p-1 border border-white/5">
                    <DailyPerformance currency={currency} currencyRate={currencyRate} />
                </div>

                {/* Divider with gradient */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300/30 dark:via-gray-600/30 to-transparent my-4"></div>

                {/* Country Leads Summary */}
                <CountryLeadsSummary />
            </div>

            {/* Footer - Glass Effect */}
            <div className="p-4 mt-auto text-center border-t border-white/10 dark:border-white/5 bg-white/5 dark:bg-black/20 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>
                <p className="text-[10px] font-bold font-mono tracking-widest liquid-text opacity-80 hover:opacity-100 transition-opacity cursor-default">
                    POWERED BY CCPXNGINE
                </p>
            </div>
        </aside>
    );
}
