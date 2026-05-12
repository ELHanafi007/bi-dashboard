import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { motion } from 'framer-motion';
import { Building, Globe, Mail, Phone, MapPin, Save, Shield, Bell, Palette } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const Settings: React.FC = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const isMobile = window.innerWidth < 1024;
  const [activeTab, setActiveTab] = useState('business');
  const [formData, setFormData] = useState({
    name: '',
    legalForm: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    logo: '',
    taxId: '',
    regNumber: '',
    managerName: ''
  });

  const { data: settings, isLoading } = useQuery({ queryKey: ['settings'], queryFn: async () => { const r = await api.get('/settings'); return r.data; } });

  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || '',
        legalForm: settings.legalForm || '',
        email: settings.email || '',
        phone: settings.phone || '',
        address: settings.address || '',
        website: settings.website || '',
        logo: settings.logo || '',
        taxId: settings.taxId || '',
        regNumber: settings.regNumber || '',
        managerName: settings.managerName || ''
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => api.put('/settings', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['settings'] }); toast.success(t('settings_updated')); }
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); updateMutation.mutate(formData); };

  const tabs = [
    { key: 'business', name: t('business_profile'), icon: <Building size={18} /> },
    { key: 'notifications', name: t('notifications'), icon: <Bell size={18} /> },
    { key: 'security', name: t('security'), icon: <Shield size={18} /> },
    { key: 'appearance', name: t('appearance'), icon: <Palette size={18} /> },
  ];

  if (isLoading) return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%' }} /></div>);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
        <h1 style={{ fontSize: isMobile ? '1.75rem' : '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>{t('settings_title')}</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: isMobile ? '0.9rem' : '1rem' }}>{t('settings_subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '250px 1fr', gap: isMobile ? '1.5rem' : '2rem' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'row' : 'column', 
          gap: '0.5rem',
          overflowX: isMobile ? 'auto' : 'visible',
          paddingBottom: isMobile ? '0.5rem' : 0,
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}>
          {tabs.map((item) => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', border: 'none', 
                backgroundColor: activeTab === item.key ? 'rgba(59, 130, 246, 0.1)' : 'transparent', 
                color: activeTab === item.key ? '#3b82f6' : 'var(--text-muted)', 
                fontWeight: '600', fontSize: '0.875rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}>
              {item.icon} {item.name}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: isMobile ? '1.25rem' : '2rem' }}>
          {activeTab === 'business' && (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('business_info')}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('business_info_desc')}</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1rem' : '1.5rem', marginBottom: isMobile ? '1rem' : '1.5rem' }}>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Business Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="zenith-input" /></div>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Legal Form (e.g. SARL, LLC)</label><input type="text" value={formData.legalForm} onChange={(e) => setFormData({...formData, legalForm: e.target.value})} className="zenith-input" /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1rem' : '1.5rem', marginBottom: isMobile ? '1rem' : '1.5rem' }}>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Support Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="zenith-input" /></div>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Phone Number</label><input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="zenith-input" /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1rem' : '1.5rem', marginBottom: isMobile ? '1rem' : '1.5rem' }}>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Website</label><input type="text" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="zenith-input" /></div>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Business Address</label><input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="zenith-input" /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1rem' : '1.5rem', marginBottom: isMobile ? '1rem' : '1.5rem' }}>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Tax ID (e.g. ICE/VAT)</label><input type="text" value={formData.taxId} onChange={(e) => setFormData({...formData, taxId: e.target.value})} className="zenith-input" /></div>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Registration Number (RC)</label><input type="text" value={formData.regNumber} onChange={(e) => setFormData({...formData, regNumber: e.target.value})} className="zenith-input" /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1rem' : '1.5rem', marginBottom: isMobile ? '1rem' : '1.5rem' }}>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Manager/Owner Name</label><input type="text" value={formData.managerName} onChange={(e) => setFormData({...formData, managerName: e.target.value})} className="zenith-input" /></div>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Logo URL</label><input type="text" value={formData.logo} onChange={(e) => setFormData({...formData, logo: e.target.value})} placeholder="https://example.com/logo.png" className="zenith-input" /></div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn-zenith btn-zenith-primary" style={{ gap: '0.5rem', padding: '0.75rem 2rem', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }} disabled={updateMutation.isPending}>
                  <Save size={18} /> {updateMutation.isPending ? t('saving') : t('save_changes')}
                </motion.button>
              </div>
            </form>
          )}
          {activeTab === 'notifications' && (<div style={{ textAlign: 'center', padding: '4rem 2rem' }}><Bell size={48} style={{ color: '#e2e8f0', marginBottom: '1.5rem' }} /><h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('notification_settings')}</h3><p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>{t('notification_desc')}</p></div>)}
          {activeTab === 'security' && (<div style={{ textAlign: 'center', padding: '4rem 2rem' }}><Shield size={48} style={{ color: '#e2e8f0', marginBottom: '1.5rem' }} /><h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('security_privacy')}</h3><p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>{t('security_desc')}</p></div>)}
          {activeTab === 'appearance' && (<div style={{ textAlign: 'center', padding: '4rem 2rem' }}><Palette size={48} style={{ color: '#e2e8f0', marginBottom: '1.5rem' }} /><h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('theme_customization')}</h3><p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>{t('theme_desc')}</p></div>)}
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
