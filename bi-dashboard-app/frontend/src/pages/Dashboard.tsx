import Skeleton from '../components/Skeleton';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { motion } from 'framer-motion';
import Skeleton from '../components/Skeleton';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  ArrowUpRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard');
      return response.data;
    }
  });

  const { data: salesData } = useQuery({
    queryKey: ['sales-analytics'],
    queryFn: async () => {
      const response = await api.get('/analytics/sales');
      return response.data;
    }
  });

import Skeleton from '../components/Skeleton';

  if (isLoading) return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <Skeleton width={200} height="2.5rem" />
          <Skeleton width={300} height="1rem" style={{ marginTop: '0.5rem' }} />
        </div>
        <Skeleton width={150} height="2.5rem" />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {[1,2,3,4].map(i => <Skeleton key={i} height="120px" />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <Skeleton height="350px" />
        <Skeleton height="350px" />
      </div>

      <Skeleton height="400px" />
    </div>
  );
  
  if (error) return <div className="card" style={{ color: 'var(--danger)', textAlign: 'center' }}>Error loading dashboard data.</div>;

  const summaryItems = [
    { label: 'Total Revenue', value: `$${data?.summary?.totalRevenue?.toLocaleString()}`, icon: <DollarSign size={20} />, color: '#3b82f6', trend: '+12.5%' },
    { label: 'Total Orders', value: data?.summary?.totalOrders, icon: <ShoppingCart size={20} />, color: '#10b981', trend: '+5.2%' },
    { label: 'Total Customers', value: data?.summary?.totalCustomers, icon: <Users size={20} />, color: '#f59e0b', trend: '+8.1%' },
    { label: 'Total Products', value: data?.summary?.totalProducts, icon: <Package size={20} />, color: '#8b5cf6', trend: '+2.4%' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>Dashboard</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Welcome back to your business overview.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn btn-primary"
          style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)', gap: '0.5rem' }}
        >
          <TrendingUp size={18} />
          Generate Report
        </motion.button>
      </div>
      
      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {summaryItems.map((item, index) => (
          <motion.div 
            key={index}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              border: '1px solid #f1f5f9',
              transition: 'box-shadow 0.3s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ 
                backgroundColor: `${item.color}10`, 
                color: item.color,
                padding: '0.75rem',
                borderRadius: '12px'
              }}>
                {item.icon}
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem', 
                color: '#10b981', 
                fontSize: '0.75rem', 
                fontWeight: '600',
                backgroundColor: '#10b98110',
                padding: '0.25rem 0.5rem',
                borderRadius: '9999px'
              }}>
                <ArrowUpRight size={12} />
                {item.trend}
              </div>
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>{item.label}</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginTop: '0.25rem' }}>{item.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Sales Chart */}
        <motion.div variants={itemVariants} className="card" style={{ border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>Revenue Growth</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Daily revenue for the last 30 days</p>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '8px', display: 'flex', gap: '0.5rem' }}>
              <button style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>Daily</button>
              <button style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>Monthly</button>
            </div>
          </div>
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div variants={itemVariants} className="card" style={{ border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Popular Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {data?.topProducts?.map((product: any, index: number) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', fontSize: '0.9375rem', color: '#1e293b' }}>{product.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{product.soldCount} units • ${product.price}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '700', fontSize: '0.9375rem', color: '#0f172a' }}>${(product.price * product.soldCount).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <button style={{ 
            width: '100%', 
            marginTop: '2rem', 
            padding: '0.75rem', 
            borderRadius: '10px', 
            backgroundColor: '#f8fafc', 
            color: '#3b82f6', 
            fontWeight: '600',
            fontSize: '0.875rem'
          }}>
            View All Products
          </button>
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      <motion.div variants={itemVariants} className="card" style={{ border: '1px solid #f1f5f9', overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>Recent Transactions</h3>
          <Activity size={18} style={{ color: '#94a3b8' }} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reference</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentOrders?.map((order: any) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} className="hover-row">
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#3b82f6' }}>#{order.id.slice(0, 8)}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>
                        {order.customer.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: '500', color: '#1e293b' }}>{order.customer.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: '700', color: '#0f172a' }}>${order.total.toLocaleString()}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.375rem 0.75rem', 
                      borderRadius: '8px', 
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: order.status === 'DELIVERED' ? '#d1fae5' : '#fef3c7',
                      color: order.status === 'DELIVERED' ? '#059669' : '#d97706'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;

