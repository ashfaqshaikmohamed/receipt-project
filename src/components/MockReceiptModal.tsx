import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X } from 'lucide-react';
import { MOCK_PARSED } from '../utils/mockData';

interface MockReceiptModalProps {
  open: boolean;
  onClose: () => void;
  onUse: () => void;
}

// Preview sheet for the hard-coded demo receipt. Shared by Home (so it's a
// quick, discoverable "try me" from the very first screen) and ReceiptCapture
// (so it's still available mid-flow for anyone who skipped past it on Home).
const MockReceiptModal: React.FC<MockReceiptModalProps> = ({ open, onClose, onUse }) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center md:items-center md:p-8">
          {/* Backdrop */}
          <motion.div
            key="mock-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            key="mock-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 250, mass: 0.8 }}
            className="relative w-full md:w-[440px] md:max-w-[440px] bg-[#111118] rounded-t-[36px] md:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            style={{ maxHeight: '92vh' }}
          >
            {/* Handle + close */}
            <div className="flex flex-col items-center pt-3 mb-2 px-6 flex-shrink-0">
              <div className="w-12 h-1 bg-white/10 rounded-full mb-3" />
              <div className="w-full flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-accent uppercase tracking-widest">Mock Receipt</p>
                  <p className="text-text-secondary text-[11px] mt-0.5">590 George St · New Brunswick</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Receipt image preview */}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-[#09090e] mb-5">
                <img
                  src="/receipt_example.png"
                  alt="Sample receipt"
                  className="w-full object-contain"
                  style={{ maxHeight: '420px' }}
                />

                <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#09090e] to-transparent pointer-events-none" />
              </div>

              {/* Parsed items preview */}
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">Detected Items</p>
              <div className="space-y-2 mb-5">
                {MOCK_PARSED.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-surface/50 rounded-xl px-4 py-3 border border-white/5">
                    <div className="flex items-center gap-2">
                      {item.quantity > 1 && (
                        <span className="px-1.5 py-0.5 bg-accent/20 text-accent text-[10px] font-bold rounded-full">×{item.quantity}</span>
                      )}
                      <span className="text-sm font-medium text-text-primary">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-accent">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-surface/30 rounded-xl px-4 py-4 border border-white/5 space-y-2 mb-6">
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Subtotal</span><span>${MOCK_PARSED.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Tax</span><span>${MOCK_PARSED.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Tip</span><span className="text-success">${MOCK_PARSED.tip.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-text-primary pt-2 border-t border-white/5">
                  <span>Total</span><span className="text-accent">${MOCK_PARSED.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pb-10 pt-2 flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onUse}
                className="w-full h-14 bg-accent text-white font-bold rounded-2xl text-base shadow-xl shadow-accent/20 flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                Try Mock Receipt
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MockReceiptModal;