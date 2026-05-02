import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  CheckCircle2,
  Tag,
  DollarSign,
  Layers,
  Save
} from 'lucide-react';
import Modal from '../components/Modal';
import { toast } from 'react-hot-toast';

const Products: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: ''
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/products/categories');
      return response.data;
    }
  });

  const upsertMutation = useMutation({
    mutationFn: (data: any) => {
      if (currentProduct) {
        return api.put(`/products/${currentProduct.id}`, data);
      }
      return api.post('/products', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      toast.success(currentProduct ? 'Product updated!' : 'Product created!');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product removed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  });

  const handleOpenModal = (product?: any) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        categoryId: product.categoryId
      });
    } else {
      setCurrentProduct(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: categories?.[0]?.id || ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>Inventory</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Manage your product stock and categories.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
          style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
        >
          <Plus size={18} />
          Add New Product
        </motion.button>
      </div>

      {/* Filters & Search */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                outline: 'none',
                fontSize: '0.9375rem',
                transition: 'all 0.2s'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['All', ...(categories?.map((c: any) => c.name) || [])].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.625rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  backgroundColor: selectedCategory === cat ? '#0f172a' : 'white',
                  color: selectedCategory === cat ? 'white' : '#64748b',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? '#0f172a' : '#e2e8f0',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <AnimatePresence>
          {filteredProducts?.map((product: any) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5 }}
              className="card"
              style={{ padding: '1.5rem', border: '1px solid #f1f5f9' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  color: '#3b82f6', 
                  padding: '0.75rem', 
                  borderRadius: '12px',
                  border: '1px solid #f1f5f9'
                }}>
                  <Package size={24} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleOpenModal(product)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => {
                    if (window.confirm('Are you sure you want to delete this product?')) {
                      deleteMutation.mutate(product.id);
                    }
                  }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#3b82f6', backgroundColor: '#3b82f610', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                    {product.category.name}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>{product.name}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
                  {product.description || 'No description provided for this item.'}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>PRICE</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0f172a' }}>${product.price}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>STOCK</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                    {product.stock < 10 ? <AlertTriangle size={14} color="#f59e0b" /> : <CheckCircle2 size={14} color="#10b981" />}
                    <p style={{ fontSize: '1.125rem', fontWeight: '800', color: product.stock < 10 ? '#f59e0b' : '#0f172a' }}>
                      {product.stock}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Upsert Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
              Product Name
            </label>
            <div style={{ position: 'relative' }}>
              <Tag size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                placeholder="Ex: Wireless Mouse"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
              Category
            </label>
            <div style={{ position: 'relative' }}>
              <Layers size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <select 
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', appearance: 'none', backgroundColor: 'white' }}
              >
                <option value="" disabled>Select a category</option>
                {categories?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                Price ($)
              </label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="number" 
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                Stock Count
              </label>
              <div style={{ position: 'relative' }}>
                <Package size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="number" 
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
              Description
            </label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' }}
              placeholder="Brief product description..."
            />
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
            {upsertMutation.isLoading ? 'Processing...' : (currentProduct ? 'Update Product' : 'Create Product')}
          </motion.button>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Products;
