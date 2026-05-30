import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit2, Plus, Check, DollarSign, Trash2 } from 'lucide-react';
import { useBill, Item } from '../BillContext';

const ReviewItems: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, setItems, tax, setTax, tipPercentage, setTipPercentage, tipAmount, setTipAmount, subtotal, total } = useBill();
  
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showCustomTip, setShowCustomTip] = useState(false);

  // Load OCR results if they were passed via location state
  useEffect(() => {
    if (location.state?.parsed) {
      const { items: ocrItems, tax: ocrTax, tip: ocrTip } = location.state.parsed;
      setItems(ocrItems.map((item: any, idx: number) => ({ 
        id: item.id || `ocr-${idx}-${Date.now()}`,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        assignedTo: [], 
        comped: false 
      })));
      setTax(ocrTax || 0);
      // If the receipt already had a tip, pre-populate it and switch to custom mode
      if (ocrTip && ocrTip > 0) {
        setTipAmount(ocrTip);
        setShowCustomTip(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!showCustomTip) {
      setTipAmount(Number((subtotal * (tipPercentage / 100)).toFixed(2)));
    }
  }, [subtotal, tipPercentage, showCustomTip]);

  const updateItem = (updated: Item) => {
    setItems(items.map(item => item.id === updated.id ? updated : item));
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    setEditingItem(null);
  };

  const addItem = () => {
    const newItem: Item = {
      id: `manual-${Date.now()}`,
      name: '',
      price: 0,
      quantity: 1,
      assignedTo: [],
      comped: false
    };
    setItems([...items, newItem]);
    setEditingItem(newItem);
  };

  const canContinue = items.length > 0 && total > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-background p-6 pb-48"
    >
      <header className="flex items-center justify-between mb-2 safe-top">
        <button onClick={() => navigate('/capture')} className="p-2 -ml-2">
          <ArrowLeft size={24} className="text-text-primary" />
        </button>
        <h2 className="text-xl font-bold text-text-primary">Review Items</h2>
        <div className="w-10"></div>
      </header>
      <p className="text-text-secondary text-sm mb-6">Tap any item to correct it</p>

      <div className="space-y-3 mb-8">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setEditingItem(item)}
              className="card-gradient p-4 rounded-xl border border-border flex items-center justify-between active:scale-[0.98] transition-transform"
            >
              <div className="flex-1 flex items-center gap-3">
                {item.quantity > 1 && (
                  <span className="px-2 py-0.5 bg-accent/20 text-accent-soft text-[10px] font-bold rounded-full whitespace-nowrap">
                    ×{item.quantity}
                  </span>
                )}
                <div>
                  <h3 className={`font-medium ${item.comped ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                    {item.name || 'New Item'}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {item.assignedTo.length === 0 ? (
                      <span className="text-warning">Unassigned</span>
                    ) : (
                      <span>Assigned to {item.assignedTo.length} {item.assignedTo.length === 1 ? 'person' : 'people'}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${item.comped ? 'text-text-secondary' : 'text-accent'}`}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                {item.quantity > 1 && (
                  <p className="text-[10px] text-text-secondary/60">${item.price.toFixed(2)} ea</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <button
          onClick={addItem}
          className="w-full h-12 border border-dashed border-border text-text-secondary rounded-xl flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={16} /> Add Missing Item
        </button>
      </div>

      <div className="space-y-4">
        <div className="card-gradient border border-border rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between text-text-secondary text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center text-text-secondary text-sm">
            <span>Tax</span>
            <div className="flex items-center gap-2 bg-elevated px-3 py-1.5 rounded-lg border border-border">
              <span>$</span>
              <input
                type="number"
                value={tax || ''}
                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                className="w-16 bg-transparent outline-none text-text-primary font-medium text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Tip</span>
            <div className="flex gap-2">
              {[18, 20, 25].map((pct) => (
                <button
                  key={pct}
                  onClick={() => {
                    setTipPercentage(pct);
                    setShowCustomTip(false);
                  }}
                  className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all ${
                    !showCustomTip && tipPercentage === pct
                      ? 'bg-accent text-white shadow-md shadow-accent/20'
                      : 'bg-elevated text-text-secondary border border-border'
                  }`}
                >
                  {pct}%
                </button>
              ))}
              <button
                onClick={() => setShowCustomTip(true)}
                className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all ${
                  showCustomTip
                    ? 'bg-accent text-white shadow-md shadow-accent/20'
                    : 'bg-elevated text-text-secondary border border-border'
                }`}
              >
                Custom
              </button>
            </div>
            
            {showCustomTip && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center justify-between bg-elevated p-3 rounded-lg border border-accent/30"
              >
                <span className="text-text-secondary text-sm">Custom Tip Amount</span>
                <div className="flex items-center gap-2">
                  <span>$</span>
                  <input
                    autoFocus
                    type="number"
                    value={tipAmount || ''}
                    onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-transparent outline-none text-text-primary font-bold text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </motion.div>
            )}
            
            {!showCustomTip && (
              <p className="text-center text-xs text-text-secondary pt-1">
                = ${tipAmount.toFixed(2)} split proportional
              </p>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border mt-2">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-bold text-accent">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pt-10">
        <motion.button
          whileTap={canContinue ? { scale: 0.97 } : {}}
          disabled={!canContinue}
          onClick={() => navigate('/assign')}
          className={`w-full h-14 font-semibold rounded-xl text-lg shadow-lg flex items-center justify-center transition-all ${
            canContinue 
              ? 'bg-accent text-white shadow-accent/30 glow-accent' 
              : 'bg-elevated text-text-secondary border border-border cursor-not-allowed opacity-60'
          }`}
        >
          {items.length === 0 ? 'Add items to continue' : 'Assign Items'}
        </motion.button>
        <div className="safe-bottom"></div>
      </div>

      {/* Edit Item Sheet / Modal */}
      <AnimatePresence>
        {editingItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-elevated rounded-t-[24px] z-50 p-6 safe-bottom border-t border-border shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6" />
              
              <h3 className="text-xl font-bold mb-6 text-center">Edit Item</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Item Name</label>
                  <input
                    autoFocus
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full h-14 bg-surface rounded-xl px-4 border border-border text-lg text-text-primary focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="w-24 space-y-2">
                    <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Qty</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={editingItem.quantity || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full h-14 bg-surface rounded-xl px-4 border border-border text-lg text-text-primary focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-center"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Price (per unit)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                      <input
                        type="number"
                        step="0.01"
                        value={editingItem.price || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                        className="w-full h-14 bg-surface rounded-xl pl-10 pr-4 border border-border text-lg text-text-primary focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setEditingItem({ ...editingItem, comped: !editingItem.comped })}
                  className={`w-full h-14 rounded-xl flex items-center justify-center gap-3 transition-all border ${
                    editingItem.comped 
                      ? 'bg-success/10 border-success text-success font-bold' 
                      : 'bg-surface border-border text-text-secondary'
                  }`}
                >
                  {editingItem.comped ? <Check size={20} /> : <div className="w-5 h-5 rounded-full border border-border" />}
                  Mark as Comped / Free
                </button>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => deleteItem(editingItem.id)}
                    className="w-14 h-14 bg-error/10 text-error rounded-xl flex items-center justify-center border border-error/20 active:scale-95 transition-transform"
                  >
                    <Trash2 size={24} />
                  </button>
                  <button
                    onClick={() => updateItem(editingItem)}
                    className="flex-1 h-14 bg-accent text-white font-bold rounded-xl text-lg shadow-lg shadow-accent/20 active:scale-[0.98] transition-transform"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReviewItems;
