import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, Download, PieChart as PieChartIcon } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Analytics: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const isMobile = window.innerWidth < 1024;
  const { data: salesData, isLoading: salesLoading } = useQuery({ queryKey: ['sales-analytics'], queryFn: async () => { const r = await api.get('/analytics/sales'); return r.data; } });
  const { data: categoryData, isLoading: catLoading } = useQuery({ queryKey: ['category-analytics'], queryFn: async () => { const r = await api.get('/analytics/categories'); return r.data; } });

  if (salesLoading || catLoading) return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%' }} /></div>);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1.5rem' : 0 }}>
        <div><h1 style={{ fontSize: isMobile ? '1.75rem' : '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>{t('analytics_title')}</h1><p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: isMobile ? '0.9rem' : '1rem' }}>{t('analytics_subtitle')}</p></div>
        <div style={{ display: 'flex', gap: '0.75rem', width: isMobile ? '100%' : 'auto' }}>
          <button className="btn-zenith btn-zenith-outline" style={{ flex: 1, justifyContent: 'center' }}><Calendar size={18} /> {t('last_30_days')}</button>
          <button className="btn-zenith btn-zenith-primary" style={{ flex: 1, justifyContent: 'center' }}><Download size={18} /> {t('export_report')}</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="zenith-card" style={{ padding: isMobile ? '1.25rem' : '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div><h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)' }}>{t('revenue_over_time')}</h3><p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('daily_transaction_volume')}</p></div>
            <TrendingUp size={20} style={{ color: '#3b82f6' }} />
          </div>
          <div style={{ height: isMobile ? '280px' : '350px', width: '100%', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs><linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-bg)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} reversed={isRTL} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} orientation={isRTL ? 'right' : 'left'} />
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }} />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="zenith-card" style={{ padding: isMobile ? '1.25rem' : '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div><h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)' }}>{t('category_performance')}</h3><p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('sales_by_category')}</p></div>
            <PieChartIcon size={20} style={{ color: '#10b981' }} />
          </div>
          <div style={{ height: isMobile ? '280px' : '350px', width: '100%', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={isMobile ? 60 : 80} outerRadius={isMobile ? 90 : 120} paddingAngle={5} dataKey="totalSalesCount" nameKey="name">
                {categoryData?.map((_: any, index: number) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie><Tooltip /><Legend verticalAlign="bottom" height={36} /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="zenith-card" style={{ padding: isMobile ? '1.25rem' : '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div><h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)' }}>{t('product_density')}</h3><p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('products_in_category')}</p></div>
          <BarChart3 size={20} style={{ color: '#8b5cf6' }} />
        </div>
        <div style={{ height: isMobile ? '250px' : '300px', width: '100%', minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-bg)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} orientation={isRTL ? 'right' : 'left'} />
              <Tooltip cursor={{fill: 'var(--glass-bg)'}} contentStyle={{ background: '#0f172a', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }} />
              <Bar dataKey="totalProducts" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={isMobile ? 30 : 40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;
