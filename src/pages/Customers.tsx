import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Mail, Phone, ShoppingBag, CreditCard, UserPlus, Star, ChevronRight, Edit2, Trash2, User as UserIcon, Save, Wallet, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';
import { toast } from 'react-hot-toast';
import { exportToCSV } from '../utils/exportUtils';
import { useLanguage } from '../context/LanguageContext';

const Customers: React.FC = () => {
  const queryClient = useQueryClient();
  const { t, isRTL } = useLanguage();
  const isMobile = window.innerWidth < 1024;
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const { data: customers, isLoading } = useQuery({ queryKey: ['customers'], queryFn: async () => { const r = await api.get('/customers'); return r.data; } });

  const upsertMutation = useMutation({
    mutationFn: (data: any) => currentCustomer ? api.put(`/customers/${currentCustomer.id}`, data) : api.post('/customers', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); setIsModalOpen(false); toast.success(currentCustomer ? t('customer_updated') : t('customer_added')); resetForm(); },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Something went wrong')
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); toast.success(t('customer_removed')); }
  });
  const paymentMutation = useMutation({
    mutationFn: (data: { id: string, amount: number }) => api.post(`/customers/${data.id}/payment`, { amount: data.amount }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); setIsPaymentModalOpen(false); toast.success(t('payment_successful')); setPaymentAmount(''); },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to process payment')
  });

  const handleOpenModal = (customer?: any) => {
    if (customer) { setCurrentCustomer(customer); setFormData({ name: customer.name, email: customer.email, phone: customer.phone || '' }); }
    else { setCurrentCustomer(null); resetForm(); }
    setIsModalOpen(true);
  };
  const resetForm = () => setFormData({ name: '', email: '', phone: '' });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); upsertMutation.mutate(formData); };
  const handleExport = () => {
    if (!customers) return;
    exportToCSV(customers.map((c: any) => ({ Name: c.name, Email: c.email, Phone: c.phone || 'N/A', 'Total Spent': c.totalSpending, Debt: c.debt || 0, Orders: c._count.orders })), 'customers_report');
    toast.success(t('exporting_data'));
  };

  const handleOpenPayment = (customer: any) => {
    setCurrentCustomer(customer);
    setPaymentAmount(customer.debt?.toString() || '0');
    setIsPaymentModalOpen(true);
  };
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return toast.error('Invalid amount');
    paymentMutation.mutate({ id: currentCustomer.id, amount: parseFloat(paymentAmount) });
  };

  const filteredCustomers = customers?.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const topCustomers = [...(customers || [])].sort((a: any, b: any) => b.totalSpending - a.totalSpending).slice(0, 3);

  if (isLoading) return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%' }} /></div>);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1.5rem' : 0 }}>
        <div><h1 style={{ fontSize: isMobile ? '1.75rem' : '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>{t('customers_title')}</h1><p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: isMobile ? '0.9rem' : '1rem' }}>{t('customers_subtitle')}</p></div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleOpenModal()} className="btn btn-primary" style={{ boxShadow: '0 4px 12px rgba(59,130,246,0.25)', gap: '0.5rem', padding: '0.75rem 1.25rem', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}><UserPlus size={18} /> {t('add_customer')}</motion.button>
      </div>

      {/* Top Customers */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {topCustomers.map((customer: any, index: number) => (
          <motion.div key={`top-${customer.id}`} whileHover={{ y: -5 }} className="card" style={{ background: index === 0 ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : undefined, color: index === 0 ? 'white' : undefined, position: 'relative', overflow: 'hidden' }}>
            {index === 0 && <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }}><Star size={120} fill="white" /></div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: index === 0 ? '#3b82f6' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: index === 0 ? 'white' : '#64748b' }}>{customer.name.charAt(0)}</div>
              <div><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><h3 style={{ fontWeight: '700', fontSize: '1.125rem' }}>{customer.name}</h3>{index === 0 && <Star size={14} fill="#f59e0b" color="#f59e0b" />}</div><p style={{ fontSize: '0.875rem', color: index === 0 ? '#94a3b8' : '#64748b' }}>{t('vip_customer')}</p></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: index === 0 ? 'var(--glass-bg)' : '#f8fafc', padding: '0.75rem', borderRadius: '12px' }}><p style={{ fontSize: '0.75rem', fontWeight: '600', color: index === 0 ? '#94a3b8' : '#64748b', marginBottom: '0.25rem' }}>{t('total_spent')}</p><p style={{ fontSize: '1.125rem', fontWeight: '800' }}>{customer.totalSpending.toLocaleString()} MAD</p></div>
              <div style={{ backgroundColor: index === 0 ? 'var(--glass-bg)' : '#f8fafc', padding: '0.75rem', borderRadius: '12px' }}><p style={{ fontSize: '0.75rem', fontWeight: '600', color: index === 0 ? '#94a3b8' : '#64748b', marginBottom: '0.25rem' }}>{t('orders_count')}</p><p style={{ fontSize: '1.125rem', fontWeight: '800' }}>{customer._count.orders}</p></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder={t('search_customers')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: `0.625rem 1rem 0.625rem ${isRTL ? '1rem' : '2.75rem'}`, paddingRight: isRTL ? '2.75rem' : '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: 'var(--bg-main)', outline: 'none', fontSize: '0.875rem' }} />
          </div>
          <button onClick={handleExport} style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>{t('export_data')} <ChevronRight size={16} /></button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
            <thead><tr style={{ backgroundColor: 'var(--input-bg)' }}>
              {[t('customer'), t('contact_info'), t('total_orders_col'), t('total_revenue_col'), t('debt'), t('actions')].map((h, i) => (
                <th key={i} style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              <AnimatePresence>
                {filteredCustomers?.map((customer: any) => (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={customer.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '44px', height: '44px', 
                          borderRadius: '14px', overflow: 'hidden',
                          border: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontWeight: 'bold', color: '#3b82f6', background: 'var(--bg-main)'
                        }}>
                          {customer.avatar ? (
                            <img src={customer.avatar} alt={customer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            customer.name.charAt(0)
                          )}
                        </div>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{customer.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}><div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}><Mail size={14} />{customer.email}</div>{customer.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}><Phone size={14} />{customer.phone}</div>}</div></td>
                    <td style={{ padding: '1.25rem 1.5rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}><ShoppingBag size={16} style={{ color: 'var(--text-muted)' }} />{customer._count.orders}</div></td>
                    <td style={{ padding: '1.25rem 1.5rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: 'var(--text-main)' }}><CreditCard size={16} style={{ color: 'var(--text-muted)' }} />{customer.totalSpending.toLocaleString()} MAD</div></td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: customer.debt > 0 ? '#ef4444' : '#10b981' }}>
                        <Wallet size={16} />
                        {customer.debt ? customer.debt.toLocaleString() : '0'} MAD
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}><div style={{ display: 'flex', gap: '0.5rem' }}>
                      {customer.debt > 0 && (
                        <button onClick={() => handleOpenPayment(customer)} title={t('settle_debt')} style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.4rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}><Wallet size={18} /></button>
                      )}
                      <button onClick={() => handleOpenModal(customer)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={18} /></button><button onClick={() => { if (window.confirm(t('are_you_sure'))) deleteMutation.mutate(customer.id); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button></div></td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentCustomer ? t('edit_customer') : t('add_new_customer')}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>{t('full_name')}</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} /></div>
          <div style={{ marginBottom: '1.25rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>{t('email_address')}</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} /></div>
          <div style={{ marginBottom: '2rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>{t('phone_number')}</label><input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} /></div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', fontWeight: '700', gap: '0.5rem' }} disabled={upsertMutation.isPending}><Save size={18} /> {upsertMutation.isPending ? t('processing') : (currentCustomer ? t('edit_customer') : t('add_customer'))}</motion.button>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={t('settle_debt')}>
        {currentCustomer && (
          <form onSubmit={handlePaymentSubmit}>
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <AlertCircle size={24} color="#ef4444" />
              <div>
                <p style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: '600' }}>{t('outstanding_debt')}</p>
                <p style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>{currentCustomer.debt?.toLocaleString()} MAD</p>
              </div>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>{t('payment_amount')} (MAD)</label>
              <input type="number" step="0.01" max={currentCustomer.debt} min="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1.125rem', fontWeight: '600' }} />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', fontWeight: '700', gap: '0.5rem', background: '#10b981' }} disabled={paymentMutation.isPending}>
              <Wallet size={18} /> {paymentMutation.isPending ? t('processing') : t('record_payment')}
            </motion.button>
          </form>
        )}
      </Modal>
    </motion.div>
  );
};

export default Customers;
