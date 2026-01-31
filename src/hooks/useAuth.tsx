import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    isAuthenticated: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);

    // Optional: Persist token to sessionStorage so refresh doesn't kill session immediately
    // But for security with implicit flow, in-memory is safer. We'll stick to in-memory for this PoC.
    // Actually, for better DX, let's use sessionStorage but validation is tricky without backend.
    // Let's stick to simple in-memory for now.

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
