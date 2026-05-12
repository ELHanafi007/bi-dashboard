import Skeleton from '../components/Skeleton';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { motion } from 'framer-motion';
import { 
  DollarSign, ShoppingCart, Users, Package, 
  ArrowUpRight, TrendingUp, Activity, Filter, 
  ChevronRight, Calendar
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const Dashboard: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const isMobile = window.innerWidth < 1024;
  const { data, isLoading, error } = useQuery({ 
    queryKey: ['dashboard-stats'], 
    queryFn: async () => { const r = await api.get('/dashboard'); return r.data; } 
  });
  const { data: salesData } = useQuery({ 
    queryKey: ['sales-analytics'], 
    queryFn: async () => { const r = await api.get('/analytics/sales'); return r.data; } 
  });

  if (isLoading) return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div><Skeleton width={200} height="2.5rem" /><Skeleton width={300} height="1rem" style={{ marginTop: '0.5rem' }} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {[1,2,3,4].map(i => <Skeleton key={i} height="140px" borderRadius="24px" />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <Skeleton height="400px" borderRadius="24px" />
        <Skeleton height="400px" borderRadius="24px" />
      </div>
    </div>
  );

  if (error) return <div className="zenith-card" style={{ color: 'var(--accent-error)', textAlign: 'center' }}>{t('error_dashboard')}</div>;

  const summaryItems = [
    { label: t('total_revenue'), value: `${data?.summary?.totalRevenue?.toLocaleString()} MAD`, icon: <DollarSign size={22} />, color: '#6366f1', trend: '+12.5%' },
    { label: t('outstanding_debt'), value: `${data?.summary?.totalDebt?.toLocaleString()} MAD`, icon: <Activity size={22} />, color: '#ef4444', trend: 'CRÉDIT' },
    { label: t('total_orders'), value: data?.summary?.totalOrders, icon: <ShoppingCart size={22} />, color: '#10b981', trend: '+5.2%' },
    { label: t('total_customers'), value: data?.summary?.totalCustomers, icon: <Users size={22} />, color: '#a855f7', trend: '+8.1%' },
  ];

  const containerVariants = { 
    hidden: { opacity: 0 }, 
    show: { opacity: 1, transition: { staggerChildren: 0.1 } } 
  };
  
  const itemVariants = { 
    hidden: { opacity: 0, y: 20 }, 
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } 
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1.5rem' : 0 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.04em' }}>{t('dashboard_title')}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: isMobile ? '0.9rem' : '1.05rem' }}>{t('dashboard_subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', width: isMobile ? '100%' : 'auto' }}>
          <button className="btn-zenith btn-zenith-outline" style={{ flex: isMobile ? 1 : 'none' }}><Calendar size={18} /> {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</button>
          <button onClick={() => window.print()} className="btn-zenith btn-zenith-primary" style={{ flex: isMobile ? 1 : 'none' }}><TrendingUp size={18} /> {t('generate_report')}</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {summaryItems.map((item, index) => (
          <motion.div key={index} variants={itemVariants} className="zenith-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ 
                background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`, 
                color: item.color, padding: '0.85rem', borderRadius: '16px',
                border: `1px solid ${item.color}20`
              }}>{item.icon}</div>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', 
                fontSize: '0.75rem', fontWeight: '800', backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                padding: '0.35rem 0.75rem', borderRadius: '99px', border: '1px solid rgba(16, 185, 129, 0.1)' 
              }}><ArrowUpRight size={14} />{item.trend}</div>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
              <h3 className="mono" style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.5rem' }}>{item.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Popular Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.8fr 1.2fr', gap: '2rem', marginBottom: '2rem' }}>
        <motion.div variants={itemVariants} className="zenith-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>{t('revenue_growth')}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Insights from the last 30 active days</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--glass-bg)', padding: '0.4rem', borderRadius: '14px' }}>
              <button style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: 'none' }}>{t('daily')}</button>
              <button style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', background: 'none', border: 'none' }}>{t('monthly')}</button>
            </div>
          </div>
          <div style={{ height: '350px', width: '100%', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="zenithGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-bg)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} tickLine={false} 
                  tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} 
                  dy={15} reversed={isRTL} 
                />
                <YAxis 
                  axisLine={false} tickLine={false} 
                  tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} 
                  orientation={isRTL ? 'right' : 'left'} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderRadius: '16px', border: '1px solid var(--border)',
                    backdropFilter: 'blur(10px)', color: 'var(--text-main)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                  }} 
                />
                <Area 
                  type="monotone" dataKey="total" 
                  stroke="#6366f1" strokeWidth={4} 
                  fillOpacity={1} fill="url(#zenithGradient)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="zenith-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>{t('popular_items')}</h3>
            <button className="btn-zenith btn-zenith-outline" style={{ padding: '0.4rem', borderRadius: '10px' }}><Filter size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data?.topProducts?.map((product: any, index: number) => (
              <motion.div 
                key={index} 
                whileHover={{ x: isRTL ? -10 : 10, background: 'var(--glass-bg)' }}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', 
                  borderRadius: '20px', transition: 'all 0.3s ease', cursor: 'pointer'
                }}
              >
                <div style={{ 
                  width: '48px', height: '48px', background: 'rgba(255,255,255,0.04)', 
                  borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: 'var(--text-main)', fontWeight: '800', fontSize: '1rem', border: '1px solid var(--glass-bg)' 
                }}>{index + 1}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>{product.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>{product.soldCount} sales • <span className="mono">{product.price} MAD</span></p>
                </div>
                <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                   <p className="mono" style={{ fontWeight: '800', fontSize: '1.125rem', color: '#818cf8' }}>{(product.price * product.soldCount).toLocaleString()} MAD</p>
                </div>
              </motion.div>
            ))}
          </div>
          <button className="btn-zenith btn-zenith-outline" style={{ width: '100%', marginTop: '2rem', justifyContent: 'center' }}>
            {t('view_all_products')} <ChevronRight size={16} />
          </button>
        </motion.div>
      </div>

      {/* Recent Transactions Table */}
      <motion.div variants={itemVariants} className="zenith-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.75rem 2rem', borderBottom: '1px solid var(--glass-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>{t('recent_transactions')}</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Real-time order tracking system</p>
          </div>
          <button className="btn-zenith btn-zenith-outline"><Activity size={18} /> Pulse View</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
            <thead>
              <tr style={{ background: 'var(--glass-bg)' }}>
                {[t('reference'), t('customer'), t('amount'), t('status'), t('date')].map((h, i) => (
                  <th key={i} style={{ padding: '1.25rem 2rem', fontWeight: '700', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.recentOrders?.map((order: any, idx: number) => (
                <motion.tr 
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                  style={{ borderBottom: '1px solid var(--glass-bg)', transition: 'background 0.2s' }}
                >
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <span className="mono" style={{ fontSize: '0.875rem', fontWeight: '700', color: '#6366f1' }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden',
                        backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontSize: '0.8125rem', fontWeight: '800', color: 'var(--text-main)' 
                      }}>
                        {order.customer.avatar ? (
                          <img src={order.customer.avatar} alt={order.customer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          order.customer.name.charAt(0)
                        )}
                      </div>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>{order.customer.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <span className="mono" style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1rem' }}>{order.total.toLocaleString()} MAD</span>
                  </td>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : 'badge-warning'}`} style={{ borderRadius: '10px', fontSize: '0.65rem' }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '1.5rem 2rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>
                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
