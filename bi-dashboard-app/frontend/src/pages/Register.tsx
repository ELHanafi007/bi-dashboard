import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { UserPlus, Building2, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    organizationName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) return setError(t('passwords_no_match'));
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { 
        name: formData.name, 
        email: formData.email, 
        password: formData.password,
        organizationName: formData.organizationName
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || t('register_failed'));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      background: '#05070a', padding: '2rem', position: 'relative', overflow: 'hidden' 
    }}>
      {/* Aesthetic Background */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5 }}
        className="zenith-card" 
        style={{ width: '100%', maxWidth: '520px', padding: '3.5rem 3rem', borderRadius: '32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.1 }}
            style={{ 
              width: '64px', height: '64px', borderRadius: '18px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', 
              boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)' 
            }}
          >
            <UserPlus size={32} color="white" />
          </motion.div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.04em' }}>{t('create_account')}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', fontSize: '1rem' }}>Join the next generation of business intelligence</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', 
              borderRadius: '16px', marginBottom: '2rem', fontSize: '0.875rem', fontWeight: '600', 
              border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' 
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
             <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}><Building2 size={14} /> Company</label>
              <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} required className="zenith-input" placeholder="Acme Corp" />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}><User size={14} /> {t('full_name')}</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="zenith-input" placeholder="John Doe" />
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}><Mail size={14} /> {t('email_address')}</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="zenith-input" placeholder="john@example.com" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}><Lock size={14} /> {t('password')}</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="zenith-input" placeholder="••••••••" />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}><Lock size={14} /> Confirm</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="zenith-input" placeholder="••••••••" />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)' }} 
            whileTap={{ scale: 0.98 }} 
            type="submit" disabled={loading}
            className="btn-zenith btn-zenith-primary" 
            style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', fontWeight: '800', marginTop: '1.5rem', justifyContent: 'center' }}
          >
            {loading ? t('creating_account') : t('create_account')} <ArrowRight size={20} style={{ marginLeft: '8px' }} />
          </motion.button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.95rem' }}>
          <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>
            {t('already_have_account')} 
            <Link to="/login" style={{ color: 'var(--text-main)', fontWeight: '800', textDecoration: 'none', marginLeft: '0.5rem', borderBottom: '2px solid #6366f1' }}>
              {t('sign_in')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
