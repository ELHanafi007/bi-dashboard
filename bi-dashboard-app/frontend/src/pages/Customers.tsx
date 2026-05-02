import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  ShoppingBag, 
  CreditCard,
  UserPlus,
  Star,
  ChevronRight,
  Edit2,
  Trash2,
  User as UserIcon,
  Save
} from 'lucide-react';
import Modal from '../components/Modal';
import { toast } from 'react-hot-toast';
import { exportToCSV } from '../utils/exportUtils';

const Customers: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await api.get('/customers');
      return response.data;
    }
  });

  const upsertMutation = useMutation({
    mutationFn: (data: any) => {
      if (currentCustomer) {
        return api.put(`/customers/${currentCustomer.id}`, data);
      }
      return api.post('/customers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsModalOpen(false);
      toast.success(currentCustomer ? 'Customer updated!' : 'Customer added!');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer removed');
    }
  });

  const handleOpenModal = (customer?: any) => {
    if (customer) {
      setCurrentCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || ''
      });
    } else {
      setCurrentCustomer(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate(formData);
  };

  const handleExport = () => {
    if (!customers) return;
    const exportData = customers.map((c: any) => ({
      Name: c.name,
      Email: c.email,
      Phone: c.phone || 'N/A',
      'Total Spent': c.totalSpending,
      Orders: c._count.orders
    }));
    exportToCSV(exportData, 'customers_report');
    toast.success('Exporting customer data...');
  };

  const filteredCustomers = customers?.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topCustomers = [...(customers || [])]
    .sort((a, b) => b.totalSpending - a.totalSpending)
    .slice(0, 3);

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>Customers</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>View and manage your customer relationships.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
          style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
        >
          <UserPlus size={18} />
          Add Customer
        </motion.button>
      </div>

      {/* Top Customers Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {topCustomers.map((customer: any, index: number) => (
          <motion.div 
            key={`top-${customer.id}`}
            whileHover={{ y: -5 }}
            className="card"
            style={{ 
              background: index === 0 ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'white',
              color: index === 0 ? 'white' : 'inherit',
              border: '1px solid #f1f5f9',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {index === 0 && (
              <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }}>
                <Star size={120} fill="white" />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '16px', 
                backgroundColor: index === 0 ? '#3b82f6' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: index === 0 ? 'white' : '#64748b'
              }}>
                {customer.name.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontWeight: '700', fontSize: '1.125rem' }}>{customer.name}</h3>
                  {index === 0 && <Star size={14} fill="#f59e0b" color="#f59e0b" />}
                </div>
                <p style={{ fontSize: '0.875rem', color: index === 0 ? '#94a3b8' : '#64748b' }}>VIP Customer</p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: index === 0 ? 'rgba(255,255,255,0.05)' : '#f8fafc', padding: '0.75rem', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: index === 0 ? '#94a3b8' : '#64748b', marginBottom: '0.25rem' }}>TOTAL SPENT</p>
                <p style={{ fontSize: '1.125rem', fontWeight: '800' }}>${customer.totalSpending.toLocaleString()}</p>
              </div>
              <div style={{ backgroundColor: index === 0 ? 'rgba(255,255,255,0.05)' : '#f8fafc', padding: '0.75rem', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: index === 0 ? '#94a3b8' : '#64748b', marginBottom: '0.25rem' }}>ORDERS</p>
                <p style={{ fontSize: '1.125rem', fontWeight: '800' }}>{customer._count.orders}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 1rem 0.625rem 2.75rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                outline: 'none',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <button 
            onClick={handleExport}
            style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Export Data
            <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Contact Info</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Orders</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Revenue</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredCustomers?.map((customer: any) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={customer.id} 
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                  >
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#3b82f6' }}>
                          {customer.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: '600', color: '#0f172a' }}>{customer.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8125rem' }}>
                          <Mail size={14} />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8125rem' }}>
                            <Phone size={14} />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: '#0f172a' }}>
                        <ShoppingBag size={16} style={{ color: '#94a3b8' }} />
                        {customer._count.orders}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: '#0f172a' }}>
                        <CreditCard size={16} style={{ color: '#94a3b8' }} />
                        ${customer.totalSpending.toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleOpenModal(customer)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => {
                          if (window.confirm('Are you sure?')) deleteMutation.mutate(customer.id);
                        }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                placeholder="Ex: John Doe"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                placeholder="Ex: john@example.com"
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                placeholder="Ex: +1 234 567 890"
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', fontWeight: '700', gap: '0.5rem' }}
            disabled={upsertMutation.isLoading}
          >
            <Save size={18} />
            {upsertMutation.isLoading ? 'Processing...' : (currentCustomer ? 'Update Customer' : 'Add Customer')}
          </motion.button>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Customers;
