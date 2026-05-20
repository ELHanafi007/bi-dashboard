import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { LogIn, ShieldCheck, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { languageConfig, type Language } from '../i18n';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t, language, setLanguage, isRTL } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || t('login_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      background: '#05070a', padding: '2rem', position: 'relative', overflow: 'hidden' 
    }}>
      {/* Abstract Background Orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      {/* Premium Language Switcher */}
      <div style={{ position: 'absolute', top: '2rem', [isRTL ? 'left' : 'right']: '2.5rem', display: 'flex', gap: '0.75rem', zIndex: 10 }}>
        {(Object.entries(languageConfig) as [Language, typeof languageConfig.en][]).map(([code, config]) => (
          <motion.button 
            key={code} onClick={() => setLanguage(code)}
            whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.06)' }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              padding: '0.6rem 1rem', borderRadius: '14px', 
              border: language === code ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--glass-bg)', 
              backgroundColor: language === code ? 'rgba(99, 102, 241, 0.15)' : 'var(--glass-bg)', 
              color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{config.flag}</span>
            <span style={{ fontWeight: '700', opacity: language === code ? 1 : 0.6 }}>{config.nativeName}</span>
          </motion.button>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="zenith-card" 
        style={{ width: '100%', maxWidth: '460px', padding: '3.5rem 3rem', borderRadius: '32px', border: '1px solid var(--glass-bg)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
            style={{ 
              width: '64px', height: '64px', borderRadius: '18px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', 
              boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)' 
            }}
          >
            <ShieldCheck size={32} color="white" />
          </motion.div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.04em' }}>{t('welcome_back')}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', fontSize: '1rem', fontWeight: '500' }}>{t('sign_in_subtitle')}</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', 
              borderRadius: '16px', marginBottom: '2rem', fontSize: '0.875rem', fontWeight: '600', 
              border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' 
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.65rem', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('email_address')}</label>
            <input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@zenith.ai"
              className="zenith-input" style={{ fontSize: '1rem', padding: '0.85rem 1.25rem' }} 
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('password')}</label>
              <Link to="#" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6366f1', textDecoration: 'none' }}>Forgot Password?</Link>
            </div>
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
              className="zenith-input" style={{ fontSize: '1rem', padding: '0.85rem 1.25rem' }} 
            />
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)' }} 
            whileTap={{ scale: 0.98 }} 
            type="submit" disabled={loading}
            className="btn-zenith btn-zenith-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: '800', marginTop: '1rem', justifyContent: 'center' }}
          >
            {loading ? t('signing_in') : t('sign_in')} <ArrowRight size={20} style={{ marginLeft: '8px' }} />
          </motion.button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.95rem' }}>
          <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>
            {t('no_account')} 
            <Link to="/register" style={{ color: 'var(--text-main)', fontWeight: '800', textDecoration: 'none', marginLeft: '0.5rem', borderBottom: '2px solid #6366f1' }}>
              {t('register')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
