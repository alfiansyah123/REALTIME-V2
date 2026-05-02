import { useState, useEffect } from 'react';

export default function Footer() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    return (
        <div className="bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark px-4 py-2 flex justify-between items-center text-xs text-text-muted-light dark:text-text-muted-dark">
            <div className="flex items-center gap-4">
                <span>Last update: Just now</span>
                <span className="hidden sm:inline">
                    Server Time: {formatTime(currentTime)} UTC
                </span>
            </div>
            <div>Showing 1 to 25 of 352 entries</div>
        </div>
    );
}
