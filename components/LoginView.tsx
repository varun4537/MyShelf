import React, { useState } from 'react';
import { BookIcon } from './icons/BookIcon';

interface LoginViewProps {
    onLogin: (username: string, password: string) => void;
    isLoading: boolean;
    errorMessage: string | null;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, isLoading, errorMessage }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onLogin(username.trim(), password);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--color-bg)' }}>
            <div className="w-full max-w-sm surface rounded-2xl p-6">
                <div className="flex flex-col items-center text-center">
                    <BookIcon className="w-16 h-16" style={{ color: 'var(--color-primary)' }} />
                    <h1 className="text-3xl font-bold mt-4" style={{ color: 'var(--color-text)' }}>MyShelf</h1>
                    <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                        Sign in to scan and build the shared library.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            className="w-full glass rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            style={{ color: 'var(--color-text)' }}
                            placeholder="Enter shared username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full glass rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            style={{ color: 'var(--color-text)' }}
                            placeholder="Enter shared password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {errorMessage && (
                        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5' }}>
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 btn-primary rounded-xl font-semibold disabled:opacity-60"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginView;