import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Chrome } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (tokenResponse: any) => void;
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => onLoginSuccess(tokenResponse),
    onError: (error) => console.log('Login Failed:', error),
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/generative-language.retriever',
    flow: 'implicit', // Get access token
  });

  return (
    <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ScribeAssist
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.25rem', maxWidth: '400px', margin: '0 auto' }}>
          AI-powered audio recording, transcription, and summarization.
        </p>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => login()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 32px',
          backgroundColor: 'white',
          color: '#3c4043',
          border: '1px solid #dadce0',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: '500',
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
        }}
      >
        <Chrome size={20} />
        Sign in with Google
      </motion.button>
    </div>
  );
};
