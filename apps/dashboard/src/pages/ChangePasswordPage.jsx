import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function ChangePasswordPage() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const trimmedOld = oldPassword.trim();
        const trimmedNew = newPassword.trim();
        const trimmedConfirm = confirmPassword.trim();

        if (!trimmedOld || !trimmedNew || !trimmedConfirm) {
            setError('All fields are required');
            return;
        }

        if (trimmedNew.length < 4) {
            setError('New password must be at least 4 characters');
            return;
        }

        if (trimmedNew !== trimmedConfirm) {
            setError('New passwords do not match');
            return;
        }

        try {
            const data = await api.changePassword(trimmedOld, trimmedNew);

            if (data && data.success) {
                setSuccess('Password changed successfully!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');

                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                setError(data?.message || 'Failed to change password');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
            console.error('Change password error:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-border-light dark:border-border-dark p-8">
                <div className="flex flex-col items-center mb-6 gap-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <span className="material-icons-round text-primary text-3xl">settings_backup_restore</span>
                    </div>
                    <h1 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
                        Change Password
                    </h1>
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark text-center">
                        Secure your account by updating your access password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Old Password */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <span className="material-icons-round text-sm">lock_open</span>
                        </span>
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="form-input w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-border-light dark:border-border-dark rounded-xl text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                            required
                        />
                    </div>

                    {/* New Password */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <span className="material-icons-round text-sm">vpn_key</span>
                        </span>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="form-input w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-border-light dark:border-border-dark rounded-xl text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                            required
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <span className="material-icons-round text-sm">enhanced_encryption</span>
                        </span>
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-input w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-border-light dark:border-border-dark rounded-xl text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-xs text-center font-medium animate-pulse">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-emerald-500 text-xs text-center font-medium">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>Update Password</span>
                        <span className="material-icons-round text-sm">save</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-text-muted-light dark:text-text-muted-dark font-medium py-2 rounded-xl transition-all text-sm"
                    >
                        Cancel
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark opacity-50">
                        Redirecting to dashboard after success...
                    </p>
                </div>
            </div>
        </div>
    );
}
