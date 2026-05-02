import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Search, 
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  User,
  Package,
  Calendar,
  CreditCard,
  Save,
  AlertCircle
} from 'lucide-react';
import Modal from '../components/Modal';
import Skeleton from '../components/Skeleton';
import { toast } from 'react-hot-toast';

const Orders: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Create Order state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customerId: '',
    items: [] as { productId: string; quantity: number; price: number; name: string }[]
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get('/orders');
      return response.data;
    }
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await api.get('/customers');
      return response.data;
    },
    enabled: isCreateModalOpen
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data;
    },
    enabled: isCreateModalOpen
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => api.post('/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order created successfully!');
      setIsCreateModalOpen(false);
      resetCreateForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create order');
    }
  });

  const resetCreateForm = () => {
    setOrderForm({ customerId: '', items: [] });
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      api.put(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated!');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  const filteredOrders = orders?.filter((o: any) => {
    const matchesSearch = o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenOrder = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder || newStatus === selectedOrder.status) return;
    updateStatusMutation.mutate({ id: selectedOrder.id, status: newStatus });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'DELIVERED': return { bg: '#d1fae5', text: '#059669', icon: <CheckCircle2 size={14} /> };
      case 'SHIPPED': return { bg: '#dbeafe', text: '#2563eb', icon: <Truck size={14} /> };
      case 'PENDING': return { bg: '#fef3c7', text: '#d97706', icon: <Clock size={14} /> };
      case 'CANCELLED': return { bg: '#fef2f2', text: '#ef4444', icon: <XCircle size={14} /> };
      default: return { bg: '#f1f5f9', text: '#64748b', icon: null };
    }
  };

  if (isLoading) return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <Skeleton width={200} height="2.5rem" />
      </div>
      <Skeleton height="500px" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>Orders</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Track and manage customer transactions.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            resetCreateForm();
            setIsCreateModalOpen(true);
          }}
          className="btn btn-primary"
          style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
        >
          <ShoppingCart size={18} />
          Create New Order
        </motion.button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by customer or order ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                outline: 'none',
                fontSize: '0.9375rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['All', 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '0.625rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  backgroundColor: statusFilter === status ? '#0f172a' : 'white',
                  color: statusFilter === status ? 'white' : '#64748b',
                  border: '1px solid',
                  borderColor: statusFilter === status ? '#0f172a' : '#e2e8f0',
                  transition: 'all 0.2s'
                }}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Order ID</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Items</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem' }}></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredOrders?.map((order: any) => {
                  const status = getStatusInfo(order.status);
                  return (
                    <motion.tr layout key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#3b82f6' }}>
                        #{order.id.slice(0, 8)}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>
                            {order.customer.name.charAt(0)}
                          </div>
                          <span style={{ fontWeight: '500', color: '#1e293b' }}>{order.customer.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: '700', color: '#0f172a' }}>
                        ${order.total.toLocaleString()}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '8px', 
                          fontSize: '0.75rem', fontWeight: '700', backgroundColor: status.bg, color: status.text
                        }}>
                          {status.icon}
                          {order.status}
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleOpenOrder(order)}
                          style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <ExternalLink size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Order Details #${selectedOrder?.id.slice(0, 8)}`}
      >
        {selectedOrder && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem' }}>ORDER STATUS</p>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      backgroundColor: '#f8fafc',
                      outline: 'none'
                    }}
                  >
                    {['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {newStatus !== selectedOrder.status && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={handleUpdateStatus}
                      disabled={updateStatusMutation.isLoading}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem'
                      }}
                    >
                      <Save size={14} />
                      Update
                    </motion.button>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>DATE</p>
                <p style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#0f172a', marginTop: '0.25rem' }}>
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#3b82f6' }}>
                  <User size={16} />
                  <span style={{ fontWeight: '700', fontSize: '0.75rem' }}>CUSTOMER</span>
                </div>
                <p style={{ fontWeight: '700', color: '#0f172a' }}>{selectedOrder.customer.name}</p>
                <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>{selectedOrder.customer.email}</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#10b981' }}>
                  <CreditCard size={16} />
                  <span style={{ fontWeight: '700', fontSize: '0.75rem' }}>PAYMENT</span>
                </div>
                <p style={{ fontWeight: '700', color: '#0f172a' }}>Total: ${selectedOrder.total.toLocaleString()}</p>
                <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>Credit Card</p>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#64748b' }}>
                <Package size={16} />
                <span style={{ fontWeight: '700', fontSize: '0.75rem' }}>ORDERED ITEMS</span>
              </div>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid #f1f5f9', borderRadius: '10px' }}>
                    <div>
                      <p style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>{item.product.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {item.quantity} × ${item.price}</p>
                    </div>
                    <p style={{ fontWeight: '700', color: '#0f172a' }}>${(item.quantity * item.price).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.status === 'CANCELLED' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#ef4444' }}>
                <AlertCircle size={20} />
                <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>This order has been cancelled.</p>
              </div>
            )}

            <button 
              className="btn" 
              style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', fontWeight: '700', marginTop: '1rem', backgroundColor: '#f8fafc', color: '#64748b' }}
              onClick={() => setIsModalOpen(false)}
            >
              Close Details
            </button>
          </div>
        )}
      </Modal>

      {/* Create Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Order"
      >
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
              Select Customer
            </label>
            <select
              value={orderForm.customerId}
              onChange={(e) => setOrderForm({ ...orderForm, customerId: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
            >
              <option value="">-- Choose a customer --</option>
              {customers?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
              Add Products
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                id="product-select"
                style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
              >
                <option value="">-- Select Product --</option>
                {products?.filter((p: any) => p.stock > 0).map((p: any) => (
                  <option key={p.id} value={JSON.stringify(p)}>{p.name} - ${p.price} ({p.stock} in stock)</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const select = document.getElementById('product-select') as HTMLSelectElement;
                  if (!select.value) return;
                  const product = JSON.parse(select.value);
                  const existingItem = orderForm.items.find(i => i.productId === product.id);
                  if (existingItem) {
                    setOrderForm({
                      ...orderForm,
                      items: orderForm.items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)
                    });
                  } else {
                    setOrderForm({
                      ...orderForm,
                      items: [...orderForm.items, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]
                    });
                  }
                  select.value = '';
                }}
                className="btn btn-primary"
                style={{ padding: '0.75rem' }}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase' }}>Items in Order</p>
            <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', padding: '2px' }}>
              {orderForm.items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed #f1f5f9', borderRadius: '12px', color: '#94a3b8' }}>
                  No items added yet.
                </div>
              ) : (
                orderForm.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid #f1f5f9', borderRadius: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>{item.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b' }}>${item.price} each</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                        <button 
                          onClick={() => {
                            if (item.quantity > 1) {
                              setOrderForm({
                                ...orderForm,
                                items: orderForm.items.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity - 1 } : i)
                              });
                            } else {
                              setOrderForm({
                                ...orderForm,
                                items: orderForm.items.filter(i => i.productId !== item.productId)
                              });
                            }
                          }}
                          style={{ padding: '0.25rem 0.5rem', background: '#f8fafc', border: 'none', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', fontWeight: '700' }}>{item.quantity}</span>
                        <button 
                          onClick={() => {
                            setOrderForm({
                              ...orderForm,
                              items: orderForm.items.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i)
                            });
                          }}
                          style={{ padding: '0.25rem 0.5rem', background: '#f8fafc', border: 'none', cursor: 'pointer' }}
                        >
                          +
                        </button>
                      </div>
                      <p style={{ fontWeight: '700', width: '60px', textAlign: 'right' }}>${(item.quantity * item.price).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ marginTop: '0.5rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', color: '#64748b' }}>Total Amount</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>
              ${orderForm.items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!orderForm.customerId || orderForm.items.length === 0 || createOrderMutation.isLoading}
            onClick={() => {
              const total = orderForm.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
              createOrderMutation.mutate({
                customerId: orderForm.customerId,
                items: orderForm.items,
                total
              });
            }}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontWeight: '700', marginTop: '0.5rem' }}
          >
            {createOrderMutation.isLoading ? 'Creating Order...' : 'Confirm & Create Order'}
          </motion.button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Orders;
