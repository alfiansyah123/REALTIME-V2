import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../utils/api';

const LiveClickToast = () => {
    const [toasts, setToasts] = useState([]);
    const lastClickIdRef = useRef(null);
    const toastIdRef = useRef(0);

    const parseBrowser = (browser, ua) => {
        if (browser) return browser;
        if (!ua) return '';
        if (ua.includes('FBAN') || ua.includes('FBAV')) return 'Facebook';
        if (ua.includes('Instagram')) return 'Instagram';
        if (ua.includes('TikTok')) return 'TikTok';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Edg')) return 'Edge';
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Safari')) return 'Safari';
        return '';
    };

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t._toastId !== id));
    }, []);

    useEffect(() => {
        const fetchNewClicks = async () => {
            try {
                const response = await api.getClicks(5);
                const clicks = response.data;

                if (clicks && clicks.length > 0) {
                    // On first load, just set the last seen ID
                    if (lastClickIdRef.current === null) {
                        lastClickIdRef.current = clicks[0].id;
                        return;
                    }

                    // Find clicks that are newer than lastClickId
                    const newClicks = clicks.filter(c => c.id > lastClickIdRef.current).reverse();
                    
                    if (newClicks.length > 0) {
                        lastClickIdRef.current = clicks[0].id;

                        newClicks.forEach((c, index) => {
                            const id = ++toastIdRef.current;
                            const clickData = {
                                _toastId: id,
                                country: c.country,
                                os: c.os,
                                browser: parseBrowser(c.browser, c.user_agent),
                                ip: c.ip_address,
                                clickId: c.click_id,
                                slug: c.slug
                            };

                            // Add with a slight delay if multiple new clicks
                            setTimeout(() => {
                                setToasts(prev => [clickData, ...prev].slice(0, 5));
                                setTimeout(() => removeToast(id), 2500);
                            }, index * 200);
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to poll new clicks:', err);
            }
        };

        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchNewClicks();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [removeToast]);

    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '12px',
            right: '12px',
            zIndex: 9999,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '4px',
        }}>
            {toasts.map((toast) => (
                <div
                    key={toast._toastId}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '10px',
                        color: '#d1d5db',
                        fontFamily: 'monospace',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(8px)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        animation: 'miniSlideIn 0.3s ease-out',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', flexShrink: 0, boxShadow: '0 0 4px #22c55e' }} />
                    {getCountryFlag(toast.country)}
                    {getOSIcon(toast.os)}
                    {getBrowserIcon(toast.browser)}
                    <span style={{ color: '#9ca3af', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {toast.clickId || toast.slug}
                    </span>
                    <span style={{ color: '#6b7280' }}>{toast.ip}</span>
                </div>
            ))}

            <style>{`
                @keyframes miniSlideIn {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

export default LiveClickToast;
