import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/products', icon: <Package size={20} /> },
    { name: 'Orders', path: '/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Customers', path: '/customers', icon: <Users size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="layout-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        style={{
          width: '260px',
          backgroundColor: 'var(--sidebar-bg)',
          color: 'white',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          zIndex: 50,
          boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ padding: '0 1rem', marginBottom: '2.5rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            fontSize: '1.5rem', 
            fontWeight: '800', 
            color: '#3b82f6',
            letterSpacing: '-0.025em'
          }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '8px' }}></div>
            ZENITH BI
          </div>
        </div>
        
        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} style={{ marginBottom: '0.25rem' }}>
                  <Link to={item.path}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        color: isActive ? '#3b82f6' : '#94a3b8',
                        fontWeight: isActive ? '600' : '500',
                        transition: 'background-color 0.2s, color 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                      {isActive && <motion.div layoutId="active" style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />}
                    </motion.div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <motion.button 
          whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
          onClick={handleLogout}
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            backgroundColor: 'transparent',
            color: '#94a3b8',
            border: 'none',
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          <LogOut size={20} />
          Logout
        </motion.button>
      </motion.aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '260px', minHeight: '100vh' }}>
        <header style={{ 
          height: '70px', 
          backgroundColor: 'var(--header-bg)', 
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: '50%',
                backgroundColor: 'var(--input-bg)'
              }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </motion.button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>Admin User</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Administrator</p>
              </div>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                AD
              </div>
            </div>
          </div>
        </header>
        <div style={{ padding: '2rem' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Layout;
