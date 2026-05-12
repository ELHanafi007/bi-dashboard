import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Plus, Search, Edit2, Trash2, 
  AlertTriangle, CheckCircle2, Save, Filter, ChevronRight
} from 'lucide-react';
import Modal from '../components/Modal';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const Products: React.FC = () => {
  const queryClient = useQueryClient();
  const { t, isRTL } = useLanguage();
  const isMobile = window.innerWidth < 1024;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', categoryId: '' });

  const { data: products, isLoading } = useQuery({ 
    queryKey: ['products'], 
    queryFn: async () => { const r = await api.get('/products'); return r.data; } 
  });
  const { data: categories } = useQuery({ 
    queryKey: ['categories'], 
    queryFn: async () => { const r = await api.get('/products/categories'); return r.data; } 
  });

  const upsertMutation = useMutation({
    mutationFn: (data: any) => currentProduct ? api.put(`/products/${currentProduct.id}`, data) : api.post('/products', data),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['products'] }); 
      setIsModalOpen(false); 
      toast.success(currentProduct ? t('product_updated') : t('product_created')); 
      resetForm(); 
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Something went wrong')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['products'] }); 
      toast.success(t('product_removed')); 
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed')
  });

  const handleOpenModal = (product?: any) => {
    if (product) { 
      setCurrentProduct(product); 
      setFormData({ name: product.name, description: product.description || '', price: product.price.toString(), stock: product.stock.toString(), categoryId: product.categoryId }); 
    } else { 
      setCurrentProduct(null); 
      resetForm(); 
    }
    setIsModalOpen(true);
  };

  const resetForm = () => setFormData({ 
    name: '', description: '', price: '', stock: '', 
    categoryId: categories?.[0]?.id || '' 
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    upsertMutation.mutate(formData); 
  };

  const filteredProducts = products?.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
        style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: '#6366f1', borderRadius: '50%' }} 
      />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1.5rem' : 0 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.04em' }}>{t('inventory_title')}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: isMobile ? '0.9rem' : '1.05rem' }}>{t('inventory_subtitle')}</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-zenith btn-zenith-primary" style={{ padding: '0.85rem 1.5rem', width: isMobile ? '100%' : 'auto' }}>
          <Plus size={20} /> {t('add_new_product')}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="zenith-card" style={{ marginBottom: '2.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '300px' }}>
            <Search size={18} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder={t('search_products')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="zenith-input" style={{ paddingLeft: isRTL ? '1.25rem' : '3.5rem', paddingRight: isRTL ? '3.5rem' : '1.25rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
            {[t('all'), ...(categories?.map((c: any) => c.name) || [])].map((cat, i) => (
              <button key={cat} onClick={() => setSelectedCategory(i === 0 ? 'All' : cat)}
                className={`btn-zenith ${ (i === 0 ? selectedCategory === 'All' : selectedCategory === cat) ? 'btn-zenith-primary' : 'btn-zenith-outline' }`}
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: isMobile ? '1.5rem' : '2rem' }}>
        <AnimatePresence>
          {filteredProducts?.map((product: any, idx: number) => (
            <motion.div layout key={product.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: idx * 0.05 }}
              className="zenith-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '80px', height: '80px', 
                  borderRadius: '18px', overflow: 'hidden',
                  border: '1px solid var(--glass-bg)',
                  background: 'var(--glass-bg)'
                }}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.05))', color: '#818cf8' }}>
                      <Package size={32} />
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleOpenModal(product)} className="btn-zenith btn-zenith-outline" style={{ padding: '0.6rem', borderRadius: '12px' }}><Edit2 size={16} /></button>
                  <button onClick={() => { if (window.confirm(t('delete_product_confirm'))) deleteMutation.mutate(product.id); }} className="btn-zenith btn-zenith-outline" style={{ padding: '0.6rem', borderRadius: '12px', color: '#ef4444' }}><Trash2 size={16} /></button>
                </div>
              </div>

              <div>
                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.65rem' }}>{product.category.name}</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.75rem', letterSpacing: '-0.02em' }}>{product.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.75rem', lineHeight: '1.6' }}>{product.description || t('no_description')}</p>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-bg)', padding: '1.25rem', borderRadius: '20px', border: '1px solid var(--glass-bg)' }}>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('price_label')}</p>
                  <p className="mono" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>{product.price} MAD</p>
                </div>
                <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('stock_label')}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: isRTL ? 'flex-start' : 'flex-end', marginTop: '2px' }}>
                    {product.stock < 10 ? <AlertTriangle size={16} color="#f59e0b" /> : <CheckCircle2 size={16} color="#10b981" />}
                    <p className="mono" style={{ fontSize: '1.5rem', fontWeight: '800', color: product.stock < 10 ? '#f59e0b' : 'white' }}>{product.stock}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentProduct ? t('edit_product') : t('add_new_product')}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.65rem', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)' }}>{t('product_name')}</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="zenith-input" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.65rem', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)' }}>{t('category')}</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className="zenith-input">
              <option value="" disabled>{t('select_category')}</option>
              {categories?.map((c: any) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.65rem', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)' }}>{t('price')} (MAD)</label>
              <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required className="zenith-input" placeholder="0.00" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.65rem', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)' }}>{t('stock_count')}</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required className="zenith-input" placeholder="0" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.65rem', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)' }}>{t('description')}</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="zenith-input" style={{ resize: 'none' }} placeholder={t('product_desc_placeholder')} />
          </div>
          <button type="submit" className="btn-zenith btn-zenith-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem', justifyContent: 'center' }} disabled={upsertMutation.isPending}>
            <Save size={20} /> {upsertMutation.isPending ? t('processing') : (currentProduct ? t('update_product') : t('create_product'))}
          </button>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Products;
