import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function LoginPage({ onLogin }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const trimmedPassword = password.trim();

        if (!trimmedPassword) {
            setError('Password cannot be empty');
            return;
        }

        try {
            const data = await api.verifyPassword(trimmedPassword);

            if (data && data.success) {
                onLogin();
                navigate('/dashboard');
            } else {
                setError(data?.message || 'Invalid Password');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
            console.error('Login error:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
            {/* 🔮 BACKGROUND BLOBS (Animated) - iOS 26 Style */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-40 animate-blob"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400 dark:bg-yellow-900 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-400 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-sm glass-panel-deep rounded-3xl p-8 relative z-10 transform hover:scale-[1.01] transition-transform duration-500">
                <div className="flex flex-col items-center mb-8 gap-4">
                    <div className="mb-2 relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="w-32 h-32 object-contain relative z-10 drop-shadow-2xl"
                        />
                    </div>
                    <h1 className="text-3xl font-bold liquid-text text-center tracking-tighter">
                        NGETEAM DASHBOARD
                    </h1>
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark text-center opacity-80">
                        Please enter the access password to continue to the dashboard.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="relative group">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                            <span className="material-icons-round text-lg">vpn_key</span>
                        </span>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className="glass-input w-full pl-11 pr-4 py-3.5 rounded-2xl outline-none text-text-main-light dark:text-text-main-dark placeholder-gray-400 font-medium"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-bold animate-pulse backdrop-blur-md">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-primary-hover hover:from-green-400 hover:to-primary text-white font-bold py-3.5 rounded-2xl shadow-[0_8px_20px_-4px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <span className="relative z-10">Access Dashboard</span>
                        <span className="material-icons-round text-sm relative z-10 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] font-mono text-text-muted-light dark:text-text-muted-dark opacity-40 uppercase tracking-widest">
                        Protected System v1.0
                    </p>
                </div>
            </div>
        </div>
    );
}
