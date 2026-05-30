import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, RefreshCcw, Loader2, Sparkles, X, ZoomIn } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { useBill } from '../BillContext';
import { parseReceipt } from '../utils/parseReceipt';

// Hard-coded parsed data from receipt_example.png so it works reliably on desktop
// (the OCR is skipped for the mock; we parse the known receipt image contents)
const MOCK_PARSED = {
  restaurant: '590 George St, New Brunswick',
  items: [
    { id: 'mock-1', name: 'Truffle Pizza',   price: 8.79,  quantity: 1 },
    { id: 'mock-2', name: 'Wagyu Steak',     price: 60.79, quantity: 1 },
    { id: 'mock-3', name: 'Aperol Spritz',   price: 5.45,  quantity: 1 },
    { id: 'mock-4', name: 'Shirley Temple',  price: 6.24,  quantity: 1 },
  ],
  subtotal: 81.27,
  tax: 5.69,
  tip: 15.00,
  total: 101.96,
};

const ReceiptCapture: React.FC = () => {
  const navigate = useNavigate();
  const { setItems, setTax } = useBill();
  const [image, setImage]           = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress]     = useState(0);
  const [showMock, setShowMock]     = useState(false);
  const [mockZoomed, setMockZoomed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!image) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const worker = await (window as any).Tesseract.createWorker({
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();

      const parsed = parseReceipt(text);

      setItems(parsed.items.map((item, idx) => ({
        ...item,
        id: `ocr-${idx}-${Date.now()}`,
        assignedTo: [],
        comped: false,
        quantity: item.quantity || 1,
      })));

      navigate('/review', {
        state: {
          parsed: {
            ...parsed,
            items: parsed.items.map((item, idx) => ({
              ...item,
              id: `ocr-${idx}-${Date.now()}`,
            })),
          },
        },
      });
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to read receipt. Please try again or enter items manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseMock = () => {
    setItems(MOCK_PARSED.items.map(item => ({
      ...item,
      assignedTo: [],
      comped: false,
    })));
    navigate('/review', { state: { parsed: MOCK_PARSED } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-background p-6"
    >
      <header className="flex items-center justify-between mb-8 safe-top">
        <button onClick={() => navigate('/setup')} className="p-2 -ml-2">
          <ArrowLeft size={24} className="text-text-primary" />
        </button>
        <h2 className="text-xl font-bold text-text-primary">Scan Receipt</h2>
        <div className="w-10" />
      </header>

      <div className="max-w-md mx-auto space-y-8">
        <div
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center transition-all cursor-pointer ${
            image ? 'border-accent' : 'border-border'
          } card-gradient relative overflow-hidden`}
        >
          {image ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <img src={image} alt="Receipt Preview" className="w-full h-full object-cover opacity-60" />
              {!isProcessing && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                  <RefreshCcw size={48} className="text-white mb-4" />
                  <p className="text-white font-semibold">Tap to Retake</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <Camera size={32} className="text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Photograph your receipt</h3>
              <p className="text-text-secondary text-sm">Make sure all items and prices are visible in good lighting</p>

              <button className="mt-8 bg-accent text-white h-12 px-8 rounded-lg font-semibold flex items-center justify-center gap-2">
                Open Camera
              </button>

              {/* Mock Receipt Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMock(true);
                }}
                className="mt-6 text-accent/80 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:text-accent transition-colors p-2"
              >
                <Sparkles size={12} />
                Try a mock receipt
              </button>
            </>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-sm">
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-4"
              >
                <Loader2 size={48} className="text-accent animate-spin" />
              </motion.div>
              <p className="text-xl font-bold mb-2">Processing receipt...</p>
              <div className="w-full h-2 bg-elevated rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-accent shadow-[0_0_10px_rgba(91,79,255,0.5)]"
                />
              </div>
              <p className="text-text-secondary text-sm">{progress}%</p>
              <p className="text-[10px] text-accent-soft uppercase font-bold tracking-widest mt-4">Running locally on device</p>
            </div>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleCapture}
          className="hidden"
        />

        {image && !isProcessing && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={processImage}
            className="w-full h-14 bg-accent text-white font-semibold rounded-lg text-lg shadow-lg shadow-accent/30"
          >
            Process Receipt
          </motion.button>
        )}
      </div>

      {/* ── Mock Receipt Modal ── */}
      <AnimatePresence>
        {showMock && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              key="mock-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowMock(false); setMockZoomed(false); }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />

            {/* Sheet */}
            <motion.div
              key="mock-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 250, mass: 0.8 }}
              className="relative w-full bg-[#111118] rounded-t-[36px] overflow-hidden flex flex-col shadow-2xl"
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
                    onClick={() => { setShowMock(false); setMockZoomed(false); }}
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
                    className={`w-full transition-all duration-300 cursor-zoom-in ${mockZoomed ? 'object-contain max-h-[60vh]' : 'object-cover max-h-[42vh]'}`}
                    onClick={() => setMockZoomed(z => !z)}
                  />
                  <button
                    onClick={() => setMockZoomed(z => !z)}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white/70 hover:text-white"
                  >
                    <ZoomIn size={15} />
                  </button>
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
                  onClick={handleUseMock}
                  className="w-full h-14 bg-accent text-white font-bold rounded-2xl text-base shadow-xl shadow-accent/20 flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} />
                  Use This Receipt
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReceiptCapture;
