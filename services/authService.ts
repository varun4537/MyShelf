const AUTH_STORAGE_KEY = 'myshelf-auth-token';

export const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(AUTH_STORAGE_KEY);
};

export const setAuthToken = (token: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(AUTH_STORAGE_KEY, token);
};

export const clearAuthToken = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const login = async (username: string, password: string): Promise<string> => {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        throw new Error('Invalid credentials');
    }

    const data = await response.json();
    if (!data?.token) {
        throw new Error('Invalid auth response');
    }

    setAuthToken(data.token);
    return data.token as string;
};