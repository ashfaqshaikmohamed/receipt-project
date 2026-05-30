import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Receipt as ReceiptIcon, Calendar, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestore-errors';

interface ReceiptRecord {
  id: string;
  date: any;
  total: number;
  restaurant: string;
  people: { name: string; total: number }[];
  items: { name: string; price: number }[];
}

const History: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }

    if (user) {
      fetchReceipts();
    }
  }, [user, authLoading, navigate]);

  const fetchReceipts = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'users', user.uid, 'receipts'),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetched: ReceiptRecord[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as ReceiptRecord);
      });
      setReceipts(fetched);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/receipts`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen bg-background p-6">
        <header className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-text-secondary">
            <ArrowLeft size={24} />
          </button>
          <h1 className="flex-1 text-center text-[22px] font-bold text-text-primary Inter">Your Splits</h1>
          <div className="w-10" />
        </header>

        <div className="space-y-3">
          {[1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-[100px] bg-elevated rounded-2xl"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-background p-6 pb-24"
    >
      <header className="flex items-center mb-8 safe-top">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-text-secondary hover:text-text-primary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-[22px] font-bold text-text-primary Inter">Your Splits</h1>
        <div className="w-10" />
      </header>

      {receipts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-center">
          <div className="text-accent/30 mb-4">
            <ReceiptIcon size={80} strokeWidth={1.5} />
          </div>
          <h2 className="text-[18px] font-semibold text-text-primary Inter">No splits yet</h2>
          <p className="text-[14px] text-text-secondary mt-1 px-10">Saved splits will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {receipts.map((receipt) => {
            const isExpanded = expandedId === receipt.id;
            return (
              <div 
                key={receipt.id}
                className="card-gradient rounded-2xl border border-border overflow-hidden"
              >
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : receipt.id)}
                  className="p-4 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-text-primary font-bold Inter flex items-center gap-2">
                      {receipt.restaurant || 'Dinner'}
                    </h3>
                    <span className="text-accent font-bold font-mono text-lg">${receipt.total.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-[13px] text-text-secondary mb-4 Inter">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(receipt.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      {receipt.people.length} people
                    </div>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {receipt.people.map((person, idx) => (
                      <div 
                        key={idx}
                        className="flex-shrink-0 bg-elevated px-3 py-1.5 rounded-full text-[12px] font-medium text-text-secondary Inter flex items-center gap-2"
                      >
                        {person.name} <span className="font-bold text-accent-soft">${person.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-center">
                    {isExpanded ? <ChevronUp size={20} className="text-text-secondary/50" /> : <ChevronDown size={20} className="text-text-secondary/50" />}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 overflow-hidden border-t border-border/50"
                    >
                      <div className="pt-4 space-y-3">
                         {receipt.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[13px] text-text-secondary Inter">
                            <span className="truncate flex-1 pr-4">{item.name}</span>
                            <span className="font-mono">${item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default History;
