import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', duration = 5000, onClose, data }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for transition
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`fixed top-6 right-6 z-[100] transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
            <div className="relative overflow-hidden bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-4 flex items-center gap-4 min-w-[320px] max-w-md group">
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-[5000ms] ease-linear w-full origin-left group-hover:bg-primary-dark" style={{ animation: `shrink ${duration}ms linear forwards` }}></div>

                <style>{`
                    @keyframes shrink {
                        from { transform: scaleX(1); }
                        to { transform: scaleX(0); }
                    }
                `}</style>

                {/* Icon context */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500 animate-bounce">
                    <span className="material-icons-round text-2xl">payments</span>
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-bold text-text-main-light dark:text-text-main-dark text-sm">New Conversion! 💰</h4>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Realtime</span>
                    </div>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                        <span className="font-bold text-text-main-light dark:text-text-main-dark">{data.clickId || 'N/A'}</span> matches <span className="font-bold text-green-500">${data.earning.toFixed(2)}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 grayscale opacity-70">
                        <img src={data.flag} className="w-4 h-3 rounded-sm object-cover" alt="" />
                        <span className="text-[10px] font-medium">{data.countryName} • {data.traffic}</span>
                    </div>
                </div>

                <button
                    onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 text-text-muted-light dark:text-text-muted-dark transition-colors"
                >
                    <span className="material-icons-round text-lg">close</span>
                </button>
            </div>
        </div>
    );
}
