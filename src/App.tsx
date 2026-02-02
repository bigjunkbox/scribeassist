import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Login } from './components/Login';
import { Recorder } from './components/Recorder';
import { History } from './components/History';
import { Mic, List, LogOut } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, setAccessToken, logout } = useAuth();
  const [view, setView] = useState<'recorder' | 'history'>('recorder');

  console.log('🔐 App render - isAuthenticated:', isAuthenticated);

  const handleLoginSuccess = (tokenResponse: any) => {
    console.log('✅ Login successful, token response:', tokenResponse);
    if (tokenResponse.access_token) {
      setAccessToken(tokenResponse.access_token);
    }
  };

  if (!isAuthenticated) {
    console.log('🚫 Not authenticated - showing login screen');
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  console.log('✅ Authenticated - showing main app');

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <header style={{
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--color-bg-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 100
      }}>
        <div className="flex-center" style={{ gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
          <span style={{ background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ScribeAssist
          </span>
        </div>

        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => setView('recorder')}
            style={{
              color: view === 'recorder' ? 'white' : 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <Mic size={18} /> New Recording
          </button>
          <div style={{ width: '1px', height: '1.5rem', background: 'var(--color-bg-tertiary)' }} />
          <button
            onClick={() => setView('history')}
            style={{
              color: view === 'history' ? 'white' : 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <List size={18} /> History
          </button>
          <div style={{ width: '1px', height: '1.5rem', background: 'var(--color-bg-tertiary)' }} />
          <button
            onClick={logout}
            style={{
              color: 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </nav>
      </header>

      <main style={{ padding: '2rem 0' }}>
        {view === 'recorder' ? <Recorder /> : <History />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App;
