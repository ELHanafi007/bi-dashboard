import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Building, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Save,
  Shield,
  Bell,
  Palette
} from 'lucide-react';

const Settings: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Business Profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    logo: ''
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data;
    }
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || '',
        email: settings.email || '',
        phone: settings.phone || '',
        address: settings.address || '',
        logo: settings.logo || ''
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => api.put('/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      alert('Settings updated successfully!');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%' }}
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>Settings</h1>
        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Configure your business profile and dashboard preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        {/* Sidebar Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { name: 'Business Profile', icon: <Building size={18} /> },
            { name: 'Notifications', icon: <Bell size={18} /> },
            { name: 'Security', icon: <Shield size={18} /> },
            { name: 'Appearance', icon: <Palette size={18} /> },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === item.name ? '#3b82f610' : 'transparent',
                color: activeTab === item.name ? '#3b82f6' : '#64748b',
                fontWeight: '600',
                fontSize: '0.875rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="card" style={{ border: '1px solid #f1f5f9' }}>
          {activeTab === 'Business Profile' && (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>Business Information</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>This information will be displayed on your invoices and public profile.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>Business Name</label>
                  <div style={{ position: 'relative' }}>
                    <Building size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} 
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>Support Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} 
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>Business Address</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>Logo URL</label>
                <div style={{ position: 'relative' }}>
                  <Globe size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    value={formData.logo}
                    onChange={(e) => setFormData({...formData, logo: e.target.value})}
                    placeholder="https://example.com/logo.png"
                    style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} 
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn btn-primary"
                  style={{ gap: '0.5rem', padding: '0.75rem 2rem' }}
                  disabled={updateMutation.isLoading}
                >
                  <Save size={18} />
                  {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </form>
          )}

          {activeTab === 'Notifications' && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <Bell size={48} style={{ color: '#e2e8f0', marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>Notification Settings</h3>
              <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>Email and push notification preferences will be available here in the next update.</p>
            </div>
          )}

          {activeTab === 'Security' && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <Shield size={48} style={{ color: '#e2e8f0', marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>Security & Privacy</h3>
              <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>Manage your password, two-factor authentication, and session security settings.</p>
            </div>
          )}

          {activeTab === 'Appearance' && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <Palette size={48} style={{ color: '#e2e8f0', marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>Theme Customization</h3>
              <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>Customize the dashboard colors, fonts, and dark mode settings to match your brand.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
