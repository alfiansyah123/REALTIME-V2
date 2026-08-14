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

    const getCountryFlag = (country) => {
        if (!country || country === 'XX') {
            return <span style={{ fontSize: '12px', filter: 'grayscale(100%)', opacity: 0.5 }}>🌍</span>;
        }
        return (
            <img
                src={`https://flagcdn.com/w40/${String(country).toLowerCase()}.png`}
                alt={country}
                style={{ width: '14px', height: '10px', objectFit: 'cover', borderRadius: '1px' }}
                onError={(e) => { e.target.style.display = 'none'; }}
            />
        );
    };

    const getOSIcon = (os) => {
        const iconStyle = { width: '12px', height: '12px', opacity: 0.9 };
        const defaultSvg = <svg viewBox="0 0 512 512" fill="currentColor" style={{ ...iconStyle, color: '#9CA3AF' }}><path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z" /></svg>;

        if (!os) return defaultSvg;
        const lowerOs = String(os).toLowerCase();
        if (lowerOs.includes('android')) return <svg viewBox="0 0 24 24" fill="#3DDC84" style={iconStyle}><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l-1.997-3.4592c-.3087-.5346-.9858-.7181-1.5208-.4094-.535.3087-.7189.9854-.4098 1.5204l1.9168 3.3204c-1.8946-.8626-4.0494-.8626-5.9439 0l1.9168-3.3204c.3079-.535.1252-1.2117-.4098-1.5204-.5361-.3087-1.2121-.1252-1.5208.4094l-1.9969 3.4592c-2.9103 1.5879-4.7003 4.549-4.9082 7.7788h18.8213c-.2083-3.2298-1.9983-6.1909-4.9086-7.7788" /></svg>;
        if (lowerOs.includes('ios') || lowerOs.includes('mac') || lowerOs.includes('iphone')) return <svg viewBox="0 0 384 512" fill="#A2AAAD" style={iconStyle}><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" /></svg>;
        if (lowerOs.includes('windows')) return <svg viewBox="0 0 448 512" fill="#0078D7" style={iconStyle}><path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v177.9zm0-380.6v180.1H448V32L203.8 65.7z" /></svg>;
        if (lowerOs.includes('linux')) return <svg style={iconStyle} viewBox="0 0 448 512" fill="#FCC624"><path d="M220.6 65.3c2.9-2.2 4.6-5.9 4.3-9.6-1.5-16.7 3.9-39 20-53 2.1-1.9 5.2-2.3 7.7-1.1 25.1 12.1 43.8 48 44.5 90.7.1 2.9-1.3 5.7-3.6 7.4-16.7 11.9-45.3 19.7-72.9-34.4z" /></svg>;
        return defaultSvg;
    };

    const getBrowserIcon = (browser) => {
        const iconStyle = { width: '12px', height: '12px', marginLeft: '2px', opacity: 0.9 };
        if (!browser) return null;
        const lowerBrowser = String(browser).toLowerCase();

        if (lowerBrowser.includes('facebook')) return <svg style={iconStyle} viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
        if (lowerBrowser.includes('instagram')) return <svg style={iconStyle} viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>;
        if (lowerBrowser.includes('threads')) return <svg style={iconStyle} viewBox="0 0 640 640" fill="currentColor"><path d="M427.5 299.7C429.7 300.6 431.7 301.6 433.8 302.5C463 316.6 484.4 337.7 495.6 363.9C511.3 400.4 512.8 459.7 465.3 507.1C429.1 543.3 385 559.6 322.7 560.1L322.4 560.1C252.2 559.6 198.3 536 162 489.9C129.7 448.9 113.1 391.8 112.5 320.3L112.5 319.8C113 248.3 129.6 191.2 161.9 150.2C198.2 104.1 252.2 80.5 322.4 80L322.7 80C393 80.5 447.6 104 485 149.9C503.4 172.6 517 199.9 525.6 231.6L485.2 242.4C478.1 216.6 467.4 194.6 453 177C423.8 141.2 380 122.8 322.5 122.4C265.5 122.9 222.4 141.2 194.3 176.8C168.1 210.1 154.5 258.3 154 320C154.5 381.7 168.1 429.9 194.3 463.3C222.3 498.9 265.5 517.2 322.5 517.7C373.9 517.3 407.9 505.1 436.2 476.8C468.5 444.6 467.9 405 457.6 380.9C451.5 366.7 440.5 354.9 425.7 346C422 372.9 413.9 394.3 401 410.8C383.9 432.6 359.6 444.4 328.3 446.1C304.7 447.4 282 441.7 264.4 430.1C243.6 416.3 231.4 395.3 230.1 370.8C227.6 322.5 265.8 287.8 325.3 284.4C346.4 283.2 366.2 284.1 384.5 287.2C382.1 272.4 377.2 260.6 369.9 252C359.9 240.3 344.3 234.3 323.7 234.2L323 234.2C306.4 234.2 284 238.8 269.7 260.5L235.3 236.9C254.5 207.8 285.6 191.8 323.1 191.8L323.9 191.8C386.5 192.2 423.8 231.3 427.6 299.5L427.4 299.7L427.5 299.7zM271.5 368.5C272.8 393.6 299.9 405.3 326.1 403.8C351.7 402.4 380.7 392.4 385.6 330.6C372.4 327.7 357.8 326.2 342.2 326.2C337.4 326.2 332.6 326.3 327.8 326.6C284.9 329 270.6 349.8 271.6 368.4L271.5 368.5z" /></svg>;
        if (lowerBrowser.includes('tiktok')) return <svg style={iconStyle} viewBox="0 0 24 24" fill="#ffffff"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48v-7.15a8.16 8.16 0 005.58 2.17v-3.46a4.85 4.85 0 01-2-.55V6.69h2z" /></svg>;
        if (lowerBrowser.includes('chrome')) return <svg style={iconStyle} viewBox="0 0 24 24" fill="#4285F4"><path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0112 6.545h10.691A12 12 0 0012 0zM1.931 5.47A11.943 11.943 0 000 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 01-6.865-2.29zm13.342 2.166a5.446 5.446 0 011.45 7.09l.002.001-3.953 6.848c.267.019.536.025.806.025 6.627 0 12-5.373 12-12 0-1.034-.131-2.037-.372-2.964zM12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" /></svg>;
        
        return null;
    };

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
        }, 10000); // Reduced frequency for performance

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
