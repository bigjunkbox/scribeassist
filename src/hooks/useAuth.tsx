import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    isAuthenticated: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Initialize from localStorage to persist across refreshes AND tabs
    const [accessToken, setAccessTokenState] = useState<string | null>(() => {
        try {
            const token = localStorage.getItem('google_access_token');
            console.log('🔑 Loading token from localStorage:', token ? 'Token found' : 'No token');
            return token;
        } catch {
            console.log('🔑 Failed to load token from localStorage');
            return null;
        }
    });

    // Wrapper to sync with localStorage
    const setAccessToken = (token: string | null) => {
        console.log('🔑 Setting token:', token ? 'New token' : 'Clearing token');
        setAccessTokenState(token);
        try {
            if (token) {
                localStorage.setItem('google_access_token', token);
                console.log('🔑 Token saved to localStorage');
            } else {
                localStorage.removeItem('google_access_token');
                console.log('🔑 Token removed from localStorage');
            }
        } catch (error) {
            console.error('Failed to persist token:', error);
        }
    };

    const logout = () => {
        setAccessToken(null);
    };

    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken, isAuthenticated: !!accessToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
