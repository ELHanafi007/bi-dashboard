import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Download, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    createdAt: string;
    total: number;
    status: string;
    customer: { name: string; email: string; phone?: string };
    items: { id: string; quantity: number; price: number; product: { name: string } }[];
  } | null;
  businessInfo?: {
    name?: string;
    legalForm?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    taxId?: string;
    regNumber?: string;
    managerName?: string;
  };
}

const ReceiptGenerator: React.FC<ReceiptProps> = ({ isOpen, onClose, order, businessInfo }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { t, isRTL } = useLanguage();

  if (!isOpen || !order) return null;

  const subtotal = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxRate = 0.00;
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax;
  const biz = businessInfo || {};
  const invoiceNumber = `INV-${new Date(order.createdAt).getFullYear()}-${order.id.slice(0, 6).toUpperCase()}`;
  const orderDate = new Date(order.createdAt);
  const dueDate = new Date(orderDate);
  dueDate.setDate(dueDate.getDate() + 30);

  const receiptStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', 'Noto Sans Arabic', sans-serif; color: #1a1a2e; background: white; }
    .receipt-wrapper { max-width: 800px; margin: 0 auto; padding: 48px; position: relative; }
    .receipt-wrapper::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, #0f172a 0%, #3b82f6 25%, #8b5cf6 50%, #3b82f6 75%, #0f172a 100%); }
    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-family: 'Playfair Display', serif; font-size: 120px; font-weight: 900; color: rgba(59, 130, 246, 0.03); letter-spacing: 0.05em; pointer-events: none; white-space: nowrap; z-index: 0; }
    .content { position: relative; z-index: 1; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 32px; border-bottom: 2px solid #f1f5f9; }
    .brand { display: flex; align-items: center; gap: 16px; }
    .brand-icon { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.2); }
    .brand-icon span { color: white; font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 800; }
    .brand-name { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; line-height: 1.1; }
    .brand-tagline { font-size: 11px; font-weight: 500; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 4px; }
    .invoice-badge { text-align: right; }
    .invoice-label { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; line-height: 1; }
    .invoice-number { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: #3b82f6; margin-top: 6px; padding: 4px 12px; background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08)); border-radius: 6px; display: inline-block; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; margin-bottom: 40px; }
    .meta-block {}
    .meta-label { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px; }
    .meta-value { font-size: 14px; font-weight: 600; color: #0f172a; line-height: 1.6; }
    .meta-value-light { font-size: 13px; color: #64748b; font-weight: 400; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    .items-table thead th { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2em; padding: 14px 16px; border-bottom: 2px solid #0f172a; text-align: left; }
    .items-table thead th:last-child, .items-table thead th:nth-child(3), .items-table thead th:nth-child(2) { text-align: right; }
    .items-table tbody td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .items-table tbody td:first-child { font-weight: 600; color: #0f172a; }
    .items-table tbody td:nth-child(2) { text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #64748b; }
    .items-table tbody td:nth-child(3) { text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #64748b; }
    .items-table tbody td:last-child { text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #0f172a; font-size: 14px; }
    .items-table tbody tr:last-child td { border-bottom: 2px solid #0f172a; }
    .item-desc { font-size: 12px; color: #94a3b8; font-weight: 400; margin-top: 2px; }
    .item-number { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; background: #f8fafc; font-size: 11px; font-weight: 700; color: #64748b; margin-right: 12px; }
    .totals-section { display: flex; justify-content: flex-end; margin-bottom: 40px; }
    .totals-box { width: 320px; }
    .total-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; font-size: 14px; }
    .total-row-label { color: #64748b; font-weight: 500; }
    .total-row-value { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #0f172a; }
    .total-row-grand { padding: 16px 20px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px; margin-top: 8px; }
    .total-row-grand .total-row-label { color: #94a3b8; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; }
    .total-row-grand .total-row-value { color: white; font-size: 24px; font-weight: 800; }
    .divider-dashed { border: none; border-top: 1px dashed #e2e8f0; margin: 8px 0; }
    .bottom-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; padding-top: 32px; border-top: 2px solid #f1f5f9; }
    .terms-section {}
    .terms-title { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 12px; }
    .terms-text { font-size: 12px; color: #64748b; line-height: 1.8; }
    .signature-section { text-align: right; }
    .signature-line { width: 220px; margin-left: auto; margin-bottom: 8px; position: relative; }
    .signature-text { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #0f172a; opacity: 0.7; font-style: italic; transform: rotate(-3deg); display: inline-block; margin-bottom: 4px; }
    .signature-date { font-size: 11px; color: #94a3b8; font-weight: 500; margin-top: 4px; }
    .signature-divider { width: 220px; height: 1px; background: #0f172a; margin-left: auto; margin-bottom: 8px; }
    .signature-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em; }
    .stamp { width: 100px; height: 100px; border: 3px solid rgba(16, 185, 129, 0.3); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-left: auto; margin-bottom: 16px; transform: rotate(-12deg); position: relative; }
    .stamp::before { content: ''; position: absolute; inset: 4px; border: 1.5px solid rgba(16, 185, 129, 0.2); border-radius: 50%; }
    .stamp-text { font-size: 9px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 0.15em; }
    .stamp-check { font-size: 24px; color: #10b981; margin: 2px 0; }
    .footer { text-align: center; padding-top: 32px; border-top: 1px solid #f1f5f9; }
    .footer-thanks { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .footer-generated { font-size: 11px; color: #94a3b8; margin-bottom: 16px; }
    .footer-bar { width: 100%; height: 4px; border-radius: 2px; background: linear-gradient(90deg, #0f172a 0%, #3b82f6 25%, #8b5cf6 50%, #3b82f6 75%, #0f172a 100%); }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
    .status-delivered { background: #d1fae5; color: #059669; }
    .status-pending { background: #fef3c7; color: #d97706; }
    .status-shipped { background: #dbeafe; color: #2563eb; }
    .status-cancelled { background: #fee2e2; color: #ef4444; }
    @media print { body { padding: 0; } .receipt-wrapper { padding: 32px; } .no-print { display: none !important; } }
    [dir="rtl"] .items-table thead th { text-align: right; }
    [dir="rtl"] .items-table thead th:last-child, [dir="rtl"] .items-table thead th:nth-child(3), [dir="rtl"] .items-table thead th:nth-child(2) { text-align: left; }
    [dir="rtl"] .items-table tbody td:nth-child(2), [dir="rtl"] .items-table tbody td:nth-child(3), [dir="rtl"] .items-table tbody td:last-child { text-align: left; }
    [dir="rtl"] .invoice-badge { text-align: left; }
    [dir="rtl"] .signature-section { text-align: left; }
    [dir="rtl"] .signature-line, [dir="rtl"] .signature-divider, [dir="rtl"] .stamp { margin-left: 0; margin-right: auto; }
  `;

  const statusClass = order.status === 'DELIVERED' ? 'status-delivered' : order.status === 'SHIPPED' ? 'status-shipped' : order.status === 'CANCELLED' ? 'status-cancelled' : 'status-pending';

  const generatePrintHTML = () => {
    if (!receiptRef.current) return '';
    return `<!DOCTYPE html><html dir="${isRTL ? 'rtl' : 'ltr'}"><head><meta charset="UTF-8"><title>${invoiceNumber}</title><style>${receiptStyles}</style></head><body>${receiptRef.current.innerHTML}</body></html>`;
  };

  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=850,height=1100');
    if (!w) return;
    w.document.write(generatePrintHTML());
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  const handleDownload = () => {
    const blob = new Blob([generatePrintHTML()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const signerName = biz.managerName || biz.name || 'ZENITH BI';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--bg-main)', borderRadius: '20px', width: '100%', maxWidth: '860px', maxHeight: '92vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', zIndex: 201 }}
          >
            {/* Toolbar */}
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '20px 20px 0 0', position: 'sticky', top: 0, zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', fontFamily: "'JetBrains Mono', monospace" }}>{invoiceNumber}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleDownload}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '0.8125rem', fontWeight: '600', color: '#3b82f6', cursor: 'pointer' }}>
                  <Download size={15} /> Download
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handlePrint}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #0f172a, #1e293b)', fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-main)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.2)' }}>
                  <Printer size={15} /> Print
                </motion.button>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem' }}><X size={20} /></button>
              </div>
            </div>

            {/* Receipt Body */}
            <div ref={receiptRef}>
              <style>{receiptStyles}</style>
              <div className="receipt-wrapper" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="watermark">ZENITH</div>
                <div className="content">
                  {/* Header */}
                  <div className="header">
                    <div className="brand">
                      <div className="brand-icon"><span>Z</span></div>
                      <div>
                        <div className="brand-name">
                          {biz.name || 'ZENITH BI'} 
                          {biz.legalForm && <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '8px' }}>({biz.legalForm})</span>}
                        </div>
                        <div className="brand-tagline">{biz.website ? biz.website.replace('https://', '').replace('http://', '') : 'Business Intelligence Platform'}</div>
                      </div>
                    </div>
                    <div className="invoice-badge">
                      <div className="invoice-label">{t('receipt_invoice')}</div>
                      <div className="invoice-number">{invoiceNumber}</div>
                    </div>
                  </div>

                  {/* Meta Grid */}
                  <div className="meta-grid">
                    <div className="meta-block">
                      <div className="meta-label">Customer Details</div>
                      <div className="meta-value">{order.customer.name}</div>
                      <div className="meta-value-light">{order.customer.email}</div>
                      {order.customer.phone && <div className="meta-value-light">{order.customer.phone}</div>}
                    </div>
                    <div className="meta-block">
                      <div className="meta-label">Organization Info</div>
                      <div className="meta-value">{biz.name || 'ZENITH BI'}</div>
                      {biz.address && <div className="meta-value-light">{biz.address}</div>}
                      {biz.taxId && <div className="meta-value-light">Tax ID: {biz.taxId}</div>}
                      {biz.regNumber && <div className="meta-value-light">Reg N°: {biz.regNumber}</div>}
                      {biz.phone && <div className="meta-value-light">Tel: {biz.phone}</div>}
                    </div>
                    <div className="meta-block">
                      <div className="meta-label">Order Reference</div>
                      <div className="meta-value">Date: {orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div className="meta-value">Due: {dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div style={{ marginTop: '12px' }}>
                        <span className={`status-badge ${statusClass}`}>● {order.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th style={{ width: '50%' }}>{t('receipt_item')}</th>
                        <th>{t('receipt_qty')}</th>
                        <th>{t('receipt_unit_price')}</th>
                        <th>{t('receipt_total')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, i) => (
                        <tr key={item.id || i}>
                          <td>
                            <span className="item-number">{String(i + 1).padStart(2, '0')}</span>
                            {item.product.name}
                          </td>
                          <td>{item.quantity}</td>
                          <td>{item.price.toFixed(2)} MAD</td>
                          <td>{(item.quantity * item.price).toFixed(2)} MAD</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="totals-section">
                    <div className="totals-box">
                      <div className="total-row">
                        <span className="total-row-label">{t('receipt_subtotal')}</span>
                        <span className="total-row-value">{subtotal.toFixed(2)} MAD</span>
                      </div>
                      <div className="total-row">
                        <span className="total-row-label">{t('receipt_tax')}</span>
                        <span className="total-row-value">{tax.toFixed(2)} MAD</span>
                      </div>
                      <hr className="divider-dashed" />
                      <div className="total-row total-row-grand">
                        <span className="total-row-label">{t('receipt_grand_total')}</span>
                        <span className="total-row-value">{grandTotal.toFixed(2)} MAD</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Signature */}
                  <div className="bottom-section">
                    <div className="terms-section">
                      <div className="terms-title">Corporate Terms</div>
                      <div className="terms-text">
                        1. All payments should be made to <b>{biz.name || 'ZENITH BI'}</b>.<br />
                        2. 30-day payment term applies from the date of issuance.<br />
                        3. Goods remain the property of the vendor until fully paid.<br />
                        4. Please quote invoice <b>{invoiceNumber}</b> in all correspondence.<br />
                        {biz.taxId && <>5. Local Tax ID: {biz.taxId} applied to this transaction.</>}
                      </div>
                    </div>
                    <div className="signature-section">
                      <div className="stamp">
                        <span className="stamp-text">Certified</span>
                        <span className="stamp-check">✓</span>
                        <span className="stamp-text">Original</span>
                      </div>
                      <div className="signature-line">
                        <div className="signature-text">{biz.managerName || 'Authorized Signatory'}</div>
                      </div>
                      <div className="signature-divider"></div>
                      <div className="signature-label">
                        {biz.managerName ? `Manager: ${biz.managerName}` : 'Authorized Signature'}
                      </div>
                      <div className="signature-date">{orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="footer">
                    <div className="footer-thanks">Thank you for choosing {biz.name || 'our services'}</div>
                    <div className="footer-generated">
                      {biz.name} {biz.legalForm && `(${biz.legalForm})`} • {biz.address} • {biz.website}
                    </div>
                    <div className="footer-bar"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReceiptGenerator;

