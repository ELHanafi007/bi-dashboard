import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Search, ExternalLink, Clock, CheckCircle2, XCircle, Truck,
  User, Package, CreditCard, Save, AlertCircle, Plus, FileText, Filter
} from 'lucide-react';
import Modal from '../components/Modal';
import Skeleton from '../components/Skeleton';
import ReceiptGenerator from '../components/ReceiptGenerator';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const Orders: React.FC = () => {
  const queryClient = useQueryClient();
  const { t, isRTL } = useLanguage();
  const isMobile = window.innerWidth < 1024;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customerId: '',
    items: [] as { productId: string; quantity: number; price: number; name: string }[],
    isCredit: false,
    paidAmount: ''
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => { const r = await api.get('/orders'); return r.data; }
  });
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => { const r = await api.get('/customers'); return r.data; },
    enabled: isCreateModalOpen
  });
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => { const r = await api.get('/products'); return r.data; },
    enabled: isCreateModalOpen
  });
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => { const r = await api.get('/settings'); return r.data; }
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => api.post('/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(t('order_created'));
      setIsCreateModalOpen(false);
      resetCreateForm();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed')
  });

  const resetCreateForm = () => setOrderForm({ customerId: '', items: [], isCredit: false, paidAmount: '' });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(t('order_status_updated'));
      setIsModalOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed')
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = orders?.filter((o: any) => {
    const matchesSearch = o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil((filteredOrders?.length || 0) / itemsPerPage);
  const currentOrders = filteredOrders?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenOrder = (order: any) => { setSelectedOrder(order); setNewStatus(order.status); setIsModalOpen(true); };
  const handleUpdateStatus = () => { if (!selectedOrder || newStatus === selectedOrder.status) return; updateStatusMutation.mutate({ id: selectedOrder.id, status: newStatus }); };
  const handleOpenReceipt = (order: any) => { setReceiptOrder(order); setIsReceiptOpen(true); };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DELIVERED': return { class: 'badge-success', icon: <CheckCircle2 size={12} /> };
      case 'SHIPPED': return { class: 'badge-primary', icon: <Truck size={12} /> };
      case 'PENDING': return { class: 'badge-warning', icon: <Clock size={12} /> };
      case 'CANCELLED': return { class: 'badge-error', icon: <XCircle size={12} /> };
      default: return { class: 'badge', icon: null };
    }
  };

  if (isLoading) return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <Skeleton width={300} height="3rem" />
      <Skeleton height="600px" borderRadius="32px" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1.5rem' : 0 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.04em' }}>{t('orders_title')}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: isMobile ? '0.9rem' : '1.05rem' }}>{t('orders_subtitle')}</p>
        </div>
        <button onClick={() => { resetCreateForm(); setIsCreateModalOpen(true); }} className="btn-zenith btn-zenith-primary" style={{ padding: '0.85rem 1.5rem', width: isMobile ? '100%' : 'auto' }}>
          <ShoppingCart size={20} /> {t('create_new_order')}
        </button>
      </div>

      {/* Filters */}
      <div className="zenith-card" style={{ marginBottom: '2.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '300px' }}>
            <Search size={18} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder={t('search_orders')} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="zenith-input" style={{ paddingLeft: isRTL ? '1.25rem' : '3.5rem', paddingRight: isRTL ? '3.5rem' : '1.25rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
            {[{ key: 'All', label: t('all') }, { key: 'PENDING', label: t('pending') }, { key: 'SHIPPED', label: t('shipped') }, { key: 'DELIVERED', label: t('delivered') }, { key: 'CANCELLED', label: t('cancelled') }].map(({ key, label }) => (
              <button key={key} onClick={() => { setStatusFilter(key); setCurrentPage(1); }}
                className={`btn-zenith ${statusFilter === key ? 'btn-zenith-primary' : 'btn-zenith-outline'}`}
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="zenith-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
            <thead>
              <tr style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--border)' }}>
                {[t('order_id'), t('customer'), t('items'), t('total'), t('status'), t('date'), ''].map((h, i) => (
                  <th key={i} style={{ padding: '1.25rem 1.5rem', fontWeight: '800', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {currentOrders?.map((order: any, idx: number) => {
                  const status = getStatusStyle(order.status);
                  return (
                    <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="mono" style={{ padding: '1.5rem', fontSize: '0.875rem', fontWeight: '700', color: '#818cf8' }}>#{order.id.slice(0, 8)}</td>
                      <td style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--border), var(--glass-bg))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-main)', border: '1px solid var(--border)' }}>{order.customer.name.charAt(0)}</div>
                          <div>
                            <p style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>{order.customer.name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>{order.items.length} {order.items.length === 1 ? t('item') : t('items_plural')}</td>
                      <td className="mono" style={{ padding: '1.5rem', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>{order.total.toLocaleString()} MAD</td>
                      <td style={{ padding: '1.5rem' }}>
                        <span className={`badge ${status.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem' }}>
                          {status.icon} {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleOpenReceipt(order)} className="btn-zenith btn-zenith-outline" style={{ padding: '0.6rem', borderRadius: '10px', color: '#10b981' }}><FileText size={16} /></button>
                          <button onClick={() => handleOpenOrder(order)} className="btn-zenith btn-zenith-outline" style={{ padding: '0.6rem', borderRadius: '10px' }}><ExternalLink size={16} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'var(--glass-bg)', borderTop: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Showing <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{(currentPage - 1) * itemsPerPage + 1}</span> to <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{Math.min(currentPage * itemsPerPage, filteredOrders?.length || 0)}</span> of <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{filteredOrders?.length}</span> results
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="btn-zenith btn-zenith-outline" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', margin: '0 0.5rem' }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage <= 3 ? i + 1 : (currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i);
                  if (pageNum < 1) pageNum = i + 1;
                  if (pageNum > totalPages) return null;
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`btn-zenith ${currentPage === pageNum ? 'btn-zenith-primary' : 'btn-zenith-outline'}`}
                      style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center', fontSize: '0.8125rem' }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="btn-zenith btn-zenith-primary" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${t('order_details')} #${selectedOrder?.id.slice(0, 8)}`}>
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-bg)' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>{t('order_status')}</p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="zenith-input" style={{ width: 'auto', minWidth: '160px', padding: '0.6rem 1rem' }}>
                    {['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (<option key={s} value={s}>{s}</option>))}
                  </select>
                  {newStatus !== selectedOrder.status && (
                    <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={handleUpdateStatus}
                      className="btn-zenith btn-zenith-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.8125rem' }}>
                      <Save size={14} /> {t('update')}
                    </motion.button>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>{t('order_date')}</p>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '24px', border: '1px solid var(--glass-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#818cf8' }}><User size={20} /><span style={{ fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('customer')}</span></div>
                <p style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.1rem' }}>{selectedOrder.customer.name}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{selectedOrder.customer.email}</p>
              </div>
              <div style={{ padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '24px', border: '1px solid var(--glass-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#10b981' }}><CreditCard size={20} /><span style={{ fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('payment')}</span></div>
                <p className="mono" style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.5rem' }}>{selectedOrder.total.toLocaleString()} MAD</p>
                <p style={{ fontSize: '0.875rem', color: selectedOrder.paymentStatus === 'PAID' ? '#10b981' : '#ef4444', marginTop: '0.25rem', fontWeight: '700' }}>
                  {selectedOrder.paymentStatus === 'PAID' ? t('paid') : (selectedOrder.paymentStatus === 'PARTIAL' ? t('partial') : t('unpaid'))}
                  {selectedOrder.paymentStatus !== 'PAID' && ` (${selectedOrder.paidAmount} MAD ${t('paid_amount')})`}
                </p>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', color: 'var(--text-muted)' }}><Package size={20} /><span style={{ fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('ordered_items')}</span></div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'var(--glass-bg)', borderRadius: '20px', border: '1px solid var(--glass-bg)' }}>
                    <div>
                      <p style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1rem' }}>{item.product.name}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{t('qty')}: {item.quantity} × {item.price} MAD</p>
                    </div>
                    <p className="mono" style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.1rem' }}>{(item.quantity * item.price).toLocaleString()} MAD</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.status === 'CANCELLED' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '20px', color: '#ef4444' }}>
                <AlertCircle size={24} /><p style={{ fontSize: '0.95rem', fontWeight: '700' }}>{t('order_cancelled_msg')}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => { setIsModalOpen(false); handleOpenReceipt(selectedOrder); }} className="btn-zenith btn-zenith-primary" style={{ flex: 1, padding: '1rem', justifyContent: 'center' }}>
                <FileText size={20} /> {t('print_receipt')}
              </button>
              <button className="btn-zenith btn-zenith-outline" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '1rem', justifyContent: 'center' }}>
                {t('close_details')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Order Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t('create_new_order')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.65rem', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)' }}>{t('select_customer')}</label>
            <select value={orderForm.customerId} onChange={(e) => setOrderForm({ ...orderForm, customerId: e.target.value })} className="zenith-input">
              <option value="">{t('choose_customer')}</option>
              {customers?.map((c: any) => (<option key={c.id} value={c.id}>{c.name} ({c.email})</option>))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.65rem', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)' }}>{t('add_products')}</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select id="product-select" className="zenith-input" style={{ flex: 1 }}>
                <option value="">{t('select_product')}</option>
                {products?.filter((p: any) => p.stock > 0).map((p: any) => (<option key={p.id} value={JSON.stringify(p)}>{p.name} - {p.price} MAD ({p.stock} {t('in_stock')})</option>))}
              </select>
              <button onClick={() => {
                const select = document.getElementById('product-select') as HTMLSelectElement;
                if (!select.value) return;
                const product = JSON.parse(select.value);
                const existing = orderForm.items.find(i => i.productId === product.id);
                if (existing) { setOrderForm({ ...orderForm, items: orderForm.items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i) }); }
                else { setOrderForm({ ...orderForm, items: [...orderForm.items, { productId: product.id, name: product.name, price: product.price, quantity: 1 }] }); }
                select.value = '';
              }} className="btn-zenith btn-zenith-primary" style={{ padding: '0.85rem' }}><Plus size={20} /></button>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('items_in_order')}</p>
            <div style={{ display: 'grid', gap: '1rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {orderForm.items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--glass-bg)', borderRadius: '24px', color: 'var(--text-muted)' }}>{t('no_items_yet')}</div>
              ) : orderForm.items.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'var(--glass-bg)', borderRadius: '20px', border: '1px solid var(--glass-bg)' }}>
                  <div style={{ flex: 1 }}><p style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>{item.name}</p><p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{item.price} MAD {t('each')}</p></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                      <button onClick={() => { if (item.quantity > 1) setOrderForm({ ...orderForm, items: orderForm.items.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity - 1 } : i) }); else setOrderForm({ ...orderForm, items: orderForm.items.filter(i => i.productId !== item.productId) }); }}
                        style={{ padding: '0.4rem 0.75rem', background: 'var(--glass-bg)', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>-</button>
                      <span className="mono" style={{ padding: '0.4rem 1rem', fontSize: '0.95rem', fontWeight: '800', background: 'var(--glass-bg)', color: 'var(--text-main)' }}>{item.quantity}</span>
                      <button onClick={() => setOrderForm({ ...orderForm, items: orderForm.items.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i) })}
                        style={{ padding: '0.4rem 0.75rem', background: 'var(--glass-bg)', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>+</button>
                    </div>
                    <p className="mono" style={{ fontWeight: '800', width: '70px', textAlign: 'right', color: 'var(--text-main)' }}>{(item.quantity * item.price).toLocaleString()} MAD</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '24px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: '800', color: '#818cf8', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>{t('total_amount')}</span>
              <span className="mono" style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{orderForm.items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()} MAD</span>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: orderForm.isCredit ? '1rem' : 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-main)', fontWeight: '600' }}>
                <input type="checkbox" checked={orderForm.isCredit} onChange={(e) => setOrderForm({ ...orderForm, isCredit: e.target.checked })} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                {t('partial')} / {t('unpaid')}
              </label>
            </div>
            {orderForm.isCredit && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)' }}>{t('paid_amount')} (MAD)</label>
                <input type="number" value={orderForm.paidAmount} onChange={(e) => setOrderForm({ ...orderForm, paidAmount: e.target.value })} className="zenith-input" placeholder="0" />
              </div>
            )}
          </div>
          <button 
            disabled={!orderForm.customerId || orderForm.items.length === 0}
            onClick={() => { 
              const total = orderForm.items.reduce((acc, item) => acc + (item.price * item.quantity), 0); 
              const paidAmount = orderForm.isCredit ? (parseFloat(orderForm.paidAmount) || 0) : total;
              const paymentStatus = orderForm.isCredit ? (paidAmount > 0 ? 'PARTIAL' : 'UNPAID') : 'PAID';
              createOrderMutation.mutate({ customerId: orderForm.customerId, items: orderForm.items, total, paidAmount, paymentStatus }); 
            }}
            className="btn-zenith btn-zenith-primary" style={{ width: '100%', padding: '1.1rem', marginTop: '1rem', justifyContent: 'center' }}>
            {createOrderMutation.isPending ? t('creating_order') : t('confirm_create_order')}
          </button>
        </div>
      </Modal>

      {/* Receipt Generator */}
      <ReceiptGenerator isOpen={isReceiptOpen} onClose={() => setIsReceiptOpen(false)} order={receiptOrder} businessInfo={settings} />
    </motion.div>
  );
};

export default Orders;

