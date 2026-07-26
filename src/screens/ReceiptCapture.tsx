import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, RefreshCcw, Loader2, Sparkles } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { useBill } from '../BillContext';
import { parseReceipt } from '../utils/parseReceipt';
import { MOCK_PARSED } from '../utils/mockData';
import MockReceiptModal from '../components/MockReceiptModal';

const ReceiptCapture: React.FC = () => {
  const navigate = useNavigate();
  const { setItems, setTax } = useBill();
  const [image, setImage]           = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress]     = useState(0);
  const [showMock, setShowMock]     = useState(false);
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
      <MockReceiptModal
        open={showMock}
        onClose={() => setShowMock(false)}
        onUse={handleUseMock}
      />
    </motion.div>
  );
};

export default ReceiptCapture;
