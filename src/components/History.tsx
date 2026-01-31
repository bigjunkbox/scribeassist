import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchHistory, type SessionLog } from '../services/googleSheets';
import { FileText, Mic, ExternalLink } from 'lucide-react';

export const History = () => {
    const { accessToken } = useAuth();
    const [history, setHistory] = useState<SessionLog[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (accessToken) {
            setLoading(true);
            fetchHistory(accessToken)
                .then(setHistory)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [accessToken]);

    if (loading) {
        return <div className="flex-center" style={{ padding: '2rem' }}>Loading history...</div>;
    }

    if (history.length === 0) {
        return <div className="flex-center" style={{ padding: '2rem', color: 'var(--color-text-muted)' }}>No recordings found.</div>;
    }

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '800px' }}>
            <h2 style={{ marginBottom: '2rem' }}>History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {history.map((session, index) => (
                    <div
                        key={index}
                        style={{
                            background: 'var(--color-bg-secondary)',
                            padding: '1.5rem',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid var(--color-bg-tertiary)'
                        }}
                    >
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{session.sessionName}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{session.date}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a
                                href={session.audioLink}
                                target="_blank"
                                className="flex-center"
                                style={{
                                    textDecoration: 'none',
                                    color: 'var(--color-text-secondary)',
                                    gap: '4px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <Mic size={16} /> Audio
                            </a>
                            <a
                                href={session.summaryLink}
                                target="_blank"
                                className="flex-center"
                                style={{
                                    textDecoration: 'none',
                                    color: 'var(--color-accent-primary)',
                                    gap: '4px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <FileText size={16} /> Summary <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
