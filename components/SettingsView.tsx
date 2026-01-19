import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Book } from '../types';
import { exportToCSV, exportToJSON } from '../utils/export';

interface SettingsViewProps {
    books: Book[];
    onBack: () => void;
    onClearData: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ books, onBack, onClearData }) => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [showClearConfirm, setShowClearConfirm] = React.useState(false);

    const handleImport = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);
                if (Array.isArray(data)) {
                    localStorage.setItem('my-shelf-books', JSON.stringify(data));
                    window.location.reload();
                }
            } catch (err) {
                alert('Invalid file format');
            }
        };
        input.click();
    };

    return (
        <div className="min-h-screen p-6" style={{ background: 'var(--color-bg)' }}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="w-10 h-10 glass-button rounded-full flex items-center justify-center"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-text)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Settings</h1>
            </div>

            {/* Appearance Section */}
            <section className="mb-8">
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>
                    Appearance
                </h2>
                <div className="surface rounded-2xl overflow-hidden">
                    <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <div>
                            <p className="font-medium" style={{ color: 'var(--color-text)' }}>Theme</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                Currently: {resolvedTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                            </p>
                        </div>
                    </div>
                    <div className="p-4 flex gap-2">
                        {(['dark', 'light', 'system'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={`flex-1 py-3 rounded-xl font-medium transition-all ${theme === t
                                        ? 'btn-primary'
                                        : 'glass-button'
                                    }`}
                                style={{ color: theme === t ? 'white' : 'var(--color-text)' }}
                            >
                                {t === 'dark' && '🌙 Dark'}
                                {t === 'light' && '☀️ Light'}
                                {t === 'system' && '💻 System'}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Library Section */}
            <section className="mb-8">
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>
                    Library Data
                </h2>
                <div className="surface rounded-2xl overflow-hidden">
                    <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                            📚 {books.length} books in your library
                        </p>
                    </div>

                    <button
                        onClick={() => exportToJSON(books)}
                        className="w-full p-4 flex items-center gap-3 border-b hover:bg-[var(--color-surface-hover)] transition"
                        style={{ borderColor: 'var(--color-border)' }}
                    >
                        <span className="text-xl">📄</span>
                        <div className="text-left">
                            <p className="font-medium" style={{ color: 'var(--color-text)' }}>Export as JSON</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Full backup with all data</p>
                        </div>
                    </button>

                    <button
                        onClick={() => exportToCSV(books)}
                        className="w-full p-4 flex items-center gap-3 border-b hover:bg-[var(--color-surface-hover)] transition"
                        style={{ borderColor: 'var(--color-border)' }}
                    >
                        <span className="text-xl">📊</span>
                        <div className="text-left">
                            <p className="font-medium" style={{ color: 'var(--color-text)' }}>Export as CSV</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Spreadsheet compatible</p>
                        </div>
                    </button>

                    <button
                        onClick={handleImport}
                        className="w-full p-4 flex items-center gap-3 border-b hover:bg-[var(--color-surface-hover)] transition"
                        style={{ borderColor: 'var(--color-border)' }}
                    >
                        <span className="text-xl">📥</span>
                        <div className="text-left">
                            <p className="font-medium" style={{ color: 'var(--color-text)' }}>Import Library</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Restore from JSON backup</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setShowClearConfirm(true)}
                        className="w-full p-4 flex items-center gap-3 hover:bg-red-500/10 transition"
                    >
                        <span className="text-xl">🗑️</span>
                        <div className="text-left">
                            <p className="font-medium text-red-500">Clear All Data</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Delete all books</p>
                        </div>
                    </button>
                </div>
            </section>

            {/* About Section */}
            <section className="mb-8">
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>
                    About
                </h2>
                <div className="surface rounded-2xl p-4">
                    <p className="font-medium" style={{ color: 'var(--color-text)' }}>MyShelf</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Version 2.0</p>
                    <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
                        Build your digital library by scanning book barcodes.
                    </p>
                </div>
            </section>

            {/* Clear Confirmation Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
                    <div className="relative glass rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Clear All Data?</h3>
                        <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                            This will permanently delete all {books.length} books from your library. This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 py-3 glass-button rounded-xl font-medium"
                                style={{ color: 'var(--color-text)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onClearData();
                                    setShowClearConfirm(false);
                                }}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium"
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsView;
