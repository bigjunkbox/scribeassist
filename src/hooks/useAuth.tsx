import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    isAuthenticated: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Initialize from sessionStorage to persist across refreshes
    const [accessToken, setAccessTokenState] = useState<string | null>(() => {
        try {
            return sessionStorage.getItem('google_access_token');
        } catch {
            return null;
        }
    });

    // Wrapper to sync with sessionStorage
    const setAccessToken = (token: string | null) => {
        setAccessTokenState(token);
        try {
            if (token) {
                sessionStorage.setItem('google_access_token', token);
            } else {
                sessionStorage.removeItem('google_access_token');
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
