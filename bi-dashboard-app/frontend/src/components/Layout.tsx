import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, 
  LogOut, Sun, Moon, ChevronDown, Bell, Search, Command, Menu, X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { languageConfig, type Language } from '../i18n';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: t('nav_dashboard'), path: '/', icon: <LayoutDashboard size={22} /> },
    { name: t('nav_products'), path: '/products', icon: <Package size={22} /> },
    { name: t('nav_orders'), path: '/orders', icon: <ShoppingCart size={22} /> },
    { name: t('nav_customers'), path: '/customers', icon: <Users size={22} /> },
    { name: t('nav_analytics'), path: '/analytics', icon: <BarChart3 size={22} /> },
    { name: t('nav_settings'), path: '/settings', icon: <Settings size={22} /> },
  ];

  const currentLang = languageConfig[language];
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Admin User", "role": "Administrator"}');

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: isRTL ? '100%' : '-100%', opacity: 0 }
  };

  return (
    <div className="app-container" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dynamic Background Elements */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }} />

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 45 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        variants={sidebarVariants}
        initial={isMobile ? "closed" : "open"}
        animate={(!isMobile || mobileMenuOpen) ? "open" : "closed"}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          width: isMobile ? 'calc(100% - 40px)' : '280px',
          maxWidth: '300px',
          height: 'calc(100vh - 40px)',
          margin: '20px',
          padding: '2rem 1.5rem',
          background: 'var(--bg-sidebar)',
          backdropFilter: 'blur(25px)',
          border: '1px solid var(--glass-bg)',
          borderRadius: '32px',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          zIndex: 50,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          [isRTL ? 'right' : 'left']: 0
        }}
      >
        {/* Brand & Mobile Close */}
        <div style={{ marginBottom: '3rem', padding: '0 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '42px', height: '42px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
              borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
            }}>
              <span style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: '900' }}>Z</span>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-main)' }}>ZENITH</div>
              <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '-2px' }}>Intelligence</div>
            </div>
          </div>
          {isMobile && (
            <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {navItems.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} style={{ marginBottom: '0.75rem' }}>
                  <Link to={item.path} style={{ textDecoration: 'none' }} onClick={() => isMobile && setMobileMenuOpen(false)}>
                    <motion.div
                      whileHover={{ x: isRTL ? -8 : 8, backgroundColor: 'rgba(255,255,255,0.04)' }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.25rem',
                        borderRadius: '18px', position: 'relative',
                        color: isActive ? 'white' : '#94a3b8',
                        backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <span style={{ color: isActive ? '#818cf8' : 'inherit' }}>{item.icon}</span>
                      <span style={{ fontWeight: isActive ? '700' : '500', fontSize: '0.95rem' }}>{item.name}</span>
                      {isActive && (
                        <motion.div 
                          layoutId="nav-indicator"
                          style={{ 
                            position: 'absolute', [isRTL ? 'left' : 'right']: '12px', 
                            width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8',
                            boxShadow: '0 0 10px #818cf8'
                          }} 
                        />
                      )}
                    </motion.div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Section */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-bg)', paddingTop: '1.5rem' }}>
          <motion.button 
            whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.25rem',
              borderRadius: '18px', background: 'transparent', border: 'none', width: '100%',
              color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={20} />
            <span>{t('nav_logout')}</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        [isRTL ? 'marginRight' : 'marginLeft']: isMobile ? 0 : '320px', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Floating Glass Header */}
        <header style={{ 
          height: isMobile ? '70px' : '90px', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '0 1.25rem' : '0 2.5rem', position: 'sticky', top: 0, zIndex: 40,
          background: scrolled ? 'var(--header-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(15px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--glass-bg)' : 'none',
          transition: 'all 0.4s ease'
        }}>
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <button onClick={() => setMobileMenuOpen(true)} className="btn-zenith btn-zenith-outline" style={{ padding: '0.6rem', borderRadius: '12px' }}>
              <Menu size={20} />
            </button>
          )}

          {/* Search Bar - Hidden on small mobile */}
          <div style={{ position: 'relative', width: '350px', display: window.innerWidth < 640 ? 'none' : 'block' }}>
            <Search size={18} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search..."
              style={{
                width: '100%', padding: '0.65rem 1rem 0.65rem 3rem', background: 'var(--glass-bg)',
                border: '1px solid var(--glass-bg)', borderRadius: '14px', color: 'var(--text-main)', outline: 'none',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1.5rem' }}>
            {/* Lang Dropdown */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setLangDropdownOpen(!langDropdownOpen)} className="btn-zenith btn-zenith-outline" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{currentLang.flag}</span>
                {!isMobile && <span>{currentLang.nativeName}</span>}
                <ChevronDown size={12} style={{ opacity: 0.5 }} />
              </button>
              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{
                      position: 'absolute', top: '120%', [isRTL ? 'left' : 'right']: 0, minWidth: '180px',
                      background: 'var(--bg-card)', backdropFilter: 'blur(20px)', borderRadius: '20px',
                      border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                      overflow: 'hidden', zIndex: 100
                    }}
                  >
                    {(Object.entries(languageConfig) as [Language, typeof currentLang][]).map(([code, config]) => (
                      <button
                        key={code} onClick={() => { setLanguage(code); setLangDropdownOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '0.85rem 1.25rem', border: 'none',
                          background: language === code ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                          color: language === code ? '#818cf8' : 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600'
                        }}
                      >
                        <span style={{ fontSize: '1.3rem' }}>{config.flag}</span>
                        <span>{config.nativeName}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="btn-zenith btn-zenith-outline" 
                style={{ padding: '0.6rem', borderRadius: '50%', position: 'relative' }}
              >
                <Bell size={18} />
                <span style={{ 
                  position: 'absolute', top: '-2px', right: '-2px', 
                  width: '8px', height: '8px', background: '#ef4444', 
                  borderRadius: '50%', border: '2px solid #0f172a' 
                }} />
              </button>
              
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{
                      position: 'absolute', top: '140%', [isRTL ? 'left' : 'right']: 0, 
                      width: '320px', background: 'var(--bg-card)', 
                      backdropFilter: 'blur(20px)', borderRadius: '24px',
                      border: '1px solid var(--border)', 
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                      overflow: 'hidden', zIndex: 100
                    }}
                  >
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '0.95rem' }}>{t('notifications')}</h4>
                      <span style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: '700', textTransform: 'uppercase' }}>4 New</span>
                    </div>
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                      {[
                        { title: 'New Order Received', desc: 'Order #82A91 from Mohamed B.', time: '2 mins ago', type: 'order' },
                        { title: 'Stock Alert', desc: 'MacBook Pro stock is below 5 units', time: '1 hour ago', type: 'alert' },
                        { title: 'Payment Confirmed', desc: 'Invoice #INV-2024-001 paid', time: '3 hours ago', type: 'success' },
                        { title: 'System Update', desc: 'Analytics engine upgraded to v2.4', time: '5 hours ago', type: 'info' }
                      ].map((n, i) => (
                        <div key={i} style={{ 
                          padding: '1rem 1.5rem', borderBottom: i === 3 ? 'none' : '1px solid var(--glass-bg)',
                          cursor: 'pointer', transition: 'background 0.2s'
                        }} className="notification-item">
                          <p style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '0.875rem' }}>{n.title}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '2px' }}>{n.desc}</p>
                          <p style={{ color: '#475569', fontSize: '0.7rem', marginTop: '6px', fontWeight: '600' }}>{n.time}</p>
                        </div>
                      ))}
                    </div>
                    <button style={{ 
                      width: '100%', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', 
                      border: 'none', color: '#818cf8', fontWeight: '700', fontSize: '0.8125rem',
                      cursor: 'pointer'
                    }}>
                      View All Activity
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={toggleTheme} className="btn-zenith btn-zenith-outline" style={{ padding: '0.6rem', borderRadius: '50%' }}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* User Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--glass-bg)', padding: isMobile ? '0.2rem' : '0.4rem 0.4rem 0.4rem 1.2rem', borderRadius: '18px', border: '1px solid var(--glass-bg)' }}>
              {!isMobile && (
                <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: '800', color: 'var(--text-main)' }}>{user.name}</div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user.role}</div>
                </div>
              )}
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '12px', 
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-main)', fontWeight: '800', fontSize: '0.75rem'
              }}>
                {user.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: isMobile ? '1.5rem' : '2.5rem', flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Overlay for dropdowns */}
      {(langDropdownOpen || notificationsOpen) && (
        <div onClick={() => { setLangDropdownOpen(false); setNotificationsOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
      )}
    </div>
  );
};

export default Layout;
